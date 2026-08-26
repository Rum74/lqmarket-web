import { UserProfile, UserRole } from '../types';
import { api, setAuthToken, getAuthToken } from './apiClient';

// Helper to remove Vietnamese tones for safe usernames and emails
export function removeVietnameseTones(str: string): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

// Format username into a standard email format if input is not already an email
export function normalizeEmail(input: string): string {
  const trimmed = (input || '').trim().toLowerCase();
  if (trimmed.includes('@')) {
    return trimmed;
  }
  const ascii = removeVietnameseTones(trimmed);
  const sanitized = ascii.replace(/[^a-z0-9._-]/g, '');
  return `${sanitized || 'user'}@cholienquan.com`;
}

export function getLocalUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem('lqmarket_local_users');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveLocalUser(user: UserProfile) {
  try {
    const list = getLocalUsers();
    const filtered = list.filter(u => u.id !== user.id && u.email !== user.email && u.username !== user.username);
    filtered.unshift(user);
    localStorage.setItem('lqmarket_local_users', JSON.stringify(filtered));
  } catch {
    // ignore
  }
}

/**
 * Register a new user directly into MongoDB Atlas via Backend REST API
 */
export async function registerUser(
  name: string,
  emailOrUsername: string,
  password: string,
  role: UserRole = 'buyer',
  phone?: string
): Promise<{ success: boolean; message: string; user?: UserProfile; errorCode?: string }> {
  try {
    const rawName = (name || '').trim();
    const rawAccount = (emailOrUsername || '').trim();
    const cleanAccount = rawAccount.toLowerCase();
    const isEmailFormat = cleanAccount.includes('@');
    const asciiAccount = removeVietnameseTones(cleanAccount);
    const assignedUsername = isEmailFormat
      ? asciiAccount.split('@')[0].replace(/[^a-z0-9_]/g, '') || 'user'
      : asciiAccount.replace(/[^a-z0-9_]/g, '') || 'user';
    const formattedEmail = normalizeEmail(cleanAccount);
    const cleanPhone = (phone || '').trim();

    if (!rawName || !rawAccount || !password) {
      return {
        success: false,
        message: 'Vui lòng điền đầy đủ họ tên, tên tài khoản/email và mật khẩu!'
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        message: 'Mật khẩu bảo mật phải có ít nhất 6 ký tự!'
      };
    }

    // Call Backend Node.js / MongoDB REST API
    const response = await api.post('/api/auth/register', {
      name: rawName,
      username: assignedUsername,
      email: formattedEmail,
      password,
      role,
      phone: cleanPhone
    });

    if (response.success && response.user) {
      if (response.token) {
        setAuthToken(response.token);
      }

      const newUserProfile: UserProfile = {
        id: response.user.id || `user_${Date.now()}`,
        name: response.user.name || rawName,
        username: response.user.username || assignedUsername,
        email: response.user.email || formattedEmail,
        password: password,
        phone: response.user.phone || cleanPhone,
        avatar: response.user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${response.user.id || assignedUsername}`,
        role: response.user.role || (role === 'admin' ? 'buyer' : role),
        balance: Number(response.user.balance || 0),
        pendingBalance: Number(response.user.pendingBalance || 0),
        rating: Number(response.user.rating || 5.0),
        completedSales: Number(response.user.completedSales || 0),
        isVerifiedSeller: Boolean(response.user.isVerifiedSeller),
        sellerTier: response.user.sellerTier || (role === 'seller' ? 'BASIC' : 'FREE'),
        wishlistIds: response.user.wishlistIds || [],
        createdAt: response.user.createdAt || new Date().toISOString()
      };

      saveLocalUser(newUserProfile);
      try {
        localStorage.setItem('lqmarket_current_user_id', newUserProfile.id);
        localStorage.setItem('lqmarket_saved_user_profile', JSON.stringify(newUserProfile));
      } catch {}

      return {
        success: true,
        message: response.message || `Đăng ký tài khoản "${rawName}" thành công!`,
        user: newUserProfile
      };
    }

    return {
      success: false,
      message: response.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin hoặc kết nối máy chủ.',
      errorCode: response.errorCode || 'REGISTER_FAILED'
    };
  } catch (error: any) {
    console.error('Register Error:', error);
    return {
      success: false,
      message: `Đăng ký thất bại: ${error.message || 'Lỗi kết nối máy chủ MongoDB API.'}`,
      errorCode: 'API_ERROR'
    };
  }
}

// Alias for compatibility
export const registerWithFirebase = registerUser;

/**
 * Log in directly with MongoDB Atlas REST API
 */
export async function loginUser(
  emailOrUsername: string,
  password: string
): Promise<{ success: boolean; message: string; user?: UserProfile; errorCode?: string }> {
  try {
    const rawInput = (emailOrUsername || '').trim();
    if (!rawInput || !password) {
      return { success: false, message: 'Vui lòng nhập tên tài khoản/email và mật khẩu!' };
    }

    const response = await api.post('/api/auth/login', {
      identifier: rawInput,
      password
    });

    if (response.success && response.user) {
      if (response.token) {
        setAuthToken(response.token);
      }
      const userProfile: UserProfile = {
        id: response.user.id,
        name: response.user.name,
        username: response.user.username,
        email: response.user.email,
        phone: response.user.phone || '',
        avatar: response.user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${response.user.id}`,
        role: response.user.role || 'buyer',
        balance: Number(response.user.balance || 0),
        pendingBalance: Number(response.user.pendingBalance || 0),
        rating: Number(response.user.rating || 5.0),
        completedSales: Number(response.user.completedSales || 0),
        isVerifiedSeller: Boolean(response.user.isVerifiedSeller),
        sellerTier: response.user.sellerTier || 'FREE',
        bankName: response.user.bankName,
        bankAccount: response.user.bankAccount,
        bankAccountName: response.user.bankAccountName,
        bio: response.user.bio,
        wishlistIds: response.user.wishlistIds || [],
        createdAt: response.user.createdAt || new Date().toISOString()
      };

      try {
        localStorage.setItem('lqmarket_current_user_id', userProfile.id);
        localStorage.setItem('lqmarket_saved_user_profile', JSON.stringify(userProfile));
      } catch {}
      saveLocalUser(userProfile);

      return {
        success: true,
        message: response.message || `Đăng nhập thành công! Chào mừng ${userProfile.name}.`,
        user: userProfile
      };
    }

    return {
      success: false,
      message: response.message || 'Tài khoản hoặc mật khẩu không chính xác. Vui lòng thử lại!',
      errorCode: response.errorCode || 'AUTH_FAILED'
    };
  } catch (error: any) {
    console.error('Login Error:', error);
    return {
      success: false,
      message: error.message || 'Không thể kết nối đến máy chủ MongoDB API. Vui lòng kiểm tra lại mạng!',
      errorCode: 'NETWORK_ERROR'
    };
  }
}

