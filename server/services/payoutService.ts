import mongoose from 'mongoose';
import { WalletTransaction } from '../models/WalletTransaction';
import { WithdrawalRequest } from '../models/WithdrawalRequest';
import { User } from '../models/User';
import { Notification } from '../models/Notification';

export interface PayoutContextData {
  userId?: string;
  amount?: number;
  bankAccount?: string;
  bankName?: string;
  refNote?: string;
  reason?: string;
}

/**
 * Builds query condition for finding transactions/withdrawals across MongoDB and Memory Store
 */
function buildIdConditions(id: string, contextData?: PayoutContextData): any[] {
  const cleanId = String(id || '').trim();
  const conditions: any[] = [];

  if (cleanId) {
    conditions.push({ id: cleanId });
    conditions.push({ id: cleanId.replace('wdr_', 'tx_') });
    conditions.push({ id: cleanId.replace('tx_', 'wdr_') });

    // If MongoDB ObjectId is valid
    if (mongoose.Types.ObjectId.isValid(cleanId)) {
      try {
        conditions.push({ _id: new mongoose.Types.ObjectId(cleanId) });
      } catch {}
      conditions.push({ _id: cleanId });
    }

    const timestampNum = cleanId.match(/\d{10,}/)?.[0];
    if (timestampNum) {
      conditions.push({ id: { $regex: timestampNum } });
    }
  }

  // If context user & amount are provided, match pending record
  if (contextData?.userId) {
    const userCond: any = { userId: contextData.userId, status: 'pending' };
    if (contextData.amount && contextData.amount > 0) {
      userCond.amount = { $in: [contextData.amount, -contextData.amount] };
    }
    conditions.push(userCond);
  }

  return conditions.length > 0 ? conditions : [{ id: cleanId }];
}

/**
 * Approves a withdrawal payout and persists status: 'success' / 'approved' in database
 */
