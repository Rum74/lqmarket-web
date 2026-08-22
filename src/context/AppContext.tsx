import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AccountItem,
  UserProfile,
  OrderItem,
  ChatMessage,
  AppNotification,
  WalletTransaction,
  UserRole,
  FilterOptions,
  AccountStatus
} from '../types';
import { INITIAL_USERS, INITIAL_ACCOUNTS, INITIAL_ORDERS, INITIAL_TRANSACTIONS } from '../data/mockData';
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  limit
} from 'firebase/firestore';

interface AppContextType {
  // Auth & User State
  currentUser: UserProfile;
  allUsers: UserProfile[];
  isLoggedIn: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
  openLoginModal: () => void;
  openRegisterModal: (preferredRole?: UserRole) => void;
  loginUser: (email: string, password?: string) => Promise<{ success: boolean; message: string }>;
  registerUser: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    phone?: string
  ) => Promise<{ success: boolean; message: string }>;
  logoutUser: () => void;
  quickSwitchUser: (userId: string) => void;
  updateCurrentUserProfile: (data: Partial<UserProfile>) => void;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  openProfileModal: () => void;
  cloudSyncStatus: 'synced' | 'syncing' | 'offline' | 'error';

  // Navigation & Views
  currentView: 'home' | 'accounts' | 'sell' | 'orders' | 'wishlist' | 'admin' | 'guide';
  setCurrentView: (view: 'home' | 'accounts' | 'sell' | 'orders' | 'wishlist' | 'admin' | 'guide') => void;
  selectedAccountId: string | null;
  setSelectedAccountId: (id: string | null) => void;
  selectedSellerId: string | null;
  setSelectedSellerId: (id: string | null) => void;
  openSellerProfile: (sellerId: string) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  checkoutAccountId: string | null;
  setCheckoutAccountId: (id: string | null) => void;
  startCheckout: (accountId: string) => void;
  isWalletOpen: boolean;
  setIsWalletOpen: (open: boolean) => void;
  isWalletModalOpen: boolean;
  setIsWalletModalOpen: (open: boolean) => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  chatRecipient: { id: string; name: string; avatar: string; role: string } | null;
  activeChatPartner: { id: string; name: string; avatar: string; role: string } | null;
  openChatWith: (recipient: { id: string; name: string; avatar: string; role: string }) => void;
  closeChat: () => void;

  // Accounts
  accounts: AccountItem[];
  filterOptions: FilterOptions;
  setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptions>>;
  resetFilters: () => void;
  createAccount: (
    newAccountData: Omit<AccountItem, 'id' | 'code' | 'createdAt' | 'views' | 'likes' | 'status'>
  ) => Promise<{ success: boolean; message: string; accountId?: string }>;
  updateAccountStatus: (accountId: string, status: AccountStatus, rejectionReason?: string) => void;
  deleteAccount: (accountId: string) => void;

  // Wishlist
  wishlistIds: string[];
  toggleWishlist: (accountId: string) => void;
  isWishlisted: (accountId: string) => boolean;

  // Orders & Escrow workflow
  orders: OrderItem[];
  createOrder: (accountId: string) => { success: boolean; orderId?: string; message: string };
  confirmAccountDelivery: (orderId: string) => void;
  confirmOrderReceived: (orderId: string) => void;
  disputeOrder: (orderId: string, reason: string) => void;
  adminResolveDispute: (orderId: string, resolution: 'refund_buyer' | 'payout_seller') => void;
  submitReview: (orderId: string, rating: number, comment: string) => void;

  // Wallet & Payment Gateway API
  transactions: WalletTransaction[];
  depositBalance: (amount: number, method: string, note?: string) => void;
  depositFunds: (amount: number, method: string) => void;
  withdrawBalance: (
    amount: number,
    bankInfo: string,
    bankDetails?: {
      bankName: string;
      bankCode?: string;
      bankAccount: string;
      bankAccountName: string;
    }
  ) => boolean;
  withdrawFunds: (amount: number, bankInfo: string) => { success: boolean; message: string };
  adminApproveWithdrawal: (txId: string, refNote?: string) => Promise<{ success: boolean; message: string }>;
  adminRejectWithdrawal: (txId: string, reason: string) => Promise<{ success: boolean; message: string }>;
  adminDisburseEarly: (orderId: string) => Promise<{ success: boolean; message: string }>;

  // Chat
  chatMessages: ChatMessage[];
  sendMessage: (recipientId: string, text: string, orderId?: string) => void;
  sendDirectMessage: (msgData: {
    senderId: string;
    senderName: string;
    senderAvatar: string;
    recipientId: string;
    text: string;
    orderId?: string;
  }) => void;

  // Notifications
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Admin User Management
  adminCreateUser: (userData: Omit<UserProfile, 'id' | 'createdAt'>) => Promise<{ success: boolean; message: string; userId?: string }>;
  adminUpdateUser: (userId: string, data: Partial<UserProfile>) => Promise<{ success: boolean; message: string }>;
  adminDeleteUser: (userId: string) => Promise<{ success: boolean; message: string }>;
  adminAdjustUserBalance: (userId: string, amount: number, note: string) => Promise<{ success: boolean; message: string }>;

  // System & Database Management
  resetToDefaultData: () => void;
  clearAllFirebaseData: () => Promise<{ success: boolean; message: string }>;
  seedSampleData: () => Promise<{ success: boolean; message: string }>;
}

const DEFAULT_FILTERS: FilterOptions = {
  search: '',
  rank: 'all',
  minPrice: 0,
  maxPrice: 6000000,
  minHeroes: 0,
  minSkins: 0,
  server: 'all',
  rareSkinType: 'all',
  securityType: 'all',
  badge: 'all',
  sortBy: 'newest'
};

// Clean object recursively to eliminate undefined values for Firestore compatibility
export function cleanForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as unknown as T;
  }
  return JSON.parse(
    JSON.stringify(data, (_, value) => (value === undefined ? null : value))
  );
}

