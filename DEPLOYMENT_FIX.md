# 部署修復說明

## 問題描述
原始部署失敗，錯誤訊息顯示找不到 `/opt/render/project/src/client/build/index.html` 檔案。

## 問題原因
1. `render.yaml` 中的建置指令沒有將前端建置檔案複製到伺服器目錄
2. 伺服器程式碼中的靜態檔案路徑配置不正確

## 修復內容

### 1. 更新 `render.yaml`
- 在建置指令中添加了複製建置檔案的步驟
- 使用 `npm run install-all` 簡化依賴安裝流程
- 將 `client/build` 複製到 `server/` 目錄

### 2. 更新 `server/index.js`
- 修正靜態檔案服務的路徑檢查順序
- 將 `build/index.html` 設為優先路徑
- 更新 fallback 路由的路徑

### 3. 建置流程
```bash
# 安裝所有依賴
npm run install-all

# 建置前端
npm run build

# 複製建置檔案到伺服器目錄
cp -r client/build server/
```

## 測試結果
✅ 本地建置測試通過
✅ 伺服器能正確提供靜態檔案
✅ API 端點正常運作

## 部署步驟
1. 提交修復的程式碼到 Git
2. 推送到 Render 自動部署
3. 檢查部署日誌確認建置成功
4. 測試應用程式功能

## 注意事項
- 確保 Supabase 環境變數已正確設定
- 檢查健康檢查端點 `/api/projects` 是否正常
- 監控應用程式日誌以確保正常運作 