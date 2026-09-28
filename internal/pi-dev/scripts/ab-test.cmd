@echo off
setlocal enabledelayedexpansion
set "SCRIPT_DIR=%~dp0"
set "CONFIG_DIR=%SCRIPT_DIR%..\config"
set "REPO_ROOT=%SCRIPT_DIR%..\..\..\"
set "PI_CLI=%REPO_ROOT%external\pi\packages\coding-agent\dist\bundle\cli.js"
set "ENV_FILE=%REPO_ROOT%.env"
set "TOOLS=read,edit,write,ls,grep,find,powershell"

rem Diagnostic-only script: isolates whether response duplication is specific to
rem the internal-vllm provider by running the exact same PC/package/Pi
rem version/toolset/launcher construction against OpenRouter instead. Not part
rem of the production run-glm.cmd path.
rem
rem Migrated from internal/pi-dev-user/ab-test.cmd during the 2026-09-28
rem internal/ consolidation (pi-dev-user/pi-dev-AY retired) -- adapted from
rem the self-contained runtime\node\node.exe + runtime\pi\dist\bundle\cli.js
rem paths to pi-dev's own external/pi dev-build paths (same pattern
rem run-glm.cmd already uses), logic otherwise unchanged.
rem
rem Usage:
rem   ab-test.cmd internal              (interactive TUI, regular mode)
rem   ab-test.cmd internal -p "prompt"  (print mode, single response)
rem   ab-test.cmd internal --json "prompt"  (JSON event mode)
rem   ab-test.cmd internal --fullscreen (interactive TUI, alt-screen/fullscreen mode --
rem                                      full repaint instead of differential rendering,
rem                                      try this if regular TUI shows duplicated/stale text)
rem   ab-test.cmd internal --tui [extra Pi CLI args...]
rem                                     (explicit interactive TUI, regular mode. Same as
rem                                      no-second-arg, but forwards any trailing args
rem                                      straight to the Pi CLI -- for manual PoC checks
rem                                      that need e.g. --extension/--tools overrides.
rem                                      If the trailing args contain --extension, the
rem                                      default --no-extensions is dropped; if they
rem                                      contain --tools, the default --tools list is
rem                                      dropped, so the override wins instead of
rem                                      colliding with it.)
rem   ab-test.cmd openrouter [same options]
rem
rem Example (Extension PoC manual TUI check):
rem   ab-test.cmd openrouter --tui --extension config\extensions\pi-dev-info.ts --tools read,edit,write,ls,grep,find,powershell,get_pi_dev_environment

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

set "PROVIDER=%~1"
if /I not "%PROVIDER%"=="internal" if /I not "%PROVIDER%"=="openrouter" (
	echo Usage: ab-test.cmd internal^|openrouter [-p "prompt"] [--json "prompt"] [--tui [extra args...]]
	exit /b 1
)

if /I "%PROVIDER%"=="internal" (
	set "TMP_MODEL_ARG=%TEMP%\pi_ab_model_arg_%RANDOM%.txt"
	"!NODE_EXE!" "%SCRIPT_DIR%check-config.mjs" "%CONFIG_DIR%\models.json" --print-model-arg > "!TMP_MODEL_ARG!" 2>nul
	set "MODEL_ARG="
	set /p MODEL_ARG=<"!TMP_MODEL_ARG!"
	del "!TMP_MODEL_ARG!" >nul 2>nul
	if not defined MODEL_ARG (
		echo [ERROR] internal-vllm config not ready. Run run-glm.cmd once to see details.
		exit /b 1
	)
) else (
	if not exist "%ENV_FILE%" (
		echo [ERROR] .env not found at "%ENV_FILE%" -- OPENROUTER_API_KEY needed for the A/B baseline.
		exit /b 1
	)
	set "OPENROUTER_API_KEY="
	for /f "usebackq tokens=1,* delims==" %%A in ("%ENV_FILE%") do (
		if "%%A"=="OPENROUTER_API_KEY" set "OPENROUTER_API_KEY=%%B"
	)
	if not defined OPENROUTER_API_KEY (
		echo [ERROR] OPENROUTER_API_KEY not found in .env
		exit /b 1
	)
	set "MODEL_ARG=openrouter/z-ai/glm-5.3-flash"
)

set "PI_CODING_AGENT_DIR=%CONFIG_DIR%"
set "SECOND=%~2"

if /I "%SECOND%"=="-p" (
	echo [A/B] provider=%PROVIDER% model=%MODEL_ARG% mode=print
	"!NODE_EXE!" "%PI_CLI%" --model %MODEL_ARG% --tools %TOOLS% --no-extensions --offline -p "%~3"
	exit /b %ERRORLEVEL%
)

if /I "%SECOND%"=="--json" (
	echo [A/B] provider=%PROVIDER% model=%MODEL_ARG% mode=json
	"!NODE_EXE!" "%PI_CLI%" --model %MODEL_ARG% --tools %TOOLS% --no-extensions --offline --mode json -p "%~3"
	exit /b %ERRORLEVEL%
)

if /I "%SECOND%"=="--fullscreen" (
	echo [A/B] provider=%PROVIDER% model=%MODEL_ARG% mode=tui-fullscreen
	"!NODE_EXE!" "%PI_CLI%" --model %MODEL_ARG% --tools %TOOLS% --no-extensions --offline --tui-mode fullscreen
	exit /b %ERRORLEVEL%
)

if /I "%SECOND%"=="--tui" goto :tui_manual

echo [A/B] provider=%PROVIDER% model=%MODEL_ARG% mode=tui
"!NODE_EXE!" "%PI_CLI%" --model %MODEL_ARG% --tools %TOOLS% --no-extensions --offline
exit /b %ERRORLEVEL%

:tui_manual
rem shift is unreliable inside a parenthesized if-block in cmd.exe (params can
rem freeze mid-block), so the trailing-arg collection loop lives here instead,
rem outside any parentheses.
shift
shift
set "EXTRA_ARGS="
:collect_extra
if "%~1"=="" goto :extra_done
set "EXTRA_ARGS=!EXTRA_ARGS! %1"
shift
goto :collect_extra
:extra_done

set "TOOLS_ARG=--tools %TOOLS%"
set "NO_EXT_ARG=--no-extensions"
echo !EXTRA_ARGS! | findstr /I /C:"--extension" >nul
if !ERRORLEVEL! EQU 0 set "NO_EXT_ARG="
echo !EXTRA_ARGS! | findstr /I /C:"--tools" >nul
if !ERRORLEVEL! EQU 0 set "TOOLS_ARG="

echo [A/B] provider=%PROVIDER% model=%MODEL_ARG% mode=tui-manual extra="!EXTRA_ARGS!"
"!NODE_EXE!" "%PI_CLI%" --model %MODEL_ARG% !TOOLS_ARG! !NO_EXT_ARG! --offline !EXTRA_ARGS!
exit /b %ERRORLEVEL%
