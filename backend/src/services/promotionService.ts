import { Promotion, IPromotion } from '../models/Promotion';
import { PromotionRewardLog } from '../models/PromotionRewardLog';
import { WalletTransaction } from '../models/WalletTransaction';
import { User } from '../models/User';
import { Notification } from '../models/Notification';

export const INITIAL_PROMOTIONS_SEED: Partial<IPromotion>[] = [
  {
    id: 'promo_deposit_boost_2026',
    code: 'NAPVIET5',
    title: 'Đại Tiệc Nạp Ví - Tặng 5% Tiền Nạp',
    description: 'Nạp ví VietQR PayOS ngay hôm nay, nhận thêm 5% giá trị nạp trực tiếp vào số dư tài khoản. Áp dụng cho mọi giao dịch hợp lệ!',
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    terms: '• Nạp tối thiểu từ 100.000đ.\n• Thưởng 5% tối đa 20.000đ/giao dịch.\n• Tiền thưởng được cộng tự động ngay khi thanh toán VietQR thành công.\n• Không giới hạn số lần nạp trong thời gian diễn ra chương trình.',
    ctaText: 'Nạp Ví Nhận Ngay',
    ctaUrl: '/wallet',
    ctaAction: 'open_deposit',
    type: 'deposit_bonus',
    status: 'active',
    isActive: true,
    priority: 90,
    showPopup: true,
    popupDelaySeconds: 3,
    popupFrequency: 'once_per_session',
    hideHoursAfterClose: 24,
    targetAudience: 'all',
    bonusPercent: 5,
    bonusAmount: 0,
    minDeposit: 100000,
    maxBonusPerTx: 20000,
    maxBonusPerUser: 100000,
    firstDepositOnly: false,
    totalBudget: 10000000, // 10 triệu VNĐ
    spentBudget: 0,
    maxUses: 1000,
    usedCount: 0,
    impressions: 0,
    clicks: 0,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 60 * 86400000).toISOString(),
    createdBy: 'admin'
  },
  {
    id: 'promo_vip_discount_2026',
    code: 'LQMARKET10',
    title: 'Siêu Sale Acc VIP - Giảm 10% Tối Đa 200K',
    description: 'Sở hữu ngay tài khoản Liên Quân Mobile full tướng, full ngọc, skin SSS với mức giảm giá 10% cực sốc khi thanh toán!',
    bannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
    terms: '• Áp dụng cho đơn hàng từ 500.000đ.\n• Giảm tối đa 200.000đ.\n• Mỗi khách hàng được áp dụng tối đa 3 lần.',
    ctaText: 'Xem Kho Acc Ngay',
    ctaUrl: '/accounts',
    ctaAction: 'navigate',
    type: 'account_discount',
    status: 'active',
    isActive: true,
    priority: 80,
    showPopup: false,
    popupDelaySeconds: 4,
    popupFrequency: 'once_per_session',
    hideHoursAfterClose: 24,
    targetAudience: 'all',
    discountPercent: 10,
    discountAmount: 0,
    minOrder: 500000,
    maxDiscount: 200000,
    maxUsesPerUser: 3,
    totalBudget: 20000000,
    spentBudget: 0,
    maxUses: 500,
    usedCount: 0,
    impressions: 0,
    clicks: 0,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 60 * 86400000).toISOString(),
    createdBy: 'admin'
  }
];

let hasPromotionsSeeded = false;

export async function ensurePromotionsSeeded() {
  if (hasPromotionsSeeded) return;
  try {
    const count = await Promotion.countDocuments();
    if (count === 0) {
      for (const p of INITIAL_PROMOTIONS_SEED) {
        await Promotion.create(p);
      }
      console.log('[PROMOTION] Seeded initial marketing promotions into database');
    }
    hasPromotionsSeeded = true;
  } catch (err) {
    console.warn('[PROMOTION] Seed notice:', err);
  }
}

/**
 * Evaluates whether a deposit is eligible for bonus and calculates reward amount.
 */
