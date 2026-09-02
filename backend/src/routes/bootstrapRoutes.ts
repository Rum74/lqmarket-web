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
 * Ultra-fast aggregation endpoint that fetches initial marketplace data
 * in single parallel database roundtrip.
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
        .limit(300)
        .lean(),
      WithdrawalRequest.find(isUserAdmin ? {} : currentUserId ? { userId: currentUserId } : {})
        .sort({ createdAt: -1 })
        .limit(300)
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

    // 3. Merge Transactions & WithdrawalRequests cleanly without dropping pending status
    const mergedTransactions: any[] = [...allTransactionsRaw];
    for (const w of allWithdrawalsRaw) {
      const existingTx = mergedTransactions.find(
        t =>
          t.id === w.id ||
          t.id === `tx_${w.id.replace('wdr_', '')}` ||
          t.id === w.id.replace('wdr_', 'tx_') ||
          (t.type === 'withdraw' &&
            t.userId === w.userId &&
            Math.abs(t.amount) === w.amount &&
            Math.abs(new Date(t.createdAt).getTime() - new Date(w.createdAt).getTime()) < 120000)
      );

      const mappedStatus =
        w.status === 'approved' ? 'success' : w.status === 'rejected' ? 'failed' : 'pending';

      if (existingTx) {
        // Sync status from WithdrawalRequest if it was processed
        if (w.status === 'approved') {
          existingTx.status = 'success';
          existingTx.processedAt = w.processedAt || existingTx.processedAt || new Date().toISOString();
        } else if (w.status === 'rejected') {
          existingTx.status = 'failed';
          existingTx.rejectReason = w.rejectionReason || existingTx.rejectReason || 'Bị từ chối';
          existingTx.processedAt = w.processedAt || existingTx.processedAt || new Date().toISOString();
        } else if (w.status === 'pending' && existingTx.status !== 'success') {
          existingTx.status = 'pending';
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
          status: mappedStatus,
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
    let userNotifications: any[] = [];
    let userConversations: any[] = [];

    if (currentUserId) {
      const [u, notifs, convs] = await Promise.all([
        User.findOne({ id: currentUserId }).lean(),
        Notification.find({ userId: currentUserId }).sort({ createdAt: -1 }).limit(50).lean(),
        Conversation.find({ participantIds: currentUserId }).sort({ lastMessageTime: -1 }).lean()
      ]);

      if (u) {
        currentUser = {
          id: u.id,
          name: u.name,
          username: u.username,
          email: u.email,
          phone: u.phone,
          role: u.role,
          avatar: u.avatar,
          balance: u.balance || 0,
          pendingBalance: u.pendingBalance || 0,
          rating: u.rating || 5.0,
          completedSales: u.completedSales || 0,
          isVerifiedSeller: u.isVerifiedSeller,
          sellerTier: u.sellerTier || 'BASIC SELLER',
          bio: u.bio || '',
          bankName: u.bankName || '',
          bankAccount: u.bankAccount || '',
          bankAccountName: u.bankAccountName || '',
          createdAt: u.createdAt
        };
      }

      userNotifications = notifs || [];
      userConversations = convs || [];

      if (isUserAdmin) {
        const [adminUsers, adminOrders] = await Promise.all([
          User.find().select('-password').sort({ createdAt: -1 }).lean(),
          Order.find().sort({ createdAt: -1 }).lean()
        ]);
        allUsers = adminUsers.map((usr: any) => ({
          id: usr.id,
          name: usr.name,
          username: usr.username,
          email: usr.email,
          phone: usr.phone,
          role: usr.role,
          avatar: usr.avatar,
          balance: usr.balance || 0,
          pendingBalance: usr.pendingBalance || 0,
          rating: usr.rating || 5.0,
          completedSales: usr.completedSales || 0,
          isVerifiedSeller: usr.isVerifiedSeller,
          sellerTier: usr.sellerTier || 'BASIC SELLER',
          bio: usr.bio || '',
          bankInfo: usr.bankInfo,
          createdAt: usr.createdAt
        }));
        userOrders = adminOrders || [];
      } else {
        const [orders, inv] = await Promise.all([
          Order.find({
            $or: [{ buyerId: currentUserId }, { sellerId: currentUserId }]
          })
            .sort({ createdAt: -1 })
            .lean(),
          UserInventory.find({ userId: currentUserId }).sort({ receivedAt: -1 }).lean()
        ]);
        userOrders = orders || [];
        userInventory = inv || [];
      }
    }

    return res.json({
      success: true,
      data: {
        accounts,
        mysteryBoxes,
        mysteryRewards,
        mysteryHistory,
        stats: {
          totalAccounts: accounts.length,
          totalApprovedAccounts: totalApprovedCount,
          totalCompletedOrders: totalCompletedOrdersCount,
          totalSoldAccounts: totalSoldAccountsCount,
          totalCompletedTransactions,
          isMysteryBoxEventActive,
          isAutoApprove
        },
        settings: {
          mystery_box_event_active: isMysteryBoxEventActive,
          auto_approve_accounts: isAutoApprove
        },
        currentUser,
        allUsers: isUserAdmin ? allUsers : undefined,
        orders: userOrders,
        transactions: mergedTransactions,
        userInventory,
        notifications: userNotifications,
        conversations: userConversations
      }
    });
  } catch (error: any) {
    console.error('Error in /api/bootstrap:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi tải dữ liệu khởi tạo',
      error: error.message
    });
  }
});

export default router;
