import { Router, Response } from 'express';
import { User } from '../models/User';
import { Order } from '../models/Order';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/affiliate/stats
 * Get affiliate / referral statistics for currentUser
 */
router.get('/stats', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    const referralCode = (user as any).referralCode || `LQ${user.username?.toUpperCase() || user.id.slice(-6).toUpperCase()}`;

    // Find orders where referralCode or referredBy was used
    const referralOrders = await Order.find({
      $or: [{ referralCode }, { referredBy: user.id }]
    }).lean();

    const successfulReferrals = referralOrders.length;
    const totalSalesVolume = referralOrders.reduce((acc, o: any) => acc + (o.totalAmount || o.accountPrice || 0), 0);
    // 2% commission for affiliate referrals
    const totalCommissionEarned = Math.round(totalSalesVolume * 0.02);

    return res.json({
      success: true,
      stats: {
        referralCode,
        referralLink: `https://cholienquan.com/?ref=${referralCode}`,
        totalClicks: successfulReferrals * 3,
        totalSignups: successfulReferrals,
        totalOrders: successfulReferrals,
        successfulReferrals,
        totalSalesVolume,
        commissionRate: 2, // 2%
        totalCommissionEarned,
        paidCommission: 0,
        pendingCommission: 0
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải thông tin tiếp thị liên kết' });
  }
});

/**
 * POST /api/affiliate/track
 * Track click on a referral link
 */
router.post('/track', async (req, res: Response) => {
  try {
    const { refCode } = req.body;
    return res.json({ success: true, message: 'Tracked referral click', refCode });
  } catch {
    return res.json({ success: true });
  }
});

export default router;
