@echo off
title NetTrace - Network Mapping & Patch Management Platform
color 0B
cls
echo =====================================================================
echo           NetTrace - Network Mapping & Patch Management
echo =====================================================================
echo.
echo [1/2] Checking environment...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b
)

echo [2/2] Launching NetTrace Localhost Platform on Port 5000...
echo.
echo =====================================================================
echo  Open your browser at: http://localhost:5000
echo =====================================================================
echo.

start "" "http://localhost:5000"
cd backend
node src/server.js
pause
