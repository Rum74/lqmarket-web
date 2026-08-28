import { Router, Response } from 'express';
import { User } from '../models/User';
import { WalletTransaction } from '../models/WalletTransaction';
import { WithdrawalRequest } from '../models/WithdrawalRequest';
import { Notification } from '../models/Notification';
import {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  AuthenticatedRequest
} from '../middleware/auth';

const router = Router();

// GET /api/wallet
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    const recentTx = await WalletTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return res.json({
      success: true,
      balance: user.balance,
      pendingBalance: user.pendingBalance || 0,
      totalSales: user.completedSales || 0,
      recentTransactions: recentTx
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tải thông tin ví tiền' });
  }
});

// POST /api/wallet/deposit (Direct deposit or simulator)
router.post('/deposit', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetUserId = req.user?.userId || req.body.userId;
    const { amount, method = 'Chuyển khoản', note = 'Nạp tiền vào ví', transactionCode } = req.body;

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Số tiền nạp không hợp lệ' });
    }

    const user = await User.findOne({ id: targetUserId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    user.balance = (user.balance || 0) + numAmount;
    await user.save();

    const txId = transactionCode || `tx_dep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const tx = new WalletTransaction({
      id: txId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      type: 'deposit',
      amount: numAmount,
      status: 'success',
      note: `${note} (${String(method).toUpperCase()})`,
      createdAt: new Date().toISOString()
    });
    await tx.save();

    // Create Notification
    try {
      const notif = new Notification({
        id: `notif_dep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: user.id,
        type: 'wallet',
        title: 'Nạp tiền thành công',
        message: `Bạn đã nạp thành công +${numAmount.toLocaleString('vi-VN')}đ vào ví LQMarket (${String(method).toUpperCase()}). Số dư mới: ${(user.balance).toLocaleString('vi-VN')}đ.`,
        read: false,
        createdAt: new Date().toISOString()
      });
      await notif.save();
    } catch (notifErr) {
      console.warn('Deposit notification notice:', notifErr);
    }

    return res.status(200).json({
      success: true,
      message: `Nạp thành công +${numAmount.toLocaleString('vi-VN')}đ vào ví`,
      balance: user.balance,
      transaction: tx.toJSON()
    });
  } catch (error: any) {
    console.error('Wallet deposit error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi nạp tiền vào ví', error: error.message });
  }
});

// GET /api/wallet/transactions
router.get('/transactions', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const isUserAdmin = req.user?.role === 'admin';
    const { all } = req.query;

    let query: any = { userId };
    if (isUserAdmin && all === 'true') {
      query = {};
    }

    const transactions = await WalletTransaction.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.json({
      success: true,
      data: transactions,
      transactions
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tải lịch sử giao dịch',
      data: [],
      transactions: []
    });
  }
});

// POST /api/wallet/withdraw (User requests withdrawal to bank)
router.post('/withdraw', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { amount, bankName, bankAccount, bankAccountName } = req.body;

    const numAmount = Number(amount);
    if (!numAmount || numAmount < 50000) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền rút tối thiểu là 50,000 VNĐ'
      });
    }

    if (!bankName || !bankAccount || !bankAccountName) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ tên ngân hàng, số tài khoản và tên chủ tài khoản.'
      });
    }

    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản người dùng' });
    }

    if (user.balance < numAmount) {
      return res.status(400).json({
        success: false,
        message: `Số dư ví khả dụng không đủ (${user.balance.toLocaleString('vi-VN')}đ / ${numAmount.toLocaleString('vi-VN')}đ)`
      });
    }

    // Deduct user balance and hold in pending
    user.balance -= numAmount;
    user.pendingBalance = (user.pendingBalance || 0) + numAmount;
    user.bankName = bankName;
    user.bankAccount = bankAccount;
    user.bankAccountName = bankAccountName;
    await user.save();

    const withdrawId = `wdr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newRequest = new WithdrawalRequest({
      id: withdrawId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      amount: numAmount,
      bankName,
      bankAccount,
      bankAccountName,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    await newRequest.save();

    // Record wallet transaction
    const tx = new WalletTransaction({
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      type: 'withdraw',
      amount: -numAmount,
      status: 'pending',
      note: `Yêu cầu rút tiền về ${bankName} (${bankAccount}) - Chờ duyệt`,
      bankName,
      bankAccount,
      bankAccountName,
      createdAt: new Date().toISOString()
    });
    await tx.save();

    return res.status(201).json({
      success: true,
      message: 'Yêu cầu rút tiền đã được gửi. Admin sẽ duyệt và chuyển khoản trong vòng 1-24h.',
      withdrawalRequest: newRequest.toJSON(),
      transaction: tx.toJSON()
    });
  } catch (error: any) {
    console.error('Withdrawal error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi gửi yêu cầu rút tiền' });
  }
});

// POST /api/wallet/deposit (Direct / Gateway deposit)
router.post('/deposit', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || req.body.userId;
    const { amount, method = 'VietQR', note = 'Nạp tiền vào ví', transactionCode } = req.body;

    const numAmount = Math.max(0, Number(amount) || 0);
    if (numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Số tiền nạp phải lớn hơn 0đ.' });
    }

    let targetUser = null;
    if (userId) {
      targetUser = await User.findOne({ $or: [{ id: userId }, { email: userId }] });
    }

    if (targetUser) {
      targetUser.balance = (targetUser.balance || 0) + numAmount;
      await targetUser.save();
    }

    const txId = transactionCode || `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const tx = new WalletTransaction({
      id: txId,
      userId: targetUser ? targetUser.id : (userId || 'user_guest'),
      userName: targetUser ? targetUser.name : 'Người dùng',
      userEmail: targetUser ? targetUser.email : '',
      type: 'deposit',
      amount: numAmount,
      status: 'success',
      note: `${note} (${method.toUpperCase()})`,
      createdAt: new Date().toISOString()
    });
    await tx.save();

    return res.json({
      success: true,
      message: `Nạp thành công +${numAmount.toLocaleString('vi-VN')}đ vào ví!`,
      balance: targetUser ? targetUser.balance : numAmount,
      transaction: tx.toJSON()
    });
  } catch (error: any) {
    console.error('Deposit error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi xử lý nạp tiền.', error: error.message });
  }
});

// GET /api/wallet/withdrawals (List withdrawals for user or admin)
router.get('/withdrawals', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const isUserAdmin = req.user?.role === 'admin';

    let query: any = { userId };
    if (isUserAdmin) {
      query = {};
    }

    const list = await WithdrawalRequest.find(query).sort({ createdAt: -1 }).lean();

    return res.json({
      success: true,
      data: list,
      withdrawals: list
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tải danh sách yêu cầu rút tiền' });
  }
});

export default router;
