import { Router, Response } from 'express';
import { User } from '../models/User';
import { Account } from '../models/Account';
import { Order } from '../models/Order';
import { WalletTransaction } from '../models/WalletTransaction';
import { WithdrawalRequest } from '../models/WithdrawalRequest';
import { MysteryBox } from '../models/MysteryBox';
import { MysteryReward } from '../models/MysteryReward';
import { Setting } from '../models/Setting';
import { Notification } from '../models/Notification';
import { Conversation } from '../models/Conversation';
import { UserInventory } from '../models/UserInventory';
import { MysteryHistory } from '../models/MysteryHistory';
import { Review } from '../models/Review';
import { approvePayout, rejectPayout, getPayoutStats } from '../services/payoutService';
import {
  authenticateToken,
  requireAdmin,
  AuthenticatedRequest
} from '../middleware/auth';

const router = Router();

// Apply auth + requireAdmin to ALL admin routes
router.use(authenticateToken, requireAdmin);

// GET /api/admin/stats
router.get('/stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [
      totalUsers,
      totalAccounts,
      approvedAccounts,
      pendingAccounts,
      totalOrders,
      completedOrders,
      payoutStats,
      allTransactions
    ] = await Promise.all([
      User.countDocuments(),
      Account.countDocuments(),
      Account.countDocuments({ status: 'approved' }),
      Account.countDocuments({ status: 'pending' }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'completed' }),
      getPayoutStats(),
      WalletTransaction.find({ status: 'success' }).lean()
    ]);

    const totalRevenue = allTransactions
      .filter(t => t.type === 'deposit' && t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalFee = allTransactions
      .filter(t => t.type === 'seller_payout')
      .reduce((sum, t) => sum + Math.round(Math.abs(t.amount) * 0.05 / 0.95), 0);

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalAccounts,
        approvedAccounts,
        pendingAccounts,
        totalOrders,
        completedOrders,
        pendingWithdrawals: payoutStats.pendingCount,
        completedWithdrawals: payoutStats.completedCount,
        payoutStats,
        totalRevenue,
        totalFee
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải thống kê quản trị' });
  }
});

// GET /api/admin/payout-stats or /api/admin/payouts/stats
const handleGetPayoutStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await getPayoutStats();
    return res.json({ success: true, stats, data: stats });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải thống kê giải ngân' });
  }
};

router.get('/payout-stats', handleGetPayoutStats);
router.get('/payouts/stats', handleGetPayoutStats);
router.get('/withdrawals/stats', handleGetPayoutStats);

// GET /api/admin/users
router.get('/users', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: users, users });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách người dùng' });
  }
});

// PUT /api/admin/users/:id
router.put('/users/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role, status, balance, isVerifiedSeller, sellerTier } = req.body;

    const user = await User.findOne({ id });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    if (role !== undefined) user.role = role;
    if (status !== undefined) user.status = status;
    if (balance !== undefined) user.balance = Number(balance);
    if (isVerifiedSeller !== undefined) user.isVerifiedSeller = Boolean(isVerifiedSeller);
    if (sellerTier !== undefined) user.sellerTier = sellerTier;

    await user.save();

    return res.json({ success: true, message: 'Cập nhật người dùng thành công', user: user.toJSON() });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật người dùng' });
  }
});

// GET /api/admin/products (or /api/admin/accounts)
const getAdminProductsHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const products = await Account.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: products, products, accounts: products });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách sản phẩm' });
  }
};

router.get('/products', getAdminProductsHandler);
router.get('/accounts', getAdminProductsHandler);

