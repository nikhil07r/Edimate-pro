@echo off
title Stop EDITMATE PRO Whisper Service
echo Stopping any running EDITMATE PRO Whisper service on port 5588...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5588" ^| find "LISTENING"') do (
    echo Terminating process PID %%a...
    taskkill /F /PID %%a
)
echo Done.
pause
