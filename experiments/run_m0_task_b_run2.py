"""M0 Run 2 driver — Anchor Task B, Windows + PowerShell 5.1 (execution + model-facing contract aligned).

M0 EXPERIMENTAL WORKAROUND ONLY. Not a production harness design, not a
recommended implementation pattern. Purpose: observe whether aligning the
model-facing shell contract with the actual execution shell changes the
Run 1 trajectory (Windows + cmd.exe + bash-oriented prompt = mismatched).

mini-SWE-agent source is NOT modified. This script achieves the "patch"
entirely via:
  1. Execution contract: os.environ["COMSPEC"] set to powershell.exe before
     any subprocess call — LocalEnvironment's `_run()` (environments/local.py)
     relies on subprocess.Popen(shell=True) with no explicit `executable=`,
     which on Windows resolves the shell via the process's real COMSPEC env
     var (empirically verified: overriding it only in Popen's `env=` dict
     does NOT work; mutating the actual process os.environ does).
  2. Model-facing contract: agent_cfg["system_template"]/["instance_template"]
     overridden with a PowerShell-aware version (config values only).
  3. Tool description: minisweagent.models.openrouter_model.BASH_TOOL is
     monkeypatched (module-attribute rebind, not a file edit) to describe
     PowerShell. The JSON-schema `name` field is kept as "bash" because
     minisweagent.models.utils.actions_toolcall.parse_toolcall_actions
     hardcodes acceptance of the literal string "bash" — renaming it would
     require overriding that parser too, which is out of scope for a
     minimal patch. This is the "가능한 범위" limitation, documented here.
"""

import os
import sys
from pathlib import Path

import yaml
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "external" / "mini-swe-agent" / "src"))

load_dotenv(ROOT / ".env")

# --- Execution contract: force PowerShell as the shell=True target on this Windows host ---
os.environ["COMSPEC"] = r"C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe"

from minisweagent import package_dir  # noqa: E402
from minisweagent.agents.default import DefaultAgent  # noqa: E402
from minisweagent.environments.local import LocalEnvironment  # noqa: E402
from minisweagent.models import openrouter_model  # noqa: E402
from minisweagent.models.openrouter_model import OpenRouterModel  # noqa: E402

# --- Model-facing contract: tool description (name kept as "bash" for parser compatibility) ---
POWERSHELL_TOOL = {
    "type": "function",
    "function": {
        "name": "bash",  # kept for actions_toolcall.parse_toolcall_actions's hardcoded name check
        "description": "Execute a PowerShell command",
        "parameters": {
            "type": "object",
            "properties": {
                "command": {
                    "type": "string",
                    "description": "The PowerShell command to execute",
                }
            },
            "required": ["command"],
        },
    },
}
openrouter_model.BASH_TOOL = POWERSHELL_TOOL  # module-attribute rebind, no file changes

FIXTURE_DIR = ROOT / "toy-tasks" / "v0" / "task_B_fix_failing_test"
OUTPUT_PATH = Path(__file__).resolve().parent / "M0_task_B_run2.traj.json"

TASK = (
    "There is a failing test in tests/test_calc.py. Make it pass. "
    "Do not modify the test file."
)

MODEL_NAME = "z-ai/glm-5.3-flash"

# --- Model-facing contract: PowerShell-aware system/instance templates ---
# Same structure/workflow as mini.yaml (unchanged: 6-step recommended workflow,
# command-execution rules, submit instruction) — only the shell-specific parts
# are swapped: bash -> PowerShell, heredoc/sed/`/dev/null` removed, replaced
# with the idioms verified working in source-trace testing (Set-Content,
# Add-Content, Get-Content, -replace, 2>$null). Here-strings are deliberately
# NOT included as an example (verified broken via this shell=True pipeline).
SYSTEM_TEMPLATE = "You are a helpful assistant that can interact with a computer."

