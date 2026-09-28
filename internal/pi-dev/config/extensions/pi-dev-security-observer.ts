/**
 * Pi Dev Security Observer (pi-dev-security-observer) -- Phase 4A PoC.
 *
 * Observability-only. This extension NEVER blocks, confirms, denies, mutates,
 * or classifies risk. It only listens to Pi's native `tool_call`/`tool_result`
 * extension events and turns them into a small, session-local, in-memory list
 * of normalized SecurityObservation records, viewable via `/security-observations`.
 *
 * No import from "@earendil-works/pi-ai" / "@earendil-works/pi-coding-agent":
 * those packages are not resolvable in the self-contained pi-dev-user bundle
 * (no node_modules beyond the vendored `jiti` loader itself -- see
 * pi-dev-info.ts for the same constraint). This file is therefore written as
 * plain, import-free JS/TS so the SAME source works unmodified as both the
 * pi-dev (validation authority) copy and the pi-dev-user (qualified runtime)
 * copy -- no divergence between the two. `node:path` is a Node builtin, not
 * an npm package, so it is safe to import directly in both environments.
 *
 * Known limitations (see docs/security/SECURITY_OBSERVABILITY_v0.1.md):
 * - No symlink/junction realpath enforcement (workspace-relation check is
 *   purely lexical via path.resolve/relative, not fs.realpath).
 * - No PowerShell semantic interpretation -- command is captured as an
 *   opaque, truncated string preview only.
 * - No command security guarantee of any kind -- this is observation, not policy.
 * - No persistent audit log -- session-local in-memory ring buffer only,
 *   lost on process exit.
 * - No extension sandbox, no non-disableable enforcement, no network
 *   containment, no credential containment -- all out of scope for Phase 4A
 *   (see docs/security/SECURITY_NATIVE_AUDIT_v0.1.md).
 */

import path from "node:path";

// ============================================================================
// Normalized schema (NOT frozen -- Phase 4A validates the shape, not just the mechanism)
// ============================================================================

/**
 * @typedef {"filesystem"|"shell"|"search"|"extension"|"other"} SecurityCategory
 */

/**
 * @typedef {Object} SecurityObservation
 * @property {"tool_call"|"tool_result"} event
 * @property {string} tool
 * @property {SecurityCategory} category
 * @property {string} [operation]
 * @property {"inside"|"outside"|"unknown"} [workspaceRelation]
 * @property {string} [targetPath] - resolved absolute path, filesystem tools only
 * @property {string} [command] - sanitized, length-capped preview only, never the raw full command
 * @property {string} [cwd]
 * @property {"ok"|"error"} [status]
 * @property {string} [callId] - correlates tool_call/tool_result via native toolCallId
 * @property {string} timestamp - ISO 8601
 */

const MAX_OBSERVATIONS = 50;
const MAX_COMMAND_PREVIEW = 200;

/** @type {SecurityObservation[]} */
const observations = [];

function pushObservation(observation) {
	observations.push(observation);
	if (observations.length > MAX_OBSERVATIONS) {
		observations.shift();
	}
}

// ============================================================================
// Tool classification (never throws -- unknown tools fall back to "other")
// ============================================================================

const FILESYSTEM_TOOLS = new Set(["read", "edit", "write", "ls"]);
const SEARCH_TOOLS = new Set(["find", "grep"]);
const SHELL_TOOLS = new Set(["bash", "powershell"]);
// Known extension-registered tools this Pi Dev environment ships (Phase 3 PoC).
// This is a display convenience only, not a security allowlist of any kind.
const KNOWN_EXTENSION_TOOLS = new Set(["get_pi_dev_environment"]);

function classifyTool(toolName) {
	if (FILESYSTEM_TOOLS.has(toolName)) return "filesystem";
	if (SEARCH_TOOLS.has(toolName)) return "search";
	if (SHELL_TOOLS.has(toolName)) return "shell";
	if (KNOWN_EXTENSION_TOOLS.has(toolName)) return "extension";
	return "other";
}

// ============================================================================
// Workspace boundary classification
// ============================================================================

/**
 * Windows-safe: uses path.resolve/relative/isAbsolute, never string prefix
 * matching. A relative path that starts with ".." after path.relative(), or
 * that is itself absolute (e.g. a different drive letter on Windows, where
 * path.relative() returns the target unchanged), is treated as outside.
 *
 * Not a security boundary -- purely lexical, no fs.realpath / symlink
 * resolution (documented limitation).
 */