// PUT /api/admin/products/:id/status (and /api/admin/accounts/:id/status)
const updateProductStatusHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const account = await Account.findOne({ id });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản' });
    }

    const prevStatus = account.status;
    account.status = status;
    if (rejectionReason) account.rejectionReason = rejectionReason;
    await account.save();

    // Create Notification for seller
    if (account.sellerId && status !== prevStatus) {
      try {
        if (status === 'approved') {
          const notif = new Notification({
            id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            userId: account.sellerId,
            type: 'account',
            title: 'Tài khoản đã được duyệt!',
            message: `Tài khoản "${account.title}" (#${account.code}) của bạn đã được Admin phê duyệt và hiển thị công khai trên sàn LQMarket.`,
            read: false,
            createdAt: new Date().toISOString()
          });
          await notif.save();
        } else if (status === 'rejected') {
          const notif = new Notification({
            id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            userId: account.sellerId,
            type: 'account',
            title: 'Tài khoản bị từ chối duyệt',
            message: `Tài khoản "${account.title}" (#${account.code}) bị từ chối duyệt. Lý do: ${rejectionReason || 'Thông tin chưa hợp lệ'}.`,
            read: false,
            createdAt: new Date().toISOString()
          });
          await notif.save();
        }
      } catch (notifErr) {
        console.warn('Admin account status notification notice:', notifErr);
      }
    }

    return res.json({ success: true, message: 'Cập nhật trạng thái duyệt thành công', account: account.toJSON() });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật trạng thái' });
  }
};

router.put('/products/:id/status', updateProductStatusHandler);
router.put('/accounts/:id/status', updateProductStatusHandler);

// GET /api/admin/orders
router.get('/orders', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: orders, orders });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách đơn hàng' });
  }
});

// GET /api/admin/transactions
router.get('/transactions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transactions = await WalletTransaction.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: transactions, transactions });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải biến động số dư' });
  }
});

// GET /api/admin/withdrawals
router.get('/withdrawals', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const withdrawals = await WithdrawalRequest.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: withdrawals, withdrawals });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách rút tiền' });
  }
});

// Approve payout / transaction / withdrawal handlers
const approvePayoutHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { refNote, adminNote, userId, amount, bankAccount, bankName } = req.body;
    const note = refNote || adminNote || '';

    const result = await approvePayout(id, note, {
      userId,
      amount: amount ? Number(amount) : undefined,
      bankAccount,
      bankName
    });

    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (error: any) {
    console.error('Admin approve payout error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi xác nhận giải ngân', error: error.message });
  }
};

const rejectPayoutHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, adminNote, userId, amount, bankAccount, bankName } = req.body;
    const note = reason || adminNote || 'Thông tin ngân hàng không hợp lệ';

    const result = await rejectPayout(id, note, {
      userId,
      amount: amount ? Number(amount) : undefined,
      bankAccount,
      bankName
    });

    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (error: any) {
    console.error('Admin reject payout error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi từ chối yêu cầu rút tiền', error: error.message });
  }
};

// Endpoints for admin payout approval
router.post('/transactions/:id/approve', approvePayoutHandler);
router.put('/transactions/:id/approve', approvePayoutHandler);
router.post('/transactions/:id/reject', rejectPayoutHandler);
router.put('/transactions/:id/reject', rejectPayoutHandler);

router.post('/withdrawals/:id/approve', approvePayoutHandler);
router.put('/withdrawals/:id/approve', approvePayoutHandler);
router.post('/withdrawals/:id/reject', rejectPayoutHandler);
router.put('/withdrawals/:id/reject', rejectPayoutHandler);

router.post('/payouts/:id/approve', approvePayoutHandler);
router.put('/payouts/:id/approve', approvePayoutHandler);
router.post('/payouts/:id/reject', rejectPayoutHandler);
router.put('/payouts/:id/reject', rejectPayoutHandler);

// PUT /api/admin/withdrawals/:id
router.put('/withdrawals/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNote, refNote, reason } = req.body;
    const note = refNote || adminNote || reason || '';

    if (status === 'approved' || status === 'completed' || status === 'success') {
      const result = await approvePayout(id, note, req.body);
      return res.status(result.success ? 200 : 400).json(result);
    } else if (status === 'rejected' || status === 'failed') {
      const result = await rejectPayout(id, note, req.body);
      return res.status(result.success ? 200 : 400).json(result);
    }

    return res.status(400).json({ success: false, message: 'Trạng thái cập nhật không hợp lệ' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi xử lý rút tiền' });
  }
});

