import mongoose from 'mongoose';
import { User } from '../models/User';
import { Account } from '../models/Account';
import { Order } from '../models/Order';
import { Review } from '../models/Review';

export interface SellerStatsResult {
  sellerId: string;
  name: string;
  username: string;
  avatar: string;
  role: string;
  isVerifiedSeller: boolean;
  sellerTier: string;
  bio: string;
  createdAt: string;
  totalSold: number;
  completedSales: number;
  totalListings: number;
  activeListings: number;
  rating: number;
  averageRating: string;
  reviewCount: number;
  reviewsCount: number;
  reviews: any[];
  accounts: any[];
}

/**
 * Standard unified service for fetching Seller Statistics, public profile & reviews directly from MongoDB.
 * Accessible to both logged-in users and guests with identical output.
 */
export async function getSellerStats(sellerIdParam: string): Promise<SellerStatsResult | null> {
  const cleanId = String(sellerIdParam || '').trim();
  if (!cleanId) return null;

  // 1. Locate seller User or fallback account
  let user = await User.findOne({
    $or: [
      { id: cleanId },
      { username: cleanId },
      { name: cleanId },
      { email: cleanId }
    ]
  }).lean();

  const accountForSeller = await Account.findOne({
    $or: [
      { sellerId: cleanId },
      { sellerName: cleanId },
      { id: cleanId },
      { code: cleanId }
    ]
  }).lean();

  if (!user && accountForSeller) {
    user = await User.findOne({ id: accountForSeller.sellerId }).lean();
  }

  if (!user && !accountForSeller) {
    // Check by loose sellerName regex
    const looseAccount = await Account.findOne({
      sellerName: new RegExp(`^${cleanId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    }).lean();
    if (looseAccount) {
      user = await User.findOne({ id: looseAccount.sellerId }).lean();
    }
  }

  if (!user && !accountForSeller) {
    return null;
  }

  const effectiveId = user?.id || accountForSeller?.sellerId || cleanId;
  const sellerName = user?.name || accountForSeller?.sellerName || 'Shop Acc Liên Quân';
  const sellerUsername = user?.username || (user?.email ? user.email.split('@')[0] : '') || effectiveId;
  const sellerAvatar =
    user?.avatar ||
    accountForSeller?.sellerAvatar ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(effectiveId)}`;
  const isVerified = user?.isVerifiedSeller ?? (accountForSeller?.sellerVerified ?? true);

  // 2. Build set of matching identifiers
  const sellerIdSet = new Set<string>();
  sellerIdSet.add(cleanId);
  if (effectiveId) sellerIdSet.add(effectiveId);
  if (user?.id) sellerIdSet.add(user.id);
  if (user?.username) sellerIdSet.add(user.username);
  if (accountForSeller?.sellerId) sellerIdSet.add(accountForSeller.sellerId);

  const sellerNames = new Set<string>();
  if (sellerName) sellerNames.add(sellerName);
  if (user?.name) sellerNames.add(user.name);
  if (accountForSeller?.sellerName) sellerNames.add(accountForSeller.sellerName);

  const sellerNameRegexes = Array.from(sellerNames).map(
    name => new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
  );

  // 3. Fetch Accounts belonging to this seller
  const sellerAccounts = await Account.find({
    $or: [
      { sellerId: { $in: Array.from(sellerIdSet) } },
      { sellerName: { $in: Array.from(sellerNames) } },
      ...sellerNameRegexes.map(rx => ({ sellerName: rx }))
    ]
  })
    .sort({ createdAt: -1 })
    .lean();

  const accountIds = sellerAccounts.map(a => a.id).filter(Boolean);
  const accountCodes = sellerAccounts.map(a => a.code).filter(Boolean);
  const soldAccountsCount = sellerAccounts.filter(a => a.status === 'sold').length;
  const activeListings = sellerAccounts.filter(a => a.status === 'approved').length;

  // 4. Fetch Orders for this seller
  const sellerOrders = await Order.find({
    $or: [
      { sellerId: { $in: Array.from(sellerIdSet) } },
      { sellerName: { $in: Array.from(sellerNames) } },
      ...sellerNameRegexes.map(rx => ({ sellerName: rx })),
      { accountId: { $in: accountIds } },
      { accountCode: { $in: accountCodes } }
    ]
  })
    .sort({ completedAt: -1, createdAt: -1 })
    .lean();

  const completedOrders = sellerOrders.filter(
    o => o.status === 'completed' || o.status === 'account_delivered' || o.status === 'escrow_hold'
  );
  const allOrderIds = sellerOrders.map(o => o.id).filter(Boolean);

  // 5. Fetch Customer Reviews from Review collection & Order documents
  const dbReviews = await Review.find({
    $or: [
      { sellerId: { $in: Array.from(sellerIdSet) } },
      { sellerName: { $in: Array.from(sellerNames) } },
      ...sellerNameRegexes.map(rx => ({ sellerName: rx })),
      { accountId: { $in: accountIds } },
      { accountCode: { $in: accountCodes } },
      { orderId: { $in: allOrderIds } }
    ]
  })
    .sort({ createdAt: -1 })
    .lean();

  const formattedReviews: any[] = [];
  const seenReviewKeys = new Set<string>();

  // Add DB reviews
  for (const rev of dbReviews) {
    const reviewKey = rev.id || rev.orderId || `${rev.buyerId}_${rev.accountId}`;
    if (!seenReviewKeys.has(reviewKey)) {
      seenReviewKeys.add(reviewKey);
      formattedReviews.push({
        id: rev.id,
        buyerName: rev.buyerName || 'Khách Hàng',
        buyerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
        rating: rev.rating || 5,
        comment: rev.comment || 'Tài khoản đúng mô tả, giao dịch nhanh chóng và an toàn.',
        date: rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : '29/08/2026',
        accountCode: rev.accountCode || '',
        accountTitle: ''
      });
    }
  }

  // Add order embedded reviews
  for (const ord of sellerOrders) {
    const rawOrd = ord as any;
    if (ord.review?.rating || ord.review?.comment || rawOrd.ratingGiven || rawOrd.reviewComment) {
      const reviewKey = ord.id;
      if (!seenReviewKeys.has(reviewKey)) {
        seenReviewKeys.add(reviewKey);
        formattedReviews.push({
          id: ord.id,
          buyerName: ord.buyerName || 'Người Mua',
          buyerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
          rating: ord.review?.rating || rawOrd.ratingGiven || 5,
          comment: ord.review?.comment || rawOrd.reviewComment || 'Giao dịch thành công, nhận acc ngay tức thì.',
          date: ord.completedAt
            ? new Date(ord.completedAt).toLocaleDateString('vi-VN')
            : ord.createdAt
            ? new Date(ord.createdAt).toLocaleDateString('vi-VN')
            : '29/08/2026',
          accountCode: ord.accountCode || '',
          accountTitle: ord.accountTitle || ''
        });
      }
    }
  }

  // 6. Unified totalSold (completedSales) calculation
  const totalSold = Math.max(
    completedOrders.length,
    soldAccountsCount,
    user?.completedSales || 0,
    accountForSeller?.sellerCompletedSales || 0
  );

  // 7. Average rating
  const avgRatingNumber = formattedReviews.length > 0
    ? parseFloat((formattedReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / formattedReviews.length).toFixed(1))
    : user?.rating
    ? parseFloat(user.rating.toFixed(1))
    : accountForSeller?.sellerRating
    ? parseFloat(accountForSeller.sellerRating.toFixed(1))
    : 5.0;

  const avgRatingString = avgRatingNumber.toFixed(1);

  // 8. Seller Tier
  let tier = user?.sellerTier || 'BASIC SELLER';
  if (isVerified || totalSold >= 10 || user?.role === 'admin' || tier === 'VIP') {
    tier = 'VIP SELLER';
  } else if (totalSold >= 3 || tier === 'PRO') {
    tier = 'PRO SELLER';
  }

  const bio = user?.bio || 'Chuyên cung cấp tài khoản Liên Quân chất lượng cao, bảo hành trọn đời, hỗ trợ 24/7.';
  const createdAt = (user as any)?.createdAt || accountForSeller?.createdAt || '2025-01-01T00:00:00.000Z';

  return {
    sellerId: effectiveId,
    name: sellerName,
    username: sellerUsername,
    avatar: sellerAvatar,
    role: user?.role || 'seller',
    isVerifiedSeller: isVerified,
    sellerTier: tier,
    bio,
    createdAt,
    totalSold,
    completedSales: totalSold,
    totalListings: sellerAccounts.length,
    activeListings,
    rating: avgRatingNumber,
    averageRating: avgRatingString,
    reviewCount: formattedReviews.length,
    reviewsCount: formattedReviews.length,
    reviews: formattedReviews,
    accounts: sellerAccounts
  };
}
