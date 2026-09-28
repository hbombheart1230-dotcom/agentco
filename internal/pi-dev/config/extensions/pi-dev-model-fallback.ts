/**
 * Pi Dev Model Fallback (pi-dev-model-fallback)
 *
 * Mid-session cross-model fallback for OpenRouter free-tier overload/outage,
 * built entirely on native Pi mechanisms (no Pi source modification):
 *
 *   - `agent_end` fires exactly once per turn, and only AFTER Pi's own
 *     native same-model retry (packages/ai/src/utils/retry.ts, driven from
 *     core/agent-session.ts:_handlePostAgentRun) has already exhausted its
 *     attempts -- confirmed from source: the retry loop runs entirely via
 *     `this.agent.continue()` calls BEFORE `agent_end` is emitted, so by
 *     the time this handler sees a `stopReason: "error"`, native retry has
 *     already given up on the current model.
 *   - `ctx.modelRegistry.find(provider, id)` resolves a candidate model,
 *     `pi.setModel(model)` switches the live session to it, and
 *     `pi.sendUserMessage(text)` resubmits the same request that just
 *     failed.
 *
 * Scope, deliberately narrow:
 *   - Only takes over once the failure's `errorMessage` matches the exact
 *     same retryable-error shape Pi's own native retry uses (overloaded,
 *     rate-limit, 5xx, network errors, ...) -- i.e. exactly where native
 *     retry already gave up, never on unrelated tool/logic errors that
 *     switching models wouldn't fix anyway.
 *   - Only starts a fallback chain if the CURRENT model is already one of
 *     CANDIDATES below (i.e. the session is already running one of
 *     run-free.cmd's free-tier picks). Never silently swaps a user's
 *     internal-vllm or other explicitly-chosen model to a free OpenRouter
 *     model out from under them.
 *   - Bounded: walks CANDIDATES first, then (per explicit request) falls
 *     back further to a RANDOM untried `:free` OpenRouter model from Pi's
 *     built-in catalog (`ctx.modelRegistry.getAll()`) if all CANDIDATES are
 *     also down. A hard cap (MAX_CHAIN_LENGTH) guarantees this eventually
 *     gives up and surfaces the final error instead of looping forever.
 *
 * No import from "@earendil-works/pi-ai" needed (no tool schema here);
 * only the ExtensionAPI type from "@earendil-works/pi-coding-agent".
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const CANDIDATES: Array<{ provider: string; id: string }> = [
	{ provider: "openrouter", id: "nvidia/nemotron-3-super-120b-a12b:free" },
	{ provider: "openrouter", id: "nvidia/nemotron-3.5-lightning:free" },
	{ provider: "openrouter", id: "nvidia/nemotron-3-ultra-550b-a55b:free" },
	{ provider: "openrouter", id: "thinkingmachines/inkling:free" },
];

const MAX_CHAIN_LENGTH = 8;

// Mirrors packages/ai/src/utils/retry.ts's RETRYABLE_PROVIDER_ERROR_PATTERN
// exactly, so this extension only takes over precisely where Pi's own
// native same-model retry already gave up.
const RETRYABLE_ERROR_PATTERN =
	/overloaded|rate.?limit|too many requests|429|500|502|503|504|524|service.?unavailable|server.?error|internal.?error|provider.?returned.?error|exceeded request buffer limit while retrying upstream|network.?error|connection.?error|connection.?refused|connection.?lost|other side closed|fetch failed|getaddrinfo/i;

function modelKey(m: { provider: string; id: string }): string {
	return `${m.provider}/${m.id}`;
}

export default function (pi: ExtensionAPI) {
	// provider/id keys already attempted within the current failure chain.
	// Cleared whenever a turn is not a retryable-shaped failure (success or
	// unrelated error) so the next independent failure starts fresh.
	let triedThisChain = new Set<string>();

	pi.on("agent_end", async (event, ctx) => {
		const messages = event.messages ?? [];
		const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");

		if (!lastAssistant || lastAssistant.stopReason !== "error") {
			triedThisChain.clear();
			return;
		}

		const errorMessage = "errorMessage" in lastAssistant ? String((lastAssistant as { errorMessage?: unknown }).errorMessage ?? "") : "";
		if (!RETRYABLE_ERROR_PATTERN.test(errorMessage)) {
			// Not an overload/outage-shaped failure -- switching models wouldn't
			// help, and native retry wouldn't have retried this either. Leave it.
			return;
		}

		const currentModel = ctx.model ? { provider: String(ctx.model.provider), id: ctx.model.id } : undefined;
		if (!currentModel) return;
		const currentKey = modelKey(currentModel);

		const isCandidate = CANDIDATES.some((c) => modelKey(c) === currentKey);
		if (triedThisChain.size === 0 && !isCandidate) {
			// Fresh failure on a model we didn't pick (e.g. internal-vllm, or a
			// model the user chose explicitly) -- never touch it unprompted.
			return;
		}

		triedThisChain.add(currentKey);
		if (triedThisChain.size >= MAX_CHAIN_LENGTH) {
			ctx.ui.notify(`Model fallback chain exhausted (${triedThisChain.size} models tried) after "${currentKey}" failed: ${errorMessage.slice(0, 120)}`, "error");
			triedThisChain.clear();
			return;
		}

		// 1) next untried candidate from the fixed list, in order
		let next = CANDIDATES.find((c) => !triedThisChain.has(modelKey(c)));

		// 2) all fixed candidates tried -- random untried free OpenRouter model
		// from Pi's built-in catalog
		if (!next) {
			const pool = ctx.modelRegistry
				.getAll()
				.filter((m) => m.provider === "openrouter" && m.id.endsWith(":free") && !triedThisChain.has(modelKey({ provider: m.provider, id: m.id })));
			if (pool.length === 0) {
				ctx.ui.notify(`No untried free OpenRouter models left after "${currentKey}" failed: ${errorMessage.slice(0, 120)}`, "error");
				triedThisChain.clear();
				return;
			}
			const picked = pool[Math.floor(Math.random() * pool.length)];
			next = { provider: picked.provider, id: picked.id };
		}

		const nextModel = ctx.modelRegistry.find(next.provider, next.id);
		if (!nextModel) {
			ctx.ui.notify(`Fallback candidate ${modelKey(next)} not found in model registry.`, "error");
			triedThisChain.clear();
			return;
		}

		const lastUser = [...messages].reverse().find((m) => m.role === "user");
		const userText =
			lastUser && Array.isArray(lastUser.content)
				? lastUser.content
						.filter((c): c is { type: "text"; text: string } => (c as { type?: string }).type === "text")
						.map((c) => c.text)
						.join("\n")
				: undefined;
		if (!userText) return; // nothing to resubmit

		const switched = await pi.setModel(nextModel);
		if (!switched) {
			ctx.ui.notify(`Failed to switch to fallback model ${modelKey(next)} (no auth configured?).`, "error");
			triedThisChain.clear();
			return;
		}

		ctx.ui.notify(`Model failure (${errorMessage.slice(0, 80)}) -- switching to ${modelKey(next)} and retrying.`, "info");
		pi.sendUserMessage(userText);
	});
}
