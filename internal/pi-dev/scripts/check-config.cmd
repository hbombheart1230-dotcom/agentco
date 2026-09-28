@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
set "CONFIG_DIR=%SCRIPT_DIR%..\config"

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
	set "NODE_EXE=node"
) else (
	set "NODE_EXE=%LOCALAPPDATA%\Programs\node-v24.20.0-win-x64\node.exe"
	if not exist "%NODE_EXE%" (
		echo [ERROR] Node.js executable not found on PATH or at "%NODE_EXE%".
		exit /b 1
	)
)

"%NODE_EXE%" "%SCRIPT_DIR%check-config.mjs" "%CONFIG_DIR%\models.json"
exit /b %ERRORLEVEL%
