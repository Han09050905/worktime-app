#!/bin/bash

echo "🚀 部署工時管理APP到Supabase..."

# 檢查Node.js是否安裝
if ! command -v node &> /dev/null; then
    echo "❌ 錯誤: 請先安裝 Node.js"
    exit 1
fi

# 檢查npm是否安裝
if ! command -v npm &> /dev/null; then
    echo "❌ 錯誤: 請先安裝 npm"
    exit 1
fi

# 檢查環境變數檔案
if [ ! -f ".env" ]; then
    echo "❌ 錯誤: 找不到 .env 檔案"
    echo "請複製 env.example 為 .env 並填入您的Supabase配置"
    exit 1
fi

# 載入環境變數
source .env

# 檢查Supabase配置
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ 錯誤: 請在 .env 檔案中設定 SUPABASE_URL 和 SUPABASE_ANON_KEY"
    exit 1
fi

echo "📦 安裝依賴..."
npm run install-all

echo "🔧 設定Supabase資料庫..."
echo "請在Supabase控制台中執行以下SQL："
echo ""
echo "1. 前往 Supabase Dashboard > SQL Editor"
echo "2. 複製並執行 supabase-schema.sql 的內容"
echo ""

read -p "完成資料庫設定後按 Enter 繼續..."

echo "🏗️ 建置前端..."
cd client && npm run build && cd ..

echo "🚀 啟動應用程式..."
export NODE_ENV=production
node server/index.js 