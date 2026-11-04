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

  // Default to same-origin relative path for local development, production, and preview environments
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

  // Attach identity headers for authentication resilience
  if (typeof window !== 'undefined') {
    const currentUserId = localStorage.getItem('lqmarket_current_user_id');
    const cleanUserId = currentUserId && currentUserId !== 'null' && currentUserId !== 'undefined' ? currentUserId.trim() : null;
    if (cleanUserId && !headers.has('X-User-Id')) {
      headers.set('X-User-Id', cleanUserId);
    }

    const currentUserRole = localStorage.getItem('lqmarket_current_user_role');
    let cleanUserRole = currentUserRole && currentUserRole !== 'null' && currentUserRole !== 'undefined' ? currentUserRole.trim() : null;
    if (!cleanUserRole) {
      try {
        const saved = localStorage.getItem('lqmarket_saved_user_profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.role) {
            cleanUserRole = String(parsed.role).trim();
          }
        }
      } catch {}
    }
    if (cleanUserRole && !headers.has('X-User-Role')) {
      headers.set('X-User-Role', cleanUserRole);
    }
  }

  // Set 25-second timeout controller so large data syncs never abort prematurely
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  const method = options.method || 'GET';

  try {
    const res = await fetch(url, {
      cache: options.cache || 'no-store',
      ...options,
      headers,
      signal: options.signal || controller.signal
    });
    clearTimeout(timeoutId);

    const data = await res.json().catch(() => ({}));

    const isSuccess = res.ok && data.success !== false;

    if (!res.ok) {
      const isEndpointUnavailable = res.status === 405 || res.status === 404 || res.status === 502 || res.status === 503 || res.status === 500;
      const errorMsg = data.message || (isEndpointUnavailable ? 'Máy chủ API tạm thời gián đoạn.' : `Lỗi yêu cầu (${res.status})`);
      const errObj: any = {
        success: false,
        message: errorMsg,
        errorCode: isEndpointUnavailable ? 'HTTP_UNAVAILABLE' : (data.errorCode || `HTTP_${res.status}`),
        httpStatus: res.status,
        isUnavailable: isEndpointUnavailable,
        ...data
      };
      // Provide Axios-style res.data fallback
      errObj.data = {
        success: false,
        message: errorMsg,
        ...(typeof data === 'object' && data !== null ? data : {})
      };
      return errObj;
    }

    const resultObj: any = {
      success: isSuccess,
      httpStatus: res.status,
      ...data
    };

    // If resultObj.data already exists (e.g. data is an array or object), also ensure Axios-style .data.success works
    if (resultObj.data !== undefined) {
      if (typeof resultObj.data === 'object' && resultObj.data !== null && !Array.isArray(resultObj.data)) {
        if (resultObj.data.success === undefined) resultObj.data.success = isSuccess;
        if (resultObj.data.message === undefined && data.message) resultObj.data.message = data.message;
      }
    } else {
      // If no nested data field was returned by backend, provide data containing full body
      resultObj.data = {
        success: isSuccess,
        message: data.message,
        ...data
      };
    }

    return resultObj;
  } catch (error: any) {
    clearTimeout(timeoutId);
    const isAbort = error.name === 'AbortError';

    const failMsg = isAbort ? 'Kết nối máy chủ quá hạn (25s).' : 'Không thể kết nối trực tiếp đến máy chủ API.';
    const failObj: any = {
      success: false,
      message: failMsg,
      errorCode: isAbort ? 'TIMEOUT' : 'NETWORK_ERROR',
      isUnavailable: true
    };
    failObj.data = {
      success: false,
      message: failMsg
    };
    return failObj;
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

  patch: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body || {}),
      ...options
    }),

  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { method: 'DELETE', ...options })
};

export default api;
