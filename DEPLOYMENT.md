# 工時管理APP 部署指南

## 部署選項

### 1. Docker 部署（推薦）

#### 前置需求
- Docker
- Docker Compose

#### 快速部署
```bash
# 1. 克隆專案
git clone <your-repo-url>
cd 工時APP

# 2. 執行部署腳本
chmod +x deploy.sh
./deploy.sh
```

#### 手動部署
```bash
# 建立資料目錄
mkdir -p data

# 建置並啟動
docker-compose up -d

# 查看日誌
docker-compose logs -f

# 停止服務
docker-compose down
```

### 2. 傳統部署

#### 前置需求
- Node.js 18+
- npm

#### 部署步驟
```bash
# 1. 安裝依賴
npm run install-all

# 2. 建置前端
cd client && npm run build

# 3. 設定環境變數
export NODE_ENV=production
export PORT=3001

# 4. 啟動後端
cd ../server && node index.js
```

### 3. 雲端部署

#### AWS EC2 部署
```bash
# 1. 連接到EC2實例
ssh -i your-key.pem ubuntu@your-ec2-ip

# 2. 安裝Docker
sudo apt update
sudo apt install docker.io docker-compose

# 3. 部署應用程式
git clone <your-repo-url>
cd 工時APP
./deploy.sh
```

#### Google Cloud Run 部署
```bash
# 1. 建置映像
docker build -t gcr.io/your-project/worktime-app .

# 2. 推送到Google Container Registry
docker push gcr.io/your-project/worktime-app

# 3. 部署到Cloud Run
gcloud run deploy worktime-app \
  --image gcr.io/your-project/worktime-app \
  --platform managed \
  --region asia-east1 \
  --allow-unauthenticated
```

## 生產環境配置

### 1. 環境變數
```bash
NODE_ENV=production
PORT=3001
```

### 2. 反向代理（Nginx）
- 複製 `nginx.conf` 到 `/etc/nginx/sites-available/`
- 啟用站點：`sudo ln -s /etc/nginx/sites-available/worktime-app /etc/nginx/sites-enabled/`
- 重啟Nginx：`sudo systemctl restart nginx`

### 3. SSL證書（Let's Encrypt）
```bash
# 安裝Certbot
sudo apt install certbot python3-certbot-nginx

# 取得SSL證書
sudo certbot --nginx -d your-domain.com

# 自動續期
sudo crontab -e
# 加入：0 12 * * * /usr/bin/certbot renew --quiet
```

### 4. 防火牆設定
```bash
# 開放必要端口
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

## 資料備份

### 1. 自動備份腳本
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/worktime-app"

# 建立備份目錄
mkdir -p $BACKUP_DIR

# 備份資料庫
cp data/worktime.db $BACKUP_DIR/worktime_$DATE.db

# 保留最近30天的備份
find $BACKUP_DIR -name "worktime_*.db" -mtime +30 -delete

echo "備份完成: worktime_$DATE.db"
```

### 2. 設定定時備份
```bash
# 編輯crontab
crontab -e

# 每天凌晨2點備份
0 2 * * * /path/to/backup.sh
```

## 監控和維護

### 1. 日誌監控
```bash
# 查看應用程式日誌
docker-compose logs -f

# 查看系統日誌
sudo journalctl -u docker.service -f
```

### 2. 效能監控
```bash
# 監控容器資源使用
docker stats

# 監控磁碟使用
df -h
```

### 3. 健康檢查
```bash
# 檢查API健康狀態
curl -f http://localhost:3001/api/projects

# 檢查資料庫連接
docker exec -it worktime-app_server_1 sqlite3 /app/data/worktime.db ".tables"
```

## 故障排除

### 常見問題

#### 1. 應用程式無法啟動
```bash
# 檢查端口是否被佔用
sudo lsof -i :3001

# 檢查Docker容器狀態
docker-compose ps
```

#### 2. 資料庫錯誤
```bash
# 檢查資料庫檔案權限
ls -la data/

# 修復資料庫
docker exec -it worktime-app_server_1 sqlite3 /app/data/worktime.db "VACUUM;"
```

#### 3. 前端無法載入
```bash
# 檢查建置檔案
ls -la client/build/

# 重新建置前端
cd client && npm run build
```

## 安全建議

### 1. 網路安全
- 使用HTTPS
- 設定防火牆
- 定期更新系統

### 2. 資料安全
- 定期備份資料庫
- 加密敏感資料
- 限制資料庫存取權限

### 3. 應用程式安全
- 定期更新依賴
- 監控異常存取
- 實作存取日誌

## 擴展建議

### 1. 資料庫升級
- 考慮使用PostgreSQL或MySQL
- 實作資料庫叢集
- 設定讀寫分離

### 2. 負載平衡
- 使用多個應用程式實例
- 設定負載平衡器
- 實作健康檢查

### 3. 快取策略
- 使用Redis快取
- 實作CDN
- 優化靜態檔案

## 聯絡支援

如有部署問題，請聯絡：
- 技術支援：support@yourcompany.com
- 文件更新：docs@yourcompany.com 