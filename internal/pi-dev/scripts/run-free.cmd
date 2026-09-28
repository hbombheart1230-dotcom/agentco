@echo off
setlocal enabledelayedexpansion
set "SCRIPT_DIR=%~dp0"
set "CONFIG_DIR=%SCRIPT_DIR%..\config"
set "REPO_ROOT=%SCRIPT_DIR%..\..\..\"
set "PI_CLI=%REPO_ROOT%external\pi\packages\coding-agent\dist\bundle\cli.js"
set "ENV_FILE=%REPO_ROOT%.env"
set "WEB_SEARCH_EXTENSION_PATH=%CONFIG_DIR%\extensions\pi-dev-web-search.ts"
set "NAVER_ENV_FILE=%REPO_ROOT%.env.naver"

rem OpenRouter free-tier model runner (migrated from internal/pi-dev-AY during
rem the 2026-09-28 internal/ consolidation -- pi-dev-AY retired, this and
rem check-model.mjs are its only reusable parts, moved here unchanged since
rem the path layout was already identical). No internal vLLM endpoint
rem involved at all -- "openrouter" is a Pi native built-in provider (source:
rem external/pi/packages/coding-agent/src/core/model-resolver.ts), resolvable
rem via --model openrouter/<model-id> plus OPENROUTER_API_KEY alone. No
rem models.json entry is required for this to work.
rem
rem Fallback chain: Pi has no native "pick another model if this one is
rem down" mechanism (its own retry logic only retries the SAME model/provider
rem on transient errors like 429 -- see PATCHNOTE/README for the source
rem citations). An *interactive* TUI session also never "exits" on a model
rem error, so there is nothing a wrapper script could react to mid-session.
rem The fix: probe each pre-verified candidate with a cheap, tool-free
rem liveness check (check-model.mjs) BEFORE starting the real interactive
rem session, and launch the TUI with the first one that actually responds.
rem Candidates below were all individually confirmed with a real end-to-end
rem tool-call test (2026-09-11). Known-dead candidates (live 404 despite
rem being listed ":free" in Pi's catalog snapshot: minimax-m3:free,
rem minimax-m2.7:free; live 429 shared-pool exhaustion even after 3 native
rem retries: google/gemma-4-31b-it:free) are deliberately excluded -- see
rem README.md for the full list and how to re-verify/add more.
rem
rem Pass an explicit model to skip the fallback probing entirely and use
rem exactly that model:
rem   run-free.cmd "openrouter/<other-model>:free"
set "CANDIDATES=openrouter/nvidia/nemotron-3-super-120b-a12b:free openrouter/nvidia/nemotron-3.5-lightning:free openrouter/nvidia/nemotron-3-ultra-550b-a55b:free openrouter/thinkingmachines/inkling:free"

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
	set "NODE_EXE=node"
) else (
	set "NODE_EXE=%LOCALAPPDATA%\Programs\node-v24.20.0-win-x64\node.exe"
	if not exist "!NODE_EXE!" (
		echo [ERROR] Node.js executable not found on PATH or at "!NODE_EXE!".
		echo Install Node.js ^(or add it to PATH^) and retry.
		exit /b 1
	)
)

if not exist "%PI_CLI%" (
	echo [ERROR] Pi CLI bundle not found at "%PI_CLI%".
	echo Build it first: cd external\pi ^&^& npm.cmd run build
	exit /b 1
)

if not defined OPENROUTER_API_KEY (
	if not exist "%ENV_FILE%" (
		echo [ERROR] OPENROUTER_API_KEY is not set, and no .env found at "%ENV_FILE%".
		echo Set it for this session with:  set OPENROUTER_API_KEY=your-key-here
		echo Or add OPENROUTER_API_KEY=... to "%ENV_FILE%".
		exit /b 1
	)
	for /f "usebackq tokens=1,* delims==" %%A in ("%ENV_FILE%") do (
		if "%%A"=="OPENROUTER_API_KEY" set "OPENROUTER_API_KEY=%%B"
	)
	if not defined OPENROUTER_API_KEY (
		echo [ERROR] OPENROUTER_API_KEY not found in "%ENV_FILE%" and not set in the environment.
		exit /b 1
	)
)

if not "%~1"=="" (
	set "MODEL_ARG=%~1"
	goto :model_selected
)

echo Probing free-tier candidates for a live model (cheap, tool-free liveness check each)...
set "FOUND_MODEL="
for %%M in (%CANDIDATES%) do (
	if not defined FOUND_MODEL (
		"%NODE_EXE%" "%SCRIPT_DIR%check-model.mjs" "%NODE_EXE%" "%PI_CLI%" %%M "%CONFIG_DIR%" 1>nul
		if !ERRORLEVEL! EQU 0 (
			set "FOUND_MODEL=%%M"
		) else (
			echo   %%M -- unavailable, trying next candidate...
		)
	)
)

if not defined FOUND_MODEL (
	echo [ERROR] All candidate free models failed the liveness check right now.
	echo Try again later, or pass a specific model directly: run-free.cmd "openrouter/<model>:free"
	echo See README.md for the candidate list and how to re-verify/add more.
	exit /b 1
)
set "MODEL_ARG=%FOUND_MODEL%"

:model_selected
set "PI_CODING_AGENT_DIR=%CONFIG_DIR%"

rem web_search tool (pi-dev-web-search extension, Naver Search API) needs
rem NAVER_CLIENT_ID/NAVER_CLIENT_SECRET in the environment. Load from
rem .env.naver if not already set. If still missing, the tool fails cleanly
rem per-call rather than blocking startup.
if not defined NAVER_CLIENT_ID (
	if exist "%NAVER_ENV_FILE%" (
		for /f "usebackq tokens=1,* delims==" %%A in ("%NAVER_ENV_FILE%") do (
			if "%%A"=="NAVER_CLIENT_ID" set "NAVER_CLIENT_ID=%%B"
			if "%%A"=="NAVER_CLIENT_SECRET" set "NAVER_CLIENT_SECRET=%%B"
		)
	)
)

echo Starting Pi native TUI (model: %MODEL_ARG%, OpenRouter free tier)...
echo Note: free-tier rate limits and response quality vary by model -- see README.md.
"%NODE_EXE%" "%PI_CLI%" --model %MODEL_ARG% --tools read,edit,write,ls,grep,find,powershell,web_search --no-extensions --extension "%WEB_SEARCH_EXTENSION_PATH%" --offline
exit /b %ERRORLEVEL%
