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
 * Handles both WalletTransaction ID (tx_...) and WithdrawalRequest ID (wdr_...)
 * Strictly without converting tx_ to ObjectId or changing its prefix.
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
    return { success: false, message: 'Mã giao dịch hoặc yêu cầu rút tiền không hợp lệ' };
  }

  const nowIso = new Date().toISOString();

  // 1. Direct search by exact ID in WalletTransaction (canonical ID format tx_...)
  let tx = await WalletTransaction.findOne({ id: cleanId });

  // 2. Direct search by exact ID in WithdrawalRequest (canonical ID format wdr_...)
  let wdr = await WithdrawalRequest.findOne({ id: cleanId });

  // 3. Cross-reference only if needed
  if (tx && !wdr) {
    wdr = await WithdrawalRequest.findOne({
      $or: [
        { id: cleanId.replace('tx_', 'wdr_') },
        { id: `wdr_${cleanId.replace('tx_', '')}` },
        { transactionId: cleanId }
      ]
    });
  } else if (!tx && wdr) {
    tx = await WalletTransaction.findOne({
      $or: [
        { id: cleanId.replace('wdr_', 'tx_') },
        { id: `tx_${cleanId.replace('wdr_', '')}` },
        { id: (wdr as any).transactionId }
      ]
    });
  }

  if (!tx && !wdr) {
    return {
      success: false,
      message: `Không tìm thấy bản ghi giao dịch rút tiền với mã ${cleanId} trong cơ sở dữ liệu MongoDB.`
    };
  }

  // If already approved, return success without duplicate deduction
  if (tx && (tx.status === 'success' || (tx.status as string) === 'approved' || (tx.status as string) === 'completed')) {
    return {
      success: true,
      message: 'Giao dịch này đã được giải ngân thành công trước đó.',
      transaction: tx.toJSON(),
      withdrawal: wdr ? wdr.toJSON() : null
    };
  }

  const userId = tx?.userId || wdr?.userId || extraContext?.userId;
  const rawAmount = tx ? Math.abs(tx.amount) : (wdr ? Math.abs(wdr.amount) : (extraContext?.amount ? Math.abs(extraContext.amount) : 0));
  const bankName = tx?.bankName || wdr?.bankName || extraContext?.bankName || 'Ngân hàng';
  const bankAccount = tx?.bankAccount || wdr?.bankAccount || extraContext?.bankAccount || '';
  const bankAccountName = tx?.bankAccountName || wdr?.bankAccountName || '';

  // Update WalletTransaction if found
  if (tx) {
    tx.status = 'success';
    tx.processedAt = nowIso;
    if (adminNote) {
      tx.note = `${tx.note ? tx.note.split(' - Ghi chú Admin:')[0] : 'Rút tiền'} - Ghi chú Admin: ${adminNote}`;
    }
    await tx.save();
  }

  // Update WithdrawalRequest if found
  if (wdr) {
    wdr.status = 'approved';
    wdr.processedAt = nowIso;
    wdr.updatedAt = nowIso;
    if (adminNote) {
      wdr.referenceNote = adminNote;
    }
    await wdr.save();
  }

  // Deduct user's pending balance in MongoDB
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

  return {
    success: true,
    message: `Đã xác nhận giải ngân ${rawAmount.toLocaleString('vi-VN')}đ cho tài khoản ${user?.name || userId} thành công!`,
    transaction: tx ? tx.toJSON() : null,
    withdrawal: wdr ? wdr.toJSON() : null
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
    return { success: false, message: 'Mã giao dịch hoặc yêu cầu rút tiền không hợp lệ' };
  }

  const nowIso = new Date().toISOString();
  const rejectReason = (reason || 'Thông tin tài khoản ngân hàng không chính xác').trim();

  // 1. Direct search by exact ID in WalletTransaction
  let tx = await WalletTransaction.findOne({ id: cleanId });
  let wdr = await WithdrawalRequest.findOne({ id: cleanId });

  // 2. Cross-reference only if needed
  if (tx && !wdr) {
    wdr = await WithdrawalRequest.findOne({
      $or: [
        { id: cleanId.replace('tx_', 'wdr_') },
        { id: `wdr_${cleanId.replace('tx_', '')}` },
        { transactionId: cleanId }
      ]
    });
  } else if (!tx && wdr) {
    tx = await WalletTransaction.findOne({
      $or: [
        { id: cleanId.replace('wdr_', 'tx_') },
        { id: `tx_${cleanId.replace('wdr_', '')}` },
        { id: (wdr as any).transactionId }
      ]
    });
  }

  if (!tx && !wdr) {
    return {
      success: false,
      message: `Không tìm thấy bản ghi giao dịch rút tiền với mã ${cleanId} trong cơ sở dữ liệu MongoDB.`
    };
  }

  // If already rejected or failed
  if (tx && (tx.status === 'failed' || (tx.status as string) === 'rejected' || (tx.status as string) === 'cancelled')) {
    return {
      success: true,
      message: 'Giao dịch này đã được xử lý từ chối trước đó.',
      transaction: tx.toJSON(),
      withdrawal: wdr ? wdr.toJSON() : null
    };
  }

  const userId = tx?.userId || wdr?.userId || extraContext?.userId;
  const rawAmount = tx ? Math.abs(tx.amount) : (wdr ? Math.abs(wdr.amount) : (extraContext?.amount ? Math.abs(extraContext.amount) : 0));
  const bankName = tx?.bankName || wdr?.bankName || extraContext?.bankName || 'Ngân hàng';
  const bankAccount = tx?.bankAccount || wdr?.bankAccount || extraContext?.bankAccount || '';

  // Update WalletTransaction
  if (tx) {
    tx.status = 'failed';
    tx.rejectReason = rejectReason;
    tx.processedAt = nowIso;
    tx.note = `${tx.note ? tx.note.split(' - [Từ chối:')[0] : 'Rút tiền'} - [Từ chối: ${rejectReason}]`;
    await tx.save();
  }

  // Update WithdrawalRequest
  if (wdr) {
    wdr.status = 'rejected';
    wdr.rejectionReason = rejectReason;
    wdr.processedAt = nowIso;
    wdr.updatedAt = nowIso;
    await wdr.save();
  }

  // Refund money back to user balance in MongoDB
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

      // Record refund transaction
      try {
        const refundTx = new WalletTransaction({
          id: `tx_ref_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          type: 'refund',
          amount: rawAmount,
          status: 'success',
          note: `Hoàn tiền yêu cầu rút ${rawAmount.toLocaleString('vi-VN')}đ về ${bankName} (${bankAccount}) - Lý do: ${rejectReason}`,
          bankName,
          bankAccount,
          createdAt: nowIso
        });
        await refundTx.save();
      } catch (txErr) {
        console.warn('Refund transaction creation notice:', txErr);
      }

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

  return {
    success: true,
    message: `Đã từ chối yêu cầu rút tiền và hoàn trả ${rawAmount.toLocaleString('vi-VN')}đ vào ví người dùng.`,
    transaction: tx ? tx.toJSON() : null,
    withdrawal: wdr ? wdr.toJSON() : null
  };
}

/**
 * Fetch canonical Payout & Withdrawal statistics from MongoDB.
 * Source of truth: WithdrawalRequest collection (with fallback to WalletTransaction).
 * Strictly calculates pending vs approved/completed without double-counting.
 */
export async function getPayoutStats(): Promise<PayoutStatsResult> {
  const allWithdrawals = await WithdrawalRequest.find().lean();

  if (allWithdrawals.length > 0) {
    let pendingCount = 0;
    let pendingAmount = 0;
    let completedCount = 0;
    let completedAmount = 0;
    let rejectedCount = 0;
    let rejectedAmount = 0;

    for (const w of allWithdrawals) {
      const amt = Math.abs(Number(w.amount) || 0);
      if (w.status === 'pending') {
        pendingCount += 1;
        pendingAmount += amt;
      } else if (w.status === 'approved' || (w.status as string) === 'success' || (w.status as string) === 'completed') {
        completedCount += 1;
        completedAmount += amt;
      } else if (w.status === 'rejected' || (w.status as string) === 'failed') {
        rejectedCount += 1;
        rejectedAmount += amt;
      }
    }

    return {
      pendingCount,
      pendingAmount,
      completedCount,
      completedAmount,
      rejectedCount,
      rejectedAmount,
      totalWithdrawalsCount: allWithdrawals.length,
      totalWithdrawalsAmount: pendingAmount + completedAmount
    };
  }

  // Fallback: Query WalletTransaction collection
  const withdrawTxs = await WalletTransaction.find({ type: 'withdraw' }).lean();
  let pendingCount = 0;
  let pendingAmount = 0;
  let completedCount = 0;
  let completedAmount = 0;
  let rejectedCount = 0;
  let rejectedAmount = 0;

  for (const t of withdrawTxs) {
    const amt = Math.abs(Number(t.amount) || 0);
    if (t.status === 'pending') {
      pendingCount += 1;
      pendingAmount += amt;
    } else if (t.status === 'success' || (t.status as string) === 'approved' || (t.status as string) === 'completed') {
      completedCount += 1;
      completedAmount += amt;
    } else if (t.status === 'failed' || (t.status as string) === 'cancelled' || (t.status as string) === 'rejected') {
      rejectedCount += 1;
      rejectedAmount += amt;
    }
  }

  return {
    pendingCount,
    pendingAmount,
    completedCount,
    completedAmount,
    rejectedCount,
    rejectedAmount,
    totalWithdrawalsCount: withdrawTxs.length,
    totalWithdrawalsAmount: pendingAmount + completedAmount
  };
}
