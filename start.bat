@echo off
chcp 65001 >nul
title 精灵蜂任务管理平台 - Electron版

echo 🚀 启动精灵蜂任务管理平台 - Electron版
echo ==================================

REM 检查 Node.js 是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 Node.js，请先安装 Node.js 16.0 或更高版本
    pause
    exit /b 1
)

REM 检查 npm 是否安装
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 npm，请先安装 npm
    pause
    exit /b 1
)

REM 进入项目目录
cd /d "%~dp0"

REM 检查是否已安装依赖
if not exist "node_modules" (
    echo 📦 首次运行，正在安装依赖...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ 依赖安装失败，请检查网络连接
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成
)

REM 检查网络连接
echo 🌐 检查网络连接...
ping -n 1 zxyy.ltd >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 网络连接正常
) else (
    echo ⚠️  警告: 无法连接到 zxyy.ltd，应用可能无法正常工作
)

REM 启动应用
echo 🎯 启动应用...
npm run dev

echo 👋 应用已退出
pause
