@echo off
title AegisVision AI - Deepfake Detection System
cd /d "%~dp0"
echo ========================================================
echo   AegisVision AI - Deepfake Detection ^& Verification
echo ========================================================
echo.
echo Starting local development server...
echo Access in browser: http://localhost:3000
echo.
call npm.cmd run dev
pause
