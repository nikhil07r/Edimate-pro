@echo off
title EDITMATE PRO - Whisper AI Service
echo ===================================================
echo   EDITMATE PRO - Whisper AI Transcription Engine
echo   Starting local service on http://127.0.0.1:5588
echo ===================================================
cd /d "%~dp0"
set VENV_PYTHON="%~dp0..\venv\Scripts\python.exe"
if not exist %VENV_PYTHON% (
    echo Error: Virtual environment python not found at %VENV_PYTHON%!
    pause
    exit /b 1
)
%VENV_PYTHON% "%~dp0app.py"
pause
