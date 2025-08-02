const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { supabase, initDatabase } = require('./supabase');

const app = express();
const PORT = process.env.PORT || 3001;

// 中間件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 生產環境：服務靜態檔案
if (process.env.NODE_ENV === 'production') {
  const fs = require('fs');
  
  // 嘗試多個可能的靜態檔案路徑
  const possiblePaths = [
    path.join(__dirname, 'build'),
    path.join(__dirname, '../client/build'),
    path.join(__dirname, '../../client/build'),
    path.join(__dirname, '../build'),
    path.join(__dirname, '../../build')
  ];
  
  console.log('當前目錄:', __dirname);
  console.log('嘗試的靜態檔案路徑:');
  possiblePaths.forEach((p, i) => console.log(`  ${i + 1}. ${p}`));
  
  let staticPath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      staticPath = p;
      console.log(`✅ 找到靜態檔案路徑: ${p}`);
      break;
    }
  }
  
  if (staticPath) {
    app.use(express.static(staticPath));
    console.log('✅ 靜態檔案服務已啟用');
    
    // 列出靜態檔案目錄內容
    try {
      const files = fs.readdirSync(staticPath);
      console.log('靜態檔案目錄內容:', files);
    } catch (err) {
      console.log('無法讀取靜態檔案目錄:', err.message);
    }
  } else {
    console.log('⚠️ 未找到靜態檔案路徑，跳過靜態檔案服務');
    
    // 列出當前目錄和上層目錄內容
    try {
      const currentDir = fs.readdirSync(__dirname);
      console.log('當前目錄內容:', currentDir);
      
      const parentDir = path.join(__dirname, '..');
      const parentFiles = fs.readdirSync(parentDir);
      console.log('上層目錄內容:', parentFiles);
    } catch (err) {
      console.log('無法讀取目錄:', err.message);
    }
  }
}

// 檢查環境變數
console.log('🔍 環境變數檢查:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ 已設定' : '❌ 未設定');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ 已設定' : '❌ 未設定');

// 初始化Supabase
initDatabase();

// API 路由

// 獲取所有專案
app.get('/api/projects', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('name');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('獲取專案失敗:', error);
    res.status(500).json({ error: error.message });
  }
});

// 新增專案
app.post('/api/projects', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: '專案名稱是必填的' });
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([{ name, description }])
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') { // 唯一約束違反
        return res.status(400).json({ error: '專案名稱已存在' });
      }
      throw error;
    }
    
    res.json(data);
  } catch (error) {
    console.error('新增專案失敗:', error);
    res.status(500).json({ error: error.message });
  }
});

// 獲取工時記錄
app.get('/api/work-records', async (req, res) => {
  try {
    const { start_date, end_date, project_id } = req.query;
    
    let query = supabase
      .from('work_records')
      .select(`
        *,
        projects(name)
      `)
      .order('date', { ascending: false });
    
    if (start_date) {
      query = query.gte('date', start_date);
    }
    
    if (end_date) {
      query = query.lte('date', end_date);
    }
    
    if (project_id) {
      query = query.eq('project_id', project_id);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // 格式化資料
    const formattedData = data.map(record => ({
      ...record,
      project_name: record.projects.name
    }));
    
    res.json(formattedData);
  } catch (error) {
    console.error('獲取工時記錄失敗:', error);
    res.status(500).json({ error: error.message });
  }
});

// 新增工時記錄
app.post('/api/work-records', async (req, res) => {
  try {
    const { project_id, hours, date, description } = req.body;
    
    if (!project_id || !hours || !date) {
      return res.status(400).json({ error: '專案、工時和日期都是必填的' });
    }

    const { data, error } = await supabase
      .from('work_records')
      .insert([{ project_id, hours, date, description }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('新增工時記錄失敗:', error);
    res.status(500).json({ error: error.message });
  }
});

// 獲取統計資料
app.get('/api/statistics', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    // 建立日期篩選條件
    let dateFilter = '';
    if (start_date && end_date) {
      dateFilter = `WHERE date BETWEEN '${start_date}' AND '${end_date}'`;
    }

    // 總工時
    const { data: totalData, error: totalError } = await supabase
      .rpc('get_total_hours', { date_filter: dateFilter });
    
    if (totalError) throw totalError;

    // 按專案統計
    const { data: projectStats, error: projectError } = await supabase
      .rpc('get_project_statistics', { date_filter: dateFilter });
    
    if (projectError) throw projectError;

    // 按日期統計
    const { data: dailyStats, error: dailyError } = await supabase
      .rpc('get_daily_statistics', { date_filter: dateFilter });
    
    if (dailyError) throw dailyError;

    res.json({
      total_hours: totalData[0]?.total_hours || 0,
      project_statistics: projectStats,
      daily_statistics: dailyStats
    });
  } catch (error) {
    console.error('獲取統計資料失敗:', error);
    res.status(500).json({ error: error.message });
  }
});

// 刪除工時記錄
app.delete('/api/work-records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('work_records')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ message: '記錄已刪除' });
  } catch (error) {
    console.error('刪除工時記錄失敗:', error);
    res.status(500).json({ error: error.message });
  }
});

// 刪除專案
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 先檢查是否有相關的工時記錄
    const { data: records, error: checkError } = await supabase
      .from('work_records')
      .select('id')
      .eq('project_id', id);
    
    if (checkError) throw checkError;
    
    if (records.length > 0) {
      return res.status(400).json({ error: '無法刪除有工時記錄的專案' });
    }
    
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ message: '專案已刪除' });
  } catch (error) {
    console.error('刪除專案失敗:', error);
    res.status(500).json({ error: error.message });
  }
});

// 生產環境：所有其他請求都返回React應用程式
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'build/index.html');
    console.log('嘗試提供 index.html:', indexPath);
    
    // 檢查檔案是否存在
    if (require('fs').existsSync(indexPath)) {
      console.log('✅ index.html 檔案存在，正在提供...');
      res.sendFile(indexPath);
    } else {
      console.log('❌ index.html 檔案不存在');
      console.log('當前目錄內容:', require('fs').readdirSync(__dirname));
      
      // 嘗試其他可能的路徑
      const alternativePaths = [
        path.join(__dirname, '../client/build/index.html'),
        path.join(__dirname, '../../client/build/index.html'),
        path.join(__dirname, '../build/index.html')
      ];
      
      for (const altPath of alternativePaths) {
        if (require('fs').existsSync(altPath)) {
          console.log(`✅ 找到替代路徑: ${altPath}`);
          return res.sendFile(altPath);
        }
      }
      
      // 如果都找不到，返回錯誤
      res.status(404).json({ 
        error: 'index.html not found',
        message: '前端應用程式檔案未找到，請檢查建置流程',
        paths: [indexPath, ...alternativePaths]
      });
    }
  });
}

app.listen(PORT, () => {
  console.log(`🚀 伺服器運行在 http://localhost:${PORT}`);
  console.log(`🌍 環境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 資料庫: Supabase`);
}); 