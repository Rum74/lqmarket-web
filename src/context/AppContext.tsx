import React, { createContext, useContext, useState, useEffect } from 'react';
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
import { db, auth } from '../lib/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';

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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Pure State synchronized directly with Firestore (No localStorage dependency)
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');

  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Mystery Box (Túi Mù May Mắn) States
  const [mysteryBoxes, setMysteryBoxes] = useState<MysteryBoxTierConfig[]>(DEFAULT_MYSTERY_BOX_TIERS);
  const [mysteryRewards, setMysteryRewards] = useState<MysteryBoxRewardItem[]>(DEFAULT_MYSTERY_BOX_REWARDS);
  const [mysteryHistory, setMysteryHistory] = useState<MysteryBoxHistoryItem[]>([]);
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

  // Listen to Firebase Auth state - STRICTLY NO AUTO-LOGIN
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setCurrentUserId(fbUser.uid);
        setIsLoggedIn(true);
        // Sync user document from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            setAllUsers(prev => {
              const filtered = prev.filter(u => u.id !== fbUser.uid);
              return [data, ...filtered];
            });
          }
        } catch (e) {
          console.warn('Error fetching auth user profile:', e);
        }
      } else {
        // Visitor / Guest: Always unauthenticated
        setCurrentUserId('');
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Firestore Sync Mechanism (Real-time Cloud Database Integration for all collections)
  useEffect(() => {
    let unsubscribeAccounts: (() => void) | undefined;
    let unsubscribeUsers: (() => void) | undefined;
    let unsubscribeOrders: (() => void) | undefined;
    let unsubscribeTransactions: (() => void) | undefined;
    let unsubscribeMessages: (() => void) | undefined;
    let unsubscribeNotifications: (() => void) | undefined;
    let unsubscribeMysteryBoxes: (() => void) | undefined;
    let unsubscribeMysteryRewards: (() => void) | undefined;
    let unsubscribeMysteryHistory: (() => void) | undefined;
    let unsubscribeInventory: (() => void) | undefined;
    let unsubscribeSettings: (() => void) | undefined;

    const setupFirestoreSync = async () => {
      try {
        setCloudSyncStatus('syncing');

        // 1. Subscribe to real-time accounts (User A adds/edits -> User B sees immediately)
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
            setAccounts(cloudAccounts);
            setCloudSyncStatus('synced');
          },
          err => {
            console.warn('Firestore accounts listener notice:', err);
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
            setAllUsers(cloudUsers);
          },
          err => console.warn('Firestore users listener notice:', err)
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
          err => console.warn('Firestore orders listener notice:', err)
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
          err => console.warn('Firestore transactions listener notice:', err)
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
          err => console.warn('Firestore messages listener notice:', err)
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
            setNotifications(cloudNotifs);
          },
          err => console.warn('Firestore notifications listener notice:', err)
        );

        // 7. Subscribe to real-time mystery boxes
        unsubscribeMysteryBoxes = onSnapshot(
          collection(db, 'mystery_boxes'),
          snapshot => {
            const cloudBoxesMap = new Map<string, MysteryBoxTierConfig>();
            DEFAULT_MYSTERY_BOX_TIERS.forEach(box => cloudBoxesMap.set(box.id, box));

            snapshot.forEach(d => {
              const box = d.data() as MysteryBoxTierConfig;
              if (box && box.id) {
                cloudBoxesMap.set(box.id, { ...cloudBoxesMap.get(box.id), ...box });
              }
            });

            const tierOrder = ['box_bronze', 'box_gold', 'box_diamond', 'box_special'];
            const allBoxes = Array.from(cloudBoxesMap.values()).sort((a, b) => {
              const idxA = tierOrder.indexOf(a.id);
              const idxB = tierOrder.indexOf(b.id);
              if (idxA !== -1 && idxB !== -1) return idxA - idxB;
              return 0;
            });

            setMysteryBoxes(allBoxes);
          },
          err => console.warn('Firestore mystery_boxes listener notice:', err)
        );

        // 8. Subscribe to real-time mystery rewards
        unsubscribeMysteryRewards = onSnapshot(
          collection(db, 'mystery_rewards'),
          snapshot => {
            const cloudRewards: MysteryBoxRewardItem[] = [];
            snapshot.forEach(d => {
              const rew = d.data() as MysteryBoxRewardItem;
              if (rew && rew.id) {
                cloudRewards.push(rew);
              }
            });
            setMysteryRewards(cloudRewards.length > 0 ? cloudRewards : DEFAULT_MYSTERY_BOX_REWARDS);
          },
          err => console.warn('Firestore mystery_rewards listener notice:', err)
        );

        // 9. Subscribe to real-time mystery history
        unsubscribeMysteryHistory = onSnapshot(
          collection(db, 'mystery_history'),
          snapshot => {
            const cloudHist: MysteryBoxHistoryItem[] = [];
            snapshot.forEach(d => {
              const h = d.data() as MysteryBoxHistoryItem;
              if (h && h.id) {
                cloudHist.push(h);
              }
            });
            setMysteryHistory(cloudHist.slice(0, 50));
          },
          err => console.warn('Firestore mystery_history listener notice:', err)
        );

        // 10. Subscribe to mystery box program status
        unsubscribeSettings = onSnapshot(
          doc(db, 'site_settings', 'mystery_box_config'),
          docSnap => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (typeof data.isEventActive === 'boolean') {
                setIsMysteryBoxEventActive(data.isEventActive);
              }
            }
          },
          err => console.warn('Firestore mystery_box_config listener notice:', err)
        );

        // 11. Subscribe to user inventory
        unsubscribeInventory = onSnapshot(
          collection(db, 'user_inventory'),
          snapshot => {
            const cloudInv: UserInventoryItem[] = [];
            snapshot.forEach(d => {
              const inv = d.data() as UserInventoryItem;
              if (inv && inv.id) {
                cloudInv.push(inv);
              }
            });
            setUserInventory(cloudInv);
          },
          err => console.warn('Firestore user_inventory listener notice:', err)
        );
      } catch (err) {
        console.warn('Firebase Firestore setup offline mode:', err);
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
      if (unsubscribeMysteryBoxes) unsubscribeMysteryBoxes();
      if (unsubscribeMysteryRewards) unsubscribeMysteryRewards();
      if (unsubscribeMysteryHistory) unsubscribeMysteryHistory();
      if (unsubscribeInventory) unsubscribeInventory();
      if (unsubscribeSettings) unsubscribeSettings();
    };
  }, []);

  const currentUser =
    isLoggedIn && currentUserId
      ? (allUsers && allUsers.find(u => u && u.id === currentUserId)) || GUEST_USER
      : GUEST_USER;

  // Sync wishlist to current user's profile
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

    // 1. Try Firebase Auth first if credentials exist
    if (password && cleanInput.length >= 3) {
      try {
        const formattedEmail = cleanInput.includes('@') ? cleanInput : `${cleanInput.replace(/[^a-z0-9._-]/g, '')}@cholienquan.com`;
        const fbCredential = await signInWithEmailAndPassword(auth, formattedEmail, password);
        if (fbCredential.user) {
          setCurrentUserId(fbCredential.user.uid);
          setIsLoggedIn(true);
          setIsAuthModalOpen(false);
          return { success: true, message: `Đăng nhập thành công qua Firebase Auth!` };
        }
      } catch (fbAuthErr: any) {
        // Fallback to Firestore users lookup
      }
    }

    // 2. Match in Firestore allUsers collection
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

    // Check if account already taken in Firestore
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

    const validatedRole: UserRole = role === 'admin' ? 'buyer' : role;
    const isEmailFormat = cleanAccount.includes('@');
    const assignedUsername = isEmailFormat ? cleanAccount.split('@')[0] : cleanAccount;
    const assignedEmail = isEmailFormat ? cleanAccount : `${cleanAccount.replace(/[^a-z0-9._-]/g, '')}@cholienquan.com`;

    let newUserId = `user_${Date.now()}`;

    // Create Firebase Auth user
    try {
      const fbCredential = await createUserWithEmailAndPassword(auth, assignedEmail, password);
      if (fbCredential.user) {
        newUserId = fbCredential.user.uid;
        await updateProfile(fbCredential.user, { displayName: name.trim() });
      }
    } catch (authErr) {
      console.warn('Firebase Auth user creation notice:', authErr);
    }

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

    // Save directly to Firestore users collection
    try {
      await setDoc(doc(db, 'users', newUserId), cleanForFirestore(newUser));
    } catch (e) {
      console.warn('Firestore user save notice:', e);
    }

    // Welcome notification
    const welcomeNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: newUserId,
      title: 'Đăng ký tài khoản thành công',
      message: `Chào mừng ${name} đến với sàn giao dịch LQMarket! Dữ liệu của bạn được đồng bộ trực tiếp trên Cloud Firestore.`,
      type: 'system',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [welcomeNotif, ...prev]);
    try {
      await setDoc(doc(db, 'notifications', welcomeNotif.id), cleanForFirestore(welcomeNotif));
    } catch (e) {
      console.warn('Firestore notif save notice:', e);
    }

    return {
      success: true,
      message: 'Đăng ký tài khoản thành công!'
    };
  };

  const logoutUser = () => {
    signOut(auth).catch(() => {});
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

  // Toggle Wishlist & Sync with Firestore
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

      try {
        setDoc(doc(db, 'users', currentUser.id), { wishlistIds: updated }, { merge: true });
      } catch (e) {
        console.warn('Firestore wishlist sync notice:', e);
      }

      return updated;
    });
  };

  const isWishlisted = (accountId: string) => wishlistIds.includes(accountId);

  // Account Creation & Firestore write (Real-time sync to all devices)
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

    // Save to Firestore accounts collection
    try {
      await setDoc(doc(db, 'accounts', newId), cleanForFirestore(newAccount));
    } catch (e) {
      console.warn('Firestore write notice:', e);
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
      console.warn('Firestore notif save notice:', e);
    }

    return {
      success: true,
      message: 'Tin đăng của bạn đã được lưu lên Cloud Firestore và đang chờ Super Admin kiểm duyệt!',
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
      const payload = cleanForFirestore({
        status,
        rejectionReason: status === 'rejected' ? reasonText : null
      });
      await setDoc(doc(db, 'accounts', accountId), payload, { merge: true });
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
            ? `Tài khoản #${targetAcc.code} đã được duyệt và hiển thị công khai trên sàn LQMarket!`
            : `Tài khoản #${targetAcc.code} bị từ chối. Lý do: ${reasonText || 'Thông tin chưa chính xác'}`,
        type: 'account',
        read: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [notif, ...prev]);
      try {
        await setDoc(doc(db, 'notifications', notif.id), cleanForFirestore(notif));
      } catch (e) {
        console.warn('Firestore notif save notice:', e);
      }
    }
  };

  const deleteAccount = async (accountId: string) => {
    setAccounts(prev => prev.filter(a => a.id !== accountId));
    try {
      await deleteDoc(doc(db, 'accounts', accountId));
    } catch (e) {
      console.warn('Firestore delete account notice:', e);
    }
  };

  // Escrow Order Flow
  const createOrder = (
    accountId: string,
    voucherOptions?: { code: string; discount: number; inventoryItemId?: string }
  ): { success: boolean; orderId?: string; message: string } => {
    const acc = accounts.find(a => a.id === accountId);
    if (!acc) return { success: false, message: 'Không tìm thấy tài khoản!' };
    if (acc.status === 'sold') return { success: false, message: 'Tài khoản này đã có người mua!' };

    const discountAmount = Math.max(0, voucherOptions?.discount || 0);
    const totalCost = Math.max(0, acc.price - discountAmount);

    if (currentUser.balance < totalCost) {
      return {
        success: false,
        message: `Số dư ví không đủ (${currentUser.balance.toLocaleString('vi-VN')}đ < ${totalCost.toLocaleString('vi-VN')}đ). Vui lòng nạp thêm tiền qua PayOS / VietQR!`
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

    // 3. Mark inventory voucher item as used if applicable
    if (voucherOptions?.inventoryItemId) {
      useUserInventoryItem(voucherOptions.inventoryItemId);
    }

    // 4. Create Escrow Order
    const orderId = `ord_${Date.now()}`;
    const orderCodeNum = Math.floor(10000 + Math.random() * 90000);
    const platformFee = Math.round(acc.price * 0.05); // 5% platform fee
    const sellerNetPending = acc.price - platformFee;
    const newOrder: OrderItem = {
      id: orderId,
      orderCode: `#ORD${orderCodeNum}`,
      accountId: acc.id,
      accountCode: acc.code,
      accountTitle: acc.title,
      accountPrice: acc.price,
      voucherDiscount: discountAmount > 0 ? discountAmount : undefined,
      voucherCodeUsed: voucherOptions?.code || undefined,
      fee: platformFee,
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

    // 5. Create Wallet Transaction for Buyer
    const buyerTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId: currentUser.id,
      type: 'purchase',
      amount: -totalCost,
      status: 'success',
      note: discountAmount > 0
        ? `Mua acc #${acc.code} (Áp dụng voucher giảm ${discountAmount.toLocaleString('vi-VN')}đ do sàn tài trợ)`
        : `Mua acc #${acc.code} (Hệ thống Escrow trung gian đang giữ tiền)`,
      createdAt: new Date().toISOString()
    };
    setTransactions(prev => [buyerTx, ...prev]);

    // 6. Update Seller Pending Balance
    setAllUsers(prev =>
      prev.map(u => (u.id === acc.sellerId ? { ...u, pendingBalance: u.pendingBalance + sellerNetPending } : u))
    );

    // Sync to Firestore
    try {
      setDoc(doc(db, 'orders', orderId), cleanForFirestore(newOrder));
      setDoc(doc(db, 'transactions', buyerTx.id), cleanForFirestore(buyerTx));
      updateDoc(doc(db, 'accounts', acc.id), { status: 'sold' });
      updateDoc(doc(db, 'users', currentUser.id), { balance: currentUser.balance - totalCost });
      const seller = allUsers.find(u => u.id === acc.sellerId);
      if (seller) {
        updateDoc(doc(db, 'users', acc.sellerId), { pendingBalance: seller.pendingBalance + sellerNetPending });
      }
    } catch (e) {
      console.warn('Firestore order sync notice:', e);
    }

    // 7. Notify Buyer & Seller
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
      message: `Khách hàng ${currentUser.name} vừa mua acc #${acc.code}. Tiền (${sellerNetPending.toLocaleString('vi-VN')}đ sau trừ phí) đang được giữ an toàn trong ví Escrow.`,
      type: 'order',
      read: false,
      createdAt: new Date().toISOString()
    };

    setNotifications(prev => [buyerNotif, sellerNotif, ...prev]);
    try {
      setDoc(doc(db, 'notifications', buyerNotif.id), cleanForFirestore(buyerNotif));
      setDoc(doc(db, 'notifications', sellerNotif.id), cleanForFirestore(sellerNotif));
    } catch (e) {}

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
      console.warn('Firestore delivery confirm notice:', e);
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

    const feeAmount = typeof order.fee === 'number' && order.fee > 0 ? order.fee : Math.round(order.accountPrice * 0.05);
    const payoutAmount = Math.max(0, order.accountPrice - feeAmount);

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

    const sellerTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId: order.sellerId,
      type: 'seller_payout',
      amount: payoutAmount,
      status: 'success',
      note: `Nhận tiền bán acc ${order.accountCode} (Đơn hàng ${order.orderCode} - Đã trừ 5% phí sàn: -${feeAmount.toLocaleString('vi-VN')}đ)`,
      createdAt: new Date().toISOString()
    };
    setTransactions(prev => [sellerTx, ...prev]);

    try {
      updateDoc(doc(db, 'orders', orderId), { status: 'completed', completedAt, fee: feeAmount });
      setDoc(doc(db, 'transactions', sellerTx.id), cleanForFirestore(sellerTx));
      const seller = allUsers.find(u => u.id === order.sellerId);
      if (seller) {
        updateDoc(doc(db, 'users', order.sellerId), {
          balance: seller.balance + payoutAmount,
          pendingBalance: Math.max(0, seller.pendingBalance - payoutAmount),
          completedSales: seller.completedSales + 1
        });
      }
    } catch (e) {
      console.warn('Firestore order complete notice:', e);
    }

    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: order.sellerId,
      title: 'Đơn hàng hoàn tất - Tiền đã vào ví',
      message: `Người mua đã xác nhận nhận acc ${order.accountCode}. Bạn nhận được +${payoutAmount.toLocaleString('vi-VN')}đ vào số dư ví khả dụng!`,
      type: 'wallet',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [notif, ...prev]);
    try {
      setDoc(doc(db, 'notifications', notif.id), cleanForFirestore(notif));
    } catch (e) {}
  };

  const disputeOrder = (orderId: string, reason: string) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: 'disputed', disputeReason: reason } : o))
    );

    try {
      updateDoc(doc(db, 'orders', orderId), { status: 'disputed', disputeReason: reason });
    } catch (e) {
      console.warn('Firestore dispute notice:', e);
    }

    const order = orders.find(o => o.id === orderId);
    if (order) {
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
      try {
        setDoc(doc(db, 'notifications', adminNotif.id), cleanForFirestore(adminNotif));
        setDoc(doc(db, 'notifications', sellerNotif.id), cleanForFirestore(sellerNotif));
      } catch (e) {}
    }
  };

  const adminResolveDispute = (orderId: string, resolution: 'refund_buyer' | 'payout_seller') => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (resolution === 'refund_buyer') {
      const completedAt = new Date().toISOString();
      const updatedReason = `${order.disputeReason || ''} -> (Admin đã xử lý HOÀN TIỀN cho người mua)`;

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

      setAllUsers(prev =>
        prev.map(u => (u.id === order.buyerId ? { ...u, balance: u.balance + order.totalAmount } : u))
      );

      const sellerPendingDeduction = order.accountPrice - (order.fee || Math.round(order.accountPrice * 0.05));
      setAllUsers(prev =>
        prev.map(u =>
          u.id === order.sellerId
            ? { ...u, pendingBalance: Math.max(0, u.pendingBalance - sellerPendingDeduction) }
            : u
        )
      );

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
        setDoc(doc(db, 'transactions', refundTx.id), cleanForFirestore(refundTx));
        const buyer = allUsers.find(u => u.id === order.buyerId);
        if (buyer) {
          updateDoc(doc(db, 'users', order.buyerId), { balance: buyer.balance + order.totalAmount });
        }
        const seller = allUsers.find(u => u.id === order.sellerId);
        if (seller) {
          updateDoc(doc(db, 'users', order.sellerId), { pendingBalance: Math.max(0, seller.pendingBalance - sellerPendingDeduction) });
        }
      } catch (e) {
        console.warn('Firestore refund notice:', e);
      }
    } else {
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
      console.warn('Firestore review notice:', e);
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
      setDoc(doc(db, 'transactions', newTx.id), cleanForFirestore(newTx));
      updateDoc(doc(db, 'users', currentUser.id), { balance: currentUser.balance + amount });
    } catch (e) {
      console.warn('Firestore deposit notice:', e);
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
    try {
      setDoc(doc(db, 'notifications', notif.id), cleanForFirestore(notif));
    } catch (e) {}
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

    try {
      setDoc(doc(db, 'transactions', newTx.id), cleanForFirestore(newTx));
      updateDoc(doc(db, 'users', currentUser.id), { balance: currentUser.balance - amount });
    } catch (e) {
      console.warn('Firestore withdraw notice:', e);
    }

    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: currentUser.id,
      title: 'Đã gửi yêu cầu rút tiền',
      message: `Đã tạo lệnh rút -${amount.toLocaleString('vi-VN')}đ về tài khoản ngân hàng: ${bankInfo}. Ban quản trị sẽ giải ngân nhanh trong 5-15 phút.`,
      type: 'wallet',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [notif, ...prev]);
    try {
      setDoc(doc(db, 'notifications', notif.id), cleanForFirestore(notif));
    } catch (e) {}

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
      console.warn('Firestore approve withdrawal notice:', e);
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
    try {
      setDoc(doc(db, 'notifications', notif.id), cleanForFirestore(notif));
    } catch (e) {}

    return { success: true, message: 'Đã xác nhận giải ngân thành công!' };
  };

  const adminRejectWithdrawal = async (txId: string, reason: string): Promise<{ success: boolean; message: string }> => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return { success: false, message: 'Không tìm thấy giao dịch' };

    const refundAmount = Math.abs(tx.amount);
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
      console.warn('Firestore reject withdrawal notice:', e);
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
    try {
      setDoc(doc(db, 'notifications', notif.id), cleanForFirestore(notif));
    } catch (e) {}

    return { success: true, message: 'Đã từ chối lệnh rút tiền và hoàn lại số dư vào ví người bán.' };
  };

  const adminDisburseEarly = async (orderId: string): Promise<{ success: boolean; message: string }> => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, message: 'Không tìm thấy đơn hàng' };
    if (order.status === 'completed') return { success: false, message: 'Đơn hàng đã hoàn tất trước đó' };

    const feeAmount = typeof order.fee === 'number' && order.fee > 0 ? order.fee : Math.round(order.accountPrice * 0.05);
    const payoutAmount = Math.max(0, order.accountPrice - feeAmount);

    confirmOrderReceived(orderId);
    return {
      success: true,
      message: `Đã giải ngân sớm ${payoutAmount.toLocaleString('vi-VN')}đ (Đã trừ 5% phí sàn -${feeAmount.toLocaleString('vi-VN')}đ) cho người bán ${order.sellerName}!`
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
      setDoc(doc(db, 'messages', newMsg.id), cleanForFirestore(newMsg));
    } catch (e) {
      console.warn('Firestore message notice:', e);
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
      setDoc(doc(db, 'messages', newMsg.id), cleanForFirestore(newMsg));
    } catch (e) {
      console.warn('Firestore direct message notice:', e);
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
      console.warn('Firestore notif mark read notice:', e);
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
      console.warn('Firestore clear all notifs notice:', e);
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
      await setDoc(doc(db, 'users', newUserId), cleanForFirestore(newUser));
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
      await setDoc(doc(db, 'users', userId), cleanForFirestore(data), { merge: true });
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
      await setDoc(doc(db, 'transactions', newTx.id), cleanForFirestore(newTx));
      await setDoc(doc(db, 'notifications', notif.id), cleanForFirestore(notif));
      return {
        success: true,
        message: `Đã điều chỉnh số dư thành công (${amount >= 0 ? '+' : ''}${amount.toLocaleString('vi-VN')}đ)!`
      };
    } catch (e) {
      console.error('Firestore admin adjust balance error:', e);
      return { success: false, message: 'Lỗi khi cập nhật số dư trên Firestore!' };
    }
  };

  const resetToDefaultData = () => {
    seedSampleData();
  };

  // Wipe All Firebase Firestore Cloud Database
  const clearAllFirebaseData = async (): Promise<{ success: boolean; message: string }> => {
    try {
      setCloudSyncStatus('syncing');
      const collectionsToWipe = ['accounts', 'orders', 'transactions', 'messages', 'users', 'mystery_history', 'user_inventory'];

      for (const colName of collectionsToWipe) {
        const snap = await getDocs(collection(db, colName));
        for (const d of snap.docs) {
          await deleteDoc(doc(db, colName, d.id));
        }
      }

      // Re-create the Super Admin user profile in Firestore
      const adminUser = INITIAL_USERS[0];
      await setDoc(doc(db, 'users', adminUser.id), cleanForFirestore(adminUser));

      setAccounts([]);
      setOrders([]);
      setTransactions([]);
      setChatMessages([]);
      setWishlistIds([]);
      setUserInventory([]);
      setMysteryHistory([]);
      setAllUsers([adminUser]);
      
      // If current Firebase Auth session exists, maintain it; otherwise stay logged out
      if (auth.currentUser) {
        setCurrentUserId(auth.currentUser.uid);
        setIsLoggedIn(true);
      } else {
        setCurrentUserId('');
        setIsLoggedIn(false);
      }

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

  // --------------------------------------------------
  // MYSTERY BOX ACTIONS & HANDLERS
  // --------------------------------------------------
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

    const box = mysteryBoxes.find(b => b.id === boxTierId);
    if (!box || box.isActive === false) {
      return { success: false, message: 'Hạng túi mù này hiện đang tạm đóng hoặc không tồn tại!' };
    }

    const hasFreeTurn = (userFreeTurns[boxTierId] || 0) > 0;

    if (!hasFreeTurn && currentUser.balance < box.price) {
      setIsWalletModalOpen(true);
      return {
        success: false,
        message: `Số dư ví không đủ ${box.price.toLocaleString('vi-VN')}đ để mở túi "${box.name}". Vui lòng nạp thêm tiền vào ví!`
      };
    }

    // Candidate rewards for this tier
    const candidateRewards = mysteryRewards.filter(
      r => (r.boxTierId === boxTierId || r.boxTierId === 'all') && (r.stock === undefined || r.stock > 0)
    );

    if (candidateRewards.length === 0) {
      return { success: false, message: 'Kho phần thưởng của túi này đang được bảo trì. Vui lòng thử lại sau!' };
    }

    // Secure backend calculation with client fallback
    let pickedReward: MysteryBoxRewardItem = candidateRewards[0];
    try {
      const serverRes = await fetch('/api/mystery-box/calculate-drop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boxTierId, rewards: candidateRewards })
      });
      if (serverRes.ok) {
        const json = await serverRes.json();
        if (json.success && json.reward) {
          pickedReward = json.reward;
        }
      }
    } catch (e) {
      // Local fallback
      const totalWeight = candidateRewards.reduce((sum, r) => sum + (r.dropWeight || 1), 0);
      let randomVal = Math.random() * totalWeight;
      for (const r of candidateRewards) {
        const w = r.dropWeight || 1;
        if (randomVal <= w) {
          pickedReward = r;
          break;
        }
        randomVal -= w;
      }
    }

    // Deduct cost or free turn
    let newBalance = currentUser.balance;
    const nowIso = new Date().toISOString();

    if (hasFreeTurn) {
      setUserFreeTurns(prev => ({ ...prev, [boxTierId]: Math.max(0, (prev[boxTierId] || 1) - 1) }));
    } else {
      newBalance = currentUser.balance - box.price;
      const boxTx: WalletTransaction = {
        id: `tx_box_${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        type: 'purchase',
        amount: -box.price,
        status: 'success',
        note: `[Túi Mù] Mua lượt xé "${box.name}"`,
        createdAt: nowIso
      };

      setTransactions(prev => [boxTx, ...prev]);
      try {
        await setDoc(doc(db, 'transactions', boxTx.id), cleanForFirestore(boxTx));
      } catch (e) {
        console.warn('Firestore box purchase tx notice:', e);
      }
    }

    // Process Reward Outcome
    let rewardNotificationMsg = '';

    if (pickedReward.type === 'cash') {
      newBalance += pickedReward.value;
      const cashWinTx: WalletTransaction = {
        id: `tx_box_win_${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        type: 'deposit',
        amount: pickedReward.value,
        status: 'success',
        note: `[Túi Mù] Trúng thưởng tiền mặt: ${pickedReward.title}`,
        createdAt: nowIso
      };
      setTransactions(prev => [cashWinTx, ...prev]);
      try {
        await setDoc(doc(db, 'transactions', cashWinTx.id), cleanForFirestore(cashWinTx));
      } catch (e) {
        console.warn('Firestore cash win tx notice:', e);
      }
      rewardNotificationMsg = `Chúc mừng bạn trúng ${pickedReward.value.toLocaleString('vi-VN')}đ tiền mặt vào ví!`;
    } else if (pickedReward.type === 'free_turn') {
      setUserFreeTurns(prev => ({
        ...prev,
        [boxTierId]: (prev[boxTierId] || 0) + 1
      }));
      rewardNotificationMsg = `Chúc mừng bạn nhận được 1 Lượt Xé Túi Mù Miễn Phí!`;
    } else if (pickedReward.type === 'voucher') {
      const newInvItem: UserInventoryItem = {
        id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        userId: currentUser.id,
        source: 'mystery_box',
        rewardType: 'voucher',
        title: pickedReward.title,
        value: pickedReward.value,
        rarity: pickedReward.rarity,
        voucherCode: pickedReward.voucherCode || `VOUCHER_${Math.floor(1000 + Math.random() * 9000)}`,
        voucherDiscount: pickedReward.voucherDiscount || pickedReward.value,
        isUsed: false,
        receivedAt: nowIso
      };

      setUserInventory(prev => [newInvItem, ...prev]);
      try {
        await setDoc(doc(db, 'user_inventory', newInvItem.id), cleanForFirestore(newInvItem));
      } catch (e) {
        console.warn('Firestore inventory save notice:', e);
      }
      rewardNotificationMsg = `Bạn nhận được Voucher giảm giá ${pickedReward.value.toLocaleString('vi-VN')}đ!`;
    } else if (pickedReward.type === 'account' && pickedReward.accountData) {
      const newInvItem: UserInventoryItem = {
        id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        userId: currentUser.id,
        source: 'mystery_box',
        rewardType: 'account',
        title: pickedReward.title,
        value: pickedReward.value,
        rarity: pickedReward.rarity,
        accountData: pickedReward.accountData,
        receivedAt: nowIso
      };
      setUserInventory(prev => [newInvItem, ...prev]);
      try {
        await setDoc(doc(db, 'user_inventory', newInvItem.id), cleanForFirestore(newInvItem));
      } catch (e) {
        console.warn('Firestore inventory save notice:', e);
      }

      const newOrder: OrderItem = {
        id: `ord_box_${Date.now()}`,
        orderCode: `#BOX${Date.now().toString().slice(-6)}`,
        accountId: `acc_reward_${Date.now()}`,
        accountCode: `LQ${Math.floor(10000 + Math.random() * 90000)}`,
        accountTitle: pickedReward.title,
        accountPrice: pickedReward.value,
        fee: 0,
        totalAmount: hasFreeTurn ? 0 : box.price,
        buyerId: currentUser.id,
        buyerName: currentUser.name,
        sellerId: 'admin_official',
        sellerName: 'Kho Quà Túi Mù LQMarket',
        status: 'completed',
        credentialsDelivered: pickedReward.accountData.credentials,
        createdAt: nowIso,
        completedAt: nowIso
      };
      setOrders(prev => [newOrder, ...prev]);
      try {
        await setDoc(doc(db, 'orders', newOrder.id), cleanForFirestore(newOrder));
      } catch (e) {
        console.warn('Firestore order save notice:', e);
      }

      rewardNotificationMsg = `SIÊU PHẨM! Bạn đã xé trúng ${pickedReward.title}! Tài khoản đã được chuyển thẳng vào Túi đồ & Đơn hàng của bạn.`;
    }

    // Update user profile balance
    updateCurrentUserProfile({ balance: newBalance });

    // Update Box Stats (totalOpened & stock)
    setMysteryBoxes(prev =>
      prev.map(b => {
        if (b.id === boxTierId) {
          const newOpened = (b.totalOpened || 0) + 1;
          const newStock = b.stockRemaining > 0 ? b.stockRemaining - 1 : b.stockRemaining;
          const updatedBox = { ...b, totalOpened: newOpened, stockRemaining: newStock };
          setDoc(doc(db, 'mystery_boxes', b.id), cleanForFirestore(updatedBox)).catch(() => {});
          return updatedBox;
        }
        return b;
      })
    );

    // Save History Log to Firestore
    const newHistItem: MysteryBoxHistoryItem = {
      id: `hist_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      boxTierId: box.id,
      boxName: box.name,
      rewardId: pickedReward.id,
      rewardType: pickedReward.type,
      rewardTitle: pickedReward.title,
      rewardValue: pickedReward.value,
      rewardRarity: pickedReward.rarity,
      accountDelivered: pickedReward.accountData?.credentials,
      voucherCodeDelivered: pickedReward.voucherCode,
      openedAt: 'Vừa xong'
    };

    setMysteryHistory(prev => [newHistItem, ...prev.slice(0, 49)]);
    try {
      await setDoc(doc(db, 'mystery_history', newHistItem.id), cleanForFirestore(newHistItem));
    } catch (e) {
      console.warn('Firestore history save notice:', e);
    }

    // Send In-App Notification
    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: currentUser.id,
      title: `🎁 [Túi Mù] ${pickedReward.title}`,
      message: rewardNotificationMsg || `Bạn đã nhận được "${pickedReward.title}" từ ${box.name}!`,
      type: 'order',
      read: false,
      createdAt: nowIso
    };
    setNotifications(prev => [notif, ...prev]);
    try {
      await setDoc(doc(db, 'notifications', notif.id), cleanForFirestore(notif));
    } catch (e) {}

    return {
      success: true,
      reward: pickedReward,
      isFreeTurn: pickedReward.type === 'free_turn',
      message: rewardNotificationMsg || `Mở túi thành công!`
    };
  };

  const useUserInventoryItem = (inventoryItemId: string): { success: boolean; message: string } => {
    const item = userInventory.find(i => i.id === inventoryItemId);
    if (!item) return { success: false, message: 'Vật phẩm không tồn tại!' };
    if (item.isUsed) return { success: false, message: 'Vật phẩm này đã được sử dụng!' };

    setUserInventory(prev =>
      prev.map(i => (i.id === inventoryItemId ? { ...i, isUsed: true } : i))
    );
    try {
      updateDoc(doc(db, 'user_inventory', inventoryItemId), { isUsed: true });
    } catch (e) {
      console.warn('Firestore update inventory notice:', e);
    }
    return { success: true, message: 'Đã đánh dấu đã sử dụng vật phẩm!' };
  };

  const adminAddMysteryReward = async (
    reward: Omit<MysteryBoxRewardItem, 'id'>
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const newId = `rew_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      const newReward: MysteryBoxRewardItem = { ...reward, id: newId };
      setMysteryRewards(prev => [...prev, newReward]);
      await setDoc(doc(db, 'mystery_rewards', newId), cleanForFirestore(newReward));
      return { success: true, message: 'Đã thêm phần thưởng vào kho Túi Mù thành công!' };
    } catch (err) {
      console.error('Error adding mystery reward:', err);
      return { success: false, message: 'Lỗi khi thêm phần thưởng vào Firebase!' };
    }
  };

  const adminUpdateMysteryReward = async (
    id: string,
    updates: Partial<MysteryBoxRewardItem>
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setMysteryRewards(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
      await updateDoc(doc(db, 'mystery_rewards', id), cleanForFirestore(updates));
      return { success: true, message: 'Đã cập nhật phần thưởng thành công!' };
    } catch (err) {
      console.error('Error updating mystery reward:', err);
      return { success: false, message: 'Lỗi khi cập nhật phần thưởng!' };
    }
  };

  const adminDeleteMysteryReward = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      setMysteryRewards(prev => prev.filter(r => r.id !== id));
      await deleteDoc(doc(db, 'mystery_rewards', id));
      return { success: true, message: 'Đã xoá phần thưởng khỏi kho Túi Mù!' };
    } catch (err) {
      console.error('Error deleting mystery reward:', err);
      return { success: false, message: 'Lỗi khi xoá phần thưởng!' };
    }
  };

  const adminUpdateBoxTier = async (
    tierId: string,
    updates: Partial<MysteryBoxTierConfig>
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setMysteryBoxes(prev => prev.map(b => (b.id === tierId ? { ...b, ...updates } : b)));
      await updateDoc(doc(db, 'mystery_boxes', tierId), cleanForFirestore(updates));
      return { success: true, message: 'Đã cập nhật cấu hình Túi Mù thành công!' };
    } catch (err) {
      console.error('Error updating box tier:', err);
      return { success: false, message: 'Lỗi khi cập nhật cấu hình Túi Mù!' };
    }
  };

  const adminImportAccountToMysteryBox = async (
    accountId: string,
    targetTierId: string
  ): Promise<{ success: boolean; message: string }> => {
    const acc = accounts.find(a => a.id === accountId);
    if (!acc) return { success: false, message: 'Tài khoản không tồn tại trên sàn!' };

    const newReward: MysteryBoxRewardItem = {
      id: `rew_import_${Date.now()}`,
      boxTierId: targetTierId,
      type: 'account',
      title: `Acc ${acc.rank} ${acc.heroesCount}T ${acc.skinsCount}S - ${acc.title}`,
      subtitle: `${acc.credentials.securityType} - Đổi thông tin ngay`,
      value: acc.price,
      rarity: acc.price >= 500000 ? 'legendary' : acc.price >= 150000 ? 'epic' : 'rare',
      dropWeight: targetTierId === 'box_diamond' || targetTierId === 'box_special' ? 18 : 12,
      accountData: {
        rank: acc.rank,
        heroesCount: acc.heroesCount,
        skinsCount: acc.skinsCount,
        rareSkinName: acc.rareSkins?.[0]?.name,
        credentials: acc.credentials,
        description: acc.description
      }
    };

    setMysteryRewards(prev => [...prev, newReward]);
    updateAccountStatus(accountId, 'sold', 'Đã chuyển vào kho quà Túi Mù may mắn');

    try {
      await setDoc(doc(db, 'mystery_rewards', newReward.id), cleanForFirestore(newReward));
    } catch (e) {
      console.warn('Firestore reward save notice:', e);
    }

    return {
      success: true,
      message: `Đã nhập Acc #${acc.code} vào kho quà của "${targetTierId}" thành công!`
    };
  };

  const adminToggleMysteryBoxEvent = async (active: boolean): Promise<{ success: boolean; message: string }> => {
    try {
      setIsMysteryBoxEventActive(active);
      await setDoc(doc(db, 'site_settings', 'mystery_box_config'), { isEventActive: active }, { merge: true });
      return {
        success: true,
        message: active
          ? 'Đã BẬT toàn bộ chương trình Xé Túi Mù May Mắn thành công!'
          : 'Đã TẮT toàn bộ chương trình Xé Túi Mù May Mắn thành công!'
      };
    } catch (err) {
      console.error('Error toggling mystery box event:', err);
      return { success: false, message: 'Lỗi khi cập nhật trạng thái chương trình Túi Mù!' };
    }
  };

  const adminToggleTierActive = async (tierId: string, isActive: boolean): Promise<{ success: boolean; message: string }> => {
    return adminUpdateBoxTier(tierId, { isActive });
  };

  const adminResetMysteryBoxes = async (): Promise<{ success: boolean; message: string }> => {
    try {
      setMysteryBoxes(DEFAULT_MYSTERY_BOX_TIERS);
      for (const box of DEFAULT_MYSTERY_BOX_TIERS) {
        await setDoc(doc(db, 'mystery_boxes', box.id), cleanForFirestore(box));
      }
      setMysteryRewards(DEFAULT_MYSTERY_BOX_REWARDS);
      for (const rew of DEFAULT_MYSTERY_BOX_REWARDS) {
        await setDoc(doc(db, 'mystery_rewards', rew.id), cleanForFirestore(rew));
      }
      return { success: true, message: 'Đã khôi phục 4 hạng Túi Mù & toàn bộ kho quà chuẩn lên Firestore thành công!' };
    } catch (err) {
      console.error('Error resetting mystery boxes:', err);
      return { success: false, message: 'Lỗi khi khôi phục 4 hạng Túi Mù!' };
    }
  };

  // Seed Sample Demo Data directly into Firebase
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
        message: 'Đã nạp toàn bộ danh mục tài khoản mẫu và người dùng demo vào Firebase Firestore thành công!'
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
