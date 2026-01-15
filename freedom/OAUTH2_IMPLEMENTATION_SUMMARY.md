# OAuth2 實現總結

## 已完成的功能

本專案已成功整合 **Spring Authorization Server**，實現了基於 OAuth2 Password Grant Type 的認證系統。

## 架構概覽

### 1. 資料庫實體 (Entities)

#### Application Entity
- **路徑**: `com.seeddestiny.freedom.account.model.Application`
- **功能**: 儲存 OAuth2 客戶端應用程式資訊
- **欄位**:
  - `id`: UUID 主鍵
  - `applicationId`: 應用程式 ID（用於 Basic Auth）
  - `password`: 應用程式密碼（BCrypt 加密）
  - `oauthScopes`: OAuth 權限範圍（逗號分隔）
  - `createdDate`: 建立時間（資料庫自動生成）
  - `updatedDate`: 更新時間（資料庫自動更新）

#### Account Entity
- **路徑**: `com.seeddestiny.freedom.account.model.Account`
- **功能**: 儲存用戶帳號資訊
- **欄位**:
  - `id`: UUID 主鍵
  - `username`: 用戶帳號
  - `password`: 用戶密碼（BCrypt 加密）
  - `phone`: 手機號碼
  - `nickname`: 暱稱
  - `createdDate`: 建立時間（資料庫自動生成）
  - `updatedDate`: 更新時間（資料庫自動更新）

### 2. Repository 層

- **ApplicationRepository**: 查詢 Application 實體
- **AccountRepository**: 查詢 Account 實體

### 3. 核心配置類

#### AuthorizationServerConfig
- **路徑**: `com.seeddestiny.freedom.config.AuthorizationServerConfig`
- **功能**:
  - 配置 OAuth2 Authorization Server
  - 設定 JWT 簽名密鑰（RSA）
  - 註冊自定義的 Password Grant 認證提供者
  - 配置 Token 端點

#### SecurityConfig
- **路徑**: `com.seeddestiny.freedom.config.SecurityConfig`
- **功能**:
  - 配置 Spring Security
  - 提供 BCryptPasswordEncoder Bean
  - 設定預設的安全過濾鏈

#### OAuth2AuthorizationServiceConfig
- **路徑**: `com.seeddestiny.freedom.config.OAuth2AuthorizationServiceConfig`
- **功能**: 提供 OAuth2AuthorizationService（使用記憶體儲存）

#### OAuth2TokenCustomizerConfig
- **路徑**: `com.seeddestiny.freedom.config.OAuth2TokenCustomizerConfig`
- **功能**: 自定義 JWT Token 內容
- **添加的 Claims**:
  - `applicationId`: Application 的 UUID
  - `accountId`: Account 的 UUID

### 4. Password Grant 實現

#### OAuth2PasswordGrantAuthenticationToken
- **路徑**: `com.seeddestiny.freedom.config.OAuth2PasswordGrantAuthenticationToken`
- **功能**: 代表 Password Grant 認證請求的 Token

#### OAuth2PasswordGrantAuthenticationConverter
- **路徑**: `com.seeddestiny.freedom.config.OAuth2PasswordGrantAuthenticationConverter`
- **功能**: 將 HTTP 請求轉換為 OAuth2PasswordGrantAuthenticationToken

#### OAuth2PasswordGrantAuthenticationProvider
- **路徑**: `com.seeddestiny.freedom.config.OAuth2PasswordGrantAuthenticationProvider`
- **功能**:
  - 驗證 Application 憑證（Basic Auth）
  - 驗證 Account 憑證（username/password）
  - 生成 JWT Access Token

### 5. 服務層

#### JpaRegisteredClientRepository
- **路徑**: `com.seeddestiny.freedom.service.JpaRegisteredClientRepository`
- **功能**: 將 Application 實體映射為 Spring OAuth2 的 RegisteredClient

#### AccountUserDetailsService
- **路徑**: `com.seeddestiny.freedom.service.AccountUserDetailsService`
- **功能**: 實現 UserDetailsService，用於載入用戶資訊

## API 端點

### Token 端點
- **URL**: `POST /oauth2/token`
- **認證**: Basic Auth (applicationId:password)
- **參數**:
  - `grant_type=password`
  - `username`: 用戶帳號
  - `password`: 用戶密碼

### 響應格式
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### JWT Token Claims
```json
{
  "sub": "username",
  "applicationId": "uuid-of-application",
  "accountId": "uuid-of-account",
  "iat": 1234567890,
  "exp": 1234571490,
  "scope": ["read", "write"]
}
```

## 前端調用流程

### 1. 準備 Basic Auth
```javascript
const applicationId = "your-app-id";
const applicationPassword = "your-app-password";
const credentials = btoa(`${applicationId}:${applicationPassword}`);
```

### 2. 請求 Token
```javascript
const response = await fetch("http://localhost:8080/oauth2/token", {
    method: "POST",
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${credentials}`
    },
    body: new URLSearchParams({
        grant_type: "password",
        username: "user@example.com",
        password: "userPassword"
    })
});

const tokenData = await response.json();
```

### 3. 使用 Token 調用 API
```javascript
const response = await fetch("http://localhost:8080/api/resource", {
    headers: {
        "Authorization": `Bearer ${tokenData.access_token}`
    }
});
```

## 依賴項

### build.gradle.kts
```kotlin
dependencies {
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-authorization-server")
    implementation("io.jsonwebtoken:jjwt-api:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.6")
}
```

## 配置文件

### application.yaml
```yaml
jwt:
  secret: kira-yamato
  expiration: 3600  # seconds
```

## 安全性考量

1. **密碼加密**: 所有密碼使用 BCryptPasswordEncoder 加密
2. **JWT 簽名**: 使用 RSA 2048 位元密鑰簽名
3. **Token 過期**: Access Token 預設 1 小時過期
4. **HTTPS**: 生產環境必須使用 HTTPS
5. **憑證保護**: Application 憑證應安全存儲

## 資料庫初始化

### 創建 Application
```sql
INSERT INTO application (id, application_id, password, oauth_scopes, created_date, updated_date)
VALUES (
    UNHEX(REPLACE(UUID(), '-', '')),
    'my-app-id',
    '$2a$10$...',  -- BCrypt hash of password
    'read,write',
    NOW(),
    NOW()
);
```

### 創建 Account
```sql
INSERT INTO account (id, username, password, phone, nickname, created_date, updated_date)
VALUES (
    UNHEX(REPLACE(UUID(), '-', '')),
    'user@example.com',
    '$2a$10$...',  -- BCrypt hash of password
    '0912345678',
    'John Doe',
    NOW(),
    NOW()
);
```

## 測試

### 使用 cURL 測試
```bash
curl -X POST http://localhost:8080/oauth2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Authorization: Basic $(echo -n 'my-app-id:my-app-password' | base64)" \
  -d "grant_type=password&username=user@example.com&password=userPassword"
```

## 後續擴展建議

1. **Refresh Token**: 實現 Refresh Token 機制
2. **Token 撤銷**: 實現 Token 撤銷功能
3. **持久化**: 將 OAuth2Authorization 持久化到資料庫
4. **Rate Limiting**: 添加請求頻率限制
5. **審計日誌**: 記錄所有認證請求
6. **多因素認證**: 添加 2FA 支援

## 相關文件

- [OAuth2 API 使用指南](./OAUTH2_API_GUIDE.md) - 詳細的前端調用說明
- [Spring Authorization Server 官方文檔](https://docs.spring.io/spring-authorization-server/docs/current/reference/html/)
