"""M0 driver script — runs mini-SWE-agent's public Python API against Toy Task B.

This does NOT modify the mini-swe-agent source. It mirrors the official
`hello_world.py` "python bindings" example, but:
  - uses OpenRouterModel (dedicated OpenRouter class) instead of LitellmModel,
    per MODEL_SERVING_STRATEGY_v0.md section 4 (M0 baseline: GLM 5.3 Flash via OpenRouter)
  - loads the *real* mini.yaml agent config (structured tool-calling prompt),
    not hello_world.py's default.yaml (which is a text-based-action prompt and
    appears mismatched with LitellmModel's structured tool-call parser — noted
    as a side-observation, not something this script relies on)

Bypasses `mini` CLI / run/mini.py entirely because importing it
(minisweagent.agents.utils.prompt_user) unconditionally instantiates a
prompt_toolkit PromptSession at module import time, which requires a real
TTY and crashes in this non-interactive shell environment. This is an
Environment/Harness integration finding, recorded in
experiments/M0_mini_swe_agent.md, not a Model or Serving issue.
"""

import os
import sys
from pathlib import Path

import yaml
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "external" / "mini-swe-agent" / "src"))

# Load this project's .env (holds OPENROUTER_API_KEY, plus unrelated secrets e.g. NAVER_*).
load_dotenv(ROOT / ".env")

from minisweagent import package_dir  # noqa: E402
from minisweagent.agents.default import DefaultAgent  # noqa: E402
from minisweagent.environments.local import LocalEnvironment  # noqa: E402
from minisweagent.models.openrouter_model import OpenRouterModel  # noqa: E402

FIXTURE_DIR = ROOT / "toy-tasks" / "v0" / "task_B_fix_failing_test"
OUTPUT_PATH = Path(__file__).resolve().parent / "M0_task_B_run1.traj.json"

TASK = (
    "There is a failing test in tests/test_calc.py. Make it pass. "
    "Do not modify the test file."
)

MODEL_NAME = "z-ai/glm-5.3-flash"  # OpenRouter model identifier — TO VERIFY (see M0_mini_swe_agent.md)

agent_cfg = yaml.safe_load((package_dir / "config" / "mini.yaml").read_text())["agent"]
agent_cfg.pop("mode", None)  # "mode: confirm" in mini.yaml is an InteractiveAgent-only field; DefaultAgent has no such field/prompt.
# Safety caps for this first paid smoke run (mini.yaml default cost_limit=3.0, step_limit=0/unlimited).
agent_cfg["cost_limit"] = 0.50
agent_cfg["step_limit"] = 15
agent_cfg["output_path"] = OUTPUT_PATH

model = OpenRouterModel(model_name=MODEL_NAME)  # captures OPENROUTER_API_KEY into self._api_key now

# Scrub secrets from the process env BEFORE the agent's bash tool can see them.
# LocalEnvironment.execute() passes `os.environ | config.env` into every command the
# LLM-controlled agent runs — without this, the agent (and its trajectory log, which
# gets fed back into the model's own context) could read OPENROUTER_API_KEY / NAVER_*
# via `env` or `echo $VAR`. OpenRouterModel already captured the key above, so this is safe.
for _leaked_key in ("OPENROUTER_API_KEY", "OPENROUTER_BASE_URL", "NAVER_CLIENT_ID", "NAVER_CLIENT_SECRET"):
    os.environ.pop(_leaked_key, None)

env = LocalEnvironment(cwd=str(FIXTURE_DIR))
agent = DefaultAgent(model, env, **agent_cfg)

result = agent.run(TASK)
print("=== exit_status:", result.get("exit_status"))
print("=== submission:", result.get("submission"))
print(f"=== cost: ${agent.cost:.4f}  calls: {agent.n_calls}")
print(f"=== trajectory saved to: {OUTPUT_PATH}")
