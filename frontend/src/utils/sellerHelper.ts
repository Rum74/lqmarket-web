import { UserProfile, OrderItem, AccountItem } from '../types';

export interface DynamicSellerInfo {
  id: string;
  name: string;
  avatar: string;
  isVerifiedSeller: boolean;
  sellerTier: string; // 'VIP SELLER' | 'PRO SELLER' | 'BASIC SELLER'
  completedSales: number;
  reviewsCount: number;
  averageRating: string | null; // e.g. "5.0" or null
  ratingNumber: number | null;
  bio?: string;
  createdAt?: string;
}

export function getDynamicSellerInfo(
  sellerId: string,
  allUsers: UserProfile[],
  orders: OrderItem[],
  accountFallback?: Partial<AccountItem>
): DynamicSellerInfo {
  const user = allUsers.find(u => u.id === sellerId);
  const sellerOrders = orders.filter(o => o.sellerId === sellerId);
  const completedOrders = sellerOrders.filter(o => o.status === 'completed');
  const reviewOrders = sellerOrders.filter(o => (o.ratingGiven !== undefined && o.ratingGiven !== null) || o.reviewComment);

  const completedSales = completedOrders.length;
  const reviewsCount = reviewOrders.length;
  const averageRating =
    reviewsCount > 0
      ? (reviewOrders.reduce((sum, o) => sum + (o.ratingGiven || 5), 0) / reviewsCount).toFixed(1)
      : null;

  const isVerified = user?.isVerifiedSeller ?? (accountFallback?.sellerVerified ?? false);

  // Dynamic and consistent tier badge calculation across all views
  let tier = 'BASIC SELLER';
  if (isVerified || completedSales >= 10 || user?.role === 'admin' || user?.sellerTier === 'VIP') {
    tier = 'VIP SELLER';
  } else if (completedSales >= 3 || user?.sellerTier === 'PRO') {
    tier = 'PRO SELLER';
  }

  return {
    id: sellerId,
    name: user?.name || accountFallback?.sellerName || 'Shop Acc',
    avatar:
      user?.avatar ||
      accountFallback?.sellerAvatar ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    isVerifiedSeller: isVerified,
    sellerTier: tier,
    completedSales,
    reviewsCount,
    averageRating,
    ratingNumber: averageRating ? parseFloat(averageRating) : null,
    bio: user?.bio,
    createdAt: user?.createdAt
  };
}
