@echo off
chcp 65001 >nul
title Day code len GitHub - Music & Lyric Collector

echo =======================================================
echo     TỰ ĐỘNG ĐẨY MÃ NGUỒN DỰ ÁN LÊN GITHUB
echo =======================================================
echo.

:: Di chuyen vao thu muc chua du an
cd /d "%~dp0"

:: Kiem tra git da cai chua
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [LOI] May tinh chua cai Git hoac chua them Git vao PATH!
    echo Vui long cai Git tai: https://git-scm.com/
    pause
    exit /b
)

:: Kiem tra khoi tao git chua
if not exist ".git" (
    echo [1/5] Khoi tao thu vien Git local...
    git init
    git branch -M main
) else (
    echo [1/5] Thu vien Git da duoc khoi tao truoc do.
)

:: Kiem tra remote origin da co chua
git remote get-url origin >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================================
    echo  Chua co lien ket den GitHub Repository cua ban!
    echo  Neu chua tao repo, hay vao https://github.com/new de tao.
    echo ========================================================
    set /p REPO_URL="Dán link GitHub repo của bạn (ví dụ: https://github.com/username/ten-repo.git): "
    
    if "%REPO_URL%"=="" (
        echo [LOI] Ban chua nhap link repo! Huy thao tac.
        pause
        exit /b
    )
    git remote add origin %REPO_URL%
    echo [2/5] Da them remote: %REPO_URL%
) else (
    for /f "delims=" %%i in ('git remote get-url origin') do set CURRENT_REPO=%%i
    echo [2/5] Repo hien tai: %CURRENT_REPO%
)

:: Nhan commit message
echo.
set /p COMMIT_MSG="Nhap ghi chu commit (Enter de mac dinh: Cap nhat du an): "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Cap nhat du an Music & Lyric Collector

echo.
echo [3/5] Dang them file vao git...
git add .

echo [4/5] Dang commit thay doi...
git commit -m "%COMMIT_MSG%"

echo.
echo [5/5] Dang day len GitHub (git push)...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo =======================================================
    echo   THANH CONG! Ma nguon da duoc day len GitHub cua ban.
    echo =======================================================
) else (
    echo.
    echo [CANH BAO] Neu day that bai do xung dot hoac repo moi co file README:
    echo Dang thu pull va push lai...
    git pull origin main --rebase
    git push -u origin main
)

echo.
pause
