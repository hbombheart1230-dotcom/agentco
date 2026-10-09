@echo off
pushd "%~dp0.." || exit /b 1
call "%~dp0..\pi.cmd" %*
popd & exit /b %errorlevel%
