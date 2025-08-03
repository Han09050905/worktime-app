#!/bin/bash

set -e  # 遇到錯誤就停止執行

echo "⚡ 快速部署模式..."

# 檢查環境變數
echo "🔍 檢查環境變數..."
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "⚠️  警告: Supabase 環境變數未設定"
    echo "   請確保以下變數已設定:"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_ANON_KEY"
    echo ""
    echo "   您可以從 .env 檔案載入:"
    echo "   source .env"
    echo ""
fi

# 設定環境
export NODE_ENV=production
echo "📝 設定 NODE_ENV=production"

# 快速建置檢查
echo "🔍 檢查建置檔案..."
if [ ! -f "server/build/index.html" ]; then
    echo "📋 建置檔案不存在，執行建置..."
    ./build.sh
else
    echo "✅ 建置檔案已存在，跳過建置"
fi

# 檢查伺服器檔案
echo "🔍 檢查伺服器檔案..."
if [ ! -f "server/index.js" ]; then
    echo "❌ 伺服器檔案不存在"
    exit 1
fi

# 檢查依賴
echo "🔍 檢查依賴..."
if [ ! -d "server/node_modules" ]; then
    echo "📦 安裝伺服器依賴..."
    cd server && npm install && cd ..
fi

# 啟動伺服器
echo "🚀 啟動生產伺服器..."
echo "📊 部署資訊:"
echo "  - 環境: $NODE_ENV"
echo "  - 端口: ${PORT:-3001}"
echo "  - 建置路徑: server/build/"
echo "  - 資料庫: Supabase"
echo ""

# 啟動伺服器
node server/index.js 