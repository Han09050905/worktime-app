# 工時統計應用程式 - 建置與部署指南

## 📋 重構摘要

本次重構簡化了建置和部署流程，改善了錯誤處理，並統一了各種環境的建置邏輯。

## 🚀 快速開始

### 本地開發
```bash
# 啟動開發伺服器
./start.sh
```

### 生產部署
```bash
# 快速部署
./quick-deploy.sh

# 或完整建置後部署
./build.sh
./deploy.sh
```

## 🔧 建置流程

### 統一建置腳本 (`build.sh`)
- ✅ 清理舊的建置檔案
- ✅ 安裝所有依賴
- ✅ 建置前端應用程式
- ✅ 複製建置檔案到伺服器目錄
- ✅ 驗證建置結果

### 建置路徑優先順序
1. `server/build/` - 伺服器建置目錄（優先）
2. `client/build/` - 前端建置目錄
3. `build/` - 根目錄建置

## 🚀 部署流程

### 快速部署 (`quick-deploy.sh`)
- ✅ 檢查環境變數
- ✅ 自動建置（如果需要）
- ✅ 啟動生產伺服器

### 完整部署 (`deploy.sh`)
- ✅ 執行完整建置流程
- ✅ 驗證建置結果
- ✅ 啟動生產伺服器

## 🔍 靜態檔案處理

### 重構後的邏輯
```javascript
// 定義靜態檔案路徑優先順序
const staticPaths = [
  { path: path.join(__dirname, 'build'), name: '伺服器建置目錄' },
  { path: path.join(__dirname, '../client/build'), name: '前端建置目錄' },
  { path: path.join(__dirname, '../build'), name: '根目錄建置' }
];
```

### 錯誤處理
- ✅ 清晰的錯誤訊息
- ✅ 自動創建備用建置
- ✅ 詳細的日誌記錄

## 🧪 測試

### 建置測試 (`test-build.sh`)
```bash
./test-build.sh
```

測試內容：
- ✅ 檢查必要檔案
- ✅ 執行建置流程
- ✅ 驗證建置結果
- ✅ 測試伺服器啟動
- ✅ 檢查健康端點

## 📊 部署環境

### Render.com (`render.yaml`)
- ✅ 統一的建置流程
- ✅ 清晰的錯誤處理
- ✅ 自動健康檢查

### 環境變數
```bash
NODE_ENV=production
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🔧 故障排除

### 常見問題

1. **建置檔案不存在**
   ```bash
   # 重新執行建置
   ./build.sh
   ```

2. **依賴安裝失敗**
   ```bash
   # 清理並重新安裝
   rm -rf node_modules client/node_modules server/node_modules
   npm install
   cd client && npm install && cd ..
   cd server && npm install && cd ..
   ```

3. **靜態檔案服務失敗**
   - 檢查 `server/build/` 目錄是否存在
   - 確認 `index.html` 檔案存在
   - 查看伺服器日誌

### 日誌檢查
```bash
# 查看建置日誌
./build.sh 2>&1 | tee build.log

# 查看伺服器日誌
node server/index.js 2>&1 | tee server.log
```

## 📈 效能優化

### 建置優化
- ✅ 清理舊建置檔案
- ✅ 增量依賴安裝
- ✅ 建置結果驗證

### 部署優化
- ✅ 快速部署模式
- ✅ 環境檢查
- ✅ 自動錯誤恢復

## 🎯 最佳實踐

1. **開發環境**
   - 使用 `./start.sh` 啟動開發伺服器
   - 前端在 `http://localhost:3000`
   - 後端在 `http://localhost:3001`

2. **生產環境**
   - 使用 `./quick-deploy.sh` 快速部署
   - 確保環境變數正確設定
   - 定期執行 `./test-build.sh` 驗證

3. **CI/CD**
   - 使用 `./build.sh` 進行建置
   - 使用 `./test-build.sh` 進行測試
   - 部署前驗證建置結果

## 📝 更新日誌

### v2.0.0 - 重構版本
- ✅ 簡化建置流程
- ✅ 改善錯誤處理
- ✅ 統一部署邏輯
- ✅ 新增測試腳本
- ✅ 優化靜態檔案處理 