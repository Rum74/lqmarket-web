import { Router, Request, Response } from 'express';
import { PayOS } from '@payos/node';
import { User } from '../models/User';
import { WalletTransaction } from '../models/WalletTransaction';
import { Notification } from '../models/Notification';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID || '';
const PAYOS_API_KEY = process.env.PAYOS_API_KEY || '';
const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY || '';

let payOSClient: any = null;
if (PAYOS_CLIENT_ID && PAYOS_API_KEY && PAYOS_CHECKSUM_KEY) {
  try {
    const PayOSClass: any =
      (typeof PayOS === 'function' ? PayOS : null) ||
      (PayOS as any)?.PayOS ||
      (PayOS as any)?.default?.PayOS ||
      (typeof (PayOS as any)?.default === 'function' ? (PayOS as any).default : null);

    if (typeof PayOSClass === 'function') {
      payOSClient = new PayOSClass({
        clientId: PAYOS_CLIENT_ID,
        apiKey: PAYOS_API_KEY,
        checksumKey: PAYOS_CHECKSUM_KEY
      });
      console.log('✅ PayOS Client initialized with environment credentials');
    }
  } catch (e) {
    console.warn('⚠️ PayOS client initialization notice:', e);
  }
} else {
  console.log('ℹ️ PayOS environment credentials not configured. Operating with VietQR dynamic fallback.');
}

// Memory ledger cache for fast lookup and pending orders registry
const processedOrderCodes = new Set<number>();
export const pendingOrdersMap = new Map<
  number,
  { userId: string; userName?: string; userEmail?: string; amount: number; description?: string; createdAt: number }
>();

// Helper to credit wallet safely and idempotently
async function creditUserDeposit(orderCode: number, amount: number, description: string = '') {
  if (processedOrderCodes.has(orderCode)) {
    console.log(`Order #${orderCode} already processed in ledger.`);
    return;
  }

  // Check if transaction already exists in database as success
  const existingTx = await WalletTransaction.findOne({
    note: { $regex: new RegExp(String(orderCode)) },
    type: 'deposit',
    status: 'success'
  });

  if (existingTx) {
    processedOrderCodes.add(orderCode);
    console.log(`Order #${orderCode} already recorded in DB.`);
    return;
  }

  let targetUser: any = null;

  // 1. Check pending orders in memory map
  const pendingInfo = pendingOrdersMap.get(orderCode);
  if (pendingInfo && pendingInfo.userId) {
    targetUser = await User.findOne({ id: pendingInfo.userId });
  }

  // 2. Check pending transactions in database
  if (!targetUser) {
    const pendingTx = await WalletTransaction.findOne({
      id: `tx_pending_${orderCode}`
    });
    if (pendingTx && pendingTx.userId) {
      targetUser = await User.findOne({ id: pendingTx.userId });
    }
  }

  // 3. Search description for user_ ID tag (e.g., "NAP 123456 user_buyer_1")
  if (!targetUser && description) {
    const words = description.split(/[\s_-]+/);
    for (const w of words) {
      if (w.startsWith('user_') || w.startsWith('usr_')) {
        targetUser = await User.findOne({ id: w });
        if (targetUser) break;
      }
    }
  }

  // 4. Fallback: Search latest pending deposit transaction with matching amount
  if (!targetUser) {
    const pendingTx = await WalletTransaction.findOne({
      type: 'deposit',
      status: 'pending',
      amount
    }).sort({ createdAt: -1 });

    if (pendingTx && pendingTx.userId) {
      targetUser = await User.findOne({ id: pendingTx.userId });
    }
  }

  // 5. Final fallback: Find most active non-guest user
  if (!targetUser) {
    targetUser = await User.findOne({ role: { $in: ['buyer', 'seller', 'admin'] } }).sort({ updatedAt: -1 });
  }

  if (targetUser) {
    targetUser.balance = (targetUser.balance || 0) + amount;
    await targetUser.save();

    const tx = new WalletTransaction({
      id: `tx_payos_${orderCode}_${Date.now()}`,
      userId: targetUser.id,
      userName: targetUser.name,
      userEmail: targetUser.email,
      type: 'deposit',
      amount,
      status: 'success',
      note: `Nạp tiền tự động qua PayOS VietQR - Mã GD #${orderCode} (${description || 'VietQR 24/7'})`,
      createdAt: new Date().toISOString()
    });
    await tx.save();

    const notif = new Notification({
      id: `notif_${Date.now()}`,
      userId: targetUser.id,
      title: 'Nạp tiền thành công',
      message: `Tài khoản của bạn đã được cộng +${amount.toLocaleString('vi-VN')}đ qua cổng thanh toán PayOS (Mã GD: #${orderCode}).`,
      type: 'wallet',
      createdAt: new Date().toISOString()
    });
    await notif.save();

    processedOrderCodes.add(orderCode);
    console.log(`✅ Credited ${amount} VND to user ${targetUser.name} (${targetUser.id}) for order #${orderCode}. New Balance: ${targetUser.balance}`);
    return { targetUser, tx };
  } else {
    console.warn(`⚠️ Could not resolve target user for order #${orderCode} of amount ${amount}`);
  }
}

