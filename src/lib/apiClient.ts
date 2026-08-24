/**
 * LQMarket Unified REST API Client
 * Connects Frontend directly to Node.js/Express + MongoDB Atlas Backend
 */

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') || '';

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
      return {
        success: false,
        message: data.message || `Lỗi yêu cầu (${res.status})`,
        errorCode: data.errorCode || `HTTP_${res.status}`,
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
