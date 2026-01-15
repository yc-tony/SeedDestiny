# OAuth2 Password Grant 使用指南

## 概述
本系統使用 Spring Authorization Server 實現 OAuth2 Password Grant Type，允許前端使用 Application 憑證和 Account 帳號密碼來獲取 JWT token。

## API 端點

### 獲取 Access Token
**端點**: `POST /oauth2/token`

**Content-Type**: `application/x-www-form-urlencoded`

**Authorization Header**: `Basic {Base64(applicationId:applicationPassword)}`

**請求參數**:
- `grant_type`: `password` (必填)
- `username`: 用戶帳號 (必填)
- `password`: 用戶密碼 (必填)
- `scope`: OAuth scopes，多個用空格分隔 (選填)

## 前端調用流程

### 1. 準備 Application 憑證
首先需要將 `applicationId` 和 `applicationPassword` 進行 Base64 編碼：

```javascript
const applicationId = "your-app-id";
const applicationPassword = "your-app-password";
const credentials = btoa(`${applicationId}:${applicationPassword}`);
```

### 2. 發送 Token 請求

```javascript
async function getAccessToken(username, password) {
    const url = "http://localhost:8080/oauth2/token";

    // 準備 Basic Auth
    const applicationId = "your-app-id";
    const applicationPassword = "your-app-password";
    const credentials = btoa(`${applicationId}:${applicationPassword}`);

    // 準備請求參數
    const params = new URLSearchParams();
    params.append("grant_type", "password");
    params.append("username", username);
    params.append("password", password);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${credentials}`
            },
            body: params
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error getting access token:", error);
        throw error;
    }
}

// 使用範例
getAccessToken("user@example.com", "userPassword123")
    .then(tokenResponse => {
        console.log("Access Token:", tokenResponse.access_token);
        console.log("Token Type:", tokenResponse.token_type);
        console.log("Expires In:", tokenResponse.expires_in);

        // 儲存 token 供後續 API 調用使用
        localStorage.setItem("access_token", tokenResponse.access_token);
    })
    .catch(error => {
        console.error("Login failed:", error);
    });
```

### 3. 使用 Access Token 調用受保護的 API

```javascript
async function callProtectedAPI() {
    const accessToken = localStorage.getItem("access_token");

    const response = await fetch("http://localhost:8080/api/protected-resource", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}
```

## 響應格式

### 成功響應 (200 OK)
```json
{
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "scope": "read write"
}
```

### JWT Token 內容
解碼後的 JWT token 包含以下 claims：
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

### 錯誤響應

#### 無效的 Application 憑證 (401 Unauthorized)
```json
{
    "error": "invalid_client",
    "error_description": "Client authentication failed"
}
```

#### 無效的用戶憑證 (400 Bad Request)
```json
{
    "error": "invalid_grant",
    "error_description": "Invalid username or password"
}
```

#### 不支援的 Grant Type (400 Bad Request)
```json
{
    "error": "unsupported_grant_type",
    "error_description": "Grant type not supported"
}
```

## 完整的前端登入流程範例

```javascript
class OAuth2Client {
    constructor(baseUrl, applicationId, applicationPassword) {
        this.baseUrl = baseUrl;
        this.applicationId = applicationId;
        this.applicationPassword = applicationPassword;
        this.credentials = btoa(`${applicationId}:${applicationPassword}`);
    }

    async login(username, password) {
        const url = `${this.baseUrl}/oauth2/token`;
        const params = new URLSearchParams();
        params.append("grant_type", "password");
        params.append("username", username);
        params.append("password", password);

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${this.credentials}`
            },
            body: params
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error_description || "Login failed");
        }

        const tokenData = await response.json();

        // 儲存 token
        localStorage.setItem("access_token", tokenData.access_token);
        localStorage.setItem("token_expires_at", Date.now() + (tokenData.expires_in * 1000));

        return tokenData;
    }

    async callAPI(endpoint, options = {}) {
        const accessToken = localStorage.getItem("access_token");

        if (!accessToken) {
            throw new Error("No access token available");
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                ...options.headers,
                "Authorization": `Bearer ${accessToken}`
            }
        });

        if (response.status === 401) {
            // Token 過期，需要重新登入
            localStorage.removeItem("access_token");
            localStorage.removeItem("token_expires_at");
            throw new Error("Token expired, please login again");
        }

        return response;
    }

    logout() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("token_expires_at");
    }

    isTokenValid() {
        const expiresAt = localStorage.getItem("token_expires_at");
        if (!expiresAt) return false;
        return Date.now() < parseInt(expiresAt);
    }
}

// 使用範例
const oauth2Client = new OAuth2Client(
    "http://localhost:8080",
    "your-app-id",
    "your-app-password"
);

// 登入
oauth2Client.login("user@example.com", "password123")
    .then(tokenData => {
        console.log("Login successful!", tokenData);
    })
    .catch(error => {
        console.error("Login failed:", error.message);
    });

// 調用受保護的 API
oauth2Client.callAPI("/api/user/profile")
    .then(response => response.json())
    .then(data => {
        console.log("User profile:", data);
    })
    .catch(error => {
        console.error("API call failed:", error.message);
    });
```

## 注意事項

1. **安全性**:
   - Application 憑證應該安全存儲，不要硬編碼在前端代碼中
   - 建議使用 HTTPS 來保護傳輸中的憑證
   - Token 應該安全存儲（考慮使用 httpOnly cookies）

2. **Token 過期處理**:
   - Access token 預設有效期為 1 小時
   - 應該實現 token 刷新機制或在過期時重新登入

3. **錯誤處理**:
   - 妥善處理各種錯誤情況
   - 提供友好的錯誤提示給用戶

4. **CORS 設定**:
   - 如果前端和後端在不同域名，需要配置 CORS

## 測試用 cURL 命令

```bash
# 獲取 access token
curl -X POST http://localhost:8080/oauth2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Authorization: Basic $(echo -n 'your-app-id:your-app-password' | base64)" \
  -d "grant_type=password&username=user@example.com&password=password123"

# 使用 token 調用 API
curl -X GET http://localhost:8080/api/protected-resource \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```
