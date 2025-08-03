#!/bin/bash

set -e  # 遇到錯誤就停止執行

echo "🔍 Render.com 調試腳本..."

# 檢查當前目錄
echo "📁 當前目錄: $(pwd)"
echo "📋 目錄內容:"
ls -la

# 檢查環境
echo "🔍 檢查環境..."
node --version
npm --version

# 檢查目錄結構
echo "🔍 檢查目錄結構..."
echo "📋 根目錄內容:"
ls -la

echo "📋 client 目錄內容:"
if [ -d "client" ]; then
    ls -la client/
else
    echo "❌ client 目錄不存在"
fi

echo "📋 server 目錄內容:"
if [ -d "server" ]; then
    ls -la server/
else
    echo "❌ server 目錄不存在"
fi

# 檢查建置檔案
echo "🔍 檢查建置檔案..."
build_paths=(
    "client/build"
    "server/build"
    "build"
    "../client/build"
    "../build"
    "../../client/build"
    "../../build"
)

for path in "${build_paths[@]}"; do
    if [ -d "$path" ]; then
        echo "✅ $path 存在"
        echo "  📋 內容:"
        ls -la "$path"
    else
        echo "❌ $path 不存在"
    fi
done

# 檢查 package.json 檔案
echo "🔍 檢查 package.json 檔案..."
package_files=(
    "package.json"
    "client/package.json"
    "server/package.json"
)

for file in "${package_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file 存在"
        echo "  📋 內容:"
        head -10 "$file"
    else
        echo "❌ $file 不存在"
    fi
done

# 檢查 node_modules
echo "🔍 檢查 node_modules..."
node_modules_paths=(
    "node_modules"
    "client/node_modules"
    "server/node_modules"
)

for path in "${node_modules_paths[@]}"; do
    if [ -d "$path" ]; then
        echo "✅ $path 存在"
        echo "  📊 大小: $(du -sh "$path" | cut -f1)"
    else
        echo "❌ $path 不存在"
    fi
done

# 檢查環境變數
echo "🔍 檢查環境變數..."
echo "NODE_ENV: ${NODE_ENV:-未設定}"
echo "PORT: ${PORT:-未設定}"
echo "SUPABASE_URL: ${SUPABASE_URL:+已設定}"
echo "SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY:+已設定}"

# 檢查檔案權限
echo "🔍 檢查檔案權限..."
important_files=(
    "server/index.js"
    "server/fallback.html"
    "client/src/index.tsx"
    "client/public/index.html"
)

for file in "${important_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file 存在 (權限: $(ls -l "$file" | awk '{print $1}'))"
    else
        echo "❌ $file 不存在"
    fi
done

# 測試 npm 安裝
echo "🔍 測試 npm 安裝..."
if command -v npm &> /dev/null; then
    echo "✅ npm 可用"
    npm --version
else
    echo "❌ npm 不可用"
fi

# 測試 Node.js
echo "🔍 測試 Node.js..."
if command -v node &> /dev/null; then
    echo "✅ Node.js 可用"
    node --version
else
    echo "❌ Node.js 不可用"
fi

echo "🎉 調試完成！" 