export const GUEST_USER: UserProfile = {
  id: '',
  name: 'Khách',
  email: '',
  phone: '',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
  role: 'buyer',
  balance: 0,
  pendingBalance: 0,
  rating: 5.0,
  completedSales: 0,
  isVerifiedSeller: false,
  sellerTier: 'FREE',
  createdAt: new Date().toISOString().split('T')[0]
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'lqmarket_v2_firebase_data';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial State from localStorage or Defaults
  const loadSavedData = () => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.allUsers && Array.isArray(parsed.allUsers)) {
          parsed.allUsers = parsed.allUsers
            .filter((u: unknown) => u && typeof u === 'object')
            .map((u: Partial<UserProfile>) => ({
              ...u,
              id: u.id || `user_${Date.now()}`,
              name: u.name || 'Người dùng',
              email: u.email || '',
              role: u.role || 'buyer',
              balance: typeof u.balance === 'number' ? u.balance : 0,
              pendingBalance: typeof u.pendingBalance === 'number' ? u.pendingBalance : 0,
              avatar: u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80'
            }));
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Error reading local cache:', e);
    }
    return null;
  };

  const savedData = loadSavedData();

  const [allUsers, setAllUsers] = useState<UserProfile[]>(
    savedData?.allUsers?.length ? savedData.allUsers : INITIAL_USERS
  );
  // Restore current login state from local storage so reloading the browser does not log the user out
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return savedData?.isLoggedIn && savedData?.currentUserId ? savedData.currentUserId : '';
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return Boolean(savedData?.isLoggedIn && savedData?.currentUserId);
  });
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');

  const [accounts, setAccounts] = useState<AccountItem[]>(savedData?.accounts || INITIAL_ACCOUNTS);
  const [orders, setOrders] = useState<OrderItem[]>(savedData?.orders || INITIAL_ORDERS);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(
    savedData?.transactions || INITIAL_TRANSACTIONS
  );
  const [wishlistIds, setWishlistIds] = useState<string[]>(
    savedData?.wishlistIds || []
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(
    savedData?.chatMessages || []
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(
    savedData?.notifications || []
  );

  // View States - Always start at Home
  const [currentView, setCurrentView] = useState<'home' | 'accounts' | 'sell' | 'orders' | 'wishlist' | 'admin' | 'guide'>('home');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutAccountId, setCheckoutAccountId] = useState<string | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatRecipient, setChatRecipient] = useState<{ id: string; name: string; avatar: string; role: string } | null>(null);

  // Auth & Profile Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Filters
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(DEFAULT_FILTERS);

  // Save to LocalStorage immediately
  useEffect(() => {
    try {
      const dataToSave = {
        allUsers,
        currentUserId,
        isLoggedIn,
        accounts,
        orders,
        transactions,
        wishlistIds,
        chatMessages,
        notifications
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [allUsers, currentUserId, isLoggedIn, accounts, orders, transactions, wishlistIds, chatMessages, notifications]);

  // Firestore Sync Mechanism (Real-time Cloud Database Integration for all collections)
  useEffect(() => {
    let unsubscribeAccounts: (() => void) | undefined;
    let unsubscribeUsers: (() => void) | undefined;
    let unsubscribeOrders: (() => void) | undefined;
    let unsubscribeTransactions: (() => void) | undefined;
    let unsubscribeMessages: (() => void) | undefined;
    let unsubscribeNotifications: (() => void) | undefined;

    const setupFirestoreSync = async () => {
      try {
        setCloudSyncStatus('syncing');
        // Check if database is empty - do not force re-seed unless requested
        const accountsRef = collection(db, 'accounts');
        const accountsSnap = await getDocs(accountsRef);
        const usersRef = collection(db, 'users');
        const usersSnap = await getDocs(usersRef);

        if (usersSnap.empty) {
          // Initialize super admin and users so login remains available
          for (const u of INITIAL_USERS) {
            await setDoc(doc(db, 'users', u.id), cleanForFirestore(u));
          }
        }

        if (accountsSnap.empty) {
          // Seed initial accounts to Firestore
          for (const a of INITIAL_ACCOUNTS) {
            await setDoc(doc(db, 'accounts', a.id), cleanForFirestore(a));
          }
        }

        // 1. Subscribe to real-time accounts
        unsubscribeAccounts = onSnapshot(
          collection(db, 'accounts'),
          snapshot => {
            const cloudAccounts: AccountItem[] = [];
            snapshot.forEach(d => {
              const data = d.data() as Partial<AccountItem>;
              if (data) {
                const accId = data.id || d.id;
                cloudAccounts.push({
                  id: accId,
                  code: data.code || `LQ${accId.slice(-5)}`,
                  title: data.title || 'Tài khoản Liên Quân',
                  price: typeof data.price === 'number' ? data.price : 0,
                  originalPrice: typeof data.originalPrice === 'number' ? data.originalPrice : undefined,
                  rank: data.rank || 'Cao Thủ',
                  level: typeof data.level === 'number' ? data.level : 30,
                  heroesCount: typeof data.heroesCount === 'number' ? data.heroesCount : 0,
                  skinsCount: typeof data.skinsCount === 'number' ? data.skinsCount : 0,
                  runePages: data.runePages || 'Full Ngọc',
                  server: data.server || 'Việt Nam',
                  rareSkins: Array.isArray(data.rareSkins) ? data.rareSkins : [],
                  notableHeroes: Array.isArray(data.notableHeroes) ? data.notableHeroes : [],
                  badgeTag: data.badgeTag || 'HOT',
                  images: Array.isArray(data.images) && data.images.length > 0 ? data.images : ['https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'],
                  description: data.description || '',
                  sellerId: data.sellerId || '',
                  sellerName: data.sellerName || 'Người bán',
                  sellerAvatar: data.sellerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
                  sellerRating: typeof data.sellerRating === 'number' ? data.sellerRating : undefined,
                  sellerCompletedSales: typeof data.sellerCompletedSales === 'number' ? data.sellerCompletedSales : 0,
                  sellerResponseTime: data.sellerResponseTime || '2 phút',
                  sellerVerified: !!data.sellerVerified,
                  status: data.status || 'pending',
                  rejectionReason: data.rejectionReason || undefined,
                  credentials: data.credentials || {
                    username: '',
                    password: '',
                    securityType: 'Trắng Thông Tin',
                    secretNotes: ''
                  },
                  createdAt: data.createdAt || new Date().toISOString(),
                  views: typeof data.views === 'number' ? data.views : 1,
                  likes: typeof data.likes === 'number' ? data.likes : 0,
                  isFeatured: !!data.isFeatured
                });
              }
            });
            if (cloudAccounts.length > 0) {
              setAccounts(cloudAccounts);
            }
            setCloudSyncStatus('synced');
          },
          err => {
            console.warn('Firestore accounts listener error:', err);
            setCloudSyncStatus('offline');
          }
        );

        // 2. Subscribe to real-time users
        unsubscribeUsers = onSnapshot(
          collection(db, 'users'),
          snapshot => {
            const cloudUsers: UserProfile[] = [];
            snapshot.forEach(d => {
              const uData = d.data() as Partial<UserProfile>;
              if (uData && uData.id) {
                cloudUsers.push({
                  id: uData.id,
                  name: uData.name || 'Người dùng',
                  email: uData.email || '',
                  password: uData.password || '',
                  phone: uData.phone || '',
                  avatar: uData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
                  role: uData.role || 'buyer',
                  balance: typeof uData.balance === 'number' ? uData.balance : 0,
                  pendingBalance: typeof uData.pendingBalance === 'number' ? uData.pendingBalance : 0,
                  rating: uData.rating ?? 5.0,
                  completedSales: uData.completedSales ?? 0,
                  isVerifiedSeller: !!uData.isVerifiedSeller,
                  sellerTier: uData.sellerTier || 'BASIC',
                  createdAt: uData.createdAt || new Date().toISOString().split('T')[0],
                  bio: uData.bio || '',
                  bankName: uData.bankName || '',
                  bankAccount: uData.bankAccount || '',
                  bankAccountName: uData.bankAccountName || '',
                  wishlistIds: Array.isArray(uData.wishlistIds) ? uData.wishlistIds : []
                });
              }
            });
            if (cloudUsers.length > 0) {
              setAllUsers(cloudUsers);
            } else {
              // If users collection was wiped, keep only the Super Admin
              const adminUser = INITIAL_USERS[0];
              setAllUsers([adminUser]);
            }
          },
          err => {
            console.warn('Firestore users listener error:', err);
          }
        );

        // 3. Subscribe to real-time orders
        unsubscribeOrders = onSnapshot(
          collection(db, 'orders'),
          snapshot => {
            const cloudOrders: OrderItem[] = [];
            snapshot.forEach(d => {
              const ord = d.data() as OrderItem;
              if (ord && ord.id) {
                cloudOrders.push(ord);
              }
            });
            setOrders(cloudOrders);
          },
          err => {
            console.warn('Firestore orders listener error:', err);
          }
        );

        // 4. Subscribe to real-time transactions
        unsubscribeTransactions = onSnapshot(
          collection(db, 'transactions'),
          snapshot => {
            const cloudTx: WalletTransaction[] = [];
            snapshot.forEach(d => {
              const tx = d.data() as WalletTransaction;
              if (tx && tx.id) {
                cloudTx.push(tx);
              }
            });
            setTransactions(cloudTx);
          },
          err => {
            console.warn('Firestore transactions listener error:', err);
          }
        );

        // 5. Subscribe to real-time messages
        unsubscribeMessages = onSnapshot(
          collection(db, 'messages'),
          snapshot => {
            const cloudMsgs: ChatMessage[] = [];
            snapshot.forEach(d => {
              const msg = d.data() as ChatMessage;
              if (msg && msg.id) {
                cloudMsgs.push(msg);
              }
            });
            setChatMessages(cloudMsgs);
          },
          err => {
            console.warn('Firestore messages listener error:', err);
          }
        );

        // 6. Subscribe to real-time notifications
        unsubscribeNotifications = onSnapshot(
          collection(db, 'notifications'),
          snapshot => {
            const cloudNotifs: AppNotification[] = [];
            snapshot.forEach(d => {
              const notif = d.data() as AppNotification;
              if (notif && notif.id) {
                cloudNotifs.push(notif);
              }
            });
            if (cloudNotifs.length > 0) {
              setNotifications(cloudNotifs);
            }
          },
          err => {
            console.warn('Firestore notifications listener error:', err);
          }
        );
      } catch (err) {
        console.warn('Firebase Firestore setup encountered offline mode:', err);
        setCloudSyncStatus('offline');
      }
    };

    setupFirestoreSync();

    return () => {
      if (unsubscribeAccounts) unsubscribeAccounts();
      if (unsubscribeUsers) unsubscribeUsers();
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeTransactions) unsubscribeTransactions();
      if (unsubscribeMessages) unsubscribeMessages();
      if (unsubscribeNotifications) unsubscribeNotifications();
    };
  }, []);

  const currentUser =
    isLoggedIn && currentUserId
      ? (allUsers && allUsers.find(u => u && u.id === currentUserId)) || GUEST_USER
      : GUEST_USER;

  // Sync wishlist strictly to current logged-in user's data
  useEffect(() => {
    if (isLoggedIn && currentUser && currentUser.id) {
      setWishlistIds(Array.isArray(currentUser.wishlistIds) ? currentUser.wishlistIds : []);
    } else {
      setWishlistIds([]);
    }
  }, [isLoggedIn, currentUserId, currentUser?.id, currentUser?.wishlistIds]);

  // Auth Operations
  const openLoginModal = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = (preferredRole: UserRole = 'buyer') => {
    setAuthModalMode('register');
    setIsAuthModalOpen(true);
  };

  const loginUser = async (identifier: string, password?: string): Promise<{ success: boolean; message: string }> => {
    const rawInput = (identifier || '').trim();
    const cleanInput = rawInput.toLowerCase();

    // Match by username, email, email prefix (before @), phone number, or display name
    const user = allUsers.find(u => {
      if (!u) return false;
      const matchUsername = u.username && u.username.toLowerCase() === cleanInput;
      const matchEmail = u.email && u.email.toLowerCase() === cleanInput;
      const matchEmailPrefix = u.email && u.email.split('@')[0].toLowerCase() === cleanInput;
      const matchPhone = u.phone && u.phone.trim() === rawInput;
      const matchName = u.name && u.name.toLowerCase() === cleanInput;
      return matchUsername || matchEmail || matchEmailPrefix || matchPhone || matchName;
    });

    if (!user) {
      return {
        success: false,
        message: 'Tên tài khoản hoặc mật khẩu không đúng. Vui lòng kiểm tra lại!'
      };
    }

    if (password && user.password && user.password !== password) {
      return {
        success: false,
        message: 'Mật khẩu đăng nhập không chính xác. Vui lòng thử lại!'
      };
    }

    setCurrentUserId(user.id);
    setIsLoggedIn(true);
    setIsAuthModalOpen(false);

    // Add login notification
    const loginNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: user.id,
      title: 'Đăng nhập thành công',
      message: `Chào mừng trở lại ${user.name} (${user.role.toUpperCase()})!`,
      type: 'system',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [loginNotif, ...prev]);

    return {
      success: true,
      message: `Đăng nhập thành công với vai trò ${user.role.toUpperCase()}`
    };
  };

  const registerUser = async (
    name: string,
    usernameOrEmail: string,
    password: string,
    role: UserRole,
    phone: string = '0988888888'
  ): Promise<{ success: boolean; message: string }> => {
    const rawAccount = (usernameOrEmail || '').trim();
    const cleanAccount = rawAccount.toLowerCase();

    // Check if account / username / email already taken
    const existing = allUsers.find(u => {
      if (!u) return false;
      const matchUsername = u.username && u.username.toLowerCase() === cleanAccount;
      const matchEmail = u.email && u.email.toLowerCase() === cleanAccount;
      const matchEmailPrefix = u.email && u.email.split('@')[0].toLowerCase() === cleanAccount;
      return matchUsername || matchEmail || matchEmailPrefix;
    });

    if (existing) {
      return {
        success: false,
        message: 'Tên tài khoản hoặc Email này đã được sử dụng. Vui lòng chọn tên khác!'
      };
    }

    // Role can only be buyer or seller during registration
    const validatedRole: UserRole = role === 'admin' ? 'buyer' : role;
    const isEmailFormat = cleanAccount.includes('@');
    const assignedUsername = isEmailFormat ? cleanAccount.split('@')[0] : cleanAccount;
    const assignedEmail = isEmailFormat ? cleanAccount : `${cleanAccount}@lqmarket.vn`;

    const newUserId = `user_${Date.now()}`;
    const newUser: UserProfile = {
      id: newUserId,
      name: name.trim(),
      username: assignedUsername,
      email: assignedEmail,
      password: password,
      phone: phone.trim(),
      avatar:
        validatedRole === 'seller'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
      role: validatedRole,
      balance: 0,
      pendingBalance: 0,
      rating: 5.0,
      completedSales: 0,
      isVerifiedSeller: validatedRole === 'seller',
      sellerTier: validatedRole === 'seller' ? 'BASIC' : 'FREE',
      createdAt: new Date().toISOString()
    };

    setAllUsers(prev => [newUser, ...prev]);
    setCurrentUserId(newUserId);
    setIsLoggedIn(true);
    setIsAuthModalOpen(false);

    // Sync user to Firestore
    try {
      await setDoc(doc(db, 'users', newUserId), cleanForFirestore(newUser));
    } catch (e) {
      console.warn('Firestore user save offline fallback:', e);
    }

    // Welcome notification
    const welcomeNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: newUserId,
      title: 'Đăng ký tài khoản thành công',
      message: `Chào mừng ${name} đến với sàn giao dịch LQMarket! Bạn có thể nạp tiền để mua acc hoặc đăng bán tài khoản Liên Quân Mobile.`,
      type: 'system',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [welcomeNotif, ...prev]);
    try {
      await setDoc(doc(db, 'notifications', welcomeNotif.id), cleanForFirestore(welcomeNotif));
    } catch (e) {
      console.warn('Firestore notif save error:', e);
    }

    return {
      success: true,
      message: 'Đăng ký tài khoản thành công!'
    };
  };

  const logoutUser = () => {
    setIsLoggedIn(false);
    setCurrentUserId('');
    setCurrentView('home');
  };

  const quickSwitchUser = (userId: string) => {
    const target = allUsers.find(u => u.id === userId);
    if (target) {
      setCurrentUserId(userId);
      setIsLoggedIn(true);
    }
  };

  const openProfileModal = () => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    setIsProfileModalOpen(true);
  };

  const updateCurrentUserProfile = async (data: Partial<UserProfile>) => {
    setAllUsers(prev =>
      prev.map(u => (u.id === currentUserId ? { ...u, ...data } : u))
    );
    try {
      await setDoc(doc(db, 'users', currentUserId), cleanForFirestore(data), { merge: true });
    } catch (e) {
      console.error('Firestore update profile error:', e);
      throw e;
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>): Promise<void> => {
    await updateCurrentUserProfile(data);
  };

  const resetFilters = () => {
    setFilterOptions(DEFAULT_FILTERS);
  };

  const startCheckout = (accountId: string) => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    setCheckoutAccountId(accountId);
    setIsCheckoutOpen(true);
  };

  const openSellerProfile = (sellerId: string) => {
    setSelectedSellerId(sellerId);
  };

  const openChatWith = (recipient: { id: string; name: string; avatar: string; role: string }) => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    setChatRecipient(recipient);
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  // Toggle Wishlist
  const toggleWishlist = (accountId: string) => {
    if (!isLoggedIn || !currentUser.id) {
      openLoginModal();
      return;
    }
    setWishlistIds(prev => {
      const exists = prev.includes(accountId);
      const updated = exists ? prev.filter(id => id !== accountId) : [...prev, accountId];
      setAccounts(accs =>
        accs.map(a =>
          a.id === accountId ? { ...a, likes: Math.max(0, a.likes + (exists ? -1 : 1)) } : a
        )
      );

      setAllUsers(prevUsers =>
        prevUsers.map(u => (u.id === currentUser.id ? { ...u, wishlistIds: updated } : u))
      );

      // Persist to Firestore
      try {
        setDoc(doc(db, 'users', currentUser.id), { wishlistIds: updated }, { merge: true });
      } catch (e) {
        console.warn('Firestore wishlist sync error:', e);
      }

      return updated;
    });
  };

  const isWishlisted = (accountId: string) => wishlistIds.includes(accountId);

  // Account Creation & Firestore write
  const createAccount = async (
    newAccountData: Omit<AccountItem, 'id' | 'code' | 'createdAt' | 'views' | 'likes' | 'status'>
  ): Promise<{ success: boolean; message: string; accountId?: string }> => {
    const newId = `acc_${Date.now()}`;
    const codeNum = Math.floor(10000 + Math.random() * 90000);
    const newAccount: AccountItem = {
      ...newAccountData,
      id: newId,
      code: `LQ${codeNum}`,
      status: 'pending', // Awaiting Admin Approval
      createdAt: new Date().toISOString(),
      views: 1,
      likes: 0
    };

    setAccounts(prev => [newAccount, ...prev]);

    // Save to Firestore
    try {
      await setDoc(doc(db, 'accounts', newId), cleanForFirestore(newAccount));
    } catch (e) {
      console.warn('Firestore write offline fallback:', e);
    }

    // Add notification to admin
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: 'user_admin_1',
      title: 'Có tin đăng mới chờ duyệt',
      message: `Người bán ${currentUser.name} vừa đăng acc #${newAccount.code} (${newAccount.rank} - ${newAccount.price.toLocaleString('vi-VN')}đ).`,
      type: 'account',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
    try {
      await setDoc(doc(db, 'notifications', newNotif.id), cleanForFirestore(newNotif));
    } catch (e) {
      console.warn('Firestore notif save error:', e);
    }

    return {
      success: true,
      message: 'Tin đăng của bạn đã được gửi và đang chờ Super Admin kiểm duyệt (thường mất 2-5 phút).',
      accountId: newId
    };
  };

  // Update Account Status (Approve / Reject)
  const updateAccountStatus = async (accountId: string, status: AccountStatus, rejectionReason?: string) => {
    const reasonText = rejectionReason ? rejectionReason.trim() : '';

    setAccounts(prev =>
      prev.map(a =>
        a.id === accountId
          ? {
              ...a,
              status,
              rejectionReason: status === 'rejected' ? reasonText : undefined
            }
          : a
      )
    );

    const targetAcc = accounts.find(a => a.id === accountId);
    try {
      if (targetAcc) {
        const payload = cleanForFirestore({
          ...targetAcc,
          status,
          rejectionReason: status === 'rejected' ? reasonText : null
        });
        await setDoc(doc(db, 'accounts', accountId), payload, { merge: true });
      } else {
        const payload = cleanForFirestore({
          status,
          rejectionReason: status === 'rejected' ? reasonText : null
        });
        await setDoc(doc(db, 'accounts', accountId), payload, { merge: true });
      }
    } catch (e) {
      console.error('Firestore update status error:', e);
    }

    if (targetAcc) {
      const notif: AppNotification = {
        id: `notif_${Date.now()}`,
        userId: targetAcc.sellerId,
        title: status === 'approved' ? 'Acc của bạn đã được DUYỆT' : 'Acc bị TỪ CHỐI duyệt',
        message:
          status === 'approved'
            ? `Tài khoản #${targetAcc.code} đã được hiển thị công khai trên sàn LQMarket!`
            : `Tài khoản #${targetAcc.code} bị từ chối. Lý do: ${reasonText || 'Thông tin chưa chính xác'}`,
        type: 'account',
        read: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [notif, ...prev]);
      try {
        await setDoc(doc(db, 'notifications', notif.id), cleanForFirestore(notif));
      } catch (e) {
        console.warn('Firestore notif save error:', e);
      }
    }
  };

  const deleteAccount = async (accountId: string) => {
    setAccounts(prev => prev.filter(a => a.id !== accountId));
    try {
      await deleteDoc(doc(db, 'accounts', accountId));
    } catch (e) {
      console.warn('Firestore delete account fallback:', e);
    }
  };

  // Escrow Order Flow
  const createOrder = (accountId: string): { success: boolean; orderId?: string; message: string } => {
    const acc = accounts.find(a => a.id === accountId);
    if (!acc) return { success: false, message: 'Không tìm thấy tài khoản!' };
    if (acc.status === 'sold') return { success: false, message: 'Tài khoản này đã có người mua!' };

    const totalCost = acc.price;
    if (currentUser.balance < totalCost) {
      return {
        success: false,
        message: `Số dư ví không đủ (${currentUser.balance.toLocaleString('vi-VN')}đ < ${totalCost.toLocaleString('vi-VN')}đ). Vui lòng nạp thêm tiền qua VietQR / MoMo!`
      };
    }

    // 1. Deduct buyer balance
    setAllUsers(prev =>
      prev.map(u => (u.id === currentUser.id ? { ...u, balance: u.balance - totalCost } : u))
    );

    // 2. Mark account sold
    setAccounts(prev =>
      prev.map(a => (a.id === accountId ? { ...a, status: 'sold' as AccountStatus } : a))
    );

    // 3. Create Escrow Order
    const orderId = `ord_${Date.now()}`;
    const orderCodeNum = Math.floor(10000 + Math.random() * 90000);
    const newOrder: OrderItem = {
      id: orderId,
      orderCode: `#ORD${orderCodeNum}`,
      accountId: acc.id,
      accountCode: acc.code,
      accountTitle: acc.title,
      accountPrice: acc.price,
      fee: 0,
      totalAmount: totalCost,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      sellerId: acc.sellerId,
      sellerName: acc.sellerName,
      status: 'account_delivered', // Automatic instant delivery
      credentialsDelivered: acc.credentials,
      createdAt: new Date().toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);

    // 4. Create Wallet Transaction for Buyer
    const buyerTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId: currentUser.id,
      type: 'purchase',
      amount: -totalCost,
      status: 'success',
      note: `Mua acc #${acc.code} (Hệ thống Escrow trung gian đang giữ tiền)`,
      createdAt: new Date().toISOString()
    };
    setTransactions(prev => [buyerTx, ...prev]);

    // 5. Update Seller Pending Balance
    setAllUsers(prev =>
      prev.map(u => (u.id === acc.sellerId ? { ...u, pendingBalance: u.pendingBalance + acc.price } : u))
    );

    // Sync to Firestore
    try {
      setDoc(doc(db, 'orders', orderId), cleanForFirestore(newOrder));
      setDoc(doc(db, 'transactions', buyerTx.id), cleanForFirestore(buyerTx));
      updateDoc(doc(db, 'accounts', acc.id), { status: 'sold' });
      updateDoc(doc(db, 'users', currentUser.id), { balance: currentUser.balance - totalCost });
      const seller = allUsers.find(u => u.id === acc.sellerId);
      if (seller) {
        updateDoc(doc(db, 'users', acc.sellerId), { pendingBalance: seller.pendingBalance + acc.price });
      }
    } catch (e) {
      console.warn('Firestore order sync fallback:', e);
    }

    // 6. Notify Buyer & Seller
    const buyerNotif: AppNotification = {
      id: `notif_${Date.now()}_1`,
      userId: currentUser.id,
      title: 'Mua acc thành công & Đã nhận mật khẩu',
      message: `Đơn hàng ${newOrder.orderCode} đã giao mật khẩu tự động. Hãy vào mục [Đơn Hàng] kiểm tra và đổi pass Garena!`,
      type: 'order',
      read: false,
      createdAt: new Date().toISOString()
    };

    const sellerNotif: AppNotification = {
      id: `notif_${Date.now()}_2`,
      userId: acc.sellerId,
      title: 'Bạn có đơn hàng mới đã bán',
      message: `Khách hàng ${currentUser.name} vừa mua acc #${acc.code}. Tiền (${acc.price.toLocaleString('vi-VN')}đ) đang được tạm giữ an toàn trong ví Escrow.`,
      type: 'order',
      read: false,
      createdAt: new Date().toISOString()
    };

    setNotifications(prev => [buyerNotif, sellerNotif, ...prev]);

    return {
      success: true,
      orderId,
      message: 'Đặt mua thành công! Thông tin tài khoản & mật khẩu đã được cấp ngay lập tức.'
    };
  };

  const confirmAccountDelivery = (orderId: string) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: 'account_delivered' } : o))
    );
    try {
      updateDoc(doc(db, 'orders', orderId), { status: 'account_delivered' });
    } catch (e) {
      console.warn('Firestore delivery confirm fallback:', e);
    }
  };

  // Buyer confirms they received account ok -> Release Escrow money to Seller
  const confirmOrderReceived = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const completedAt = new Date().toISOString();
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId ? { ...o, status: 'completed', completedAt } : o
      )
    );

    // Transfer money from pending to real balance for seller
    const payoutAmount = order.accountPrice;
    setAllUsers(prev =>
      prev.map(u =>
        u.id === order.sellerId
          ? {
              ...u,
              balance: u.balance + payoutAmount,
              pendingBalance: Math.max(0, u.pendingBalance - payoutAmount),
              completedSales: u.completedSales + 1
            }
          : u
      )
    );

    // Create payout transaction for seller
    const sellerTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId: order.sellerId,
      type: 'seller_payout',
      amount: payoutAmount,
      status: 'success',
      note: `Nhận tiền bán acc ${order.accountCode} (Đơn hàng ${order.orderCode} hoàn tất)`,
      createdAt: new Date().toISOString()
    };
    setTransactions(prev => [sellerTx, ...prev]);

    try {
      updateDoc(doc(db, 'orders', orderId), { status: 'completed', completedAt });
      setDoc(doc(db, 'transactions', sellerTx.id), sellerTx);
      const seller = allUsers.find(u => u.id === order.sellerId);
      if (seller) {
        updateDoc(doc(db, 'users', order.sellerId), {
          balance: seller.balance + payoutAmount,
          pendingBalance: Math.max(0, seller.pendingBalance - payoutAmount),
          completedSales: seller.completedSales + 1
        });
      }
    } catch (e) {
      console.warn('Firestore order complete fallback:', e);
    }

    // Send notification
    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: order.sellerId,
      title: 'Đơn hàng hoàn tất - Tiền đã vào ví',
      message: `Người mua đã xác nhận nhận acc ${order.accountCode}. Bạn nhận được +${payoutAmount.toLocaleString('vi-VN')}đ vào số dư khả dụng!`,
      type: 'wallet',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // Buyer files dispute
  const disputeOrder = (orderId: string, reason: string) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: 'disputed', disputeReason: reason } : o))
    );

    try {
      updateDoc(doc(db, 'orders', orderId), { status: 'disputed', disputeReason: reason });
    } catch (e) {
      console.warn('Firestore dispute fallback:', e);
    }

    const order = orders.find(o => o.id === orderId);
    if (order) {
      // Notify Admin & Seller
      const adminNotif: AppNotification = {
        id: `notif_${Date.now()}_admin`,
        userId: 'user_admin_1',
        title: '⚠️ Khiếu nại đơn hàng cần xử lý',
        message: `Người mua ${order.buyerName} vừa gửi khiếu nại cho đơn hàng ${order.orderCode}. Lý do: ${reason}`,
        type: 'order',
        read: false,
        createdAt: new Date().toISOString()
      };

      const sellerNotif: AppNotification = {
        id: `notif_${Date.now()}_seller`,
        userId: order.sellerId,
        title: '⚠️ Đơn hàng có khiếu nại',
        message: `Người mua đang khiếu nại đơn hàng ${order.orderCode}. Admin sẽ vào can thiệp và kiểm tra thông tin.`,
        type: 'order',
        read: false,
        createdAt: new Date().toISOString()
      };

      setNotifications(prev => [adminNotif, sellerNotif, ...prev]);
    }
  };

  // Admin resolves dispute
  const adminResolveDispute = (orderId: string, resolution: 'refund_buyer' | 'payout_seller') => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (resolution === 'refund_buyer') {
      const completedAt = new Date().toISOString();
      const updatedReason = `${order.disputeReason || ''} -> (Admin đã xử lý HOÀN TIỀN cho người mua)`;

      // Refund to Buyer
      setOrders(prev =>
        prev.map(o =>
          o.id === orderId
            ? {
                ...o,
                status: 'refunded',
                completedAt,
                disputeReason: updatedReason
              }
            : o
        )
      );

      // Add balance back to buyer
      setAllUsers(prev =>
        prev.map(u => (u.id === order.buyerId ? { ...u, balance: u.balance + order.totalAmount } : u))
      );

      // Reduce pending balance from seller
      setAllUsers(prev =>
        prev.map(u =>
          u.id === order.sellerId
            ? { ...u, pendingBalance: Math.max(0, u.pendingBalance - order.accountPrice) }
            : u
        )
      );

      // Create refund Tx
      const refundTx: WalletTransaction = {
        id: `tx_${Date.now()}`,
        userId: order.buyerId,
        type: 'refund',
        amount: order.totalAmount,
        status: 'success',
        note: `Hoàn tiền khiếu nại đơn hàng ${order.orderCode}`,
        createdAt: new Date().toISOString()
      };
      setTransactions(prev => [refundTx, ...prev]);

      try {
        updateDoc(doc(db, 'orders', orderId), { status: 'refunded', completedAt, disputeReason: updatedReason });
        setDoc(doc(db, 'transactions', refundTx.id), refundTx);
        const buyer = allUsers.find(u => u.id === order.buyerId);
        if (buyer) {
          updateDoc(doc(db, 'users', order.buyerId), { balance: buyer.balance + order.totalAmount });
        }
        const seller = allUsers.find(u => u.id === order.sellerId);
        if (seller) {
          updateDoc(doc(db, 'users', order.sellerId), { pendingBalance: Math.max(0, seller.pendingBalance - order.accountPrice) });
        }
      } catch (e) {
        console.warn('Firestore refund fallback:', e);
      }
    } else {
      // Payout to Seller
      confirmOrderReceived(orderId);
    }
  };

  const submitReview = (orderId: string, rating: number, comment: string) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, ratingGiven: rating, reviewComment: comment } : o))
    );
    try {
      updateDoc(doc(db, 'orders', orderId), { ratingGiven: rating, reviewComment: comment });
    } catch (e) {
      console.warn('Firestore review fallback:', e);
    }
  };

  // Wallet & Payment Gateway API
  const depositBalance = (amount: number, method: string, note: string = 'Nạp tiền vào ví LQMarket Pay') => {
    setAllUsers(prev =>
      prev.map(u => (u.id === currentUser.id ? { ...u, balance: u.balance + amount } : u))
    );

    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId: currentUser.id,
      type: 'deposit',
      amount: amount,
      status: 'success',
      note: `${note} (${method.toUpperCase()})`,
      createdAt: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);

    try {
      setDoc(doc(db, 'transactions', newTx.id), newTx);
      updateDoc(doc(db, 'users', currentUser.id), { balance: currentUser.balance + amount });
    } catch (e) {
      console.warn('Firestore deposit fallback:', e);
    }

    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: currentUser.id,
      title: 'Nạp tiền thành công',
      message: `Ví của bạn vừa được cộng +${amount.toLocaleString('vi-VN')}đ qua ${method.toUpperCase()}.`,
      type: 'wallet',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const depositFunds = (amount: number, method: string) => {
    depositBalance(amount, method);
  };

  const withdrawBalance = (
    amount: number,
    bankInfo: string,
    bankDetails?: {
      bankName: string;
      bankCode?: string;
      bankAccount: string;
      bankAccountName: string;
    }
  ): boolean => {
    if (currentUser.balance < amount) return false;

    setAllUsers(prev =>
      prev.map(u => (u.id === currentUser.id ? { ...u, balance: u.balance - amount } : u))
    );

    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      type: 'withdraw',
      amount: -amount,
      status: 'pending', // Pending Admin Payout via VietQR Napas247
      note: `Yêu cầu rút tiền về ${bankInfo}`,
      bankName: bankDetails?.bankName || bankInfo.split(' - ')[0] || 'Ngân hàng',
      bankCode: bankDetails?.bankCode || '970422',
      bankAccount: bankDetails?.bankAccount || '',
      bankAccountName: bankDetails?.bankAccountName || currentUser.name,
      createdAt: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);

    try {
      setDoc(doc(db, 'transactions', newTx.id), newTx);
      updateDoc(doc(db, 'users', currentUser.id), { balance: currentUser.balance - amount });
    } catch (e) {
      console.warn('Firestore withdraw fallback:', e);
    }

    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: currentUser.id,
      title: 'Đã gửi yêu cầu rút tiền',
      message: `Đã tạo lệnh rút -${amount.toLocaleString('vi-VN')}đ về tài khoản ngân hàng: ${bankInfo}. Ban quản trị sẽ chuyển khoản giải ngân nhanh 24/7 trong 5-15 phút.`,
      type: 'wallet',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [notif, ...prev]);

    return true;
  };

  const withdrawFunds = (amount: number, bankInfo: string) => {
    const success = withdrawBalance(amount, bankInfo);
    return {
      success,
      message: success ? 'Yêu cầu rút tiền đã được gửi!' : 'Số dư khả dụng không đủ!'
    };
  };

  // Admin Payout Management
  const adminApproveWithdrawal = async (txId: string, refNote?: string): Promise<{ success: boolean; message: string }> => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return { success: false, message: 'Không tìm thấy lệnh rút tiền' };

    const processedAt = new Date().toISOString();
    setTransactions(prev =>
      prev.map(t =>
        t.id === txId
          ? {
              ...t,
              status: 'success',
              processedAt,
              note: refNote ? `${t.note} (Đã chuyển khoản: ${refNote})` : t.note
            }
          : t
      )
    );

    try {
      updateDoc(doc(db, 'transactions', txId), {
        status: 'success',
        processedAt,
        note: refNote ? `${tx.note} (Đã chuyển: ${refNote})` : tx.note
      });
    } catch (e) {
      console.warn('Firestore approve withdrawal error:', e);
    }

    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: tx.userId,
      title: '🎉 Giải ngân thành công về ngân hàng',
      message: `Admin đã hoàn tất chuyển khoản ${Math.abs(tx.amount).toLocaleString('vi-VN')}đ về tài khoản ${tx.bankAccount || ''} (${tx.bankName || ''}). Vui lòng kiểm tra tài khoản ngân hàng của bạn!`,
      type: 'wallet',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [notif, ...prev]);

    return { success: true, message: 'Đã xác nhận giải ngân thành công!' };
  };

  const adminRejectWithdrawal = async (txId: string, reason: string): Promise<{ success: boolean; message: string }> => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return { success: false, message: 'Không tìm thấy giao dịch' };

    const refundAmount = Math.abs(tx.amount);
    // Refund money to user's balance
    setAllUsers(prev =>
      prev.map(u => (u.id === tx.userId ? { ...u, balance: u.balance + refundAmount } : u))
    );

    setTransactions(prev =>
      prev.map(t => (t.id === txId ? { ...t, status: 'failed', rejectReason: reason } : t))
    );

    try {
      updateDoc(doc(db, 'transactions', txId), {
        status: 'failed',
        rejectReason: reason
      });
      const user = allUsers.find(u => u.id === tx.userId);
      if (user) {
        updateDoc(doc(db, 'users', tx.userId), { balance: user.balance + refundAmount });
      }
    } catch (e) {
      console.warn('Firestore reject withdrawal error:', e);
    }

    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: tx.userId,
      title: 'Lệnh rút tiền bị từ chối & Đã hoàn ví',
      message: `Yêu cầu rút ${refundAmount.toLocaleString('vi-VN')}đ bị từ chối: "${reason}". Số tiền đã được hoàn lại đầy đủ vào ví LQMarket của bạn.`,
      type: 'wallet',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [notif, ...prev]);

    return { success: true, message: 'Đã từ chối lệnh rút tiền và hoàn lại số dư vào ví người bán.' };
  };

  const adminDisburseEarly = async (orderId: string): Promise<{ success: boolean; message: string }> => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, message: 'Không tìm thấy đơn hàng' };
    if (order.status === 'completed') return { success: false, message: 'Đơn hàng đã hoàn tất trước đó' };

    confirmOrderReceived(orderId);
    return {
      success: true,
      message: `Đã giải ngân sớm ${order.accountPrice.toLocaleString('vi-VN')}đ cho người bán ${order.sellerName}!`
    };
  };

  // Chat
  const sendMessage = (recipientId: string, text: string, orderId?: string) => {
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      orderId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      recipientId,
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, newMsg]);

    try {
      setDoc(doc(db, 'messages', newMsg.id), newMsg);
    } catch (e) {
      console.warn('Firestore message fallback:', e);
    }
  };

  const sendDirectMessage = (msgData: {
    senderId: string;
    senderName: string;
    senderAvatar: string;
    recipientId: string;
    text: string;
    orderId?: string;
  }) => {
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      orderId: msgData.orderId,
      senderId: msgData.senderId,
      senderName: msgData.senderName,
      senderAvatar: msgData.senderAvatar,
      recipientId: msgData.recipientId,
      text: msgData.text.trim(),
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, newMsg]);

    try {
      setDoc(doc(db, 'messages', newMsg.id), newMsg);
    } catch (e) {
      console.warn('Firestore direct message fallback:', e);
    }
  };

  // Notifications
  const markNotificationAsRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (e) {
      console.warn('Firestore notif mark read error:', e);
    }
  };

  const clearAllNotifications = async () => {
    setNotifications(prev =>
      prev.map(n => (n.userId === currentUser.id ? { ...n, read: true } : n))
    );
    try {
      const userNotifs = notifications.filter(n => n.userId === currentUser.id);
      for (const n of userNotifs) {
        await updateDoc(doc(db, 'notifications', n.id), { read: true });
      }
    } catch (e) {
      console.warn('Firestore clear all notifs error:', e);
    }
  };

  // Admin User Management Operations
  const adminCreateUser = async (
    userData: Omit<UserProfile, 'id' | 'createdAt'>
  ): Promise<{ success: boolean; message: string; userId?: string }> => {
    const newUserId = `user_${Date.now()}`;
    const newUser: UserProfile = {
      ...userData,
      id: newUserId,
      createdAt: new Date().toISOString()
    };

    setAllUsers(prev => [newUser, ...prev]);

    try {
      await setDoc(doc(db, 'users', newUserId), newUser);
      return { success: true, message: `Đã tạo tài khoản thành viên "${newUser.name}" thành công!`, userId: newUserId };
    } catch (e) {
      console.error('Firestore admin create user error:', e);
      return { success: false, message: 'Lỗi khi lưu người dùng lên Firestore!' };
    }
  };

  const adminUpdateUser = async (
    userId: string,
    data: Partial<UserProfile>
  ): Promise<{ success: boolean; message: string }> => {
    setAllUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, ...data } : u))
    );

    try {
      await setDoc(doc(db, 'users', userId), data, { merge: true });
      return { success: true, message: 'Đã cập nhật thông tin thành viên thành công!' };
    } catch (e) {
      console.error('Firestore admin update user error:', e);
      return { success: false, message: 'Lỗi khi cập nhật thông tin trên Firestore!' };
    }
  };

  const adminDeleteUser = async (
    userId: string
  ): Promise<{ success: boolean; message: string }> => {
    if (userId === currentUser.id) {
      return { success: false, message: 'Không thể xóa tài khoản Admin đang đăng nhập!' };
    }

    setAllUsers(prev => prev.filter(u => u.id !== userId));

    try {
      await deleteDoc(doc(db, 'users', userId));
      return { success: true, message: 'Đã xóa tài khoản người dùng khỏi hệ thống!' };
    } catch (e) {
      console.error('Firestore admin delete user error:', e);
      return { success: false, message: 'Lỗi khi xóa người dùng trên Firestore!' };
    }
  };

  const adminAdjustUserBalance = async (
    userId: string,
    amount: number,
    note: string
  ): Promise<{ success: boolean; message: string }> => {
    const targetUser = allUsers.find(u => u.id === userId);
    if (!targetUser) return { success: false, message: 'Không tìm thấy người dùng!' };

    const newBalance = Math.max(0, targetUser.balance + amount);
    setAllUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, balance: newBalance } : u))
    );

    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId: userId,
      type: amount >= 0 ? 'deposit' : 'withdraw',
      amount: amount,
      status: 'success',
      note: `Admin điều chỉnh số dư: ${note || (amount >= 0 ? 'Cộng tiền bởi Admin' : 'Khấu trừ bởi Admin')}`,
      createdAt: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);

    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: userId,
      title: amount >= 0 ? 'Ví được cộng tiền từ Admin' : 'Ví bị khấu trừ tiền từ Admin',
      message: `Quản trị viên đã ${amount >= 0 ? 'cộng' : 'khấu trừ'} ${Math.abs(amount).toLocaleString('vi-VN')}đ vào số dư ví của bạn. Ghi chú: ${note || 'Điều chỉnh thủ công'}`,
      type: 'wallet',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [notif, ...prev]);

    try {
      await updateDoc(doc(db, 'users', userId), { balance: newBalance });
      await setDoc(doc(db, 'transactions', newTx.id), newTx);
      await setDoc(doc(db, 'notifications', notif.id), notif);
      return {
        success: true,
        message: `Đã điều chỉnh số dư thành công (${amount >= 0 ? '+' : ''}${amount.toLocaleString('vi-VN')}đ)!`
      };
    } catch (e) {
      console.error('Firestore admin adjust balance error:', e);
      return { success: false, message: 'Lỗi khi cập nhật số dư trên Firestore!' };
    }
  };

  // Reset to initial LocalStorage state
  const resetToDefaultData = () => {
    setAllUsers(INITIAL_USERS);
    setCurrentUserId('user_buyer_1');
    setIsLoggedIn(true);
    setAccounts(INITIAL_ACCOUNTS);
    setOrders(INITIAL_ORDERS);
    setTransactions(INITIAL_TRANSACTIONS);
    setWishlistIds([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  // Wipe All Firebase Firestore Cloud Database
  const clearAllFirebaseData = async (): Promise<{ success: boolean; message: string }> => {
    try {
      setCloudSyncStatus('syncing');
      const collectionsToWipe = ['accounts', 'orders', 'transactions', 'messages', 'users'];

      for (const colName of collectionsToWipe) {
        const snap = await getDocs(collection(db, colName));
        for (const d of snap.docs) {
          await deleteDoc(doc(db, colName, d.id));
        }
      }

      // Re-create the Super Admin user so admin can continue managing the system
      const adminUser = INITIAL_USERS[0];
      await setDoc(doc(db, 'users', adminUser.id), adminUser);

      // Reset local state to empty
      setAccounts([]);
      setOrders([]);
      setTransactions([]);
      setChatMessages([]);
      setWishlistIds([]);
      setAllUsers([adminUser]);
      setCurrentUserId(adminUser.id);
      setIsLoggedIn(true);
      localStorage.removeItem(LOCAL_STORAGE_KEY);

      setCloudSyncStatus('synced');
      return {
        success: true,
        message: 'Đã xoá sạch toàn bộ dữ liệu trên Firebase Firestore thành công! Đã giữ lại tài khoản Super Admin.'
      };
    } catch (err) {
      console.error('Error clearing Firebase database:', err);
      setCloudSyncStatus('error');
      return {
        success: false,
        message: 'Có lỗi xảy ra khi xoá dữ liệu trên Firebase!'
      };
    }
  };

  // Seed Sample Demo Data into Firebase
  const seedSampleData = async (): Promise<{ success: boolean; message: string }> => {
    try {
      setCloudSyncStatus('syncing');
      for (const acc of INITIAL_ACCOUNTS) {
        await setDoc(doc(db, 'accounts', acc.id), cleanForFirestore(acc));
      }
      for (const u of INITIAL_USERS) {
        await setDoc(doc(db, 'users', u.id), cleanForFirestore(u));
      }
      for (const ord of INITIAL_ORDERS) {
        await setDoc(doc(db, 'orders', ord.id), cleanForFirestore(ord));
      }
      for (const tx of INITIAL_TRANSACTIONS) {
        await setDoc(doc(db, 'transactions', tx.id), cleanForFirestore(tx));
      }

      setAccounts(INITIAL_ACCOUNTS);
      setAllUsers(INITIAL_USERS);
      setOrders(INITIAL_ORDERS);
      setTransactions(INITIAL_TRANSACTIONS);
      setCloudSyncStatus('synced');

      return {
        success: true,
        message: 'Đã nạp toàn bộ danh mục tài khoản mẫu và người dùng demo vào Firebase thành công!'
      };
    } catch (err) {
      console.error('Error seeding Firebase database:', err);
      return {
        success: false,
        message: 'Lỗi khi nạp dữ liệu mẫu vào Firebase!'
      };
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        isLoggedIn,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openLoginModal,
        openRegisterModal,
        loginUser,
        registerUser,
        logoutUser,
        quickSwitchUser,
        updateCurrentUserProfile,
        updateUserProfile,
        isProfileModalOpen,
        setIsProfileModalOpen,
        openProfileModal,
        cloudSyncStatus,

        currentView,
        setCurrentView,
        selectedAccountId,
        setSelectedAccountId,
        selectedSellerId,
        setSelectedSellerId,
        openSellerProfile,
        isCheckoutOpen,
        setIsCheckoutOpen,
        checkoutAccountId,
        setCheckoutAccountId,
        startCheckout,
        isWalletOpen: isWalletModalOpen,
        setIsWalletOpen: setIsWalletModalOpen,
        isWalletModalOpen,
        setIsWalletModalOpen,
        isChatOpen,
        setIsChatOpen,
        chatRecipient,
        activeChatPartner: chatRecipient,
        openChatWith,
        closeChat,

        accounts,
        filterOptions,
        setFilterOptions,
        resetFilters,
        createAccount,
        updateAccountStatus,
        deleteAccount,

        wishlistIds,
        toggleWishlist,
        isWishlisted,

        orders,
        createOrder,
        confirmAccountDelivery,
        confirmOrderReceived,
        disputeOrder,
        adminResolveDispute,
        submitReview,

        transactions,
        depositBalance,
        depositFunds,
        withdrawBalance,
        withdrawFunds,

        chatMessages,
        sendMessage,
        sendDirectMessage,

        notifications,
        markNotificationAsRead,
        clearAllNotifications,

        adminCreateUser,
        adminUpdateUser,
        adminDeleteUser,
        adminAdjustUserBalance,
        adminApproveWithdrawal,
        adminRejectWithdrawal,
        adminDisburseEarly,

        resetToDefaultData,
        clearAllFirebaseData,
        seedSampleData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
