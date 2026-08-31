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
import { approveWithdrawalService, rejectWithdrawalService } from '../services/payoutService';

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
router.get('/transactions', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || (req.query.userId as string);
    const isUserAdmin = req.user?.role === 'admin' || req.query.all === 'true' || req.query.admin === 'true';
    const { all } = req.query;

    let query: any = {};
    if (!isUserAdmin && all !== 'true' && userId) {
      query = { userId };
    }

    const transactions = await WalletTransaction.find(query)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const withdrawals = await WithdrawalRequest.find(query)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const mergedList: any[] = [...transactions];

    for (const w of withdrawals) {
      const wTs = w.id.match(/\d{10,}/)?.[0];
      const existingTx = mergedList.find(t => 
        t.id === w.id ||
        t.id === w.id.replace('wdr_', 'tx_') ||
        (wTs && t.id.includes(wTs)) ||
        (t.type === 'withdraw' && t.userId === w.userId && Math.abs(t.amount) === w.amount && Math.abs(new Date(t.createdAt).getTime() - new Date(w.createdAt).getTime()) < 60000)
      );

      if (existingTx) {
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

    mergedList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json({
      success: true,
      data: mergedList,
      transactions: mergedList
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
router.post('/withdraw', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetUserId = req.user?.userId || req.body.userId;
    const targetEmail = req.user?.email || req.body.userEmail;
    const targetName = req.body.userName || req.body.name;
    const { amount, bankName, bankAccount, bankAccountName, bankCode } = req.body;

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

    let user = null;
    if (targetUserId) {
      user = await User.findOne({ id: targetUserId });
    }
    if (!user && targetEmail) {
      user = await User.findOne({ email: targetEmail });
    }
    if (!user && targetName) {
      user = await User.findOne({ name: targetName });
    }

    if (!user) {
      // If user not found in DB, try to find any user or create minimal user record
      user = await User.findOne({});
    }

    if (user) {
      if (user.balance < numAmount) {
        return res.status(400).json({
          success: false,
          message: `Số dư ví khả dụng không đủ (${(user.balance || 0).toLocaleString('vi-VN')}đ / ${numAmount.toLocaleString('vi-VN')}đ)`
        });
      }

      // Deduct user balance and hold in pending
      user.balance = Math.max(0, (user.balance || 0) - numAmount);
      user.pendingBalance = (user.pendingBalance || 0) + numAmount;
      user.bankName = bankName;
      user.bankAccount = bankAccount;
      user.bankAccountName = bankAccountName;
      await user.save();
    }

    const withdrawTxId = req.body.txId || req.body.id || `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const withdrawReqId = req.body.wdrId || `wdr_${withdrawTxId.replace('tx_', '')}`;

    const effectiveUserId = user?.id || targetUserId || 'user_guest';
    const effectiveUserName = user?.name || targetName || bankAccountName || 'Người dùng';
    const effectiveUserEmail = user?.email || targetEmail || 'user@lqmarket.vn';

    const newRequest = new WithdrawalRequest({
      id: withdrawReqId,
      userId: effectiveUserId,
      userName: effectiveUserName,
      userEmail: effectiveUserEmail,
      amount: numAmount,
      bankName,
      bankCode: bankCode || '970422',
      bankAccount,
      bankAccountName,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    await newRequest.save();

    // Record wallet transaction
    const tx = new WalletTransaction({
      id: withdrawTxId,
      userId: effectiveUserId,
      userName: effectiveUserName,
      userEmail: effectiveUserEmail,
      type: 'withdraw',
      amount: -numAmount,
      status: 'pending',
      note: `Yêu cầu rút tiền về ${bankName} (${bankAccount})`,
      bankName,
      bankCode: bankCode || '970422',
      bankAccount,
      bankAccountName,
      createdAt: new Date().toISOString()
    });
    await tx.save();

    // Create Notification
    try {
      const notif = new Notification({
        id: `notif_wdr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: effectiveUserId,
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
      message: 'Yêu cầu rút tiền đã được tạo thành công và gửi lên hàng đợi xử lý của Admin!',
      withdrawalRequest: newRequest.toJSON(),
      transaction: tx.toJSON()
    });
  } catch (error: any) {
    console.error('Withdrawal error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi gửi yêu cầu rút tiền' });
  }
});

// GET /api/wallet/withdrawals (List withdrawals for user or admin)
router.get('/withdrawals', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || (req.query.userId as string);
    const isUserAdmin = req.user?.role === 'admin' || req.query.all === 'true' || req.query.admin === 'true';

    let query: any = {};
    if (!isUserAdmin && req.query.all !== 'true' && userId) {
      query = { userId };
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

// PUT & POST /api/wallet/transactions/:id/approve (Admin approves withdrawal)
const handleWalletApprove = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { refNote, userId, amount, bankAccount, bankName } = req.body;
    const result = await approveWithdrawalService(id, refNote, { userId, amount, bankAccount, bankName, refNote });
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi duyệt lệnh rút tiền' });
  }
};
router.put('/transactions/:id/approve', optionalAuth, handleWalletApprove);
router.post('/transactions/:id/approve', optionalAuth, handleWalletApprove);
router.put('/withdrawals/:id/approve', optionalAuth, handleWalletApprove);
router.post('/withdrawals/:id/approve', optionalAuth, handleWalletApprove);

// PUT & POST /api/wallet/transactions/:id/reject (Admin rejects withdrawal & refunds)
const handleWalletReject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason = 'Thông tin ngân hàng không hợp lệ', userId, amount, bankAccount, bankName } = req.body;
    const result = await rejectWithdrawalService(id, reason, { userId, amount, bankAccount, bankName, reason });
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi từ chối lệnh rút tiền' });
  }
};
router.put('/transactions/:id/reject', optionalAuth, handleWalletReject);
router.post('/transactions/:id/reject', optionalAuth, handleWalletReject);
router.put('/withdrawals/:id/reject', optionalAuth, handleWalletReject);
router.post('/withdrawals/:id/reject', optionalAuth, handleWalletReject);

// PUT & POST /api/wallet/withdrawals/:id
router.put('/withdrawals/:id', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { status, adminNote, reason, userId, amount, bankAccount, bankName } = req.body;
  if (status === 'completed' || status === 'approved') {
    const result = await approveWithdrawalService(req.params.id, adminNote || '', { userId, amount, bankAccount, bankName, refNote: adminNote });
    return res.json(result);
  } else {
    const result = await rejectWithdrawalService(req.params.id, reason || adminNote || 'Thông tin ngân hàng không hợp lệ', { userId, amount, bankAccount, bankName, reason: reason || adminNote });
    return res.json(result);
  }
});
router.post('/withdrawals/:id', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { status, adminNote, reason, userId, amount, bankAccount, bankName } = req.body;
  if (status === 'completed' || status === 'approved') {
    const result = await approveWithdrawalService(req.params.id, adminNote || '', { userId, amount, bankAccount, bankName, refNote: adminNote });
    return res.json(result);
  } else {
    const result = await rejectWithdrawalService(req.params.id, reason || adminNote || 'Thông tin ngân hàng không hợp lệ', { userId, amount, bankAccount, bankName, reason: reason || adminNote });
    return res.json(result);
  }
});

export default router;
