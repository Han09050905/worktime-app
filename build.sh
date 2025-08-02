#!/bin/bash

set -e  # 遇到錯誤就停止執行

echo "🚀 開始建置流程..."

# 清理之前的建置
echo "🧹 清理之前的建置..."
rm -rf client/build
rm -rf server/build

# 安裝依賴
echo "📦 安裝依賴..."
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..

# 建置前端
echo "🔨 建置前端..."
cd client
npm run build
cd ..

# 檢查建置結果
echo "🔍 檢查建置結果..."
if [ ! -d "client/build" ]; then
    echo "❌ 前端建置失敗"
    exit 1
fi

if [ ! -f "client/build/index.html" ]; then
    echo "❌ index.html 檔案不存在"
    exit 1
fi

echo "✅ 前端建置成功"

# 複製到伺服器目錄
echo "📋 複製建置檔案到伺服器目錄..."
cp -r client/build server/

# 驗證複製結果
echo "🔍 驗證複製結果..."
if [ ! -f "server/build/index.html" ]; then
    echo "❌ 複製失敗：server/build/index.html 不存在"
    exit 1
fi

echo "✅ 建置檔案複製成功"
echo "📁 伺服器建置目錄內容："
ls -la server/build/

echo "🎉 建置完成！" 