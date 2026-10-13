import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { runSyntheticClaude, runSyntheticCodex, runSyntheticHermes, resolveClaudePath, resolveCodexPath, resolveHermesPath } from "../../scripts/commander.mjs";

type Lane = "claude" | "codex" | "hermes";
type Invoker = (job: string, options: { signal?: AbortSignal }) => Promise<any>;
const lanes: Lane[] = ["claude", "codex", "hermes"];
const labels: Record<Lane, string> = { claude: "Claude Code", codex: "Codex", hermes: "Hermes" };
const resolvers: Record<Lane, () => unknown> = { claude: resolveClaudePath, codex: resolveCodexPath, hermes: resolveHermesPath };
export function selectHarness(harness: string, job: string): Lane {
  if (!["auto","claude","codex","hermes"].includes(harness) || job !== "add42") throw Error("Use auto|claude|codex|hermes with fixed synthetic add42 only; no private text/paths.");
  // auto stays deterministic: Claude is the accepted default lane; named Codex/Hermes are never chosen implicitly.
  return harness === "auto" ? "claude" : harness as Lane;
}
export function readiness() {
  const key = Boolean(process.env.OPENROUTER_API_KEY);
  const status = (lane: Lane) => {
    try { resolvers[lane](); } catch { return `UNAVAILABLE: installed ${labels[lane]} executable not found`; }
    return key ? `available: native free-only synthetic add42 (zero I/O tools, exact free model); named route only${lane === "claude" ? ", also auto default" : ""}` : "blocked: OPENROUTER_API_KEY unavailable";
  };
  return { claude: status("claude"), codex: status("codex"), hermes: status("hermes") };
}
export function registerHarness(pi: ExtensionAPI, invoke: Invoker | Partial<Record<Lane, Invoker>> = { claude: runSyntheticClaude, codex: runSyntheticCodex, hermes: runSyntheticHermes }) {
  const invokers = (typeof invoke === "function" ? { claude: invoke, codex: invoke, hermes: invoke } : invoke) as Partial<Record<Lane, Invoker>>;
  const active = new Map<AbortController, Promise<unknown>>();
  const delegate = async (harness: string, job: string, signal?: AbortSignal) => {
    const selected = selectHarness(harness, job);
    const run = invokers[selected];
    if (!run) return { harness: selected, job, status: "NOT_READY", reason: `NOT_READY: ${labels[selected]} route not configured.`, fallback: false };
    const controller = new AbortController();
    const abort = () => controller.abort(); signal?.addEventListener("abort", abort, { once: true }); if (signal?.aborted) abort();
    try {
      const pending = run(job, { signal: controller.signal }); active.set(controller, pending);
      const result = await pending;
      // Never accept another worker's PASS under this name, and never a non-PASS shape.
      if (!result || result.harness !== selected || result.status !== "PASS") throw Error("identity or status mismatch");
      return result;
    }
    catch { return { harness: selected, job, status: "FAIL", reason: `${labels[selected]} execution/key/free-price/result gate failed; no fallback.`, fallback: false }; }
    finally { active.delete(controller); signal?.removeEventListener("abort", abort); }
  };
  pi.on("session_shutdown",async()=>{const pending=[...active];for(const [c] of pending)c.abort();await Promise.allSettled(pending.map(([,p])=>p));});
  pi.registerTool({name:"agentco_delegate",label:"External Harness",description:"Delegate the fixed fabricated arithmetic job add42 to an external Worker. Auto selects verified Claude only. Never send private task text, paths, files or session context. Named codex/hermes run only that CLI and fail closed without fallback.",
    parameters:Type.Object({harness:Type.Union([Type.Literal("auto"),Type.Literal("claude"),Type.Literal("codex"),Type.Literal("hermes")]),job:Type.Literal("add42")},{additionalProperties:false}),
    async execute(_id,params,signal){const result=await delegate(params.harness,params.job,signal);return {content:[{type:"text",text:JSON.stringify(result)}],details:result,isError:result.status!=="PASS"};}
  });
  pi.registerCommand("harness",{description:"status | auto|claude|codex|hermes add42 (synthetic jobs only)",
    handler:async(args,ctx)=>{
      let result;
      if(args.trim()==="status")result=readiness();
      else {const parts=args.trim().split(/\s+/);try {if(parts.length!==2)throw Error();result=await delegate(parts[0],parts[1]);}catch {result={status:"REJECTED",reason:"Use /harness status or /harness auto|claude|codex|hermes add42 only."};}}
      pi.sendMessage({customType:"agentco-harness",content:JSON.stringify(result),display:true,details:result},{triggerTurn:false});
    }
  });
}
export default registerHarness;
