// Isolated Pi Commander -> Claude Worker: text default, explicit synthetic --toy-edit.
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, existsSync, copyFileSync, renameSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { readdirSync, lstatSync } from 'node:fs';
import { statSync } from 'node:fs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cli = join(root, 'node_modules/@earendil-works/pi-coding-agent/dist/cli.js');
export const model = 'nvidia/nemotron-3-super-120b-a12b:free';
export function resolveClaudePath(override = process.env.AGENTCO_CLAUDE_CLI) {
  const path = override ? resolve(override) : join(process.env.LOCALAPPDATA || '', 'Microsoft/WinGet/Links/claude.exe');
  if (!existsSync(path) || !statSync(path).isFile() || !path.toLowerCase().endsWith('.exe')) throw Error('A trusted local Claude .exe is required.');
  return path;
}
export function writeOwner(path, owner) {
  writeFileSync(path+'.tmp',JSON.stringify({state:owner.state,pid:owner.pid,identity:owner.identity}));
  renameSync(path+'.tmp',path);
}
export async function getProcessIdentity(pid) {
  if (!Number.isInteger(pid) || pid <= 0 || process.platform !== 'win32') return { status: 'unknown' };
  const command = `try {$p=Get-Process -Id ${pid} -ErrorAction Stop; @{status='found';pid=$p.Id;started=$p.StartTime.ToUniversalTime().Ticks.ToString()}|ConvertTo-Json -Compress} catch {'{"status":"unknown"}'}`;
  try { const {stdout} = await promisify(execFile)(join(process.env.SystemRoot || process.env.WINDIR, 'System32/WindowsPowerShell/v1.0/powershell.exe'), ['-NoProfile','-NonInteractive','-Command',command], { timeout:5000, windowsHide:true }); return JSON.parse(stdout); }
  catch { return { status: 'unknown' }; }
}
async function terminateTree(pid) {
  await promisify(execFile)(join(process.env.SystemRoot || process.env.WINDIR, 'System32/taskkill.exe'), ['/PID', String(pid), '/T', '/F'], { timeout:5000, windowsHide:true });
}
export async function killTree(owner, { readIdentity = getProcessIdentity, terminate = terminateTree } = {}) {
  if (owner?.state === 'closed') return 'retired';
  if (!owner || !Number.isInteger(owner.pid) || owner.identity?.status !== 'found') throw Error('Cleanup skipped: process ownership unverifiable.');
  const current = await readIdentity(owner.pid);
  if (owner.state === 'closed') return 'retired';
  if (current.status !== 'found' || current.pid !== owner.pid || current.started !== owner.identity.started) throw Error('Cleanup skipped: process identity stale or unverifiable.');
  await terminate(owner.pid); return 'terminated';
}
export async function cleanupOrphan(path, options) {
  if (!existsSync(path)) return 'absent';
  return killTree(JSON.parse(readFileSync(path,'utf8')), options);
}
export function runBounded(file, args, { timeout = 60000, maxBuffer = 1048576, signal, onSpawn, onIdentity, onRetire, readIdentity = getProcessIdentity, terminate = terminateTree, closeTimeout = 1000, ...options } = {}) {
  if (signal?.aborted) return Promise.reject(Error('Process aborted before launch.'));
  return new Promise((resolveRun, reject) => {
    const child = spawn(file, args, { ...options, windowsHide:true, stdio:['ignore','pipe','pipe'] });
    const owner = {state:'spawned',pid:child.pid,identity:null};
    let stdout='', bytes=0, failure, cleanup, cleanupMode='none', closeTimer, settled=false;
    const live = () => owner.state !== 'closed' && Number.isInteger(child.pid) && child.exitCode === null && child.signalCode === null;
    const finish = (code, uncertainty=false) => {
      if (settled) return; settled=true; clearTimeout(timer); clearTimeout(closeTimer); signal?.removeEventListener('abort',abort);
      if (uncertainty) { failure=(failure?failure+' ':'')+'Exited child has open descendant streams; subtree cleanup unverified.'; child.stdout.destroy(); child.stderr.destroy(); }
      if (failure) { const error=Error(failure+(cleanupMode==='direct-only'?' Direct child stopped; subtree cleanup unverified.':'')); error.cleanup=cleanupMode; reject(error); }
      else resolveRun({status:code,stdout});
    };
    const stop = reason => {
      failure ||= reason;
      if (!live() || cleanup) return;
      // This is our still-live ChildProcess handle, never a PID adopted from a file.
      cleanup = (async () => {
        try { if (live()) { await terminate(child.pid); cleanupMode='tree'; } }
        catch {
          if (live()) {
            cleanupMode='direct-only';
            try { if (!child.kill('SIGKILL')) { cleanupMode='failed'; failure='Owned direct-child termination failed.'; } }
            catch { cleanupMode='failed'; failure='Owned direct-child termination failed.'; }
          }
        }
        if (cleanupMode==='failed') finish(null);
      })();
    };
    const retire = () => {
      if (owner.state==='closed') return;
      owner.state='closed';owner.pid=null;owner.identity=null;
      try { onRetire?.(owner); } catch { failure='Lifecycle retirement failed.'; }
    };
    const abort = () => stop('Process aborted.');
    const timer=setTimeout(()=>stop('Process timed out.'),timeout);
    signal?.addEventListener('abort',abort,{once:true});
    child.once('spawn',()=>{
      owner.pid=child.pid;
      try { onSpawn?.(child.pid,owner); } catch { failure='Spawn tracking failed.'; }
      Promise.resolve().then(()=>readIdentity(child.pid)).then(identity=>{
        if (owner.state==='closed') return;
        owner.identity=identity;owner.state='active';onIdentity?.(owner);
        if (identity?.status!=='found') stop('Process identity inspection failed.');
      }).catch(()=>{if (owner.state!=='closed') stop('Process identity inspection failed.');});
      if (failure || signal?.aborted) stop(failure || 'Process aborted.');
    });
    if (signal?.aborted) abort();
    for (const [stream,capture] of [[child.stdout,true],[child.stderr,false]]) stream.setEncoding('utf8').on('data',data=>{
      bytes+=Buffer.byteLength(data);if(bytes>maxBuffer){stop('Process output limit exceeded.');return;}if(capture)stdout+=data;
    });
    child.once('error',()=>stop('Process launch failed.'));
    child.once('exit',code=>{retire();closeTimer=setTimeout(async()=>{if(cleanup)await cleanup;finish(code,true);},closeTimeout);});
    child.once('close',async code=>{retire();if(cleanup)await cleanup;finish(code);});
  });
}
export function validatePipeline(e) {
  const clean = text => typeof text === 'string' ? text.replaceAll('\r\n', '\n').trim() : '';
  if (e.exitCode !== 0 || e.worker?.exitCode !== 0 || !clean(e.worker?.output)) return false;
  if (e.commanderModels?.length !== 1 || e.commanderModels[0] !== model || e.worker.observedModels?.length !== 1 || e.worker.observedModels[0] !== model) return false;
  if (e.commanderCalls?.length !== 1 || e.commanderCalls[0].name !== 'claude_worker') return false;
  const results = e.returnedToolResults?.filter(r => r.name === 'claude_worker');
  if (results?.length !== 1 || results[0].isError) return false;
  try {
    const result = JSON.parse(results[0].content.filter(c => c.type === 'text').map(c => c.text).join(''));
    return result.exitCode === 0 && result.model === model && clean(result.output) === clean(e.worker.output) && clean(e.final) === clean(e.worker.output);
  } catch { return false; }
}
// Shared native text invocation; never starts another Pi Commander.
export function claudeTextArgs(task) {
  return ['--bare','--restricted','-p',task,'--model',model,'--tools','','--disallowedTools','*','--strict-mcp-config','--setting-sources','','--no-session-persistence','--no-chrome','--max-turns','1','--output-format','json','--system-prompt','Answer only the synthetic task briefly.','--settings','{}'];
}
export async function runSyntheticClaude(job, {signal} = {}) {
  if (job !== 'add42') throw Error('Only fixed synthetic add42 is supported.');
  const key=process.env.OPENROUTER_API_KEY;
  if(!key) throw Error('Worker key unavailable.');
  const pricing=(await (await fetch('https://openrouter.ai/api/v1/models',{signal:signal?AbortSignal.any([signal,AbortSignal.timeout(10000)]):AbortSignal.timeout(10000)})).json()).data?.find(m=>m.id===model)?.pricing;
  if(pricing?.prompt!=='0'||pricing?.completion!=='0') throw Error('Exact-free Worker pricing gate failed.');
  const toy=mkdtempSync(join(tmpdir(),'agentco-p5-2-worker-')), home=join(toy,'home');mkdirSync(home);
  const env=Object.fromEntries(Object.entries(process.env).filter(([k])=>['SYSTEMROOT','WINDIR','COMSPEC','PATH','PATHEXT','TEMP','TMP','LOCALAPPDATA','APPDATA','PROGRAMDATA','PROGRAMFILES','PROGRAMFILES(X86)'].includes(k.toUpperCase())));
  Object.assign(env,{HOME:home,USERPROFILE:home,CLAUDE_CONFIG_DIR:home,ANTHROPIC_BASE_URL:'https://openrouter.ai/api',ANTHROPIC_AUTH_TOKEN:key,ANTHROPIC_API_KEY:'',CLAUDE_CODE_SIMPLE:'1',CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC:'1',CLAUDE_CODE_MAX_RETRIES:'0',API_TIMEOUT_MS:'20000',CLAUDE_CODE_MAX_OUTPUT_TOKENS:'256',DISABLE_AUTOUPDATER:'1',DISABLE_TELEMETRY:'1',DISABLE_ERROR_REPORTING:'1',DISABLE_AUTO_COMPACT:'1'});
  for(const name of ['ANTHROPIC_MODEL','ANTHROPIC_DEFAULT_FABLE_MODEL','ANTHROPIC_DEFAULT_OPUS_MODEL','ANTHROPIC_DEFAULT_SONNET_MODEL','ANTHROPIC_DEFAULT_HAIKU_MODEL','CLAUDE_CODE_SUBAGENT_MODEL'])env[name]=model;
  const run=await runBounded(resolveClaudePath(),claudeTextArgs('Calculate 7+11+24. Respond exactly ADD42=42.'),{cwd:toy,env,signal,timeout:30000,maxBuffer:262144});
  const data=JSON.parse(run.stdout.trim()), observedModels=Object.keys(data.modelUsage||{});
  if(run.status!==0||data.is_error||String(data.result).trim()!=='ADD42=42'||observedModels.length!==1||observedModels[0]!==model)throw Error('Synthetic Worker result/route failed.');
  const result={harness:'claude',job,status:'PASS',output:'ADD42=42',model,observedModels,exitCode:run.status,toolMode:'none',turns:data.num_turns};
  const area=join(root,'results/p5-2');mkdirSync(area,{recursive:true});writeFileSync(join(area,`worker-${Date.now()}.json`),JSON.stringify(result,null,2));
  return result;
}
// Fixed synthetic fixture; validate bytes before executing any model-edited code.
export const toyBefore = 'module.exports = (a, b, c) => a - b - c;\n';
export const toyAfter = 'module.exports = (a, b, c) => a + b + c;\n';
export const toyTest = "import test from 'node:test';import assert from 'node:assert/strict';import sum from './sum.js';test('synthetic sum equals 42',()=>assert.equal(sum(7,11,24),42));\n";
export function checkToyEdit(before, after, testSource, files, tools, status) {
  return before === toyBefore && before !== after && after.trim() === toyAfter.trim() && testSource === toyTest
    && files.length === 2 && files.every(f => ['sum.js','sum.test.mjs'].includes(f))
    && tools.every(t=>['Read','Edit','Write'].includes(t.name) && t.file==='sum.js' && t.success)
    && tools.some(t=>t.name==='Read' && t.success) && status === 0 && tools.some(t => ['Edit','Write'].includes(t.name) && t.file === 'sum.js' && t.success);
}
export async function verifyToyEdit(project, tools, signal) {
  const files=readdirSync(project);
  if (files.some(f=>!lstatSync(join(project,f)).isFile() || lstatSync(join(project,f)).isSymbolicLink())) throw Error('Unexpected fixture entry.');
  const after=readFileSync(join(project,'sum.js'),'utf8'), source=readFileSync(join(project,'sum.test.mjs'),'utf8');
  if (!checkToyEdit(toyBefore,after,source,files,tools,0)) throw Error('Native edit or fixture integrity failed.');
  const env=Object.fromEntries(Object.entries(process.env).filter(([k])=>['SYSTEMROOT','WINDIR','COMSPEC','PATH','PATHEXT','TEMP','TMP'].includes(k.toUpperCase())));
  const run=await runBounded(process.execPath,['--test','sum.test.mjs'],{cwd:project,env,signal,timeout:10000,maxBuffer:65536});
  if (!checkToyEdit(toyBefore,after,source,files,tools,run.status)) throw Error('Host Node test failed.');
  const hash=text=>createHash('sha256').update(text).digest('hex');
  return {changed:true,beforeHash:hash(toyBefore),afterHash:hash(after),testExitCode:run.status,testsPassed:1,nativeTools:tools};
}
async function main() {
const claude = resolveClaudePath();
if (!existsSync(cli)) throw Error('Existing Pi CLI required; no installation performed.');
if (process.env.AGENTCO_CLAUDE_CLI) console.warn('Trusted Claude executable override receives API authentication; select only a trusted local binary.');
if (process.argv[2] === '--check') { console.log('Commander startup prerequisites: PASS; Claude: '+claude); return; }
const toyEdit=process.argv[2]==='--toy-edit';
const toyTask='Fix the fabricated sum.js using native file tools. Replace its content with exactly: module.exports = (a, b, c) => a + b + c; Do not change any other file. Read sum.js first. Return only EDIT_DONE after editing.';
const request = toyEdit ? 'Delegate the fabricated sum.js repair to claude_worker exactly once. The tool performs the file edit and Node test. Then respond with ONLY the exact value of the output property in its JSON result. Do not describe files or use the Worker internal EDIT_DONE response.' : process.argv.slice(2).join(' ');
if (!request || request.length > 2000) throw Error('Provide a synthetic task of 1..2000 characters.');
let key = process.env.OPENROUTER_API_KEY;
if (!key && existsSync(join(root, '.env'))) {
  const entry = readFileSync(join(root, '.env'), 'utf8').match(/^[ \t]*(?:export[ \t]+)?OPENROUTER_API_KEY[ \t]*=[ \t]*(.*?)[ \t]*\r?$/m);
  if (entry) key = entry[1].replace(/^(["'])(.*)\1$/, '$2').split(' #')[0].trim();
}
if (!key) throw Error('OPENROUTER_API_KEY unavailable.');
const metadata = await (await fetch('https://openrouter.ai/api/v1/models')).json();
const pricing = metadata.data?.find(m => m.id === model)?.pricing;
if (pricing?.prompt !== '0' || pricing?.completion !== '0') throw Error('Exact free-model pricing gate failed.');
const toy = mkdtempSync(join(tmpdir(), 'agentco-p5-toy-'));
for (let parent = toy; ; parent = dirname(parent)) {
  if (['AGENTS.md', 'CLAUDE.md'].some(n => existsSync(join(parent, n)))) throw Error('Ancestor instructions present.');
  if (dirname(parent) === parent) break;
}
const agent = join(toy, 'pi-home'), workerHome = join(toy, 'claude-home');
mkdirSync(agent); mkdirSync(workerHome);
const project=toyEdit?join(toy,'project'):toy;
if(toyEdit){mkdirSync(project);writeFileSync(join(project,'sum.js'),toyBefore);writeFileSync(join(project,'sum.test.mjs'),toyTest);}
writeFileSync(join(agent, 'settings.json'), JSON.stringify({ retry: { enabled: false } }));
writeFileSync(join(agent, 'models.json'), JSON.stringify({ providers: { openrouter: { modelOverrides: { [model]: { maxTokens: 512 } } } } }));
const extension = join(toy, 'claude-worker.mjs');
writeFileSync(extension, `
import { runBounded, writeOwner, verifyToyEdit, claudeTextArgs } from ${JSON.stringify(import.meta.url)};
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const saveOwner = owner => writeOwner(${JSON.stringify(join(toy,'worker-process.json'))},owner);
export default function(pi) {
  let dispatched = false;
  pi.registerTool({name:'claude_worker', label:'Claude Worker', description:${JSON.stringify(toyEdit?'Fix one fabricated JS file with native Claude file tools; host verifies Node test. No shell tools.':'Delegate one synthetic text-only task to Claude CLI. No file or shell tools.')},
    parameters:{type:'object',properties:{task:{type:'string',minLength:1,maxLength:2000}},required:['task'],additionalProperties:false},
    async execute(id, {task}, signal) {
      if (dispatched) throw Error('Only one worker dispatch is allowed per run.');
      dispatched = true;
      const env = {...process.env, HOME:${JSON.stringify(workerHome)}, USERPROFILE:${JSON.stringify(workerHome)}, CLAUDE_CONFIG_DIR:${JSON.stringify(workerHome)},
        ANTHROPIC_BASE_URL:'https://openrouter.ai/api', ANTHROPIC_AUTH_TOKEN:process.env.OPENROUTER_API_KEY, ANTHROPIC_API_KEY:'',
        CLAUDE_CODE_SIMPLE:${JSON.stringify(toyEdit?'':'1')}, CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC:'1', CLAUDE_CODE_MAX_RETRIES:'0', API_TIMEOUT_MS:'20000',
        CLAUDE_CODE_MAX_OUTPUT_TOKENS:${JSON.stringify(toyEdit?'512':'256')}, DISABLE_AUTOUPDATER:'1', DISABLE_TELEMETRY:'1', DISABLE_ERROR_REPORTING:'1', DISABLE_AUTO_COMPACT:'1'};
      delete env.OPENROUTER_API_KEY;
      for (const name of ['ANTHROPIC_MODEL','ANTHROPIC_DEFAULT_FABLE_MODEL','ANTHROPIC_DEFAULT_OPUS_MODEL','ANTHROPIC_DEFAULT_SONNET_MODEL','ANTHROPIC_DEFAULT_HAIKU_MODEL','CLAUDE_CODE_SUBAGENT_MODEL']) env[name]=${JSON.stringify(model)};
      let result;
      if (${toyEdit}) { delete env.CLAUDE_CODE_SIMPLE; env.CLAUDE_CODE_SAFE_MODE='1'; }
      try {
        const args=${toyEdit} ? ['--safe-mode','--restricted','-p',${JSON.stringify(toyTask)},'--model',${JSON.stringify(model)},'--tools','Read,Edit,Write','--allowedTools','Read(./sum.js),Edit(./sum.js)','--permission-mode','dontAsk','--strict-mcp-config','--setting-sources','','--disable-slash-commands','--no-session-persistence','--no-chrome','--max-turns','4','--output-format','stream-json','--verbose','--system-prompt','Edit only the synthetic sum.js as instructed. No other tasks.','--settings',${JSON.stringify(JSON.stringify({permissions:{deny:['Edit(./sum.test.mjs)']}}))}] : claudeTextArgs(task);
        const run = await runBounded(${JSON.stringify(claude)}, args, {cwd:${JSON.stringify(project)},env,signal,timeout:${toyEdit?90000:30000},maxBuffer:${toyEdit?524288:262144},onSpawn:(pid,owner)=>saveOwner(owner),onIdentity:saveOwner,onRetire:saveOwner});
        if(run.status!==0) throw Error('Worker exit failed.');
        const events=${toyEdit}?run.stdout.split('\\n').flatMap(line=>{try{return [JSON.parse(line)];}catch{return [];}}):[];
        const data=${toyEdit}?events.findLast(e=>e.type==='result'):JSON.parse(run.stdout.trim());
        const observedModels=Object.keys(data?.modelUsage||{});
        if(!data || data.is_error || !data.result || observedModels.length!==1 || observedModels[0]!==${JSON.stringify(model)}) throw Error('Worker result failed.');
        const text=String(data.result).replaceAll(process.env.OPENROUTER_API_KEY,'[REDACTED]');
        result={model:${JSON.stringify(model)},observedModels,output:text,exitCode:run.status,turns:data.num_turns,toolMode:${JSON.stringify(toyEdit?'Read,Edit,Write':'none')}};
        if (${toyEdit}) {
          const replies=events.flatMap(e=>e.type==='user'?e.message?.content||[]:[]).filter(c=>c.type==='tool_result');
          const tools=events.flatMap(e=>e.type==='assistant'?e.message?.content||[]:[]).filter(c=>c.type==='tool_use').map(c=>({name:c.name,file:resolve(${JSON.stringify(project)},c.input?.file_path||'')===${JSON.stringify(join(project,'sum.js'))}?'sum.js':'other',success:replies.some(r=>r.tool_use_id===c.id&&!r.is_error)}));
          result.fileEdit=await verifyToyEdit(${JSON.stringify(project)},tools,signal);
          result.output='FILE_EDIT_RESULT=PASS; sum(7,11,24)=42; NODE_TEST=PASS';
        }
      } catch { throw Error('Claude worker failed or timed out; no retry/fallback.'); }
      writeFileSync(${JSON.stringify(join(toy, 'worker.json'))},JSON.stringify(result,null,2));
      return {content:[{type:'text',text:JSON.stringify(result)}],details:{worker:'Claude Code CLI',model:result.model}};
    }
  });
}
`);
const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => ['SYSTEMROOT','WINDIR','COMSPEC','PATH','PATHEXT','TEMP','TMP','LOCALAPPDATA','APPDATA','PROGRAMDATA','PROGRAMFILES','PROGRAMFILES(X86)'].includes(k.toUpperCase())));
Object.assign(env, { HOME: agent, USERPROFILE: agent, PI_CODING_AGENT_DIR: agent, OPENROUTER_API_KEY: key });
const started = Date.now();
const controller = new AbortController();
const interrupt = () => controller.abort();
process.on('SIGINT', interrupt); process.on('SIGTERM', interrupt);
let run, failure;
try { run = await runBounded(process.execPath, [cli,'--provider','openrouter','--model',model,'--thinking','off','--tools','claude_worker','--no-extensions','-e',extension,'--no-mcp','--no-skills','--no-prompt-templates','--no-context-files','--no-themes','--no-session','--system-prompt','You are a synthetic-task Commander. Call claude_worker exactly once with the user task. Return the Worker output verbatim, with no added explanation. Do not answer before delegating.','--mode','json','-p',request], {cwd:toy,env,signal:controller.signal,timeout:toyEdit?150000:60000,maxBuffer:1048576}); }
catch (error) { failure = error.message; run = {status:null,stdout:''}; }
finally {
  const ownerFile = join(toy,'worker-process.json');
  try { await cleanupOrphan(ownerFile); } catch { failure = 'Worker cleanup skipped: ownership uncertain.'; }
  process.removeListener('SIGINT', interrupt); process.removeListener('SIGTERM', interrupt);
}
const events = (run.stdout || '').split('\n').flatMap(line => { try { return [JSON.parse(line)]; } catch { return []; } });
const messages = events.filter(e => e.type === 'message_end' && e.message?.role === 'assistant').map(e => e.message);
const final = messages.at(-1)?.content?.filter(c => c.type === 'text').map(c => c.text).join('') || '';
const workerFile = join(toy, 'worker.json');
const evidence = { model, commanderModels:[...new Set(messages.map(m=>m.model))], pricing, exitCode:run.status, elapsedSeconds:(Date.now()-started)/1000, worker:existsSync(workerFile)?JSON.parse(readFileSync(workerFile,'utf8')):null,
  commanderCalls:messages.flatMap(m=>m.content||[]).filter(c=>c.type==='toolCall').map(c=>({name:c.name,arguments:c.arguments})),
  returnedToolResults:events.filter(e=>e.type==='message_end'&&e.message?.role==='toolResult').map(e=>({name:e.message.toolName,isError:e.message.isError===true,content:e.message.content})), final, fixture:'owned external synthetic directory', httpRequests:'unobserved', providerBilling:'unverified' };
evidence.pipelineSuccess = !failure && validatePipeline(evidence);
evidence.correspondence = evidence.pipelineSuccess ? 'exact after outer-whitespace/CRLF normalization' : 'NOT VERIFIED';
evidence.failure = failure || (evidence.pipelineSuccess ? null : 'Worker/toolResult/final correspondence or route failed.');
const output = join(root, toyEdit?'results/p5-1':'results/p5', `pipeline-${Date.now()}`); mkdirSync(output, {recursive:true});
writeFileSync(join(output, 'evidence.json'), JSON.stringify(evidence,null,2).replaceAll(key,'[REDACTED]'));
if (existsSync(workerFile)) copyFileSync(workerFile,join(output,'worker.json'));
if (toyEdit && evidence.worker?.fileEdit?.changed) {
  const after=readFileSync(join(project,'sum.js'),'utf8');
  if (createHash('sha256').update(after).digest('hex')===evidence.worker.fileEdit.afterHash && after.trim()===toyAfter.trim()) {
    writeFileSync(join(output,'fixture-before.js'),toyBefore);writeFileSync(join(output,'fixture-after.js'),after);writeFileSync(join(output,'sum.test.mjs'),toyTest);
  }
}
console.log(final.replaceAll(key,'[REDACTED]') || 'Pipeline failed before final Commander response.');
console.log('Evidence: '+output);
if (!evidence.pipelineSuccess) { console.error(evidence.failure); process.exitCode = 1; }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await main(); } catch { console.error('Commander preflight failed; verify local executable, key availability and free-model pricing.'); process.exitCode = 1; }
}
