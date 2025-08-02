require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🧪 測試 Supabase 連線...');

// 檢查環境變數
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('📋 環境變數檢查:');
console.log('SUPABASE_URL:', supabaseUrl ? '✅ 已設定' : '❌ 未設定');
console.log('SUPABASE_ANON_KEY:', supabaseKey ? '✅ 已設定' : '❌ 未設定');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 錯誤: 請設定 SUPABASE_URL 和 SUPABASE_ANON_KEY 環境變數');
  process.exit(1);
}

// 建立 Supabase 客戶端
const supabase = createClient(supabaseUrl, supabaseKey);

// 測試連線
async function testConnection() {
  try {
    console.log('🔗 測試 Supabase 連線...');
    
    // 嘗試執行一個簡單的查詢
    const { data, error } = await supabase
      .from('projects')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase 連線失敗:', error);
      
      // 檢查是否是表格不存在的錯誤
      if (error.message.includes('relation "projects" does not exist')) {
        console.log('ℹ️  表格不存在，這是正常的（首次運行）');
        console.log('✅ Supabase 連線成功，但需要初始化資料庫');
      } else {
        console.error('❌ 其他連線錯誤');
      }
    } else {
      console.log('✅ Supabase 連線成功！');
      console.log('📊 資料:', data);
    }
    
  } catch (error) {
    console.error('❌ 連線測試失敗:', error.message);
    
    // 檢查網路錯誤
    if (error.message.includes('fetch failed')) {
      console.log('🌐 可能是網路連線問題，請檢查：');
      console.log('  1. 網路連線是否正常');
      console.log('  2. Supabase 專案是否暫停');
      console.log('  3. URL 是否正確');
    }
  }
}

testConnection(); 