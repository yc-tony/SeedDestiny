import axios from 'axios';
import { AUTH_CONFIG } from '../config/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// 用於儲存 logout callback
let logoutCallback = null;

export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
};

// OAuth2 Token API - 使用 password grant
export const getOAuth2Token = async (username, password) => {
  const params = new URLSearchParams();
  params.append('grant_type', 'password');
  params.append('username', username);
  params.append('password', password);
  params.append('scope', 'admin:resource');

  const response = await axios.post(`${API_BASE_URL}/oauth2/token`, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    auth: {
      username: AUTH_CONFIG.clientId,
      password: AUTH_CONFIG.clientSecret,
    },
  });

  return response.data;
};

// OAuth2 Refresh Token API
export const refreshOAuth2Token = async (refreshToken) => {
  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refreshToken);

  const response = await axios.post(`${API_BASE_URL}/oauth2/token`, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    auth: {
      username: AUTH_CONFIG.clientId,
      password: AUTH_CONFIG.clientSecret,
    },
  });

  return response.data;
};

// 創建 axios instance with token 和 401 攔截器
const createApiClient = (token, refreshToken) => {
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  // 添加 response 攔截器處理 401
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // 如果是 401 且還沒重試過
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // 嘗試使用 refresh token 獲取新的 access token
          if (refreshToken) {
            const tokenData = await refreshOAuth2Token(refreshToken);

            // 更新 localStorage 中的 token
            const savedUser = localStorage.getItem('admin_user');
            if (savedUser) {
              const userData = JSON.parse(savedUser);
              localStorage.setItem('admin_token', tokenData.access_token);
              if (tokenData.refresh_token) {
                localStorage.setItem('admin_refresh_token', tokenData.refresh_token);
              }

              // 更新請求的 Authorization header
              originalRequest.headers['Authorization'] = `Bearer ${tokenData.access_token}`;

              // 重試原始請求
              return axios(originalRequest);
            }
          }
        } catch (refreshError) {
          console.error('Refresh token failed:', refreshError);
          // Refresh token 失敗，執行登出
          if (logoutCallback) {
            logoutCallback();
          }
          return Promise.reject(refreshError);
        }
      }

      // 如果不是 401 或已經重試過，直接拒絕
      if (error.response?.status === 401 && logoutCallback) {
        logoutCallback();
      }

      return Promise.reject(error);
    }
  );

  return api;
};

// Resource APIs
export const uploadResource = async (token, refreshToken, file, resourceId = null) => {
  const formData = new FormData();
  formData.append('file', file);
  if (resourceId) {
    formData.append('resourceId', resourceId);
  }

  const api = createApiClient(token, refreshToken);
  const response = await api.post('/admin/resource/upload/resource', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const uploadMaterial = async (token, refreshToken, file, resourceId, materialId = null) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('resourceId', resourceId);
  if (materialId) {
    formData.append('materialId', materialId);
  }

  const api = createApiClient(token, refreshToken);
  const response = await api.post('/admin/resource/upload/material', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const updateResource = async (token, refreshToken, resourceId, title) => {
  const api = createApiClient(token, refreshToken);
  const params = new URLSearchParams();
  params.append('title', title);

  const response = await api.put(`/admin/resource/update/resource/${resourceId}`, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data;
};

export const updateMaterial = async (token, refreshToken, materialId, title) => {
  const api = createApiClient(token, refreshToken);
  const params = new URLSearchParams();
  params.append('title', title);

  const response = await api.put(`/admin/resource/update/material/${materialId}`, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data;
};

export const getAllResources = async (token, refreshToken) => {
  const api = createApiClient(token, refreshToken);
  const response = await api.get('/admin/resource/all');
  return response.data;
};

export const getAllMaterialsByResource = async (token, refreshToken, resourceId) => {
  const api = createApiClient(token, refreshToken);
  const response = await api.get(`/admin/resource/materials/${resourceId}`);
  return response.data;
};

export const deleteResource = async (token, refreshToken, resourceId) => {
  const api = createApiClient(token, refreshToken);
  const response = await api.delete(`/admin/resource/delete/resource/${resourceId}`);
  return response.data;
};

export const deleteMaterial = async (token, refreshToken, materialId) => {
  const api = createApiClient(token, refreshToken);
  const response = await api.delete(`/admin/resource/delete/material/${materialId}`);
  return response.data;
};

// Label APIs
export const getNextLayerLabels = async (token, refreshToken, labelKey = null) => {
  const api = createApiClient(token, refreshToken);
  const params = labelKey ? `?labelKey=${encodeURIComponent(labelKey)}` : '';
  const response = await api.get(`/admin/label/nextLayers${params}`);
  return response.data;
};

export const unlinkChildrenLabels = async (token, refreshToken, parentLabelId, childLabelId) => {
  const api = createApiClient(token, refreshToken);
  const response = await api.delete(`/admin/label/unlinkChildren/${parentLabelId}/${childLabelId}`);
  return response.data;
};

export const getAllLabels = async (token, refreshToken) => {
  const api = createApiClient(token, refreshToken);
  const response = await api.get('/admin/label/all');
  return response.data;
};

export const createOrUpdateLabel = async (token, refreshToken, label) => {
  const api = createApiClient(token, refreshToken);
  const response = await api.post('/admin/label/createOrUpdate', label);
  return response.data;
};

export const deleteLabel = async (token, refreshToken, labelId) => {
  const api = createApiClient(token, refreshToken);
  const response = await api.delete(`/admin/label/delete/${labelId}`);
  return response.data;
};

export const linkChildrenLabels = async (token, refreshToken, parentLabelId, childLabelId) => {
  const api = createApiClient(token, refreshToken);
  const response = await api.post(`/admin/label/linkChildren/${parentLabelId}`, childLabelId, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

// Resource Label APIs
export const getLabelsByResource = async (token, refreshToken, resourceId) => {
  const api = createApiClient(token, refreshToken);
  const response = await api.get(`/admin/resource/labels/${resourceId}`);
  return response.data;
};

export const addLabelToResource = async (token, refreshToken, resourceId, labelId) => {
  const api = createApiClient(token, refreshToken);
  const params = new URLSearchParams();
  params.append('labelId', labelId);
  const response = await api.post(`/admin/resource/addLabel/${resourceId}`, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
};

export const removeLabelFromResource = async (token, refreshToken, resourceId, labelId) => {
  const api = createApiClient(token, refreshToken);
  const params = new URLSearchParams();
  params.append('labelId', labelId);
  const response = await api.delete(`/admin/resource/removeLabel/${resourceId}`, {
    data: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
};
