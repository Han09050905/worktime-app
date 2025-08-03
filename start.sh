#!/bin/bash

# 工時APP 啟動腳本
echo "🚀 啟動工時APP..."

# 檢查當前目錄
echo "📁 當前目錄: $(pwd)"
echo "📋 目錄內容:"
ls -la

# 檢查 Node.js 版本
echo "📋 Node.js 版本: $(node --version)"
echo "📋 npm 版本: $(npm --version)"

# 進入伺服器目錄
echo "📁 進入伺服器目錄..."
cd server

# 檢查伺服器依賴項
echo "🔍 檢查伺服器依賴項..."
if [ ! -d "node_modules" ] || [ ! -d "node_modules/express" ]; then
    echo "📦 安裝伺服器依賴項..."
    npm install
fi

# 檢查 express-validator
if [ ! -d "node_modules/express-validator" ]; then
    echo "📦 重新安裝伺服器依賴項..."
    npm install
fi

echo "✅ 伺服器依賴項檢查完成"

# 啟動伺服器
echo "🚀 啟動伺服器..."
node index.js 