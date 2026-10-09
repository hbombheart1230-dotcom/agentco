/**
 * Agentco permission-gate
 *
 * Derived from Pi's official example `examples/extensions/permission-gate.ts` (MIT).
 * Only the pattern list differs: Windows/PowerShell, git history rewrites, remote-exec pipes,
 * and shell access to secret files. No UI (print/RPC/subagent) => blocked by default.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const SHELL_TOOLS = new Set(["bash", "powershell"]);

const dangerousPatterns: RegExp[] = [
	/\brm\s+(-[a-z]*r|--recursive)/i,
	/\bsudo\b/i,
	/\b(chmod|chown)\b.*777/i,
	/\bgit\s+(push\s+(.*\s)?(-f\b|--force)|reset\s+--hard|clean\s+-[a-z]*f|branch\s+-D\b|checkout\s+--\s)/i,
	/\bRemove-Item\b.*-Recurse/i,
	/\b(del|erase|rmdir|rd)\b.*\s\/[sq]\b/i,
	/\bformat\s+[a-z]:/i,
	/\b(diskpart|Set-ExecutionPolicy|Stop-Computer|Restart-Computer)\b|\bshutdown\b/i,
	/\breg(\.exe)?\s+(add|delete)\b/i,
	/(curl|wget|iwr|Invoke-WebRequest)\b[^|]*\|\s*(sh|bash|iex|pwsh|powershell)\b/i,
	/\b(Invoke-Expression|iex)\b/i,
	// shell access to credential files
	/(^|[\s"'\\/])(\.env(\.(?!example\b)[\w-]+)?|auth\.json|models-store\.json|mcp-auth\.json)\b(?!\.example)/i,
];

export default function (pi: ExtensionAPI) {
	pi.on("tool_call", async (event, ctx) => {
		if (!SHELL_TOOLS.has(event.toolName)) return undefined;

		const command = String((event.input as { command?: unknown }).command ?? "");
		if (!dangerousPatterns.some((p) => p.test(command))) return undefined;

		if (!ctx.hasUI) {
			return { block: true, reason: "Dangerous command blocked (no UI for confirmation)" };
		}

		const choice = await ctx.ui.select(`Dangerous command:\n\n  ${command}\n\nAllow?`, ["Yes", "No"]);
		if (choice !== "Yes") return { block: true, reason: "Blocked by user" };
		return undefined;
	});
}
