let createClient;
try {
  const supabaseModule = require('@supabase/supabase-js');
  createClient = supabaseModule.createClient;
} catch (error) {
  console.error('❌ 無法載入 @supabase/supabase-js:', error.message);
  console.error('請確保已安裝 Supabase 依賴: npm install @supabase/supabase-js');
  process.exit(1);
}

require('dotenv').config();

// Supabase配置
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 錯誤: 請設定 SUPABASE_URL 和 SUPABASE_ANON_KEY 環境變數');
  process.exit(1);
}

// 建立Supabase客戶端
const supabase = createClient(supabaseUrl, supabaseKey);

// 初始化資料庫表格
async function initDatabase() {
  try {
    console.log('🔧 初始化Supabase資料庫...');
    
    // 檢查表格是否存在
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('count')
      .limit(1);
    
    if (projectsError) {
      console.log('⚠️ projects表格可能不存在，請確保已執行 supabase-schema.sql');
    } else {
      console.log('✅ projects表格存在');
    }
    
    const { data: records, error: recordsError } = await supabase
      .from('work_records')
      .select('count')
      .limit(1);
    
    if (recordsError) {
      console.log('⚠️ work_records表格可能不存在，請確保已執行 supabase-schema.sql');
    } else {
      console.log('✅ work_records表格存在');
    }
    
    console.log('✅ Supabase資料庫初始化完成');
  } catch (error) {
    console.error('❌ 資料庫初始化失敗:', error);
  }
}

module.exports = { supabase, initDatabase }; 