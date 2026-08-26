/**
 * LQMarket Unified REST API Client
 * Connects Frontend directly to Node.js/Express + MongoDB Atlas Backend
 */

export function getApiBaseUrl(): string {
  try {
    const custom = typeof window !== 'undefined' ? localStorage.getItem('lqmarket_api_url') : null;
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/+$/, '').replace(/\/api$/, '');
    }
  } catch {
    // ignore
  }

  let rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();

  // If no explicit VITE_API_URL, use relative path '' so Vercel rewrites or local proxy handles /api
  if (!rawApiUrl) {
    rawApiUrl = '';
  }

  rawApiUrl = rawApiUrl.replace(/\/+$/, '');
  if (rawApiUrl.endsWith('/api')) {
    rawApiUrl = rawApiUrl.slice(0, -4);
  }
  return rawApiUrl;
}

export function setCustomApiUrl(url: string | null): void {
  try {
    if (url && url.trim()) {
      localStorage.setItem('lqmarket_api_url', url.trim());
    } else {
      localStorage.removeItem('lqmarket_api_url');
    }
  } catch {
    // ignore
  }
}

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
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${cleanEndpoint}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Set 8-second timeout controller so UI never hangs indefinitely
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: options.signal || controller.signal
    });
    clearTimeout(timeoutId);

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const isEndpointUnavailable = res.status === 405 || res.status === 404 || res.status === 502 || res.status === 503 || res.status === 500;
      return {
        success: false,
        message: data.message || (isEndpointUnavailable ? 'Máy chủ API tạm thời gián đoạn. Chuyển sang chế độ bảo mật tự động.' : `Lỗi yêu cầu (${res.status})`),
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
    clearTimeout(timeoutId);
    const isAbort = error.name === 'AbortError';

    // If first target (e.g. https://api.cholienquan.com) had a network error and we are on production, try direct VPS IP as backup
    if (!isAbort && baseUrl.includes('api.cholienquan.com') && !endpoint.startsWith('http')) {
      try {
        const vpsBackupUrl = `http://221.121.1.220:3000${cleanEndpoint}`;
        const backupRes = await fetch(vpsBackupUrl, {
          ...options,
          headers
        });
        const backupData = await backupRes.json().catch(() => ({}));
        if (backupRes.ok) {
          return {
            success: backupData.success !== false,
            ...backupData
          };
        }
      } catch {
        // continue to normal fallback
      }
    }

    console.warn(`[API Info] ${endpoint}:`, isAbort ? 'Request timed out after 8s' : (error.message || error));
    return {
      success: false,
      message: isAbort ? 'Kết nối máy chủ quá hạn (8s), tự động kích hoạt sao lưu an toàn.' : 'Không thể kết nối trực tiếp đến máy chủ API.',
      errorCode: isAbort ? 'TIMEOUT' : 'NETWORK_ERROR',
      isUnavailable: true
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
