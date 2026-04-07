@echo off
chcp 65001 >nul
title Cài Đặt WebPOS Billiads
color 0A

echo ================================================
echo     WEBPOS BILLIADS - CHƯƠNG TRÌNH CÀI ĐẶT
echo ================================================
echo.

:: Kiểm tra quyền Admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [LỖI] Vui lòng chạy file này với quyền Administrator!
    echo Chuột phải vào file -> "Run as administrator"
    pause
    exit /b 1
)

:: Kiểm tra Node.js
echo [1/3] Kiểm tra Node.js...
node -v >nul 2>&1
if %errorLevel% neq 0 (
    echo Node.js chưa được cài. Đang mở trang tải...
    start "" https://nodejs.org/en/download
    echo.
    echo Sau khi cài Node.js xong, chạy lại file CAI_DAT.bat này!
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node -v') do echo [OK] Node.js %%i đã có!
)

:: Cài dependencies backend
echo.
echo [2/3] Cài thư viện backend...
cd /d %~dp0\backend
call npm install --omit=dev
if %errorLevel% neq 0 (
    echo [LỖI] Cài thư viện thất bại! Kiểm tra kết nối internet.
    pause
    exit /b 1
)
echo [OK] Thư viện đã cài xong!

:: Kiểm tra file .env
echo.
echo [3/3] Kiểm tra cấu hình...
if not exist "%~dp0\backend\.env" (
    echo [CẢNH BÁO] Chưa có file .env!
    echo Đang tạo file .env mẫu...
    copy "%~dp0\backend\.env.example" "%~dp0\backend\.env"
    echo.
    echo Vui lòng mở file backend\.env và điền thông tin:
    echo   - DB_SERVER: tên máy chủ SQL Server
    echo   - DB_NAME: tên database
    echo   - DB_USER / DB_PASSWORD: tài khoản SQL Server
    echo.
    start notepad "%~dp0\backend\.env"
    echo Sau khi điền xong, chạy CHAY_PHAN_MEM.bat
    pause
    exit /b 1
)
echo [OK] File .env đã có!

echo.
echo ================================================
echo   CÀI ĐẶT HOÀN TẤT! Chạy CHAY_PHAN_MEM.bat
echo ================================================
pause