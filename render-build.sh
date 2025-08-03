#!/bin/bash

# Render 部署腳本 - 工時APP
# 強制使用 npm 並確保依賴項正確安裝

set -e  # 遇到錯誤時停止執行

echo "🚀 開始 Render 部署構建..."

# 強制使用 npm
echo "📋 強制使用 npm..."
export npm_config_package_manager=npm
export npm_config_prefer_npm=true

# 檢查 Node.js 版本
echo "📋 Node.js 版本: $(node --version)"
echo "📋 npm 版本: $(npm --version)"

# 清理所有 yarn 相關文件
echo "🧹 清理 yarn 相關文件..."
rm -f yarn.lock
rm -f .yarnrc
rm -f .yarnrc.yml

# 清理舊的 node_modules
echo "🧹 清理舊的依賴項..."
rm -rf node_modules
rm -rf server/node_modules
rm -rf client/node_modules

# 安裝根目錄依賴項
echo "📦 安裝根目錄依賴項..."
npm install --no-audit --no-fund

# 安裝伺服器依賴項
echo "📦 安裝伺服器依賴項..."
cd server
npm install --no-audit --no-fund
cd ..

# 安裝客戶端依賴項
echo "📦 安裝客戶端依賴項..."
cd client
npm install --no-audit --no-fund
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
    npm install --no-audit --no-fund
fi

if [ ! -d "node_modules/express-validator" ]; then
    echo "❌ express-validator 依賴項未安裝"
    echo "📋 重新安裝伺服器依賴項..."
    npm install --no-audit --no-fund
fi

echo "✅ 所有伺服器依賴項已安裝"
cd ..

echo "✅ 構建完成！"
echo "📋 目錄結構:"
ls -la
echo "📋 伺服器依賴項:"
ls -la server/node_modules/ | head -10 