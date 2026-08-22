export type RankTier =
  | 'Đồng'
  | 'Bạc'
  | 'Vàng'
  | 'Bạch Kim'
  | 'Kim Cương'
  | 'Tinh Anh'
  | 'Cao Thủ'
  | 'Chiến Tướng';

export type AccountStatus = 'pending' | 'approved' | 'rejected' | 'sold' | 'hidden';

export type UserRole = 'buyer' | 'seller' | 'admin';

export type OrderStatus =
  | 'pending_payment'
  | 'escrow_hold'
  | 'account_delivered'
  | 'inspecting'
  | 'completed'
  | 'disputed'
  | 'refunded';

export type SellerTier = 'FREE' | 'BASIC' | 'PRO' | 'VIP';

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
  bankName?: string;
  bankAccount?: string;
  bankAccountName?: string;
  bio?: string;
  wishlistIds?: string[];
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
  fee: number;
  totalAmount: number;
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
  status: 'success' | 'pending' | 'failed';
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
