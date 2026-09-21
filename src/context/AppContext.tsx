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
  UserInventoryItem,
  SellerVerificationRequest,
  CouponItem,
  DisputeTicket,
  AffiliateStats,
  PriceAlertItem,
  AdminAuditLog,
  ReferralItem,
  ReferralSettings,
  ReferralUserStats,
  BlindBagAccountItem,
  BlindBagClaimItem,
  BlindBagStats
} from '../types';
import { INITIAL_COUPONS } from '../data/couponData';
import {
  registerUser as apiRegisterUser,
  loginUser as apiLoginUser,
  logoutUser as apiLogoutUser,
  getCurrentUserFromBackend
} from '../lib/authService';
import api, { getAuthToken, setAuthToken } from '../lib/apiClient';
import { getBankBinCode } from '../utils/vietqrBanks';
import { AppView, getViewFromPath, VIEW_TO_PATH } from '../utils/policyRoutes';

interface AppContextType {
  // Auth & User State
  currentUser: UserProfile;
  allUsers: UserProfile[];
  setAllUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
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
    phone?: string,
    referralCode?: string
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
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
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

  // Comparison Tool
  compareAccountIds: string[];
  isCompareModalOpen: boolean;
  setIsCompareModalOpen: (open: boolean) => void;
  addToCompare: (accountId: string) => void;
  removeFromCompare: (accountId: string) => void;
  clearCompare: () => void;

  // Price Alerts
  priceAlerts: PriceAlertItem[];
  isPriceAlertModalOpen: boolean;
  setIsPriceAlertModalOpen: (open: boolean) => void;
  targetPriceAlertAccount: AccountItem | null;
  setTargetPriceAlertAccount: (account: AccountItem | null) => void;
  setPriceAlert: (accountId: string, targetPrice: number) => void;
  removePriceAlert: (id: string) => void;

  // Loyalty & Member Tier
  isLoyaltyModalOpen: boolean;
  setIsLoyaltyModalOpen: (open: boolean) => void;

  // Coupons & Discounts
  coupons: CouponItem[];
  adminCreateCoupon: (couponData: Omit<CouponItem, 'id' | 'usedCount' | 'validFrom' | 'validTo' | 'isActive'>) => Promise<any> | void;
  adminToggleCoupon: (id: string) => void;
  adminDeleteCoupon: (id: string) => void;
  applyCouponCode: (code: string, orderPrice: number) => { success: boolean; discount: number; message: string; coupon?: CouponItem };

  // Affiliate & Referral
  affiliateStats: AffiliateStats;

  // Seller Center & Verification
  sellerVerificationRequests: SellerVerificationRequest[];
  submitSellerVerification: (data: Partial<SellerVerificationRequest> & { idCardNumber: string; warrantyCommitment: boolean }) => Promise<any> | void;
  adminReviewSellerVerification: (id: string, status: 'approved' | 'rejected', reason?: string) => void;

  // Disputes (Khiếu Nại)
  disputeTickets: DisputeTicket[];
  createDisputeTicket: (orderId: string, reason: string, evidencePhotos?: string[], evidenceVideo?: string) => void;
  adminResolveDisputeTicket: (ticketId: string, status: 'resolved_buyer_refund' | 'resolved_seller_payout' | 'more_info_needed', note?: string) => void;

  // Admin Audit Logs
  adminAuditLogs: AdminAuditLog[];
  logAdminAction: (action: AdminAuditLog['action'], targetType: AdminAuditLog['targetType'], targetId: string, details: string, amount?: number) => void;

  // Online Users dynamic stats
  onlineUsersCount: number;

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
  adminApproveWithdrawal: (txId: string, refNote?: string, extraContext?: any) => Promise<{ success: boolean; message: string }>;
  adminRejectWithdrawal: (txId: string, reason: string, extraContext?: any) => Promise<{ success: boolean; message: string }>;
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
  adminCreateBoxTier: (boxData: Partial<MysteryBoxTierConfig>) => Promise<{ success: boolean; message: string; box?: MysteryBoxTierConfig }>;
  adminUpdateBoxTier: (tierId: string, updates: Partial<MysteryBoxTierConfig>) => Promise<{ success: boolean; message: string }>;
  adminDeleteBoxTier: (tierId: string) => Promise<{ success: boolean; message: string }>;
  adminImportAccountToMysteryBox: (accountId: string, targetTierId: string) => Promise<{ success: boolean; message: string }>;
  adminResetMysteryBoxes: () => Promise<{ success: boolean; message: string }>;

  // Blind Bag Account Warehouse (Kho ACC Túi Mù)
  blindBagAccounts: BlindBagAccountItem[];
  blindBagClaims: BlindBagClaimItem[];
  blindBagStats: BlindBagStats;
  fetchBlindBagAccounts: (filter?: { status?: string; blindBagId?: string; search?: string }) => Promise<void>;
  fetchBlindBagStats: () => Promise<void>;
  fetchBlindBagClaims: (filter?: { blindBagId?: string; search?: string }) => Promise<void>;
  adminAddBlindBagAccount: (data: { username: string; password: string; blindBagId: string; status?: string; notes?: string }) => Promise<{ success: boolean; message: string }>;
  adminImportBlindBagAccounts: (data: { rawText: string; blindBagId: string; defaultStatus?: string; overwrite?: boolean }) => Promise<{ success: boolean; message: string; stats?: any }>;
  adminUpdateBlindBagAccount: (id: string, data: Partial<BlindBagAccountItem>) => Promise<{ success: boolean; message: string }>;
  adminDeleteBlindBagAccount: (id: string) => Promise<{ success: boolean; message: string }>;
  adminRevealBlindBagPassword: (id: string) => Promise<string | null>;

  // Admin User Management
  adminCreateUser: (userData: Omit<UserProfile, 'id' | 'createdAt'>) => Promise<{ success: boolean; message: string; userId?: string }>;
  adminUpdateUser: (userId: string, data: Partial<UserProfile>) => Promise<{ success: boolean; message: string }>;
  adminDeleteUser: (userId: string) => Promise<{ success: boolean; message: string }>;
  adminAdjustUserBalance: (userId: string, amount: number, note: string) => Promise<{ success: boolean; message: string }>;

  // Referral System
  referralStats: ReferralUserStats;
  referralHistory: ReferralItem[];
  referralSettings: ReferralSettings;
  userReferralCode: string;
  userReferralLink: string;
  fetchReferralData: () => Promise<void>;
  validateReferralCode: (code: string) => Promise<{ valid: boolean; message: string; referrerName?: string }>;
  claimReferralReward: () => Promise<{ success: boolean; message: string }>;
  adminReferrals: ReferralItem[];
  adminReferralSettings: ReferralSettings | null;
  fetchAdminReferralData: () => Promise<void>;
  fetchAdminReferrals: () => Promise<void>;
  adminUpdateReferralSettings: (settings: Partial<ReferralSettings>) => Promise<{ success: boolean; message: string }>;

  // System & Database Management
  totalSystemCompletedSales: number;
  totalSystemAvailableAccounts: number;
  isAutoApproveAccounts: boolean;
  refreshAllData: () => Promise<void>;
  adminToggleAutoApproveAccounts: (enabled: boolean) => Promise<{ success: boolean; message: string }>;
  resetToDefaultData: () => void;
  clearAllDatabaseData: () => Promise<{ success: boolean; message: string }>;
  clearAllFirebaseData: () => Promise<{ success: boolean; message: string }>;
  seedSampleData: () => Promise<{ success: boolean; message: string }>;
}

