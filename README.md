# 工時管理應用程式

一個簡單的工時管理系統，使用 React + Node.js + Supabase 建構。

## 功能特色

- 📊 專案管理
- ⏰ 工時記錄
- 📈 統計報表
- 🎨 現代化 UI 設計

## 技術架構

- **前端**: React + TypeScript + Tailwind CSS
- **後端**: Node.js + Express
- **資料庫**: Supabase (PostgreSQL)
- **開發工具**: Vite, Nodemon

## 快速開始

### 1. 環境需求

- Node.js 18.0.0 或以上
- npm 9.0.0 或以上
- Supabase 專案

### 2. 安裝依賴

```bash
# 安裝所有依賴
npm run install-all
```

### 3. 設定環境變數

```bash
# 複製環境變數範例檔案
cp env.example .env

# 編輯 .env 檔案，設定您的 Supabase 憑證
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3001
```

### 4. 設定資料庫

在 Supabase 中執行 `supabase-schema.sql` 檔案來建立資料庫表格。

### 5. 啟動應用程式

```bash
# 使用啟動腳本（推薦）
./start.sh

# 或手動啟動
npm run dev
```

應用程式將在以下位置運行：
- 前端: http://localhost:3000
- 後端 API: http://localhost:3001

## 專案結構

```
工時APP/
├── client/                 # React 前端
│   ├── src/
│   │   ├── components/     # React 元件
│   │   └── App.tsx         # 主應用程式
│   └── package.json
├── server/                 # Node.js 後端
│   ├── routes/             # API 路由
│   ├── index.js            # 伺服器入口
│   └── package.json
├── supabase-schema.sql     # 資料庫結構
├── env.example             # 環境變數範例
├── start.sh               # 啟動腳本
└── package.json
```

## API 端點

- `GET /api/projects` - 取得專案列表
- `POST /api/projects` - 建立新專案
- `GET /api/work-records` - 取得工時記錄
- `POST /api/work-records` - 建立工時記錄
- `GET /api/statistics` - 取得統計資料

## 開發指令

```bash
# 開發模式（同時啟動前端和後端）
npm run dev

# 僅啟動後端
npm run server:dev

# 僅啟動前端
npm run client:dev

# 安裝所有依賴
npm run install-all
```

## 故障排除

### 常見問題

1. **Supabase 連線錯誤**
   - 檢查 `.env` 檔案中的 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`
   - 確認 Supabase 專案已建立並啟用

2. **端口被佔用**
   - 檢查 3000 和 3001 端口是否被其他程序使用
   - 使用 `lsof -i :3000` 或 `lsof -i :3001` 查看

3. **依賴安裝失敗**
   - 清除 node_modules: `rm -rf node_modules client/node_modules server/node_modules`
   - 重新安裝: `npm run install-all`

## 授權

MIT License
