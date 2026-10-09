import { Router, Response } from 'express';
import { Promotion, IPromotion } from '../models/Promotion';
import { PromotionRewardLog } from '../models/PromotionRewardLog';
import { Coupon } from '../models/Coupon';
import { WalletTransaction } from '../models/WalletTransaction';
import { AuditLog } from '../models/AuditLog';
import {
  ensurePromotionsSeeded,
  getActivePopupPromotion,
  recordPromotionImpression,
  recordPromotionClick,
  applyDepositBonus
} from '../services/promotionService';
import {
  optionalAuth,
  authenticateToken,
  requireAdmin,
  AuthenticatedRequest
} from '../middleware/auth';

const router = Router();

/**
 * GET /api/promotions/active-popup
 * Client-facing: Resolves the highest-priority active popup promotion
 */
router.get('/active-popup', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await ensurePromotionsSeeded();
    const userId = req.user?.userId || (req.query.userId as string);
    const isLoggedIn = !!req.user?.userId || req.query.isLoggedIn === 'true';

    const activePromotion = await getActivePopupPromotion({ userId, isLoggedIn });

    return res.json({
      success: true,
      promotion: activePromotion
    });
  } catch (error: any) {
    console.error('Error fetching active popup promotion:', error);
    return res.status(500).json({ success: false, message: 'Lỗi tải chương trình khuyến mãi' });
  }
});

/**
 * POST /api/promotions/:id/impression
 * Record popup view/impression
 */
router.post('/:id/impression', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await recordPromotionImpression(id);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/promotions/:id/click
 * Record popup CTA click
 */
router.post('/:id/click', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await recordPromotionClick(id);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/promotions
 * Admin: List all promotions with filters, search and sorting
 */
router.get('/', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await ensurePromotionsSeeded();
    const { search, type, status, sortBy = 'priority', sortOrder = 'desc' } = req.query;

    const query: any = {};
    if (type && type !== 'all') {
      query.type = type;
    }
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      const searchRegex = new RegExp(String(search).trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { code: searchRegex },
        { description: searchRegex }
      ];
    }

    const sortConfig: any = {};
    sortConfig[String(sortBy)] = sortOrder === 'asc' ? 1 : -1;

    const promotions = await Promotion.find(query).sort(sortConfig).lean();

    return res.json({
      success: true,
      count: promotions.length,
      promotions
    });
  } catch (error: any) {
    console.error('Error fetching admin promotions:', error);
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách khuyến mãi' });
  }
});

/**
 * GET /api/promotions/stats
 * Admin: Marketing performance KPI statistics
 */
router.get('/stats', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await ensurePromotionsSeeded();
    const promotions = await Promotion.find().lean();
    const rewardLogs = await PromotionRewardLog.find().lean();

    const totalPromotions = promotions.length;
    const activePromotions = promotions.filter(p => p.status === 'active' && p.isActive).length;
    const totalBudget = promotions.reduce((acc, p) => acc + (p.totalBudget || 0), 0);
    const spentBudget = promotions.reduce((acc, p) => acc + (p.spentBudget || 0), 0);
    const totalImpressions = promotions.reduce((acc, p) => acc + (p.impressions || 0), 0);
    const totalClicks = promotions.reduce((acc, p) => acc + (p.clicks || 0), 0);
    const totalConversions = promotions.reduce((acc, p) => acc + (p.usedCount || 0), 0);

    const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0';

    const depositBonusLogs = rewardLogs.filter(r => r.promotionType === 'deposit_bonus' && r.status === 'success');
    const discountLogs = rewardLogs.filter(r => r.promotionType === 'account_discount' && r.status === 'success');

    const totalDepositBonusGranted = depositBonusLogs.reduce((acc, r) => acc + (r.rewardAmount || 0), 0);
    const totalDiscountGranted = discountLogs.reduce((acc, r) => acc + (r.rewardAmount || 0), 0);

    return res.json({
      success: true,
      stats: {
        totalPromotions,
        activePromotions,
        totalBudget,
        spentBudget,
        remainingBudget: Math.max(0, totalBudget - spentBudget),
        totalImpressions,
        totalClicks,
        ctr: `${ctr}%`,
        totalConversions,
        depositBonusCount: depositBonusLogs.length,
        totalDepositBonusGranted,
        discountOrderCount: discountLogs.length,
        totalDiscountGranted
      }
    });
  } catch (error: any) {
    console.error('Error fetching promotion stats:', error);
    return res.status(500).json({ success: false, message: 'Lỗi tính toán thống kê khuyến mãi' });
  }
});

