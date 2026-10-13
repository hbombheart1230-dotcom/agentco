// Official child-only native provider overrides; never log credentials or modify profiles.
import { piEnv } from './env.mjs';
export const freeMainModel='nvidia/nemotron-3-super-120b-a12b:free';
export async function freeMainPricing(fetchMetadata=fetch) {
  const response=await fetchMetadata('https://openrouter.ai/api/v1/models',{signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw Error('Public pricing unavailable.');
  const model=(await response.json()).data?.find(row=>row.id===freeMainModel);
  if(model?.pricing?.prompt!=='0'||model?.pricing?.completion!=='0')throw Error('Exact zero pricing unconfirmed.');
}
export async function nativeFreeMain(plan, env, {key=()=>piEnv().OPENROUTER_API_KEY,pricing=freeMainPricing}={}) {
  if(plan.main==='pi'||plan.status)return {plan,env};
  // Metadata-only commands do not initialize a provider or send a prompt.
  if(plan.args.every(arg=>['--help','-h','--version','-V','--no-daemon'].includes(arg))&&plan.args.some(arg=>['--help','-h','--version','-V'].includes(arg)))return {plan,env};
  const blocked=(status,reason)=>({plan:{main:plan.main,status,reason},env});
  const token=key();
  if(!token)return blocked('CONFIG_REQUIRED','OpenRouter key absent; default/subscription route not launched.');
  if(plan.main==='claude')return blocked('CLAUDE_UNSUPPORTED','Official Claude Code gateways do not support NVIDIA models. Required first-run consent is not bypassed.');
  if(plan.main==='hermes')return blocked('BLOCKED','OpenRouter flags supported; native auxiliary/fallback free-only control not proven without profile changes.');
  // Reject provider/model/profile changes, remote sessions, subcommands and startup prompts.
  // Other native option support can be approved separately; never silently replace a user choice.
  for(let i=0;i<plan.args.length;i++){
    const arg=plan.args[i];
    if(['--no-daemon','--no-alt-screen'].includes(arg))continue;
    if(['-C','--cd','--add-dir'].includes(arg)&&plan.args[i+1]){i++;continue;}
    return blocked('CONFIG_REQUIRED','Native argument outside verified free-only launch options; no fallback.');
  }
  try{await pricing();}catch{return blocked('BLOCKED','Exact public prompt/completion zero pricing unavailable; no fallback.');}
  const config=[`model="${freeMainModel}"`,`review_model="${freeMainModel}"`,'model_provider="agentco_free_main"',
    'model_providers.agentco_free_main.name="Agentco OpenRouter free"','model_providers.agentco_free_main.base_url="https://openrouter.ai/api/v1"',
    'model_providers.agentco_free_main.env_key="OPENROUTER_API_KEY"','model_providers.agentco_free_main.wire_api="responses"',
    'model_providers.agentco_free_main.requires_openai_auth=false','model_providers.agentco_free_main.supports_websockets=false',
    'model_providers.agentco_free_main.request_max_retries=0','model_providers.agentco_free_main.stream_max_retries=0',
    'web_search="disabled"','features.multi_agent=false','features.multi_agent_v2=false','features.in_app_voice=false',
    'features.realtime_conversation=false','features.apps=false','features.memories=false','mcp_servers={}',
    'shell_environment_policy.exclude=["OPENROUTER_API_KEY"]'];
  return {plan:{...plan,args:[...plan.args,...config.flatMap(value=>['-c',value])]},env:{...env,OPENROUTER_API_KEY:token}};
}
