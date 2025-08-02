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
  app.use(express.static(path.join(__dirname, '../client/build')));
  console.log('靜態檔案路徑:', path.join(__dirname, '../client/build'));
}

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
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 伺服器運行在 http://localhost:${PORT}`);
  console.log(`🌍 環境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 資料庫: Supabase`);
}); 