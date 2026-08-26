import { supabase, isSupabaseConfigured } from './supabase';
import {
  AccountItem,
  OrderItem,
  WalletTransaction,
  MysteryBoxTierConfig,
  MysteryBoxRewardItem,
  UserProfile,
} from '../types';

/**
 * Fetch all user profiles from Supabase PostgreSQL
 */
export async function getSupabaseProfiles(): Promise<UserProfile[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map((p: any) => ({
    id: p.id,
    name: p.name || p.full_name || p.username || 'User',
    username: p.username || (p.email ? p.email.split('@')[0] : 'user'),
    email: p.email || '',
    phone: p.phone || '',
    avatar: p.avatar_url || p.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(p.id)}`,
    role: p.role || 'buyer',
    balance: Number(p.balance || 0),
    pendingBalance: Number(p.pending_balance || 0),
    rating: Number(p.reputation_score || p.rating || 5.0),
    completedSales: Number(p.completed_sales || p.seller_completed_sales || 0),
    isVerifiedSeller: Boolean(p.is_seller_verified || p.is_verified_seller),
    sellerTier: p.seller_tier || 'FREE',
    bankName: p.bank_name,
    bankAccount: p.bank_account,
    bankAccountName: p.bank_account_name,
    wishlistIds: p.wishlist_ids || [],
    createdAt: p.created_at || new Date().toISOString()
  }));
}

/**
 * Save or update user profile in Supabase PostgreSQL
 */
export async function saveSupabaseProfile(user: UserProfile): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    name: user.name,
    full_name: user.name,
    username: user.username || user.email.split('@')[0],
    email: user.email,
    phone: user.phone || '',
    avatar_url: user.avatar,
    avatar: user.avatar,
    role: user.role,
    balance: user.balance,
    pending_balance: user.pendingBalance,
    reputation_score: user.rating,
    rating: user.rating,
    is_seller_verified: user.isVerifiedSeller,
    is_verified_seller: user.isVerifiedSeller,
    seller_tier: user.sellerTier || 'FREE',
    wishlist_ids: user.wishlistIds || [],
    updated_at: new Date().toISOString()
  });

  return !error;
}

/**
 * Fetch all accounts from Supabase PostgreSQL
 */
export async function getSupabaseAccounts(): Promise<AccountItem[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map((item: any) => ({
    id: item.id,
    code: item.code || `LQ${item.id.slice(-5)}`,
    title: item.title,
    description: item.description || '',
    price: Number(item.price || 0),
    originalPrice: item.original_price ? Number(item.original_price) : undefined,
    rank: item.rank,
    heroesCount: Number(item.heroes_count || 0),
    skinsCount: Number(item.skins_count || 0),
    runePages: item.rune_pages ? String(item.rune_pages) : '90/90 Full Ngọc III',
    level: Number(item.level || 30),
    server: item.server || 'Mặt Trời (VN)',
    loginMethod: item.login_method || 'Garena',
    isCleanInfo: Boolean(item.is_clean_info ?? true),
    images: item.images || [],
    rareSkins: item.rare_skins || [],
    notableHeroes: item.notable_heroes || [],
    sellerId: item.seller_id,
    sellerName: item.seller_name || 'Người bán',
    sellerAvatar: item.seller_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${item.seller_id}`,
    sellerRating: Number(item.seller_rating || 5.0),
    sellerCompletedSales: Number(item.seller_completed_sales || 0),
    sellerResponseTime: item.seller_response_time || '< 5 phút',
    sellerVerified: Boolean(item.seller_verified),
    status: item.status || 'approved',
    rejectionReason: item.rejection_reason,
    credentials: item.credentials || { username: '', password: '', securityType: 'Trắng Thông Tin' },
    createdAt: item.created_at || new Date().toISOString(),
    views: Number(item.views || 0),
    likes: Number(item.likes || 0),
    isFeatured: Boolean(item.is_featured)
  }));
}

/**
 * Save or update an account in PostgreSQL
 */
export async function saveSupabaseAccount(account: AccountItem): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  const { error } = await supabase.from('accounts').upsert({
    id: account.id,
    seller_id: account.sellerId,
    title: account.title,
    description: account.description,
    price: account.price,
    original_price: account.originalPrice,
    rank: account.rank,
    heroes_count: account.heroesCount,
    skins_count: account.skinsCount,
    server: account.server,
    images: account.images,
    rare_skins: account.rareSkins,
    status: account.status,
    views: account.views,
    is_featured: account.isFeatured,
    created_at: account.createdAt,
    updated_at: new Date().toISOString()
  });

  return !error;
}

