import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// OAuth2 Token API
export const getOAuth2Token = async (username, password, clientId, clientSecret) => {
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
      username: clientId,
      password: clientSecret,
    },
  });

  return response.data;
};

// 創建 axios instance with token
const createApiClient = (token) => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Resource APIs
export const uploadResource = async (token, file, resourceId = null) => {
  const formData = new FormData();
  formData.append('file', file);
  if (resourceId) {
    formData.append('resourceId', resourceId);
  }

  const api = createApiClient(token);
  const response = await api.post('/admin/resource/upload/resource', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const uploadMaterial = async (token, file, resourceId, materialId = null) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('resourceId', resourceId);
  if (materialId) {
    formData.append('materialId', materialId);
  }

  const api = createApiClient(token);
  const response = await api.post('/admin/resource/upload/material', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const updateResource = async (token, resourceId, title) => {
  const api = createApiClient(token);
  const params = new URLSearchParams();
  params.append('title', title);

  const response = await api.put(`/admin/resource/update/resource/${resourceId}`, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data;
};

export const updateMaterial = async (token, materialId, title) => {
  const api = createApiClient(token);
  const params = new URLSearchParams();
  params.append('title', title);

  const response = await api.put(`/admin/resource/update/material/${materialId}`, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data;
};
