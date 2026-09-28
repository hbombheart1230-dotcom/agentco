/**
 * M1 Phase 2 — Pi + OpenRouter + GLM 5.3 Flash runtime smoke (Smoke A + Smoke B).
 *
 * Does NOT modify Pi source. Uses only the public SDK entry
 * (`@earendil-works/pi-coding-agent`'s built dist/index.js) exactly as
 * documented in docs/sdk.md. No source modification, no global-config writes:
 *   - agentDir points at an experiment-local folder (never touches ~/.pi/agent)
 *   - sessionManager is in-memory (no session JSONL persisted anywhere)
 *   - the GLM model is constructed in-memory (no models.json needed)
 *   - auth resolves via OPENROUTER_API_KEY in process.env only (no auth.json)
 *
 * Smoke A: zero tools (noTools: "all") — model/provider/auth path only.
 * Smoke B: only the "read" tool — structured tool-calling path only.
 * No bash/powershell/edit/write tool is ever registered in this script.
 *
 * Turn-count guard: aborts the run if more turns occur than expected
 * (Smoke A: 1, Smoke B: 2), so a misbehaving loop can't run away.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const PI_SDK_ENTRY = join(ROOT, "external", "pi", "packages", "coding-agent", "dist", "index.js");
const AGENT_DIR = join(__dirname, ".agent-dir"); // experiment-local, never ~/.pi/agent
const REPORT_PATH = join(__dirname, "smoke_report.json");

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

// Only this one key is copied into process.env. Nothing else from .env is touched,
// and no shell/bash/powershell tool is ever registered, so there is no subprocess
// for any credential to leak into.
process.env.OPENROUTER_API_KEY = loadOpenRouterKeyOnly();

mkdirSync(AGENT_DIR, { recursive: true });

const { createAgentSession, SessionManager } = await import(pathToFileURL(PI_SDK_ENTRY).href);

const GLM_MODEL = {
	id: "z-ai/glm-5.3-flash",
	name: "z-ai/glm-5.3-flash",
	api: "openai-completions",
	provider: "openrouter",
	baseUrl: "https://openrouter.ai/api/v1",
	reasoning: false,
	input: ["text"],
	cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
	contextWindow: 128000,
	maxTokens: 16384,
};

function summarizeContent(content) {
	if (!Array.isArray(content)) return String(content ?? "");
	return content
		.map((c) => {
			if (c.type === "text") return c.text;
			if (c.type === "toolCall") return `[toolCall ${c.name} args=${JSON.stringify(c.arguments)}]`;
			return `[${c.type}]`;
		})
		.join(" ")
		.slice(0, 500);
}

async function runSmoke({ label, task, cwd, tools, noTools, maxTurns }) {
	const trajectory = [];
	let turnCount = 0;
	let aborted = false;

	const { session } = await createAgentSession({
		cwd,
		agentDir: AGENT_DIR,
		model: GLM_MODEL,
		tools,
		noTools,
		sessionManager: SessionManager.inMemory(),
	});

	const unsubscribe = session.subscribe((event) => {
		switch (event.type) {
			case "turn_start":
				turnCount += 1;
				if (turnCount > maxTurns) {
					aborted = true;
					session.agent.abort();
				}
				break;
			case "message_end":
				trajectory.push({ role: event.message.role, summary: summarizeContent(event.message.content) });
				break;
			case "tool_execution_start":
				trajectory.push({ toolExecutionStart: event.toolName, args: event.args });
				break;
			case "tool_execution_end":
				trajectory.push({
					toolExecutionEnd: event.toolName,
					isError: event.isError,
					summary: summarizeContent(event.result?.content),
				});
				break;
		}
	});

	const startedAt = Date.now();
	let error;
	try {
		await session.prompt(task);
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
	const stopReason = lastAssistant?.stopReason;
	const usage = lastAssistant?.usage;

	return {
		label,
		error,
		aborted,
		turnCount,
		elapsedMs,
		stopReason,
		finalText,
		usage,
		trajectory,
	};
}

const results = {};

// --- Smoke A: model-only, zero tools ---
results.smokeA = await runSmoke({
	label: "Smoke A - model only",
	task: "Reply with exactly:\nPI_GLM_SMOKE_OK",
	cwd: __dirname,
	noTools: "all",
	maxTurns: 1,
});

writeFileSync(REPORT_PATH, JSON.stringify(results, null, 2), "utf-8");

const smokeAOk =
	!results.smokeA.error &&
	!results.smokeA.aborted &&
	typeof results.smokeA.finalText === "string" &&
	results.smokeA.finalText.includes("PI_GLM_SMOKE_OK");

console.log("=== Smoke A result ===");
console.log(JSON.stringify({ ...results.smokeA, trajectory: undefined }, null, 2));

if (!smokeAOk) {
	console.log("=== Smoke A FAILED — stopping before Smoke B ===");
	process.exit(1);
}

// --- Smoke B: structured read tool only ---
results.smokeB = await runSmoke({
	label: "Smoke B - structured read tool",
	task: "Read marker.txt using the provided file-reading tool. Then reply with the exact contents of the file. Do not use a shell command.",
	cwd: __dirname,
	tools: ["read"],
	maxTurns: 2,
});

writeFileSync(REPORT_PATH, JSON.stringify(results, null, 2), "utf-8");

console.log("=== Smoke B result ===");
console.log(JSON.stringify(results.smokeB, null, 2));