/**
 * Fetch orders from PostgreSQL
 */
export async function getSupabaseOrders(userId?: string): Promise<OrderItem[]> {
  if (!isSupabaseConfigured) return [];
  let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (userId) {
    query = query.or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
  }
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map((item: any) => ({
    id: item.id,
    orderCode: item.order_code,
    accountId: item.account_id,
    accountCode: item.account_code || `LQ${item.account_id?.slice(-5)}`,
    accountTitle: item.account_title,
    accountPrice: Number(item.account_price || 0),
    fee: Number(item.fee || 0),
    totalAmount: Number(item.total_amount || item.account_price || 0),
    buyerId: item.buyer_id,
    buyerName: item.buyer_name || 'Người mua',
    sellerId: item.seller_id,
    sellerName: item.seller_name || 'Người bán',
    status: item.status,
    credentialsDelivered: item.credentials_delivered,
    disputeReason: item.dispute_reason,
    ratingGiven: item.rating_given,
    reviewComment: item.review_comment,
    createdAt: item.created_at || new Date().toISOString(),
    completedAt: item.completed_at
  }));
}

/**
 * Save or update an order
 */
export async function saveSupabaseOrder(order: OrderItem): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  const { error } = await supabase.from('orders').upsert({
    id: order.id,
    order_code: order.orderCode,
    buyer_id: order.buyerId,
    seller_id: order.sellerId,
    account_id: order.accountId,
    account_title: order.accountTitle,
    account_price: order.accountPrice,
    status: order.status,
    dispute_reason: order.disputeReason,
    created_at: order.createdAt,
    updated_at: new Date().toISOString()
  });
  return !error;
}

/**
 * Save transaction record
 */
export async function saveSupabaseTransaction(tx: WalletTransaction): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  const { error } = await supabase.from('transactions').upsert({
    id: tx.id,
    user_id: tx.userId,
    type: tx.type,
    amount: tx.amount,
    status: tx.status,
    description: tx.note,
    created_at: tx.createdAt
  });
  return !error;
}

/**
 * Fetch mystery boxes
 */
export async function getSupabaseMysteryBoxes(): Promise<MysteryBoxTierConfig[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('mystery_boxes').select('*');
  if (error || !data) return [];
  return data.map((b: any) => ({
    id: b.id,
    tier: b.tier,
    name: b.name,
    badge: b.badge || 'HOT',
    price: Number(b.price),
    originalPrice: b.original_price ? Number(b.original_price) : undefined,
    colorGradient: b.color_gradient || 'from-amber-500 to-yellow-600',
    borderColor: b.border_color || 'border-amber-500/40',
    iconBg: b.icon_bg || 'bg-amber-500/20',
    description: b.description || '',
    isActive: Boolean(b.is_active ?? true),
    totalOpened: Number(b.total_opened || 0),
    stockRemaining: Number(b.stock_remaining ?? -1),
    highlightText: b.highlight_text || 'Cơ hội trúng Acc SSS & Tiền mặt',
    highlightRewards: b.highlight_rewards || []
  }));
}

/**
 * Fetch mystery rewards
 */
export async function getSupabaseMysteryRewards(): Promise<MysteryBoxRewardItem[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('mystery_rewards').select('*');
  if (error || !data) return [];
  return data.map((r: any) => ({
    id: r.id,
    boxTierId: r.box_tier_id,
    title: r.title || r.name,
    subtitle: r.subtitle,
    type: r.type,
    image: r.image,
    value: Number(r.value || 0),
    rarity: r.rarity,
    dropWeight: Number(r.drop_weight || 10),
    accountData: r.account_data,
    voucherCode: r.voucher_code
  }));
}

/**
 * Execute Secure Server-Side Mystery Box Opening via Supabase RPC
 */
export async function openMysteryBoxViaSupabaseRPC(
  userId: string,
  boxTierId: string
): Promise<{ success: boolean; reward?: any; newBalance?: number; message?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, message: 'Chưa cấu hình Supabase RPC' };
  }

  const { data, error } = await supabase.rpc('open_mystery_box_secure', {
    p_user_id: userId,
    p_box_tier_id: boxTierId
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return {
    success: true,
    reward: data.reward,
    newBalance: data.new_balance
  };
}