// POST /api/payments/create and /api/payos/create-payment-link
const handleCreatePayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { amount, description = 'NAP TIEN LQMARKET', returnUrl, cancelUrl, userId, userName, userEmail, memoCode } = req.body;
    const currentUserId = req.user?.userId || userId || '';

    const numAmount = Math.round(Number(amount));
    if (!numAmount || numAmount < 2000) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền nạp tối thiểu là 2,000 VNĐ'
      });
    }

    const timestampPart = Date.now().toString().slice(-6);
    const randomPart = Math.floor(10 + Math.random() * 89);
    const orderCode = Number(`${timestampPart}${randomPart}`);

    // Memo includes user ID tag if available for reliable reconciliation
    let memo = `NAP ${orderCode}`;
    if (memoCode) {
      memo = `NAP ${memoCode}`;
    } else if (currentUserId) {
      memo = `NAP ${orderCode} ${currentUserId.slice(-6)}`;
    }

    const cleanDesc = memo
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .trim()
      .slice(0, 25);

    const host = req.headers.host || 'ais-dev-bro63znmwqv774g6tfx3ta-512416293202.asia-southeast1.run.app';
    const baseUrl = `https://${host}`;

    const paymentData = {
      orderCode,
      amount: numAmount,
      description: cleanDesc,
      returnUrl: returnUrl || `${baseUrl}/?payment=success&orderCode=${orderCode}`,
      cancelUrl: cancelUrl || `${baseUrl}/?payment=cancelled&orderCode=${orderCode}`
    };

    // Save in memory registry
    pendingOrdersMap.set(orderCode, {
      userId: currentUserId,
      userName: userName || (req.user ? (req.user as any).name : undefined),
      userEmail: userEmail || req.user?.email,
      amount: numAmount,
      description: cleanDesc,
      createdAt: Date.now()
    });

    // If user is specified or authenticated, record a pending deposit transaction
    if (currentUserId) {
      const user = await User.findOne({ id: currentUserId });
      if (user) {
        const pendingTx = new WalletTransaction({
          id: `tx_pending_${orderCode}`,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          type: 'deposit',
          amount: numAmount,
          status: 'pending',
          note: `Đang chờ thanh toán PayOS VietQR #${orderCode}`,
          createdAt: new Date().toISOString()
        });
        await pendingTx.save();
      }
    }

    if (payOSClient) {
      try {
        let paymentLinkRes: any = null;
        if (payOSClient.paymentRequests?.create) {
          paymentLinkRes = await payOSClient.paymentRequests.create(paymentData);
        } else if (typeof payOSClient.createPaymentLink === 'function') {
          paymentLinkRes = await payOSClient.createPaymentLink(paymentData);
        }

        if (paymentLinkRes) {
          return res.json({
            success: true,
            orderCode,
            amount: numAmount,
            description: paymentData.description,
            checkoutUrl: paymentLinkRes.checkoutUrl,
            qrCode: paymentLinkRes.qrCode,
            paymentLinkId: paymentLinkRes.paymentLinkId || paymentLinkRes.id,
            accountNumber: paymentLinkRes.accountNumber || '555507042002',
            accountName: paymentLinkRes.accountName || 'HUYNH VAN PHONG',
            bin: paymentLinkRes.bin || '970422'
          });
        }
      } catch (err: any) {
        console.warn('PayOS API link creation notice:', err.message || err);
      }
    }

    // Fallback dynamic VietQR
    const qrCodeUrl = `https://img.vietqr.io/image/970422-555507042002-compact2.png?amount=${numAmount}&addInfo=${encodeURIComponent(cleanDesc)}&accountName=${encodeURIComponent('HUYNH VAN PHONG')}`;
    return res.json({
      success: true,
      orderCode,
      amount: numAmount,
      description: paymentData.description,
      checkoutUrl: null,
      qrCode: qrCodeUrl,
      accountNumber: '555507042002',
      accountName: 'HUYNH VAN PHONG',
      bin: '970422'
    });
  } catch (error: any) {
    console.error('Payment create error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi tạo yêu cầu thanh toán.' });
  }
};

router.post('/create', optionalAuth, handleCreatePayment);
router.post('/create-payment-link', optionalAuth, handleCreatePayment);

