# SeedDestiny Archangel

SeedDestiny 資源管理系統的管理後台。

## 功能特色

- **OAuth2 登入**: 使用 `/oauth2/token` 端點進行身份驗證
- **3D 模型管理**: 上傳和更新 3D 模型資源 (GLB, GLTF, FBX, OBJ)
- **材質管理**: 上傳和更新材質檔案 (PNG, JPG, JPEG)
- **資料更新**: 更新資源和材質的標題資訊

## 技術架構

- **React 18**: 前端框架
- **Vite**: 建置工具
- **Axios**: HTTP 客戶端
- **Context API**: 狀態管理

## 開始使用

### 安裝依賴

```bash
npm install
```

### 開發模式

```bash
npm run dev
```

應用程式將在 `http://localhost:3001` 啟動。

### 建置生產版本

```bash
npm run build
```

### 預覽生產版本

```bash
npm run preview
```

## API 端點

此管理後台整合以下 API：

### 認證
- `POST /oauth2/token` - OAuth2 登入取得 access token

### 資源管理
- `POST /admin/resource/upload/resource` - 上傳 3D 模型
- `POST /admin/resource/upload/material` - 上傳材質檔案
- `PUT /admin/resource/update/resource/{resourceId}` - 更新資源資料
- `PUT /admin/resource/update/material/{materialId}` - 更新材質資料

## 環境變數

複製 `.env.example` 為 `.env` 並設定：

```
VITE_API_BASE_URL=http://localhost:8080
```

如果使用 Vite proxy（開發模式），可以留空。

## 專案結構

```
archangel/
├── src/
│   ├── components/        # React 元件
│   │   ├── Login.jsx      # 登入頁面
│   │   ├── Dashboard.jsx  # 主控台
│   │   ├── ResourceUpload.jsx
│   │   ├── MaterialUpload.jsx
│   │   ├── ResourceUpdate.jsx
│   │   └── MaterialUpdate.jsx
│   ├── store/             # 狀態管理
│   │   └── authStore.jsx  # 認證狀態
│   ├── utils/             # 工具函式
│   │   └── api.js         # API 呼叫
│   ├── App.jsx            # 主應用程式
│   ├── App.css            # 主樣式
│   ├── main.jsx           # 入口點
│   └── index.css          # 全域樣式
├── index.html
├── vite.config.js
└── package.json
```

## 使用說明

1. **登入**: 輸入使用者名稱、密碼、Client ID 和 Client Secret
2. **上傳 3D 模型**: 選擇模型檔案並上傳（可選擇性提供 Resource ID 進行更新）
3. **上傳材質**: 提供 Resource ID 並選擇材質檔案上傳
4. **更新資料**: 使用 Resource ID 或 Material ID 更新標題資訊

## 注意事項

- 需要有效的 OAuth2 憑證和 `admin:resource` scope
- 後端 API 需要在 `http://localhost:8080` 運行（或修改 vite.config.js 中的 proxy 設定）
- Token 會儲存在 localStorage 中以保持登入狀態
