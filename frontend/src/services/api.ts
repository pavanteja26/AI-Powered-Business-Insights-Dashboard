import axios from 'axios';

const API_URL = 'http://localhost:5005/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getDrilldownData = async (node?: string) => {
  return await api.get('/drilldown', { params: { node } });
};

export default api;
