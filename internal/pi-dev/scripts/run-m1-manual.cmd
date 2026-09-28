@echo off
setlocal
set "SCRIPT_DIR=%~dp0"

rem Wrapper for experiments/manual-playground/playground.mjs (M1 manual REPL
rem playground). Previously reachable as `npm run m1:manual` from
rem external/pi -- that required a local, uncommitted change to external/pi's
rem package.json, which blocked converting external/pi into a clean upstream
rem submodule. Migrated here instead (2026-09-28): same script, same
rem behavior, no upstream file touched.

node "%SCRIPT_DIR%..\..\..\experiments\manual-playground\playground.mjs" %*
exit /b %ERRORLEVEL%
