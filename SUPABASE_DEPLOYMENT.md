# 工時管理APP Supabase部署指南

## 概述

本指南將幫助您將工時管理APP部署到Supabase平台。Supabase提供PostgreSQL資料庫、認證、即時API等功能，是一個優秀的後端即服務(BaaS)平台。

## 前置需求

1. **Supabase帳戶**
   - 前往 [supabase.com](https://supabase.com) 註冊帳戶
   - 建立新專案

2. **Node.js環境**
   - Node.js 18+
   - npm

## 部署步驟

### 1. 建立Supabase專案

1. 登入 [Supabase Dashboard](https://app.supabase.com)
2. 點擊 "New Project"
3. 選擇組織
4. 填寫專案資訊：
   - **Name**: worktime-app
   - **Database Password**: 設定強密碼
   - **Region**: 選擇離您最近的區域
5. 點擊 "Create new project"

### 2. 設定資料庫

1. 在Supabase Dashboard中，前往 **SQL Editor**
2. 複製 `supabase-schema.sql` 的內容
3. 貼上並執行SQL腳本
4. 確認表格和函數已建立

### 3. 取得API金鑰

1. 在Supabase Dashboard中，前往 **Settings > API**
2. 複製以下資訊：
   - **Project URL**
   - **anon public** 金鑰

### 4. 設定環境變數

1. 複製 `env.example` 為 `.env`
```bash
cp env.example .env
```

2. 編輯 `.env` 檔案，填入您的Supabase配置：
```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
NODE_ENV=development
PORT=3001
```

### 5. 安裝依賴

```bash
npm run install-all
```

### 6. 建置前端

```bash
cd client && npm run build && cd ..
```

### 7. 啟動應用程式

```bash
# 開發模式
npm run dev

# 或生產模式
NODE_ENV=production node server/index.js
```

## 雲端部署選項

### 1. Vercel部署（推薦）

#### 建立Vercel專案
1. 前往 [vercel.com](https://vercel.com) 註冊帳戶
2. 連接您的GitHub/GitLab帳戶
3. 匯入專案

#### 設定環境變數
在Vercel Dashboard中設定以下環境變數：
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `NODE_ENV=production`

#### 部署設定
- **Framework Preset**: Node.js
- **Build Command**: `npm run build`
- **Output Directory**: `client/build`
- **Install Command**: `npm run install-all`

### 2. Netlify部署

#### 建立Netlify專案
1. 前往 [netlify.com](https://netlify.com) 註冊帳戶
2. 連接您的GitHub/GitLab帳戶
3. 匯入專案

#### 設定環境變數
在Netlify Dashboard中設定環境變數

#### 部署設定
- **Build command**: `npm run build`
- **Publish directory**: `client/build`

### 3. Railway部署

#### 建立Railway專案
1. 前往 [railway.app](https://railway.app) 註冊帳戶
2. 連接您的GitHub帳戶
3. 建立新專案

#### 設定環境變數
在Railway Dashboard中設定環境變數

#### 部署設定
- **Build Command**: `npm run install-all && cd client && npm run build`
- **Start Command**: `NODE_ENV=production node server/index.js`

## 資料庫管理

### 1. 查看資料
在Supabase Dashboard中：
- **Table Editor**: 查看和編輯表格資料
- **SQL Editor**: 執行自定義查詢

### 2. 備份資料
```bash
# 使用Supabase CLI
supabase db dump --db-url "postgresql://postgres:[password]@[host]:5432/postgres"
```

### 3. 資料遷移
```bash
# 從SQLite遷移到Supabase
# 1. 匯出SQLite資料
sqlite3 worktime.db ".dump" > backup.sql

# 2. 轉換為PostgreSQL格式
# 3. 在Supabase SQL Editor中執行
```

## 安全設定

### 1. Row Level Security (RLS)
Supabase預設啟用RLS，您可以根據需要修改政策：

```sql
-- 範例：只允許特定用戶存取
CREATE POLICY "Users can only access their own data" ON work_records
  FOR ALL USING (auth.uid() = user_id);
```

### 2. API金鑰管理
- 定期輪換API金鑰
- 使用環境變數儲存敏感資訊
- 不要將金鑰提交到版本控制

### 3. 網路安全
- 設定CORS政策
- 使用HTTPS
- 實作速率限制

## 監控和維護

### 1. 效能監控
在Supabase Dashboard中：
- **Database**: 查看查詢效能
- **Logs**: 查看應用程式日誌
- **Metrics**: 監控API使用量

### 2. 成本管理
- 監控資料庫使用量
- 設定使用量警報
- 優化查詢效能

### 3. 備份策略
- Supabase自動備份
- 定期手動備份
- 測試還原流程

## 故障排除

### 常見問題

#### 1. 連接錯誤
```bash
# 檢查環境變數
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# 測試連接
curl -X GET "$SUPABASE_URL/rest/v1/projects" \
  -H "apikey: $SUPABASE_ANON_KEY"
```

#### 2. 權限錯誤
- 檢查RLS政策
- 確認API金鑰權限
- 查看Supabase日誌

#### 3. 建置錯誤
```bash
# 清理快取
rm -rf node_modules
npm install

# 重新建置
cd client && npm run build
```

## 擴展功能

### 1. 認證系統
```javascript
// 使用Supabase Auth
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)

// 註冊用戶
const { user, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
})
```

### 2. 即時功能
```javascript
// 即時訂閱工時記錄
const subscription = supabase
  .from('work_records')
  .on('INSERT', payload => {
    console.log('新工時記錄:', payload.new)
  })
  .subscribe()
```

### 3. 檔案儲存
```javascript
// 上傳檔案
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('public/avatar1.png', file)
```

## 聯絡支援

- **Supabase支援**: [supabase.com/support](https://supabase.com/support)
- **文件**: [supabase.com/docs](https://supabase.com/docs)
- **社群**: [github.com/supabase/supabase](https://github.com/supabase/supabase) 