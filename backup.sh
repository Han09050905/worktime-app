#!/bin/bash

# 工時管理APP 自動備份腳本

# 設定變數
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/worktime-app"
DATA_DIR="./data"
RETENTION_DAYS=30

# 建立備份目錄
mkdir -p $BACKUP_DIR

echo "開始備份工時管理APP資料..."

# 檢查資料庫檔案是否存在
if [ ! -f "$DATA_DIR/worktime.db" ]; then
    echo "錯誤: 找不到資料庫檔案 $DATA_DIR/worktime.db"
    exit 1
fi

# 備份資料庫
echo "備份資料庫..."
cp "$DATA_DIR/worktime.db" "$BACKUP_DIR/worktime_$DATE.db"

# 檢查備份是否成功
if [ $? -eq 0 ]; then
    echo "✅ 資料庫備份成功: worktime_$DATE.db"
    
    # 計算備份檔案大小
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/worktime_$DATE.db" | cut -f1)
    echo "📊 備份檔案大小: $BACKUP_SIZE"
else
    echo "❌ 資料庫備份失敗"
    exit 1
fi

# 清理舊備份
echo "清理 $RETENTION_DAYS 天前的舊備份..."
find $BACKUP_DIR -name "worktime_*.db" -mtime +$RETENTION_DAYS -delete

# 顯示備份統計
echo ""
echo "📋 備份統計:"
echo "  備份目錄: $BACKUP_DIR"
echo "  保留天數: $RETENTION_DAYS 天"
echo "  當前備份: worktime_$DATE.db"

# 列出所有備份檔案
echo ""
echo "📁 現有備份檔案:"
ls -lh $BACKUP_DIR/worktime_*.db 2>/dev/null || echo "  無備份檔案"

echo ""
echo "✅ 備份完成！" 