INSTANCE_TEMPLATE = """Please solve this issue: {{task}}

You are working on Windows. Shell: Windows PowerShell 5.1.
You can execute PowerShell commands and edit files to implement the necessary changes.
Commands must use PowerShell syntax. Do NOT use bash/POSIX syntax (no heredocs, no /dev/null, no bash-only redirection).

## Recommended Workflow

This workflow should be done step-by-step so that you can iterate on your changes and any possible problems.

1. Analyze the codebase by finding and reading relevant files
2. Create a script to reproduce the issue
3. Edit the source code to resolve the issue
4. Verify your fix works by running your script again
5. Test edge cases to ensure your fix is robust
6. Submit your changes and finish your work by issuing the following command: `echo COMPLETE_TASK_AND_SUBMIT_FINAL_OUTPUT`.
   Do not combine it with any other command. <important>After this command, you cannot continue working on this task.</important>

## Command Execution Rules

You are operating in an environment where

1. You issue at least one command
2. The system executes the command(s) in a new PowerShell process
3. You see the result(s)
4. You write your next command(s)

Each response should include:

1. **Reasoning text** where you explain your analysis and plan
2. At least one tool call with your command

**CRITICAL REQUIREMENTS:**

- Your response SHOULD include reasoning text explaining what you're doing
- Your response MUST include AT LEAST ONE PowerShell tool call
- Directory or environment variable changes are not persistent. Every action is executed in a new process.
- You can chain multiple statements in one command with `;` (PowerShell supports `;` as a statement separator)
- Submit your changes and finish your work by issuing the following command: `echo COMPLETE_TASK_AND_SUBMIT_FINAL_OUTPUT`
  Do not combine it with any other command. <important>After this command, you cannot continue working on this task.</important>

Example of a CORRECT response:
<example_response>
I need to understand the structure of the repository first. Let me check what files are in the current directory to get a better understanding of the codebase.

[Makes tool call with {"command": "Get-ChildItem"} as arguments]
</example_response>

<system_information>
{{system}} {{release}} {{version}} {{machine}}
</system_information>

## Useful PowerShell command examples

### Read a file:

```powershell
Get-Content file.py
```

### Create/overwrite a file:

```powershell
Set-Content -Path newfile.py -Value "line1"
Add-Content -Path newfile.py -Value "line2"
```

### Replace text in a file:

```powershell
(Get-Content file.py) -replace 'old_string','new_string' | Set-Content file.py
```

### Suppress errors:

```powershell
Get-ChildItem nonexistent 2>$null
```

### Run tests:

```powershell
python -m pytest -q
```

### Any other command you want to run

```powershell
anything
```
"""

agent_cfg = yaml.safe_load((package_dir / "config" / "mini.yaml").read_text())["agent"]
agent_cfg.pop("mode", None)  # InteractiveAgent-only field; DefaultAgent has no such field/prompt.
agent_cfg["system_template"] = SYSTEM_TEMPLATE
agent_cfg["instance_template"] = INSTANCE_TEMPLATE
# Identical control variables to Run 1.
agent_cfg["cost_limit"] = 0.50
agent_cfg["step_limit"] = 15
agent_cfg["output_path"] = OUTPUT_PATH

model = OpenRouterModel(model_name=MODEL_NAME)  # captures OPENROUTER_API_KEY into self._api_key now

# Same credential scrub as Run 1 — prevents the agent's PowerShell commands from
# inheriting OPENROUTER_API_KEY / NAVER_* via LocalEnvironment's os.environ passthrough.
for _leaked_key in ("OPENROUTER_API_KEY", "OPENROUTER_BASE_URL", "NAVER_CLIENT_ID", "NAVER_CLIENT_SECRET"):
    os.environ.pop(_leaked_key, None)

env = LocalEnvironment(cwd=str(FIXTURE_DIR))
agent = DefaultAgent(model, env, **agent_cfg)

result = agent.run(TASK)
print("=== exit_status:", result.get("exit_status"))
print("=== submission:", result.get("submission"))
print(f"=== cost: ${agent.cost:.4f}  calls: {agent.n_calls}")
print(f"=== trajectory saved to: {OUTPUT_PATH}")