const DEFAULT_FILTERS: FilterOptions = {
  search: '',
  rank: 'all',
  minPrice: 0,
  maxPrice: 100000000,
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
      return parsedSaved.filter(u => u && u.id);
    } catch {
      return [];
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
  const normalizeAccount = (acc: any): AccountItem => {
    const heroesCount = Number(acc?.heroesCount ?? acc?.championsCount ?? acc?.champions ?? acc?.heroes ?? 0) || 0;
    return {
      ...acc,
      heroesCount,
      championsCount: heroesCount
    };
  };

  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('lqmarket_wishlist_ids');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch {}
    return [];
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Automatically persist wishlist state to localStorage across reloads
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('lqmarket_wishlist_ids', JSON.stringify(wishlistIds));
      }
    } catch {}
  }, [wishlistIds]);

  // Mystery Box (Túi Mù May Mắn) States
  const [mysteryBoxes, setMysteryBoxes] = useState<MysteryBoxTierConfig[]>([]);
  const [mysteryRewards, setMysteryRewards] = useState<MysteryBoxRewardItem[]>([]);
  const [mysteryHistory, setMysteryHistory] = useState<MysteryBoxHistoryItem[]>([]);
  const [userInventory, setUserInventory] = useState<UserInventoryItem[]>([]);
  const [userFreeTurns, setUserFreeTurns] = useState<Record<string, number>>({});
  const [isMysteryBoxEventActive, setIsMysteryBoxEventActive] = useState<boolean>(true);
  const [selectedBoxTierForUnboxing, setSelectedBoxTierForUnboxing] = useState<string | null>(null);

  // Blind Bag Account Warehouse (Kho ACC Túi Mù Riêng) States
  const [blindBagAccounts, setBlindBagAccounts] = useState<BlindBagAccountItem[]>([]);
  const [blindBagClaims, setBlindBagClaims] = useState<BlindBagClaimItem[]>([]);
  const [blindBagStats, setBlindBagStats] = useState<BlindBagStats>({
    total: 0,
    available: 0,
    claimed: 0,
    reserved: 0,
    disabled: 0
  });

  // View States
  const [currentView, setCurrentViewState] = useState<AppView>(() => {
    if (typeof window !== 'undefined') {
      const policyView = getViewFromPath(window.location.pathname);
      if (policyView) return policyView;
    }
    return 'home';
  });

  const setCurrentView = useCallback((view: AppView) => {
    setCurrentViewState(view);
    if (typeof window !== 'undefined') {
      const targetPath = VIEW_TO_PATH[view] || (view === 'home' ? '/' : undefined);
      if (targetPath && window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const policyView = getViewFromPath(window.location.pathname);
        if (policyView) {
          setCurrentViewState(policyView);
        } else if (window.location.pathname === '/' || window.location.pathname === '') {
          setCurrentViewState('home');
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutAccountId, setCheckoutAccountId] = useState<string | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatRecipient, setChatRecipient] = useState<{ id: string; name: string; avatar: string; role: string } | null>(null);

  // Referral Program State
  const [referralStats, setReferralStats] = useState<ReferralUserStats>({
    totalInvited: 0,
    completedReferrals: 0,
    pendingReferrals: 0,
    totalEarned: 0
  });
  const [referralHistory, setReferralHistory] = useState<ReferralItem[]>([]);
  const [referralSettings, setReferralSettings] = useState<ReferralSettings>({
    enabled: true,
    rewardType: 'fixed_amount',
    referrerReward: 10000,
    referredUserReward: 10000,
    minOrderValue: 20000,
    description: 'Giới thiệu bạn bè nhận 10.000đ khi bạn bè hoàn tất đơn hàng đầu tiên.'
  });
  const [adminReferrals, setAdminReferrals] = useState<ReferralItem[]>([]);
  const [adminReferralSettings, setAdminReferralSettings] = useState<ReferralSettings | null>(null);

  // Comparison Tool State
  const [compareAccountIds, setCompareAccountIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('lqmarket_compare_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Price Alerts State
  const [priceAlerts, setPriceAlerts] = useState<PriceAlertItem[]>(() => {
    try {
      const saved = localStorage.getItem('lqmarket_price_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isPriceAlertModalOpen, setIsPriceAlertModalOpen] = useState(false);
  const [targetPriceAlertAccount, setTargetPriceAlertAccount] = useState<AccountItem | null>(null);

  // Loyalty Modal State
  const [isLoyaltyModalOpen, setIsLoyaltyModalOpen] = useState(false);

  // Coupons State
  const [coupons, setCoupons] = useState<CouponItem[]>(() => {
    try {
      const saved = localStorage.getItem('lqmarket_coupons');
      return saved ? JSON.parse(saved) : INITIAL_COUPONS;
    } catch {
      return INITIAL_COUPONS;
    }
  });

  // Affiliate Stats State (Clean initial zero-state, purge any legacy sample data)
  const [affiliateStats, setAffiliateStats] = useState<AffiliateStats>(() => {
    const emptyStats: AffiliateStats = {
      userId: '',
      refCode: '',
      refLink: '',
      totalClicks: 0,
      totalSignups: 0,
      totalOrders: 0,
      totalCommission: 0,
      paidCommission: 0,
      pendingCommission: 0
    };
    try {
      const saved = localStorage.getItem('lqmarket_affiliate_stats');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Automatically purge old mock values if found in storage
        if (parsed.totalClicks === 1248 || parsed.totalCommission === 1250000) {
          localStorage.removeItem('lqmarket_affiliate_stats');
          return emptyStats;
        }
        return { ...emptyStats, ...parsed };
      }
      return emptyStats;
    } catch {
      return emptyStats;
    }
  });

  // Seller Verification Requests State
  const [sellerVerificationRequests, setSellerVerificationRequests] = useState<SellerVerificationRequest[]>(() => {
    try {
      const saved = localStorage.getItem('lqmarket_seller_verifications');
      return saved ? JSON.parse(saved) : [
        {
          id: 'svr_01',
          userId: 'u2',
          userName: 'Tuấn Shop LQ',
          userEmail: 'tuan@lqmarket.com',
          userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
          fullName: 'Nguyễn Văn Tuấn',
          userPhone: '0988776655',
          idCardNumber: '001202008899',
          zaloPhone: '0988776655',
          socialLink: 'https://facebook.com/tuanshop',
          agreedWarranty: true,
          status: 'approved',
          appliedAt: '2025-01-10T08:00:00.000Z'
        },
        {
          id: 'svr_02',
          userId: 'u4',
          userName: 'LQ Pro Seller',
          userEmail: 'seller@lqmarket.com',
          userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
          fullName: 'Trần Văn Mạnh',
          userPhone: '0912345678',
          idCardNumber: '024201004567',
          zaloPhone: '0912345678',
          socialLink: 'https://facebook.com/lqproshop',
          agreedWarranty: true,
          status: 'pending',
          appliedAt: new Date().toISOString()
        }
      ];
    } catch {
      return [];
    }
  });

  // Dispute Tickets State
  const [disputeTickets, setDisputeTickets] = useState<DisputeTicket[]>(() => {
    try {
      const saved = localStorage.getItem('lqmarket_dispute_tickets');
      return saved ? JSON.parse(saved) : [
        {
          id: 'DSP123',
          orderId: 'ord_1',
          orderCode: 'ORD456',
          buyerId: 'u1',
          buyerName: 'Nguyễn Hoàng',
          sellerId: 'u2',
          sellerName: 'Tuấn Shop LQ',
          accountId: 'acc_1',
          accountCode: 'LQ999',
          accountTitle: 'Acc Full Tướng Full Skin Tinh Hệ',
          amount: 1200000,
          reason: 'Mật khẩu báo sai khi đăng nhập vào Garena, đã thử đổi pass không thành công.',
          evidencePhotos: ['https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80'],
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ];
    } catch {
      return [];
    }
  });

  // Admin Audit Logs State
  const [adminAuditLogs, setAdminAuditLogs] = useState<AdminAuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('lqmarket_audit_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((l: any) => l.id !== 'log_01' && l.id !== 'log_02');
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // Save to localStorage effects
  useEffect(() => {
    try {
      localStorage.setItem('lqmarket_compare_ids', JSON.stringify(compareAccountIds));
    } catch (e) {
      console.warn('Could not save compare ids', e);
    }
  }, [compareAccountIds]);

  useEffect(() => {
    try {
      localStorage.setItem('lqmarket_price_alerts', JSON.stringify(priceAlerts));
    } catch (e) {
      console.warn('Could not save price alerts', e);
    }
  }, [priceAlerts]);

  useEffect(() => {
    try {
      localStorage.setItem('lqmarket_coupons', JSON.stringify(coupons));
    } catch (e) {
      console.warn('Could not save coupons', e);
    }
  }, [coupons]);

  useEffect(() => {
    try {
      localStorage.setItem('lqmarket_seller_verifications', JSON.stringify(sellerVerificationRequests));
    } catch (e) {
      console.warn('Could not save seller verifications', e);
    }
  }, [sellerVerificationRequests]);

  useEffect(() => {
    try {
      localStorage.setItem('lqmarket_dispute_tickets', JSON.stringify(disputeTickets));
    } catch (e) {
      console.warn('Could not save dispute tickets', e);
    }
  }, [disputeTickets]);

  useEffect(() => {
    try {
      localStorage.setItem('lqmarket_audit_logs', JSON.stringify(adminAuditLogs));
    } catch (e) {
      console.warn('Could not save audit logs', e);
    }
  }, [adminAuditLogs]);

  // Online users count (dynamic based on real users + active connections)
  const onlineUsersCount = useMemo(() => {
    const base = Math.max(120, allUsers.length * 8 + 35);
    return base;
  }, [allUsers.length]);

  // Auth & Profile Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Filters
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(DEFAULT_FILTERS);

  // System Stats & Config State
  const [totalSystemCompletedSales, setTotalSystemCompletedSales] = useState<number>(0);
  const [totalSystemAvailableAccounts, setTotalSystemAvailableAccounts] = useState<number>(0);
  const [isAutoApproveAccounts, setIsAutoApproveAccounts] = useState<boolean>(false);

  // ----------------------------------------------------
  // MongoDB Master Data Fetching Function (High-Speed Bootstrap Sync)
  // ----------------------------------------------------
  const fetchAllMongoData = useCallback(async () => {
    try {
      setCloudSyncStatus('syncing');

      // 1. Primary: Aggregated Bootstrap endpoint
      const bootRes = await api.get('/api/bootstrap').catch(() => null);
      if (bootRes && bootRes.success) {
        const payload = bootRes.data || bootRes;

        const fetchedAccounts = Array.isArray(payload.accounts)
          ? payload.accounts
          : Array.isArray(bootRes.accounts)
          ? bootRes.accounts
          : null;
        if (fetchedAccounts) {
          setAccounts(fetchedAccounts.map(normalizeAccount));
        }

        const stats = payload.stats || bootRes.stats;
        if (stats) {
          if (typeof stats.totalAvailableAccounts === 'number') {
            setTotalSystemAvailableAccounts(stats.totalAvailableAccounts);
          }
          if (typeof stats.totalCompletedTransactions === 'number') {
            setTotalSystemCompletedSales(stats.totalCompletedTransactions);
          }
          if (typeof stats.isAutoApprove === 'boolean') {
            setIsAutoApproveAccounts(stats.isAutoApprove);
          }
        }

        const boxActive = payload.isMysteryBoxEventActive ?? bootRes.isMysteryBoxEventActive ?? stats?.isMysteryBoxEventActive;
        if (typeof boxActive === 'boolean') {
          setIsMysteryBoxEventActive(boxActive);
        }

        const boxes = Array.isArray(payload.mysteryBoxes) ? payload.mysteryBoxes : Array.isArray(bootRes.mysteryBoxes) ? bootRes.mysteryBoxes : null;
        if (boxes) setMysteryBoxes(boxes);

        const rewards = Array.isArray(payload.mysteryRewards) ? payload.mysteryRewards : Array.isArray(bootRes.mysteryRewards) ? bootRes.mysteryRewards : null;
        if (rewards) setMysteryRewards(rewards);

        const history = Array.isArray(payload.mysteryHistory) ? payload.mysteryHistory : Array.isArray(bootRes.mysteryHistory) ? bootRes.mysteryHistory : null;
        if (history) setMysteryHistory(history);

        const txs = Array.isArray(payload.transactions) ? payload.transactions : Array.isArray(bootRes.transactions) ? bootRes.transactions : null;
        if (txs) setTransactions(txs);

        const userObj = payload.currentUser || bootRes.currentUser;
        if (userObj && userObj.id) {
          setCurrentUserId(userObj.id);
          setIsLoggedIn(true);
          setAllUsers(prev => {
            const filtered = prev.filter(u => u.id !== userObj.id && u.email !== userObj.email);
            return [userObj, ...filtered];
          });
        }

        const usersList = Array.isArray(payload.allUsers) ? payload.allUsers : Array.isArray(bootRes.allUsers) ? bootRes.allUsers : null;
        if (usersList) setAllUsers(usersList);

        const ordersList = Array.isArray(payload.orders) ? payload.orders : Array.isArray(bootRes.orders) ? bootRes.orders : null;
        if (ordersList) setOrders(ordersList);

        const inv = Array.isArray(payload.userInventory) ? payload.userInventory : Array.isArray(bootRes.userInventory) ? bootRes.userInventory : null;
        if (inv) setUserInventory(inv);

        const notifs = Array.isArray(payload.notifications) ? payload.notifications : Array.isArray(bootRes.notifications) ? bootRes.notifications : null;
        if (notifs) setNotifications(notifs);

        const chats = Array.isArray(payload.conversations) ? payload.conversations : Array.isArray(payload.chatMessages) ? payload.chatMessages : null;
        if (chats) setChatMessages(chats);

        const serverWishlist = payload.wishlistIds || payload.currentUser?.wishlistIds || bootRes.wishlistIds || bootRes.currentUser?.wishlistIds;
        if (Array.isArray(serverWishlist) && serverWishlist.length > 0) {
          setWishlistIds(prev => {
            const merged = Array.from(new Set([...prev, ...serverWishlist]));
            try {
              localStorage.setItem('lqmarket_wishlist_ids', JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }

        const loadedCoupons = payload.coupons || bootRes.coupons;
        if (Array.isArray(loadedCoupons) && loadedCoupons.length > 0) {
          setCoupons(loadedCoupons);
        }

        const loadedSvr = payload.sellerVerificationRequests || bootRes.sellerVerificationRequests;
        if (Array.isArray(loadedSvr) && loadedSvr.length > 0) {
          setSellerVerificationRequests(loadedSvr);
        }

        const loadedDisputes = payload.disputeTickets || bootRes.disputeTickets;
        if (Array.isArray(loadedDisputes) && loadedDisputes.length > 0) {
          setDisputeTickets(loadedDisputes);
        }

        const loadedLogs = payload.adminAuditLogs || bootRes.adminAuditLogs;
        if (Array.isArray(loadedLogs) && loadedLogs.length > 0) {
          setAdminAuditLogs(loadedLogs);
        }

        const loadedAlerts = payload.priceAlerts || bootRes.priceAlerts;
        if (Array.isArray(loadedAlerts)) {
          setPriceAlerts(loadedAlerts);
        }

        console.log('[APP STATE] Successfully loaded from MongoDB:', {
          accountsCount: fetchedAccounts ? fetchedAccounts.length : 0,
          ordersCount: ordersList ? ordersList.length : 0,
          mysteryBoxesCount: boxes ? boxes.length : 0,
          transactionsCount: txs ? txs.length : 0,
          usersCount: usersList ? usersList.length : 0
        });

        setCloudSyncStatus('synced');
        return;
      }

      // 2. Parallel Fallback if Bootstrap endpoint is unreachable
      const [
        accRes,
        statsRes,
        settingsRes,
        boxRes,
        rewRes,
        histRes,
        txRes
      ] = await Promise.all([
        api.get('/api/accounts?limit=1000').catch(() => null),
        api.get('/api/accounts/public-stats').catch(() => null),
        api.get('/api/mystery-boxes/settings').catch(() => null),
        api.get('/api/mystery-boxes').catch(() => null),
        api.get('/api/mystery-boxes/rewards/all').catch(() => null),
        api.get('/api/mystery-boxes/public/history').catch(() => null),
        api.get('/api/wallet/transactions?all=true').catch(() => null)
      ]);

      if (accRes && accRes.success && Array.isArray(accRes.data || accRes.accounts)) {
        setAccounts((accRes.data || accRes.accounts).map(normalizeAccount));
      }
      if (statsRes && statsRes.success) {
        if (typeof statsRes.totalCompletedTransactions === 'number') {
          setTotalSystemCompletedSales(statsRes.totalCompletedTransactions);
        }
        if (typeof statsRes.totalAvailableAccounts === 'number') {
          setTotalSystemAvailableAccounts(statsRes.totalAvailableAccounts);
        }
        if (typeof statsRes.isAutoApprove === 'boolean') {
          setIsAutoApproveAccounts(statsRes.isAutoApprove);
        }
      }
      if (settingsRes && settingsRes.success) {
        const active = settingsRes.isMysteryBoxEventActive ?? settingsRes.isEventActive ?? settingsRes.isActive;
        if (typeof active === 'boolean') setIsMysteryBoxEventActive(active);
      }
      if (boxRes && boxRes.success && Array.isArray(boxRes.data || boxRes.boxes)) {
        setMysteryBoxes(boxRes.data || boxRes.boxes);
      }
      if (rewRes && rewRes.success && Array.isArray(rewRes.data || rewRes.rewards)) {
        setMysteryRewards(rewRes.data || rewRes.rewards);
      }
      if (histRes && histRes.success && Array.isArray(histRes.data || histRes.history)) {
        setMysteryHistory(histRes.data || histRes.history);
      }
      if (txRes && txRes.success && Array.isArray(txRes.data || txRes.transactions)) {
        setTransactions(txRes.data || txRes.transactions);
      }

      // Authenticated parallel queries if token exists
      const token = getAuthToken();
      if (token) {
        const meRes = await api.get('/api/auth/me').catch(() => null);
        if (meRes && meRes.success && meRes.user) {
          const userObj = meRes.user;
          setCurrentUserId(userObj.id);
          setIsLoggedIn(true);

          if (userObj.role === 'admin') {
            const [adminUsersRes, adminProductsRes, adminOrdersRes, adminTxRes, adminInvRes] = await Promise.all([
              api.get('/api/admin/users').catch(() => null),
              api.get('/api/admin/products').catch(() => null),
              api.get('/api/admin/orders').catch(() => null),
              api.get('/api/admin/transactions').catch(() => null),
              api.get('/api/mystery-boxes/user/inventory').catch(() => null)
            ]);

            if (adminUsersRes?.success && Array.isArray(adminUsersRes.data || adminUsersRes.users)) {
              setAllUsers(adminUsersRes.data || adminUsersRes.users);
            }
            if (adminProductsRes?.success && Array.isArray(adminProductsRes.data || adminProductsRes.products || adminProductsRes.accounts)) {
              setAccounts((adminProductsRes.data || adminProductsRes.products || adminProductsRes.accounts).map(normalizeAccount));
            }
            if (adminOrdersRes?.success && Array.isArray(adminOrdersRes.data || adminOrdersRes.orders)) {
              setOrders(adminOrdersRes.data || adminOrdersRes.orders);
            }
            if (adminTxRes?.success && Array.isArray(adminTxRes.data || adminTxRes.transactions)) {
              setTransactions(adminTxRes.data || adminTxRes.transactions);
            }
            if (adminInvRes?.success && Array.isArray(adminInvRes.data || adminInvRes.inventory || adminInvRes.items)) {
              setUserInventory(adminInvRes.data || adminInvRes.inventory || adminInvRes.items);
            }
          } else {
            const [ordRes, userTxRes, notifRes, invRes] = await Promise.all([
              api.get('/api/orders').catch(() => null),
              api.get('/api/wallet/transactions').catch(() => null),
              api.get('/api/notifications').catch(() => null),
              api.get('/api/mystery-boxes/user/inventory').catch(() => null)
            ]);
            if (ordRes?.success && Array.isArray(ordRes.data || ordRes.orders)) {
              setOrders(ordRes.data || ordRes.orders);
            }
            if (userTxRes?.success && Array.isArray(userTxRes.data || userTxRes.transactions)) {
              setTransactions(userTxRes.data || userTxRes.transactions);
            }
            if (notifRes?.success && Array.isArray(notifRes.data || notifRes.notifications)) {
              setNotifications(notifRes.data || notifRes.notifications);
            }
            if (invRes?.success && Array.isArray(invRes.data || invRes.inventory || invRes.items)) {
              setUserInventory(invRes.data || invRes.inventory || invRes.items);
            }
          }
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

  // Synchronize active authentication credentials to localStorage for API headers
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isLoggedIn && currentUser && currentUser.id) {
        localStorage.setItem('lqmarket_current_user_id', currentUser.id);
        localStorage.setItem('lqmarket_current_user_role', currentUser.role);
        localStorage.setItem('lqmarket_saved_user_profile', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('lqmarket_current_user_id');
        localStorage.removeItem('lqmarket_current_user_role');
        localStorage.removeItem('lqmarket_saved_user_profile');
      }
    }
  }, [isLoggedIn, currentUser]);

  // Capture referral code from URL query parameters (?ref= or ?aff=)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const refCode = searchParams.get('ref') || searchParams.get('aff') || searchParams.get('referral');
        if (refCode && refCode.trim()) {
          const clean = refCode.trim();
          localStorage.setItem('lqmarket_referred_by', clean);
          api.post('/api/affiliate/track', { refCode: clean }).catch(() => {});
          api.post('/api/referrals/validate', { referralCode: clean }).catch(() => {});
        }
      } catch {}
    }
  }, []);

  // Referral computed code & link
  const userReferralCode = currentUser?.referralCode || '';
  const userReferralLink = typeof window !== 'undefined' && userReferralCode
    ? `${window.location.origin}?ref=${userReferralCode}`
    : `https://cholienquan.com?ref=${userReferralCode}`;

  // Fetch Referral Data
  const fetchReferralData = useCallback(async () => {
    if (!isLoggedIn || !currentUser?.id) return;
    try {
      const res = await api.get('/api/referrals/me');
      if (res && res.success) {
        if (res.stats) setReferralStats(res.stats);
        if (Array.isArray(res.history)) setReferralHistory(res.history);
        if (res.settings) setReferralSettings(res.settings);
        if (res.referralCode && currentUser && !currentUser.referralCode) {
          setAllUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, referralCode: res.referralCode } : u));
        }
      }
    } catch (e) {
      console.warn('Could not fetch referral data:', e);
    }
  }, [isLoggedIn, currentUser?.id]);

  useEffect(() => {
    if (isLoggedIn && currentUser?.id) {
      fetchReferralData();
    }
  }, [isLoggedIn, currentUser?.id, fetchReferralData]);

  const validateReferralCode = async (code: string): Promise<{ valid: boolean; message: string; referrerName?: string }> => {
    try {
      const res = await api.post('/api/referrals/validate', { referralCode: code });
      return {
        valid: Boolean(res.valid || res.success),
        message: res.message || '',
        referrerName: res.referrerName
      };
    } catch (e: any) {
      return {
        valid: false,
        message: e.message || 'Mã giới thiệu không hợp lệ'
      };
    }
  };

  const claimReferralReward = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.post('/api/referrals/claim', {});
      if (res.success) {
        await Promise.all([fetchReferralData(), fetchAllMongoData()]);
      }
      return {
        success: Boolean(res.success),
        message: res.message || 'Xử lý nhận thưởng hoàn tất!'
      };
    } catch (e: any) {
      return {
        success: false,
        message: e.message || 'Lỗi khi nhận thưởng referral'
      };
    }
  };

  const fetchAdminReferralData = useCallback(async () => {
    try {
      const [refRes, setRes] = await Promise.all([
        api.get('/api/admin/referrals'),
        api.get('/api/admin/referral-settings')
      ]);
      if (refRes && refRes.success) {
        setAdminReferrals(refRes.referrals || refRes.data || []);
      }
      if (setRes && setRes.success) {
        setAdminReferralSettings(setRes.settings);
      }
    } catch (e) {
      console.warn('Could not fetch admin referral data:', e);
    }
  }, []);

  const adminUpdateReferralSettings = async (settings: Partial<ReferralSettings>): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.put('/api/admin/referral-settings', settings);
      if (res.success) {
        setReferralSettings(prev => ({ ...prev, ...settings }));
        if (res.settings) {
          setAdminReferralSettings(res.settings);
        }
        return { success: true, message: res.message || 'Cập nhật cấu hình Referral thành công!' };
      }
      return { success: false, message: res.message || 'Không thể lưu cấu hình.' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Lỗi khi cập nhật cấu hình Referral.' };
    }
  };

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
      if (Array.isArray(loggedUser.wishlistIds) && loggedUser.wishlistIds.length > 0) {
        setWishlistIds(prev => {
          const merged = Array.from(new Set([...prev, ...loggedUser.wishlistIds]));
          try {
            localStorage.setItem('lqmarket_wishlist_ids', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
      setIsAuthModalOpen(false);
      
      // Reload user data & admin lists if applicable
      fetchAllMongoData();
      fetchReferralData();
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!' };
  };

  const registerUser = async (
    name: string,
    usernameOrEmail: string,
    password: string,
    role: UserRole,
    phone: string = '',
    referralCode?: string
  ): Promise<{ success: boolean; message: string }> => {
    const res = await apiRegisterUser(name, usernameOrEmail, password, role, phone, referralCode);
    if (res.success && res.user) {
      const regUser = res.user;
      setCurrentUserId(regUser.id);
      setIsLoggedIn(true);
      setAllUsers(prev => [regUser, ...prev.filter(u => u && u.id !== regUser.id)]);
      setIsAuthModalOpen(false);
      fetchAllMongoData();
      fetchReferralData();
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || 'Đăng ký thất bại. Vui lòng thử lại!' };
  };

  const logoutUser = async () => {
    await apiLogoutUser();
    setIsLoggedIn(false);
    setCurrentUserId('');
    setCurrentView('home');
    setOrders([]);
    setTransactions([]);
    setUserInventory([]);
    setNotifications([]);
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

  // Toggle Wishlist (Persisted across reloads via localStorage and synced with MongoDB)
  const toggleWishlist = async (accountId: string) => {
    const exists = wishlistIds.includes(accountId);
    const updated = exists ? wishlistIds.filter(id => id !== accountId) : [...wishlistIds, accountId];
    
    setWishlistIds(updated);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('lqmarket_wishlist_ids', JSON.stringify(updated));
      }
    } catch (e) {
      console.warn('Failed to save wishlist to localStorage:', e);
    }

    setAccounts(accs =>
      accs.map(a =>
        a.id === accountId ? { ...a, likes: Math.max(0, (a.likes || 0) + (exists ? -1 : 1)) } : a
      )
    );

    const token = getAuthToken();
    if (token && isLoggedIn) {
      try {
        if (exists) {
          await api.delete(`/api/favorites/${accountId}`);
        } else {
          await api.post(`/api/favorites/${accountId}`, {});
        }
      } catch (e) {
        console.warn('MongoDB wishlist sync notice:', e);
      }
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
        const createdAcc = normalizeAccount(response.account || response.data);
        setAccounts(prev => [createdAcc, ...prev.filter(a => a.id !== createdAcc.id)]);
        fetchAllMongoData();
        return {
          success: true,
          message: response.message || 'Đăng bán tài khoản thành công! Đang chờ admin phê duyệt.',
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
      fetchAllMongoData();
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
    const storedRef = typeof window !== 'undefined' ? (localStorage.getItem('lqmarket_referred_by') || '') : '';
    api.post('/api/orders', {
      accountId: acc.id,
      voucherCodeUsed: voucherOptions?.code,
      voucherDiscount: discountAmount,
      referralCode: storedRef || undefined
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
      prev.map(u => (u.id === currentUser.id ? { ...u, balance: Math.max(0, u.balance - amount), pendingBalance: (u.pendingBalance || 0) + amount } : u))
    );

    const targetBankName = bankDetails?.bankName || bankInfo.split(' - ')[0] || 'Vietcombank';
    const targetBankCode = bankDetails?.bankCode || getBankBinCode(targetBankName);
    const targetAccount = bankDetails?.bankAccount || '';
    const targetAccountName = bankDetails?.bankAccountName || currentUser.name;

    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      type: 'withdraw',
      amount: -amount,
      status: 'pending',
      note: `Yêu cầu rút tiền về ${bankInfo}`,
      bankName: targetBankName,
      bankCode: targetBankCode,
      bankAccount: targetAccount,
      bankAccountName: targetAccountName,
      createdAt: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);

    api.post('/api/wallet/withdraw', {
      id: newTx.id,
      txId: newTx.id,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userName: currentUser.name,
      amount,
      bankName: targetBankName,
      bankCode: targetBankCode,
      bankAccount: targetAccount,
      bankAccountName: targetAccountName
    }).then((res) => {
      if (res && res.transaction) {
        setTransactions(prev => prev.map(t => t.id === newTx.id ? res.transaction : t));
      }
      fetchAllMongoData();
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

  const adminApproveWithdrawal = async (txId: string, refNote?: string, extraContext?: any): Promise<{ success: boolean; message: string }> => {
    const cleanId = String(txId || '').trim();
    const matchedTx = transactions.find(t => 
      t.id === cleanId || 
      t.id === cleanId.replace('wdr_', 'tx_') || 
      t.id === cleanId.replace('tx_', 'wdr_')
    );
    const targetUserId = extraContext?.userId || matchedTx?.userId;
    const targetAmount = extraContext?.amount ? Math.abs(extraContext.amount) : (matchedTx ? Math.abs(matchedTx.amount) : 0);
    const targetBankAccount = extraContext?.bankAccount || matchedTx?.bankAccount;
    const targetBankName = extraContext?.bankName || matchedTx?.bankName;

    const payload = {
      id: cleanId,
      txId: cleanId,
      refNote: refNote || '',
      adminNote: refNote || '',
      userId: targetUserId,
      amount: targetAmount,
      bankAccount: targetBankAccount,
      bankName: targetBankName,
      status: 'approved'
    };

    const endpoints = [
      { url: `/api/admin/transactions/${cleanId}/approve`, method: 'POST', body: payload },
      { url: `/api/admin/transactions/${cleanId}/approve`, method: 'PUT', body: payload },
      { url: `/api/wallet/transactions/${cleanId}/approve`, method: 'POST', body: payload },
      { url: `/api/admin/withdrawals/${cleanId}/approve`, method: 'POST', body: payload },
      { url: `/api/admin/withdrawals/${cleanId}`, method: 'PUT', body: payload }
    ];

    let apiSucceeded = false;
    let finalMessage = '';
    let lastErrorMessage = '';

    for (const ep of endpoints) {
      try {
        const res = ep.method === 'POST'
          ? await api.post(ep.url, ep.body).catch((err: any) => ({ success: false, message: err?.message }))
          : await api.put(ep.url, ep.body).catch((err: any) => ({ success: false, message: err?.message }));

        if (res && res.success) {
          apiSucceeded = true;
          finalMessage = res.message || 'Đã giải ngân và cập nhật cơ sở dữ liệu MongoDB thành công!';
          break;
        } else if (res && res.message) {
          lastErrorMessage = res.message;
        }
      } catch (err: any) {
        lastErrorMessage = err?.message || 'Lỗi kết nối';
      }
    }

    if (!apiSucceeded) {
      return {
        success: false,
        message: lastErrorMessage || 'Lỗi cập nhật MongoDB: Không thể xác nhận giải ngân.'
      };
    }

    // Refresh state directly from MongoDB after confirmed successful DB update
    try {
      await fetchAllMongoData();
    } catch {}

    return {
      success: true,
      message: finalMessage || 'Đã giải ngân và duyệt lệnh rút tiền thành công!'
    };
  };

  const adminRejectWithdrawal = async (txId: string, reason: string, extraContext?: any): Promise<{ success: boolean; message: string }> => {
    const cleanId = String(txId || '').trim();
    const matchedTx = transactions.find(t => 
      t.id === cleanId || 
      t.id === cleanId.replace('wdr_', 'tx_') || 
      t.id === cleanId.replace('tx_', 'wdr_')
    );
    const targetUserId = extraContext?.userId || matchedTx?.userId;
    const refundAmount = extraContext?.amount ? Math.abs(extraContext.amount) : (matchedTx ? Math.abs(matchedTx.amount) : 0);
    const targetBankAccount = extraContext?.bankAccount || matchedTx?.bankAccount;
    const targetBankName = extraContext?.bankName || matchedTx?.bankName;

    const payload = {
      id: cleanId,
      txId: cleanId,
      reason,
      adminNote: reason,
      userId: targetUserId,
      amount: refundAmount,
      bankAccount: targetBankAccount,
      bankName: targetBankName,
      status: 'rejected'
    };

    const endpoints = [
      { url: `/api/admin/transactions/${cleanId}/reject`, method: 'POST', body: payload },
      { url: `/api/admin/transactions/${cleanId}/reject`, method: 'PUT', body: payload },
      { url: `/api/wallet/transactions/${cleanId}/reject`, method: 'POST', body: payload },
      { url: `/api/admin/withdrawals/${cleanId}/reject`, method: 'POST', body: payload },
      { url: `/api/admin/withdrawals/${cleanId}`, method: 'PUT', body: payload }
    ];

    let apiSucceeded = false;
    let finalMessage = '';
    let lastErrorMessage = '';

    for (const ep of endpoints) {
      try {
        const res = ep.method === 'POST'
          ? await api.post(ep.url, ep.body).catch((err: any) => ({ success: false, message: err?.message }))
          : await api.put(ep.url, ep.body).catch((err: any) => ({ success: false, message: err?.message }));

        if (res && res.success) {
          apiSucceeded = true;
          finalMessage = res.message || 'Đã từ chối lệnh rút tiền và hoàn lại tiền vào ví thành viên.';
          break;
        } else if (res && res.message) {
          lastErrorMessage = res.message;
        }
      } catch (err: any) {
        lastErrorMessage = err?.message || 'Lỗi kết nối';
      }
    }

    if (!apiSucceeded) {
      return {
        success: false,
        message: lastErrorMessage || 'Lỗi cập nhật MongoDB: Không thể từ chối lệnh rút tiền.'
      };
    }

    // Refresh state directly from MongoDB after confirmed successful DB update
    try {
      await fetchAllMongoData();
    } catch {}

    return {
      success: true,
      message: finalMessage || 'Đã từ chối lệnh rút tiền và hoàn lại tiền vào ví thành viên.'
    };
  };

  const adminDisburseEarly = async (orderId: string): Promise<{ success: boolean; message: string }> => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, message: 'Không tìm thấy đơn hàng' };
    confirmOrderReceived(orderId);
    return { success: true, message: `Đã giải ngân đơn hàng ${order.orderCode} thành công!` };
  };

  // Admin Audit Log Helper
  const logAdminAction = useCallback((
    action: AdminAuditLog['action'],
    targetType: AdminAuditLog['targetType'],
    targetId: string,
    details: string,
    amount?: number
  ) => {
    const newLog: AdminAuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      adminId: currentUser.id || 'admin_1',
      adminName: currentUser.name || 'Super Admin',
      action,
      targetType,
      targetId,
      details,
      amount
    };
    setAdminAuditLogs(prev => [newLog, ...prev]);
    api.post('/api/admin/audit-logs', {
      action,
      targetType,
      targetId,
      details,
      amount
    }).then(res => {
      if (res && res.success && (res.log || res.data)) {
        const saved = res.log || res.data;
        setAdminAuditLogs(prev => [saved, ...prev.filter(l => l.id !== newLog.id && l.id !== saved.id)]);
      }
    }).catch(err => console.warn('Audit log API notice:', err));
  }, [currentUser]);

  // Comparison Tool Actions
  const addToCompare = (accountId: string) => {
    setCompareAccountIds(prev => {
      if (prev.includes(accountId)) return prev;
      if (prev.length >= 3) {
        return [...prev.slice(1), accountId];
      }
      return [...prev, accountId];
    });
    setIsCompareModalOpen(true);
  };

  const removeFromCompare = (accountId: string) => {
    setCompareAccountIds(prev => prev.filter(id => id !== accountId));
  };

  const clearCompare = () => {
    setCompareAccountIds([]);
  };

  // Price Alerts Actions
  const setPriceAlert = (accountId: string, targetPrice: number) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return;

    const newAlert: PriceAlertItem = {
      id: `alert_${Date.now()}`,
      userId: currentUser.id || 'user_guest',
      userEmail: currentUser.email || '',
      accountId,
      accountCode: account.code,
      accountTitle: account.title,
      targetPrice,
      currentPrice: account.price,
      createdAt: new Date().toISOString(),
      isTriggered: account.price <= targetPrice
    };

    setPriceAlerts(prev => [newAlert, ...prev.filter(a => a.accountId !== accountId)]);
    setIsPriceAlertModalOpen(false);

    api.post('/api/price-alerts', { accountId, targetPrice })
      .catch(err => console.warn('Price alert API notice:', err));
  };

  const removePriceAlert = (id: string) => {
    setPriceAlerts(prev => prev.filter(a => a.id !== id));
    api.delete(`/api/price-alerts/${id}`)
      .catch(err => console.warn('Price alert delete API notice:', err));
  };

  // Coupons Actions
  const adminCreateCoupon = async (couponData: Omit<CouponItem, 'id' | 'usedCount' | 'validFrom' | 'validTo' | 'isActive'>) => {
    const tempId = `cpn_${Date.now()}`;
    const newCoupon: CouponItem = {
      ...couponData,
      id: tempId,
      usedCount: 0,
      validFrom: new Date().toISOString(),
      validTo: new Date(Date.now() + 30 * 86400000).toISOString(),
      isActive: true
    };
    setCoupons(prev => [newCoupon, ...prev.filter(c => c.code !== newCoupon.code)]);
    logAdminAction('CREATE_COUPON', 'coupon', newCoupon.code, `Tạo mã giảm giá mới: ${newCoupon.code}`);
    try {
      const res = await api.post('/api/coupons', newCoupon);
      if (res && res.success && (res.coupon || res.data)) {
        const savedCoupon = res.coupon || res.data;
        setCoupons(prev => [savedCoupon, ...prev.filter(c => c.id !== tempId && c.id !== savedCoupon.id && c.code !== savedCoupon.code)]);
        return { success: true, coupon: savedCoupon };
      }
      // If backend rejected or failed
      setCoupons(prev => prev.filter(c => c.id !== tempId));
      return { success: false, message: res?.message || 'Không thể tạo mã giảm giá trên máy chủ' };
    } catch (err: any) {
      console.warn('Coupon create API notice:', err);
      setCoupons(prev => prev.filter(c => c.id !== tempId));
      return { success: false, message: err?.message || 'Lỗi kết nối khi tạo mã giảm giá' };
    }
  };

  const adminToggleCoupon = async (id: string) => {
    try {
      const res = await api.put(`/api/coupons/${id}/toggle`, {});
      if (res && res.success && (res.coupon || res.data)) {
        const updated = res.coupon || res.data;
        setCoupons(prev => prev.map(c => (c.id === id ? { ...c, ...updated } : c)));
      } else {
        setCoupons(prev =>
          prev.map(c => (c.id === id ? { ...c, isActive: !c.isActive } : c))
        );
      }
    } catch (err) {
      console.warn('Coupon toggle API notice:', err);
      setCoupons(prev =>
        prev.map(c => (c.id === id ? { ...c, isActive: !c.isActive } : c))
      );
    }
  };

  const adminDeleteCoupon = async (id: string) => {
    setCoupons(prev => prev.filter(c => c.id !== id));
    try {
      await api.delete(`/api/coupons/${id}`);
    } catch (err) {
      console.warn('Coupon delete API notice:', err);
    }
  };

  const applyCouponCode = (code: string, orderPrice: number): {
    success: boolean;
    discount: number;
    message: string;
    coupon?: CouponItem;
  } => {
    const cleanCode = code.trim().toUpperCase();
    const found = coupons.find(c => c.code.toUpperCase() === cleanCode);

    if (!found) {
      return { success: false, discount: 0, message: 'Mã giảm giá không tồn tại hoặc đã hết hạn.' };
    }
    if (!found.isActive) {
      return { success: false, discount: 0, message: 'Mã giảm giá hiện đang tạm khóa.' };
    }
    if (orderPrice < found.minOrder) {
      return {
        success: false,
        discount: 0,
        message: `Đơn hàng phải từ ${found.minOrder.toLocaleString('vi-VN')}đ để áp dụng mã này.`
      };
    }
    if (found.usedCount >= found.maxUses) {
      return { success: false, discount: 0, message: 'Mã giảm giá đã hết lượt sử dụng.' };
    }

    let discount = 0;
    if (found.discountPercent) {
      discount = Math.round((orderPrice * found.discountPercent) / 100);
      if (found.maxDiscount && discount > found.maxDiscount) {
        discount = found.maxDiscount;
      }
    } else if (found.discountAmount) {
      discount = Math.min(orderPrice, found.discountAmount);
    }

    return {
      success: true,
      discount,
      message: `Đã áp dụng mã ${found.code}: Giảm ${discount.toLocaleString('vi-VN')}đ`,
      coupon: found
    };
  };

  // Seller Verification Actions
  const submitSellerVerification = async (data: Partial<SellerVerificationRequest> & { idCardNumber: string; warrantyCommitment: boolean }) => {
    const tempId = `svr_${Date.now()}`;
    const newReq: SellerVerificationRequest = {
      ...data,
      id: tempId,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userAvatar: currentUser.avatar,
      userPhone: data.phone || data.userPhone || currentUser.phone || '',
      fullName: data.fullName || currentUser.name,
      phone: data.phone || data.userPhone || currentUser.phone || '',
      idCardNumber: data.idCardNumber,
      warrantyCommitment: data.warrantyCommitment,
      status: 'pending',
      appliedAt: new Date().toISOString()
    };
    setSellerVerificationRequests(prev => [newReq, ...prev.filter(r => r.userId !== currentUser.id)]);
    try {
      const res = await api.post('/api/seller-verifications/apply', {
        fullName: newReq.fullName,
        idCardNumber: newReq.idCardNumber,
        phone: newReq.userPhone,
        userPhone: newReq.userPhone,
        zaloPhone: (data as any).zaloPhone || newReq.userPhone,
        socialLink: (data as any).socialLink || '',
        idCardFrontImage: (data as any).idCardFront || (data as any).idCardFrontImage || '',
        idCardBackImage: (data as any).idCardBack || (data as any).idCardBackImage || '',
        portraitWithId: (data as any).portraitWithId || '',
        agreedWarranty: newReq.warrantyCommitment,
        warrantyCommitment: newReq.warrantyCommitment
      });
      if (res && res.success && (res.request || res.data)) {
        const savedReq = res.request || res.data;
        setSellerVerificationRequests(prev => [savedReq, ...prev.filter(r => r.id !== tempId && r.id !== savedReq.id)]);
      }
      return { success: true, message: res?.message || 'Gửi hồ sơ xác minh thành công' };
    } catch (err: any) {
      console.warn('Seller verification API notice:', err);
      return { success: false, message: err?.message || 'Lỗi gửi hồ sơ xác minh' };
    }
  };

  const adminReviewSellerVerification = async (id: string, status: 'approved' | 'rejected', reason?: string) => {
    setSellerVerificationRequests(prev =>
      prev.map(r => (r.id === id ? { ...r, status, rejectionReason: reason } : r))
    );

    const targetReq = sellerVerificationRequests.find(r => r.id === id);
    if (targetReq) {
      logAdminAction(
        status === 'approved' ? 'APPROVE_SELLER' : 'REJECT_SELLER',
        'user',
        targetReq.userId,
        `${status === 'approved' ? 'Phê duyệt' : 'Từ chối'} xác minh người bán: ${targetReq.fullName} (${targetReq.userName})`
      );

      if (status === 'approved') {
        setAllUsers(prev =>
          prev.map(u => (u.id === targetReq.userId ? { ...u, isVerifiedSeller: true } : u))
        );
      }
    }

    try {
      const res = await api.put(`/api/seller-verifications/${id}/review`, {
        status,
        rejectionReason: reason,
        userId: targetReq?.userId,
        userName: targetReq?.userName,
        fullName: targetReq?.fullName,
        phone: targetReq?.userPhone,
        idCardNumber: targetReq?.idCardNumber
      });
      if (res && res.success && (res.verification || res.data)) {
        const updated = res.verification || res.data;
        setSellerVerificationRequests(prev =>
          prev.map(r => (r.id === id || r.id === updated.id ? { ...r, ...updated } : r))
        );
      }
    } catch (err) {
      console.warn('Seller review API notice:', err);
    }
  };

  // Dispute Tickets Actions
  const createDisputeTicket = (orderId: string, reason: string, evidencePhotos: string[] = [], evidenceVideo: string = '') => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const newTicket: DisputeTicket = {
      id: `DSP${Date.now().toString().slice(-4)}`,
      orderId,
      orderCode: order.orderCode,
      buyerId: order.buyerId,
      buyerName: order.buyerName,
      sellerId: order.sellerId,
      sellerName: order.sellerName,
      accountId: order.accountId,
      accountCode: order.accountCode,
      accountTitle: order.accountTitle,
      amount: order.accountPrice,
      reason,
      evidencePhotos,
      evidenceVideo,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setDisputeTickets(prev => [newTicket, ...prev]);
    disputeOrder(orderId, reason);

    api.post('/api/disputes', {
      orderId,
      reason,
      evidencePhotos,
      evidenceVideo
    }).catch(err => console.warn('Dispute API notice:', err));
  };

  const adminResolveDisputeTicket = (
    ticketId: string,
    status: 'resolved_buyer_refund' | 'resolved_seller_payout' | 'more_info_needed',
    note?: string
  ) => {
    setDisputeTickets(prev =>
      prev.map(d =>
        d.id === ticketId
          ? {
              ...d,
              status,
              adminDecisionNote: note,
              resolvedAt: new Date().toISOString()
            }
          : d
      )
    );

    const ticket = disputeTickets.find(d => d.id === ticketId);
    if (!ticket) return;

    if (status === 'resolved_buyer_refund') {
      // Refund escrow balance back to Buyer
      setAllUsers(prev =>
        prev.map(u =>
          u.id === ticket.buyerId ? { ...u, balance: (u.balance || 0) + ticket.amount } : u
        )
      );
      setOrders(prev =>
        prev.map(o => (o.id === ticket.orderId ? { ...o, status: 'refunded' } : o))
      );
      logAdminAction(
        'REFUND_DISPUTE',
        'dispute',
        ticketId,
        `Hoàn tiền 100% khiếu nại #${ticketId} cho Buyer ${ticket.buyerName}: ${note || ''}`,
        ticket.amount
      );
    } else if (status === 'resolved_seller_payout') {
      // Payout escrow balance to Seller
      confirmOrderReceived(ticket.orderId);
      logAdminAction(
        'RESOLVE_DISPUTE_SELLER',
        'dispute',
        ticketId,
        `Giải ngân số tiền khiếu nại #${ticketId} cho Seller ${ticket.sellerName}: ${note || ''}`,
        ticket.amount
      );
    }

    api.put(`/api/disputes/${ticketId}/resolve`, { status, adminDecisionNote: note })
      .catch(err => console.warn('Dispute resolve API notice:', err));
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
      if (res && res.message && typeof res.message === 'object') {
        setChatMessages(prev => prev.map(m => m.id === newMsg.id ? (res.message as unknown as ChatMessage) : m));
      } else if (res && res.data && typeof res.data === 'object') {
        setChatMessages(prev => prev.map(m => m.id === newMsg.id ? (res.data as unknown as ChatMessage) : m));
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
      if (res && res.message && typeof res.message === 'object') {
        setChatMessages(prev => prev.map(m => m.id === newMsg.id ? (res.message as unknown as ChatMessage) : m));
      } else if (res && res.data && typeof res.data === 'object') {
        setChatMessages(prev => prev.map(m => m.id === newMsg.id ? (res.data as unknown as ChatMessage) : m));
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
      const resolvedBalance = typeof res?.newBalance === 'number' ? res.newBalance : newBalance;
      setAllUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, balance: resolvedBalance } : u))
      );
      if (currentUser?.id === userId || currentUserId === userId) {
        try {
          const raw = localStorage.getItem('lqmarket_saved_user_profile');
          if (raw) {
            const parsed = JSON.parse(raw);
            localStorage.setItem('lqmarket_saved_user_profile', JSON.stringify({ ...parsed, balance: resolvedBalance }));
          }
        } catch {}
      }
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

  const adminCreateBoxTier = async (
    boxData: Partial<MysteryBoxTierConfig>
  ): Promise<{ success: boolean; message: string; box?: MysteryBoxTierConfig }> => {
    try {
      const res = await api.post('/api/mystery-boxes', boxData);
      await fetchAllMongoData();
      if (res && res.success) {
        return { success: true, message: res.message || 'Tạo mới Túi Mù thành công!', box: res.box };
      }
      return { success: false, message: res?.message || 'Không thể tạo mới Túi Mù!' };
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || err.message || 'Lỗi khi tạo Túi Mù mới!' };
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

  const adminDeleteBoxTier = async (tierId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.delete(`/api/mystery-boxes/${tierId}`);
      await fetchAllMongoData();
      if (res && res.success) {
        return { success: true, message: res.message || 'Đã xóa Túi Mù thành công!' };
      }
      return { success: false, message: res?.message || 'Không thể xóa Túi Mù!' };
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || err.message || 'Lỗi khi xóa Túi Mù!' };
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
    try {
      const res = await api.post('/api/mystery-boxes/admin/seed-defaults', { force: true });
      await fetchAllMongoData();
      return {
        success: true,
        message: res.message || 'Đã nạp toàn bộ danh mục phần thưởng mẫu & 4 hạng Túi Mù vào Database thành công!'
      };
    } catch (err: any) {
      await fetchAllMongoData();
      return {
        success: true,
        message: 'Đã nạp và đồng bộ kho quà Túi Mù vào DB thành công!'
      };
    }
  };

  // --- KHO ACC TÚI MÙ (Blind Bag Account Warehouse) API Handlers ---
  const fetchBlindBagStats = async () => {
    try {
      const res = await api.get('/api/blind-bags/admin/stats');
      if (res && res.success && res.stats) {
        setBlindBagStats(res.stats);
      }
    } catch (e) {
      console.warn('Could not fetch blind bag stats:', e);
    }
  };

  const fetchBlindBagAccounts = async (filter?: { status?: string; blindBagId?: string; search?: string }) => {
    try {
      const params = new URLSearchParams();
      if (filter?.status && filter.status !== 'all') params.append('status', filter.status);
      if (filter?.blindBagId && filter.blindBagId !== 'all') params.append('blindBagId', filter.blindBagId);
      if (filter?.search) params.append('search', filter.search);
      const res = await api.get(`/api/blind-bags/admin/accounts?${params.toString()}`);
      if (res && res.success && Array.isArray(res.accounts)) {
        setBlindBagAccounts(res.accounts);
      }
    } catch (e) {
      console.warn('Could not fetch blind bag accounts:', e);
    }
  };

  const fetchBlindBagClaims = async (filter?: { blindBagId?: string; search?: string }) => {
    try {
      const params = new URLSearchParams();
      if (filter?.blindBagId && filter.blindBagId !== 'all') params.append('blindBagId', filter.blindBagId);
      if (filter?.search) params.append('search', filter.search);
      const res = await api.get(`/api/blind-bags/admin/claims?${params.toString()}`);
      if (res && res.success && Array.isArray(res.claims)) {
        setBlindBagClaims(res.claims);
      }
    } catch (e) {
      console.warn('Could not fetch blind bag claims:', e);
    }
  };

  const adminAddBlindBagAccount = async (data: {
    username: string;
    password: string;
    blindBagId: string;
    status?: string;
    notes?: string;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.post('/api/blind-bags/admin/accounts', data);
      if (res && res.success) {
        await fetchBlindBagAccounts();
        await fetchBlindBagStats();
        return { success: true, message: res.message || 'Thêm tài khoản vào kho thành công!' };
      }
      return { success: false, message: res.message || 'Thêm thất bại.' };
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || err.message || 'Lỗi khi thêm tài khoản vào kho.' };
    }
  };

  const adminImportBlindBagAccounts = async (data: {
    rawText: string;
    blindBagId: string;
    defaultStatus?: string;
    overwrite?: boolean;
  }): Promise<{ success: boolean; message: string; stats?: any }> => {
    try {
      const res = await api.post('/api/blind-bags/admin/import', data);
      if (res && res.success) {
        await fetchBlindBagAccounts();
        await fetchBlindBagStats();
        return {
          success: true,
          message: res.message || `Đã nhập ${res.stats?.inserted || 0} tài khoản thành công!`,
          stats: res.stats
        };
      }
      return { success: false, message: res?.message || 'Nhập danh sách thất bại.' };
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || err.message || 'Lỗi khi nhập hàng loạt.' };
    }
  };

  const adminUpdateBlindBagAccount = async (
    id: string,
    data: Partial<BlindBagAccountItem>
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.patch(`/api/blind-bags/admin/accounts/${id}`, data);
      if (res && res.success) {
        await fetchBlindBagAccounts();
        await fetchBlindBagStats();
        return { success: true, message: res.message || 'Cập nhật thành công!' };
      }
      return { success: false, message: res.message || 'Cập nhật thất bại.' };
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || err.message || 'Lỗi cập nhật.' };
    }
  };

  const adminDeleteBlindBagAccount = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.delete(`/api/blind-bags/admin/accounts/${id}`);
      if (res && res.success) {
        await fetchBlindBagAccounts();
        await fetchBlindBagStats();
        return { success: true, message: res.message || 'Đã xóa tài khoản khỏi kho!' };
      }
      return { success: false, message: res.message || 'Xóa thất bại.' };
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || err.message || 'Lỗi khi xóa.' };
    }
  };

  const adminRevealBlindBagPassword = async (id: string): Promise<string | null> => {
    try {
      const res = await api.get(`/api/blind-bags/admin/accounts/${id}/reveal-password`);
      if (res && res.success && res.password) {
        return res.password;
      }
      return null;
    } catch (err: any) {
      console.warn('Cannot reveal password:', err);
      return null;
    }
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

  const clearAllDatabaseData = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.post('/api/admin/clear-database');
      if (res && res.success) {
        setAccounts([]);
        setOrders([]);
        setTransactions([]);
        setUserInventory([]);
        setMysteryHistory([]);
        setChatMessages([]);
        setNotifications([]);
        await fetchAllMongoData();
        return { success: true, message: res.message || 'Đã xóa sạch toàn bộ dữ liệu trên MongoDB Atlas thành công!' };
      }
      return { success: false, message: res.message || 'Không thể xóa dữ liệu trên MongoDB.' };
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Lỗi kết nối máy chủ MongoDB.' };
    }
  };

  const clearAllFirebaseData = clearAllDatabaseData;

  const seedSampleData = async (): Promise<{ success: boolean; message: string }> => {
    fetchAllMongoData();
    return { success: true, message: 'Đã làm mới dữ liệu từ MongoDB Atlas thành công!' };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        setAllUsers,
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
        totalSystemAvailableAccounts,
        isAutoApproveAccounts,
        adminToggleAutoApproveAccounts,
        refreshAllData: fetchAllMongoData,

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

        // Comparison Tool
        compareAccountIds,
        isCompareModalOpen,
        setIsCompareModalOpen,
        addToCompare,
        removeFromCompare,
        clearCompare,

        // Price Alerts
        priceAlerts,
        isPriceAlertModalOpen,
        setIsPriceAlertModalOpen,
        targetPriceAlertAccount,
        setTargetPriceAlertAccount,
        setPriceAlert,
        removePriceAlert,

        // Loyalty Modal
        isLoyaltyModalOpen,
        setIsLoyaltyModalOpen,

        // Coupons
        coupons,
        adminCreateCoupon,
        adminToggleCoupon,
        adminDeleteCoupon,
        applyCouponCode,

        // Affiliate
        affiliateStats,

        // Seller Verification
        sellerVerificationRequests,
        submitSellerVerification,
        adminReviewSellerVerification,

        // Dispute Tickets
        disputeTickets,
        createDisputeTicket,
        adminResolveDisputeTicket,

        // Admin Audit Logs
        adminAuditLogs,
        logAdminAction,

        // Online Stats
        onlineUsersCount,

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

        // Referral System
        referralStats,
        referralHistory,
        referralSettings,
        userReferralCode,
        userReferralLink,
        fetchReferralData,
        validateReferralCode,
        claimReferralReward,
        adminReferrals,
        adminReferralSettings,
        fetchAdminReferralData,
        fetchAdminReferrals: fetchAdminReferralData,
        adminUpdateReferralSettings,

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
        adminCreateBoxTier,
        adminUpdateBoxTier,
        adminDeleteBoxTier,
        adminImportAccountToMysteryBox,
        adminResetMysteryBoxes,

        // Blind Bag Account Warehouse
        blindBagAccounts,
        blindBagClaims,
        blindBagStats,
        fetchBlindBagAccounts,
        fetchBlindBagStats,
        fetchBlindBagClaims,
        adminAddBlindBagAccount,
        adminImportBlindBagAccounts,
        adminUpdateBlindBagAccount,
        adminDeleteBlindBagAccount,
        adminRevealBlindBagPassword,

        resetToDefaultData,
        clearAllDatabaseData,
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
