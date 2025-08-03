const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { supabase, initDatabase } = require('./supabase');

// 載入環境變數
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 基本中間件
app.use(cors({
  origin: NODE_ENV === 'production' ? false : 'http://localhost:3000',
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// 初始化資料庫
initDatabase();

// API路由
const projectsRouter = require('./routes/projects');
const workRecordsRouter = require('./routes/workRecords');
const statisticsRouter = require('./routes/statistics');

app.use('/api/projects', projectsRouter);
app.use('/api/work-records', workRecordsRouter);
app.use('/api/statistics', statisticsRouter);

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('伺服器錯誤:', err);
  res.status(500).json({ 
    error: '內部伺服器錯誤',
    message: err.message
  });
});

// 404處理
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'API端點不存在',
    message: `找不到路徑: ${req.originalUrl}`
  });
});

// 生產環境：服務靜態檔案
if (NODE_ENV === 'production') {
  const fs = require('fs');
  
  console.log('�� 生產環境：準備靜態檔案...');
  console.log('📁 當前目錄:', __dirname);
  
  // 定義靜態檔案路徑優先順序
  const staticPaths = [
    { path: path.join(__dirname, 'build'), name: '伺服器建置目錄' },
    { path: path.join(__dirname, '../client/build'), name: '前端建置目錄' },
    { path: path.join(__dirname, '../build'), name: '根目錄建置' }
  ];
  
  console.log('🔍 檢查靜態檔案路徑:');
  for (const { path: checkPath, name } of staticPaths) {
    console.log(`  - ${checkPath} (${name}): ${fs.existsSync(checkPath) ? '✅ 存在' : '❌ 不存在'}`);
  }
  
  let staticPath = null;
  
  for (const { path: checkPath, name } of staticPaths) {
    if (fs.existsSync(checkPath)) {
      staticPath = checkPath;
      console.log(`✅ 使用靜態檔案路徑: ${checkPath} (${name})`);
      break;
    }
  }
  
  if (staticPath) {
    app.use(express.static(staticPath, {
      maxAge: '1y',
      etag: true
    }));
    console.log('✅ 靜態檔案服務已啟用');
  } else {
    console.log('⚠️ 未找到靜態檔案路徑');
    console.log('📋 當前目錄內容:');
    try {
      console.log('  - 當前目錄:', fs.readdirSync(__dirname));
      console.log('  - 上層目錄:', fs.readdirSync(path.join(__dirname, '..')));
    } catch (err) {
      console.log('  - 無法讀取目錄:', err.message);
    }
  }

  // 所有其他請求都返回React應用程式
  app.get('*', (req, res) => {
    const indexPaths = [
      path.join(__dirname, 'build/index.html'),
      path.join(__dirname, '../client/build/index.html'),
      path.join(__dirname, '../build/index.html')
    ];
    
    console.log('🔍 檢查 index.html 路徑:');
    for (const indexPath of indexPaths) {
      console.log(`  - ${indexPath}: ${fs.existsSync(indexPath) ? '✅ 存在' : '❌ 不存在'}`);
    }
    
    for (const indexPath of indexPaths) {
      if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
      }
    }
    
    res.status(404).json({ 
      error: '前端應用程式檔案未找到',
      message: '請檢查建置流程'
    });
  });
}

// 啟動伺服器
const server = app.listen(PORT, () => {
  console.log(`🚀 伺服器運行在 http://localhost:${PORT}`);
  console.log(`🌍 環境: ${NODE_ENV}`);
  console.log(`📊 資料庫: Supabase`);
});

module.exports = { app, server }; 