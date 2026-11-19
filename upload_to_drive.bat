@echo off
chcp 65001 >nul
title Upload Dataset len Google Drive

echo =======================================================
echo        CÔNG CỤ UPLOAD DATASET LÊN GOOGLE DRIVE
echo =======================================================
echo.

cd /d "%~dp0"

:: 1. Tim thu muc dataset
set DATASET_DIR=
if exist "data\dataset_music" set DATASET_DIR=data\dataset_music
if "%DATASET_DIR%"=="" if exist "%USERPROFILE%\Downloads\dataset_music" set DATASET_DIR=%USERPROFILE%\Downloads\dataset_music

if "%DATASET_DIR%"=="" (
    echo [LOI] Khong tim thay thu muc dataset_music!
    echo Vui long kiem tra lai xem da tai nhac tu Extension ve chua.
    pause
    exit /b
)

echo [1/3] Da tim thay thu muc nhac: %DATASET_DIR%
dir /b "%DATASET_DIR%"
echo.

:: 2. Nen toan bo dataset thanh 1 file ZIP de upload sieu nhanh
echo [2/3] Dang dong goi toan bo dataset thanh dataset_music_all.zip...
if exist "dataset_music_all.zip" del /f /q "dataset_music_all.zip"
powershell -NoProfile -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('%~dp0%DATASET_DIR%', '%~dp0dataset_music_all.zip')"

if exist "dataset_music_all.zip" (
    echo    -> Da tao file: dataset_music_all.zip thanh cong!
) else (
    echo    [CANH BAO] Khong tao duoc file zip, se dung cac file le.
)
echo.

:: 3. Kiem tra Google Drive Desktop (o dia G: hoac thu muc Google Drive)
set DRIVE_DEST=
if exist "G:\My Drive\" set DRIVE_DEST=G:\My Drive\dataset_music
if "%DRIVE_DEST%"=="" if exist "%USERPROFILE%\Google Drive\" set DRIVE_DEST=%USERPROFILE%\Google Drive\dataset_music

if not "%DRIVE_DEST%"=="" (
    echo [3/3] Phat hien Google Drive Desktop tren may tinh!
    echo    Dang copy truc tiep vao Google Drive cua ban...
    if not exist "%DRIVE_DEST%" mkdir "%DRIVE_DEST%"
    
    copy /y "dataset_music_all.zip" "%DRIVE_DEST%\" >nul 2>&1
    copy /y "%DATASET_DIR%\*.*" "%DRIVE_DEST%\" >nul 2>&1
    
    echo.
    echo =======================================================
    echo   THANH CONG! File da duoc copy vao Google Drive Desktop:
    echo   %DRIVE_DEST%
    echo   Google Drive se tu dong dong bo len dam may.
    echo =======================================================
) else (
    echo [3/3] May tinh chua cai Google Drive Desktop hoac dung web.
    echo.
    echo    -> Dang mo Google Drive tren trinh duyet...
    start https://drive.google.com/drive/my-drive
    
    echo    -> Dang mo thu muc chua file tren may de ban keo tha...
    explorer /select,"%~dp0dataset_music_all.zip"
    
    echo.
    echo =======================================================
    echo   HUONG DAN:
    echo   1. Trinh duyet da mo trang Google Drive cua ban.
    echo   2. Thu muc file tren may da duoc mo san.
    echo   3. Ban chi can KEO THA file 'dataset_music_all.zip'
    echo      vao cua so Google Drive la xong!
    echo =======================================================
)

echo.
pause
