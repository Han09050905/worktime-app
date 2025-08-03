const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { supabase, initDatabase } = require('./supabase');

// 載入環境變數
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 基本中間件
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: 'development'
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

// 啟動伺服器
const server = app.listen(PORT, () => {
  console.log(`🚀 伺服器運行在 http://localhost:${PORT}`);
  console.log(`🌍 環境: development`);
  console.log(`📊 資料庫: Supabase`);
});

module.exports = { app, server }; 