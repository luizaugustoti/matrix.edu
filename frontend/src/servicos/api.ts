import axios from 'axios';

// Cliente HTTP compartilhado.
// Qualquer servico de modulo deve reutilizar esta instancia.

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('efg_access_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