function resolveWorkspaceRelation(rawPath, workspaceRoot) {
	if (typeof rawPath !== "string" || rawPath.length === 0) {
		return { relation: "unknown", resolvedPath: undefined };
	}
	try {
		const resolved = path.resolve(workspaceRoot, rawPath);
		const relative = path.relative(workspaceRoot, resolved);
		const inside = relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
		return { relation: inside ? "inside" : "outside", resolvedPath: resolved };
	} catch {
		return { relation: "unknown", resolvedPath: undefined };
	}
}

function sanitizeCommandPreview(command) {
	if (typeof command !== "string") return undefined;
	const collapsed = command.replace(/\s+/g, " ").trim();
	if (collapsed.length <= MAX_COMMAND_PREVIEW) return collapsed;
	return `${collapsed.slice(0, MAX_COMMAND_PREVIEW)}...(truncated)`;
}

// ============================================================================
// tool_call -> SecurityObservation (extraction uses the actual native input
// field names confirmed from Pi source -- read/edit/write: `path`;
// find/grep/ls: optional `path`; bash/powershell: `command`, no `cwd` field
// in input, cwd comes from the extension context instead)
// ============================================================================

function normalizeToolCall(event, ctx) {
	const toolName = event.toolName;
	const category = classifyTool(toolName);
	const workspaceRoot = ctx.cwd;
	const input = event.input || {};

	/** @type {SecurityObservation} */
	const base = {
		event: "tool_call",
		tool: toolName,
		category,
		callId: event.toolCallId,
		timestamp: new Date().toISOString(),
	};

	if (category === "filesystem" || category === "search") {
		// read/edit/write always have `path`; ls/find/grep have optional `path`
		// (defaulting to cwd itself when absent, which is unambiguously inside).
		const rawPath = typeof input.path === "string" ? input.path : workspaceRoot;
		const { relation, resolvedPath } = resolveWorkspaceRelation(rawPath, workspaceRoot);
		base.operation = toolName;
		base.workspaceRelation = relation;
		base.targetPath = resolvedPath;
		base.cwd = workspaceRoot;
		return base;
	}

	if (category === "shell") {
		base.operation = toolName;
		base.command = sanitizeCommandPreview(input.command);
		base.cwd = workspaceRoot;
		base.workspaceRelation = "unknown";
		return base;
	}

	// extension / other: no assumptions about input shape.
	base.workspaceRelation = "unknown";
	return base;
}

// ============================================================================
// Extension entry point
// ============================================================================

export default function (pi) {
	pi.on("tool_call", (event, ctx) => {
		try {
			pushObservation(normalizeToolCall(event, ctx));
		} catch {
			// Observation must never break tool execution. Swallow and skip.
		}
		// No return value: never block, never mutate `event.input`.
	});

	pi.on("tool_result", (event) => {
		try {
			pushObservation({
				event: "tool_result",
				tool: event.toolName,
				category: classifyTool(event.toolName),
				status: event.isError ? "error" : "ok",
				callId: event.toolCallId,
				timestamp: new Date().toISOString(),
			});
		} catch {
			// Same: never break the result pipeline.
		}
		// No return value: never rewrite content/details/isError.
	});

	pi.registerCommand("security-observations", {
		description: "Show recent normalized security observations from this session (observability only, no enforcement)",
		handler: async (_args, ctx) => {
			if (observations.length === 0) {
				ctx.ui.notify("No security observations recorded yet in this session.", "info");
				return;
			}
			const lines = observations.map((o) => {
				const parts = [`[${o.event}]`, o.tool, `(${o.category})`];
				if (o.workspaceRelation) parts.push(o.workspaceRelation);
				if (o.targetPath) parts.push(o.targetPath);
				if (o.command) parts.push(`cmd="${o.command}"`);
				if (o.status) parts.push(`status=${o.status}`);
				return parts.join(" ");
			});
			ctx.ui.notify(
				[`Security observations (last ${observations.length}, max ${MAX_OBSERVATIONS}, session-local only):`, ...lines].join("\n"),
				"info",
			);
		},
	});
}
