#!/bin/bash

set -e  # 遇到錯誤就停止執行

echo "🚀 Render.com 專用部署腳本..."

# 檢查當前目錄
echo "📁 當前目錄: $(pwd)"
echo "📋 目錄內容:"
ls -la

# 檢查環境
echo "🔍 檢查環境..."
node --version
npm --version

# 檢查必要檔案
echo "🔍 檢查必要檔案..."
required_files=(
    "client/package.json"
    "client/src/index.tsx"
    "client/public/index.html"
    "server/package.json"
    "server/index.js"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (缺失)"
        exit 1
    fi
done

# 清理舊的建置檔案
echo "🧹 清理舊的建置檔案..."
rm -rf client/build server/build

# 安裝依賴
echo "📦 安裝根目錄依賴..."
npm install --no-audit --no-fund

echo "📦 安裝前端依賴..."
cd client
npm install --no-audit --no-fund
cd ..

echo "📦 安裝後端依賴..."
cd server
npm install --no-audit --no-fund
cd ..

# 建置前端
echo "🔨 建置前端應用程式..."
cd client
echo "📁 前端目錄: $(pwd)"
echo "📋 前端目錄內容:"
ls -la

# 設定環境變數
export CI=false
export GENERATE_SOURCEMAP=false

npm run build
cd ..

# 檢查建置結果
echo "🔍 檢查建置結果..."
if [ ! -d "client/build" ]; then
    echo "❌ 前端建置失敗：client/build 目錄不存在"
    echo "📋 當前目錄內容:"
    ls -la
    echo "📋 client 目錄內容:"
    ls -la client/
    exit 1
fi

if [ ! -f "client/build/index.html" ]; then
    echo "❌ 前端建置失敗：index.html 檔案不存在"
    echo "📋 client/build 目錄內容:"
    ls -la client/build/
    exit 1
fi

echo "✅ 前端建置成功"
echo "📋 建置檔案內容:"
ls -la client/build/

# 複製到伺服器目錄
echo "📋 複製建置檔案到伺服器目錄..."
cp -r client/build server/

# 驗證複製結果
echo "🔍 驗證複製結果..."
if [ ! -f "server/build/index.html" ]; then
    echo "❌ 複製失敗：server/build/index.html 不存在"
    echo "📋 server 目錄內容:"
    ls -la server/
    exit 1
fi

echo "✅ 建置檔案複製成功"
echo "📋 伺服器建置目錄內容:"
ls -la server/build/

# 最終驗證
echo "🔍 最終驗證..."
echo "server/build/index.html 存在: $([ -f "server/build/index.html" ] && echo "✅" || echo "❌")"
echo "server/build/static 存在: $([ -d "server/build/static" ] && echo "✅" || echo "❌")"

# 檢查檔案大小
echo "📊 建置檔案統計:"
echo "  - client/build 大小: $(du -sh client/build | cut -f1)"
echo "  - server/build 大小: $(du -sh server/build | cut -f1)"
echo "  - 總檔案數: $(find server/build -type f | wc -l)"

# 列出所有可能的建置路徑
echo "🔍 列出所有可能的建置路徑:"
possible_paths=(
    "server/build"
    "client/build"
    "build"
    "../client/build"
    "../build"
    "../../client/build"
    "../../build"
)

for p in "${possible_paths[@]}"; do
    if [ -d "$p" ]; then
        echo "  ✅ $p 存在"
        ls -la "$p"
    else
        echo "  ❌ $p 不存在"
    fi
done

# 設定環境變數
export NODE_ENV=production
echo "📝 設定 NODE_ENV=production"

# 啟動伺服器
echo "🚀 啟動生產伺服器..."
echo "📊 部署資訊:"
echo "  - 環境: $NODE_ENV"
echo "  - 端口: ${PORT:-3001}"
echo "  - 建置路徑: server/build/"
echo "  - 資料庫: Supabase"

# 啟動伺服器
node server/index.js 