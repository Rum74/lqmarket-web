import { User, IUser } from '../models/User';
import { Referral, IReferral } from '../models/Referral';
import { ReferralSetting, IReferralSetting } from '../models/ReferralSetting';
import { Order, IOrder } from '../models/Order';
import { WalletTransaction } from '../models/WalletTransaction';
import { Notification } from '../models/Notification';
import { AuditLog } from '../models/AuditLog';

// Helper to generate readable 8-character unique alphanumeric referral code
// Excludes characters that can be confused: 0, O, 1, I
const CODE_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export async function generateUniqueReferralCode(): Promise<string> {
  let attempts = 0;
  while (attempts < 20) {
    let code = '';
    for (let i = 0; i < 8; i++) {
      const idx = Math.floor(Math.random() * CODE_CHARS.length);
      code += CODE_CHARS[idx];
    }
    const existing = await User.findOne({ referralCode: code });
    if (!existing) {
      return code;
    }
    attempts++;
  }
  // Fallback if collision persists
  return `LQ${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

// Get or initialize default referral settings
export async function getReferralSettings(): Promise<IReferralSetting> {
  let settings = await ReferralSetting.findOne({ id: 'default_referral_settings' });
  if (!settings) {
    settings = await ReferralSetting.create({
      id: 'default_referral_settings',
      enabled: true,
      referrerReward: 20000,
      referredUserReward: 10000,
      minimumOrderValue: 200000,
      requireFirstOrderCompleted: true,
      requireAccountVerification: true,
      maxRewardsPerUser: 100,
      updatedAt: new Date().toISOString()
    });
  }
  return settings;
}

// Update referral settings and log audit
export async function updateReferralSettings(
  updates: Partial<IReferralSetting>,
  adminContext?: { adminId: string; adminName: string }
): Promise<IReferralSetting> {
  const current = await getReferralSettings();
  
  const allowedKeys: (keyof IReferralSetting)[] = [
    'enabled',
    'referrerReward',
    'referredUserReward',
    'minimumOrderValue',
    'requireFirstOrderCompleted',
    'requireAccountVerification',
    'maxRewardsPerUser'
  ];

  const patch: any = { updatedAt: new Date().toISOString() };
  for (const key of allowedKeys) {
    if (updates[key] !== undefined) {
      patch[key] = updates[key];
    }
  }

  const updated = await ReferralSetting.findOneAndUpdate(
    { id: 'default_referral_settings' },
    { $set: patch },
    { new: true }
  );

  // Log audit
  if (adminContext) {
    try {
      const audit = new AuditLog({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        adminId: adminContext.adminId,
        adminName: adminContext.adminName,
        action: 'UPDATE_REFERRAL_SETTINGS',
        targetType: 'referral_settings',
        targetId: 'default_referral_settings',
        details: `Cập nhật cấu hình Referral: Bật=${patch.enabled ?? current.enabled}, Thưởng người giới thiệu=${(patch.referrerReward ?? current.referrerReward).toLocaleString('vi-VN')}đ, Thưởng người được GT=${(patch.referredUserReward ?? current.referredUserReward).toLocaleString('vi-VN')}đ, Đơn tối thiểu=${(patch.minimumOrderValue ?? current.minimumOrderValue).toLocaleString('vi-VN')}đ`,
        timestamp: new Date().toISOString()
      });
      await audit.save();
    } catch (e) {
      console.warn('[ReferralService] AuditLog warning:', e);
    }
  }

  return updated || current;
}

// Validate a referral code without revealing sensitive data
export async function validateReferralCode(rawCode: string): Promise<{
  valid: boolean;
  code?: string;
  referrerName?: string;
  referrerAvatar?: string;
  message: string;
}> {
  if (!rawCode || typeof rawCode !== 'string') {
    return { valid: false, message: 'Mã giới thiệu không hợp lệ' };
  }

  const cleanCode = rawCode.trim().toUpperCase();
  const referrer = await User.findOne({ referralCode: cleanCode });

  if (!referrer) {
    return { valid: false, message: 'Mã giới thiệu không tồn tại trong hệ thống' };
  }

  if (referrer.status === 'banned') {
    return { valid: false, message: 'Mã giới thiệu này thuộc tài khoản đang bị tạm khóa' };
  }

  return {
    valid: true,
    code: cleanCode,
    referrerName: referrer.name || 'Người dùng LQMarket',
    referrerAvatar: referrer.avatar || '',
    message: `Mã giới thiệu hợp lệ từ "${referrer.name}"!`
  };
}

// Ensure a user has a referral code (auto-generate if missing)
export async function ensureUserHasReferralCode(user: IUser): Promise<string> {
  if (user.referralCode && user.referralCode.trim().length > 0) {
    return user.referralCode;
  }
  const newCode = await generateUniqueReferralCode();
  user.referralCode = newCode;
  await User.findOneAndUpdate({ id: user.id }, { $set: { referralCode: newCode } });
  return newCode;
}

// Create referral record upon user registration
export async function createReferralOnRegister(
  newUser: IUser,
  rawReferralCode?: string
): Promise<IReferral | null> {
  if (!rawReferralCode || typeof rawReferralCode !== 'string') {
    return null;
  }

  const cleanCode = rawReferralCode.trim().toUpperCase();
  const referrer = await User.findOne({ referralCode: cleanCode });

  // Anti-fraud: cannot refer oneself
  if (!referrer || referrer.id === newUser.id) {
    return null;
  }

  // Check if referred user already has a referral
  const existing = await Referral.findOne({ referredUserId: newUser.id });
  if (existing) {
    return existing;
  }

  const settings = await getReferralSettings();

  const referral = await Referral.create({
    id: `ref_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    referrerId: referrer.id,
    referredUserId: newUser.id,
    referralCode: cleanCode,
    qualifyingOrderId: null,
    referrerReward: settings.referrerReward,
    referredReward: settings.referredUserReward,
    status: 'pending',
    rewardedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // Notify referrer
  try {
    const notif = new Notification({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: referrer.id,
      type: 'system',
      title: 'Bạn bè mới đăng ký qua mã giới thiệu!',
      message: `Thành viên "${newUser.name}" vừa đăng ký tài khoản thành công qua mã giới thiệu của bạn. Khi họ hoàn tất đơn hàng đầu tiên (từ ${settings.minimumOrderValue.toLocaleString('vi-VN')}đ), bạn sẽ nhận được ${settings.referrerReward.toLocaleString('vi-VN')}đ tiền thưởng!`,
      read: false,
      createdAt: new Date().toISOString()
    });
    await notif.save();
  } catch (err) {
    console.warn('[ReferralService] Notif warning:', err);
  }

  return referral;
}