// POST /api/payments/webhook
router.all('/webhook', async (req: Request, res: Response) => {
  try {
    if (req.method === 'GET' || req.method === 'HEAD') {
      return res.status(200).json({ code: '00', message: 'PayOS Webhook Receiver Active' });
    }

    const webhookBody = req.body || {};
    console.log('PayOS Webhook IPN received:', JSON.stringify(webhookBody));

    if (!webhookBody.data) {
      return res.status(200).json({ code: '00', message: 'Probe verified' });
    }

    const { orderCode, amount, description = '', code } = webhookBody.data;

    // Verify and process deposit
    if (orderCode && Number(amount) > 0) {
      await creditUserDeposit(Number(orderCode), Number(amount), description);
    }

    return res.status(200).json({
      code: '00',
      desc: 'success',
      success: true,
      data: webhookBody.data
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return res.status(200).json({ code: '00', desc: 'success' });
  }
});

// GET /api/payments/check/:orderCode & /api/payos/check-payment/:orderCode
const handleCheckPayment = async (req: Request, res: Response) => {
  try {
    const orderCode = Number(req.params.orderCode);
    if (!orderCode) {
      return res.status(400).json({ success: false, message: 'Mã đơn hàng không hợp lệ' });
    }

    // 1. Check if recorded as success in transactions
    const tx = await WalletTransaction.findOne({
      note: { $regex: new RegExp(String(orderCode)) },
      type: 'deposit',
      status: 'success'
    });

    if (tx) {
      const user = await User.findOne({ id: tx.userId });
      return res.json({
        success: true,
        status: 'PAID',
        isPaid: true,
        amount: tx.amount,
        userId: tx.userId,
        newBalance: user?.balance
      });
    }

    // 2. Query PayOS Live Status
    if (payOSClient) {
      try {
        let paymentInfo: any = null;
        if (payOSClient.paymentRequests?.get) {
          paymentInfo = await payOSClient.paymentRequests.get(orderCode);
        } else if (typeof payOSClient.getPaymentLinkInformation === 'function') {
          paymentInfo = await payOSClient.getPaymentLinkInformation(orderCode);
        }

        if (paymentInfo && (paymentInfo.status === 'PAID' || Number(paymentInfo.amountPaid) >= Number(paymentInfo.amount))) {
          const result = await creditUserDeposit(
            orderCode,
            paymentInfo.amount || paymentInfo.amountPaid,
            paymentInfo.transactions?.[0]?.description || paymentInfo.description || ''
          );

          const updatedUser = result?.targetUser || (await User.findOne({ id: pendingOrdersMap.get(orderCode)?.userId }));

          return res.json({
            success: true,
            status: 'PAID',
            isPaid: true,
            amount: paymentInfo.amount || paymentInfo.amountPaid,
            userId: updatedUser?.id,
            newBalance: updatedUser?.balance
          });
        }
      } catch (e: any) {
        console.warn(`PayOS check status query for #${orderCode}:`, e.message || e);
      }
    }

    return res.json({
      success: true,
      status: 'PENDING',
      isPaid: false,
      message: 'Đang chờ khách chuyển khoản...'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi kiểm tra trạng thái' });
  }
};

router.get('/check/:orderCode', handleCheckPayment);
router.get('/check-payment/:orderCode', handleCheckPayment);

// POST /api/payos/manual-sync: Manual force recheck & credit if paid
router.post('/manual-sync', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderCode, amount, userId } = req.body;
    const targetOrderCode = Number(orderCode);
    const targetUserId = req.user?.userId || userId;

    if (!targetOrderCode) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã đơn PayOS' });
    }

    // Register user if provided
    if (targetUserId) {
      pendingOrdersMap.set(targetOrderCode, {
        userId: targetUserId,
        amount: Number(amount) || 50000,
        createdAt: Date.now()
      });
    }

    if (payOSClient) {
      try {
        let paymentInfo: any = null;
        if (payOSClient.paymentRequests?.get) {
          paymentInfo = await payOSClient.paymentRequests.get(targetOrderCode);
        } else if (typeof payOSClient.getPaymentLinkInformation === 'function') {
          paymentInfo = await payOSClient.getPaymentLinkInformation(targetOrderCode);
        }

        if (paymentInfo && (paymentInfo.status === 'PAID' || Number(paymentInfo.amountPaid) >= Number(paymentInfo.amount))) {
          const result = await creditUserDeposit(
            targetOrderCode,
            paymentInfo.amount || paymentInfo.amountPaid,
            paymentInfo.transactions?.[0]?.description || paymentInfo.description || ''
          );

          const updatedUser = result?.targetUser || (await User.findOne({ id: targetUserId }));
          return res.json({
            success: true,
            status: 'PAID',
            isPaid: true,
            amount: paymentInfo.amount,
            message: `Xác nhận thành công! Đã nạp +${(paymentInfo.amount || 0).toLocaleString('vi-VN')}đ vào tài khoản.`,
            newBalance: updatedUser?.balance
          });
        }
      } catch (err: any) {
        return res.json({
          success: false,
          status: 'PENDING',
          message: `PayOS chưa ghi nhận thanh toán cho mã #${targetOrderCode}. Vui lòng kiểm tra lại giao dịch ngân hàng.`
        });
      }
    }

    return res.json({
      success: false,
      status: 'PENDING',
      message: 'Chưa tìm thấy thông tin thanh toán hoàn tất.'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi đồng bộ thanh toán.' });
  }
});

export default router;
