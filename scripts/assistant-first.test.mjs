import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import checkpoint from '../pi-dev/extensions/git-checkpoint.ts';
import {loadProjectContextFiles} from '../node_modules/@earendil-works/pi-coding-agent/dist/core/resource-loader.js';
const root=resolve(import.meta.dirname,'..');
function fixture(enabled){
 const handlers={},flags={},commands=[],entries=[];
 checkpoint({registerFlag:(name,options)=>flags[name]=options,getFlag:name=>enabled??flags[name]?.default,on:(name,fn)=>handlers[name]=fn,
  exec:async(file,args)=>{commands.push([file,...args]);return {code:0,stdout:args[0]==='stash'?'fixture-ref':'true'};},appendEntry:(type,data)=>entries.push({type,data})});
 return {handlers,flags,commands,entries};
}
test('assistant-first: default greeting turn makes zero checkpoint Git/session calls',async()=>{
 const f=fixture();await f.handlers.agent_start();await f.handlers.agent_end({}, {sessionManager:{getBranch:()=>{throw Error('No session inspection expected.');}}});
 assert.equal(f.flags['agentco-checkpoints'].default,false);assert.deepEqual(f.commands,[]);assert.deepEqual(f.entries,[]);
});
test('assistant-first: explicit development flag retains original checkpoint creation and recording',async()=>{
 const f=fixture(true);await f.handlers.agent_start();await f.handlers.agent_end({}, {sessionManager:{getBranch:()=>[{id:'fixture-user',type:'message',message:{role:'user'}}]}});
 assert.deepEqual(f.commands,[['git','rev-parse','--is-inside-work-tree'],['git','stash','create'],['git','update-ref','refs/agentco-checkpoints/fixture-user','fixture-ref']]);
 assert.deepEqual(f.entries,[{type:'agentco-checkpoint',data:{entryId:'fixture-user',ref:'fixture-ref'}}]);
});
test('assistant-first: installed Pi loader includes scoped global rules and canonical root rules',()=>{
 const files=loadProjectContextFiles({cwd:root,agentDir:join(root,'pi-dev')});
 assert.deepEqual(files.map(f=>resolve(f.path)),[join(root,'pi-dev/AGENTS.md'),join(root,'AGENTS.md')]);
 assert.match(files[0].content,/Only for explicitly requested Agentco development/);
 assert.match(files[1].content,/Default: personal assistant/);assert.match(files[1].content,/Development mode: explicitly requested/);
});
test('assistant-first: Claude uses native canonical import; development entry remains conditional',()=>{
 assert.equal(readFileSync(join(root,'CLAUDE.md'),'utf8').trim(),'@AGENTS.md');
 const policy=readFileSync(join(root,'AGENTS.md'),'utf8');assert.match(policy,/Do \*\*not\*\* automatically open/);
 assert.match(policy,/Only then\*\* start at `docs\/CURRENT_TASK.md`/);assert.match(policy,/Codex implements\/tests\/commits\/pushes; Claude independently verifies/);
});
