import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://localhost:3000/mock';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para adicionar um delay artificial (simula latência de rede)
api.interceptors.response.use(
  async (response) => {
    const delay = Math.floor(Math.random() * 1000) + 500;
    await new Promise(resolve => setTimeout(resolve, delay));
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;