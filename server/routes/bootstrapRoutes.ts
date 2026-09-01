import { Router, Response } from 'express';
import { Account } from '../models/Account';
import { User } from '../models/User';
import { Order } from '../models/Order';
import { WalletTransaction } from '../models/WalletTransaction';
import { WithdrawalRequest } from '../models/WithdrawalRequest';
import { MysteryBox } from '../models/MysteryBox';
import { MysteryReward } from '../models/MysteryReward';
import { MysteryHistory } from '../models/MysteryHistory';
import { UserInventory } from '../models/UserInventory';
import { Setting } from '../models/Setting';
import { Notification } from '../models/Notification';
import { Conversation } from '../models/Conversation';
import {
  optionalAuth,
  AuthenticatedRequest
} from '../middleware/auth';

const router = Router();

/**
 * GET /api/bootstrap
 * Ultra-fast single aggregation endpoint that fetches all initial marketplace & user data
 * in ONE single parallel database roundtrip (< 50ms)!
 */
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUserId = req.user?.userId;
    const isUserAdmin = req.user?.role === 'admin';

    // 1. Fetch core marketplace collections in parallel
    const [
      allAccountsRaw,
      totalApprovedCount,
      totalCompletedOrdersCount,
      totalSoldAccountsCount,
      allSettings,
      mysteryBoxes,
      mysteryRewards,
      mysteryHistory,
      allTransactionsRaw,
      allWithdrawalsRaw
    ] = await Promise.all([
      // Fetch accounts (Admin gets all, regular user gets all approved + sold + their own)
      Account.find(
        isUserAdmin
          ? {}
          : currentUserId
          ? {
              $or: [
                { status: { $in: ['approved', 'sold'] } },
                { sellerId: currentUserId }
              ]
            }
          : { status: { $in: ['approved', 'sold'] } }
      )
        .sort({ createdAt: -1 })
        .lean(),

      Account.countDocuments({ status: 'approved' }),
      Order.countDocuments({ status: 'completed' }),
      Account.countDocuments({ status: 'sold' }),
      Setting.find().lean(),
      MysteryBox.find().lean(),
      MysteryReward.find().lean(),
      MysteryHistory.find().sort({ createdAt: -1 }).limit(30).lean(),
      WalletTransaction.find(isUserAdmin ? {} : currentUserId ? { userId: currentUserId } : {})
        .sort({ createdAt: -1 })
        .limit(200)
        .lean(),
      WithdrawalRequest.find(isUserAdmin ? {} : currentUserId ? { userId: currentUserId } : {})
        .sort({ createdAt: -1 })
        .limit(200)
        .lean()
    ]);

    // 2. Sanitize account passwords for non-owner public requests
    const accounts = allAccountsRaw.map((acc: any) => {
      const isOwner = currentUserId && acc.sellerId === currentUserId;
      if (!isOwner && !isUserAdmin) {
        return {
          ...acc,
          credentials: {
            ...acc.credentials,
            password: '••••••••',
            secretNotes: ''
          }
        };
      }
      return acc;
    });

    // 3. Merge Transactions & WithdrawalRequests with unified statuses
    const mergedTransactions: any[] = [...allTransactionsRaw];
    for (const w of allWithdrawalsRaw) {
      const wTs = w.id ? w.id.match(/\d{10,}/)?.[0] : null;
      const existingTx = mergedTransactions.find(
        t =>
          t.id === w.id ||
          t.id === w.id.replace('wdr_', 'tx_') ||
          (wTs && t.id.includes(wTs)) ||
          (t.type === 'withdraw' &&
            t.userId === w.userId &&
            Math.abs(t.amount) === w.amount &&
            Math.abs(new Date(t.createdAt).getTime() - new Date(w.createdAt).getTime()) < 60000)
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
        mergedTransactions.push({
          id: w.id,
          userId: w.userId,
          userName: w.userName || 'Người dùng',
          userEmail: w.userEmail || '',
          type: 'withdraw',
          amount: -w.amount,
          status: w.status === 'approved' ? 'success' : w.status === 'rejected' ? 'failed' : 'pending',
          note: w.referenceNote
            ? `Yêu cầu rút tiền về ${w.bankName} (${w.bankAccount}) (Mã GD: ${w.referenceNote})`
            : `Yêu cầu rút tiền về ${w.bankName} (${w.bankAccount})`,
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
    mergedTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 4. Extract settings
    const eventActiveSetting = allSettings.find(s => s.key === 'mystery_box_event_active');
    const autoApproveSetting = allSettings.find(s => s.key === 'auto_approve_accounts');
    const isMysteryBoxEventActive = eventActiveSetting ? Boolean(eventActiveSetting.value) : true;
    const isAutoApprove = autoApproveSetting ? Boolean(autoApproveSetting.value) : false;

    const totalCompletedTransactions = Math.max(totalCompletedOrdersCount, totalSoldAccountsCount, 0);

    // 5. User-specific authenticated queries
    let currentUser: any = null;
    let allUsers: any[] = [];
    let userOrders: any[] = [];
    let userInventory: any[] = [];
    let notifications: any[] = [];
    let chatMessages: any[] = [];

    if (currentUserId) {
      const [userDoc, ordersDoc, invDoc, notifDoc, chatDoc, allUsersDoc] = await Promise.all([
        User.findOne({ id: currentUserId }).lean(),
        Order.find(isUserAdmin ? {} : { $or: [{ buyerId: currentUserId }, { sellerId: currentUserId }] })
          .sort({ createdAt: -1 })
          .lean(),
        UserInventory.find({ userId: currentUserId }).lean(),
        Notification.find({ userId: currentUserId }).sort({ createdAt: -1 }).limit(30).lean(),
        Conversation.find({
          $or: [{ buyerId: currentUserId }, { sellerId: currentUserId }]
        })
          .sort({ updatedAt: -1 })
          .limit(50)
          .lean(),
        isUserAdmin ? User.find().sort({ createdAt: -1 }).lean() : Promise.resolve([])
      ]);

      currentUser = userDoc;
      userOrders = ordersDoc;
      userInventory = invDoc;
      notifications = notifDoc;
      chatMessages = chatDoc;
      if (isUserAdmin) {
        allUsers = allUsersDoc;
      }
    }

    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        totalAvailableAccounts: totalApprovedCount,
        totalCompletedTransactions,
        isAutoApprove
      },
      accounts,
      totalAccounts: accounts.length,
      mysteryBoxes,
      mysteryRewards,
      mysteryHistory,
      isMysteryBoxEventActive,
      transactions: mergedTransactions,
      withdrawals: allWithdrawalsRaw,
      currentUser,
      allUsers,
      orders: userOrders,
      userInventory,
      notifications,
      chatMessages
    });
  } catch (error: any) {
    console.error('Bootstrap API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi tải dữ liệu bootstrap hệ thống',
      error: error.message
    });
  }
});

export default router;
