import { Router, Response } from 'express';
import {
  authenticateToken,
  requireAdmin,
  AuthenticatedRequest
} from '../middleware/auth';
import {
  validateReferralCode,
  getUserReferralStats,
  getReferralSettings,
  updateReferralSettings,
  getAdminReferralsData,
  processOrderReferralReward
} from '../services/referralService';
import { Order } from '../models/Order';
import { Referral } from '../models/Referral';

export const referralRouter = Router();

// ==========================================
// PUBLIC ENDPOINTS
// ==========================================

// Validate referral code (for register page or URL ?ref= checking)
referralRouter.post('/validate', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { referralCode } = req.body;
    const result = await validateReferralCode(referralCode);
    return res.json({
      success: result.valid,
      ...result
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      valid: false,
      message: error.message || 'Lỗi khi kiểm tra mã giới thiệu'
    });
  }
});

referralRouter.get('/validate/:code', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code } = req.params;
    const result = await validateReferralCode(code);
    return res.json({
      success: result.valid,
      ...result
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      valid: false,
      message: error.message || 'Lỗi khi kiểm tra mã giới thiệu'
    });
  }
});

// ==========================================
// USER AUTHENTICATED ENDPOINTS
// ==========================================

// Get current user referral profile, link, settings, and summary stats
referralRouter.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    const data = await getUserReferralStats(userId);
    return res.json({
      success: true,
      ...data
    });
  } catch (error: any) {
    console.error('[ReferralRoutes] /me error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Lỗi lấy dữ liệu giới thiệu' });
  }
});

// Get user referral statistics
referralRouter.get('/stats', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    const data = await getUserReferralStats(userId);
    return res.json({
      success: true,
      stats: data.stats,
      settings: data.settings,
      referralCode: data.referralCode,
      referralLink: data.referralLink
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Lỗi lấy thống kê giới thiệu' });
  }
});

// Get user referral invitation history
referralRouter.get('/history', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    const data = await getUserReferralStats(userId);
    return res.json({
      success: true,
      history: data.history
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Lỗi lấy lịch sử giới thiệu' });
  }
});

// Manual/backup claim endpoint if an eligible order wasn't processed
referralRouter.post('/claim', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    // Check if current user is a referred user with an eligible completed order
    const pendingReferral = await Referral.findOne({ referredUserId: userId, status: 'pending' });
    if (!pendingReferral) {
      return res.json({
        success: false,
        message: 'Bạn không có phần thưởng giới thiệu nào đang chờ nhận.'
      });
    }

    // Find first completed order of this user
    const qualifyingOrder = await Order.findOne({ buyerId: userId, status: 'completed' });
    if (!qualifyingOrder) {
      return res.json({
        success: false,
        message: 'Bạn chưa hoàn tất đơn hàng đầu tiên để nhận thưởng giới thiệu.'
      });
    }

    const result = await processOrderReferralReward(qualifyingOrder.id);
    if (result.processed) {
      return res.json({
        success: true,
        message: 'Chúc mừng bạn đã nhận thưởng giới thiệu thành công!'
      });
    } else {
      return res.json({
        success: false,
        message: result.reason || 'Đơn hàng chưa đủ điều kiện nhận thưởng giới thiệu.'
      });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Lỗi khi nhận thưởng giới thiệu' });
  }
});

// ==========================================
// ADMIN ENDPOINTS
// ==========================================

// Get all referrals & system stats for Admin Dashboard
referralRouter.get('/admin/all', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, search, page, limit } = req.query;
    const data = await getAdminReferralsData({
      status: status as string,
      search: search as string,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50
    });
    return res.json({
      success: true,
      ...data
    });
  } catch (error: any) {
    console.error('[ReferralRoutes] admin/all error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Lỗi tải danh sách referral admin' });
  }
});

// Get referral settings for Admin
referralRouter.get('/admin/settings', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const settings = await getReferralSettings();
    return res.json({
      success: true,
      settings
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Lỗi lấy cấu hình referral' });
  }
});

// Update referral settings for Admin
const updateSettingsHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminUser = {
      adminId: req.user?.userId || 'admin',
      adminName: req.user?.email || 'Super Admin'
    };
    const updated = await updateReferralSettings(req.body, adminUser);
    return res.json({
      success: true,
      message: 'Cập nhật cấu hình Referral thành công!',
      settings: updated
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Lỗi cập nhật cấu hình referral' });
  }
};

referralRouter.patch('/admin/settings', authenticateToken, requireAdmin, updateSettingsHandler);
referralRouter.put('/admin/settings', authenticateToken, requireAdmin, updateSettingsHandler);
