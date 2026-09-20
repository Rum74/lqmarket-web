export type RankTier =
  | 'Đồng'
  | 'Bạc'
  | 'Vàng'
  | 'Bạch Kim'
  | 'Kim Cương'
  | 'Tinh Anh'
  | 'Cao Thủ'
  | 'Chiến Tướng'
  | 'Chiến Thần'
  | 'Thách Đấu';

export type AccountStatus = 'pending' | 'approved' | 'rejected' | 'sold' | 'hidden';

export type UserRole = 'buyer' | 'seller' | 'admin';

export type OrderStatus =
  | 'pending'
  | 'delivered'
  | 'pending_payment'
  | 'escrow_hold'
  | 'account_delivered'
  | 'inspecting'
  | 'completed'
  | 'disputed'
  | 'refunded';

export type SellerTier = 'FREE' | 'BASIC' | 'STANDARD' | 'PRO' | 'VIP';

export interface RareSkin {
  name: string;
  hero: string;
  tier: 'SSS' | 'Tuyệt Sắc' | 'Siêu Việt' | 'Evo' | 'Anime' | 'Hữu Hạn' | 'Tiệc Bãi Biển' | 'Quán Quân';
  tagColor?: string;
}

export interface AccountCredentials {
  username: string;
  password: string;
  securityType: 'Trắng Thông Tin' | 'SĐT Có Thể Đổi' | 'Email Đã Đổi' | 'Facebook Đã Huỷ';
  secretNotes?: string;
  securityNote?: string;
}

export interface AccountItem {
  id: string;
  code: string; // e.g. LQ10235
  title: string;
  price: number;
  originalPrice?: number;
  rank: RankTier;
  level: number;
  heroesCount: number;
  championsCount?: number;
  skinsCount: number;
  runePages: string; // e.g. "90/90 Full Ngọc III"
  server: string; // "Việt Nam", etc.
  rareSkins: RareSkin[];
  notableHeroes: string[];
  badgeTag?: 'HOT' | 'VIP' | 'GIÁ RẺ' | 'SIÊU SKIN' | 'ACC TRẮNG TT' | 'CAO THỦ';
  images: string[];
  videoUrl?: string;
  description: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  sellerRating: number;
  sellerCompletedSales: number;
  sellerResponseTime: string;
  sellerVerified: boolean;
  status: AccountStatus;
  rejectionReason?: string;
  credentials: AccountCredentials;
  createdAt: string;
  views: number;
  likes: number;
  isFeatured?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  email: string;
  password?: string;
  phone: string;
  avatar: string;
  role: UserRole;
  balance: number;
  pendingBalance: number;
  rating: number;
  completedSales: number;
  isVerifiedSeller: boolean;
  sellerTier: SellerTier;
  memberTier?: 'Member' | 'Silver' | 'Gold' | 'Diamond' | 'VIP';
  trustScore?: number;
  verificationStatus?: 'none' | 'pending' | 'verified' | 'rejected';
  refCode?: string;
  invitedByRef?: string;
  totalSpent?: number;
  bankName?: string;
  bankAccount?: string;
  bankAccountName?: string;
  bankCode?: string;
  soldCount?: number;
  bio?: string;
  wishlistIds?: string[];
  referralCode?: string;
  referredBy?: string | null;
  referralJoinedAt?: string | null;
  referralRewardReceived?: boolean;
  createdAt: string;
}

