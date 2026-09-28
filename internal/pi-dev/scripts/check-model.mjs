// Pre-flight liveness probe for one OpenRouter model. Spawns the real Pi CLI
// with a trivial, tool-free prompt in headless JSON mode, and exits 0 only if
// the final assistant message did NOT end in stopReason "error". Used by
// run-ay.cmd to pick the first live model from a candidate list before
// launching the real interactive TUI session -- Pi has no native concept of
// switching models mid-*interactive*-session on failure (a TUI session just
// shows the error inline and keeps running), so this check has to happen
// *before* the real session starts, not react to it after the fact.
import { spawn } from "node:child_process";

const [, , nodeExe, cliPath, model, configDir] = process.argv;
if (!nodeExe || !cliPath || !model || !configDir) {
	console.error("usage: check-model.mjs <nodeExe> <cliPath> <model> <configDir>");
	process.exit(2);
}

const child = spawn(
	nodeExe,
	[cliPath, "--model", model, "--tools", "read", "--no-extensions", "--offline", "--mode", "json", "-p", "Say OK."],
	{ cwd: configDir, env: process.env, stdio: ["ignore", "pipe", "ignore"] },
);

let stdout = "";
child.stdout.on("data", (chunk) => {
	stdout += chunk;
});

child.on("close", () => {
	const lines = stdout.trim().split("\n");
	let lastAgentEnd;
	for (const line of lines) {
		try {
			const event = JSON.parse(line);
			if (event.type === "agent_end") lastAgentEnd = event;
		} catch {
			// ignore non-JSON/partial lines
		}
	}
	if (!lastAgentEnd) {
		console.error(`[check-model] ${model}: no agent_end event observed`);
		process.exit(1);
	}
	const messages = lastAgentEnd.messages || [];
	const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
	if (!lastAssistant || lastAssistant.stopReason === "error") {
		console.error(`[check-model] ${model}: FAILED (${lastAssistant?.errorMessage ?? "no assistant message"})`);
		process.exit(1);
	}
	console.error(`[check-model] ${model}: OK`);
	process.exit(0);
});
