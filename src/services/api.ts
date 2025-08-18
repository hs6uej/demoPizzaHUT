// src/services/api.ts

import axios from 'axios';

// ** จุดแก้ไขหลัก **
// ดึง URL มาจาก Environment Variable
// ถ้าไม่เจอ (ตอน dev) ให้ใช้ '/app' เพื่อให้ proxy ทำงานเหมือนเดิม
const BASE_URL = '/app';

// Generate a random device ID if not stored already
const getDeviceId = () => {
  let deviceId = localStorage.getItem('pizza_hut_device_id');
  if (!deviceId) {
    // Generate a UUID-like string
    deviceId = 'xxxxxxxx-xxxxxxxx-xxxxxxxx'.replace(/[x]/g, () => {
      return Math.floor(Math.random() * 16).toString(16).toUpperCase();
    });
    localStorage.setItem('pizza_hut_device_id', deviceId);
  }
  return deviceId;
};

// Create axios instance
// ตัวนี้จะใช้ BASE_URL ที่เรากำหนดไว้ข้างบนโดยอัตโนมัติ
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests that need it
api.interceptors.request.use(config => {
  const token = localStorage.getItem('pizza_hut_token');
  if (token && config.headers) {
    config.headers['DeviceToken'] = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

// Generate and store token
export const generateToken = async () => {
  try {
    const deviceId = getDeviceId();
    // ฟังก์ชันนี้ก็จะใช้ BASE_URL ที่เรากำหนดไว้ข้างบนโดยอัตโนมัติเช่นกัน
    const response = await axios.post(`${BASE_URL}/generate-token`, {
      client_id: 'phc-line-app',
      client_secret: 'Ee63Y6xp8yYhjAC',
      device_id: deviceId
    });
    const {
      token
    } = response.data.response.data;
    localStorage.setItem('pizza_hut_token', token);
    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw error;
  }
};

// Check and refresh token if needed
export const ensureToken = async () => {
  const token = localStorage.getItem('pizza_hut_token');
  if (!token) {
    return await generateToken();
  }
  return token;
};

export default api;