export async function evaluateDepositBonus(params: {
  userId: string;
  amount: number;
  orderCode?: number;
}): Promise<{
  eligible: boolean;
  promotion: IPromotion | null;
  bonusAmount: number;
  reason?: string;
}> {
  try {
    await ensurePromotionsSeeded();
    const { userId, amount, orderCode } = params;

    if (!amount || amount <= 0) {
      return { eligible: false, promotion: null, bonusAmount: 0, reason: 'Số tiền nạp không hợp lệ' };
    }

    const now = new Date();

    // Find active deposit bonus promotions sorted by highest priority
    const promos: IPromotion[] = await Promotion.find({
      type: 'deposit_bonus',
      isActive: true,
      status: 'active'
    }).sort({ priority: -1 }).lean();

    if (!promos || promos.length === 0) {
      return { eligible: false, promotion: null, bonusAmount: 0, reason: 'Không có chương trình thưởng nạp khả dụng' };
    }

    // Resolve user details if needed
    const user: any = userId && userId !== 'user_guest' ? await User.findOne({ id: userId }) : null;

    for (const promo of promos) {
      // 1. Check date schedule
      if (promo.startDate && new Date(promo.startDate) > now) continue;
      if (promo.endDate && new Date(promo.endDate) < now) continue;

      // 2. Check total budget
      if (promo.totalBudget > 0 && promo.spentBudget >= promo.totalBudget) continue;

      // 3. Check total max uses
      if (promo.maxUses > 0 && promo.usedCount >= promo.maxUses) continue;

      // 4. Check min deposit requirement
      if (promo.minDeposit && amount < promo.minDeposit) continue;

      // 5. Check target audience & first deposit only
      if (promo.firstDepositOnly || promo.targetAudience === 'first_time_deposit') {
        if (!user) continue; // Guests cannot qualify for first deposit only
        const priorDepositCount = await WalletTransaction.countDocuments({
          userId: user.id,
          type: 'deposit',
          status: 'success',
          ...(orderCode ? { orderCode: { $ne: orderCode } } : {})
        });
        if (priorDepositCount > 0) continue;
      }

      if (promo.targetAudience === 'new_users_only') {
        if (!user || !user.createdAt) continue;
        const createdTime = new Date(user.createdAt).getTime();
        const sevenDaysAgo = Date.now() - 7 * 86400000;
        if (createdTime < sevenDaysAgo) continue;
      }

      // 6. Calculate bonus
      let bonus = 0;
      if (promo.bonusPercent && promo.bonusPercent > 0) {
        bonus = Math.round((amount * promo.bonusPercent) / 100);
        if (promo.maxBonusPerTx && promo.maxBonusPerTx > 0 && bonus > promo.maxBonusPerTx) {
          bonus = promo.maxBonusPerTx;
        }
      } else if (promo.bonusAmount && promo.bonusAmount > 0) {
        bonus = promo.bonusAmount;
      }

      if (bonus <= 0) continue;

      // 7. Check max bonus per user constraint
      if (promo.maxBonusPerUser && promo.maxBonusPerUser > 0 && user) {
        const userRewardLogs = await PromotionRewardLog.find({
          promotionId: promo.id,
          userId: user.id,
          status: 'success'
        }).lean();

        const userTotalBonusReceived = userRewardLogs.reduce((acc, log) => acc + (log.rewardAmount || 0), 0);
        if (userTotalBonusReceived >= promo.maxBonusPerUser) {
          continue; // User hit user-level cap
        }
        const remainingUserCap = promo.maxBonusPerUser - userTotalBonusReceived;
        bonus = Math.min(bonus, remainingUserCap);
      }

      // 8. Check remaining program budget
      if (promo.totalBudget > 0) {
        const remainingBudget = promo.totalBudget - promo.spentBudget;
        bonus = Math.min(bonus, remainingBudget);
      }

      if (bonus > 0) {
        return {
          eligible: true,
          promotion: promo,
          bonusAmount: bonus
        };
      }
    }

    return { eligible: false, promotion: null, bonusAmount: 0, reason: 'Giao dịch chưa thỏa mãn điều kiện ưu đãi' };
  } catch (error: any) {
    console.error('[PROMOTION] Error evaluating deposit bonus:', error);
    return { eligible: false, promotion: null, bonusAmount: 0, reason: error.message };
  }
}

// In-memory mutex lock for deposit bonus processing by orderCode
const bonusProcessingLock = new Set<number>();

/**
 * Safely and idempotently applies deposit bonus to the user wallet.
 * Enforces atomic idempotency by orderCode so duplicate webhooks/retries never double-credit.
 */
