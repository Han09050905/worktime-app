# 多階段建置
FROM node:18-alpine AS builder

# 設定工作目錄
WORKDIR /app

# 複製package檔案
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# 安裝依賴
RUN npm install
RUN cd server && npm install
RUN cd client && npm install

# 複製源碼
COPY . .

# 建置前端
RUN cd client && npm run build

# 生產環境
FROM node:18-alpine AS production

WORKDIR /app

# 安裝生產依賴
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm install --only=production
RUN cd server && npm install --only=production

# 複製建置好的前端檔案
COPY --from=builder /app/client/build ./client/build

# 複製後端源碼
COPY server ./server

# 建立資料目錄
RUN mkdir -p /app/data

# 暴露端口
EXPOSE 3001

# 設定環境變數
ENV NODE_ENV=production
ENV PORT=3001

# 啟動命令
CMD ["node", "server/index.js"] 