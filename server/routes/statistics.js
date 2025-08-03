const express = require('express');
const { query, validationResult } = require('express-validator');
const { supabase } = require('../supabase');

const router = express.Router();

// 驗證規則
const statisticsValidation = [
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('開始日期格式必須是有效的ISO 8601格式'),
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('結束日期格式必須是有效的ISO 8601格式'),
  query('group_by')
    .optional()
    .isIn(['day', 'week', 'month', 'project'])
    .withMessage('分組方式必須是 day, week, month 或 project')
];

// 獲取統計資料
router.get('/', statisticsValidation, async (req, res) => {
  try {
    // 檢查驗證錯誤
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: '查詢參數驗證失敗',
        details: errors.array()
      });
    }

    const { start_date, end_date, group_by = 'day' } = req.query;
    
    // 建立日期篩選條件
    let dateFilter = '';
    if (start_date && end_date) {
      dateFilter = `WHERE date BETWEEN '${start_date}' AND '${end_date}'`;
    } else if (start_date) {
      dateFilter = `WHERE date >= '${start_date}'`;
    } else if (end_date) {
      dateFilter = `WHERE date <= '${end_date}'`;
    }

    try {
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

      // 按週統計
      const { data: weeklyStats, error: weeklyError } = await supabase
        .rpc('get_weekly_statistics', { date_filter: dateFilter });
      
      if (weeklyError) throw weeklyError;

      // 按月統計
      const { data: monthlyStats, error: monthlyError } = await supabase
        .rpc('get_monthly_statistics', { date_filter: dateFilter });
      
      if (monthlyError) throw monthlyError;

      // 計算平均值
      const totalHours = totalData[0]?.total_hours || 0;
      const totalRecords = totalData[0]?.total_records || 0;
      const averageHours = totalRecords > 0 ? totalHours / totalRecords : 0;

      // 根據分組方式返回對應的統計資料
      let groupedStats = [];
      switch (group_by) {
        case 'day':
          groupedStats = dailyStats || [];
          break;
        case 'week':
          groupedStats = weeklyStats || [];
          break;
        case 'month':
          groupedStats = monthlyStats || [];
          break;
        case 'project':
          groupedStats = projectStats || [];
          break;
      }

      res.json({
        success: true,
        data: {
          summary: {
            total_hours: totalHours,
            total_records: totalRecords,
            average_hours_per_record: Math.round(averageHours * 100) / 100,
            date_range: {
              start_date: start_date || null,
              end_date: end_date || null
            }
          },
          project_statistics: projectStats || [],
          daily_statistics: dailyStats || [],
          weekly_statistics: weeklyStats || [],
          monthly_statistics: monthlyStats || [],
          grouped_statistics: groupedStats
        },
        meta: {
          group_by,
          date_filter: dateFilter || '無篩選'
        }
      });
    } catch (rpcError) {
      // 如果 RPC 函數不存在，使用基本查詢
      console.log('RPC 函數不可用，使用基本查詢:', rpcError.message);
      
      let query = supabase
        .from('work_records')
        .select(`
          *,
          projects(name)
        `);
      
      if (start_date) {
        query = query.gte('date', start_date);
      }
      
      if (end_date) {
        query = query.lte('date', end_date);
      }
      
      const { data: records, error } = await query;
      
      if (error) throw error;
      
      // 手動計算統計資料
      const totalHours = records.reduce((sum, record) => sum + parseFloat(record.hours), 0);
      const totalRecords = records.length;
      const averageHours = totalRecords > 0 ? totalHours / totalRecords : 0;
      
      // 按專案分組
      const projectStats = records.reduce((acc, record) => {
        const projectName = record.projects.name;
        if (!acc[projectName]) {
          acc[projectName] = { project_name: projectName, total_hours: 0, record_count: 0 };
        }
        acc[projectName].total_hours += parseFloat(record.hours);
        acc[projectName].record_count += 1;
        return acc;
      }, {});
      
      // 按日期分組
      const dailyStats = records.reduce((acc, record) => {
        const date = record.date;
        if (!acc[date]) {
          acc[date] = { date, total_hours: 0, record_count: 0 };
        }
        acc[date].total_hours += parseFloat(record.hours);
        acc[date].record_count += 1;
        return acc;
      }, {});
      
      res.json({
        success: true,
        data: {
          summary: {
            total_hours: Math.round(totalHours * 100) / 100,
            total_records: totalRecords,
            average_hours_per_record: Math.round(averageHours * 100) / 100,
            date_range: {
              start_date: start_date || null,
              end_date: end_date || null
            }
          },
          project_statistics: Object.values(projectStats),
          daily_statistics: Object.values(dailyStats).sort((a, b) => new Date(b.date) - new Date(a.date)),
          weekly_statistics: [],
          monthly_statistics: [],
          grouped_statistics: group_by === 'project' ? Object.values(projectStats) : Object.values(dailyStats)
        },
        meta: {
          group_by,
          date_filter: dateFilter || '無篩選',
          calculation_method: 'basic_query'
        }
      });
    }
  } catch (error) {
    console.error('獲取統計資料失敗:', error);
    res.status(500).json({ 
      success: false,
      error: '獲取統計資料失敗',
      message: error.message 
    });
  }
});

