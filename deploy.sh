#!/bin/bash

set -e  # 遇到錯誤就停止執行

echo "🚀 開始部署流程..."

# 檢查環境
echo "🔍 檢查部署環境..."
if [ -z "$NODE_ENV" ]; then
    export NODE_ENV=production
    echo "📝 設定 NODE_ENV=production"
fi

# 執行建置
echo "🔨 執行建置流程..."
./build.sh

# 檢查建置結果
echo "🔍 驗證建置結果..."
if [ ! -f "server/build/index.html" ]; then
    echo "❌ 部署失敗：建置檔案不存在"
    exit 1
fi

# 啟動伺服器
echo "🚀 啟動生產伺服器..."
echo "📊 伺服器資訊:"
echo "  - 環境: $NODE_ENV"
echo "  - 端口: ${PORT:-3001}"
echo "  - 建置路徑: server/build/"

# 啟動伺服器
node server/index.js 