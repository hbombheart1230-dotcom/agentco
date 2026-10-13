import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { runSyntheticClaude, resolveClaudePath } from "../../scripts/commander.mjs";

const blocked = {
  codex: "NOT_READY: native exec tool-free/file-read boundary and exact OpenRouter Responses route not verified.",
  hermes: "NOT_READY: isolated native launch failed; tool-free auxiliary/fallback-free route not verified.",
};
export function selectHarness(harness: string, job: string) {
  if (!["auto","claude","codex","hermes"].includes(harness) || job !== "add42") throw Error("Use auto|claude|codex|hermes with fixed synthetic add42 only; no private text/paths.");
  return harness === "auto" ? "claude" : harness;
}
export function readiness() {
  let claude=process.env.OPENROUTER_API_KEY?"available: verified native free-only synthetic add42":"blocked: OPENROUTER_API_KEY unavailable";
  try { resolveClaudePath(); } catch { claude="UNAVAILABLE: trusted Claude executable missing"; }
  return {claude,codex:blocked.codex,hermes:blocked.hermes};
}
export function registerHarness(pi: ExtensionAPI, invoke = runSyntheticClaude) {
  const active = new Map<AbortController, Promise<unknown>>();
  const delegate = async (harness: string, job: string, signal?: AbortSignal) => {
    const selected=selectHarness(harness,job);
    if(selected!=="claude")return {harness:selected,job,status:"NOT_READY",reason:blocked[selected],fallback:false};
    const controller=new AbortController();
    const abort=()=>controller.abort();signal?.addEventListener("abort",abort,{once:true});if(signal?.aborted)abort();
    try { const pending=invoke(job,{signal:controller.signal});active.set(controller,pending);return await pending; }
    catch { return {harness:selected,job,status:"FAIL",reason:"Claude execution/key/free-price/result gate failed; no fallback.",fallback:false}; }
    finally { active.delete(controller);signal?.removeEventListener("abort",abort); }
  };
  pi.on("session_shutdown",async()=>{const pending=[...active];for(const [c] of pending)c.abort();await Promise.allSettled(pending.map(([,p])=>p));});
  pi.registerTool({name:"agentco_delegate",label:"External Harness",description:"Delegate the fixed fabricated arithmetic job add42 to an external Worker. Auto selects verified Claude only. Never send private task text, paths, files or session context. Explicit unverified Codex/Hermes returns NOT_READY without fallback.",
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
