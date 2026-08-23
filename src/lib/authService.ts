import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, UserRole } from '../types';
import { cleanForFirestore } from './dbService';

// Format username into a standard email format if input is not already an email
export function normalizeEmail(input: string): string {
  const trimmed = (input || '').trim().toLowerCase();
  if (trimmed.includes('@')) {
    return trimmed;
  }
  // Sanitize username for email formatting
  const sanitized = trimmed.replace(/[^a-z0-9._-]/g, '');
  return `${sanitized || 'user'}@cholienquan.com`;
}

/**
 * Register a new user strictly using Firebase Auth and persist profile to Firestore `/users/{uid}`
 */
export async function registerWithFirebase(
  name: string,
  emailOrUsername: string,
  password: string,
  role: UserRole = 'buyer',
  phone?: string
): Promise<{ success: boolean; message: string; user?: UserProfile }> {
  try {
    const formattedEmail = normalizeEmail(emailOrUsername);
    if (!password || password.length < 6) {
      return {
        success: false,
        message: 'Mật khẩu bảo mật phải có ít nhất 6 ký tự!'
      };
    }

    // 1. Authenticate with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, formattedEmail, password);
    const fbUser = userCredential.user;

    // 2. Set Firebase Auth Display Name
    await updateProfile(fbUser, {
      displayName: name.trim()
    });

    const isSeller = role === 'seller';
    const newUserProfile: UserProfile = {
      id: fbUser.uid,
      name: name.trim(),
      email: formattedEmail,
      phone: (phone || '').trim(),
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fbUser.uid)}`,
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

    // 3. Save to Firestore `/users/{uid}`
    await setDoc(doc(db, 'users', fbUser.uid), cleanForFirestore(newUserProfile));

    return {
      success: true,
      message: `Đăng ký tài khoản "${name}" thành công!`,
      user: newUserProfile
    };
  } catch (error: any) {
    console.error('Firebase Auth Register Error:', error);
    let message = 'Đăng ký thất bại. Vui lòng thử lại!';
    if (error.code === 'auth/email-already-in-use') {
      message = 'Email hoặc Tên tài khoản này đã được đăng ký!';
    } else if (error.code === 'auth/weak-password') {
      message = 'Mật khẩu quá ngắn, vui lòng nhập ít nhất 6 ký tự!';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Định dạng tài khoản hoặc email không hợp lệ!';
    } else if (error.code === 'auth/operation-not-allowed') {
      message = 'Phương thức Email/Password chưa được kích hoạt trên Firebase Console!';
    } else if (error.code === 'auth/network-request-failed') {
      message = 'Lỗi kết nối mạng, vui lòng kiểm tra Internet!';
    } else if (error.code) {
      message = `Lỗi đăng ký [${error.code}]: ${error.message || 'Thử lại'}`;
    }
    return { success: false, message };
  }
}

/**
 * Log in strictly with Firebase Auth and fetch profile from Firestore `/users/{uid}`
 */
export async function loginWithFirebase(
  emailOrUsername: string,
  password: string
): Promise<{ success: boolean; message: string; user?: UserProfile }> {
  try {
    const formattedEmail = normalizeEmail(emailOrUsername);
    if (!password) {
      return { success: false, message: 'Vui lòng nhập mật khẩu!' };
    }

    // 1. Authenticate with Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(auth, formattedEmail, password);
    const fbUser = userCredential.user;

    // 2. Fetch User Profile from Firestore `/users/{uid}`
    const userDocRef = doc(db, 'users', fbUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    let userProfile: UserProfile;
    if (userDocSnap.exists()) {
      userProfile = userDocSnap.data() as UserProfile;
      userProfile.id = fbUser.uid;
      userProfile.email = fbUser.email || formattedEmail;
    } else {
      // Auto create missing user doc with fbUser.uid
      userProfile = {
        id: fbUser.uid,
        name: fbUser.displayName || formattedEmail.split('@')[0],
        email: fbUser.email || formattedEmail,
        phone: '',
        avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
        role: formattedEmail.includes('admin') ? 'admin' : 'buyer',
        balance: 0,
        pendingBalance: 0,
        rating: 5.0,
        completedSales: 0,
        isVerifiedSeller: false,
        sellerTier: 'FREE',
        wishlistIds: [],
        createdAt: new Date().toISOString()
      };
      await setDoc(userDocRef, cleanForFirestore(userProfile));
    }

    return {
      success: true,
      message: `Đăng nhập thành công! Chào mừng ${userProfile.name}.`,
      user: userProfile
    };
  } catch (error: any) {
    console.error('Firebase Auth Login Error:', error);
    let message = 'Tài khoản hoặc mật khẩu không chính xác!';
    if (
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/invalid-credential'
    ) {
      message = 'Tên tài khoản hoặc mật khẩu không chính xác (auth/invalid-credential)!';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Định dạng email/tên tài khoản không hợp lệ!';
    } else if (error.code === 'auth/user-disabled') {
      message = 'Tài khoản này đã bị vô hiệu hoá trên hệ thống!';
    } else if (error.code === 'auth/too-many-requests') {
      message = 'Bạn đã đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ít phút!';
    } else if (error.code === 'auth/network-request-failed') {
      message = 'Lỗi kết nối mạng, vui lòng kiểm tra Internet!';
    } else if (error.code) {
      message = `Lỗi đăng nhập [${error.code}]: ${error.message || 'Thử lại'}`;
    }
    return { success: false, message };
  }
}

/**
 * Sign out from Firebase Auth
 */
export async function logoutFromFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Firebase Auth SignOut Error:', error);
  }
}

/**
 * Subscribe to Auth State changes
 */
export function onFirebaseAuthStateChanged(
  onUserFound: (user: FirebaseUser | null) => void
) {
  return onAuthStateChanged(auth, onUserFound);
}

/**
 * Update password in Firebase Auth
 */
export async function changeFirebasePassword(
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (!auth.currentUser) {
      return { success: false, message: 'Bạn chưa đăng nhập!' };
    }
    await updatePassword(auth.currentUser, newPassword);
    return { success: true, message: 'Đổi mật khẩu tài khoản thành công qua Firebase Auth!' };
  } catch (error: any) {
    console.error('Firebase updatePassword error:', error);
    if (error.code === 'auth/requires-recent-login') {
      return {
        success: false,
        message: 'Vì lý do bảo mật, vui lòng đăng xuất và đăng nhập lại trước khi đổi mật khẩu!'
      };
    } else if (error.code === 'auth/weak-password') {
      return {
        success: false,
        message: 'Mật khẩu mới quá ngắn, vui lòng nhập ít nhất 6 ký tự!'
      };
    }
    return {
      success: false,
      message: error.message || 'Không thể đổi mật khẩu. Vui lòng thử lại!'
    };
  }
}
