import { UserProfile, OrderItem, AccountItem } from '../types';

export interface DynamicSellerInfo {
  id: string;
  name: string;
  avatar: string;
  isVerifiedSeller: boolean;
  sellerTier: string; // 'VIP SELLER' | 'PRO SELLER' | 'BASIC SELLER'
  completedSales: number;
  reviewsCount: number;
  averageRating: string; // e.g. "5.0"
  ratingNumber: number;
  bio?: string;
  createdAt?: string;
}

export function getDynamicSellerInfo(
  sellerId: string,
  allUsers: UserProfile[],
  orders: OrderItem[],
  accountFallback?: Partial<AccountItem>
): DynamicSellerInfo {
  const user = allUsers.find(u => u.id === sellerId || u.username === sellerId || u.name === sellerId);
  const sellerName = accountFallback?.sellerName || user?.name || sellerId;
  const sellerOrders = orders.filter(
    o => o.sellerId === sellerId || o.sellerName === sellerName || (user && (o.sellerId === user.id || o.sellerName === user.name))
  );

  // Completed orders
  const completedOrders = sellerOrders.filter(o => o.status === 'completed');

  // Review orders
  const reviewOrders = sellerOrders.filter(
    o => (o.ratingGiven !== undefined && o.ratingGiven !== null) || Boolean(o.reviewComment) || Boolean((o as any).review?.rating)
  );

  const completedSales = Math.max(
    user?.completedSales || 0,
    accountFallback?.sellerCompletedSales || 0,
    completedOrders.length
  );

  const reviewsCount = reviewOrders.length > 0
    ? reviewOrders.length
    : (user as any)?.reviewsCount || (user as any)?.reviewCount || 0;

  const averageRating =
    reviewOrders.length > 0
      ? (reviewOrders.reduce((sum, o) => sum + (o.ratingGiven || (o as any).review?.rating || 5), 0) / reviewOrders.length).toFixed(1)
      : user?.rating
      ? user.rating.toFixed(1)
      : accountFallback?.sellerRating
      ? accountFallback.sellerRating.toFixed(1)
      : '5.0';

  const isVerified = user?.isVerifiedSeller ?? (accountFallback?.sellerVerified ?? true);

  // Dynamic and consistent tier badge calculation across all views
  let tier = user?.sellerTier || 'BASIC SELLER';
  if (isVerified || completedSales >= 10 || user?.role === 'admin' || tier === 'VIP') {
    tier = 'VIP SELLER';
  } else if (completedSales >= 3 || tier === 'PRO') {
    tier = 'PRO SELLER';
  }

  const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(sellerId || 'seller')}`;

  return {
    id: sellerId,
    name: accountFallback?.sellerName || user?.name || 'Shop Acc Liên Quân',
    avatar:
      accountFallback?.sellerAvatar ||
      user?.avatar ||
      defaultAvatar,
    isVerifiedSeller: isVerified,
    sellerTier: tier,
    completedSales,
    reviewsCount,
    averageRating,
    ratingNumber: averageRating ? parseFloat(averageRating) : 5.0,
    bio: user?.bio,
    createdAt: user?.createdAt
  };
}
