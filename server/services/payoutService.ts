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
 * Builds safe query condition for finding transactions/withdrawals without throwing CastErrors
 */
function buildSafeConditions(id: string, contextData?: PayoutContextData): any[] {
  const cleanId = String(id || '').trim();
  const conditions: any[] = [];

  if (cleanId) {
    conditions.push({ id: cleanId });
    conditions.push({ id: cleanId.replace('wdr_', 'tx_') });
    conditions.push({ id: cleanId.replace('tx_', 'wdr_') });

    // Only add _id condition if it is a strict 24-character hexadecimal ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(cleanId) && mongoose.Types.ObjectId.isValid(cleanId)) {
      try {
        conditions.push({ _id: new mongoose.Types.ObjectId(cleanId) });
      } catch {}
    }

    const timestampNum = cleanId.match(/\d{10,}/)?.[0];
    if (timestampNum && timestampNum.length >= 8) {
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
  try {
    const now = new Date().toISOString();
    const cleanId = String(id || '').trim();
    const conditions = buildSafeConditions(cleanId, contextData);

    // 1. Find matching WithdrawalRequest document
    let targetWdr: any = null;
    if (cleanId) {
      targetWdr = await WithdrawalRequest.findOne({ id: cleanId });
      if (!targetWdr) {
        targetWdr = await WithdrawalRequest.findOne({ id: cleanId.replace('tx_', 'wdr_') });
      }
      if (!targetWdr && /^[0-9a-fA-F]{24}$/.test(cleanId)) {
        try {
          targetWdr = await WithdrawalRequest.findById(cleanId);
        } catch {}
      }
    }

    if (!targetWdr && contextData?.userId) {
      targetWdr = await WithdrawalRequest.findOne({
        userId: contextData.userId,
        status: 'pending'
      }).sort({ createdAt: -1 });
    }

    if (!targetWdr) {
      targetWdr = await WithdrawalRequest.findOne({ $or: conditions }).sort({ createdAt: -1 });
    }

    // Find matching WalletTransaction
    let targetTx: any = null;
    if (cleanId) {
      targetTx = await WalletTransaction.findOne({ id: cleanId });
      if (!targetTx) {
        targetTx = await WalletTransaction.findOne({ id: cleanId.replace('wdr_', 'tx_') });
      }
    }
    if (!targetTx && contextData?.userId) {
      targetTx = await WalletTransaction.findOne({
        userId: contextData.userId,
        type: 'withdraw',
        status: 'pending'
      }).sort({ createdAt: -1 });
    }
    if (!targetTx) {
      targetTx = await WalletTransaction.findOne({ $or: conditions }).sort({ createdAt: -1 });
    }

    // If still neither exists, try to find any pending record matching fallback criteria
    if (!targetWdr && !targetTx) {
      if (contextData?.userId) {
        targetWdr = await WithdrawalRequest.findOne({ userId: contextData.userId, status: 'pending' });
        targetTx = await WalletTransaction.findOne({ userId: contextData.userId, type: 'withdraw', status: 'pending' });
      }
    }

    // If strictly no record exists in database, FAIL and do not pretend success
    if (!targetWdr && !targetTx) {
      return {
        success: false,
        message: 'Không tìm thấy lệnh rút tiền tương ứng trong cơ sở dữ liệu MongoDB để giải ngân.'
      };
    }

    // Resolve target details
    const targetUserId =
      contextData?.userId || targetWdr?.userId || targetTx?.userId || '';
    const targetAmount =
      contextData?.amount ||
      (targetWdr ? targetWdr.amount : targetTx ? Math.abs(targetTx.amount) : 0);
    const targetBankName =
      contextData?.bankName || targetWdr?.bankName || targetTx?.bankName || 'Ngân hàng';
    const targetBankAccount =
      contextData?.bankAccount || targetWdr?.bankAccount || targetTx?.bankAccount || '';

    const noteMsg = refNote
      ? `Yêu cầu rút tiền về ${targetBankName} (${targetBankAccount}) - Đã giải ngân (Mã GD: ${refNote})`
      : `Yêu cầu rút tiền về ${targetBankName} (${targetBankAccount}) - Đã giải ngân thành công`;

    let hasPersistedAny = false;

    // 2. Directly update target WithdrawalRequest document if found
    if (targetWdr) {
      targetWdr.status = 'approved';
      targetWdr.processedAt = now;
      targetWdr.referenceNote = refNote || 'Đã giải ngân VietQR 24/7';
      await targetWdr.save();
      hasPersistedAny = true;
    }

    // 3. Directly update target WalletTransaction document if found
    if (targetTx) {
      targetTx.status = 'success';
      targetTx.processedAt = now;
      targetTx.note = noteMsg;
      await targetTx.save();
      hasPersistedAny = true;
    }

    // 4. Also perform comprehensive updateMany across both collections to ensure all related entries are updated
    try {
      const [wdrRes, txRes] = await Promise.all([
        WithdrawalRequest.updateMany(
          { $or: conditions },
          {
            $set: {
              status: 'approved',
              processedAt: now,
              referenceNote: refNote || 'Đã giải ngân VietQR 24/7'
            }
          }
        ),
        WalletTransaction.updateMany(
          { $or: conditions },
          {
            $set: {
              status: 'success',
              processedAt: now,
              note: noteMsg
            }
          }
        )
      ]);
      if (wdrRes?.modifiedCount > 0 || txRes?.modifiedCount > 0) {
        hasPersistedAny = true;
      }
    } catch (updateErr) {
      console.warn('Payout updateMany notice:', updateErr);
    }

    // 5. Update user pendingBalance & send notification
    if (targetUserId) {
      if (targetAmount > 0) {
        try {
          await Promise.all([
            WithdrawalRequest.updateMany(
              { userId: targetUserId, amount: targetAmount, status: 'pending' },
              {
                $set: {
                  status: 'approved',
                  processedAt: now,
                  referenceNote: refNote || 'Đã giải ngân VietQR 24/7'
                }
              }
            ),
            WalletTransaction.updateMany(
              { userId: targetUserId, type: 'withdraw', amount: -targetAmount, status: 'pending' },
              {
                $set: {
                  status: 'success',
                  processedAt: now,
                  note: noteMsg
                }
              }
            )
          ]);
        } catch {}
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
    }

    if (!hasPersistedAny) {
      return {
        success: false,
        message: 'Cơ sở dữ liệu MongoDB không ghi nhận thay đổi nào cho lệnh rút này.'
      };
    }

    return { success: true, message: 'Đã giải ngân và cập nhật trạng thái thành công trong cơ sở dữ liệu MongoDB!' };
  } catch (error: any) {
    console.error('approveWithdrawalService error:', error);
    return {
      success: false,
      message: `Lỗi cập nhật cơ sở dữ liệu: ${error?.message || 'Không xác định'}`
    };
  }
}

/**
 * Rejects a withdrawal payout and refunds balance to member's account
 */
export async function rejectWithdrawalService(
  id: string,
  reason: string = 'Thông tin ngân hàng không hợp lệ',
  contextData?: PayoutContextData
): Promise<{ success: boolean; message: string }> {
  try {
    const now = new Date().toISOString();
    const cleanId = String(id || '').trim();
    const conditions = buildSafeConditions(cleanId, contextData);

    // 1. Find matching WithdrawalRequest document
    let targetWdr: any = null;
    if (cleanId) {
      targetWdr = await WithdrawalRequest.findOne({ id: cleanId });
      if (!targetWdr) {
        targetWdr = await WithdrawalRequest.findOne({ id: cleanId.replace('tx_', 'wdr_') });
      }
      if (!targetWdr && /^[0-9a-fA-F]{24}$/.test(cleanId)) {
        try {
          targetWdr = await WithdrawalRequest.findById(cleanId);
        } catch {}
      }
    }

    if (!targetWdr && contextData?.userId) {
      targetWdr = await WithdrawalRequest.findOne({
        userId: contextData.userId,
        status: 'pending'
      }).sort({ createdAt: -1 });
    }

    if (!targetWdr) {
      targetWdr = await WithdrawalRequest.findOne({ $or: conditions }).sort({ createdAt: -1 });
    }

    // Find matching WalletTransaction
    let targetTx: any = null;
    if (cleanId) {
      targetTx = await WalletTransaction.findOne({ id: cleanId });
      if (!targetTx) {
        targetTx = await WalletTransaction.findOne({ id: cleanId.replace('wdr_', 'tx_') });
      }
    }
    if (!targetTx && contextData?.userId) {
      targetTx = await WalletTransaction.findOne({
        userId: contextData.userId,
        type: 'withdraw',
        status: 'pending'
      }).sort({ createdAt: -1 });
    }
    if (!targetTx) {
      targetTx = await WalletTransaction.findOne({ $or: conditions }).sort({ createdAt: -1 });
    }

    if (!targetWdr && !targetTx) {
      return {
        success: false,
        message: 'Không tìm thấy lệnh rút tiền tương ứng trong cơ sở dữ liệu MongoDB để từ chối.'
      };
    }

    // Resolve target details
    const targetUserId =
      contextData?.userId || targetWdr?.userId || targetTx?.userId || '';
    const targetAmount =
      contextData?.amount ||
      (targetWdr ? targetWdr.amount : targetTx ? Math.abs(targetTx.amount) : 0);
    const targetBankName =
      contextData?.bankName || targetWdr?.bankName || targetTx?.bankName || 'Ngân hàng';
    const targetBankAccount =
      contextData?.bankAccount || targetWdr?.bankAccount || targetTx?.bankAccount || '';

    // 2. Update target documents
    if (targetWdr) {
      targetWdr.status = 'rejected';
      targetWdr.rejectionReason = reason;
      targetWdr.processedAt = now;
      await targetWdr.save();
    }
    if (targetTx) {
      targetTx.status = 'failed';
      targetTx.rejectReason = reason;
      targetTx.processedAt = now;
      await targetTx.save();
    }

    // 3. Comprehensive updateMany
    try {
      await Promise.all([
        WithdrawalRequest.updateMany(
          { $or: conditions },
          {
            $set: {
              status: 'rejected',
              rejectionReason: reason,
              processedAt: now
            }
          }
        ),
        WalletTransaction.updateMany(
          { $or: conditions },
          {
            $set: {
              status: 'failed',
              rejectReason: reason,
              processedAt: now
            }
          }
        )
      ]);
    } catch (updateErr) {
      console.warn('Payout reject updateMany notice:', updateErr);
    }

    // 4. Refund balance to User & Send Notification
    if (targetUserId && targetAmount > 0) {
      try {
        await Promise.all([
          WithdrawalRequest.updateMany(
            { userId: targetUserId, amount: targetAmount, status: 'pending' },
            {
              $set: {
                status: 'rejected',
                rejectionReason: reason,
                processedAt: now
              }
            }
          ),
          WalletTransaction.updateMany(
            { userId: targetUserId, type: 'withdraw', amount: -targetAmount, status: 'pending' },
            {
              $set: {
                status: 'failed',
                rejectReason: reason,
                processedAt: now
              }
            }
          )
        ]);
      } catch {}

      const user = await User.findOne({ id: targetUserId });
      if (user) {
        user.pendingBalance = Math.max(0, (user.pendingBalance || 0) - targetAmount);
        user.balance = (user.balance || 0) + targetAmount;
        await user.save();

        // Create refund transaction record
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

        // Send refund notification
        try {
          const notif = new Notification({
            id: `notif_reject_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            userId: user.id,
            type: 'wallet',
            title: 'Lệnh rút tiền bị từ chối - Đã hoàn tiền',
            message: `Lệnh rút ${targetAmount.toLocaleString('vi-VN')}đ về ${targetBankName} (${targetBankAccount}) bị từ chối. Lý do: ${reason}. Số tiền đã được hoàn trả lại 100% vào số dư khả dụng của bạn.`,
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
  } catch (error: any) {
    console.error('rejectWithdrawalService error:', error);
    return {
      success: false,
      message: `Lỗi khi từ chối lệnh rút: ${error?.message || 'Không xác định'}`
    };
  }
}
