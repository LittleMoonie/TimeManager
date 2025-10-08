import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, PaginatedResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = window.localStorage.getItem('auth_token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      window.localStorage.removeItem('auth_token');
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);

export const http = {
  get: <T>(url: string): Promise<ApiResponse<T>> =>
    apiClient.get(url).then((response) => response.data),
  post: <T>(url: string, data?: unknown): Promise<ApiResponse<T>> =>
    apiClient.post(url, data).then((response) => response.data),
  put: <T>(url: string, data?: unknown): Promise<ApiResponse<T>> =>
    apiClient.put(url, data).then((response) => response.data),
  delete: <T>(url: string): Promise<ApiResponse<T>> =>
    apiClient.delete(url).then((response) => response.data),
  getPaginated: <T>(
    url: string,
    params?: Record<string, unknown>
  ): Promise<PaginatedResponse<T>> =>
    apiClient.get(url, { params }).then((response) => response.data),
};

export default http;
