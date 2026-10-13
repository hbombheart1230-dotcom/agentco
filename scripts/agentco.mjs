// Native Main entrypoint. Fixed Worker delegation is explicit and separate from Main.
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, cli, piEnv } from './env.mjs';
import { nativeFreeMain } from './native-free-main.mjs';
import { resolveClaudePath, resolveCodexPath, resolveHermesPath, runSyntheticClaude, runSyntheticCodex, runSyntheticHermes } from './commander.mjs';

export const mains = ['pi','claude','codex','hermes'];
export function menuChoice(value) {
  const choice=String(value).trim()||'1';
  if(!/^[1-4]$/.test(choice))throw Error('Choose 1..4; Enter selects Pi.');
  return mains[Number(choice)-1];
}
export async function menuEntry(question) {
  const main=menuChoice(await question('Main: 1 Pi [default] / 2 Claude Code / 3 Codex CLI / 4 Hermes\n> '));
  if(['claude','hermes'].includes(main)) {
    const answer=await question(`${main}: free-only use is not guaranteed; login may appear and later chat may incur charges. Open native TUI? [y/N] `);
    if(!/^(y|yes)$/i.test(String(answer).trim()))return {kind:'cancel'};
    return {kind:'main',main,args:[],nativeDefault:true};
  }
  return {kind:'main',main,args:[]};
}
export function parseEntry(args, tty) {
  if(args[0]==='--delegate') {
    if(args.length!==3 || !mains.includes(args[1]) || args[2]!=='add42')throw Error('Usage: agentco --delegate pi|claude|codex|hermes add42 (fixed synthetic job only).');
    return {kind:'delegate',target:args[1],job:args[2]};
  }
  if(args[0]==='--main') {
    if(!mains.includes(args[1]))throw Error('Usage: agentco --main pi|claude|codex|hermes [native arguments].');
    if(args[2]==='--native-default') {
      if(!['claude','hermes'].includes(args[1]))throw Error('--native-default is only for Claude/Hermes native TUI access.');
      return {kind:'main',main:args[1],args:args.slice(3),nativeDefault:true};
    }
    return {kind:'main',main:args[1],args:args.slice(2)};
  }
  return args.length===0 && tty ? {kind:'menu'} : {kind:'main',main:'pi',args};
}
const resolvers={claude:resolveClaudePath,codex:resolveCodexPath,hermes:resolveHermesPath};
export function mainPlan(main, args, lookup=resolvers) {
  if(main==='pi')return {file:process.execPath,args:[cli,...args],kind:'native',main};
  if(!mains.includes(main))throw Error('Unknown Main; no fallback.');
  let file;try{file=lookup[main]();}catch{return {main,status:'NOT_READY',reason:'Installed trusted executable unavailable; no fallback.'};}
  if(main==='codex' && !args.slice(0,args.indexOf('--')<0?args.length:args.indexOf('--')).includes('--no-daemon'))args=['--no-daemon',...args];
  return {file,args,kind:'native',main};
}
export function mainEnvironment(main, inherited = main==='pi'?piEnv():process.env) {
  const env={...inherited,AGENTCO_MAIN:main};
  if(main==='codex' && (!env.TERM || env.TERM==='dumb'))env.TERM='xterm-256color';
  return env;
}
export async function namedJob(target, job, signal, invokers={claude:runSyntheticClaude,codex:runSyntheticCodex,hermes:runSyntheticHermes}, currentMain=process.env.AGENTCO_MAIN) {
  if(!mains.includes(target)||job!=='add42')throw Error('Only an explicit harness and fixed synthetic add42 are supported.');
  if(target===currentMain)return {harness:target,job,status:'NOT_READY',fallback:false,reason:'Requested target is current Main; handle locally. This connector never spawns itself.'};
  if(target==='pi')return {harness:target,job,status:'NOT_READY',fallback:false,reason:'No verified external Pi task route. In a Pi Main, handle locally; no self-spawn or replacement.'};
  try {
    const result=await invokers[target](job,{signal});
    if(result?.harness!==target||result.status!=='PASS'||result.output!=='ADD42=42')throw Error();
    return {...result,fallback:false};
  }catch{return {harness:target,job,status:'FAIL',fallback:false,reason:'Named native Worker failed its existing validation; no replacement.'};}
}
export function launchNative(plan, env, spawnChild=spawn, signals=process) {
  return new Promise(resolveExit=>{
    const child=spawnChild(plan.file,plan.args,{cwd:root,env,stdio:'inherit',shell:false,windowsHide:false});
    // Console Ctrl+C reaches both processes; keep the parent alive for native cleanup.
    const onInterrupt=()=>{};signals.on('SIGINT',onInterrupt);
    const done=code=>{signals.removeListener('SIGINT',onInterrupt);resolveExit(code);};
    child.once('error',()=>done(1));child.once('exit',(code,signal)=>done(code??(signal?130:1)));
  });
}
async function main() {
  let entry=parseEntry(process.argv.slice(2),Boolean(process.stdin.isTTY&&process.stdout.isTTY));
  if(entry.kind==='menu') {
    const input=createInterface({input:process.stdin,output:process.stdout}),cancel=new AbortController();
    input.on('SIGINT',()=>cancel.abort());input.once('close',()=>cancel.abort());
    try{while(entry.kind==='menu'){try{entry=await menuEntry(prompt=>input.question(prompt,{signal:cancel.signal}));}catch{if(cancel.signal.aborted){process.exitCode=130;return;}console.log('Choose 1..4; Enter selects Pi.');}}}finally{input.close();}
  }
  if(entry.kind==='cancel')return;
  if(entry.kind==='delegate') {
    const controller=new AbortController(),abort=()=>controller.abort();process.on('SIGINT',abort);process.on('SIGTERM',abort);
    const previous=process.env.OPENROUTER_API_KEY;
    try{const env=piEnv();process.env.OPENROUTER_API_KEY=env.OPENROUTER_API_KEY||'';const result=await namedJob(entry.target,entry.job,controller.signal);console.log(JSON.stringify(result));process.exitCode=result.status==='PASS'?0:1;}
    finally{process.removeListener('SIGINT',abort);process.removeListener('SIGTERM',abort);if(previous===undefined)delete process.env.OPENROUTER_API_KEY;else process.env.OPENROUTER_API_KEY=previous;}
    return;
  }
  let plan=mainPlan(entry.main,entry.args);
  if(plan.status){console.log(JSON.stringify(plan));process.exitCode=1;return;}
  let env=mainEnvironment(entry.main);
  ({plan,env}=await nativeFreeMain(plan,env,{nativeDefault:entry.nativeDefault===true}));
  if(plan.status){console.log(JSON.stringify(plan));process.exitCode=1;return;}
  process.exitCode=await launchNative(plan,env);
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(()=>{console.error('Agentco launch failed; no fallback.');process.exitCode=1;});
