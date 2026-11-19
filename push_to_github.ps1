# PowerShell Script: Day ma nguon len GitHub
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Set-Location -Path $PSScriptRoot

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "     TỰ ĐỘNG ĐẨY MÃ NGUỒN DỰ ÁN LÊN GITHUB" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "[LỖI] Máy tính chưa cài Git! Tải tại https://git-scm.com/" -ForegroundColor Red
    pause
    exit
}

if (-not (Test-Path ".git")) {
    Write-Host "[1/5] Khởi tạo kho Git local..." -ForegroundColor Yellow
    git init
    git branch -M main
}

$origin = git remote get-url origin 2>$null
if (-not $origin) {
    Write-Host "Chưa có liên kết đến GitHub Repository của bạn!" -ForegroundColor Yellow
    Write-Host "Tạo repo mới tại: https://github.com/new" -ForegroundColor Gray
    $repoUrl = Read-Host "Dán link GitHub repo (vd: https://github.com/user/repo.git)"
    if ([string]::IsNullOrWhiteSpace($repoUrl)) {
        Write-Host "[HỦY] Chưa nhập link repository." -ForegroundColor Red
        pause
        exit
    }
    git remote add origin $repoUrl.Trim()
    Write-Host "[2/5] Đã gán remote: $repoUrl" -ForegroundColor Green
} else {
    Write-Host "[2/5] Repo từ xa: $origin" -ForegroundColor Green
}

$msg = Read-Host "Nhập ghi chú commit (Enter để mặc định 'Cập nhật dự án')"
if ([string]::IsNullOrWhiteSpace($msg)) { $msg = "Cập nhật dự án Music & Lyric Collector" }

Write-Host "[3/5] Đang thêm file..." -ForegroundColor Yellow
git add .

Write-Host "[4/5] Đang commit: $msg..." -ForegroundColor Yellow
git commit -m $msg

Write-Host "[5/5] Đang đẩy lên GitHub..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ THÀNH CÔNG! Dự án đã được đẩy lên GitHub." -ForegroundColor Green
} else {
    Write-Host "`n⚠️ Thử pull rebase rồi push lại..." -ForegroundColor Yellow
    git pull origin main --rebase
    git push -u origin main
}

Write-Host "`nBấm phím bất kỳ để kết thúc..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
