/**
 * LQMarket Unified REST API Client
 * Connects Frontend directly to Node.js/Express + MongoDB Atlas Backend
 */

// Normalize API_BASE: prioritize VITE_API_URL, with automatic production fallback to https://api.cholienquan.com
let rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();

if (!rawApiUrl && typeof window !== 'undefined' && window.location) {
  const host = window.location.hostname;
  // If running on production domain, Vercel, or custom domain
  if (host.includes('cholienquan.com') || host.includes('vercel.app')) {
    rawApiUrl = 'https://api.cholienquan.com';
  }
}

rawApiUrl = rawApiUrl.replace(/\/+$/, '');
if (rawApiUrl.endsWith('/api')) {
  rawApiUrl = rawApiUrl.slice(0, -4);
}
const API_BASE = rawApiUrl;

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem('lqmarket_auth_token');
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem('lqmarket_auth_token', token);
    } else {
      localStorage.removeItem('lqmarket_auth_token');
    }
  } catch {
    // ignore
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const isEndpointUnavailable = res.status === 405 || res.status === 404 || res.status === 502 || res.status === 503;
      return {
        success: false,
        message: data.message || (isEndpointUnavailable ? 'Máy chủ API không phản hồi (Static mode).' : `Lỗi yêu cầu (${res.status})`),
        errorCode: isEndpointUnavailable ? 'HTTP_UNAVAILABLE' : (data.errorCode || `HTTP_${res.status}`),
        httpStatus: res.status,
        isUnavailable: isEndpointUnavailable,
        ...data
      };
    }

    return {
      success: data.success !== false,
      ...data
    };
  } catch (error: any) {
    console.warn(`[API Error] ${endpoint}:`, error.message || error);
    return {
      success: false,
      message: 'Không thể kết nối đến máy chủ API. Vui lòng kiểm tra kết nối mạng.',
      errorCode: 'NETWORK_ERROR'
    };
  }
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { method: 'GET', ...options }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body || {}),
      ...options
    }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body || {}),
      ...options
    }),

  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { method: 'DELETE', ...options })
};

export default api;