/**
 * GET /api/promotions/reward-logs
 * Admin: Audit logs of rewarded bonuses and applied discounts
 */
router.get('/reward-logs', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { promotionId, orderCode, type, limit = 50 } = req.query;
    const query: any = {};
    if (promotionId) query.promotionId = promotionId;
    if (orderCode) query.orderCode = Number(orderCode);
    if (type) query.promotionType = type;

    const logs = await PromotionRewardLog.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    return res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải lịch sử cấp thưởng' });
  }
});

/**
 * POST /api/promotions
 * Admin: Create a new promotion
 */
router.post('/', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      code,
      title,
      description,
      bannerUrl,
      terms,
      ctaText,
      ctaUrl,
      ctaAction,
      type,
      status = 'active',
      isActive = true,
      priority = 10,
      showPopup = true,
      popupDelaySeconds = 3,
      popupFrequency = 'once_per_session',
      hideHoursAfterClose = 24,
      targetAudience = 'all',
      bonusPercent = 0,
      bonusAmount = 0,
      minDeposit = 0,
      maxBonusPerTx = 0,
      maxBonusPerUser = 0,
      firstDepositOnly = false,
      discountPercent = 0,
      discountAmount = 0,
      minOrder = 0,
      maxDiscount = 0,
      maxUsesPerUser = 1,
      totalBudget = 0,
      maxUses = 0,
      startDate,
      endDate
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Tiêu đề chương trình không được để trống' });
    }

    const cleanCode = (code || `PROMO_${Date.now().toString().slice(-6)}`).trim().toUpperCase();
    const existing = await Promotion.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({ success: false, message: `Mã chương trình [${cleanCode}] đã tồn tại` });
    }

    const promoId = `promo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const newPromotion = new Promotion({
      id: promoId,
      code: cleanCode,
      title: title.trim(),
      description: description || '',
      bannerUrl: bannerUrl || '',
      terms: terms || '',
      ctaText: ctaText || 'Xem Ngay',
      ctaUrl: ctaUrl || '/',
      ctaAction: ctaAction || 'navigate',
      type: type || 'deposit_bonus',
      status,
      isActive: Boolean(isActive),
      priority: Number(priority) || 10,
      showPopup: Boolean(showPopup),
      popupDelaySeconds: Math.max(1, Math.min(30, Number(popupDelaySeconds) || 3)),
      popupFrequency,
      hideHoursAfterClose: Number(hideHoursAfterClose) || 24,
      targetAudience,
      bonusPercent: Number(bonusPercent) || 0,
      bonusAmount: Number(bonusAmount) || 0,
      minDeposit: Number(minDeposit) || 0,
      maxBonusPerTx: Number(maxBonusPerTx) || 0,
      maxBonusPerUser: Number(maxBonusPerUser) || 0,
      firstDepositOnly: Boolean(firstDepositOnly),
      discountPercent: Number(discountPercent) || 0,
      discountAmount: Number(discountAmount) || 0,
      minOrder: Number(minOrder) || 0,
      maxDiscount: Number(maxDiscount) || 0,
      maxUsesPerUser: Number(maxUsesPerUser) || 1,
      totalBudget: Number(totalBudget) || 0,
      spentBudget: 0,
      maxUses: Number(maxUses) || 0,
      usedCount: 0,
      impressions: 0,
      clicks: 0,
      startDate: startDate || nowIso,
      endDate: endDate || new Date(Date.now() + 30 * 86400000).toISOString(),
      createdBy: req.user?.username || 'admin',
      updatedBy: req.user?.username || 'admin',
      createdAt: nowIso,
      updatedAt: nowIso
    });

    await newPromotion.save();

    // If type is account_discount, also create or sync Coupon entry
    if (newPromotion.type === 'account_discount') {
      try {
        const couponExists = await Coupon.findOne({ code: cleanCode });
        if (!couponExists) {
          await Coupon.create({
            id: `cpn_${promoId}`,
            code: cleanCode,
            discountPercent: newPromotion.discountPercent,
            discountAmount: newPromotion.discountAmount,
            minOrder: newPromotion.minOrder,
            maxDiscount: newPromotion.maxDiscount,
            maxUses: newPromotion.maxUses || 1000,
            usedCount: 0,
            maxUsesPerUser: newPromotion.maxUsesPerUser,
            totalBudget: newPromotion.totalBudget,
            spentBudget: 0,
            promotionId: promoId,
            validFrom: newPromotion.startDate,
            validTo: newPromotion.endDate,
            isActive: newPromotion.isActive && newPromotion.status === 'active',
            description: newPromotion.description || newPromotion.title,
            createdAt: nowIso
          });
        }
      } catch (cpnErr) {
        console.warn('Coupon sync warning:', cpnErr);
      }
    }

    // Log admin audit
    try {
      await AuditLog.create({
        id: `audit_${Date.now()}`,
        adminId: req.user?.userId || 'admin',
        adminName: req.user?.name || 'Admin',
        action: 'create_promotion',
        targetType: 'promotion',
        targetId: promoId,
        details: `Tạo chương trình khuyến mãi [${cleanCode}] ${title}`,
        timestamp: nowIso
      });
    } catch {}

    return res.status(201).json({
      success: true,
      message: 'Tạo chương trình khuyến mãi thành công',
      promotion: newPromotion
    });
  } catch (error: any) {
    console.error('Error creating promotion:', error);
    return res.status(500).json({ success: false, message: error.message || 'Lỗi tạo chương trình khuyến mãi' });
  }
});

/**
 * PUT /api/promotions/:id
 * Admin: Update promotion details
 */
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await Promotion.findOne({ id });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy chương trình khuyến mãi' });
    }

    const updates = { ...req.body, updatedAt: new Date().toISOString(), updatedBy: req.user?.username || 'admin' };
    delete updates.id;
    delete updates._id;

    if (updates.code) {
      updates.code = String(updates.code).trim().toUpperCase();
      const duplicate = await Promotion.findOne({ code: updates.code, id: { $ne: id } });
      if (duplicate) {
        return res.status(400).json({ success: false, message: `Mã [${updates.code}] đã được sử dụng bởi chương trình khác` });
      }
    }

    const updated = await Promotion.findOneAndUpdate({ id }, { $set: updates }, { new: true });

    // Sync with Coupon if account_discount
    if (updated?.type === 'account_discount') {
      try {
        await Coupon.findOneAndUpdate(
          { $or: [{ promotionId: id }, { code: updated.code }] },
          {
            $set: {
              code: updated.code,
              discountPercent: updated.discountPercent,
              discountAmount: updated.discountAmount,
              minOrder: updated.minOrder,
              maxDiscount: updated.maxDiscount,
              maxUses: updated.maxUses || 1000,
              maxUsesPerUser: updated.maxUsesPerUser,
              totalBudget: updated.totalBudget,
              validFrom: updated.startDate,
              validTo: updated.endDate,
              isActive: updated.isActive && updated.status === 'active',
              description: updated.description || updated.title
            }
          }
        );
      } catch (cpnErr) {
        console.warn('Coupon update sync warning:', cpnErr);
      }
    }

    return res.json({
      success: true,
      message: 'Cập nhật chương trình khuyến mãi thành công',
      promotion: updated
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Lỗi cập nhật khuyến mãi' });
  }
});

/**
 * PATCH /api/promotions/:id/status
 * Admin: Quick status toggle (active, paused, expired)
 */
router.patch('/:id/status', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, isActive } = req.body;

    const promo = await Promotion.findOne({ id });
    if (!promo) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy chương trình' });
    }

    if (status !== undefined) promo.status = status;
    if (isActive !== undefined) promo.isActive = Boolean(isActive);
    promo.updatedAt = new Date().toISOString();
    promo.updatedBy = req.user?.username || 'admin';
    await promo.save();

    // Sync with Coupon
    if (promo.type === 'account_discount') {
      await Coupon.updateOne(
        { $or: [{ promotionId: id }, { code: promo.code }] },
        { $set: { isActive: promo.isActive && promo.status === 'active' } }
      ).catch(() => {});
    }

    return res.json({
      success: true,
      message: `Đã cập nhật trạng thái chương trình thành: ${promo.status}`,
      promotion: promo
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi thay đổi trạng thái' });
  }
});

/**
 * POST /api/promotions/:id/clone
 * Admin: Duplicate an existing campaign
 */
router.post('/:id/clone', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const original = await Promotion.findOne({ id }).lean();
    if (!original) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy chương trình cần nhân bản' });
    }

    const clonedId = `promo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const clonedCode = `${original.code}_COPY_${Math.floor(100 + Math.random() * 900)}`;

    const clonedDoc = new Promotion({
      ...original,
      id: clonedId,
      code: clonedCode,
      title: `${original.title} (Bản sao)`,
      status: 'draft',
      isActive: false,
      spentBudget: 0,
      usedCount: 0,
      impressions: 0,
      clicks: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await clonedDoc.save();

    return res.json({
      success: true,
      message: `Nhân bản thành công chương trình [${clonedCode}]`,
      promotion: clonedDoc
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Lỗi nhân bản khuyến mãi' });
  }
});

/**
 * DELETE /api/promotions/:id
 * Admin: Delete promotion
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Promotion.findOneAndDelete({ id });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy chương trình' });
    }

    // Also disable or delete synced coupon
    Coupon.deleteOne({ promotionId: id }).catch(() => {});

    return res.json({
      success: true,
      message: 'Đã xóa chương trình khuyến mãi thành công'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi xóa khuyến mãi' });
  }
});

/**
 * POST /api/promotions/retry-deposit-bonus
 * Admin: Safely retries granting deposit bonus for an orderCode if deposit succeeded but bonus was missed
 */
router.post('/retry-deposit-bonus', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderCode } = req.body;
    if (!orderCode) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã đơn (orderCode)' });
    }

    const numOrderCode = Number(orderCode);
    const depositTx: any = await WalletTransaction.findOne({
      orderCode: numOrderCode,
      type: 'deposit',
      status: 'success'
    });

    if (!depositTx) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy giao dịch nạp tiền thành công cho mã đơn #${numOrderCode}`
      });
    }

    const bonusResult = await applyDepositBonus({
      userId: depositTx.userId,
      amount: depositTx.amount,
      orderCode: numOrderCode,
      transactionId: depositTx.id
    });

    if (!bonusResult.success) {
      return res.status(400).json({
        success: false,
        message: bonusResult.message || 'Không thể cấp thưởng cho giao dịch này'
      });
    }

    return res.json({
      success: true,
      message: bonusResult.alreadyProcessed
        ? `Giao dịch #${numOrderCode} đã được cấp thưởng trước đó (${bonusResult.bonusAmount.toLocaleString('vi-VN')}đ)`
        : `Cấp bù thưởng thành công +${bonusResult.bonusAmount.toLocaleString('vi-VN')}đ cho mã đơn #${numOrderCode}`,
      result: bonusResult
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Lỗi cấp bù thưởng nạp' });
  }
});

export default router;
