/**
 * Agentco git-checkpoint
 *
 * Derived from Pi's official example `examples/extensions/git-checkpoint.ts` (MIT), fixed for Pi 1.0.2:
 * the upstream example (a) clears its checkpoints on `agent_settled`, so /fork after a run never finds one,
 * (b) records nothing for the first turn of a run (leaf entry unknown at `turn_start`), and
 * (c) keeps checkpoints only in memory and as unreferenced `git stash create` objects.
 *
 * Opt-in development sessions only: one snapshot per user prompt (taken at `agent_start`), keyed by
 * the user-message entry id and stored as a custom session entry, so it survives /resume and /fork.
 * The snapshot is `git stash create` (tracked-file working-tree state) or HEAD on a clean tree, pinned under
 * refs/agentco-checkpoints/ so git gc cannot drop it. Untracked files are not captured.
 * Restore (only when forking *before* a prompt, with UI): tracked files are reset to the snapshot.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const ENTRY_TYPE = "agentco-checkpoint";
type Checkpoint = { entryId: string; ref: string };

export default function (pi: ExtensionAPI) {
	let pending: string | undefined;
	pi.registerFlag("agentco-checkpoints", {
		description: "Enable automatic Git checkpoints for an explicitly requested development session",
		type: "boolean",
		default: false,
	});

	const git = async (...args: string[]) => {
		try {
			const r = await pi.exec("git", args);
			return { ok: (r.code ?? 0) === 0, out: r.stdout.trim() };
		} catch {
			return { ok: false, out: "" };
		}
	};

	pi.on("agent_start", async () => {
		pending = undefined;
		if (pi.getFlag("agentco-checkpoints") !== true) return;
		if (!(await git("rev-parse", "--is-inside-work-tree")).ok) return;
		const stash = await git("stash", "create");
		const snap = stash.ok && stash.out ? stash.out : (await git("rev-parse", "HEAD")).out;
		if (snap) pending = snap;
	});

	pi.on("agent_end", async (_event, ctx) => {
		const ref = pending;
		pending = undefined;
		if (!ref) return;
		const branch = ctx.sessionManager.getBranch();
		for (let i = branch.length - 1; i >= 0; i--) {
			const e = branch[i];
			if (e.type === "message" && (e.message as { role?: string }).role === "user") {
				await git("update-ref", `refs/agentco-checkpoints/${e.id}`, ref);
				pi.appendEntry<Checkpoint>(ENTRY_TYPE, { entryId: e.id, ref });
				return;
			}
		}
	});

	pi.on("session_before_fork", async (event, ctx) => {
		if (event.position !== "before" || !ctx.hasUI) return;
		const cp = ctx.sessionManager
			.getEntries()
			.find((e) => e.type === "custom" && e.customType === ENTRY_TYPE && (e.data as Checkpoint | undefined)?.entryId === event.entryId);
		const ref = (cp?.data as Checkpoint | undefined)?.ref;
		if (!ref) return;

		const choice = await ctx.ui.select("Restore tracked files to the state before this prompt?", [
			"Yes, restore code to that point",
			"No, keep current code",
		]);
		if (!choice?.startsWith("Yes")) return;
		const r = await git("restore", `--source=${ref}`, "--worktree", "--", ".");
		ctx.ui.notify(r.ok ? "Code restored to checkpoint" : "Checkpoint restore failed", r.ok ? "info" : "error");
	});
}