// Process automated reward when an order is completed
export async function processOrderReferralReward(orderId: string): Promise<{
  processed: boolean;
  reason?: string;
  referralId?: string;
}> {
  console.log(`[ReferralService] Checking referral reward for order: ${orderId}`);
  const order = await Order.findOne({ $or: [{ id: orderId }, { orderCode: String(orderId) }] });

  if (!order) {
    return { processed: false, reason: 'Order not found' };
  }

  if (order.status !== 'completed') {
    return { processed: false, reason: 'Order is not completed' };
  }

  const buyer = await User.findOne({ id: order.buyerId });
  if (!buyer) {
    return { processed: false, reason: 'Buyer not found' };
  }

  // Check if buyer was referred
  if (!buyer.referredBy || buyer.referralRewardReceived) {
    return { processed: false, reason: 'Buyer not referred or already rewarded' };
  }

  // Find active pending referral
  const referral = await Referral.findOne({
    referredUserId: buyer.id,
    status: 'pending'
  });

  if (!referral) {
    return { processed: false, reason: 'No pending referral found for buyer' };
  }

  const settings = await getReferralSettings();

  // Check 1: Referral system enabled
  if (!settings.enabled) {
    return { processed: false, reason: 'Referral system is currently disabled' };
  }

  // Check 2: Minimum order value
  const orderAmount = order.totalAmount || order.accountPrice || 0;
  if (orderAmount < settings.minimumOrderValue) {
    return {
      processed: false,
      reason: `Order value (${orderAmount}đ) is below minimum required (${settings.minimumOrderValue}đ)`
    };
  }

  // Check 3: First order completion requirement
  if (settings.requireFirstOrderCompleted) {
    const priorCompletedOrders = await Order.countDocuments({
      buyerId: buyer.id,
      status: 'completed',
      id: { $ne: order.id }
    });
    if (priorCompletedOrders > 0) {
      // Not first completed order
      return { processed: false, reason: 'Not the first completed order of this buyer' };
    }
  }

  // Check 4: Account verification check if enabled
  if (settings.requireAccountVerification) {
    const isVerified =
      Boolean(buyer.isVerifiedSeller) ||
      (buyer.phone && buyer.phone.trim().length >= 9) ||
      buyer.status === 'active';

    if (!isVerified) {
      return { processed: false, reason: 'Buyer has not met verification requirements' };
    }
  }

  // Check 5: Referrer validity & Anti-Fraud
  const referrer = await User.findOne({ id: referral.referrerId });
  if (!referrer) {
    return { processed: false, reason: 'Referrer not found' };
  }

  if (referrer.status === 'banned') {
    return { processed: false, reason: 'Referrer is banned' };
  }

  if (referrer.id === buyer.id) {
    return { processed: false, reason: 'Self-referral fraud attempt' };
  }

  // Check 6: Max rewards per user limit
  const currentRewardedCount = await Referral.countDocuments({
    referrerId: referrer.id,
    status: 'rewarded'
  });

  if (currentRewardedCount >= settings.maxRewardsPerUser) {
    return { processed: false, reason: 'Referrer has reached maximum allowed rewards limit' };
  }

  // ATOMIC LOCK & UPDATE: Ensure referral can only be rewarded once (Idempotency)
  const lockedReferral = await Referral.findOneAndUpdate(
    { id: referral.id, status: 'pending' },
    {
      $set: {
        status: 'rewarded',
        qualifyingOrderId: order.id,
        referrerReward: settings.referrerReward,
        referredReward: settings.referredUserReward,
        rewardedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },
    { new: true }
  );

  if (!lockedReferral) {
    return { processed: false, reason: 'Referral was already locked or rewarded concurrently' };
  }

  // 1. REWARD REFERRER
  const refRewardAmount = settings.referrerReward;
  referrer.balance = (referrer.balance || 0) + refRewardAmount;
  await referrer.save();

  const referrerTx = new WalletTransaction({
    id: `tx_${Date.now()}_ref_${Math.random().toString(36).substring(2, 6)}`,
    userId: referrer.id,
    userName: referrer.name,
    userEmail: referrer.email,
    type: 'referral_reward',
    amount: refRewardAmount,
    status: 'success',
    referenceId: lockedReferral.id,
    orderCode: order.orderCode,
    note: `Thưởng giới thiệu bạn bè thành công từ đơn hàng #${order.orderCode || order.id}`,
    description: `Thưởng giới thiệu bạn bè (${buyer.name}) hoàn tất đơn hàng #${order.orderCode || order.id}`,
    createdAt: new Date().toISOString()
  });
  await referrerTx.save();

  try {
    const notifReferrer = new Notification({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: referrer.id,
      type: 'wallet',
      title: 'Nhận tiền thưởng giới thiệu thành công!',
      message: `Bạn đã nhận được ${refRewardAmount.toLocaleString('vi-VN')}đ tiền thưởng vì người bạn giới thiệu (${buyer.name}) đã hoàn tất đơn hàng đầu tiên #${order.orderCode || order.id}. Số dư ví mới: ${referrer.balance.toLocaleString('vi-VN')}đ.`,
      read: false,
      createdAt: new Date().toISOString()
    });
    await notifReferrer.save();
  } catch (e) {
    console.warn('[ReferralService] Notif warning:', e);
  }

  // 2. REWARD REFERRED USER (BUYER)
  const buyerRewardAmount = settings.referredUserReward;
  buyer.balance = (buyer.balance || 0) + buyerRewardAmount;
  buyer.referralRewardReceived = true;
  await buyer.save();

  const buyerTx = new WalletTransaction({
    id: `tx_${Date.now()}_ref_${Math.random().toString(36).substring(2, 6)}`,
    userId: buyer.id,
    userName: buyer.name,
    userEmail: buyer.email,
    type: 'referral_reward',
    amount: buyerRewardAmount,
    status: 'success',
    referenceId: lockedReferral.id,
    orderCode: order.orderCode,
    note: `Thưởng thành viên mới mua đơn hàng đầu tiên qua mã giới thiệu`,
    description: `Thưởng thành viên mới mua đơn hàng đầu tiên #${order.orderCode || order.id}`,
    createdAt: new Date().toISOString()
  });
  await buyerTx.save();

  try {
    const notifBuyer = new Notification({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: buyer.id,
      type: 'wallet',
      title: 'Nhận quà thành viên mới thành công!',
      message: `Chúc mừng bạn đã nhận được ${buyerRewardAmount.toLocaleString('vi-VN')}đ tiền thưởng vào ví vì hoàn tất đơn hàng đầu tiên qua mã giới thiệu. Số dư ví mới: ${buyer.balance.toLocaleString('vi-VN')}đ.`,
      read: false,
      createdAt: new Date().toISOString()
    });
    await notifBuyer.save();
  } catch (e) {
    console.warn('[ReferralService] Notif warning:', e);
  }

  console.log(`✅ [ReferralService] Successfully distributed referral rewards for Referral: ${lockedReferral.id} (Referrer: +${refRewardAmount}đ, Buyer: +${buyerRewardAmount}đ)`);

  return {
    processed: true,
    referralId: lockedReferral.id
  };
}

// User stats aggregator
export async function getUserReferralStats(userId: string) {
  const user = await User.findOne({ id: userId });
  if (!user) {
    throw new Error('User not found');
  }

  const referralCode = await ensureUserHasReferralCode(user);
  const settings = await getReferralSettings();

  const allUserReferrals = await Referral.find({ referrerId: userId }).sort({ createdAt: -1 });

  const totalInvited = allUserReferrals.length;
  const pendingCount = allUserReferrals.filter(r => r.status === 'pending').length;
  const qualifiedCount = allUserReferrals.filter(r => r.status === 'qualified').length;
  const rewardedCount = allUserReferrals.filter(r => r.status === 'rewarded').length;

  const totalRewardEarned = allUserReferrals
    .filter(r => r.status === 'rewarded')
    .reduce((sum, r) => sum + (r.referrerReward || settings.referrerReward), 0);

  const pendingReward = pendingCount * settings.referrerReward;

  // Enrich referral history with referred user info
  const referredUserIds = allUserReferrals.map(r => r.referredUserId);
  const referredUsers = await User.find({ id: { $in: referredUserIds } });
  const userMap = new Map<string, IUser>();
  referredUsers.forEach(u => userMap.set(u.id, u));

  // Orders map for qualifying orders
  const qualifyingOrderIds: string[] = allUserReferrals
    .map(r => r.qualifyingOrderId)
    .filter((id): id is string => typeof id === 'string' && id.trim().length > 0);
  const orders = qualifyingOrderIds.length > 0
    ? await Order.find({ id: { $in: qualifyingOrderIds } })
    : [];
  const orderMap = new Map<string, IOrder>();
  orders.forEach(o => orderMap.set(o.id, o));

  const history = allUserReferrals.map(r => {
    const referredUser = userMap.get(r.referredUserId);
    const order = r.qualifyingOrderId ? orderMap.get(r.qualifyingOrderId) : undefined;

    return {
      id: r.id,
      referredUserId: r.referredUserId,
      referredUserName: referredUser?.name || 'Thành viên LQMarket',
      referredUserEmail: referredUser ? `${referredUser.email.slice(0, 3)}***@${referredUser.email.split('@')[1] || 'com'}` : '***',
      referredUserAvatar: referredUser?.avatar || '',
      referralCode: r.referralCode,
      status: r.status,
      rewardAmount: r.referrerReward || settings.referrerReward,
      referredRewardAmount: r.referredReward || settings.referredUserReward,
      qualifyingOrderId: r.qualifyingOrderId || null,
      qualifyingOrderCode: order?.orderCode || null,
      rewardedAt: r.rewardedAt || null,
      createdAt: r.createdAt
    };
  });

  return {
    referralCode,
    referralLink: `https://cholienquan.com/?ref=${referralCode}`,
    settings: {
      enabled: settings.enabled,
      referrerReward: settings.referrerReward,
      referredUserReward: settings.referredUserReward,
      minimumOrderValue: settings.minimumOrderValue,
      requireFirstOrderCompleted: settings.requireFirstOrderCompleted,
      requireAccountVerification: settings.requireAccountVerification,
      maxRewardsPerUser: settings.maxRewardsPerUser
    },
    stats: {
      totalInvited,
      pendingCount,
      qualifiedCount,
      rewardedCount,
      totalRewardEarned,
      pendingReward
    },
    history
  };
}

// Admin Referral Management Data
export async function getAdminReferralsData(query: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const settings = await getReferralSettings();

  const filter: any = {};
  if (query.status && query.status !== 'all') {
    filter.status = query.status;
  }
  if (query.search) {
    const term = query.search.trim();
    filter.$or = [
      { referralCode: { $regex: term, $options: 'i' } },
      { referrerId: { $regex: term, $options: 'i' } },
      { referredUserId: { $regex: term, $options: 'i' } }
    ];
  }

  const allReferrals = await Referral.find({}).sort({ createdAt: -1 });

  // System stats
  const totalReferrals = allReferrals.length;
  const pendingCount = allReferrals.filter(r => r.status === 'pending').length;
  const qualifiedCount = allReferrals.filter(r => r.status === 'qualified').length;
  const rewardedCount = allReferrals.filter(r => r.status === 'rewarded').length;
  const totalRewardPaid = allReferrals
    .filter(r => r.status === 'rewarded')
    .reduce((sum, r) => sum + (r.referrerReward || 0) + (r.referredReward || 0), 0);

  // Top referrers aggregation
  const referrerStatsMap = new Map<string, { count: number; rewarded: number; totalReward: number }>();
  allReferrals.forEach(r => {
    const existing = referrerStatsMap.get(r.referrerId) || { count: 0, rewarded: 0, totalReward: 0 };
    existing.count++;
    if (r.status === 'rewarded') {
      existing.rewarded++;
      existing.totalReward += (r.referrerReward || settings.referrerReward);
    }
    referrerStatsMap.set(r.referrerId, existing);
  });

  const topReferrerEntries = Array.from(referrerStatsMap.entries())
    .sort((a, b) => b[1].rewarded - a[1].rewarded || b[1].count - a[1].count)
    .slice(0, 10);

  const topReferrerUserIds = topReferrerEntries.map(e => e[0]);
  const topUsers = await User.find({ id: { $in: topReferrerUserIds } });
  const topUserMap = new Map<string, IUser>();
  topUsers.forEach(u => topUserMap.set(u.id, u));

  const topReferrers = topReferrerEntries.map(([userId, stats]) => {
    const user = topUserMap.get(userId);
    return {
      userId,
      name: user?.name || 'Ẩn danh',
      email: user?.email || '',
      avatar: user?.avatar || '',
      referralCode: user?.referralCode || '',
      totalInvited: stats.count,
      rewardedCount: stats.rewarded,
      totalRewardEarned: stats.totalReward
    };
  });

  // Filtered list
  const filteredReferrals = await Referral.find(filter).sort({ createdAt: -1 });
  const userIdsToFetch = new Set<string>();
  filteredReferrals.forEach(r => {
    userIdsToFetch.add(r.referrerId);
    userIdsToFetch.add(r.referredUserId);
  });

  const relatedUsers = await User.find({ id: { $in: Array.from(userIdsToFetch) } });
  const relatedUserMap = new Map<string, IUser>();
  relatedUsers.forEach(u => relatedUserMap.set(u.id, u));

  const items = filteredReferrals.map(r => {
    const referrer = relatedUserMap.get(r.referrerId);
    const referred = relatedUserMap.get(r.referredUserId);
    return {
      id: r.id,
      referralCode: r.referralCode,
      referrerId: r.referrerId,
      referrerName: referrer?.name || 'N/A',
      referrerEmail: referrer?.email || 'N/A',
      referredUserId: r.referredUserId,
      referredUserName: referred?.name || 'N/A',
      referredUserEmail: referred?.email || 'N/A',
      qualifyingOrderId: r.qualifyingOrderId,
      referrerReward: r.referrerReward,
      referredReward: r.referredReward,
      status: r.status,
      rewardedAt: r.rewardedAt,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    };
  });

  return {
    settings,
    stats: {
      totalReferrals,
      pendingCount,
      qualifiedCount,
      rewardedCount,
      totalRewardPaid
    },
    topReferrers,
    referrals: items
  };
}
