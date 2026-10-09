/**
 * Agentco protected-paths
 *
 * Derived from Pi's official example `examples/extensions/protected-paths.ts` (MIT).
 * Differences: (1) also blocks `read` of credential files so secrets never enter model context,
 * (2) Agentco-specific secret files (pi-dev auth/token stores), (3) path normalisation for Windows.
 * `.env.example` stays readable/writable.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

// Never readable or writable by the model.
const SECRET_FILE =
	/(^|\/)(\.env(\.(?!example$)[\w.-]+)?|auth\.json|models-store\.json|mcp-auth\.json|trust\.json|[^/]*\.(pem|key|pfx|p12)|[^/]*(credential|secret)[^/]*)$/i;
// Not writable (reading is fine).
const WRITE_PROTECTED_DIR = /(^|\/)(\.git|node_modules)(\/|$)/i;

const norm = (p: string) => p.replace(/\\/g, "/").replace(/^@/, "");

export default function (pi: ExtensionAPI) {
	pi.on("tool_call", async (event, ctx) => {
		const tool = event.toolName;
		if (tool !== "read" && tool !== "write" && tool !== "edit") return undefined;

		const raw = (event.input as { path?: unknown }).path;
		if (typeof raw !== "string") return undefined;
		const path = norm(raw);

		const secret = SECRET_FILE.test(path);
		const writeProtected = tool !== "read" && WRITE_PROTECTED_DIR.test(path);
		if (!secret && !writeProtected) return undefined;

		if (ctx.hasUI) ctx.ui.notify(`Blocked ${tool} on protected path: ${raw}`, "warning");
		return { block: true, reason: `Path "${raw}" is protected` };
	});
}
