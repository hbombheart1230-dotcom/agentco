# Models

Principle: one fixed model per run. No auto routing, no fallback, no `openrouter/free`. Switching is explicit (`--provider/--model`, `/model`).

| Role | Provider | Model ID | Selected by |
|---|---|---|---|
| **Primary baseline (default)** | `openrouter` | `nvidia/nemotron-3-ultra-550b-a55b:free` | `pi-home/settings.json` → `defaultProvider` / `defaultModel` |
| Secondary smoke only | `groq` | `openai/gpt-oss-120b` | explicit `--provider groq --model openai/gpt-oss-120b` (smoke script) |

Both are in Pi 1.0.2's built-in catalog (`--list-models`): OpenRouter nemotron-3-ultra `:free` — 1M context, 65.5K max output, thinking; Groq gpt-oss-120b — 131.1K context, 65.5K max output, thinking. Neither supports images.

Note: OpenRouter also lists the non-free `nvidia/nemotron-3-ultra-550b-a55b` (262K context). The `:free` variant is the baseline, per decision.

## Credentials

| Variable | Used for | Status |
|---|---|---|
| `OPENROUTER_API_KEY` | OpenRouter | present in `.env` (value never printed) |
| `GROQ_API_KEY` | Groq | present in `.env` (value never printed) |
| `*_BASE_URL` | optional overrides, forwarded if present | present in `.env` |

Pi consumes these natively (`docs/providers.md` in the package). `.env` also contains no other keys than these four; `.env.naver` is not loaded.

## Try a model

```
node scripts/pi.mjs --list-models nemotron
node scripts/pi.mjs --provider groq --model openai/gpt-oss-120b
```

## Caveats

- Free-tier OpenRouter models can rate-limit or be overloaded; with routing removed, such a failure surfaces as an error instead of silently switching. The smoke script retries once.
- Model availability is read from Pi's bundled catalog; with `--offline` no catalog refresh happens.
