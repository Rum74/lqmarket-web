import { Router, Response } from 'express';
import { User } from '../models/User';
import { WalletTransaction } from '../models/WalletTransaction';
import { WithdrawalRequest } from '../models/WithdrawalRequest';
import { Notification } from '../models/Notification';
import { approvePayout, rejectPayout } from '../services/payoutService';
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

    // Create Notification
    try {
      const notif = new Notification({
        id: `notif_wdr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: user.id,
        type: 'wallet',
        title: 'Yêu cầu rút tiền đang chờ duyệt',
        message: `Yêu cầu rút ${numAmount.toLocaleString('vi-VN')}đ về ${bankName} (${bankAccount}) đã được gửi lên hệ thống và đang chờ Admin xử lý.`,
        read: false,
        createdAt: new Date().toISOString()
      });
      await notif.save();
    } catch (notifErr) {
      console.warn('Withdrawal notification notice:', notifErr);
    }

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

// Admin Payout Actions via Wallet Router
const handleWalletApprove = async (req: AuthenticatedRequest, res: Response) => {
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
    return res.status(500).json({ success: false, message: 'Lỗi khi xác nhận giải ngân', error: error.message });
  }
};

const handleWalletReject = async (req: AuthenticatedRequest, res: Response) => {
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
    return res.status(500).json({ success: false, message: 'Lỗi khi từ chối rút tiền', error: error.message });
  }
};

router.post('/transactions/:id/approve', authenticateToken, requireAdmin, handleWalletApprove);
router.put('/transactions/:id/approve', authenticateToken, requireAdmin, handleWalletApprove);
router.post('/transactions/:id/reject', authenticateToken, requireAdmin, handleWalletReject);
router.put('/transactions/:id/reject', authenticateToken, requireAdmin, handleWalletReject);

router.post('/withdrawals/:id/approve', authenticateToken, requireAdmin, handleWalletApprove);
router.put('/withdrawals/:id/approve', authenticateToken, requireAdmin, handleWalletApprove);
router.post('/withdrawals/:id/reject', authenticateToken, requireAdmin, handleWalletReject);
router.put('/withdrawals/:id/reject', authenticateToken, requireAdmin, handleWalletReject);

router.put('/withdrawals/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
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

    return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi xử lý rút tiền' });
  }
});

export default router;
