import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  AccountItem,
  UserProfile,
  OrderItem,
  ChatMessage,
  AppNotification,
  WalletTransaction,
  UserRole,
  FilterOptions,
  AccountStatus,
  MysteryBoxTierConfig,
  MysteryBoxRewardItem,
  MysteryBoxHistoryItem,
  UserInventoryItem
} from '../types';
import { INITIAL_USERS, INITIAL_ACCOUNTS, INITIAL_ORDERS, INITIAL_TRANSACTIONS } from '../data/mockData';
import {
  DEFAULT_MYSTERY_BOX_TIERS,
  DEFAULT_MYSTERY_BOX_REWARDS,
  DEFAULT_MYSTERY_BOX_HISTORY
} from '../data/mysteryBoxData';
import {
  registerUser as apiRegisterUser,
  loginUser as apiLoginUser,
  logoutUser as apiLogoutUser,
  getCurrentUserFromBackend
} from '../lib/authService';
import api, { getAuthToken, setAuthToken } from '../lib/apiClient';

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
  currentView: 'home' | 'accounts' | 'mystery_box' | 'sell' | 'orders' | 'wishlist' | 'admin' | 'guide';
  setCurrentView: (view: 'home' | 'accounts' | 'mystery_box' | 'sell' | 'orders' | 'wishlist' | 'admin' | 'guide') => void;
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
  createOrder: (
    accountId: string,
    voucherOptions?: { code: string; discount: number; inventoryItemId?: string }
  ) => { success: boolean; orderId?: string; message: string };
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

  // Mystery Box (Túi Mù May Mắn)
  mysteryBoxes: MysteryBoxTierConfig[];
  mysteryRewards: MysteryBoxRewardItem[];
  mysteryHistory: MysteryBoxHistoryItem[];
  userInventory: UserInventoryItem[];
  userFreeTurns: Record<string, number>;
  isMysteryBoxEventActive: boolean;
  selectedBoxTierForUnboxing: string | null;
  setSelectedBoxTierForUnboxing: (tierId: string | null) => void;
  openMysteryBox: (boxTierId: string) => Promise<{
    success: boolean;
    reward?: MysteryBoxRewardItem;
    message: string;
    isFreeTurn?: boolean;
  }>;
  useUserInventoryItem: (inventoryItemId: string) => { success: boolean; message: string };
  adminToggleMysteryBoxEvent: (active: boolean) => Promise<{ success: boolean; message: string }>;
  adminToggleTierActive: (tierId: string, isActive: boolean) => Promise<{ success: boolean; message: string }>;
  adminAddMysteryReward: (reward: Omit<MysteryBoxRewardItem, 'id'>) => Promise<{ success: boolean; message: string }>;
  adminUpdateMysteryReward: (id: string, updates: Partial<MysteryBoxRewardItem>) => Promise<{ success: boolean; message: string }>;
  adminDeleteMysteryReward: (id: string) => Promise<{ success: boolean; message: string }>;
  adminUpdateBoxTier: (tierId: string, updates: Partial<MysteryBoxTierConfig>) => Promise<{ success: boolean; message: string }>;
  adminImportAccountToMysteryBox: (accountId: string, targetTierId: string) => Promise<{ success: boolean; message: string }>;
  adminResetMysteryBoxes: () => Promise<{ success: boolean; message: string }>;

  // Admin User Management
  adminCreateUser: (userData: Omit<UserProfile, 'id' | 'createdAt'>) => Promise<{ success: boolean; message: string; userId?: string }>;
  adminUpdateUser: (userId: string, data: Partial<UserProfile>) => Promise<{ success: boolean; message: string }>;
  adminDeleteUser: (userId: string) => Promise<{ success: boolean; message: string }>;
  adminAdjustUserBalance: (userId: string, amount: number, note: string) => Promise<{ success: boolean; message: string }>;

  // System & Database Management
  totalSystemCompletedSales: number;
  isAutoApproveAccounts: boolean;
  adminToggleAutoApproveAccounts: (enabled: boolean) => Promise<{ success: boolean; message: string }>;
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
  createdAt: new Date().toISOString().split('T')[0],
  bio: '',
  wishlistIds: []
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Users State
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    try {
      const savedUser = typeof window !== 'undefined' ? localStorage.getItem('lqmarket_saved_user_profile') : null;
      const parsedSaved = savedUser ? [JSON.parse(savedUser)] : [];
      const localUsers = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('lqmarket_local_users') || '[]') : [];
      const map = new Map<string, UserProfile>();
      INITIAL_USERS.forEach(u => map.set(u.id, u));
      localUsers.forEach((u: UserProfile) => { if (u?.id) map.set(u.id, u); });
      parsedSaved.forEach((u: UserProfile) => { if (u?.id) map.set(u.id, u); });
      return Array.from(map.values());
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      return (typeof window !== 'undefined' && localStorage.getItem('lqmarket_current_user_id')) || '';
    } catch {
      return '';
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return Boolean(typeof window !== 'undefined' && localStorage.getItem('lqmarket_current_user_id'));
    } catch {
      return false;
    }
  });

  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');

  // Core App Collections
  const [accounts, setAccounts] = useState<AccountItem[]>(INITIAL_ACCOUNTS);
  const [orders, setOrders] = useState<OrderItem[]>(INITIAL_ORDERS);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(INITIAL_TRANSACTIONS);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Mystery Box (Túi Mù May Mắn) States
  const [mysteryBoxes, setMysteryBoxes] = useState<MysteryBoxTierConfig[]>(DEFAULT_MYSTERY_BOX_TIERS);
  const [mysteryRewards, setMysteryRewards] = useState<MysteryBoxRewardItem[]>(DEFAULT_MYSTERY_BOX_REWARDS);
  const [mysteryHistory, setMysteryHistory] = useState<MysteryBoxHistoryItem[]>(DEFAULT_MYSTERY_BOX_HISTORY);
  const [userInventory, setUserInventory] = useState<UserInventoryItem[]>([]);
  const [userFreeTurns, setUserFreeTurns] = useState<Record<string, number>>({});
  const [isMysteryBoxEventActive, setIsMysteryBoxEventActive] = useState<boolean>(true);
  const [selectedBoxTierForUnboxing, setSelectedBoxTierForUnboxing] = useState<string | null>(null);

  // View States
  const [currentView, setCurrentView] = useState<'home' | 'accounts' | 'mystery_box' | 'sell' | 'orders' | 'wishlist' | 'admin' | 'guide'>('home');
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

  // System Stats & Config State
  const [totalSystemCompletedSales, setTotalSystemCompletedSales] = useState<number>(0);
  const [isAutoApproveAccounts, setIsAutoApproveAccounts] = useState<boolean>(false);

  // ----------------------------------------------------
  // MongoDB Master Data Fetching Function
  // ----------------------------------------------------
  const fetchAllMongoData = useCallback(async () => {
    try {
      setCloudSyncStatus('syncing');

      // 1. Fetch Accounts from MongoDB
      const accRes = await api.get('/api/accounts').catch(() => null);
      if (accRes && accRes.success && Array.isArray(accRes.data || accRes.accounts)) {
        const list = accRes.data || accRes.accounts;
        if (list.length > 0) {
          setAccounts(list);
        }
      }

      // 1b. Fetch Public System Stats (Total completed transactions & auto-approve setting from Database)
      const statsRes = await api.get('/api/accounts/public-stats').catch(() => null);
      if (statsRes && statsRes.success) {
        if (typeof statsRes.totalCompletedTransactions === 'number') {
          setTotalSystemCompletedSales(statsRes.totalCompletedTransactions);
        }
        if (typeof statsRes.isAutoApprove === 'boolean') {
          setIsAutoApproveAccounts(statsRes.isAutoApprove);
        }
      }

      // 2. Fetch Mystery Box Settings (Event Active Status) from MongoDB
      const settingsRes = await api.get('/api/mystery-boxes/settings').catch(() => null);
      if (settingsRes && settingsRes.success) {
        const active = settingsRes.isMysteryBoxEventActive ?? settingsRes.isEventActive ?? settingsRes.isActive;
        if (typeof active === 'boolean') {
          setIsMysteryBoxEventActive(active);
        }
      }

      // 3. Fetch Mystery Box Tiers from MongoDB
      const boxRes = await api.get('/api/mystery-boxes').catch(() => null);
      if (boxRes && boxRes.success && Array.isArray(boxRes.data || boxRes.boxes)) {
        const boxList = boxRes.data || boxRes.boxes;
        if (boxList.length > 0) {
          setMysteryBoxes(boxList);
        }
      }

      // 4. Fetch Mystery Rewards from MongoDB
      const rewRes = await api.get('/api/mystery-boxes/rewards/all').catch(() => null);
      if (rewRes && rewRes.success && Array.isArray(rewRes.data || rewRes.rewards)) {
        const rewList = rewRes.data || rewRes.rewards;
        if (rewList.length > 0) {
          setMysteryRewards(rewList);
        }
      }

      // 5. Fetch Mystery History from MongoDB
      const histRes = await api.get('/api/mystery-boxes/public/history').catch(() => null);
      if (histRes && histRes.success && Array.isArray(histRes.data || histRes.history)) {
        const histList = histRes.data || histRes.history;
        if (histList.length > 0) {
          setMysteryHistory(histList);
        }
      }

      // Authenticated queries if token exists
      const token = getAuthToken();
      if (token) {
        // Fetch Current User
        const meRes = await api.get('/api/auth/me').catch(() => null);
        if (meRes && meRes.success && meRes.user) {
          const userObj = meRes.user;
          setCurrentUserId(userObj.id);
          setIsLoggedIn(true);
          setAllUsers(prev => {
            const filtered = prev.filter(u => u.id !== userObj.id && u.email !== userObj.email);
            return [userObj, ...filtered];
          });
          try {
            localStorage.setItem('lqmarket_current_user_id', userObj.id);
            localStorage.setItem('lqmarket_saved_user_profile', JSON.stringify(userObj));
          } catch {}

          // If user is admin, fetch ALL users from MongoDB
          if (userObj.role === 'admin') {
            const adminUsersRes = await api.get('/api/admin/users').catch(() => null);
            if (adminUsersRes && adminUsersRes.success && Array.isArray(adminUsersRes.data || adminUsersRes.users)) {
              const uList = adminUsersRes.data || adminUsersRes.users;
              setAllUsers(uList);
            }
          }
        }

        // Fetch User Orders
        const ordRes = await api.get('/api/orders').catch(() => null);
        if (ordRes && ordRes.success && Array.isArray(ordRes.data || ordRes.orders)) {
          setOrders(ordRes.data || ordRes.orders);
        }

        // Fetch Wallet Transactions
        const txRes = await api.get('/api/wallet/transactions').catch(() => null);
        if (txRes && txRes.success && Array.isArray(txRes.data || txRes.transactions)) {
          setTransactions(txRes.data || txRes.transactions);
        }

        // Fetch Notifications
        const notifRes = await api.get('/api/notifications').catch(() => null);
        if (notifRes && notifRes.success && Array.isArray(notifRes.data || notifRes.notifications)) {
          setNotifications(notifRes.data || notifRes.notifications);
        }

        // Fetch User Inventory
        const invRes = await api.get('/api/mystery-boxes/user/inventory').catch(() => null);
        if (invRes && invRes.success && Array.isArray(invRes.data || invRes.inventory || invRes.items)) {
          setUserInventory(invRes.data || invRes.inventory || invRes.items);
        }

        // Fetch Chat Messages from MongoDB
        const chatRes = await api.get('/api/conversations/messages').catch(() => null);
        if (chatRes && chatRes.success && Array.isArray(chatRes.data || chatRes.messages)) {
          const fetchedMsgs = chatRes.data || chatRes.messages;
          if (fetchedMsgs.length > 0) {
            setChatMessages(fetchedMsgs);
          }
        }

        // Fetch Favorites/Wishlist
        const favRes = await api.get('/api/favorites').catch(() => null);
        if (favRes && favRes.success && Array.isArray(favRes.data || favRes.favorites)) {
          const fList = favRes.data || favRes.favorites;
          setWishlistIds(fList.map((f: any) => (typeof f === 'string' ? f : f.accountId || f.id)));
        }
      }

      setCloudSyncStatus('synced');
    } catch (e) {
      console.warn('MongoDB initial data sync notice:', e);
      setCloudSyncStatus('offline');
    }
  }, []);

  // Initial load & periodic polling for multi-browser real-time synchronization
  useEffect(() => {
    fetchAllMongoData();

    const interval = setInterval(() => {
      const token = getAuthToken();
      if (token) {
        // Poll latest messages & notifications in background
        api.get('/api/conversations/messages')
          .then(res => {
            if (res && res.success && Array.isArray(res.data || res.messages)) {
              setChatMessages(res.data || res.messages);
            }
          })
          .catch(() => {});

        api.get('/api/notifications')
          .then(res => {
            if (res && res.success && Array.isArray(res.data || res.notifications)) {
              setNotifications(res.data || res.notifications);
            }
          })
          .catch(() => {});
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [fetchAllMongoData]);

  // Derive Current User
  const currentUser = useMemo(() => {
    if (!isLoggedIn || !currentUserId) return GUEST_USER;

    const matchInAll = allUsers.find(
      u => u && (u.id === currentUserId || (u.email && u.email.toLowerCase() === currentUserId.toLowerCase()))
    );
    if (matchInAll) return matchInAll;

    const matchInInit = INITIAL_USERS.find(
      u => u && (u.id === currentUserId || (u.email && u.email.toLowerCase() === currentUserId.toLowerCase()))
    );
    if (matchInInit) return matchInInit;

    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('lqmarket_saved_user_profile') : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.id === currentUserId || parsed.email?.toLowerCase() === currentUserId.toLowerCase())) {
          return parsed;
        }
      }
    } catch {}

    return GUEST_USER;
  }, [isLoggedIn, currentUserId, allUsers]);

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
    if (!password) {
      return { success: false, message: 'Vui lòng nhập mật khẩu đăng nhập!' };
    }
    const res = await apiLoginUser(identifier, password);
    if (res.success && res.user) {
      const loggedUser = res.user;
      setCurrentUserId(loggedUser.id);
      setIsLoggedIn(true);
      setAllUsers(prev => [loggedUser, ...prev.filter(u => u && u.id !== loggedUser.id)]);
      setIsAuthModalOpen(false);
      
      // Reload user data & admin lists if applicable
      fetchAllMongoData();
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!' };
  };

  const registerUser = async (
    name: string,
    usernameOrEmail: string,
    password: string,
    role: UserRole,
    phone: string = ''
  ): Promise<{ success: boolean; message: string }> => {
    const res = await apiRegisterUser(name, usernameOrEmail, password, role, phone);
    if (res.success && res.user) {
      const regUser = res.user;
      setCurrentUserId(regUser.id);
      setIsLoggedIn(true);
      setAllUsers(prev => [regUser, ...prev.filter(u => u && u.id !== regUser.id)]);
      setIsAuthModalOpen(false);
      fetchAllMongoData();
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || 'Đăng ký thất bại. Vui lòng thử lại!' };
  };

  const logoutUser = async () => {
    await apiLogoutUser();
    setIsLoggedIn(false);
    setCurrentUserId('');
    setCurrentView('home');
  };

  const quickSwitchUser = (_userId: string) => {};

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

    const updatedUser = { ...currentUser, ...data };
    try {
      localStorage.setItem('lqmarket_saved_user_profile', JSON.stringify(updatedUser));
    } catch {}

    try {
      await api.put('/api/auth/profile', data);
    } catch (e) {
      console.warn('MongoDB profile update notice:', e);
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
  const toggleWishlist = async (accountId: string) => {
    if (!isLoggedIn || !currentUser.id) {
      openLoginModal();
      return;
    }
    const exists = wishlistIds.includes(accountId);
    const updated = exists ? wishlistIds.filter(id => id !== accountId) : [...wishlistIds, accountId];
    setWishlistIds(updated);

    setAccounts(accs =>
      accs.map(a =>
        a.id === accountId ? { ...a, likes: Math.max(0, (a.likes || 0) + (exists ? -1 : 1)) } : a
      )
    );

    try {
      await api.post(`/api/favorites/${accountId}`, {});
    } catch (e) {
      console.warn('MongoDB wishlist sync notice:', e);
    }
  };

  const isWishlisted = (accountId: string) => wishlistIds.includes(accountId);

  // Account Creation
  const createAccount = async (
    newAccountData: Omit<AccountItem, 'id' | 'code' | 'createdAt' | 'views' | 'likes' | 'status'>
  ): Promise<{ success: boolean; message: string; accountId?: string }> => {
    try {
      const response = await api.post('/api/accounts', newAccountData);
      if (response && response.success && (response.account || response.data)) {
        const createdAcc = response.account || response.data;
        setAccounts(prev => [createdAcc, ...prev.filter(a => a.id !== createdAcc.id)]);
        return {
          success: true,
          message: response.message || 'Đăng bán tài khoản thành công! Dữ liệu đã lưu vào MongoDB.',
          accountId: createdAcc.id
        };
      }
      return {
        success: false,
        message: response.message || 'Đăng bán tài khoản thất bại.'
      };
    } catch (error: any) {
      console.error('Create account error:', error);
      return {
        success: false,
        message: error.message || 'Lỗi kết nối máy chủ MongoDB API khi đăng bán.'
      };
    }
  };

  const updateAccountStatus = async (accountId: string, status: AccountStatus, rejectionReason?: string) => {
    setAccounts(prev =>
      prev.map(a =>
        a.id === accountId ? { ...a, status, rejectionReason } : a
      )
    );
    try {
      await api.put(`/api/accounts/${accountId}`, { status, rejectionReason });
    } catch (e) {
      console.warn('MongoDB update account status notice:', e);
    }
  };

  const deleteAccount = async (accountId: string) => {
    setAccounts(prev => prev.filter(a => a.id !== accountId));
    try {
      await api.delete(`/api/accounts/${accountId}`);
    } catch (e) {
      console.warn('MongoDB delete account notice:', e);
    }
  };

  // Orders & Escrow workflow
  const createOrder = (
    accountId: string,
    voucherOptions?: { code: string; discount: number; inventoryItemId?: string }
  ): { success: boolean; orderId?: string; message: string } => {
    const acc = accounts.find(a => a.id === accountId);
    if (!acc) return { success: false, message: 'Tài khoản không tồn tại!' };
    if (acc.status === 'sold') return { success: false, message: 'Tài khoản đã có người mua!' };

    const discountAmount = voucherOptions?.discount || 0;
    const finalPrice = Math.max(0, acc.price - discountAmount);

    if (currentUser.balance < finalPrice) {
      return {
        success: false,
        message: `Số dư ví không đủ (${currentUser.balance.toLocaleString('vi-VN')}đ / ${finalPrice.toLocaleString('vi-VN')}đ). Vui lòng nạp thêm tiền!`
      };
    }

    const orderId = `ord_${Date.now()}`;
    const orderCode = `#ORD${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: OrderItem = {
      id: orderId,
      orderCode,
      accountId: acc.id,
      accountCode: acc.code,
      accountTitle: acc.title,
      accountPrice: acc.price,
      voucherDiscount: discountAmount,
      voucherCodeUsed: voucherOptions?.code,
      totalAmount: finalPrice,
      fee: Math.round(finalPrice * 0.05),
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      sellerId: acc.sellerId,
      sellerName: acc.sellerName,
      status: 'account_delivered',
      credentialsDelivered: acc.credentials,
      createdAt: new Date().toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);
    setAccounts(prev => prev.map(a => (a.id === acc.id ? { ...a, status: 'sold' } : a)));
    
    // Deduct buyer balance locally
    setAllUsers(prev =>
      prev.map(u => (u.id === currentUser.id ? { ...u, balance: Math.max(0, u.balance - finalPrice) } : u))
    );

    // Call MongoDB Order API
    api.post('/api/orders', {
      accountId: acc.id,
      voucherCodeUsed: voucherOptions?.code,
      voucherDiscount: discountAmount
    }).then(res => {
      if (res && res.success && res.order) {
        setOrders(prev => [res.order, ...prev.filter(o => o.id !== orderId && o.id !== res.order.id)]);
      }
    }).catch(err => console.warn('MongoDB create order error:', err));

    return {
      success: true,
      orderId,
      message: 'Đặt mua thành công! Thông tin tài khoản & mật khẩu đã được bàn giao tự động qua Escrow.'
    };
  };

  const confirmAccountDelivery = (orderId: string) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: 'account_delivered' } : o))
    );
  };

  const confirmOrderReceived = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const completedAt = new Date().toISOString();
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId ? { ...o, status: 'completed', completedAt } : o
      )
    );

    const feeAmount = typeof order.fee === 'number' && order.fee > 0 ? order.fee : Math.round(order.accountPrice * 0.05);
    const payoutAmount = Math.max(0, order.accountPrice - feeAmount);

    setAllUsers(prev =>
      prev.map(u =>
        u.id === order.sellerId
          ? {
              ...u,
              balance: (u.balance || 0) + payoutAmount,
              pendingBalance: Math.max(0, (u.pendingBalance || 0) - payoutAmount),
              completedSales: (u.completedSales || 0) + 1
            }
          : u
      )
    );

    // Call MongoDB Confirm Order API
    try {
      const res = await api.post(`/api/orders/${orderId}/confirm-received`, {});
      if (res && res.success) {
        fetchAllMongoData();
      }
    } catch (err) {
      console.warn('MongoDB order confirm notice:', err);
    }
  };

  const disputeOrder = async (orderId: string, reason: string) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId ? { ...o, status: 'disputed', disputeReason: reason } : o
      )
    );
    try {
      await api.post(`/api/orders/${orderId}/dispute`, { reason });
    } catch (e) {
      console.warn('MongoDB dispute order notice:', e);
    }
  };

  const adminResolveDispute = (orderId: string, resolution: 'refund_buyer' | 'payout_seller') => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? { ...o, status: resolution === 'refund_buyer' ? 'refunded' : 'completed' }
          : o
      )
    );
    confirmOrderReceived(orderId);
  };

  const submitReview = async (orderId: string, rating: number, comment: string) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? { ...o, review: { rating, comment, createdAt: new Date().toISOString() } }
          : o
      )
    );
    try {
      await api.post(`/api/orders/${orderId}/review`, { rating, comment });
    } catch (e) {
      console.warn('MongoDB submit review notice:', e);
    }
  };

  // Wallet Actions
  const depositBalance = (amount: number, method: string, note: string = 'Nạp tiền vào ví') => {
    const numAmount = Number(amount) || 0;
    if (numAmount <= 0) return;

    const targetUserId = currentUser.id || currentUserId;
    setAllUsers(prev =>
      prev.map(u => (u.id === targetUserId ? { ...u, balance: (u.balance || 0) + numAmount } : u))
    );

    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId: targetUserId || 'user_guest',
      userName: currentUser.name,
      userEmail: currentUser.email,
      type: 'deposit',
      amount: numAmount,
      status: 'success',
      note: `${note} (${method.toUpperCase()})`,
      createdAt: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);

    api.post('/api/wallet/deposit', {
      userId: targetUserId,
      amount: numAmount,
      method,
      note,
      transactionCode: newTx.id
    }).then(() => {
      fetchAllMongoData();
    }).catch(err => console.warn('MongoDB deposit notice:', err));
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
      status: 'pending',
      note: `Yêu cầu rút tiền về ${bankInfo}`,
      bankName: bankDetails?.bankName || bankInfo.split(' - ')[0] || 'Ngân hàng',
      bankCode: bankDetails?.bankCode || '970422',
      bankAccount: bankDetails?.bankAccount || '',
      bankAccountName: bankDetails?.bankAccountName || currentUser.name,
      createdAt: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);

    api.post('/api/wallet/withdraw', {
      amount,
      bankName: bankDetails?.bankName || bankInfo.split(' - ')[0] || 'Ngân hàng',
      bankAccount: bankDetails?.bankAccount || '',
      bankAccountName: bankDetails?.bankAccountName || currentUser.name
    }).catch(err => console.warn('MongoDB withdraw notice:', err));

    return true;
  };

  const withdrawFunds = (amount: number, bankInfo: string) => {
    const success = withdrawBalance(amount, bankInfo);
    return {
      success,
      message: success ? 'Yêu cầu rút tiền đã được gửi!' : 'Số dư khả dụng không đủ!'
    };
  };

  const adminApproveWithdrawal = async (txId: string, refNote?: string): Promise<{ success: boolean; message: string }> => {
    setTransactions(prev =>
      prev.map(t =>
        t.id === txId ? { ...t, status: 'success', note: refNote ? `${t.note} (Đã chuyển: ${refNote})` : t.note } : t
      )
    );
    try {
      await api.put(`/api/wallet/transactions/${txId}/approve`, { refNote });
      fetchAllMongoData();
      return { success: true, message: 'Đã giải ngân rút tiền thành công!' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Lỗi khi duyệt rút tiền.' };
    }
  };

  const adminRejectWithdrawal = async (txId: string, reason: string): Promise<{ success: boolean; message: string }> => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return { success: false, message: 'Không tìm thấy giao dịch' };

    const refundAmount = Math.abs(tx.amount);
    setAllUsers(prev =>
      prev.map(u => (u.id === tx.userId ? { ...u, balance: (u.balance || 0) + refundAmount } : u))
    );

    setTransactions(prev =>
      prev.map(t => (t.id === txId ? { ...t, status: 'failed', rejectReason: reason } : t))
    );

    try {
      await api.put(`/api/wallet/transactions/${txId}/reject`, { reason });
      fetchAllMongoData();
      return { success: true, message: 'Đã từ chối lệnh rút tiền và hoàn tiền vào ví.' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Lỗi khi từ chối rút tiền.' };
    }
  };

  const adminDisburseEarly = async (orderId: string): Promise<{ success: boolean; message: string }> => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, message: 'Không tìm thấy đơn hàng' };
    confirmOrderReceived(orderId);
    return { success: true, message: `Đã giải ngân đơn hàng ${order.orderCode} thành công!` };
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

    api.post('/api/conversations/messages', {
      recipientId,
      text: text.trim(),
      orderId
    }).then(res => {
      if (res && res.message) {
        setChatMessages(prev => prev.map(m => m.id === newMsg.id ? res.message : m));
      }
    }).catch(e => console.warn('MongoDB message notice:', e));
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

    api.post('/api/conversations/messages', {
      senderId: msgData.senderId,
      senderName: msgData.senderName,
      senderAvatar: msgData.senderAvatar,
      recipientId: msgData.recipientId,
      text: msgData.text.trim(),
      orderId: msgData.orderId
    }).then(res => {
      if (res && res.message) {
        setChatMessages(prev => prev.map(m => m.id === newMsg.id ? res.message : m));
      }
    }).catch(e => console.warn('MongoDB message notice:', e));
  };

  // Notifications
  const markNotificationAsRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await api.put(`/api/notifications/${id}/read`, {});
    } catch (e) {
      console.warn('MongoDB mark notif read notice:', e);
    }
  };

  const clearAllNotifications = async () => {
    setNotifications(prev =>
      prev.map(n => (n.userId === currentUser.id ? { ...n, read: true } : n))
    );
    try {
      await api.put('/api/notifications/read-all', {});
    } catch (e) {
      console.warn('MongoDB clear notifs notice:', e);
    }
  };

  // Admin User Management Operations
  const adminCreateUser = async (
    userData: Omit<UserProfile, 'id' | 'createdAt'>
  ): Promise<{ success: boolean; message: string; userId?: string }> => {
    try {
      const response = await api.post('/api/admin/users', userData);
      if (response && response.success && response.user) {
        const created = response.user;
        setAllUsers(prev => [created, ...prev.filter(u => u.id !== created.id)]);
        return { success: true, message: response.message || 'Tạo người dùng thành công!', userId: created.id };
      }
      return { success: false, message: response.message || 'Lỗi khi tạo người dùng' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Lỗi khi tạo người dùng' };
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
      const res = await api.put(`/api/admin/users/${userId}`, data);
      return { success: true, message: res.message || 'Đã cập nhật thông tin thành viên!' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Lỗi khi cập nhật thông tin.' };
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
      const res = await api.delete(`/api/admin/users/${userId}`);
      return { success: true, message: res.message || 'Đã xóa tài khoản khỏi hệ thống!' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Lỗi khi xóa người dùng.' };
    }
  };

  const adminAdjustUserBalance = async (
    userId: string,
    amount: number,
    note: string
  ): Promise<{ success: boolean; message: string }> => {
    const targetUser = allUsers.find(u => u.id === userId);
    if (!targetUser) return { success: false, message: 'Không tìm thấy người dùng!' };

    const newBalance = Math.max(0, (targetUser.balance || 0) + amount);
    setAllUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, balance: newBalance } : u))
    );

    // Call MongoDB Admin Adjust Balance API
    try {
      const res = await api.post(`/api/admin/users/${userId}/balance`, {
        amount,
        note: note || (amount >= 0 ? 'Admin nạp tiền điều chỉnh' : 'Admin trừ tiền ví')
      });
      fetchAllMongoData();
      return {
        success: true,
        message: res.message || `Đã điều chỉnh số dư thành công (${amount >= 0 ? '+' : ''}${amount.toLocaleString('vi-VN')}đ)!`
      };
    } catch (e: any) {
      return { success: false, message: e.message || 'Lỗi khi cập nhật số dư trên MongoDB!' };
    }
  };

  // Mystery Box Actions
  const openMysteryBox = async (
    boxTierId: string
  ): Promise<{ success: boolean; reward?: MysteryBoxRewardItem; message: string; isFreeTurn?: boolean }> => {
    if (!isLoggedIn || !currentUser || !currentUser.id) {
      openLoginModal();
      return { success: false, message: 'Vui lòng đăng nhập để tham gia xé túi mù!' };
    }

    if (!isMysteryBoxEventActive) {
      return { success: false, message: 'Chương trình Xé Túi Mù hiện đang tạm đóng. Vui lòng quay lại sau!' };
    }

    try {
      const res = await api.post(`/api/mystery-boxes/${boxTierId}/open`, {});
      if (res && res.success) {
        if (res.reward) {
          fetchAllMongoData();
          return {
            success: true,
            reward: res.reward,
            isFreeTurn: res.reward.type === 'free_turn',
            message: res.message || `Chúc mừng bạn đã trúng: ${res.reward.title}!`
          };
        }
      }
      return {
        success: false,
        message: res.message || 'Không thể mở túi mù. Vui lòng kiểm tra lại số dư ví!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Lỗi khi mở túi mù.'
      };
    }
  };

  const useUserInventoryItem = (inventoryItemId: string): { success: boolean; message: string } => {
    setUserInventory(prev =>
      prev.map(i => (i.id === inventoryItemId ? { ...i, isUsed: true } : i))
    );
    api.post(`/api/mystery-boxes/user/inventory/${inventoryItemId}/use`, {})
      .catch(e => console.warn('MongoDB use inventory notice:', e));
    return { success: true, message: 'Đã đánh dấu đã sử dụng vật phẩm!' };
  };

  const adminToggleMysteryBoxEvent = async (active: boolean): Promise<{ success: boolean; message: string }> => {
    setIsMysteryBoxEventActive(active);
    try {
      const res = await api.post('/api/mystery-boxes/settings', { isMysteryBoxEventActive: active, isEventActive: active, isActive: active });
      fetchAllMongoData();
      return {
        success: true,
        message: res.message || (active ? 'Đã BẬT toàn bộ chương trình Xé Túi Mù!' : 'Đã TẮT toàn bộ chương trình Xé Túi Mù!')
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Lỗi khi cập nhật trạng thái chương trình Túi Mù!' };
    }
  };

  const adminToggleTierActive = async (tierId: string, isActive: boolean): Promise<{ success: boolean; message: string }> => {
    return adminUpdateBoxTier(tierId, { isActive });
  };

  const adminAddMysteryReward = async (
    reward: Omit<MysteryBoxRewardItem, 'id'>
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.post('/api/mystery-boxes/rewards', reward);
      fetchAllMongoData();
      return { success: true, message: res.message || 'Đã thêm phần thưởng vào kho Túi Mù thành công!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Lỗi khi thêm phần thưởng!' };
    }
  };

  const adminUpdateMysteryReward = async (
    id: string,
    updates: Partial<MysteryBoxRewardItem>
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.put(`/api/mystery-boxes/rewards/${id}`, updates);
      fetchAllMongoData();
      return { success: true, message: res.message || 'Đã cập nhật phần thưởng thành công!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Lỗi khi cập nhật phần thưởng!' };
    }
  };

  const adminDeleteMysteryReward = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.delete(`/api/mystery-boxes/rewards/${id}`);
      fetchAllMongoData();
      return { success: true, message: res.message || 'Đã xoá phần thưởng khỏi kho Túi Mù!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Lỗi khi xoá phần thưởng!' };
    }
  };

  const adminUpdateBoxTier = async (
    tierId: string,
    updates: Partial<MysteryBoxTierConfig>
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.put(`/api/mystery-boxes/${tierId}`, updates);
      fetchAllMongoData();
      return { success: true, message: res.message || 'Đã cập nhật cấu hình Túi Mù thành công!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Lỗi khi cập nhật cấu hình Túi Mù!' };
    }
  };

  const adminImportAccountToMysteryBox = async (
    accountId: string,
    targetTierId: string
  ): Promise<{ success: boolean; message: string }> => {
    const acc = accounts.find(a => a.id === accountId);
    if (!acc) return { success: false, message: 'Tài khoản không tồn tại trên sàn!' };

    try {
      const res = await api.post('/api/mystery-boxes/import-account', {
        accountId,
        targetTierId
      });
      updateAccountStatus(accountId, 'sold', 'Đã chuyển vào kho quà Túi Mù may mắn');
      fetchAllMongoData();
      return {
        success: true,
        message: res.message || `Đã nhập Acc #${acc.code} vào kho quà của "${targetTierId}" thành công!`
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Lỗi khi nhập tài khoản vào Túi Mù!' };
    }
  };

  const adminResetMysteryBoxes = async (): Promise<{ success: boolean; message: string }> => {
    fetchAllMongoData();
    return { success: true, message: 'Đã đồng bộ lại 4 hạng Túi Mù & toàn bộ kho quà từ MongoDB thành công!' };
  };

  const adminToggleAutoApproveAccounts = async (enabled: boolean): Promise<{ success: boolean; message: string }> => {
    try {
      setIsAutoApproveAccounts(enabled);
      const res = await api.post('/api/admin/settings', {
        settings: {
          auto_approve_accounts: enabled
        }
      });
      if (res && res.success) {
        return { success: true, message: `Đã ${enabled ? 'BẬT' : 'TẮT'} chế độ tự động duyệt tài khoản đăng bán.` };
      }
      return { success: true, message: `Đã cập nhật chế độ duyệt tài khoản: ${enabled ? 'Tự động duyệt ON' : 'Duyệt thủ công OFF'}` };
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Không thể lưu cài đặt duyệt tài khoản vào Database.' };
    }
  };

  const resetToDefaultData = () => {
    fetchAllMongoData();
  };

  const clearAllFirebaseData = async (): Promise<{ success: boolean; message: string }> => {
    return { success: true, message: 'Hệ thống đang hoạt động trên cơ sở dữ liệu MongoDB Atlas duy nhất.' };
  };

  const seedSampleData = async (): Promise<{ success: boolean; message: string }> => {
    fetchAllMongoData();
    return { success: true, message: 'Đã làm mới dữ liệu từ MongoDB Atlas thành công!' };
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

        totalSystemCompletedSales,
        isAutoApproveAccounts,
        adminToggleAutoApproveAccounts,

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

        // Mystery Box
        mysteryBoxes,
        mysteryRewards,
        mysteryHistory,
        userInventory,
        userFreeTurns,
        isMysteryBoxEventActive,
        selectedBoxTierForUnboxing,
        setSelectedBoxTierForUnboxing,
        openMysteryBox,
        useUserInventoryItem,
        adminToggleMysteryBoxEvent,
        adminToggleTierActive,
        adminAddMysteryReward,
        adminUpdateMysteryReward,
        adminDeleteMysteryReward,
        adminUpdateBoxTier,
        adminImportAccountToMysteryBox,
        adminResetMysteryBoxes,

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
export default AppContext;
