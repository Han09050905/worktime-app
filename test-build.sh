#!/bin/bash

echo "🧪 測試建置流程..."

# 清理之前的建置
echo "🧹 清理之前的建置..."
rm -rf client/build
rm -rf server/build

# 安裝依賴
echo "📦 安裝依賴..."
npm run install-all

# 建置前端
echo "🔨 建置前端..."
npm run build

# 檢查建置結果
echo "🔍 檢查建置結果..."
if [ -d "client/build" ]; then
    echo "✅ 前端建置成功"
    ls -la client/build/
else
    echo "❌ 前端建置失敗"
    exit 1
fi

# 複製到伺服器目錄
echo "📋 複製建置檔案到伺服器目錄..."
cp -r client/build server/

# 檢查伺服器目錄
echo "🔍 檢查伺服器目錄..."
if [ -f "server/build/index.html" ]; then
    echo "✅ 建置檔案複製成功"
    ls -la server/build/
else
    echo "❌ 建置檔案複製失敗"
    exit 1
fi

echo "🎉 建置測試完成！" 