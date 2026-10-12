// Isolated Pi Commander -> text-only Claude Worker. No production settings changes.
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, existsSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cli = join(root, 'node_modules/@earendil-works/pi-coding-agent/dist/cli.js');
const claude = join(process.env.LOCALAPPDATA || '', 'Microsoft/WinGet/Links/claude.exe');
const model = 'nvidia/nemotron-3-super-120b-a12b:free';
if (!existsSync(cli) || !existsSync(claude)) throw Error('Existing Pi/Claude CLI required; no installation performed.');
if (process.argv[2] === '--check') { console.log('Commander startup prerequisites: PASS'); process.exit(0); }
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
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
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
        const {stdout} = await promisify(execFile)(${JSON.stringify(claude)}, ['--bare','--restricted','-p',task,'--model',${JSON.stringify(model)},'--tools','','--disallowedTools','*','--strict-mcp-config','--setting-sources','','--no-session-persistence','--no-chrome','--max-turns','1','--output-format','json','--system-prompt','Answer only the synthetic task briefly.','--settings','{}'], {cwd:${JSON.stringify(toy)},env,signal,timeout:30000,maxBuffer:262144});
        const data=JSON.parse(stdout.trim());
        const observedModels=Object.keys(data.modelUsage||{});
        if(data.is_error || !data.result || observedModels.length!==1 || observedModels[0]!==${JSON.stringify(model)}) throw Error('Worker result failed.');
        const text=String(data.result).replaceAll(process.env.OPENROUTER_API_KEY,'[REDACTED]');
        result={model:${JSON.stringify(model)},observedModels,output:text,turns:data.num_turns,toolMode:'none'};
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
const run = spawnSync(process.execPath, [cli,'--provider','openrouter','--model',model,'--thinking','off','--tools','claude_worker','--no-extensions','-e',extension,'--no-mcp','--no-skills','--no-prompt-templates','--no-context-files','--no-themes','--no-session','--system-prompt','You are a synthetic-task Commander. Call claude_worker exactly once with the user task. Then report its returned result. Do not answer before delegating.','--mode','json','-p',request], {cwd:toy,env,encoding:'utf8',timeout:60000,maxBuffer:1048576});
const events = (run.stdout || '').split('\n').flatMap(line => { try { return [JSON.parse(line)]; } catch { return []; } });
const messages = events.filter(e => e.type === 'message_end' && e.message?.role === 'assistant').map(e => e.message);
const final = messages.at(-1)?.content?.filter(c => c.type === 'text').map(c => c.text).join('') || '';
const workerFile = join(toy, 'worker.json');
const evidence = { model, commanderModels:[...new Set(messages.map(m=>m.model))], pricing, exitCode:run.status, elapsedSeconds:(Date.now()-started)/1000, worker:existsSync(workerFile)?JSON.parse(readFileSync(workerFile,'utf8')):null,
  commanderCalls:messages.flatMap(m=>m.content||[]).filter(c=>c.type==='toolCall').map(c=>({name:c.name,arguments:c.arguments})),
  returnedToolResults:events.filter(e=>e.type==='message_end'&&e.message?.role==='toolResult').map(e=>({name:e.message.toolName,content:e.message.content})), final, fixture:'owned external synthetic directory', httpRequests:'unobserved', providerBilling:'unverified' };
const output = join(root, 'results/p5', `pipeline-${Date.now()}`); mkdirSync(output, {recursive:true});
writeFileSync(join(output, 'evidence.json'), JSON.stringify(evidence,null,2).replaceAll(key,'[REDACTED]'));
if (existsSync(workerFile)) copyFileSync(workerFile,join(output,'worker.json'));
console.log(final.replaceAll(key,'[REDACTED]') || 'Pipeline failed before final Commander response.');
console.log('Evidence: '+output);
if (run.status !== 0 || !evidence.worker || !final || evidence.commanderCalls.length !== 1 || evidence.commanderCalls[0]?.name !== 'claude_worker' || evidence.commanderModels.some(m=>m!==model) || !evidence.returnedToolResults.some(r=>r.name==='claude_worker')) process.exitCode = 1;
