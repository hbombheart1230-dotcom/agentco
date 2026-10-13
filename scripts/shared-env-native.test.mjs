import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,copyFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
const launcher=new URL('./agentco.mjs',import.meta.url).href;
// Source-only copy and generated dummy .env; never copy the canonical credential file.
function fixture(present){
 mkdirSync('results/p5-9',{recursive:true});const area=mkdtempSync(join(process.cwd(),'results/p5-9/dummy-root-'));mkdirSync(join(area,'scripts'));
 copyFileSync('scripts/env.mjs',join(area,'scripts/env.mjs'));
 if(present)writeFileSync(join(area,'.env'),'OPENROUTER_API_KEY="fixture-root-only"\nUNRELATED_SECRET=not-whitelisted\n');
 writeFileSync(join(area,'runner.mjs'),`import {piEnv} from './scripts/env.mjs';import {mainEnvironment,mainPlan} from ${JSON.stringify(launcher)};
 const before=process.env.OPENROUTER_API_KEY;const rows=[];
 for(const main of ['claude','codex','hermes']){try{const env=mainEnvironment(main,{},piEnv),plan=mainPlan(main,[],{[main]:()=> 'fixture.exe'});rows.push({main,keyMatches:env.OPENROUTER_API_KEY==='fixture-root-only',unrelatedAbsent:env.UNRELATED_SECRET===undefined,parentUnchanged:process.env.OPENROUTER_API_KEY===before,tokenNotInArgv:!JSON.stringify(plan).includes('fixture-root-only'),claudeBearerCorrect:main!=='claude'||env.ANTHROPIC_AUTH_TOKEN==='fixture-root-only',priceOverridesAbsent:!plan.args.includes('-c')});}catch{rows.push({main,status:'KEY_MISSING'});}}
 console.log(JSON.stringify(rows));`);
 const env={...process.env};for(const name of ['OPENROUTER_API_KEY','OPENROUTER_BASE_URL','GROQ_API_KEY','GROQ_BASE_URL'])delete env[name];
 return JSON.parse(execFileSync(process.execPath,[join(area,'runner.mjs')],{cwd:area,env,encoding:'utf8',timeout:10000}));
}
test('P5.9: existing root loader hydrates all three native children without copying credentials or argv',()=>{
 const rows=fixture(true);assert.equal(rows.length,3);for(const r of rows)assert.deepEqual(r,{main:r.main,keyMatches:true,unrelatedAbsent:true,parentUnchanged:true,tokenNotInArgv:true,claudeBearerCorrect:true,priceOverridesAbsent:true});
});
test('P5.9: absent dummy-root key gives accurate non-Pi configuration error',()=>{
 assert.deepEqual(fixture(false),['claude','codex','hermes'].map(main=>({main,status:'KEY_MISSING'})));
});
