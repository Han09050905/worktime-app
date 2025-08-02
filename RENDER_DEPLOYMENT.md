# 工時管理APP - Render部署指南

## 概述

本指南將幫助您將工時管理APP部署到Render平台。Render提供免費額度和簡單的部署流程，非常適合中小型專案。

## 前置需求

1. **Render帳戶**
   - 前往 [render.com](https://render.com) 註冊帳戶
   - 使用GitHub、GitLab或Google帳戶登入

2. **GitHub/GitLab專案**
   - 將程式碼推送到GitHub或GitLab
   - 確保專案是公開的（免費額度要求）

3. **Supabase專案**
   - 確保Supabase專案已設定完成
   - 記下Project URL和API Key

## 部署步驟

### 1. 準備程式碼

確保您的專案包含以下檔案：
- `render.yaml` - Render部署配置
- `package.json` - 包含必要的腳本
- `.gitignore` - 避免提交敏感檔案

### 2. 推送到Git

```bash
# 初始化Git倉庫（如果還沒有的話）
git init

# 加入所有檔案
git add .

# 提交變更
git commit -m "Initial commit for Render deployment"

# 推送到GitHub/GitLab
git push origin main
```

### 3. 在Render中建立服務

1. **登入Render**
   - 前往 [dashboard.render.com](https://dashboard.render.com)
   - 使用GitHub/GitLab帳戶登入

2. **建立新服務**
   - 點擊 "New +"
   - 選擇 "Web Service"
   - 連接您的GitHub/GitLab帳戶
   - 選擇您的專案倉庫

3. **配置服務**
   - **Name**: `worktime-app`
   - **Environment**: `Node`
   - **Build Command**: `npm run render-build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

### 4. 設定環境變數

在Render Dashboard中設定以下環境變數：

1. **前往服務設定**
   - 點擊您的服務
   - 前往 "Environment" 標籤

2. **新增環境變數**
   ```
   NODE_ENV=production
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   ```

### 5. 部署

1. **自動部署**
   - Render會自動檢測到您的 `render.yaml` 檔案
   - 點擊 "Create Web Service"
   - Render會自動開始建置和部署

2. **監控部署**
   - 在 "Events" 標籤中查看建置日誌
   - 等待部署完成

### 6. 測試部署

部署完成後，您會得到一個URL，例如：
`https://worktime-app.onrender.com`

測試以下端點：
- 首頁: `https://worktime-app.onrender.com`
- API: `https://worktime-app.onrender.com/api/projects`

## 配置說明

### render.yaml 配置

```yaml
services:
  - type: web
    name: worktime-app
    env: node
    buildCommand: npm run install-all && cd client && npm run build
    startCommand: NODE_ENV=production node server/index.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_ANON_KEY
        sync: false
    healthCheckPath: /api/projects
    autoDeploy: true
```

### package.json 腳本

```json
{
  "scripts": {
    "start": "NODE_ENV=production node server/index.js",
    "render-build": "npm run install-all && npm run build"
  }
}
```

## 免費額度限制

Render免費方案的限制：
- **每月750小時**（約31天）
- **512MB RAM**
- **共享CPU**
- **自動休眠**（15分鐘無活動後）

## 監控和維護

### 1. 查看日誌
- 在Render Dashboard中點擊您的服務
- 前往 "Logs" 標籤查看即時日誌

### 2. 效能監控
- 在 "Metrics" 標籤查看效能指標
- 監控記憶體和CPU使用量

### 3. 自動部署
- 每次推送到Git會觸發自動部署
- 可在 "Events" 標籤查看部署歷史

## 故障排除

### 常見問題

#### 1. 建置失敗
```bash
# 檢查建置日誌
# 確保所有依賴都正確安裝
# 檢查Node.js版本（需要18+）
```

#### 2. 環境變數錯誤
```bash
# 檢查環境變數是否正確設定
# 確保Supabase URL和Key正確
```

#### 3. 服務無法啟動
```bash
# 檢查startCommand是否正確
# 查看日誌中的錯誤訊息
```

#### 4. 健康檢查失敗
```bash
# 確保healthCheckPath正確
# 檢查API端點是否正常回應
```

## 升級到付費方案

如果需要更多資源，可以升級到付費方案：
- **Starter**: $7/月
- **Standard**: $25/月
- **Pro**: $100/月

## 聯絡支援

- **Render文件**: [render.com/docs](https://render.com/docs)
- **Render支援**: [render.com/support](https://render.com/support)
- **社群論壇**: [community.render.com](https://community.render.com) 