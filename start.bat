@echo off
title AegisVision AI - Deepfake Detection System
cd /d "%~dp0"
echo ========================================================
echo   AegisVision AI - Deepfake Detection ^& Verification
echo ========================================================
echo.
echo Starting Python FastAPI Forensic Backend on http://localhost:8000...
start "AegisVision Forensic Backend" /min cmd /c "C:\Users\yadav\AppData\Local\Python\pythoncore-3.14-64\python.exe backend/run_server.py"
echo Backend initialized.
echo.
echo Starting frontend Vite development server...
echo Opening website in browser: http://localhost:3000
echo.
start http://localhost:3000
call npm.cmd run dev
pause
