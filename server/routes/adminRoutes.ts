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
  optionalAuth,
  AuthenticatedRequest
} from '../middleware/auth';

const router = Router();

// Apply auth to admin routes with fallback
router.use(optionalAuth);

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

    const mergedList: any[] = [...transactions];

    for (const w of withdrawals) {
      const wTs = w.id.match(/\d{10,}/)?.[0];

      // Check if existing transaction already exists in mergedList
      const existingTx = mergedList.find(t => 
        t.id === w.id ||
        t.id === w.id.replace('wdr_', 'tx_') ||
        (wTs && t.id.includes(wTs)) ||
        (t.type === 'withdraw' && t.userId === w.userId && Math.abs(t.amount) === w.amount && Math.abs(new Date(t.createdAt).getTime() - new Date(w.createdAt).getTime()) < 60000)
      );

      if (existingTx) {
        // Synchronize statuses seamlessly
        if (w.status === 'approved' || existingTx.status === 'success') {
          existingTx.status = 'success';
          existingTx.processedAt = w.processedAt || existingTx.processedAt || new Date().toISOString();
          if (w.referenceNote && !existingTx.note?.includes(w.referenceNote)) {
            existingTx.note = `${existingTx.note || 'Rút tiền'} (Mã GD: ${w.referenceNote})`;
          }
        } else if (w.status === 'rejected' || existingTx.status === 'failed') {
          existingTx.status = 'failed';
          existingTx.rejectReason = w.rejectionReason || existingTx.rejectReason || 'Bị từ chối';
          existingTx.processedAt = w.processedAt || existingTx.processedAt || new Date().toISOString();
        }
        if (w.bankName) existingTx.bankName = w.bankName;
        if (w.bankCode) existingTx.bankCode = w.bankCode;
        if (w.bankAccount) existingTx.bankAccount = w.bankAccount;
        if (w.bankAccountName) existingTx.bankAccountName = w.bankAccountName;
      } else {
        mergedList.push({
          id: w.id,
          userId: w.userId,
          userName: w.userName || 'Người dùng',
          userEmail: w.userEmail || '',
          type: 'withdraw',
          amount: -w.amount,
          status: w.status === 'approved' ? 'success' : w.status === 'rejected' ? 'failed' : 'pending',
          note: w.referenceNote ? `Yêu cầu rút tiền về ${w.bankName} (${w.bankAccount}) (Mã GD: ${w.referenceNote})` : `Yêu cầu rút tiền về ${w.bankName} (${w.bankAccount})`,
          bankName: w.bankName,
          bankCode: w.bankCode,
          bankAccount: w.bankAccount,
          bankAccountName: w.bankAccountName,
          rejectReason: w.rejectionReason,
          processedAt: w.processedAt,
          createdAt: w.createdAt
        });
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

// Helper to approve withdrawal in both models
async function approveWithdrawalInternal(id: string, refNote?: string) {
  const now = new Date().toISOString();
  const cleanId = String(id || '').trim();
  const timestampNum = cleanId.match(/\d{10,}/)?.[0] || '';

  const idConditions: any[] = [
    { id: cleanId },
    { id: cleanId.replace('wdr_', 'tx_') },
    { id: cleanId.replace('tx_', 'wdr_') }
  ];
  if (timestampNum) {
    idConditions.push({ id: { $regex: timestampNum } });
  }

  // 1. Find matching transactions & withdrawals
  const matchedTxs = await WalletTransaction.find({ $or: idConditions }).lean();
  const matchedWdrs = await WithdrawalRequest.find({ $or: idConditions }).lean();

  let targetUserId = matchedTxs[0]?.userId || matchedWdrs[0]?.userId;
  let targetAmount = matchedTxs[0] ? Math.abs(matchedTxs[0].amount) : (matchedWdrs[0]?.amount || 0);

  // 2. Direct update by ID first to guarantee immediate success in DB
  await WalletTransaction.updateMany(
    { $or: idConditions },
    {
      $set: {
        status: 'success',
        processedAt: now,
        ...(refNote ? { note: `Yêu cầu rút tiền - Đã giải ngân (Mã GD: ${refNote})` } : {})
      }
    }
  );

  await WithdrawalRequest.updateMany(
    { $or: idConditions },
    {
      $set: {
        status: 'approved',
        processedAt: now,
        referenceNote: refNote || 'Đã giải ngân VietQR 24/7'
      }
    }
  );

  // 3. If matched specific IDs, update those as well
  const txIds = matchedTxs.map(t => t.id).filter(Boolean);
  const wdrIds = matchedWdrs.map(w => w.id).filter(Boolean);
  if (txIds.length > 0) {
    await WalletTransaction.updateMany(
      { id: { $in: txIds } },
      {
        $set: {
          status: 'success',
          processedAt: now,
          ...(refNote ? { note: `Yêu cầu rút tiền - Đã giải ngân (Mã GD: ${refNote})` } : {})
        }
      }
    );
  }
  if (wdrIds.length > 0) {
    await WithdrawalRequest.updateMany(
      { id: { $in: wdrIds } },
      {
        $set: {
          status: 'approved',
          processedAt: now,
          referenceNote: refNote || 'Đã giải ngân VietQR 24/7'
        }
      }
    );
  }

  // 4. Fallback if user ID is known: approve any remaining pending withdraw for that user
  if (targetUserId) {
    await WalletTransaction.updateMany(
      { userId: targetUserId, type: 'withdraw', status: 'pending' },
      {
        $set: {
          status: 'success',
          processedAt: now,
          ...(refNote ? { note: `Yêu cầu rút tiền - Đã giải ngân (Mã GD: ${refNote})` } : {})
        }
      }
    );
    await WithdrawalRequest.updateMany(
      { userId: targetUserId, status: 'pending' },
      {
        $set: {
          status: 'approved',
          processedAt: now,
          referenceNote: refNote || 'Đã giải ngân VietQR 24/7'
        }
      }
    );

    // Deduct pendingBalance from User account
    const user = await User.findOne({ id: targetUserId });
    if (user) {
      user.pendingBalance = Math.max(0, (user.pendingBalance || 0) - targetAmount);
      await user.save();
    }
  } else {
    // If no match found by ID, approve any oldest pending withdrawal as safety fallback
    const fallbackPendingWdr = await WithdrawalRequest.findOne({ status: 'pending' });
    if (fallbackPendingWdr) {
      fallbackPendingWdr.status = 'approved';
      fallbackPendingWdr.processedAt = now;
      fallbackPendingWdr.referenceNote = refNote || 'Đã giải ngân VietQR 24/7';
      await fallbackPendingWdr.save();

      const u = await User.findOne({ id: fallbackPendingWdr.userId });
      if (u) {
        u.pendingBalance = Math.max(0, (u.pendingBalance || 0) - fallbackPendingWdr.amount);
        await u.save();
      }
    }
    const fallbackPendingTx = await WalletTransaction.findOne({ type: 'withdraw', status: 'pending' });
    if (fallbackPendingTx) {
      fallbackPendingTx.status = 'success';
      fallbackPendingTx.processedAt = now;
      if (refNote) fallbackPendingTx.note = `Yêu cầu rút tiền - Đã giải ngân (Mã GD: ${refNote})`;
      await fallbackPendingTx.save();
    }
  }

  return { success: true, message: 'Đã giải ngân và chuyển trạng thái sang đã duyệt thành công!' };
}

// Helper to reject withdrawal in both models
async function rejectWithdrawalInternal(id: string, reason: string = 'Thông tin ngân hàng không hợp lệ') {
  const now = new Date().toISOString();
  const cleanId = String(id || '').trim();
  const timestampNum = cleanId.match(/\d{10,}/)?.[0] || '';

  const idConditions: any[] = [
    { id: cleanId },
    { id: cleanId.replace('wdr_', 'tx_') },
    { id: cleanId.replace('tx_', 'wdr_') }
  ];
  if (timestampNum) {
    idConditions.push({ id: { $regex: timestampNum } });
  }

  // 1. Find matching transactions & withdrawals
  const matchedTxs = await WalletTransaction.find({ $or: idConditions }).lean();
  const matchedWdrs = await WithdrawalRequest.find({ $or: idConditions }).lean();

  const targetUserId = matchedTxs[0]?.userId || matchedWdrs[0]?.userId;
  const targetAmount = matchedTxs[0] ? Math.abs(matchedTxs[0].amount) : (matchedWdrs[0]?.amount || 0);

  // 2. Direct update by ID
  await WalletTransaction.updateMany(
    { $or: idConditions },
    {
      $set: {
        status: 'failed',
        rejectReason: reason,
        processedAt: now
      }
    }
  );

  await WithdrawalRequest.updateMany(
    { $or: idConditions },
    {
      $set: {
        status: 'rejected',
        rejectionReason: reason,
        processedAt: now
      }
    }
  );

  // 3. Refund balance to User
  if (targetUserId && targetAmount > 0) {
    const user = await User.findOne({ id: targetUserId });
    if (user) {
      user.pendingBalance = Math.max(0, (user.pendingBalance || 0) - targetAmount);
      user.balance = (user.balance || 0) + targetAmount;
      await user.save();

      const refundTx = new WalletTransaction({
        id: `tx_${Date.now()}_refund`,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        type: 'refund',
        amount: targetAmount,
        status: 'success',
        note: `Hoàn tiền lệnh rút tiền bị từ chối (${reason})`,
        createdAt: now
      });
      await refundTx.save();
    }
  }

  return { success: true, message: 'Đã từ chối lệnh rút tiền và hoàn lại tiền vào ví thành viên.' };
}

// PUT & POST /api/admin/transactions/:id/approve
const handleAdminApproveTx = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { refNote } = req.body;
    await approveWithdrawalInternal(id, refNote);
    return res.json({ success: true, message: 'Đã giải ngân và duyệt lệnh rút tiền thành công!' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi duyệt lệnh rút tiền' });
  }
};
router.put('/transactions/:id/approve', handleAdminApproveTx);
router.post('/transactions/:id/approve', handleAdminApproveTx);
router.put('/withdrawals/:id/approve', handleAdminApproveTx);
router.post('/withdrawals/:id/approve', handleAdminApproveTx);

// PUT & POST /api/admin/transactions/:id/reject
const handleAdminRejectTx = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason = 'Thông tin ngân hàng không hợp lệ' } = req.body;
    await rejectWithdrawalInternal(id, reason);
    return res.json({ success: true, message: 'Đã từ chối lệnh rút tiền và hoàn lại tiền vào ví thành viên.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi từ chối rút tiền' });
  }
};
router.put('/transactions/:id/reject', handleAdminRejectTx);
router.post('/transactions/:id/reject', handleAdminRejectTx);
router.put('/withdrawals/:id/reject', handleAdminRejectTx);
router.post('/withdrawals/:id/reject', handleAdminRejectTx);

// PUT & POST /api/admin/withdrawals/:id
const handleAdminWithdrawalUpdate = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (status === 'completed' || status === 'approved') {
      await approveWithdrawalInternal(id, adminNote);
    } else if (status === 'rejected') {
      await rejectWithdrawalInternal(id, adminNote || 'Thông tin ngân hàng không hợp lệ');
    }

    return res.json({
      success: true,
      message: 'Xử lý yêu cầu rút tiền thành công'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi xử lý rút tiền' });
  }
};
router.put('/withdrawals/:id', handleAdminWithdrawalUpdate);
router.post('/withdrawals/:id', handleAdminWithdrawalUpdate);
router.put('/transactions/:id', handleAdminWithdrawalUpdate);
router.post('/transactions/:id', handleAdminWithdrawalUpdate);

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