export interface ReviewItem {
  id: string;
  orderId: string;
  sellerId: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderCode: string; // #ORD10235
  accountId: string;
  accountCode: string;
  accountTitle: string;
  accountPrice: number;
  voucherDiscount?: number;
  voucherCodeUsed?: string;
  fee: number;
  totalAmount: number;
  sellerEarnings?: number;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  status: OrderStatus;
  credentialsDelivered?: AccountCredentials;
  disputeReason?: string;
  ratingGiven?: number;
  reviewComment?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ChatMessage {
  id: string;
  orderId?: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'account' | 'wallet' | 'system';
  linkTarget?: string;
  read: boolean;
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  type: 'deposit' | 'purchase' | 'seller_payout' | 'fee' | 'refund' | 'withdraw';
  amount: number;
  status: 'success' | 'pending' | 'failed' | 'approved' | 'completed' | 'rejected' | 'cancelled';
  note: string;
  bankName?: string;
  bankCode?: string;
  bankAccount?: string;
  bankAccountName?: string;
  rejectReason?: string;
  processedAt?: string;
  createdAt: string;
}

export interface FilterOptions {
  search: string;
  rank: string; // 'all' or specific rank
  minPrice: number;
  maxPrice: number;
  minHeroes: number;
  minSkins: number;
  server: string;
  rareSkinType: string;
  securityType: string;
  badge: string;
  sortBy: 'price_asc' | 'price_desc' | 'newest' | 'most_skins' | 'most_heroes' | 'views';
}

// ----------------------------------------------------
// MYSTERY BOX (TÚI MÙ MAY MẮN) TYPES
// ----------------------------------------------------
export type MysteryBoxTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'special' | string;

export type MysteryBoxRewardType = 'account' | 'cash' | 'voucher' | 'free_turn' | 'custom';

export type RewardRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface MysteryBoxTierConfig {
  id: string;
  name: string;
  tier: MysteryBoxTier;
  price: number;
  originalPrice?: number;
  description: string;
  badge?: string; // 'HOT' | 'TIẾT KIỆM' | 'TỶ LỆ CAO' | 'VIP SSS'
  tagText?: string;
  tagline?: string;
  jackpotPreview?: string;
  themePreset?: string;
  color?: string;
  accentColor?: string;
  colorGradient: string;
  borderColor: string;
  iconBg: string;
  totalOpened: number;
  stockRemaining: number; // if limited daily (e.g. 50/50), -1 for unlimited
  highlightText: string;
  highlightRewards: {
    name: string;
    tag: string;
    rate: string;
    image?: string;
  }[];
  isActive: boolean;
}

export interface MysteryBoxRewardItem {
  id: string;
  boxTierId: string; // 'bronze' | 'silver' | 'gold' | 'diamond' | 'special' | 'all'
  type: MysteryBoxRewardType;
  title: string;
  subtitle?: string;
  image?: string;
  value: number; // cash amount, or voucher value, or account value estimation
  rarity: RewardRarity;
  dropWeight: number; // probability weight
  isJackpot?: boolean;
  // Account details if type === 'account'
  accountData?: {
    rank: RankTier;
    server?: string;
    heroesCount: number;
    skinsCount: number;
    rareSkinName?: string;
    credentials: AccountCredentials;
    description?: string;
  };
  // Voucher details if type === 'voucher'
  voucherCode?: string;
  voucherDiscount?: number;
  voucherMinOrder?: number;
  // Custom details if type === 'custom'
  customData?: {
    description?: string;
    notes?: string;
    contactInfo?: string;
  };
  // Stock limit
  stock?: number;
}

export interface MysteryBoxHistoryItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  boxTierId: string;
  boxName: string;
  rewardId: string;
  rewardType: MysteryBoxRewardType;
  rewardTitle: string;
  rewardValue: number;
  rewardRarity: RewardRarity;
  accountDelivered?: AccountCredentials;
  voucherCodeDelivered?: string;
  openedAt: string;
}

export interface UserInventoryItem {
  id: string;
  userId: string;
  source: 'mystery_box' | 'direct_purchase' | 'event';
  rewardType: MysteryBoxRewardType;
  title: string;
  value: number;
  rarity: RewardRarity;
  accountData?: {
    rank: RankTier;
    server?: string;
    heroesCount: number;
    skinsCount: number;
    rareSkinName?: string;
    credentials: AccountCredentials;
  };
  voucherCode?: string;
  voucherDiscount?: number;
  customData?: {
    description?: string;
    notes?: string;
    contactInfo?: string;
  };
  isUsed?: boolean;
  receivedAt: string;
}

// ----------------------------------------------------
// SELLER VERIFICATION & TRUST SCORE TYPES
// ----------------------------------------------------
export interface SellerTrustScore {
  score: number; // 0 - 100
  successfulDeals: number;
  completionRate: number; // % e.g. 100
  rating: number;
  disputesCount: number;
  cancelledCount: number;
  isVerified: boolean;
  activeSince: string;
}

export interface SellerVerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  fullName?: string;
  phone?: string;
  userAvatar?: string;
  idCardNumber: string;
  socialLink?: string;
  zaloPhone?: string;
  warrantyCommitment: boolean;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  appliedAt: string;
  reviewedAt?: string;
}

// ----------------------------------------------------
// COUPON & VOUCHER TYPES
// ----------------------------------------------------
export interface CouponItem {
  id: string;
  code: string; // e.g. LQMARKET10
  discountPercent?: number; // e.g. 10 (%)
  discountAmount?: number; // e.g. 50000 (VNĐ)
  minOrder: number; // e.g. 500000 (VNĐ)
  maxDiscount?: number; // max cap e.g. 200000 (VNĐ)
  maxUses: number;
  usedCount: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  description: string;
}

// ----------------------------------------------------
// DISPUTE (KHIẾU NẠI) TYPES
// ----------------------------------------------------
export type DisputeStatus =
  | 'open'
  | 'pending'
  | 'under_review'
  | 'resolved_buyer_refund'
  | 'resolved_seller_payout'
  | 'more_info_needed';

