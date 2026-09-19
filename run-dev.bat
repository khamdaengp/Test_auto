@echo off
title QA Automation Dashboard - Development Mode
color 0a

echo ================================================================
echo        QA AUTOMATION DASHBOARD - FULL DEV MODE
echo ================================================================
echo.

where docker >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Starting PostgreSQL container on port 5434...
    docker compose up -d
)

echo Starting Backend Server in window 1 (Port 4000)...
start "QA Dashboard - Backend" cmd /k "cd backend && node --watch src/server.js"

echo Starting Vite Dev Server in window 2 (Port 5180 with HMR)...
start "QA Dashboard - Frontend Dev" cmd /k "cd frontend && npm.cmd run dev"

timeout /t 3 >nul
start http://localhost:5180

echo Dev servers running!
