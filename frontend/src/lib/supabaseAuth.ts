import { supabase, isSupabaseConfigured } from './supabase';
import { UserProfile, UserRole } from '../types';

/**
 * Register user via Supabase Auth & PostgreSQL profiles table
 */
export async function registerWithSupabase(
  name: string,
  emailOrUsername: string,
  password: string,
  role: UserRole = 'buyer',
  phone?: string
): Promise<{ success: boolean; message: string; user?: UserProfile; errorCode?: string }> {
  try {
    const rawAccount = (emailOrUsername || '').trim().toLowerCase();
    const isEmail = rawAccount.includes('@');
    const email = isEmail ? rawAccount : `${rawAccount}@cholienquan.com`;
    const username = isEmail ? rawAccount.split('@')[0] : rawAccount;

    if (!password || password.length < 6) {
      return { success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự!' };
    }

    if (!isSupabaseConfigured) {
      // Fallback local memory profile if credentials not provided
      const localId = `usr_${Date.now()}`;
      const localUser: UserProfile = {
        id: localId,
        name: name.trim(),
        username,
        email,
        phone: phone || '',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(localId)}`,
        role: role === 'admin' ? 'buyer' : role,
        balance: 0,
        pendingBalance: 0,
        rating: 5.0,
        completedSales: 0,
        isVerifiedSeller: false,
        sellerTier: 'FREE',
        wishlistIds: [],
        createdAt: new Date().toISOString()
      };
      return { success: true, message: `Đăng ký thành công! Chào mừng ${name}.`, user: localUser };
    }

    // 1. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name.trim(),
          role: role === 'admin' ? 'buyer' : role,
          phone: phone || '',
        }
      }
    });

    if (authError) {
      return { success: false, message: `Lỗi đăng ký: ${authError.message}`, errorCode: authError.code };
    }

    const userId = authData.user?.id;
    if (!userId) {
      return { success: false, message: 'Không thể tạo tài khoản xác thực.' };
    }

    // 2. Create profile entry in PostgreSQL
    const profile: UserProfile = {
      id: userId,
      name: name.trim(),
      username,
      email,
      phone: phone || '',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userId)}`,
      role: role === 'admin' ? 'buyer' : role,
      balance: 0,
      pendingBalance: 0,
      rating: 5.0,
      completedSales: 0,
      isVerifiedSeller: false,
      sellerTier: 'FREE',
      wishlistIds: [],
      createdAt: new Date().toISOString()
    };

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      name: profile.name,
      username: profile.username,
      email: profile.email,
      phone: profile.phone,
      avatar: profile.avatar,
      role: profile.role,
      balance: 0,
      pending_balance: 0,
      rating: 5.0,
      completed_sales: 0,
      is_verified_seller: false,
      seller_tier: 'FREE',
      wishlist_ids: [],
    });

    if (profileError) {
      console.warn('Profile sync warning:', profileError);
    }

    return {
      success: true,
      message: `Đăng ký thành công! Chào mừng ${profile.name}.`,
      user: profile
    };
  } catch (error: any) {
    console.error('Supabase Register Error:', error);
    return { success: false, message: error.message || 'Lỗi không xác định khi đăng ký' };
  }
}

/**
 * Login user via Supabase Auth
 */
export async function loginWithSupabase(
  emailOrUsername: string,
  password: string
): Promise<{ success: boolean; message: string; user?: UserProfile; errorCode?: string }> {
  try {
    const rawAccount = (emailOrUsername || '').trim().toLowerCase();
    const isEmail = rawAccount.includes('@');
    const email = isEmail ? rawAccount : `${rawAccount}@cholienquan.com`;

    if (!password) {
      return { success: false, message: 'Vui lòng nhập mật khẩu!' };
    }

    if (!isSupabaseConfigured) {
      return { success: false, message: 'Chưa cấu hình VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY trong môi trường.' };
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return { success: false, message: 'Tên tài khoản hoặc mật khẩu không chính xác!', errorCode: authError.code };
    }

    const user = authData.user;
    if (!user) {
      return { success: false, message: 'Không thể tìm thấy thông tin đăng nhập.' };
    }

    // Fetch profile from PostgreSQL
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const userProfile: UserProfile = profileData ? {
      id: profileData.id,
      name: profileData.name || user.email?.split('@')[0] || 'User',
      username: profileData.username || user.email?.split('@')[0] || 'user',
      email: profileData.email || user.email || '',
      phone: profileData.phone || '',
      avatar: profileData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`,
      role: profileData.role || 'buyer',
      balance: Number(profileData.balance || 0),
      pendingBalance: Number(profileData.pending_balance || 0),
      rating: Number(profileData.rating || 5.0),
      completedSales: Number(profileData.completed_sales || 0),
      isVerifiedSeller: Boolean(profileData.is_verified_seller),
      sellerTier: profileData.seller_tier || 'FREE',
      bankName: profileData.bank_name,
      bankAccount: profileData.bank_account,
      bankAccountName: profileData.bank_account_name,
      wishlistIds: profileData.wishlist_ids || [],
      createdAt: profileData.created_at || new Date().toISOString()
    } : {
      id: user.id,
      name: user.email?.split('@')[0] || 'User',
      username: user.email?.split('@')[0] || 'user',
      email: user.email || '',
      phone: '',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`,
      role: 'buyer',
      balance: 0,
      pendingBalance: 0,
      rating: 5.0,
      completedSales: 0,
      isVerifiedSeller: false,
      sellerTier: 'FREE',
      wishlistIds: [],
      createdAt: new Date().toISOString()
    };

    return {
      success: true,
      message: `Đăng nhập thành công! Chào mừng ${userProfile.name}.`,
      user: userProfile
    };
  } catch (error: any) {
    console.error('Supabase Login Error:', error);
    return { success: false, message: error.message || 'Lỗi đăng nhập' };
  }
}

/**
 * Logout from Supabase
 */
export async function logoutFromSupabase(): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.auth.signOut();
  }
}

/**
 * Change password via Supabase Auth
 */
export async function changeSupabasePassword(
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự!' };
    }
    if (!isSupabaseConfigured) {
      return { success: true, message: 'Đổi mật khẩu thành công!' };
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Đổi mật khẩu tài khoản thành công qua Supabase Auth!' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Lỗi đổi mật khẩu' };
  }
}
