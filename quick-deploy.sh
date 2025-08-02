#!/bin/bash

echo "🚀 工時管理APP - Supabase快速部署"
echo "=================================="

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 檢查必要工具
check_requirements() {
    echo -e "${BLUE}📋 檢查系統需求...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ 錯誤: 請先安裝 Node.js${NC}"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ 錯誤: 請先安裝 npm${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 系統需求檢查完成${NC}"
}

# 設定Supabase
setup_supabase() {
    echo -e "${BLUE}🔧 設定Supabase...${NC}"
    
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}⚠️  找不到 .env 檔案${NC}"
        echo -e "${BLUE}📝 請按照以下步驟設定：${NC}"
        echo ""
        echo "1. 前往 https://supabase.com 建立專案"
        echo "2. 複製 env.example 為 .env"
        echo "3. 填入您的 Supabase URL 和 API Key"
        echo ""
        read -p "完成設定後按 Enter 繼續..."
    fi
    
    # 載入環境變數
    if [ -f ".env" ]; then
        source .env
        if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
            echo -e "${RED}❌ 錯誤: 請在 .env 檔案中設定 SUPABASE_URL 和 SUPABASE_ANON_KEY${NC}"
            exit 1
        fi
        echo -e "${GREEN}✅ Supabase配置完成${NC}"
    fi
}

# 安裝依賴
install_dependencies() {
    echo -e "${BLUE}📦 安裝依賴...${NC}"
    
    if npm run install-all; then
        echo -e "${GREEN}✅ 依賴安裝完成${NC}"
    else
        echo -e "${RED}❌ 依賴安裝失敗${NC}"
        exit 1
    fi
}

# 建置前端
build_frontend() {
    echo -e "${BLUE}🏗️  建置前端...${NC}"
    
    if cd client && npm run build && cd ..; then
        echo -e "${GREEN}✅ 前端建置完成${NC}"
    else
        echo -e "${RED}❌ 前端建置失敗${NC}"
        exit 1
    fi
}

# 啟動應用程式
start_application() {
    echo -e "${BLUE}🚀 啟動應用程式...${NC}"
    
    echo -e "${GREEN}✅ 部署完成！${NC}"
    echo ""
    echo -e "${BLUE}📱 應用程式資訊：${NC}"
    echo "  前端: http://localhost:3000"
    echo "  後端API: http://localhost:3001"
    echo "  資料庫: Supabase"
    echo ""
    echo -e "${YELLOW}💡 提示：${NC}"
    echo "  - 按 Ctrl+C 停止應用程式"
    echo "  - 查看 SUPABASE_DEPLOYMENT.md 了解詳細部署說明"
    echo ""
    
    # 啟動應用程式
    NODE_ENV=production node server/index.js
}

# 主函數
main() {
    echo -e "${BLUE}🎯 開始部署工時管理APP...${NC}"
    echo ""
    
    check_requirements
    setup_supabase
    install_dependencies
    build_frontend
    start_application
}

# 執行主函數
main 