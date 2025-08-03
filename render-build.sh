#!/bin/bash

# Render 部署腳本 - 工時APP
# 確保使用 npm 並正確安裝所有依賴項

set -e  # 遇到錯誤時停止執行

echo "🚀 開始 Render 部署構建..."

# 檢查 Node.js 版本
echo "📋 Node.js 版本: $(node --version)"
echo "📋 npm 版本: $(npm --version)"

# 清理舊的 node_modules（如果存在）
echo "🧹 清理舊的依賴項..."
rm -rf node_modules
rm -rf server/node_modules
rm -rf client/node_modules

# 安裝根目錄依賴項
echo "📦 安裝根目錄依賴項..."
npm ci --only=production

# 安裝伺服器依賴項
echo "📦 安裝伺服器依賴項..."
cd server
npm ci --only=production
cd ..

# 安裝客戶端依賴項
echo "📦 安裝客戶端依賴項..."
cd client
npm ci
echo "🔨 構建客戶端..."
npm run build
cd ..

# 驗證伺服器依賴項
echo "✅ 驗證伺服器依賴項..."
cd server
if [ ! -d "node_modules" ]; then
    echo "❌ 伺服器 node_modules 不存在"
    exit 1
fi

if [ ! -d "node_modules/express" ]; then
    echo "❌ Express 依賴項未安裝"
    echo "📋 重新安裝伺服器依賴項..."
    npm ci --only=production
fi
cd ..

echo "✅ 構建完成！"
echo "📋 目錄結構:"
ls -la
echo "📋 伺服器依賴項:"
ls -la server/node_modules/ | head -10 