export async function approveWithdrawalService(
  id: string,
  refNote: string = '',
  contextData?: PayoutContextData
): Promise<{ success: boolean; message: string }> {
  const now = new Date().toISOString();
  const cleanId = String(id || '').trim();
  const conditions = buildIdConditions(cleanId, contextData);

  // 1. Find all matching transactions and withdrawal requests
  const matchedTxs = await WalletTransaction.find({ $or: conditions }).lean();
  const matchedWdrs = await WithdrawalRequest.find({ $or: conditions }).lean();

  const targetUserId = contextData?.userId || matchedTxs[0]?.userId || matchedWdrs[0]?.userId;
  const targetAmount = contextData?.amount || (matchedTxs[0] ? Math.abs(matchedTxs[0].amount) : (matchedWdrs[0]?.amount || 0));
  const targetBankName = contextData?.bankName || matchedTxs[0]?.bankName || matchedWdrs[0]?.bankName || 'Ngân hàng';
  const targetBankAccount = contextData?.bankAccount || matchedTxs[0]?.bankAccount || matchedWdrs[0]?.bankAccount || '';

  // Extract explicit IDs
  const txIds = matchedTxs.map((t: any) => t.id).filter(Boolean);
  const wdrIds = matchedWdrs.map((w: any) => w.id).filter(Boolean);
  if (cleanId) {
    txIds.push(cleanId, cleanId.replace('wdr_', 'tx_'));
    wdrIds.push(cleanId, cleanId.replace('tx_', 'wdr_'));
  }

  const noteMsg = refNote
    ? `Yêu cầu rút tiền về ${targetBankName} (${targetBankAccount}) - Đã giải ngân (Mã GD: ${refNote})`
    : `Yêu cầu rút tiền về ${targetBankName} (${targetBankAccount}) - Đã giải ngân thành công`;

  // 2. Direct update by ID conditions in both collections
  await Promise.all([
    WalletTransaction.updateMany(
      { $or: conditions },
      {
        $set: {
          status: 'success',
          processedAt: now,
          note: noteMsg
        }
      }
    ),
    WithdrawalRequest.updateMany(
      { $or: conditions },
      {
        $set: {
          status: 'approved',
          processedAt: now,
          referenceNote: refNote || 'Đã giải ngân VietQR 24/7'
        }
      }
    )
  ]);

  // 3. Update by explicit ID array
  if (txIds.length > 0) {
    await WalletTransaction.updateMany(
      { id: { $in: txIds } },
      {
        $set: {
          status: 'success',
          processedAt: now,
          note: noteMsg
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

  // 4. Update user pendingBalance
  if (targetUserId) {
    // Also resolve any remaining pending withdrawal for this specific user & amount
    if (targetAmount > 0) {
      await WalletTransaction.updateMany(
        { userId: targetUserId, type: 'withdraw', amount: -targetAmount, status: 'pending' },
        {
          $set: {
            status: 'success',
            processedAt: now,
            note: noteMsg
          }
        }
      );
      await WithdrawalRequest.updateMany(
        { userId: targetUserId, amount: targetAmount, status: 'pending' },
        {
          $set: {
            status: 'approved',
            processedAt: now,
            referenceNote: refNote || 'Đã giải ngân VietQR 24/7'
          }
        }
      );
    }

    const user = await User.findOne({ id: targetUserId });
    if (user) {
      user.pendingBalance = Math.max(0, (user.pendingBalance || 0) - targetAmount);
      await user.save();
    }

    // Send success notification to user
    try {
      const notif = new Notification({
        id: `notif_approve_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: targetUserId,
        type: 'wallet',
        title: 'Yêu cầu rút tiền đã được giải ngân',
        message: `Lệnh rút ${targetAmount.toLocaleString('vi-VN')}đ về ${targetBankName} (${targetBankAccount}) đã được Admin duyệt và giải ngân thành công qua VietQR 24/7.${refNote ? ` Mã đối soát: ${refNote}` : ''}`,
        read: false,
        createdAt: now
      });
      await notif.save();
    } catch (notifErr) {
      console.warn('Approve notif notice:', notifErr);
    }
  } else {
    // If no matching user was linked by ID, update the oldest pending record
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
      fallbackPendingTx.note = noteMsg;
      await fallbackPendingTx.save();
    }
  }

  return { success: true, message: 'Đã giải ngân và chuyển trạng thái sang đã duyệt thành công!' };
}

/**
 * Rejects a withdrawal payout and refunds balance to member's account
 */
export async function rejectWithdrawalService(
  id: string,
  reason: string = 'Thông tin ngân hàng không hợp lệ',
  contextData?: PayoutContextData
): Promise<{ success: boolean; message: string }> {
  const now = new Date().toISOString();
  const cleanId = String(id || '').trim();
  const conditions = buildIdConditions(cleanId, contextData);

  // 1. Find all matching transactions and withdrawal requests
  const matchedTxs = await WalletTransaction.find({ $or: conditions }).lean();
  const matchedWdrs = await WithdrawalRequest.find({ $or: conditions }).lean();

  const targetUserId = contextData?.userId || matchedTxs[0]?.userId || matchedWdrs[0]?.userId;
  const targetAmount = contextData?.amount || (matchedTxs[0] ? Math.abs(matchedTxs[0].amount) : (matchedWdrs[0]?.amount || 0));
  const targetBankName = contextData?.bankName || matchedTxs[0]?.bankName || matchedWdrs[0]?.bankName || 'Ngân hàng';
  const targetBankAccount = contextData?.bankAccount || matchedTxs[0]?.bankAccount || matchedWdrs[0]?.bankAccount || '';

  // Extract explicit IDs
  const txIds = matchedTxs.map((t: any) => t.id).filter(Boolean);
  const wdrIds = matchedWdrs.map((w: any) => w.id).filter(Boolean);
  if (cleanId) {
    txIds.push(cleanId, cleanId.replace('wdr_', 'tx_'));
    wdrIds.push(cleanId, cleanId.replace('tx_', 'wdr_'));
  }

  // 2. Direct update by ID conditions in both collections
  await Promise.all([
    WalletTransaction.updateMany(
      { $or: conditions },
      {
        $set: {
          status: 'failed',
          rejectReason: reason,
          processedAt: now
        }
      }
    ),
    WithdrawalRequest.updateMany(
      { $or: conditions },
      {
        $set: {
          status: 'rejected',
          rejectionReason: reason,
          processedAt: now
        }
      }
    )
  ]);

  // 3. Update by explicit ID array
  if (txIds.length > 0) {
    await WalletTransaction.updateMany(
      { id: { $in: txIds } },
      {
        $set: {
          status: 'failed',
          rejectReason: reason,
          processedAt: now
        }
      }
    );
  }
  if (wdrIds.length > 0) {
    await WithdrawalRequest.updateMany(
      { id: { $in: wdrIds } },
      {
        $set: {
          status: 'rejected',
          rejectionReason: reason,
          processedAt: now
        }
      }
    );
  }

  // 4. Refund balance to User
  if (targetUserId && targetAmount > 0) {
    // Also mark pending withdrawal as rejected
    await WalletTransaction.updateMany(
      { userId: targetUserId, type: 'withdraw', amount: -targetAmount, status: 'pending' },
      {
        $set: {
          status: 'failed',
          rejectReason: reason,
          processedAt: now
        }
      }
    );
    await WithdrawalRequest.updateMany(
      { userId: targetUserId, amount: targetAmount, status: 'pending' },
      {
        $set: {
          status: 'rejected',
          rejectionReason: reason,
          processedAt: now
        }
      }
    );

    const user = await User.findOne({ id: targetUserId });
    if (user) {
      user.pendingBalance = Math.max(0, (user.pendingBalance || 0) - targetAmount);
      user.balance = (user.balance || 0) + targetAmount;
      await user.save();

      // Create refund transaction
      const refundTx = new WalletTransaction({
        id: `tx_${Date.now()}_refund_${Math.random().toString(36).substring(2, 6)}`,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        type: 'refund',
        amount: targetAmount,
        status: 'success',
        note: `Hoàn tiền lệnh rút ${targetAmount.toLocaleString('vi-VN')}đ bị từ chối (${reason})`,
        createdAt: now
      });
      await refundTx.save();

      // Create notification to user
      try {
        const notif = new Notification({
          id: `notif_reject_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: user.id,
          type: 'wallet',
          title: 'Lệnh rút tiền bị từ chối - Đã hoàn tiền',
          message: `Lệnh rút ${targetAmount.toLocaleString('vi-VN')}đ về ${targetBankName} (${targetBankAccount}) bị từ chối. Lý do: ${reason}. Số tiền đã được hoàn trả lại 100% vào ví của bạn.`,
          read: false,
          createdAt: now
        });
        await notif.save();
      } catch (notifErr) {
        console.warn('Reject notif notice:', notifErr);
      }
    }
  }

  return { success: true, message: 'Đã từ chối lệnh rút tiền và hoàn lại tiền vào ví thành viên.' };
}
