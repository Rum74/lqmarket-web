import { WalletTransaction } from '../models/WalletTransaction';
import { WithdrawalRequest } from '../models/WithdrawalRequest';
import { User } from '../models/User';
import { Notification } from '../models/Notification';

export interface ApprovePayoutResult {
  success: boolean;
  message: string;
  transaction?: any;
  withdrawal?: any;
}

export interface RejectPayoutResult {
  success: boolean;
  message: string;
  transaction?: any;
  withdrawal?: any;
}

export interface PayoutStatsResult {
  pendingCount: number;
  pendingAmount: number;
  completedCount: number;
  completedAmount: number;
  rejectedCount: number;
  rejectedAmount: number;
  totalWithdrawalsCount: number;
  totalWithdrawalsAmount: number;
}

/**
 * Approve a withdrawal/payout in MongoDB
 * Source of truth: WithdrawalRequest.status
 * Handles WithdrawalRequest ID (wdr_...) and WalletTransaction ID (tx_...)
 * Strictly validates matchedCount & modifiedCount from MongoDB updateOne.
 */
export async function approvePayout(
  targetId: string,
  adminNote?: string,
  extraContext?: {
    userId?: string;
    amount?: number;
    bankAccount?: string;
    bankName?: string;
  }
): Promise<ApprovePayoutResult> {
  const cleanId = String(targetId || '').trim();
  if (!cleanId) {
    return { success: false, message: 'Mã yêu cầu rút tiền không hợp lệ' };
  }

  const nowIso = new Date().toISOString();

  // 1. Direct search by exact ID in WithdrawalRequest (primary source of truth)
  let wdr = await WithdrawalRequest.findOne({ id: cleanId });

  // 2. If cleanId is a tx_ id, find associated WithdrawalRequest
  let tx: any = null;
  if (!wdr) {
    tx = await WalletTransaction.findOne({ id: cleanId });
    if (tx) {
      wdr = await WithdrawalRequest.findOne({
        $or: [
          { transactionId: cleanId },
          { id: (tx as any).withdrawalRequestId },
          { id: cleanId.replace('tx_', 'wdr_') },
          { id: `wdr_${cleanId.replace('tx_', '')}` },
          // Match by user, amount and pending status
          { userId: tx.userId, amount: Math.abs(tx.amount), status: 'pending' }
        ]
      });
    } else {
      // Fallback search in WithdrawalRequest
      wdr = await WithdrawalRequest.findOne({
        $or: [
          { id: cleanId.replace('tx_', 'wdr_') },
          { transactionId: cleanId }
        ]
      });
    }
  } else {
    // Found wdr, look for associated tx
    tx = await WalletTransaction.findOne({
      $or: [
        { withdrawalRequestId: wdr.id },
        { id: (wdr as any).transactionId },
        { id: cleanId.replace('wdr_', 'tx_') },
        { userId: wdr.userId, amount: -Math.abs(wdr.amount), status: 'pending' }
      ]
    });
  }

  console.log('[APPROVE WITHDRAWAL]');
  console.log('requestedId:', cleanId);
  console.log('foundRequest:', wdr ? wdr.id : 'NOT_FOUND');
  console.log('currentStatus:', wdr ? wdr.status : 'N/A');

  if (!wdr) {
    return {
      success: false,
      message: `Không tìm thấy yêu cầu rút tiền (WithdrawalRequest) với mã ${cleanId} trong cơ sở dữ liệu MongoDB.`
    };
  }

  // If already approved
  if (wdr.status === 'approved') {
    console.log('matchedCount: 0');
    console.log('modifiedCount: 0');
    console.log('newStatus: approved (already approved)');
    return {
      success: true,
      message: `Yêu cầu rút tiền ${wdr.id} đã được giải ngân thành công trước đó.`,
      withdrawal: wdr.toJSON ? wdr.toJSON() : wdr,
      transaction: tx ? (tx.toJSON ? tx.toJSON() : tx) : null
    };
  }

  // 3. Execute atomic update on WithdrawalRequest
  const updateResult = await WithdrawalRequest.updateOne(
    {
      id: wdr.id,
      status: 'pending'
    },
    {
      $set: {
        status: 'approved',
        referenceNote: adminNote || wdr.referenceNote || '',
        processedAt: nowIso,
        updatedAt: nowIso
      }
    }
  );

  console.log('matchedCount:', updateResult.matchedCount);
  console.log('modifiedCount:', updateResult.modifiedCount);
  console.log('newStatus: approved');

  if (updateResult.matchedCount === 0) {
    return {
      success: false,
      message: `Không thể duyệt yêu cầu rút tiền ${wdr.id}: Trạng thái hiện tại không phải pending hoặc bản ghi không tồn tại.`
    };
  }

  const rawAmount = Math.abs(wdr.amount);
  const userId = wdr.userId || tx?.userId || extraContext?.userId;
  const bankName = wdr.bankName || tx?.bankName || 'Ngân hàng';
  const bankAccount = wdr.bankAccount || tx?.bankAccount || '';
  const bankAccountName = wdr.bankAccountName || tx?.bankAccountName || '';

  // 4. Update associated WalletTransaction if found (do NOT create duplicates)
  if (tx) {
    await WalletTransaction.updateOne(
      { id: tx.id },
      {
        $set: {
          status: 'success',
          withdrawalRequestId: wdr.id,
          processedAt: nowIso,
          note: adminNote
            ? `${tx.note ? tx.note.split(' - Ghi chú Admin:')[0] : 'Rút tiền'} - Ghi chú Admin: ${adminNote}`
            : tx.note
        }
      }
    );
  }

  // 5. Deduct user's pending balance in MongoDB
  let user = null;
  if (userId) {
    user = await User.findOne({ id: userId });
    if (user) {
      const currentPending = Number(user.pendingBalance) || 0;
      user.pendingBalance = Math.max(0, currentPending - rawAmount);
      user.updatedAt = nowIso;
      await user.save();

      // Create confirmation notification in MongoDB
      try {
        const notifId = `notif_wdr_ok_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const notif = new Notification({
          id: notifId,
          userId: user.id,
          type: 'wallet',
          title: 'Giải ngân thành công',
          message: `Yêu cầu rút ${rawAmount.toLocaleString('vi-VN')}đ về tài khoản ngân hàng ${bankName} (${bankAccount}${bankAccountName ? ' - ' + bankAccountName : ''}) đã được Admin chuyển khoản thành công.${adminNote ? ' Ghi chú: ' + adminNote : ''}`,
          read: false,
          createdAt: nowIso
        });
        await notif.save();
      } catch (notifErr) {
        console.warn('Payout approval notification error:', notifErr);
      }
    }
  }

  const updatedWdr = await WithdrawalRequest.findOne({ id: wdr.id }).lean();
  const updatedTx = tx ? await WalletTransaction.findOne({ id: tx.id }).lean() : null;

  return {
    success: true,
    message: `Đã xác nhận giải ngân ${rawAmount.toLocaleString('vi-VN')}đ cho tài khoản ${user?.name || userId} thành công!`,
    transaction: updatedTx,
    withdrawal: updatedWdr
  };
}

/**
 * Reject a withdrawal/payout in MongoDB
 * Refunds the amount back to user's available balance and clears pendingBalance
 */
export async function rejectPayout(
  targetId: string,
  reason: string,
  extraContext?: {
    userId?: string;
    amount?: number;
    bankAccount?: string;
    bankName?: string;
  }
): Promise<RejectPayoutResult> {
  const cleanId = String(targetId || '').trim();
  if (!cleanId) {
    return { success: false, message: 'Mã yêu cầu rút tiền không hợp lệ' };
  }

  const nowIso = new Date().toISOString();
  const rejectReason = (reason || 'Thông tin tài khoản ngân hàng không chính xác').trim();

  // 1. Direct search by exact ID in WithdrawalRequest (primary source of truth)
  let wdr = await WithdrawalRequest.findOne({ id: cleanId });
  let tx: any = null;

  if (!wdr) {
    tx = await WalletTransaction.findOne({ id: cleanId });
    if (tx) {
      wdr = await WithdrawalRequest.findOne({
        $or: [
          { transactionId: cleanId },
          { id: (tx as any).withdrawalRequestId },
          { id: cleanId.replace('tx_', 'wdr_') },
          { id: `wdr_${cleanId.replace('tx_', '')}` },
          { userId: tx.userId, amount: Math.abs(tx.amount), status: 'pending' }
        ]
      });
    }
  } else {
    tx = await WalletTransaction.findOne({
      $or: [
        { withdrawalRequestId: wdr.id },
        { id: (wdr as any).transactionId },
        { id: cleanId.replace('wdr_', 'tx_') },
        { userId: wdr.userId, amount: -Math.abs(wdr.amount), status: 'pending' }
      ]
    });
  }

  console.log('[REJECT WITHDRAWAL]');
  console.log('requestedId:', cleanId);
  console.log('foundRequest:', wdr ? wdr.id : 'NOT_FOUND');
  console.log('currentStatus:', wdr ? wdr.status : 'N/A');

  if (!wdr) {
    return {
      success: false,
      message: `Không tìm thấy yêu cầu rút tiền với mã ${cleanId} trong cơ sở dữ liệu MongoDB.`
    };
  }

  if (wdr.status === 'rejected') {
    return {
      success: true,
      message: `Yêu cầu rút tiền ${wdr.id} đã được từ chối trước đó.`,
      withdrawal: wdr.toJSON ? wdr.toJSON() : wdr,
      transaction: tx ? (tx.toJSON ? tx.toJSON() : tx) : null
    };
  }

  // 2. Atomic update on WithdrawalRequest
  const updateResult = await WithdrawalRequest.updateOne(
    {
      id: wdr.id,
      status: 'pending'
    },
    {
      $set: {
        status: 'rejected',
        rejectionReason: rejectReason,
        processedAt: nowIso,
        updatedAt: nowIso
      }
    }
  );

  console.log('matchedCount:', updateResult.matchedCount);
  console.log('modifiedCount:', updateResult.modifiedCount);
  console.log('newStatus: rejected');

  if (updateResult.matchedCount === 0) {
    return {
      success: false,
      message: `Không thể từ chối yêu cầu rút tiền ${wdr.id}: Trạng thái hiện tại không phải pending.`
    };
  }

  const rawAmount = Math.abs(wdr.amount);
  const userId = wdr.userId || tx?.userId || extraContext?.userId;
  const bankName = wdr.bankName || tx?.bankName || 'Ngân hàng';
  const bankAccount = wdr.bankAccount || tx?.bankAccount || '';

  // 3. Update associated WalletTransaction
  if (tx) {
    await WalletTransaction.updateOne(
      { id: tx.id },
      {
        $set: {
          status: 'failed',
          rejectReason,
          processedAt: nowIso,
          note: `${tx.note ? tx.note.split(' - [Từ chối:')[0] : 'Rút tiền'} - [Từ chối: ${rejectReason}]`
        }
      }
    );
  }

  // 4. Refund money back to user balance in MongoDB
  let user = null;
  if (userId) {
    user = await User.findOne({ id: userId });
    if (user) {
      const currentBalance = Number(user.balance) || 0;
      const currentPending = Number(user.pendingBalance) || 0;

      user.balance = currentBalance + rawAmount;
      user.pendingBalance = Math.max(0, currentPending - rawAmount);
      user.updatedAt = nowIso;
      await user.save();

      // Create notification
      try {
        const notif = new Notification({
          id: `notif_wdr_rej_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: user.id,
          type: 'wallet',
          title: 'Yêu cầu rút tiền bị từ chối',
          message: `Yêu cầu rút ${rawAmount.toLocaleString('vi-VN')}đ về ${bankName} (${bankAccount}) đã bị từ chối. Lý do: "${rejectReason}". Số tiền ${rawAmount.toLocaleString('vi-VN')}đ đã được hoàn trả lại vào số dư ví của bạn.`,
          read: false,
          createdAt: nowIso
        });
        await notif.save();
      } catch (notifErr) {
        console.warn('Payout reject notification notice:', notifErr);
      }
    }
  }

  const updatedWdr = await WithdrawalRequest.findOne({ id: wdr.id }).lean();
  const updatedTx = tx ? await WalletTransaction.findOne({ id: tx.id }).lean() : null;

  return {
    success: true,
    message: `Đã từ chối yêu cầu rút tiền và hoàn trả ${rawAmount.toLocaleString('vi-VN')}đ vào ví người dùng.`,
    transaction: updatedTx,
    withdrawal: updatedWdr
  };
}

