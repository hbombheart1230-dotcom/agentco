// Isolated Pi Commander -> text-only Claude Worker. No production settings changes.
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, existsSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { statSync } from 'node:fs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cli = join(root, 'node_modules/@earendil-works/pi-coding-agent/dist/cli.js');
export const model = 'nvidia/nemotron-3-super-120b-a12b:free';
export function resolveClaudePath(override = process.env.AGENTCO_CLAUDE_CLI) {
  const path = override ? resolve(override) : join(process.env.LOCALAPPDATA || '', 'Microsoft/WinGet/Links/claude.exe');
  if (!existsSync(path) || !statSync(path).isFile() || !path.toLowerCase().endsWith('.exe')) throw Error('A trusted local Claude .exe is required.');
  return path;
}
export async function killTree(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return;
  try { process.kill(pid, 0); } catch { return; }
  if (process.platform !== 'win32') throw Error('Windows process-tree cleanup required.');
  try { await promisify(execFile)(join(process.env.SystemRoot || process.env.WINDIR, 'System32/taskkill.exe'), ['/PID', String(pid), '/T', '/F'], { timeout: 5000, windowsHide: true }); }
  catch { try { process.kill(pid, 0); } catch { return; } throw Error('Known child process-tree cleanup failed.'); }
}
export function runBounded(file, args, { timeout = 60000, maxBuffer = 1048576, signal, onSpawn, ...options } = {}) {
  if (signal?.aborted) return Promise.reject(Error('Process aborted before launch.'));
  return new Promise((resolveRun, reject) => {
    const child = spawn(file, args, { ...options, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', bytes = 0, failure, cleanup;
    const stop = reason => {
      failure ||= reason;
      if (Number.isInteger(child.pid)) cleanup ||= killTree(child.pid).catch(() => { failure = 'Known child process-tree cleanup failed.'; child.kill(); });
    };
    const abort = () => stop('Process aborted.');
    const timer = setTimeout(() => stop('Process timed out.'), timeout);
    signal?.addEventListener('abort', abort, { once: true });
    child.once('spawn', () => { try { onSpawn?.(child.pid); if (failure || signal?.aborted) stop('Process aborted.'); } catch { stop('Spawn tracking failed.'); } });
    if (signal?.aborted) abort();
    for (const [stream, capture] of [[child.stdout, true], [child.stderr, false]]) stream.setEncoding('utf8').on('data', data => {
      bytes += Buffer.byteLength(data); if (bytes > maxBuffer) { stop('Process output limit exceeded.'); return; }
      if (capture) stdout += data.toString('utf8');
    });
    child.once('error', () => stop('Process launch failed.'));
    child.once('close', async code => {
      clearTimeout(timer); signal?.removeEventListener('abort', abort);
      try { if (cleanup) await cleanup; if (failure) reject(Error(failure)); else resolveRun({ status: code, stdout }); }
      catch { reject(Error('Known child process-tree cleanup failed.')); }
    });
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
async function main() {
const claude = resolveClaudePath();
if (!existsSync(cli)) throw Error('Existing Pi CLI required; no installation performed.');
if (process.argv[2] === '--check') { console.log('Commander startup prerequisites: PASS; Claude: '+claude); return; }
const request = process.argv.slice(2).join(' ');
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
writeFileSync(join(agent, 'settings.json'), JSON.stringify({ retry: { enabled: false } }));
writeFileSync(join(agent, 'models.json'), JSON.stringify({ providers: { openrouter: { modelOverrides: { [model]: { maxTokens: 512 } } } } }));
const extension = join(toy, 'claude-worker.mjs');
writeFileSync(extension, `
import { runBounded } from ${JSON.stringify(import.meta.url)};
import { writeFileSync } from 'node:fs';
export default function(pi) {
  let dispatched = false;
  pi.registerTool({name:'claude_worker', label:'Claude Worker', description:'Delegate one synthetic text-only task to Claude CLI. No file or shell tools.',
    parameters:{type:'object',properties:{task:{type:'string',minLength:1,maxLength:2000}},required:['task'],additionalProperties:false},
    async execute(id, {task}, signal) {
      if (dispatched) throw Error('Only one worker dispatch is allowed per run.');
      dispatched = true;
      const env = {...process.env, HOME:${JSON.stringify(workerHome)}, USERPROFILE:${JSON.stringify(workerHome)}, CLAUDE_CONFIG_DIR:${JSON.stringify(workerHome)},
        ANTHROPIC_BASE_URL:'https://openrouter.ai/api', ANTHROPIC_AUTH_TOKEN:process.env.OPENROUTER_API_KEY, ANTHROPIC_API_KEY:'',
        CLAUDE_CODE_SIMPLE:'1', CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC:'1', CLAUDE_CODE_MAX_RETRIES:'0', API_TIMEOUT_MS:'20000',
        CLAUDE_CODE_MAX_OUTPUT_TOKENS:'256', DISABLE_AUTOUPDATER:'1', DISABLE_TELEMETRY:'1', DISABLE_ERROR_REPORTING:'1', DISABLE_AUTO_COMPACT:'1'};
      delete env.OPENROUTER_API_KEY;
      for (const name of ['ANTHROPIC_MODEL','ANTHROPIC_DEFAULT_FABLE_MODEL','ANTHROPIC_DEFAULT_OPUS_MODEL','ANTHROPIC_DEFAULT_SONNET_MODEL','ANTHROPIC_DEFAULT_HAIKU_MODEL','CLAUDE_CODE_SUBAGENT_MODEL']) env[name]=${JSON.stringify(model)};
      let result;
      try {
        const run = await runBounded(${JSON.stringify(claude)}, ['--bare','--restricted','-p',task,'--model',${JSON.stringify(model)},'--tools','','--disallowedTools','*','--strict-mcp-config','--setting-sources','','--no-session-persistence','--no-chrome','--max-turns','1','--output-format','json','--system-prompt','Answer only the synthetic task briefly.','--settings','{}'], {cwd:${JSON.stringify(toy)},env,signal,timeout:30000,maxBuffer:262144,onSpawn:pid=>writeFileSync(${JSON.stringify(join(toy, 'worker.pid'))},String(pid))});
        if(run.status!==0) throw Error('Worker exit failed.');
        const data=JSON.parse(run.stdout.trim());
        const observedModels=Object.keys(data.modelUsage||{});
        if(data.is_error || !data.result || observedModels.length!==1 || observedModels[0]!==${JSON.stringify(model)}) throw Error('Worker result failed.');
        const text=String(data.result).replaceAll(process.env.OPENROUTER_API_KEY,'[REDACTED]');
        result={model:${JSON.stringify(model)},observedModels,output:text,exitCode:run.status,turns:data.num_turns,toolMode:'none'};
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
try { run = await runBounded(process.execPath, [cli,'--provider','openrouter','--model',model,'--thinking','off','--tools','claude_worker','--no-extensions','-e',extension,'--no-mcp','--no-skills','--no-prompt-templates','--no-context-files','--no-themes','--no-session','--system-prompt','You are a synthetic-task Commander. Call claude_worker exactly once with the user task. Return the Worker output verbatim, with no added explanation. Do not answer before delegating.','--mode','json','-p',request], {cwd:toy,env,signal:controller.signal,timeout:60000,maxBuffer:1048576}); }
catch (error) { failure = error.message; run = {status:null,stdout:''}; }
finally {
  const pidFile = join(toy,'worker.pid');
  if (existsSync(pidFile)) { try { await killTree(Number(readFileSync(pidFile,'utf8'))); } catch { failure = 'Known Worker cleanup failed.'; } }
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
const output = join(root, 'results/p5', `pipeline-${Date.now()}`); mkdirSync(output, {recursive:true});
writeFileSync(join(output, 'evidence.json'), JSON.stringify(evidence,null,2).replaceAll(key,'[REDACTED]'));
if (existsSync(workerFile)) copyFileSync(workerFile,join(output,'worker.json'));
console.log(final.replaceAll(key,'[REDACTED]') || 'Pipeline failed before final Commander response.');
console.log('Evidence: '+output);
if (!evidence.pipelineSuccess) { console.error(evidence.failure); process.exitCode = 1; }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await main(); } catch { console.error('Commander preflight failed; verify local executable, key availability and free-model pricing.'); process.exitCode = 1; }
}