export interface DisputeTicket {
  id: string; // #DSP001
  orderId: string;
  orderCode: string;
  accountId: string;
  accountCode: string;
  accountTitle: string;
  amount: number;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  reason: string;
  evidencePhotos: string[];
  evidenceVideo?: string;
  buyerNote?: string;
  sellerResponse?: string;
  adminDecisionNote?: string;
  status: DisputeStatus;
  createdAt: string;
  resolvedAt?: string;
}

// ----------------------------------------------------
// AFFILIATE & REFERRAL TYPES
// ----------------------------------------------------
export interface AffiliateStats {
  userId: string;
  refCode: string;
  refLink: string;
  totalClicks: number;
  totalSignups: number;
  totalOrders: number;
  totalCommission: number;
  paidCommission: number;
  pendingCommission: number;
}

// ----------------------------------------------------
// PRICE ALERT TYPES
// ----------------------------------------------------
export interface PriceAlertItem {
  id: string;
  userId: string;
  userEmail?: string;
  accountId: string;
  accountCode: string;
  accountTitle: string;
  initialPrice?: number;
  currentPrice?: number;
  targetPrice: number;
  isTriggered: boolean;
  createdAt: string;
}

// ----------------------------------------------------
// ADMIN AUDIT LOG TYPES
// ----------------------------------------------------
export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action:
    | 'APPROVE_WITHDRAWAL'
    | 'REJECT_WITHDRAWAL'
    | 'APPROVE_SELLER'
    | 'REJECT_SELLER'
    | 'REFUND_DISPUTE'
    | 'RESOLVE_DISPUTE_SELLER'
    | 'BLOCK_USER'
    | 'UNBLOCK_USER'
    | 'CREATE_COUPON'
    | 'TOGGLE_COUPON'
    | 'APPROVE_ACCOUNT'
    | 'REJECT_ACCOUNT';
  targetType: 'withdrawal' | 'seller' | 'dispute' | 'user' | 'coupon' | 'account';
  targetId: string;
  amount?: number;
  statusChange?: string; // e.g. "pending -> approved"
  details: string;
  timestamp: string;
}

// ----------------------------------------------------
// BLOG & GUIDE TYPES
// ----------------------------------------------------
export interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  category: 'meta' | 'security' | 'guide' | 'review';
  author: string;
  publishedAt: string;
  readTime: string;
  relatedAccountTags?: string[];
}

// ----------------------------------------------------
// REFERRAL SYSTEM TYPES
// ----------------------------------------------------
export interface ReferralItem {
  id: string;
  referrerId: string;
  referrerName?: string;
  referrerCode?: string;
  referralCode?: string;
  referredUserId: string;
  referredUserName?: string;
  referredUserEmail?: string;
  referredUserAvatar?: string;
  status: 'pending' | 'completed' | 'cancelled' | 'rewarded';
  rewardAmount: number;
  referredRewardAmount: number;
  referrerReward?: number;
  referredUserReward?: number;
  orderAmount?: number;
  rewardType: 'fixed_amount' | 'percentage';
  qualifyingOrderId?: string | null;
  qualifyingOrderCode?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

export interface ReferralSettings {
  enabled: boolean;
  rewardType: 'fixed_amount' | 'percentage';
  referrerReward: number;
  referredUserReward: number;
  minOrderValue: number;
  description: string;
}

// ----------------------------------------------------
// BLIND BAG ACCOUNT WAREHOUSE (KHO ACC TÚI MÙ) TYPES
// ----------------------------------------------------
export type BlindBagAccountStatus = 'available' | 'reserved' | 'claimed' | 'disabled';

export interface BlindBagAccountItem {
  id: string; // "bga_xxxxx"
  username: string; // Tên đăng nhập
  password?: string; // Mật khẩu (ẩn mặc định trên frontend)
  blindBagId: string; // ID hạng túi mù, ví dụ: "box_bronze", "blindbag_1000", "box_gold", etc.
  blindBagName?: string; // Tên hiển thị túi mù
  status: BlindBagAccountStatus;
  claimedBy?: string | null;
  claimedByName?: string | null;
  claimedAt?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BlindBagClaimItem {
  id: string; // "bbc_xxxxx"
  userId: string;
  userName?: string;
  blindBagId: string;
  blindBagName?: string;
  blindBagAccountId: string;
  username: string;
  claimedAt: string;
  status: 'success' | 'failed';
}

export interface BlindBagStats {
  total: number;
  available: number;
  claimed: number;
  reserved: number;
  disabled: number;
}


export interface ReferralUserStats {
  totalInvited: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalEarned: number;
}

