#!/bin/bash

set -e  # 遇到錯誤就停止執行

echo "🚀 啟動工時統計應用程式..."

# 檢查環境
echo "🔍 檢查環境..."
if [ -z "$NODE_ENV" ]; then
    export NODE_ENV=development
    echo "📝 設定 NODE_ENV=development"
fi

# 檢查建置檔案
echo "🔍 檢查建置檔案..."
if [ "$NODE_ENV" = "production" ] && [ ! -f "server/build/index.html" ]; then
    echo "📋 生產環境建置檔案不存在，執行建置..."
    ./build.sh
fi

# 檢查依賴
echo "🔍 檢查依賴..."
if [ ! -d "node_modules" ]; then
    echo "📦 安裝根目錄依賴..."
    npm install
fi

if [ ! -d "server/node_modules" ]; then
    echo "📦 安裝伺服器依賴..."
    cd server && npm install && cd ..
fi

# 啟動伺服器
echo "🚀 啟動伺服器..."
echo "📊 伺服器資訊:"
echo "  - 環境: $NODE_ENV"
echo "  - 端口: ${PORT:-3001}"
echo "  - 資料庫: Supabase"

# 啟動伺服器
node server/index.js 