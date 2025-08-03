# 套件管理器配置說明

## 📦 使用 npm 作為套件管理器

本專案使用 **npm** 作為唯一的套件管理器，以避免混合套件管理器導致的問題。

## ⚠️ 重要提醒

### 不要混合使用套件管理器

- ✅ **使用**: `npm install`
- ❌ **避免**: `yarn install` 或 `pnpm install`

### 為什麼選擇 npm？

1. **穩定性**: npm 是 Node.js 的官方套件管理器
2. **兼容性**: 與大多數部署平台（如 Render.com）完美兼容
3. **一致性**: 避免混合套件管理器的警告和問題

## 🔧 配置檔案

### .npmrc
```ini
# 明確指定使用 npm
package-lock=true
save-exact=true

# 避免混合套件管理器警告
legacy-peer-deps=true

# 設定 registry
registry=https://registry.npmjs.org/
```

### .gitignore
```gitignore
# Package manager - Using npm (keep package-lock.json, ignore yarn.lock)
yarn.lock
.pnp.*
```

## 🚀 安裝和建置

### 本地開發
```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm start
```

### 生產建置
```bash
# 使用建置腳本
./build.sh

# 或手動建置
cd client && npm run build && cd ..
```

### 部署
```bash
# 使用部署腳本
./deploy.sh

# 或快速部署
./quick-deploy.sh
```

## 📋 常用命令

### 安裝依賴
```bash
# 根目錄
npm install

# 前端
cd client && npm install && cd ..

# 後端
cd server && npm install && cd ..
```

### 更新依賴
```bash
# 檢查過期套件
npm outdated

# 更新套件
npm update

# 更新特定套件
npm install package-name@latest
```

### 清理快取
```bash
# 清理 npm 快取
npm cache clean --force

# 刪除 node_modules 並重新安裝
rm -rf node_modules package-lock.json
npm install
```

## 🔍 故障排除

### 混合套件管理器警告

**問題**: 收到關於混合套件管理器的警告

**解決方案**:
1. 確保只使用 npm
2. 刪除任何 `yarn.lock` 檔案
3. 使用 `npm install` 重新安裝

### 依賴衝突

**問題**: 依賴版本衝突

**解決方案**:
```bash
# 使用 legacy peer deps
npm install --legacy-peer-deps

# 或清理並重新安裝
rm -rf node_modules package-lock.json
npm install
```

### 建置失敗

**問題**: 建置過程中出現錯誤

**解決方案**:
1. 檢查 Node.js 版本
2. 清理快取並重新安裝
3. 檢查 `.npmrc` 配置

## 📊 最佳實踐

### 1. 版本控制
- 保留 `package-lock.json` 檔案
- 不要提交 `node_modules` 目錄
- 定期更新依賴

### 2. 安全性
- 定期執行 `npm audit`
- 及時修復安全漏洞
- 使用可信的套件來源

### 3. 性能優化
- 使用 `npm ci` 進行 CI/CD
- 定期清理快取
- 監控套件大小

## 🔄 遷移指南

### 從 Yarn 遷移到 npm

如果您之前使用 Yarn：

1. **刪除 Yarn 檔案**
   ```bash
   rm yarn.lock
   rm -rf node_modules
   ```

2. **使用 npm 重新安裝**
   ```bash
   npm install
   ```

3. **更新腳本**
   - 將 `yarn` 命令替換為 `npm`
   - 更新 CI/CD 配置

### 從 pnpm 遷移到 npm

如果您之前使用 pnpm：

1. **刪除 pnpm 檔案**
   ```bash
   rm pnpm-lock.yaml
   rm -rf node_modules
   ```

2. **使用 npm 重新安裝**
   ```bash
   npm install
   ```

## 📞 支援

如果遇到套件管理器相關問題：

1. **檢查 npm 版本**: `npm --version`
2. **檢查 Node.js 版本**: `node --version`
3. **查看 npm 文檔**: https://docs.npmjs.com/
4. **檢查專案配置**: 確保 `.npmrc` 正確設定

## 🔄 更新日誌

### v2.2.0 - 套件管理器統一
- ✅ 統一使用 npm 作為套件管理器
- ✅ 新增 .npmrc 配置檔案
- ✅ 更新 .gitignore 忽略 yarn.lock
- ✅ 改善建置腳本避免混合套件管理器警告
- ✅ 新增套件管理器配置說明文件 