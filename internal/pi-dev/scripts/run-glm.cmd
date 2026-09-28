@echo off
setlocal enabledelayedexpansion
set "SCRIPT_DIR=%~dp0"
set "CONFIG_DIR=%SCRIPT_DIR%..\config"
set "REPO_ROOT=%SCRIPT_DIR%..\..\..\"
set "PI_CLI=%REPO_ROOT%external\pi\packages\coding-agent\dist\bundle\cli.js"
set "EXTENSION_PATH=%SCRIPT_DIR%scrub-powershell-credentials.js"
set "WEB_SEARCH_EXTENSION_PATH=%CONFIG_DIR%\extensions\pi-dev-web-search.ts"
set "NAVER_ENV_FILE=%REPO_ROOT%.env.naver"

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

set "TMP_MODEL_ARG=%TEMP%\pi_dev_model_arg_%RANDOM%.txt"
"!NODE_EXE!" "%SCRIPT_DIR%check-config.mjs" "%CONFIG_DIR%\models.json" --print-model-arg > "%TMP_MODEL_ARG%" 2>nul
set "MODEL_ARG="
set /p MODEL_ARG=<"%TMP_MODEL_ARG%"
del "%TMP_MODEL_ARG%" >nul 2>nul

if not defined MODEL_ARG (
	echo [ERROR] config\models.json is not ready yet. Details:
	echo.
	"!NODE_EXE!" "%SCRIPT_DIR%check-config.mjs" "%CONFIG_DIR%\models.json"
	echo.
	echo See config\SET_INTERNAL_VALUES.md for what to edit.
	exit /b 1
)

set "PI_CODING_AGENT_DIR=%CONFIG_DIR%"

rem web_search tool (pi-dev-web-search extension, Naver Search API) needs
rem NAVER_CLIENT_ID/NAVER_CLIENT_SECRET in the environment. Load them from
rem .env.naver if not already set (same pattern ab-test.cmd uses for
rem OPENROUTER_API_KEY). If they're still missing, the tool itself fails
rem cleanly per-call (isError: true) rather than blocking startup -- web
rem search just won't be usable, everything else still works.
if not defined NAVER_CLIENT_ID (
	if exist "%NAVER_ENV_FILE%" (
		for /f "usebackq tokens=1,* delims==" %%A in ("%NAVER_ENV_FILE%") do (
			if "%%A"=="NAVER_CLIENT_ID" set "NAVER_CLIENT_ID=%%B"
			if "%%A"=="NAVER_CLIENT_SECRET" set "NAVER_CLIENT_SECRET=%%B"
		)
	)
)

echo Starting Pi native TUI (model: %MODEL_ARG%)...
"!NODE_EXE!" "%PI_CLI%" --model %MODEL_ARG% --tools read,edit,write,ls,grep,find,powershell,web_search --no-extensions --extension "%EXTENSION_PATH%" --extension "%WEB_SEARCH_EXTENSION_PATH%" --offline
exit /b %ERRORLEVEL%
