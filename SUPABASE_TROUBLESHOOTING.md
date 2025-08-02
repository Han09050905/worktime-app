# Supabase 連線問題故障排除

## 問題描述
應用程式在 Render 部署後出現 Supabase 連線錯誤：
```
fetch failed
Failed to fetch
```

## 本地測試結果
✅ Supabase 連線正常
✅ 環境變數正確設定
✅ 資料庫表格存在且有資料

## 可能原因和解決方案

### 1. Render 環境變數未設定
**問題**：Render 部署環境中沒有正確設定 Supabase 環境變數

**解決方案**：
1. 登入 Render 儀表板
2. 進入您的應用程式設定
3. 在 "Environment" 區段添加以下環境變數：
   ```
   SUPABASE_URL=https://bglybonntvdkzutogdqn.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbHlib25udHZka3p1dG9nZHFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNTAwMDAsImV4cCI6MjA2OTcyNjAwMH0.IQkVp6orP8TRcLs293AYC68Yi9wENCS9p4gPUijTH2Q
   NODE_ENV=production
   ```

### 2. Supabase 專案暫停
**問題**：Supabase 專案可能因為閒置而被暫停

**解決方案**：
1. 登入 Supabase 儀表板
2. 檢查專案狀態
3. 如果專案暫停，重新啟動專案

### 3. 網路連線問題
**問題**：Render 伺服器無法連接到 Supabase

**解決方案**：
1. 檢查 Supabase 專案的網路設定
2. 確認沒有 IP 白名單限制
3. 檢查防火牆設定

### 4. 環境變數載入問題
**問題**：伺服器啟動時環境變數沒有正確載入

**解決方案**：
1. 確保 `.env` 檔案在生產環境中正確處理
2. 檢查 `dotenv` 配置

## 檢查步驟

### 1. 檢查 Render 日誌
```bash
# 在 Render 儀表板中查看部署日誌
# 尋找環境變數相關的錯誤訊息
```

### 2. 測試環境變數
在 `server/index.js` 中添加除錯資訊：
```javascript
console.log('環境變數檢查:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '已設定' : '未設定');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '已設定' : '未設定');
```

### 3. 檢查 Supabase 專案狀態
1. 登入 Supabase 儀表板
2. 檢查專案是否活躍
3. 確認 API 金鑰是否有效

## 立即行動項目

1. **設定 Render 環境變數**
   - 登入 Render 儀表板
   - 添加 SUPABASE_URL 和 SUPABASE_ANON_KEY

2. **檢查 Supabase 專案**
   - 確認專案狀態
   - 重新啟動如果暫停

3. **重新部署**
   - 推送任何配置變更
   - 監控部署日誌

## 預防措施

1. **定期檢查 Supabase 專案狀態**
2. **監控應用程式日誌**
3. **設定健康檢查警報**
4. **備份重要資料**

## 聯絡支援

如果問題持續存在：
1. 檢查 Supabase 狀態頁面
2. 聯絡 Supabase 支援
3. 檢查 Render 狀態頁面 