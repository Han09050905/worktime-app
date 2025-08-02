#!/bin/bash

echo "🚀 啟動工時管理APP..."

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

# 檢查依賴是否已安裝
if [ ! -d "node_modules" ] || [ ! -d "server/node_modules" ] || [ ! -d "client/node_modules" ]; then
    echo "📦 安裝依賴..."
    npm run install-all
fi

echo "🔧 啟動後端伺服器..."
cd server && node index.js &
SERVER_PID=$!

echo "⏳ 等待後端伺服器啟動..."
sleep 3

echo "🎨 啟動前端應用程式..."
cd ../client && npm start &
CLIENT_PID=$!

echo "✅ 應用程式已啟動！"
echo "📱 前端: http://localhost:3000"
echo "🔌 後端API: http://localhost:3001"
echo ""
echo "按 Ctrl+C 停止應用程式"

# 等待用戶中斷
trap "echo '🛑 停止應用程式...'; kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit" INT

wait 