/**
 * Fetch canonical Payout & Withdrawal statistics from MongoDB.
 * Source of truth: WithdrawalRequest collection strictly.
 * pendingCount = countDocuments({ status: "pending" })
 * approvedCount = countDocuments({ status: "approved" })
 * Sum amounts by status.
 */
export async function getPayoutStats(): Promise<PayoutStatsResult> {
  const [pendingCount, approvedCount, rejectedCount, allWdrs] = await Promise.all([
    WithdrawalRequest.countDocuments({ status: 'pending' }),
    WithdrawalRequest.countDocuments({ status: 'approved' }),
    WithdrawalRequest.countDocuments({ status: 'rejected' }),
    WithdrawalRequest.find().lean()
  ]);

  const pendingAmount = allWdrs
    .filter(w => w.status === 'pending')
    .reduce((sum, w) => sum + Math.abs(Number(w.amount) || 0), 0);

  const approvedAmount = allWdrs
    .filter(w => w.status === 'approved')
    .reduce((sum, w) => sum + Math.abs(Number(w.amount) || 0), 0);

  const rejectedAmount = allWdrs
    .filter(w => w.status === 'rejected')
    .reduce((sum, w) => sum + Math.abs(Number(w.amount) || 0), 0);

  return {
    pendingCount,
    pendingAmount,
    completedCount: approvedCount,
    completedAmount: approvedAmount,
    rejectedCount,
    rejectedAmount,
    totalWithdrawalsCount: allWdrs.length,
    totalWithdrawalsAmount: pendingAmount + approvedAmount
  };
}
