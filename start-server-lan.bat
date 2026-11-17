@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 通信原理学习台 - 局域网演示

where python >nul 2>nul
if errorlevel 1 (
  echo [错误] 没有找到 python，请先安装 Python 3。
  pause
  exit /b 1
)

echo ============================================
echo  局域网访问地址（同一 Wi-Fi 下的手机/电脑）
echo ============================================
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
  for /f "tokens=* delims= " %%b in ("%%a") do echo   http://%%b:8000/
)
echo.
echo 注意：
echo   1. Windows 防火墙弹窗请允许“专用网络”
echo   2. 本机必须保持开机，关闭窗口即停止
echo   3. 这不是公网地址，外网访问不了
echo ============================================
echo.

python -m http.server 8000 --bind 0.0.0.0
pause
