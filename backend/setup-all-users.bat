@echo off
REM Complete auto-setup script (Windows)
REM Usage: setup-all-users.bat

echo.
echo ========================================
echo WombTo18 - Complete Auto-Setup
echo ========================================
echo.

REM Check if backend is running
echo Checking if backend server is running...
curl -s http://localhost:8000/registration/test-mode >nul 2>&1
if %errorlevel% equ 0 (
    echo Backend server is running
    echo.
    
    REM Run complete auto-setup
    echo Running complete auto-setup...
    echo This will:
    echo   1. Seed milestone templates
    echo   2. Set payment status to COMPLETED
    echo   3. Trigger email sequence (2 emails per user)
    echo   4. Activate all services
    echo.
    
    node complete-auto-setup.js
    
) else (
    echo Backend server is not running
    echo.
    echo Please start the backend server first:
    echo   cd backend
    echo   npm run start:dev
    echo.
    echo Then run this script again.
    exit /b 1
)

pause