// GET /api/admin/mystery-boxes
router.get('/mystery-boxes', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const boxes = await MysteryBox.find().lean();
    return res.json({ success: true, data: boxes, boxes });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải Túi Mù' });
  }
});

// PUT /api/admin/mystery-boxes/:id
router.put('/mystery-boxes/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const box = await MysteryBox.findOne({ id });
    if (!box) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy Túi Mù' });
    }

    Object.assign(box, req.body);
    await box.save();

    return res.json({ success: true, message: 'Cập nhật Túi Mù thành công', box: box.toJSON() });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật Túi Mù' });
  }
});

// GET /api/admin/rewards
router.get('/rewards', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rewards = await MysteryReward.find().lean();
    return res.json({ success: true, data: rewards, rewards });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải phần thưởng' });
  }
});

// POST /api/admin/rewards
router.post('/rewards', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rewardId = `rew_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newReward = new MysteryReward({
      id: rewardId,
      ...req.body
    });
    await newReward.save();
    return res.status(201).json({ success: true, message: 'Thêm phần thưởng thành công', reward: newReward.toJSON() });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi thêm phần thưởng' });
  }
});

// DELETE /api/admin/rewards/:id
router.delete('/rewards/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await MysteryReward.deleteOne({ id });
    return res.json({ success: true, message: 'Xóa phần thưởng thành công' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi xóa phần thưởng' });
  }
});

// GET /api/admin/settings
router.get('/settings', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const settings = await Setting.find().lean();
    const map: Record<string, any> = {};
    settings.forEach(s => {
      map[s.key] = s.value;
    });
    return res.json({ success: true, settings: map });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải cấu hình sàn' });
  }
});

// POST /api/admin/settings
router.post('/settings', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { settings } = req.body;
    if (typeof settings === 'object') {
      const nowIso = new Date().toISOString();
      for (const [key, value] of Object.entries(settings)) {
        await Setting.findOneAndUpdate(
          { key },
          { $set: { value, updatedAt: nowIso } },
          { upsert: true }
        );

        // If toggling mystery box, sync both keys and log
        if (key === 'mystery_box_active' || key === 'mystery_box_event_active') {
          const siblingKey = key === 'mystery_box_active' ? 'mystery_box_event_active' : 'mystery_box_active';
          console.log(`[MYSTERY BOX TOGGLE REQUEST] via admin settings: key: ${key}, value: ${value}`);
          await Setting.findOneAndUpdate(
            { key: siblingKey },
            { $set: { value, updatedAt: nowIso } },
            { upsert: true }
          );
          console.log(`[MYSTERY BOX SETTING SAVED TO MONGO] keys: [${key}, ${siblingKey}], value: ${value}`);
        }
      }
    }
    return res.json({ success: true, message: 'Lưu cấu hình sàn thành công!' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi lưu cấu hình' });
  }
});

// POST /api/admin/clear-database
router.post('/clear-database', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Delete market items, orders, transactions, chats, notifications, inventory, withdrawals
    await Promise.all([
      Account.deleteMany({}),
      Order.deleteMany({}),
      WalletTransaction.deleteMany({}),
      WithdrawalRequest.deleteMany({}),
      Notification.deleteMany({}),
      Conversation.deleteMany({}),
      UserInventory.deleteMany({}),
      MysteryHistory.deleteMany({}),
      Review.deleteMany({}),
      // Retain admin users, delete non-admin users
      User.deleteMany({ role: { $ne: 'admin' } })
    ]);

    return res.json({
      success: true,
      message: 'Đã xóa sạch toàn bộ dữ liệu thị trường (tài khoản, đơn hàng, giao dịch) trên cơ sở dữ liệu MongoDB Atlas! Đã giữ lại tài khoản Quản trị viên.'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi xóa dữ liệu trên MongoDB: ' + error.message });
  }
});

export default router;
