@echo off
setlocal enabledelayedexpansion

title QA Automation Dashboard - Startup
color 0b

echo ================================================================
echo           QA AUTOMATION DASHBOARD - PLAYWRIGHT
echo ================================================================
echo.

:: 1. Check PostgreSQL (native or Docker)
echo [1/4] Checking PostgreSQL database...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U qa_user -h 127.0.0.1 -p 5432 -d qa_dashboard -c "SELECT 1" >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Native PostgreSQL 18 is running on port 5432.
) else (
    echo [INFO] Native PostgreSQL not accessible, trying Docker...
    where docker >nul 2>nul
    if %ERRORLEVEL% equ 0 (
        docker compose up -d >nul 2>nul
        if %ERRORLEVEL% equ 0 (
            echo [OK] Docker PostgreSQL container started on port 5434.
        ) else (
            echo [WARNING] Could not start Docker container. Backend will retry DB connection automatically.
        )
    ) else (
        echo [WARNING] No PostgreSQL found. Backend will retry DB connection in background.
    )
)
echo.

:: 2. Check Node.js and NPM
echo [2/4] Verifying Node.js environment...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH. Please install Node.js v18+.
    pause
    exit /b 1
)

:: 3. Install dependencies if missing
echo [3/4] Checking dependencies...
if not exist "node_modules\" (
    echo Installing root test dependencies...
    call npm.cmd install
)

if not exist "backend\node_modules\" (
    echo Installing backend dependencies...
    cd backend
    call npm.cmd install
    cd ..
)

if not exist "frontend\node_modules\" (
    echo Installing frontend dependencies...
    cd frontend
    call npm.cmd install
    cd ..
)

if not exist "frontend\dist\" (
    echo Building frontend production assets...
    cd frontend
    call npm.cmd run build
    cd ..
)
echo [OK] Dependencies verified.
echo.

:: 4. Launch Application
echo [4/4] Starting QA Automation Dashboard Server...
echo ----------------------------------------------------------------
echo   Backend URL:    http://localhost:4000
echo   Dashboard UI:   http://localhost:4000
echo   PostgreSQL DB:  localhost:5432 (db: qa_dashboard, user: qa_user)
echo ----------------------------------------------------------------
echo.
echo Opening Dashboard in your browser...
start http://localhost:4000

echo Starting server process (Press Ctrl+C to stop)...
cd backend
call node src/server.js
pause
