const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { supabase } = require('../supabase');

const router = express.Router();

// 驗證規則
const workRecordValidation = [
  body('project_id')
    .isInt({ min: 1 })
    .withMessage('專案ID必須是有效的正整數'),
  body('hours')
    .isFloat({ min: 0.1, max: 24 })
    .withMessage('工時必須在0.1-24小時之間'),
  body('date')
    .isISO8601()
    .withMessage('日期格式必須是有效的ISO 8601格式'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('描述不能超過1000個字元')
];

const queryValidation = [
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('開始日期格式必須是有效的ISO 8601格式'),
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('結束日期格式必須是有效的ISO 8601格式'),
  query('project_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('專案ID必須是有效的正整數')
];

// 獲取工時記錄
router.get('/', queryValidation, async (req, res) => {
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

    const { start_date, end_date, project_id, page = 1, limit = 50 } = req.query;
    
    let query = supabase
      .from('work_records')
      .select(`
        *,
        projects(name)
      `)
      .order('date', { ascending: false });
    
    // 應用篩選條件
    if (start_date) {
      query = query.gte('date', start_date);
    }
    
    if (end_date) {
      query = query.lte('date', end_date);
    }
    
    if (project_id) {
      query = query.eq('project_id', project_id);
    }
    
    // 分頁
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    // 格式化資料
    const formattedData = data.map(record => ({
      ...record,
      project_name: record.projects.name
    }));
    
    res.json({
      success: true,
      data: formattedData,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || formattedData.length,
        hasMore: formattedData.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('獲取工時記錄失敗:', error);
    res.status(500).json({ 
      success: false,
      error: '獲取工時記錄失敗',
      message: error.message 
    });
  }
});

// 獲取單一工時記錄
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('work_records')
      .select(`
        *,
        projects(name)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false,
          error: '工時記錄不存在' 
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      data: {
        ...data,
        project_name: data.projects.name
      }
    });
  } catch (error) {
    console.error('獲取工時記錄失敗:', error);
    res.status(500).json({ 
      success: false,
      error: '獲取工時記錄失敗',
      message: error.message 
    });
  }
});

// 新增工時記錄
router.post('/', workRecordValidation, async (req, res) => {
  try {
    // 檢查驗證錯誤
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: '驗證失敗',
        details: errors.array()
      });
    }

    const { project_id, hours, date, description } = req.body;

    // 檢查專案是否存在
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', project_id)
      .single();
    
    if (projectError || !project) {
      return res.status(400).json({
        success: false,
        error: '指定的專案不存在'
      });
    }

    const { data, error } = await supabase
      .from('work_records')
      .insert([{ project_id, hours, date, description }])
      .select(`
        *,
        projects(name)
      `)
      .single();
    
    if (error) throw error;
    
    res.status(201).json({
      success: true,
      data: {
        ...data,
        project_name: data.projects.name
      },
      message: '工時記錄創建成功'
    });
  } catch (error) {
    console.error('新增工時記錄失敗:', error);
    res.status(500).json({ 
      success: false,
      error: '新增工時記錄失敗',
      message: error.message 
    });
  }
});

// 更新工時記錄
router.put('/:id', workRecordValidation, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 檢查驗證錯誤
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: '驗證失敗',
        details: errors.array()
      });
    }

    const { project_id, hours, date, description } = req.body;

    // 檢查專案是否存在
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', project_id)
      .single();
    
    if (projectError || !project) {
      return res.status(400).json({
        success: false,
        error: '指定的專案不存在'
      });
    }

    const { data, error } = await supabase
      .from('work_records')
      .update({ project_id, hours, date, description })
      .eq('id', id)
      .select(`
        *,
        projects(name)
      `)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false,
          error: '工時記錄不存在' 
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      data: {
        ...data,
        project_name: data.projects.name
      },
      message: '工時記錄更新成功'
    });
  } catch (error) {
    console.error('更新工時記錄失敗:', error);
    res.status(500).json({ 
      success: false,
      error: '更新工時記錄失敗',
      message: error.message 
    });
  }
});

// 刪除工時記錄
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('work_records')
      .delete()
      .eq('id', id);
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false,
          error: '工時記錄不存在' 
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      message: '工時記錄已刪除'
    });
  } catch (error) {
    console.error('刪除工時記錄失敗:', error);
    res.status(500).json({ 
      success: false,
      error: '刪除工時記錄失敗',
      message: error.message 
    });
  }
});

module.exports = router; 