# Render.com 部署故障排除指南

## 🔍 常見問題

### 1. 靜態檔案路徑找不到

**錯誤訊息：**
```
🔍 檢查靜態檔案路徑:
  ❌ /opt/render/project/src/server/build (伺服器建置目錄)
  ❌ /opt/render/project/src/client/build (前端建置目錄)
  ❌ /opt/render/project/src/build (根目錄建置)
```

**解決方案：**

1. **檢查建置流程**
   - 確保 `render.yaml` 中的建置命令正確執行
   - 檢查建置日誌是否有錯誤

2. **檢查目錄結構**
   ```bash
   # 在 render.yaml 中添加調試信息
   echo "📁 當前目錄: $(pwd)"
   echo "📋 目錄內容:"
   ls -la
   ```

3. **手動建置測試**
   ```bash
   # 使用本地建置腳本測試
   ./render-build.sh
   ```

### 2. 前端建置失敗

**錯誤訊息：**
```
❌ 前端建置失敗：client/build 目錄不存在
```

**解決方案：**

1. **檢查依賴安裝**
   ```bash
   cd client
   npm install
   npm run build
   ```

2. **檢查環境變數**
   ```bash
   export CI=false
   export GENERATE_SOURCEMAP=false
   npm run build
   ```

3. **檢查 Node.js 版本**
   ```bash
   node --version
   npm --version
   ```

### 3. 檔案複製失敗

**錯誤訊息：**
```
❌ 複製失敗：server/build/index.html 不存在
```

**解決方案：**

1. **檢查建置結果**
   ```bash
   ls -la client/build/
   ls -la server/
   ```

2. **手動複製**
   ```bash
   cp -r client/build server/
   ```

3. **檢查權限**
   ```bash
   chmod -R 755 server/build/
   ```

## 🔧 調試步驟

### 1. 檢查建置日誌

在 Render.com 控制台中：
1. 前往您的服務
2. 點擊 "Logs" 標籤
3. 查看建置日誌

### 2. 檢查檔案結構

在 `render.yaml` 中添加：
```yaml
buildCommand: |
  echo "📁 當前目錄: $(pwd)"
  echo "📋 目錄內容:"
  ls -la
  echo "📋 client 目錄內容:"
  ls -la client/
  echo "📋 server 目錄內容:"
  ls -la server/
```

### 3. 檢查環境變數

確保以下環境變數已設定：
- `NODE_ENV=production`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## 🚀 快速修復

### 1. 重新部署

1. 在 Render.com 控制台中手動觸發重新部署
2. 或推送新的提交到 Git

### 2. 使用備用建置

如果建置失敗，伺服器會自動創建備用 HTML 檔案：
- 檢查 `server/fallback.html` 是否存在
- 備用檔案提供基本的 API 測試功能

### 3. 本地測試

在部署前先在本地測試：
```bash
# 測試建置
./render-build.sh

# 測試部署
./render-deploy.sh
```

## 📊 監控和日誌

### 1. 健康檢查

確保健康檢查端點正常：
```bash
curl https://your-app.onrender.com/health
```

### 2. 應用程式日誌

在 Render.com 控制台中查看：
- 建置日誌
- 運行時日誌
- 錯誤日誌

### 3. 性能監控

- 檢查記憶體使用量
- 監控響應時間
- 查看錯誤率

## 🎯 最佳實踐

### 1. 建置優化

- 使用 `CI=false` 避免 CI 環境的嚴格檢查
- 使用 `GENERATE_SOURCEMAP=false` 減少建置大小
- 清理舊的建置檔案

### 2. 錯誤處理

- 提供詳細的錯誤訊息
- 實現自動備用機制
- 記錄所有重要操作

### 3. 部署策略

- 使用藍綠部署
- 實現回滾機制
- 監控部署狀態

## 📞 支援

如果問題持續存在：

1. **檢查 Render.com 狀態頁面**
2. **查看 Render.com 文檔**
3. **聯繫 Render.com 支援**
4. **檢查 GitHub Issues**

## 🔄 更新日誌

### v2.1.0 - 故障排除版本
- ✅ 新增詳細的調試信息
- ✅ 改善錯誤處理機制
- ✅ 新增備用建置路徑
- ✅ 創建故障排除指南 