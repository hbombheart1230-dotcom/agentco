@echo off
setlocal
pushd "%~dp0.." || exit /b 1
node "%~dp0..\scripts\agentco.mjs" %*
set "agentco_exit=%errorlevel%"
popd
endlocal & exit /b %agentco_exit%
