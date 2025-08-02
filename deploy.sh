#!/bin/bash

echo "🚀 部署工時管理APP到生產環境..."

# 檢查Docker是否安裝
if ! command -v docker &> /dev/null; then
    echo "❌ 錯誤: 請先安裝 Docker"
    exit 1
fi

# 檢查Docker Compose是否安裝
if ! command -v docker-compose &> /dev/null; then
    echo "❌ 錯誤: 請先安裝 Docker Compose"
    exit 1
fi

# 建立資料目錄
mkdir -p data

# 停止現有容器
echo "🛑 停止現有容器..."
docker-compose down

# 建置新映像
echo "🔨 建置Docker映像..."
docker-compose build --no-cache

# 啟動容器
echo "🚀 啟動應用程式..."
docker-compose up -d

# 等待應用程式啟動
echo "⏳ 等待應用程式啟動..."
sleep 10

# 檢查健康狀態
echo "🔍 檢查應用程式狀態..."
if curl -f http://localhost:3001/api/projects > /dev/null 2>&1; then
    echo "✅ 部署成功！"
    echo "📱 應用程式網址: http://localhost:3001"
    echo "🔌 API端點: http://localhost:3001/api"
    echo ""
    echo "📋 管理命令:"
    echo "  查看日誌: docker-compose logs -f"
    echo "  停止服務: docker-compose down"
    echo "  重啟服務: docker-compose restart"
else
    echo "❌ 部署失敗，請檢查日誌:"
    docker-compose logs
    exit 1
fi 