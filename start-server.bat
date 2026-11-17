@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 通信原理学习台 - 本地服务器

where python >nul 2>nul
if errorlevel 1 (
  echo.
  echo [错误] 没有找到 python。
  echo 请先安装 Python 3，或用 VS Code 的 Live Server 插件打开本目录。
  echo.
  pause
  exit /b 1
)

echo 正在 http://127.0.0.1:8000/ 启动本地服务器...
echo 关闭这个黑色窗口即停止服务。
echo.
start "" /b cmd /c "timeout /t 1 >nul & start http://127.0.0.1:8000/"
python -m http.server 8000 --bind 127.0.0.1
pause
