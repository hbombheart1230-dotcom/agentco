@echo off
setlocal enabledelayedexpansion
set "SCRIPT_DIR=%~dp0"
set "TEMPLATE_DIR=%SCRIPT_DIR%..\samples-template"
set "SAMPLES_DIR=%SCRIPT_DIR%..\samples"

rem samples/ is runtime-generated from samples-template/ (source-controlled,
rem the canonical fixture) -- this avoids a permanent nested .git inside the
rem root Git repository. samples-template/ is tracked by root Git;
rem samples/ is gitignored and gets its OWN throwaway git repo re-created
rem here each time, purely so a benchmark run can freely modify files and
rem this script can `git reset --hard` them back to baseline.

where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
	echo [ERROR] Git not found on PATH.
	echo samples-template\ -^> samples\ copy + local git baseline needs Git.
	exit /b 1
)

if not exist "%TEMPLATE_DIR%" (
	echo [ERROR] samples-template not found at "%TEMPLATE_DIR%".
	exit /b 1
)

if exist "%SAMPLES_DIR%" (
	rmdir /s /q "%SAMPLES_DIR%"
)

xcopy "%TEMPLATE_DIR%" "%SAMPLES_DIR%\" /E /I /Q /H /Y >nul
if %ERRORLEVEL% NEQ 0 (
	echo [ERROR] Failed to copy samples-template to samples.
	exit /b 1
)

pushd "%SAMPLES_DIR%"
git init -q -b master
git add -A
git -c user.email="pi-dev@local" -c user.name="pi-dev" commit -q -m "baseline: reset from samples-template"
popd

echo Samples reset to initial state (fresh runtime git baseline from samples-template).
