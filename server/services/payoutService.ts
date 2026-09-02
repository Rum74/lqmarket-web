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

export interface PayoutResult {
  success: boolean;
  message: string;
  notFound?: boolean;
}

/**
 * Approves a withdrawal payout in MongoDB:
 * Target: WalletTransaction (id: tx_...) with fallback to WithdrawalRequest (id: wdr_...)
 * Status update: pending -> success / approved
 */
export async function approveWithdrawalService(
  id: string,
  refNote: string = '',
  contextData?: PayoutContextData
): Promise<PayoutResult> {
  try {
    const now = new Date().toISOString();
    const cleanId = String(id || '').trim();
    if (!cleanId) {
      return {
        success: false,
        notFound: true,
        message: 'Mã lệnh rút tiền không hợp lệ hoặc để trống.'
      };
    }

    // 1. Primary lookup: WalletTransaction by exact string ID
    let targetTx: any = await WalletTransaction.findOne({ id: cleanId });
    if (!targetTx && /^[0-9a-fA-F]{24}$/.test(cleanId) && mongoose.Types.ObjectId.isValid(cleanId)) {
      try {
        targetTx = await WalletTransaction.findById(cleanId);
      } catch {}
    }

    // 2. Secondary lookup if not found in WalletTransaction: check WithdrawalRequest by exact string ID
    let targetWdr: any = null;
    if (!targetTx) {
      targetWdr = await WithdrawalRequest.findOne({ id: cleanId });
      if (!targetWdr && /^[0-9a-fA-F]{24}$/.test(cleanId) && mongoose.Types.ObjectId.isValid(cleanId)) {
        try {
          targetWdr = await WithdrawalRequest.findById(cleanId);
        } catch {}
      }
    }

    // 3. Strict 404 handler with diagnostic logging if not found in MongoDB
    if (!targetTx && !targetWdr) {
      console.error(`[PAYOUT APPROVE] NOT FOUND - ID: "${cleanId}", Model: WalletTransaction / WithdrawalRequest, Field: id, Query: { id: "${cleanId}" }`);
      return {
        success: false,
        notFound: true,
        message: `Không tìm thấy lệnh rút tiền với mã "${cleanId}" trong cơ sở dữ liệu MongoDB.`
      };
    }

    let targetUserId = '';
    let targetAmount = 0;
    let targetBankName = 'Ngân hàng';
    let targetBankAccount = '';

    // Update WalletTransaction if found
    if (targetTx) {
      targetUserId = targetTx.userId || contextData?.userId || '';
      targetAmount = Math.abs(targetTx.amount) || contextData?.amount || 0;
      targetBankName = targetTx.bankName || contextData?.bankName || 'Ngân hàng';
      targetBankAccount = targetTx.bankAccount || contextData?.bankAccount || '';

      const noteMsg = refNote
        ? `Yêu cầu rút tiền về ${targetBankName} (${targetBankAccount}) - Đã giải ngân (Mã GD: ${refNote})`
        : `Yêu cầu rút tiền về ${targetBankName} (${targetBankAccount}) - Đã giải ngân thành công`;

      targetTx.status = 'success';
      targetTx.processedAt = now;
      targetTx.note = noteMsg;
      targetTx.updatedAt = now;
      await targetTx.save();

      // Check if there is an exact corresponding WithdrawalRequest by ID
      const matchingWdr = await WithdrawalRequest.findOne({ id: cleanId });
      if (matchingWdr) {
        matchingWdr.status = 'approved';
        matchingWdr.processedAt = now;
        matchingWdr.referenceNote = refNote || 'Đã giải ngân VietQR 24/7';
        matchingWdr.updatedAt = now;
        await matchingWdr.save();
      }
    } else if (targetWdr) {
      targetUserId = targetWdr.userId || contextData?.userId || '';
      targetAmount = targetWdr.amount || contextData?.amount || 0;
      targetBankName = targetWdr.bankName || contextData?.bankName || 'Ngân hàng';
      targetBankAccount = targetWdr.bankAccount || contextData?.bankAccount || '';

      targetWdr.status = 'approved';
      targetWdr.processedAt = now;
      targetWdr.referenceNote = refNote || 'Đã giải ngân VietQR 24/7';
      targetWdr.updatedAt = now;
      await targetWdr.save();
    }

    // 4. Update user pending balance & create notification
    if (targetUserId) {
      const user = await User.findOne({ id: targetUserId });
      if (user) {
        user.pendingBalance = Math.max(0, (user.pendingBalance || 0) - targetAmount);
        await user.save();
      }

      try {
        const notif = new Notification({
          id: `notif_approve_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: targetUserId,
          type: 'wallet',
          title: 'Yêu cầu rút tiền đã được giải ngân',
          message: `Lệnh rút ${targetAmount.toLocaleString('vi-VN')}đ về ${targetBankName} (${targetBankAccount}) đã được Admin duyệt và giải ngân thành công qua VietQR.${refNote ? ` Mã đối soát: ${refNote}` : ''}`,
          read: false,
          createdAt: now
        });
        await notif.save();
      } catch (notifErr) {
        console.warn('Approve notif notice:', notifErr);
      }
    }

    return {
      success: true,
      message: 'Đã giải ngân và cập nhật trạng thái thành công trong cơ sở dữ liệu MongoDB!'
    };
  } catch (error: any) {
    console.error('approveWithdrawalService error:', error);
    return {
      success: false,
      message: `Lỗi cập nhật cơ sở dữ liệu: ${error?.message || 'Không xác định'}`
    };
  }
}

/**
 * Rejects a withdrawal payout and refunds balance to member's account in MongoDB
 */
export async function rejectWithdrawalService(
  id: string,
  reason: string = 'Thông tin ngân hàng không hợp lệ',
  contextData?: PayoutContextData
): Promise<PayoutResult> {
  try {
    const now = new Date().toISOString();
    const cleanId = String(id || '').trim();
    if (!cleanId) {
      return {
        success: false,
        notFound: true,
        message: 'Mã lệnh rút tiền không hợp lệ hoặc để trống.'
      };
    }

    // 1. Primary lookup: WalletTransaction by exact string ID
    let targetTx: any = await WalletTransaction.findOne({ id: cleanId });
    if (!targetTx && /^[0-9a-fA-F]{24}$/.test(cleanId) && mongoose.Types.ObjectId.isValid(cleanId)) {
      try {
        targetTx = await WalletTransaction.findById(cleanId);
      } catch {}
    }

    // 2. Secondary lookup if not found in WalletTransaction: check WithdrawalRequest
    let targetWdr: any = null;
    if (!targetTx) {
      targetWdr = await WithdrawalRequest.findOne({ id: cleanId });
      if (!targetWdr && /^[0-9a-fA-F]{24}$/.test(cleanId) && mongoose.Types.ObjectId.isValid(cleanId)) {
        try {
          targetWdr = await WithdrawalRequest.findById(cleanId);
        } catch {}
      }
    }

    if (!targetTx && !targetWdr) {
      console.error(`[PAYOUT REJECT] NOT FOUND - ID: "${cleanId}", Model: WalletTransaction / WithdrawalRequest, Field: id, Query: { id: "${cleanId}" }`);
      return {
        success: false,
        notFound: true,
        message: `Không tìm thấy lệnh rút tiền với mã "${cleanId}" trong cơ sở dữ liệu MongoDB để từ chối.`
      };
    }

    let targetUserId = '';
    let targetAmount = 0;
    let targetBankName = 'Ngân hàng';
    let targetBankAccount = '';

    if (targetTx) {
      targetUserId = targetTx.userId || contextData?.userId || '';
      targetAmount = Math.abs(targetTx.amount) || contextData?.amount || 0;
      targetBankName = targetTx.bankName || contextData?.bankName || 'Ngân hàng';
      targetBankAccount = targetTx.bankAccount || contextData?.bankAccount || '';

      targetTx.status = 'failed';
      targetTx.rejectReason = reason;
      targetTx.processedAt = now;
      targetTx.note = `Yêu cầu rút tiền bị từ chối: ${reason}`;
      targetTx.updatedAt = now;
      await targetTx.save();

      const matchingWdr = await WithdrawalRequest.findOne({ id: cleanId });
      if (matchingWdr) {
        matchingWdr.status = 'rejected';
        matchingWdr.rejectionReason = reason;
        matchingWdr.processedAt = now;
        matchingWdr.updatedAt = now;
        await matchingWdr.save();
      }
    } else if (targetWdr) {
      targetUserId = targetWdr.userId || contextData?.userId || '';
      targetAmount = targetWdr.amount || contextData?.amount || 0;
      targetBankName = targetWdr.bankName || contextData?.bankName || 'Ngân hàng';
      targetBankAccount = targetWdr.bankAccount || contextData?.bankAccount || '';

      targetWdr.status = 'rejected';
      targetWdr.rejectionReason = reason;
      targetWdr.processedAt = now;
      targetWdr.updatedAt = now;
      await targetWdr.save();
    }

    // 3. Refund balance to User & Send Notification
    if (targetUserId && targetAmount > 0) {
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

    return {
      success: true,
      message: 'Đã từ chối lệnh rút tiền và hoàn lại tiền vào ví thành viên.'
    };
  } catch (error: any) {
    console.error('rejectWithdrawalService error:', error);
    return {
      success: false,
      message: `Lỗi khi từ chối lệnh rút: ${error?.message || 'Không xác định'}`
    };
  }
}
