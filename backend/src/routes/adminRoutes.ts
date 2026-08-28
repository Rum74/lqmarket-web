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

// POST /api/admin/users (Admin creates a new user)
router.post('/users', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, username, password, role = 'buyer', balance = 0, phone = '', status = 'active' } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Họ tên và email là bắt buộc.' });
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${username || email || userId}`;
    
    const newUser = new User({
      id: userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      username: (username || email.split('@')[0] || userId).trim().toLowerCase(),
      password: password || '123456',
      phone: phone ? phone.trim() : '',
      avatar,
      role,
      balance: Math.max(0, Number(balance) || 0),
      pendingBalance: 0,
      rating: 5.0,
      completedSales: 0,
      isVerifiedSeller: role === 'seller',
      sellerTier: role === 'seller' ? 'BASIC' : 'FREE',
      status,
      wishlistIds: [],
      createdAt: new Date().toISOString()
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: 'Tạo tài khoản thành công!',
      user: newUser.toJSON()
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tạo người dùng: ' + error.message });
  }
});

// POST /api/admin/users/:id/balance (Admin adjusts user balance: add or deduct money)
router.post('/users/:id/balance', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, isAdding = true, reason = 'Admin điều chỉnh số dư' } = req.body;

    const numAmount = Math.max(0, Number(amount) || 0);
    if (numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Số tiền điều chỉnh phải lớn hơn 0đ.' });
    }

    const user = await User.findOne({ id });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    const previousBalance = user.balance || 0;
    if (isAdding) {
      user.balance = previousBalance + numAmount;
    } else {
      user.balance = Math.max(0, previousBalance - numAmount);
    }
    user.updatedAt = new Date().toISOString();
    await user.save();

    // Record wallet transaction
    const tx = new WalletTransaction({
      id: `tx_admin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      type: isAdding ? 'deposit' : 'purchase',
      amount: isAdding ? numAmount : -numAmount,
      status: 'success',
      note: `Admin ${isAdding ? 'cộng' : 'trừ'} tiền: ${reason} (Số dư mới: ${user.balance.toLocaleString('vi-VN')}đ)`,
      createdAt: new Date().toISOString()
    });
    await tx.save();

    // Send user notification
    const notif = new Notification({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      title: isAdding ? 'Biến động số dư: + Tiền vào ví' : 'Biến động số dư: - Tiền trong ví',
      message: `Tài khoản của bạn vừa được Admin ${isAdding ? 'cộng' : 'trừ'} ${numAmount.toLocaleString('vi-VN')}đ. Lý do: ${reason}. Số dư hiện tại: ${user.balance.toLocaleString('vi-VN')}đ.`,
      type: 'wallet',
      createdAt: new Date().toISOString()
    });
    await notif.save();

    return res.json({
      success: true,
      message: `Đã ${isAdding ? 'cộng' : 'trừ'} ${numAmount.toLocaleString('vi-VN')}đ cho ${user.name}!`,
      user: user.toJSON(),
      transaction: tx.toJSON()
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi điều chỉnh số dư: ' + error.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.userId;

    if (id === adminId) {
      return res.status(400).json({ success: false, message: 'Không thể tự xóa tài khoản của chính mình.' });
    }

    const user = await User.findOne({ id });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    await User.deleteOne({ id });
    return res.json({ success: true, message: `Đã xóa người dùng ${user.name} khỏi hệ thống.` });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi xóa người dùng: ' + error.message });
  }
});

// PUT /api/admin/users/:id
router.put('/users/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role, status, balance, isVerifiedSeller, sellerTier, name, phone } = req.body;

    const user = await User.findOne({ id });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    if (name !== undefined) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (role !== undefined) user.role = role;
    if (status !== undefined) user.status = status;
    if (balance !== undefined) user.balance = Number(balance);
    if (isVerifiedSeller !== undefined) user.isVerifiedSeller = Boolean(isVerifiedSeller);
    if (sellerTier !== undefined) user.sellerTier = sellerTier;
    user.updatedAt = new Date().toISOString();

    await user.save();

    return res.json({ success: true, message: 'Cập nhật người dùng thành công', user: user.toJSON() });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật người dùng' });
  }
});

// GET /api/admin/products (or /api/admin/accounts)
router.get('/products', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const products = await Account.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: products, products, accounts: products });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách sản phẩm' });
  }
});

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

// PUT /api/admin/withdrawals/:id
router.put('/withdrawals/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;
    const adminUser = req.user;

    const request = await WithdrawalRequest.findOne({ id });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu rút tiền' });
    }

    const previousStatus = request.status;
    request.status = status;
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
      if (status === 'completed' && previousStatus === 'pending') {
        // Complete withdrawal: reduce pending balance
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
        // Reject withdrawal: return money to user balance
        user.pendingBalance = Math.max(0, (user.pendingBalance || 0) - request.amount);
        user.balance += request.amount;
        await user.save();

        // Record refund tx
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

    return res.json({
      success: true,
      message: 'Xử lý yêu cầu rút tiền thành công',
      withdrawal: request.toJSON()
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

export default router;