// 獲取專案統計
router.get('/projects', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let query = supabase
      .from('work_records')
      .select(`
        hours,
        projects(name)
      `);
    
    if (start_date) {
      query = query.gte('date', start_date);
    }
    
    if (end_date) {
      query = query.lte('date', end_date);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // 按專案分組計算
    const projectStats = data.reduce((acc, record) => {
      const projectName = record.projects.name;
      if (!acc[projectName]) {
        acc[projectName] = { project_name: projectName, total_hours: 0, record_count: 0 };
      }
      acc[projectName].total_hours += parseFloat(record.hours);
      acc[projectName].record_count += 1;
      return acc;
    }, {});
    
    const result = Object.values(projectStats).map(stat => ({
      ...stat,
      total_hours: Math.round(stat.total_hours * 100) / 100,
      average_hours: Math.round((stat.total_hours / stat.record_count) * 100) / 100
    }));
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('獲取專案統計失敗:', error);
    res.status(500).json({ 
      success: false,
      error: '獲取專案統計失敗',
      message: error.message 
    });
  }
});

// 獲取時間範圍統計
router.get('/time-range', async (req, res) => {
  try {
    const { start_date, end_date, group_by = 'day' } = req.query;
    
    let query = supabase
      .from('work_records')
      .select('hours, date')
      .order('date');
    
    if (start_date) {
      query = query.gte('date', start_date);
    }
    
    if (end_date) {
      query = query.lte('date', end_date);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // 按時間分組
    const timeStats = data.reduce((acc, record) => {
      let key;
      const date = new Date(record.date);
      
      switch (group_by) {
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default: // day
          key = record.date;
      }
      
      if (!acc[key]) {
        acc[key] = { period: key, total_hours: 0, record_count: 0 };
      }
      acc[key].total_hours += parseFloat(record.hours);
      acc[key].record_count += 1;
      return acc;
    }, {});
    
    const result = Object.values(timeStats).map(stat => ({
      ...stat,
      total_hours: Math.round(stat.total_hours * 100) / 100,
      average_hours: Math.round((stat.total_hours / stat.record_count) * 100) / 100
    }));
    
    res.json({
      success: true,
      data: result,
      meta: {
        group_by,
        date_range: { start_date, end_date }
      }
    });
  } catch (error) {
    console.error('獲取時間範圍統計失敗:', error);
    res.status(500).json({ 
      success: false,
      error: '獲取時間範圍統計失敗',
      message: error.message 
    });
  }
});

module.exports = router; 