/**
 * M1 Anchor Task B — Pi structured-tool coding-agent run.
 *
 * Mirrors mini-SWE M0 Run 1/Run 2's Anchor Task B as closely as the two
 * harnesses' designs allow. Does NOT modify Pi source. Uses only the public
 * SDK entry (`@earendil-works/pi-coding-agent`'s built dist/index.js).
 *
 * Tools: read, edit, powershell only (no bash, no write). The "powershell"
 * tool is registered via the official `customTools` + `spawnHook` mechanism
 * (core/tools/powershell.ts's `PowerShellSpawnHook`) so it overrides the
 * default powershell tool definition with credential scrubbing applied,
 * per docs/windows.md and the PowerShellToolOptions type. Nothing in
 * Pi's own source is edited.
 *
 * No global-config writes: agentDir is experiment-local (never ~/.pi/agent),
 * sessionManager is in-memory (no session JSONL persisted).
 *
 * Turn guard: aborts if more than MAX_TURNS model turns occur (mirrors
 * mini-SWE's step_limit=15 for comparability), so a runaway loop can't
 * spend unbounded API calls.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const PI_SDK_ENTRY = join(ROOT, "external", "pi", "packages", "coding-agent", "dist", "index.js");
const AGENT_DIR = join(__dirname, ".agent-dir");
const FIXTURE_DIR = join(ROOT, "toy-tasks", "v0", "task_B_fix_failing_test");
const REPORT_PATH = join(__dirname, "anchor_b_run1.json");

const MAX_TURNS = 15; // matches mini-SWE M0's step_limit for comparability

const SCRUBBED_KEYS = ["OPENROUTER_API_KEY", "OPENROUTER_BASE_URL", "NAVER_CLIENT_ID", "NAVER_CLIENT_SECRET"];

function loadOpenRouterKeyOnly() {
	const envText = readFileSync(join(ROOT, ".env"), "utf-8");
	for (const line of envText.split(/\r?\n/)) {
		const m = line.match(/^OPENROUTER_API_KEY\s*=\s*(.*)$/);
		if (m) {
			let val = m[1].trim();
			if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
				val = val.slice(1, -1);
			}
			if (!val) throw new Error("OPENROUTER_API_KEY present but empty in .env");
			return val;
		}
	}
	throw new Error("OPENROUTER_API_KEY not found in .env");
}

process.env.OPENROUTER_API_KEY = loadOpenRouterKeyOnly();
mkdirSync(AGENT_DIR, { recursive: true });

const { createAgentSession, SessionManager, createPowerShellToolDefinition } = await import(
	pathToFileURL(PI_SDK_ENTRY).href
);

// --- Pre-flight: verify the scrub hook removes the target keys, without running it for real yet ---
function scrubSpawnHook(ctx) {
	const env = { ...ctx.env };
	for (const key of SCRUBBED_KEYS) delete env[key];
	return { ...ctx, env };
}
{
	const sampleEnv = Object.fromEntries(SCRUBBED_KEYS.map((k) => [k, "placeholder"]));
	sampleEnv.UNRELATED_VAR = "keep-me";
	const scrubbed = scrubSpawnHook({ command: "echo test", cwd: FIXTURE_DIR, env: sampleEnv }).env;
	const stillPresent = SCRUBBED_KEYS.filter((k) => k in scrubbed);
	const keptUnrelated = "UNRELATED_VAR" in scrubbed;
	console.log("=== Pre-flight spawnHook check ===");
	console.log("Keys removed correctly:", stillPresent.length === 0);
	console.log("Unrelated var preserved:", keptUnrelated);
	if (stillPresent.length > 0) {
		throw new Error(`spawnHook failed to remove: ${stillPresent.join(", ")}`);
	}
}

const GLM_MODEL = {
	id: "z-ai/glm-5.3-flash",
	name: "z-ai/glm-5.3-flash",
	api: "openai-completions",
	provider: "openrouter",
	baseUrl: "https://openrouter.ai/api/v1",
	reasoning: false,
	input: ["text"],
	cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, // placeholder — COST UNKNOWN, see report
	contextWindow: 128000,
	maxTokens: 16384,
};

const TASK =
	"Inspect the repository, identify why the tests fail, fix the bug, run the relevant tests, and report the result. Avoid unrelated changes.";

function summarizeContent(content) {
	if (!Array.isArray(content)) return String(content ?? "");
	return content
		.map((c) => {
			if (c.type === "text") return c.text;
			if (c.type === "thinking") return `[thinking] ${c.thinking ?? ""}`;
			if (c.type === "toolCall") return `[toolCall ${c.name} args=${JSON.stringify(c.arguments)}]`;
			return `[${c.type}]`;
		})
		.join(" ");
}

const trajectory = [];
let turnCount = 0;
let aborted = false;
let toolExecCount = 0;

const { session } = await createAgentSession({
	cwd: FIXTURE_DIR,
	agentDir: AGENT_DIR,
	model: GLM_MODEL,
	tools: ["read", "edit", "powershell"],
	customTools: [createPowerShellToolDefinition(FIXTURE_DIR, { spawnHook: scrubSpawnHook })],
	sessionManager: SessionManager.inMemory(),
});

const unsubscribe = session.subscribe((event) => {
	switch (event.type) {
		case "turn_start":
			turnCount += 1;
			trajectory.push({ turn: turnCount, event: "turn_start" });
			if (turnCount > MAX_TURNS) {
				aborted = true;
				session.agent.abort();
			}
			break;
		case "message_end":
			trajectory.push({
				turn: turnCount,
				role: event.message.role,
				stopReason: event.message.stopReason,
				summary: summarizeContent(event.message.content),
			});
			break;
		case "tool_execution_start":
			toolExecCount += 1;
			trajectory.push({ turn: turnCount, toolExecutionStart: event.toolName, args: event.args });
			break;
		case "tool_execution_end":
			trajectory.push({
				turn: turnCount,
				toolExecutionEnd: event.toolName,
				isError: event.isError,
				summary: summarizeContent(event.result?.content),
				details: event.result?.details,
			});
			break;
	}
});

const startedAt = Date.now();
let error;
try {
	await session.prompt(TASK);
} catch (e) {
	error = e instanceof Error ? e.message : String(e);
}
const elapsedMs = Date.now() - startedAt;
unsubscribe();

const messages = session.agent.state.messages;
const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
const finalText = lastAssistant
	? (lastAssistant.content ?? []).filter((c) => c.type === "text").map((c) => c.text).join("")
	: undefined;

// Aggregate usage across all assistant messages (Pi reports per-turn usage, not cumulative).
let usageTotals = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, reasoning: 0, totalTokens: 0 };
for (const m of messages) {
	if (m.role === "assistant" && m.usage) {
		for (const k of Object.keys(usageTotals)) usageTotals[k] += m.usage[k] ?? 0;
	}
}

const toolCallCounts = {};
for (const m of messages) {
	if (m.role === "assistant") {
		for (const c of m.content ?? []) {
			if (c.type === "toolCall") toolCallCounts[c.name] = (toolCallCounts[c.name] ?? 0) + 1;
		}
	}
}

const result = {
	label: "M1 Anchor Task B",
	model: GLM_MODEL.id,
	error,
	aborted,
	turnCount,
	toolExecCount,
	toolCallCounts,
	elapsedMs,
	finalStopReason: lastAssistant?.stopReason,
	finalText,
	usageTotals,
	trajectory,
};

writeFileSync(REPORT_PATH, JSON.stringify(result, null, 2), "utf-8");
console.log("=== Anchor B summary ===");
console.log(
	JSON.stringify(
		{ ...result, trajectory: `(${trajectory.length} events, see ${REPORT_PATH})` },
		null,
		2,
	),
);
