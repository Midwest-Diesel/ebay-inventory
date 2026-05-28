import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { getEbayHeaders } from '../services/ebayService';

const getUrl = () => {
  if (import.meta.env.PROD) {
    return 'https://inventory-server.up.railway.app';
  } else if (import.meta.env.VITE_NODE_ENV === 'test') {
    return 'http://localhost:8001';
  } else {
    return 'http://localhost:8000';
  }
};

const baseURL = getUrl();
const jar = new CookieJar();

const api = wrapper(axios.create({
  baseURL,
  jar,
  withCredentials: true
}));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const data = error?.response?.data;
    if (error?.response?.status === 401 && data?.refresh) {
      localStorage.setItem(
        'ebay',
        JSON.stringify({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: data.expiresAt,
          refreshExpiresAt: data.refreshExpiresAt
        })
      );

      const originalRequest = error.config;
      originalRequest.headers = { ...originalRequest.headers, ...getEbayHeaders() };
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export const setApiBaseUrl = (url: string) => {
  api.defaults.baseURL = url;
};

export default api;
