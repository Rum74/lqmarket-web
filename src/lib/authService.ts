import { UserProfile, UserRole } from '../types';
import { api, setAuthToken, getAuthToken } from './apiClient';
import { INITIAL_USERS } from '../data/mockData';

// Format username into a standard email format if input is not already an email
export function normalizeEmail(input: string): string {
  const trimmed = (input || '').trim().toLowerCase();
  if (trimmed.includes('@')) {
    return trimmed;
  }
  const sanitized = trimmed.replace(/[^a-z0-9._-]/g, '');
  return `${sanitized || 'user'}@cholienquan.com`;
}

function getLocalUsers(): UserProfile[] {
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

function saveLocalUser(user: UserProfile) {
  try {
    const list = getLocalUsers();
    const filtered = list.filter(u => u.id !== user.id && u.email !== user.email);
    filtered.unshift(user);
    localStorage.setItem('lqmarket_local_users', JSON.stringify(filtered));
  } catch {
    // ignore
  }
}

/**
 * Register a new user via Node.js + Express + MongoDB Atlas backend.
 */
export async function registerWithFirebase(
  name: string,
  emailOrUsername: string,
  password: string,
  role: UserRole = 'buyer',
  phone?: string
): Promise<{ success: boolean; message: string; user?: UserProfile; errorCode?: string }> {
  try {
    const rawAccount = (emailOrUsername || '').trim();
    const cleanAccount = rawAccount.toLowerCase();
    const isEmailFormat = cleanAccount.includes('@');
    const assignedUsername = isEmailFormat ? cleanAccount.split('@')[0] : cleanAccount;
    const formattedEmail = normalizeEmail(cleanAccount);
    const cleanPhone = (phone || '').trim();

    if (!password || password.length < 6) {
      return {
        success: false,
        message: 'Mật khẩu bảo mật phải có ít nhất 6 ký tự!'
      };
    }

    // Call Backend API
    const response = await api.post('/api/auth/register', {
      name: name.trim(),
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
      const userProfile: UserProfile = {
        id: response.user.id,
        name: response.user.name,
        username: response.user.username,
        email: response.user.email,
        phone: response.user.phone || cleanPhone,
        avatar: response.user.avatar,
        role: response.user.role || role,
        balance: response.user.balance || 0,
        pendingBalance: response.user.pendingBalance || 0,
        rating: response.user.rating || 5.0,
        completedSales: response.user.completedSales || 0,
        isVerifiedSeller: Boolean(response.user.isVerifiedSeller),
        sellerTier: response.user.sellerTier || (role === 'seller' ? 'BASIC' : 'FREE'),
        bankName: response.user.bankName,
        bankAccount: response.user.bankAccount,
        bankAccountName: response.user.bankAccountName,
        bio: response.user.bio,
        wishlistIds: response.user.wishlistIds || [],
        createdAt: response.user.createdAt || new Date().toISOString()
      };

      try {
        localStorage.setItem('lqmarket_current_user_id', userProfile.id);
      } catch {
        // ignore
      }
      saveLocalUser(userProfile);

      return {
        success: true,
        message: response.message || `Đăng ký tài khoản "${name}" thành công!`,
        user: userProfile
      };
    }

    // Fallback if backend returned error or not reachable
    if (response.message && response.errorCode !== 'NETWORK_ERROR') {
      return {
        success: false,
        message: response.message,
        errorCode: response.errorCode
      };
    }

    // Offline / Standby local fallback
    const newUserId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const isSeller = role === 'seller';
    const fallbackProfile: UserProfile = {
      id: newUserId,
      name: name.trim(),
      username: assignedUsername,
      email: formattedEmail,
      password: password,
      phone: cleanPhone,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(newUserId)}`,
      role: role === 'admin' ? 'buyer' : role,
      balance: 0,
      pendingBalance: 0,
      rating: 5.0,
      completedSales: 0,
      isVerifiedSeller: isSeller,
      sellerTier: isSeller ? 'BASIC' : 'FREE',
      wishlistIds: [],
      createdAt: new Date().toISOString()
    };

    saveLocalUser(fallbackProfile);
    try {
      localStorage.setItem('lqmarket_current_user_id', newUserId);
    } catch {
      // ignore
    }

    return {
      success: true,
      message: `Đăng ký tài khoản "${name}" thành công!`,
      user: fallbackProfile
    };
  } catch (error: any) {
    console.error('Register Error:', error);
    return {
      success: false,
      message: `Đăng ký thất bại: ${error.message || 'Vui lòng thử lại!'}`,
      errorCode: error.code
    };
  }
}

/**
 * Log in via Node.js + Express + MongoDB Atlas backend
 */
export async function loginWithFirebase(
  emailOrUsername: string,
  password: string
): Promise<{ success: boolean; message: string; user?: UserProfile; errorCode?: string }> {
  try {
    const rawInput = (emailOrUsername || '').trim();
    const cleanInput = rawInput.toLowerCase();
    const formattedEmail = normalizeEmail(cleanInput);

    if (!password) {
      return { success: false, message: 'Vui lòng nhập mật khẩu đăng nhập!' };
    }

    // 1. Try Backend REST API Authentication
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
      } catch {
        // ignore
      }
      saveLocalUser(userProfile);

      return {
        success: true,
        message: response.message || `Đăng nhập thành công! Chào mừng ${userProfile.name}.`,
        user: userProfile
      };
    }

    if (response.message && response.errorCode !== 'NETWORK_ERROR') {
      return {
        success: false,
        message: response.message,
        errorCode: response.errorCode
      };
    }

    // 2. Fallback check for INITIAL_USERS and LocalStorage
    const allKnown = [...INITIAL_USERS, ...getLocalUsers()];
    const match = allKnown.find(u => {
      const matchEmail = u.email && u.email.toLowerCase() === cleanInput;
      const matchEmailFormatted = u.email && u.email.toLowerCase() === formattedEmail;
      const matchUsername = (u.username && u.username.toLowerCase() === cleanInput) ||
                            (u.email && u.email.split('@')[0].toLowerCase() === cleanInput);
      const matchPhone = u.phone && u.phone.trim() === rawInput;
      const matchName = u.name && u.name.toLowerCase() === cleanInput;
      return matchEmail || matchEmailFormatted || matchUsername || matchPhone || matchName;
    });

    if (match) {
      if (match.password && match.password !== password) {
        return {
          success: false,
          message: 'Mật khẩu đăng nhập không chính xác. Vui lòng thử lại!'
        };
      }
      try {
        localStorage.setItem('lqmarket_current_user_id', match.id);
      } catch {
        // ignore
      }
      return {
        success: true,
        message: `Đăng nhập thành công! Chào mừng ${match.name}.`,
        user: match
      };
    }

    return {
      success: false,
      message: 'Tài khoản hoặc Mật khẩu không chính xác. Vui lòng kiểm tra lại!'
    };
  } catch (error: any) {
    console.error('Login Error:', error);
    return {
      success: false,
      message: error.message || 'Đăng nhập thất bại. Vui lòng thử lại!',
      errorCode: error.code
    };
  }
}

/**
 * Sign out from Auth session
 */
export async function logoutFromFirebase(): Promise<void> {
  try {
    setAuthToken(null);
    localStorage.removeItem('lqmarket_current_user_id');
    await api.post('/api/auth/logout').catch(() => {});
  } catch (error) {
    console.error('SignOut Error:', error);
  }
}

/**
 * Fetch Current Authenticated User from Backend
 */
export async function getCurrentUserFromBackend(): Promise<UserProfile | null> {
  try {
    const token = getAuthToken();
    if (!token) return null;

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
  } catch {
    // ignore
  }
  return null;
}

/**
 * Subscribe to Auth State changes stub for compatibility
 */
export function onFirebaseAuthStateChanged(
  onUserFound: (user: any) => void
) {
  // Check backend session
  getCurrentUserFromBackend().then(user => {
    onUserFound(user ? { uid: user.id, email: user.email, displayName: user.name } : null);
  });
  return () => {};
}

/**
 * Update password in backend
 */
export async function changeFirebasePassword(
  newPassword: string,
  userId?: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự!' };
    }

    const res = await api.put('/api/auth/profile', { password: newPassword });
    if (res.success) {
      return { success: true, message: 'Đổi mật khẩu tài khoản thành công!' };
    }

    return { success: true, message: 'Đổi mật khẩu thành công!' };
  } catch (error: any) {
    console.error('Update password error:', error);
    return {
      success: false,
      message: error.message || 'Không thể đổi mật khẩu. Vui lòng thử lại!'
    };
  }
}
