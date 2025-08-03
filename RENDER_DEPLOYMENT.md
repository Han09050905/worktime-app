# Render 部署指南

## 🚀 部署到 Render.com

### 1. 準備工作

確保您的專案已經推送到 GitHub：
```bash
git push origin main
```

### 2. 在 Render.com 創建新服務

1. 登入 [Render.com](https://render.com)
2. 點擊 "New +" → "Web Service"
3. 連接您的 GitHub 倉庫
4. 選擇 `worktime-app` 倉庫

### 3. 配置設定

#### 基本設定
- **Name**: `worktime-app` (或您喜歡的名稱)
- **Environment**: `Node`
- **Region**: 選擇離您最近的區域
- **Branch**: `main`
- **Root Directory**: 留空 (使用根目錄)

#### 建置設定
- **Build Command**: `npm run render-build`
- **Start Command**: `npm start`

#### 環境變數
在 "Environment Variables" 部分添加：

| Key | Value | 說明 |
|-----|-------|------|
| `NODE_ENV` | `production` | 生產環境 |
| `SUPABASE_URL` | `your_supabase_url` | 您的 Supabase 專案 URL |
| `SUPABASE_ANON_KEY` | `your_supabase_anon_key` | 您的 Supabase 匿名金鑰 |

### 4. 部署

1. 點擊 "Create Web Service"
2. Render 會自動開始建置和部署
3. 等待建置完成 (通常需要 5-10 分鐘)

### 5. 驗證部署

部署完成後，您會得到一個 URL，例如：
```
https://worktime-app.onrender.com
```

#### 測試端點
- **健康檢查**: `https://worktime-app.onrender.com/health`
- **API 測試**: `https://worktime-app.onrender.com/api/projects`

### 6. 自動部署

每次推送到 `main` 分支時，Render 會自動重新部署。

## 🔧 故障排除

### 建置失敗
1. 檢查 `render.yaml` 配置是否正確
2. 確認所有依賴都已正確安裝
3. 查看建置日誌中的錯誤訊息

### 環境變數問題
1. 確認 Supabase 憑證已正確設定
2. 檢查環境變數名稱是否正確
3. 重新部署服務

### 靜態檔案問題
1. 確認前端建置成功
2. 檢查 `client/build` 目錄是否存在
3. 查看伺服器日誌

## 📊 監控

在 Render 儀表板中，您可以：
- 查看實時日誌
- 監控服務狀態
- 查看效能指標
- 設定告警

## 🔄 更新部署

要更新部署，只需：
```bash
git add .
git commit -m "更新訊息"
git push origin main
```

Render 會自動檢測更改並重新部署。

## 📞 支援

如果遇到問題：
1. 查看 Render 建置日誌
2. 檢查 GitHub Actions (如果使用)
3. 確認 Supabase 連線正常
4. 聯繫 Render 支援團隊 