export async function applyDepositBonus(params: {
  userId: string;
  amount: number;
  orderCode: number;
  transactionId?: string;
}): Promise<{
  success: boolean;
  bonusAmount: number;
  alreadyProcessed?: boolean;
  promotionTitle?: string;
  promotionCode?: string;
  message?: string;
}> {
  const { userId, amount, orderCode, transactionId } = params;
  if (!orderCode) {
    return { success: false, bonusAmount: 0, message: 'Missing orderCode' };
  }

  // 1. Strict concurrency lock
  if (bonusProcessingLock.has(orderCode)) {
    console.log(`[PROMOTION] Bonus processing lock active for order #${orderCode}. Skipping concurrent execution.`);
    return { success: false, bonusAmount: 0, message: 'Lock active' };
  }

  bonusProcessingLock.add(orderCode);

  try {
    // 2. Strict DB Idempotency check: Has this orderCode already been rewarded?
    const existingLog = await PromotionRewardLog.findOne({
      orderCode,
      promotionType: 'deposit_bonus',
      status: 'success'
    });

    if (existingLog) {
      console.log(`[PROMOTION] Order #${orderCode} already has bonus log (${existingLog.rewardAmount}đ). Skipping duplicate bonus.`);
      return {
        success: true,
        alreadyProcessed: true,
        bonusAmount: existingLog.rewardAmount,
        promotionTitle: existingLog.promotionTitle,
        promotionCode: existingLog.promotionCode,
        message: 'Thưởng nạp đã được cấp trước đó'
      };
    }

    // Also check if a WalletTransaction of type deposit_bonus exists for this orderCode
    const existingBonusTx = await WalletTransaction.findOne({
      orderCode,
      type: 'deposit_bonus',
      status: 'success'
    });

    if (existingBonusTx) {
      console.log(`[PROMOTION] Order #${orderCode} already has bonus transaction (${existingBonusTx.amount}đ). Skipping duplicate bonus.`);
      return {
        success: true,
        alreadyProcessed: true,
        bonusAmount: existingBonusTx.amount,
        message: 'Giao dịch thưởng đã tồn tại'
      };
    }

    // 3. Resolve user
    const user: any = await User.findOne({ id: userId });
    if (!user) {
      console.warn(`[PROMOTION] Cannot find user ${userId} to apply bonus for order #${orderCode}`);
      return { success: false, bonusAmount: 0, message: 'User not found' };
    }

    // 4. Evaluate promotion eligibility
    const evalResult = await evaluateDepositBonus({ userId, amount, orderCode });
    if (!evalResult.eligible || !evalResult.promotion || evalResult.bonusAmount <= 0) {
      return { success: false, bonusAmount: 0, message: evalResult.reason || 'Not eligible' };
    }

    const promo = evalResult.promotion;
    const bonusAmount = evalResult.bonusAmount;

    // 5. Credit user balance atomically on backend
    const prevBalance = user.balance || 0;
    user.balance = prevBalance + bonusAmount;
    await user.save();

    console.log(`[PROMOTION BONUS] Credited +${bonusAmount}đ to user ${user.id} (${user.name}). New Balance: ${user.balance}`);

    // 6. Create distinct WalletTransaction for the bonus
    const bonusTxId = `tx_bonus_${orderCode}`;
    const bonusTx = new WalletTransaction({
      id: bonusTxId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      type: 'deposit_bonus',
      amount: bonusAmount,
      status: 'success',
      orderCode,
      referenceId: transactionId || `tx_${orderCode}`,
      note: `Thưởng nạp ví +${bonusAmount.toLocaleString('vi-VN')}đ từ CTKM [${promo.title}] (${promo.code}) - Mã GD #${orderCode}`,
      description: `BONUS ${promo.code} #${orderCode}`,
      processedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
    await bonusTx.save();

    // 7. Create immutable PromotionRewardLog
    const rewardLog = new PromotionRewardLog({
      id: `pmlog_${orderCode}_${Date.now()}`,
      promotionId: promo.id,
      promotionCode: promo.code,
      promotionTitle: promo.title,
      promotionType: 'deposit_bonus',
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      orderCode,
      transactionId: transactionId || `tx_${orderCode}`,
      baseAmount: amount,
      rewardAmount: bonusAmount,
      status: 'success',
      note: `Thưởng ${bonusAmount.toLocaleString('vi-VN')}đ (Nạp gốc: ${amount.toLocaleString('vi-VN')}đ)`,
      createdAt: new Date().toISOString()
    });
    await rewardLog.save();

    // 8. Update Promotion budget and usage counts
    const updatedPromoDoc = await Promotion.findOne({ id: promo.id });
    if (updatedPromoDoc) {
      updatedPromoDoc.spentBudget = (updatedPromoDoc.spentBudget || 0) + bonusAmount;
      updatedPromoDoc.usedCount = (updatedPromoDoc.usedCount || 0) + 1;
      if (updatedPromoDoc.totalBudget > 0 && updatedPromoDoc.spentBudget >= updatedPromoDoc.totalBudget) {
        updatedPromoDoc.status = 'out_of_budget';
      }
      await updatedPromoDoc.save();
    }

    // 9. Send Notification to User
    try {
      const notif = new Notification({
        id: `notif_bonus_${orderCode}_${Date.now()}`,
        userId: user.id,
        title: `🎁 Thưởng nạp ví: +${bonusAmount.toLocaleString('vi-VN')}đ`,
        message: `Chúc mừng bạn! Bạn nhận được thêm +${bonusAmount.toLocaleString('vi-VN')}đ thưởng nạp từ chương trình "${promo.title}". Số dư hiện tại: ${(user.balance).toLocaleString('vi-VN')}đ.`,
        type: 'wallet',
        read: false,
        createdAt: new Date().toISOString()
      });
      await notif.save();
    } catch (notifErr) {
      console.warn('[PROMOTION] Notification warning:', notifErr);
    }

    return {
      success: true,
      bonusAmount,
      promotionTitle: promo.title,
      promotionCode: promo.code,
      message: `Cấp thưởng thành công +${bonusAmount.toLocaleString('vi-VN')}đ`
    };
  } catch (error: any) {
    console.error('[PROMOTION] Failed to apply deposit bonus:', error);
    return { success: false, bonusAmount: 0, message: error.message };
  } finally {
    bonusProcessingLock.delete(orderCode);
  }
}

/**
 * Resolves the qualified active popup promotion for a visiting client.
 */
export async function getActivePopupPromotion(userContext?: {
  userId?: string;
  isLoggedIn?: boolean;
}): Promise<IPromotion | null> {
  try {
    await ensurePromotionsSeeded();
    const now = new Date();

    const promos: IPromotion[] = await Promotion.find({
      isActive: true,
      showPopup: true,
      status: 'active'
    }).sort({ priority: -1 }).lean();

    if (!promos || promos.length === 0) return null;

    let user: any = null;
    if (userContext?.userId && userContext.userId !== 'user_guest') {
      user = await User.findOne({ id: userContext.userId });
    }
    const isLoggedIn = !!user || !!userContext?.isLoggedIn;

    for (const p of promos) {
      // 1. Time checks
      if (p.startDate && new Date(p.startDate) > now) continue;
      if (p.endDate && new Date(p.endDate) < now) continue;

      // 2. Budget checks
      if (p.totalBudget > 0 && p.spentBudget >= p.totalBudget) continue;

      // 3. Max uses checks
      if (p.maxUses > 0 && p.usedCount >= p.maxUses) continue;

      // 4. Target audience checks
      if (p.targetAudience === 'guest_only' && isLoggedIn) continue;
      if (p.targetAudience === 'logged_in' && !isLoggedIn) continue;

      if (p.targetAudience === 'new_users_only') {
        if (!user || !user.createdAt) continue;
        const createdTime = new Date(user.createdAt).getTime();
        const sevenDaysAgo = Date.now() - 7 * 86400000;
        if (createdTime < sevenDaysAgo) continue;
      }

      if (p.targetAudience === 'first_time_deposit') {
        if (!user) continue;
        const priorDeposit = await WalletTransaction.findOne({
          userId: user.id,
          type: 'deposit',
          status: 'success'
        });
        if (priorDeposit) continue;
      }

      // First match with highest priority wins
      return p;
    }

    return null;
  } catch (err) {
    console.error('[PROMOTION] Error retrieving active popup promotion:', err);
    return null;
  }
}

/**
 * Increment impression count
 */
export async function recordPromotionImpression(promotionId: string) {
  try {
    await Promotion.updateOne({ id: promotionId }, { $inc: { impressions: 1 } });
  } catch (err) {
    console.warn('[PROMOTION] Impression tracking notice:', err);
  }
}

/**
 * Increment CTA click count
 */
export async function recordPromotionClick(promotionId: string) {
  try {
    await Promotion.updateOne({ id: promotionId }, { $inc: { clicks: 1 } });
  } catch (err) {
    console.warn('[PROMOTION] Click tracking notice:', err);
  }
}
