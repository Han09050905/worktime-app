#!/bin/bash

# 工時APP 構建腳本
echo "🚀 開始構建工時APP..."

# 安裝依賴項
echo "📦 安裝根目錄依賴項..."
yarn install

echo "📦 安裝伺服器依賴項..."
cd server && yarn install && cd ..

echo "📦 安裝客戶端依賴項..."
cd client && yarn install && cd ..

# 構建客戶端
echo "🔨 構建客戶端..."
cd client
yarn build
echo "✅ 客戶端構建完成"

# 檢查構建結果
echo "🔍 檢查客戶端構建結果..."
if [ ! -d "build" ]; then
    echo "❌ 客戶端構建失敗：build 目錄不存在"
    exit 1
fi

echo "📋 客戶端構建檔案："
ls -la build/

# 複製到伺服器目錄
echo "📋 複製構建檔案到伺服器目錄..."
cp -r build ../server/
cd ../server

echo "🔍 檢查伺服器構建檔案..."
if [ ! -d "build" ]; then
    echo "❌ 複製失敗：server/build 目錄不存在"
    exit 1
fi

echo "📋 伺服器構建檔案："
ls -la build/

echo "✅ 構建完成！" 