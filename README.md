# 工時管理APP

一個簡單易用的工時管理應用程式，幫助您追蹤和管理不同專案的工作時間。

## 功能特色

### 前台功能
- **工時記錄**: 快速輸入工時，選擇專案，記錄工作內容
- **專案管理**: 新增、查看和刪除專案
- **記錄查看**: 查看所有工時記錄，支援按專案和日期篩選
- **統計分析**: 視覺化圖表顯示工時統計資料

### 後台功能
- **RESTful API**: 完整的後端API支援
- **SQLite資料庫**: 輕量級資料庫，無需額外設定
- **統計計算**: 自動計算總工時、專案分布等統計資料

## 技術棧

### 前端
- React 18 + TypeScript
- React Router (路由管理)
- Axios (HTTP請求)
- Recharts (圖表視覺化)
- CSS3 (樣式)

### 後端
- Node.js + Express
- Supabase (PostgreSQL資料庫)
- CORS (跨域支援)

## 快速開始

### 1. 設定Supabase

1. 前往 [supabase.com](https://supabase.com) 建立專案
2. 在SQL Editor中執行 `supabase-schema.sql` 的內容
3. 複製 `env.example` 為 `.env` 並填入您的Supabase配置

### 2. 安裝依賴

```bash
# 安裝所有依賴（包含前端和後端）
npm run install-all
```

### 3. 啟動應用程式

```bash
# 同時啟動前端和後端
npm run dev
```

或者分別啟動：

```bash
# 啟動後端伺服器 (http://localhost:3001)
npm run server

# 啟動前端開發伺服器 (http://localhost:3000)
npm run client
```

### 3. 使用應用程式

1. 開啟瀏覽器訪問 `http://localhost:3000`
2. 首先在「專案管理」頁面新增一些專案
3. 在「工時記錄」頁面開始記錄您的工時
4. 在「記錄查看」頁面查看所有記錄
5. 在「統計分析」頁面查看圖表和統計資料

## 專案結構

```
工時APP/
├── package.json              # 主專案配置
├── server/                   # 後端程式碼
│   ├── package.json         # 後端依賴
│   └── index.js             # 後端主程式
├── client/                   # 前端程式碼
│   ├── package.json         # 前端依賴
│   ├── public/              # 靜態檔案
│   └── src/                 # React 源碼
│       ├── components/      # React 組件
│       │   ├── TimeEntry.tsx
│       │   ├── ProjectManagement.tsx
│       │   ├── WorkRecords.tsx
│       │   └── Statistics.tsx
│       ├── App.tsx          # 主應用程式
│       ├── index.tsx        # 入口點
│       └── index.css        # 全域樣式
└── README.md                # 專案說明
```

## API 端點

### 專案管理
- `GET /api/projects` - 獲取所有專案
- `POST /api/projects` - 新增專案
- `DELETE /api/projects/:id` - 刪除專案

### 工時記錄
- `GET /api/work-records` - 獲取工時記錄（支援篩選）
- `POST /api/work-records` - 新增工時記錄
- `DELETE /api/work-records/:id` - 刪除工時記錄

### 統計資料
- `GET /api/statistics` - 獲取統計資料（支援日期範圍）

## 資料庫結構

### projects 表格
- `id` (BIGSERIAL, PRIMARY KEY)
- `name` (TEXT, UNIQUE)
- `description` (TEXT)
- `created_at` (TIMESTAMP WITH TIME ZONE)

### work_records 表格
- `id` (BIGSERIAL, PRIMARY KEY)
- `project_id` (BIGINT, FOREIGN KEY)
- `hours` (DECIMAL(5,2))
- `date` (DATE)
- `description` (TEXT)
- `created_at` (TIMESTAMP WITH TIME ZONE)

詳細的資料庫結構請參考 `supabase-schema.sql` 檔案。

## 使用說明

### 新增專案
1. 點擊「專案管理」標籤
2. 填寫專案名稱（必填）和描述（選填）
3. 點擊「新增專案」按鈕

### 記錄工時
1. 點擊「工時記錄」標籤
2. 選擇專案
3. 輸入工時（小時）
4. 選擇日期
5. 填寫工作描述（選填）
6. 點擊「新增工時記錄」

### 查看統計
1. 點擊「統計分析」標籤
2. 選擇日期範圍
3. 查看各種統計圖表和資料

## 開發說明

### 新增功能
1. 在 `server/index.js` 中新增API端點
2. 在 `client/src/components/` 中新增React組件
3. 更新路由配置

### 修改樣式
- 全域樣式：修改 `client/src/index.css`
- 組件樣式：在各組件檔案中新增CSS

### 資料庫修改
- 修改 `server/index.js` 中的 `initDatabase()` 函數
- 重新啟動伺服器以套用變更

## 注意事項

- 專案名稱必須是唯一的
- 無法刪除有工時記錄的專案
- 資料庫由Supabase管理，自動備份
- 建議定期檢查Supabase使用量

## 部署選項

### Supabase部署（推薦）
詳細說明請參考 `SUPABASE_DEPLOYMENT.md`

### 其他部署選項
- Docker部署：參考 `DEPLOYMENT.md`
- 雲端部署：Vercel、Netlify、Railway等

## 授權

MIT License 