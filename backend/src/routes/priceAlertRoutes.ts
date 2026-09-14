import { Router, Response } from 'express';
import { PriceAlert } from '../models/PriceAlert';
import { Account } from '../models/Account';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/price-alerts
 * Get current user's price alerts
 */
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const alerts = await PriceAlert.find({ userId }).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: alerts, priceAlerts: alerts, alerts });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách theo dõi giá' });
  }
});

/**
 * POST /api/price-alerts
 * Create or toggle a price drop alert for an account
 */
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { accountId, targetPrice } = req.body;

    if (!accountId) {
      return res.status(400).json({ success: false, message: 'Thiếu mã tài khoản theo dõi' });
    }

    const account = await Account.findOne({ id: accountId });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản cần theo dõi' });
    }

    // Check if already subscribed
    const existing = await PriceAlert.findOne({ userId, accountId });
    if (existing) {
      // Update target price
      if (targetPrice) {
        existing.targetPrice = Number(targetPrice);
        await existing.save();
      }
      return res.json({
        success: true,
        message: 'Cập nhật giá kỳ vọng theo dõi thành công!',
        alert: existing.toJSON(),
        data: existing.toJSON()
      });
    }

    const price = Number(targetPrice) || Math.round(account.price * 0.9);
    const id = `alt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newAlert = new PriceAlert({
      id,
      userId,
      accountId: account.id,
      accountCode: account.code,
      accountTitle: account.title,
      initialPrice: account.price,
      currentPrice: account.price,
      targetPrice: price,
      isTriggered: false,
      createdAt: new Date().toISOString()
    });

    await newAlert.save();

    return res.status(201).json({
      success: true,
      message: `Đã bật chuông thông báo khi acc #${account.code} giảm giá!`,
      alert: newAlert.toJSON(),
      data: newAlert.toJSON()
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tạo thông báo giảm giá' });
  }
});

/**
 * DELETE /api/price-alerts/:id
 * Delete a price alert
 */
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const alert = await PriceAlert.findOne({
      $or: [
        { id, userId },
        { accountId: id, userId }
      ]
    });

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo theo dõi' });
    }

    await PriceAlert.deleteOne({ id: alert.id });
    return res.json({ success: true, message: 'Đã hủy theo dõi giảm giá tài khoản' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi hủy theo dõi' });
  }
});

export default router;
