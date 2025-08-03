const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../supabase');

const router = express.Router();

// 驗證規則
const projectValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('專案名稱必須在1-100個字元之間'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('專案描述不能超過500個字元')
];

// 獲取所有專案
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      count: data.length
    });
  } catch (error) {
    console.error('獲取專案失敗:', error);
    res.status(500).json({ 
      success: false,
      error: '獲取專案失敗',
      message: error.message 
    });
  }
});

// 獲取單一專案
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false,
          error: '專案不存在' 
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('獲取專案失敗:', error);
    res.status(500).json({ 
      success: false,
      error: '獲取專案失敗',
      message: error.message 
    });
  }
});

// 新增專案
router.post('/', projectValidation, async (req, res) => {
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

    const { name, description } = req.body;

    const { data, error } = await supabase
      .from('projects')
      .insert([{ name, description }])
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') { // 唯一約束違反
        return res.status(400).json({ 
          success: false,
          error: '專案名稱已存在' 
        });
      }
      throw error;
    }
    
    res.status(201).json({
      success: true,
      data,
      message: '專案創建成功'
    });
  } catch (error) {
    console.error('新增專案失敗:', error);
    res.status(500).json({ 
      success: false,
      error: '新增專案失敗',
      message: error.message 
    });
  }
});

// 更新專案
router.put('/:id', projectValidation, async (req, res) => {
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

    const { name, description } = req.body;

    const { data, error } = await supabase
      .from('projects')
      .update({ name, description })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false,
          error: '專案不存在' 
        });
      }
      if (error.code === '23505') { // 唯一約束違反
        return res.status(400).json({ 
          success: false,
          error: '專案名稱已存在' 
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      data,
      message: '專案更新成功'
    });
  } catch (error) {
    console.error('更新專案失敗:', error);
    res.status(500).json({ 
      success: false,
      error: '更新專案失敗',
      message: error.message 
    });
  }
});

// 刪除專案
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 先檢查是否有相關的工時記錄
    const { data: records, error: checkError } = await supabase
      .from('work_records')
      .select('id')
      .eq('project_id', id);
    
    if (checkError) throw checkError;
    
    if (records.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: '無法刪除有工時記錄的專案',
        message: `該專案有 ${records.length} 筆工時記錄`
      });
    }
    
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false,
          error: '專案不存在' 
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      message: '專案已刪除'
    });
  } catch (error) {
    console.error('刪除專案失敗:', error);
    res.status(500).json({ 
      success: false,
      error: '刪除專案失敗',
      message: error.message 
    });
  }
});

module.exports = router; 