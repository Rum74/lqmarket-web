import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, UserRole } from '../types';
import { cleanForFirestore } from './dbService';

// Format username into a standard email format if input is not already an email
export function normalizeEmail(input: string): string {
  const trimmed = input.trim();
  if (trimmed.includes('@')) {
    return trimmed.toLowerCase();
  }
  // Sanitize username for email formatting
  const sanitized = trimmed.toLowerCase().replace(/[^a-z0-9._-]/g, '');
  return `${sanitized || 'user'}@cholienquan.com`;
}

/**
 * Register a new user using Firebase Auth and persist profile to Firestore `/users/{uid}`
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
    const userCredential = await createUserWithEmailAndPassword(auth, formattedEmail, password);
    const fbUser = userCredential.user;

    await updateProfile(fbUser, {
      displayName: name
    });

    const isSeller = role === 'seller';
    const newUserProfile: UserProfile = {
      id: fbUser.uid,
      name: name.trim(),
      email: formattedEmail,
      phone: phone || '',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name.trim())}`,
      role: role,
      balance: 0,
      pendingBalance: 0,
      rating: 5.0,
      completedSales: 0,
      isVerifiedSeller: isSeller,
      sellerTier: isSeller ? 'BASIC' : 'FREE',
      wishlistIds: [],
      createdAt: new Date().toISOString()
    };

    // Save to Firestore
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
      message = 'Tên tài khoản hoặc Email này đã được đăng ký!';
    } else if (error.code === 'auth/weak-password') {
      message = 'Mật khẩu quá ngắn, vui lòng nhập ít nhất 6 ký tự!';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Định dạng tài khoản/email không hợp lệ!';
    } else if (error.message) {
      message = error.message;
    }
    return { success: false, message };
  }
}

/**
 * Log in with Firebase Auth and fetch profile from Firestore
 */
export async function loginWithFirebase(
  emailOrUsername: string,
  password: string
): Promise<{ success: boolean; message: string; user?: UserProfile }> {
  try {
    const formattedEmail = normalizeEmail(emailOrUsername);
    const userCredential = await signInWithEmailAndPassword(auth, formattedEmail, password);
    const fbUser = userCredential.user;

    // Fetch User Profile from Firestore
    const userDocRef = doc(db, 'users', fbUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    let userProfile: UserProfile;
    if (userDocSnap.exists()) {
      userProfile = userDocSnap.data() as UserProfile;
    } else {
      // Auto create missing user doc
      userProfile = {
        id: fbUser.uid,
        name: fbUser.displayName || emailOrUsername.split('@')[0],
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
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      message = 'Tên tài khoản hoặc mật khẩu không chính xác!';
    } else if (error.code === 'auth/too-many-requests') {
      message = 'Bạn đã đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ít phút!';
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