// Alias for compatibility
export const loginWithFirebase = loginUser;

/**
 * Sign out from session
 */
export async function logoutUser(): Promise<void> {
  try {
    setAuthToken(null);
    localStorage.removeItem('lqmarket_current_user_id');
    localStorage.removeItem('lqmarket_saved_user_profile');
    await api.post('/api/auth/logout').catch(() => {});
  } catch (error) {
    console.error('SignOut Error:', error);
  }
}

// Alias for compatibility
export const logoutFromFirebase = logoutUser;

/**
 * Fetch Current Authenticated User from MongoDB Atlas Backend
 */
export async function getCurrentUserFromBackend(): Promise<UserProfile | null> {
  try {
    const token = getAuthToken();
    if (token) {
      const res = await api.get('/api/auth/me');
      if (res.success && res.user) {
        const u = res.user;
        const profile: UserProfile = {
          id: u.id,
          name: u.name,
          username: u.username,
          email: u.email,
          phone: u.phone || '',
          avatar: u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.id}`,
          role: u.role || 'buyer',
          balance: Number(u.balance || 0),
          pendingBalance: Number(u.pendingBalance || 0),
          rating: Number(u.rating || 5.0),
          completedSales: Number(u.completedSales || 0),
          isVerifiedSeller: Boolean(u.isVerifiedSeller),
          sellerTier: u.sellerTier || 'FREE',
          bankName: u.bankName,
          bankAccount: u.bankAccount,
          bankAccountName: u.bankAccountName,
          bio: u.bio,
          wishlistIds: u.wishlistIds || [],
          createdAt: u.createdAt || new Date().toISOString()
        };
        saveLocalUser(profile);
        return profile;
      }
    }

    // Check stored local profile
    const saved = localStorage.getItem('lqmarket_saved_user_profile');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Compatibility helper for auth state listener
 */
export function onFirebaseAuthStateChanged(
  onUserFound: (user: any) => void
) {
  getCurrentUserFromBackend().then(user => {
    onUserFound(user ? { uid: user.id, email: user.email, displayName: user.name } : null);
  });
  return () => {};
}

/**
 * Update password directly in MongoDB Atlas
 */
export async function changeFirebasePassword(
  newPassword: string,
  _userId?: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự!' };
    }

    const res = await api.put('/api/auth/profile', { password: newPassword });
    if (res.success) {
      return { success: true, message: 'Đổi mật khẩu tài khoản thành công!' };
    }
    return { success: false, message: res.message || 'Không thể đổi mật khẩu.' };
  } catch (error: any) {
    console.error('Update password error:', error);
    return {
      success: false,
      message: error.message || 'Không thể đổi mật khẩu. Vui lòng thử lại!'
    };
  }
}
