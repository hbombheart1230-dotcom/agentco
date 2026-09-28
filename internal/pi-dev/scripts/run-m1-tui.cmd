@echo off
setlocal
set "SCRIPT_DIR=%~dp0"

rem Wrapper for experiments/pi-tui-playground/launch-tui.mjs (M1 native TUI
rem playground launcher). Previously reachable as `npm run m1:tui` from
rem external/pi -- that required a local, uncommitted change to external/pi's
rem package.json, which blocked converting external/pi into a clean upstream
rem submodule. Migrated here instead (2026-09-28): same script, same
rem behavior, no upstream file touched.

node "%SCRIPT_DIR%..\..\..\experiments\pi-tui-playground\launch-tui.mjs" %*
exit /b %ERRORLEVEL%
