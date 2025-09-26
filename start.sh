#!/bin/bash

# 精灵蜂 Electron 版启动脚本

echo "🚀 启动精灵蜂任务管理平台 - Electron版"
echo "=================================="

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js 16.0 或更高版本"
    exit 1
fi

# 检查 npm 是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到 npm，请先安装 npm"
    exit 1
fi

# 进入项目目录
cd "$(dirname "$0")"

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，正在安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败，请检查网络连接"
        exit 1
    fi
    echo "✅ 依赖安装完成"
fi

# 检查网络连接
echo "🌐 检查网络连接..."
if ping -c 1 zxyy.ltd &> /dev/null; then
    echo "✅ 网络连接正常"
else
    echo "⚠️  警告: 无法连接到 zxyy.ltd，应用可能无法正常工作"
fi

# 启动应用
echo "🎯 启动应用..."
npm run dev

echo "👋 应用已退出"
