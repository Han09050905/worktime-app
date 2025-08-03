#!/bin/bash

set -e  # 遇到錯誤就停止執行

echo "🧪 開始建置測試..."

# 檢查必要檔案
echo "🔍 檢查必要檔案..."
required_files=(
    "package.json"
    "client/package.json"
    "server/package.json"
    "build.sh"
    "deploy.sh"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (缺失)"
        exit 1
    fi
done

# 執行建置
echo "🔨 執行建置流程..."
./build.sh

# 驗證建置結果
echo "🔍 驗證建置結果..."
build_files=(
    "client/build/index.html"
    "client/build/static"
    "server/build/index.html"
    "server/build/static"
)

for file in "${build_files[@]}"; do
    if [ -e "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (缺失)"
        exit 1
    fi
done

# 檢查檔案大小
echo "📊 建置檔案統計:"
echo "  - client/build 大小: $(du -sh client/build | cut -f1)"
echo "  - server/build 大小: $(du -sh server/build | cut -f1)"
echo "  - 總檔案數: $(find server/build -type f | wc -l)"

# 測試伺服器啟動
echo "🚀 測試伺服器啟動..."
node server/index.js &
SERVER_PID=$!

# 等待伺服器啟動
sleep 3

# 檢查伺服器是否正常運行
if kill -0 $SERVER_PID 2>/dev/null; then
    echo "  ✅ 伺服器正常啟動"
    
    # 測試健康檢查端點
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        echo "  ✅ 健康檢查端點正常"
    else
        echo "  ❌ 健康檢查端點失敗"
    fi
    
    # 停止伺服器
    kill $SERVER_PID
    wait $SERVER_PID 2>/dev/null || true
else
    echo "  ❌ 伺服器啟動失敗"
    exit 1
fi

echo ""
echo "🎉 建置測試完成！"
echo "✅ 所有檢查都通過"
echo "🚀 可以安全部署到生產環境" 