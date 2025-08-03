#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 檢查工時管理應用程式設定...\n');

// 檢查必要檔案
const requiredFiles = [
  'package.json',
  'server/package.json',
  'client/package.json',
  'server/index.js',
  'server/supabase.js',
  'supabase-schema.sql',
  'env.example',
  'start.sh'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - 檔案不存在`);
    allFilesExist = false;
  }
});

console.log('\n📦 檢查依賴...');

// 檢查 package.json 內容
try {
  const rootPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`✅ 根目錄 package.json - 版本: ${rootPackage.version}`);
  
  const serverPackage = JSON.parse(fs.readFileSync('server/package.json', 'utf8'));
  console.log(`✅ 伺服器 package.json - 版本: ${serverPackage.version}`);
  
  const clientPackage = JSON.parse(fs.readFileSync('client/package.json', 'utf8'));
  console.log(`✅ 前端 package.json - 版本: ${clientPackage.version}`);
  
} catch (error) {
  console.log(`❌ 讀取 package.json 失敗: ${error.message}`);
  allFilesExist = false;
}

console.log('\n🌐 檢查環境設定...');

// 檢查 .env 檔案
if (fs.existsSync('.env')) {
  console.log('✅ .env 檔案存在');
  
  const envContent = fs.readFileSync('.env', 'utf8');
  if (envContent.includes('SUPABASE_URL') && envContent.includes('SUPABASE_ANON_KEY')) {
    console.log('✅ Supabase 設定已配置');
  } else {
    console.log('⚠️  Supabase 設定可能未完整配置');
  }
} else {
  console.log('⚠️  .env 檔案不存在，請複製 env.example 並設定 Supabase 憑證');
}

console.log('\n📋 檢查腳本權限...');

// 檢查啟動腳本權限
try {
  const stats = fs.statSync('start.sh');
  if (stats.mode & 0o111) {
    console.log('✅ start.sh 具有執行權限');
  } else {
    console.log('⚠️  start.sh 缺少執行權限，請執行: chmod +x start.sh');
  }
} catch (error) {
  console.log(`❌ 無法檢查 start.sh 權限: ${error.message}`);
}

console.log('\n🎯 總結:');

if (allFilesExist) {
  console.log('✅ 所有必要檔案都存在');
  console.log('🚀 您可以使用以下指令啟動應用程式:');
  console.log('   ./start.sh');
  console.log('   或');
  console.log('   npm run dev');
} else {
  console.log('❌ 發現問題，請檢查上述錯誤');
}

console.log('\n📚 如需協助，請參考 README.md'); 