#!/bin/bash

set -e  # 遇到錯誤就停止執行

echo "🚀 開始前端建置流程..."

# 檢查當前目錄
echo "📁 當前目錄: $(pwd)"
echo "📋 目錄內容:"
ls -la

# 安裝根目錄依賴
echo "📦 安裝根目錄依賴..."
npm install

# 安裝前端依賴
echo "📦 安裝前端依賴..."
cd client
npm install
cd ..

# 安裝後端依賴
echo "📦 安裝後端依賴..."
cd server
npm install
cd ..

# 建置前端
echo "🔨 建置前端應用程式..."
cd client
npm run build
cd ..

# 檢查建置結果
echo "🔍 檢查建置結果..."
if [ ! -d "client/build" ]; then
    echo "❌ 前端建置失敗：client/build 目錄不存在"
    exit 1
fi

if [ ! -f "client/build/index.html" ]; then
    echo "❌ 前端建置失敗：index.html 檔案不存在"
    exit 1
fi

echo "✅ 前端建置成功"
echo "📋 建置檔案內容:"
ls -la client/build/

# 複製到伺服器目錄
echo "📋 複製建置檔案到伺服器目錄..."
rm -rf server/build
cp -r client/build server/

# 驗證複製結果
echo "🔍 驗證複製結果..."
if [ ! -f "server/build/index.html" ]; then
    echo "❌ 複製失敗：server/build/index.html 不存在"
    exit 1
fi

echo "✅ 建置檔案複製成功"
echo "📋 伺服器建置目錄內容:"
ls -la server/build/

echo "🎉 前端建置流程完成！" 