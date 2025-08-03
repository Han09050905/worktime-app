#!/bin/bash

echo "🚀 啟動工時管理應用程式..."

# 檢查是否已安裝依賴
if [ ! -d "node_modules" ]; then
    echo "📦 安裝根目錄依賴..."
    npm install
fi

if [ ! -d "server/node_modules" ]; then
    echo "📦 安裝伺服器依賴..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 安裝前端依賴..."
    cd client && npm install && cd ..
fi

# 檢查環境變數檔案
if [ ! -f ".env" ]; then
    echo "⚠️  未找到 .env 檔案，請複製 env.example 並設定 Supabase 憑證"
    echo "cp env.example .env"
    echo "然後編輯 .env 檔案設定您的 Supabase URL 和 API Key"
    exit 1
fi

echo "✅ 所有依賴已安裝"
echo "🌐 啟動開發伺服器..."
echo "📱 前端: http://localhost:3000"
echo "🔧 後端: http://localhost:3001"

# 同時啟動前端和後端
npm run dev 