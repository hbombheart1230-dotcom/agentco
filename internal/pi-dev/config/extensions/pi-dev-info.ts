/**
 * Pi Dev Extension PoC (pi-dev-info)
 *
 * Validates that Pi's native extension mechanism (command + custom tool) works
 * in this Windows / internal packaging environment. Mirrors the official
 * example patterns (examples/extensions/hello.ts, commands.ts) as closely as
 * possible -- no new API surface invented.
 *
 * Intentionally minimal and read-only: no network, no credential access, no
 * filesystem writes, no process spawn, no environment/identity dump.
 */

import { Type } from "@earendil-works/pi-ai";
import { defineTool, type ExtensionAPI } from "@earendil-works/pi-coding-agent";

function staticInfoText(): string {
	return [
		"Pi Dev Extension PoC",
		"Status: loaded",
		`Platform: ${process.platform}`,
		"Purpose: native extension validation",
	].join("\n");
}

const getPiDevEnvironmentTool = defineTool({
	name: "get_pi_dev_environment",
	label: "Pi Dev Environment",
	description: "Report minimal, non-sensitive Pi Dev extension PoC status (platform, extension name, status).",
	parameters: Type.Object({}),

	async execute(_toolCallId, _params, _signal, _onUpdate, _ctx) {
		const result = {
			platform: process.platform,
			extension: "pi-dev-info",
			status: "ok",
		};
		return {
			content: [{ type: "text", text: JSON.stringify(result) }],
			details: result,
		};
	},
});

export default function (pi: ExtensionAPI) {
	pi.registerTool(getPiDevEnvironmentTool);

	pi.registerCommand("internal-info", {
		description: "Show Pi Dev extension PoC status (static, non-sensitive)",
		handler: async (_args, ctx) => {
			ctx.ui.notify(staticInfoText(), "info");
		},
	});
}
