@echo off
chcp 65001 >nul
title WebPOS Billiads
color 0A

echo ================================================
echo         WEBPOS BILLIADS - KHỞI ĐỘNG
echo ================================================
echo.

:: Kiểm tra Node.js
node -v >nul 2>&1
if %errorLevel% neq 0 (
    echo [LỖI] Chưa cài Node.js! Hãy chạy CAI_DAT.bat trước.
    pause
    exit /b 1
)

:: Kiểm tra file .env
if not exist "%~dp0\backend\.env" (
    echo [LỖI] Chưa có file .env! Hãy chạy CAI_DAT.bat trước.
    pause
    exit /b 1
)

:: Kiểm tra node_modules
if not exist "%~dp0\backend\node_modules" (
    echo [LỖI] Chưa cài thư viện! Hãy chạy CAI_DAT.bat trước.
    pause
    exit /b 1
)

echo Đang khởi động server...
cd /d %~dp0\backend
start "WebPOS Server" node server.js

echo Đợi server khởi động...
timeout /t 3 /nobreak >nul

echo Đang mở trình duyệt...
start "" http://localhost:5000

echo.
echo ================================================
echo   Phần mềm đang chạy tại: http://localhost:5000
echo   Đóng cửa sổ "WebPOS Server" để tắt phần mềm
echo ================================================
echo.
pause