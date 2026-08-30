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
      pendingWithdrawals,
      allTransactions
    ] = await Promise.all([
      User.countDocuments(),
      Account.countDocuments(),
      Account.countDocuments({ status: 'approved' }),
      Account.countDocuments({ status: 'pending' }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'completed' }),
      WithdrawalRequest.countDocuments({ status: 'pending' }),
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
        pendingWithdrawals,
        totalRevenue,
        totalFee
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải thống kê quản trị' });
  }
});

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
    const withdrawals = await WithdrawalRequest.find().sort({ createdAt: -1 }).lean();

    // Map existing transaction IDs & keys
    const existingTxIds = new Set(transactions.map(t => t.id));

    // If any withdrawal request is missing from transactions list, include it
    const mergedList = [...transactions];
    for (const w of withdrawals) {
      if (!existingTxIds.has(w.id)) {
        // Check if there is already a transaction matching this withdrawal
        const hasMatching = transactions.some(
          t => t.type === 'withdraw' && t.userId === w.userId && Math.abs(t.amount) === w.amount && Math.abs(new Date(t.createdAt).getTime() - new Date(w.createdAt).getTime()) < 60000
        );
        if (!hasMatching) {
          mergedList.push({
            id: w.id,
            userId: w.userId,
            userName: w.userName || 'Người dùng',
            userEmail: w.userEmail || '',
            type: 'withdraw',
            amount: -w.amount,
            status: w.status === 'approved' ? 'success' : w.status === 'rejected' ? 'failed' : 'pending',
            note: `Yêu cầu rút tiền về ${w.bankName} (${w.bankAccount})`,
            bankName: w.bankName,
            bankCode: w.bankCode || '970422',
            bankAccount: w.bankAccount,
            bankAccountName: w.bankAccountName,
            rejectReason: w.rejectionReason,
            processedAt: w.processedAt,
            createdAt: w.createdAt
          } as any);
        }
      }
    }

    // Sort descending by createdAt
    mergedList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json({ success: true, data: mergedList, transactions: mergedList });
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

// PUT /api/admin/transactions/:id/approve
router.put('/transactions/:id/approve', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { refNote } = req.body;

    const tx = await WalletTransaction.findOne({ id });
    if (tx) {
      tx.status = 'success';
      tx.processedAt = new Date().toISOString();
      if (refNote) {
        tx.note = `${tx.note} (Mã GD giải ngân: ${refNote})`;
      }
      await tx.save();

      const user = await User.findOne({ id: tx.userId });
      if (user) {
        user.pendingBalance = Math.max(0, (user.pendingBalance || 0) - Math.abs(tx.amount));
        await user.save();
      }
    }

    const wdr = await WithdrawalRequest.findOne({
      $or: [{ id }, { userId: tx?.userId, amount: tx ? Math.abs(tx.amount) : undefined }]
    });
    if (wdr) {
      wdr.status = 'approved';
      wdr.referenceNote = refNote;
      wdr.processedAt = new Date().toISOString();
      await wdr.save();
    }

    return res.json({ success: true, message: 'Đã giải ngân và duyệt lệnh rút tiền thành công!' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi duyệt lệnh rút tiền' });
  }
});

// PUT /api/admin/transactions/:id/reject
router.put('/transactions/:id/reject', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason = 'Thông tin ngân hàng không hợp lệ' } = req.body;

    const tx = await WalletTransaction.findOne({ id });
    if (tx) {
      tx.status = 'failed';
      tx.rejectReason = reason;
      tx.processedAt = new Date().toISOString();
      await tx.save();

      const refundAmount = Math.abs(tx.amount);
      const user = await User.findOne({ id: tx.userId });
      if (user) {
        user.pendingBalance = Math.max(0, (user.pendingBalance || 0) - refundAmount);
        user.balance = (user.balance || 0) + refundAmount;
        await user.save();

        const refundTx = new WalletTransaction({
          id: `tx_${Date.now()}_refund`,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          type: 'refund',
          amount: refundAmount,
          status: 'success',
          note: `Hoàn tiền yêu cầu rút không thành công: ${reason}`,
          createdAt: new Date().toISOString()
        });
        await refundTx.save();
      }
    }

    const wdr = await WithdrawalRequest.findOne({
      $or: [{ id }, { userId: tx?.userId, amount: tx ? Math.abs(tx.amount) : undefined }]
    });
    if (wdr) {
      wdr.status = 'rejected';
      wdr.rejectionReason = reason;
      wdr.processedAt = new Date().toISOString();
      await wdr.save();
    }

    return res.json({ success: true, message: 'Đã từ chối lệnh rút tiền và hoàn lại tiền vào ví thành viên.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi từ chối rút tiền' });
  }
});

