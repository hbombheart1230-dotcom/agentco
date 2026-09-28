/**
 * Loaded via `--extension <this file>`.
 *
 * Overrides the built-in `powershell` tool with one built from the same
 * official `createPowerShellToolDefinition` factory, adding a `spawnHook`
 * that strips INTERNAL_VLLM_API_KEY (and OpenRouter/Naver leftovers, for
 * safety if this ever runs alongside other playgrounds) from the env handed
 * to every PowerShell subprocess the agent spawns.
 *
 * Same mechanism validated in M1 (Smoke A/B, Anchor B) and the pi-tui-playground
 * credential scrub -- only the scrubbed key names differ. Pi source is not
 * modified; this is the official `pi.registerTool` extension point (the same
 * one Pi's bundled `sandbox` example uses to replace the `bash` tool).
 */

import { createPowerShellToolDefinition } from "../../../external/pi/packages/coding-agent/dist/index.js";

const SCRUBBED_KEYS = [
	"INTERNAL_VLLM_API_KEY",
	"OPENROUTER_API_KEY",
	"OPENROUTER_BASE_URL",
	"NAVER_CLIENT_ID",
	"NAVER_CLIENT_SECRET",
];

function scrubSpawnHook(ctx) {
	const env = { ...ctx.env };
	for (const key of SCRUBBED_KEYS) delete env[key];
	return { ...ctx, env };
}

export default function (pi) {
	const cwd = process.cwd();
	const scrubbedPowershell = createPowerShellToolDefinition(cwd, { spawnHook: scrubSpawnHook });
	pi.registerTool(scrubbedPowershell);
}