// PUT /api/admin/withdrawals/:id
router.put('/withdrawals/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    const request = await WithdrawalRequest.findOne({
      $or: [{ id }, { id: id.replace('tx_', 'wdr_') }]
    });

    if (request) {
      const previousStatus = request.status;
      request.status = status === 'completed' ? 'approved' : status;
      if (adminNote !== undefined) {
        if (status === 'rejected') {
          request.rejectionReason = adminNote;
        } else {
          request.referenceNote = adminNote;
        }
      }
      request.processedAt = new Date().toISOString();
      await request.save();

      const user = await User.findOne({ id: request.userId });

      if (user) {
        if ((status === 'completed' || status === 'approved') && previousStatus === 'pending') {
          user.pendingBalance = Math.max(0, (user.pendingBalance || 0) - request.amount);
          await user.save();

          const notif = new Notification({
            id: `notif_${Date.now()}`,
            userId: user.id,
            title: 'Rút tiền thành công',
            message: `Yêu cầu rút ${request.amount.toLocaleString('vi-VN')}đ về tài khoản ngân hàng ${request.bankName} (${request.bankAccount}) đã được chuyển khoản thành công.`,
            type: 'wallet',
            createdAt: new Date().toISOString()
          });
          await notif.save();
        } else if (status === 'rejected' && previousStatus === 'pending') {
          user.pendingBalance = Math.max(0, (user.pendingBalance || 0) - request.amount);
          user.balance = (user.balance || 0) + request.amount;
          await user.save();

          const refundTx = new WalletTransaction({
            id: `tx_${Date.now()}_refund`,
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            type: 'refund',
            amount: request.amount,
            status: 'success',
            note: `Hoàn tiền yêu cầu rút không thành công: ${adminNote || 'Sai thông tin STK'}`,
            createdAt: new Date().toISOString()
          });
          await refundTx.save();

          const notif = new Notification({
            id: `notif_${Date.now()}`,
            userId: user.id,
            title: 'Yêu cầu rút tiền bị từ chối',
            message: `Yêu cầu rút ${request.amount.toLocaleString('vi-VN')}đ đã bị từ chối (${adminNote || 'Thông tin ngân hàng không hợp lệ'}). Tiền đã được hoàn lại vào số dư ví của bạn.`,
            type: 'wallet',
            createdAt: new Date().toISOString()
          });
          await notif.save();
        }
      }
    }

    // Also update WalletTransaction
    const tx = await WalletTransaction.findOne({
      $or: [{ id }, { id: id.replace('wdr_', 'tx_') }]
    });
    if (tx) {
      tx.status = (status === 'completed' || status === 'approved') ? 'success' : status === 'rejected' ? 'failed' : 'pending';
      tx.processedAt = new Date().toISOString();
      if (adminNote) {
        if (status === 'rejected') {
          tx.rejectReason = adminNote;
        } else {
          tx.note = `${tx.note} (Mã GD giải ngân: ${adminNote})`;
        }
      }
      await tx.save();
    }

    return res.json({
      success: true,
      message: 'Xử lý yêu cầu rút tiền thành công'
    });
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
      for (const [key, value] of Object.entries(settings)) {
        await Setting.findOneAndUpdate(
          { key },
          { $set: { value, updatedAt: new Date().toISOString() } },
          { upsert: true }
        );
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
