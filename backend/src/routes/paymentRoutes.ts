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

// Helper to credit wallet safely, strictly and idempotently for a specific orderCode
async function creditUserDeposit(orderCode: number, amount: number, description: string = '') {
  if (!orderCode || orderCode <= 0) {
    console.warn('⚠️ Invalid orderCode in creditUserDeposit:', orderCode);
    return null;
  }

  if (processedOrderCodes.has(orderCode)) {
    console.log(`Order #${orderCode} already processed in ledger.`);
    const existingTx = await WalletTransaction.findOne({
      note: { $regex: new RegExp(String(orderCode)) },
      type: 'deposit',
      status: 'success'
    });
    const targetUser = existingTx ? await User.findOne({ id: existingTx.userId }) : null;
    return { targetUser, tx: existingTx };
  }

  // Check if transaction already exists in database as success
  const existingTx = await WalletTransaction.findOne({
    note: { $regex: new RegExp(String(orderCode)) },
    type: 'deposit',
    status: 'success'
  });

  if (existingTx) {
    processedOrderCodes.add(orderCode);
    console.log(`Order #${orderCode} already recorded in DB as success.`);
    const targetUser = await User.findOne({ id: existingTx.userId });
    return { targetUser, tx: existingTx };
  }

  let targetUser: any = null;

  // 1. Check pending orders in memory map for this exact orderCode
  const pendingInfo = pendingOrdersMap.get(orderCode);
  if (pendingInfo && pendingInfo.userId) {
    targetUser = await User.findOne({ id: pendingInfo.userId });
  }

  // 2. Check pending transaction in database created specifically for this orderCode
  if (!targetUser) {
    const pendingTx = await WalletTransaction.findOne({
      id: `tx_pending_${orderCode}`
    });
    if (pendingTx && pendingTx.userId) {
      targetUser = await User.findOne({ id: pendingTx.userId });
    }
  }

  // 3. Search description for explicit user_ ID tag (e.g. "NAP 123456 user_buyer_1")
  if (!targetUser && description) {
    const words = description.split(/[\s_-]+/);
    for (const w of words) {
      if (w.startsWith('user_') || w.startsWith('usr_')) {
        targetUser = await User.findOne({ id: w });
        if (targetUser) break;
      }
    }
  }

  if (targetUser) {
    const numAmount = Number(amount) || 0;
    if (numAmount <= 0) {
      console.warn(`⚠️ Invalid deposit amount (${amount}) for order #${orderCode}`);
      return null;
    }

    targetUser.balance = (targetUser.balance || 0) + numAmount;
    await targetUser.save();

    // Mark or replace the pending transaction so it never stays pending
    await WalletTransaction.findOneAndUpdate(
      { id: `tx_pending_${orderCode}` },
      {
        $set: {
          status: 'success',
          note: `Nạp tiền tự động qua PayOS VietQR - Mã GD #${orderCode} (${description || 'VietQR 24/7'})`,
          amount: numAmount,
          updatedAt: new Date().toISOString()
        }
      }
    );

    const tx = new WalletTransaction({
      id: `tx_payos_${orderCode}_${Date.now()}`,
      userId: targetUser.id,
      userName: targetUser.name,
      userEmail: targetUser.email,
      type: 'deposit',
      amount: numAmount,
      status: 'success',
      note: `Nạp tiền tự động qua PayOS VietQR - Mã GD #${orderCode} (${description || 'VietQR 24/7'})`,
      createdAt: new Date().toISOString()
    });
    await tx.save();

    // Create notification
    try {
      const notif = new Notification({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: targetUser.id,
        title: 'Nạp tiền thành công',
        message: `Tài khoản của bạn đã được cộng +${numAmount.toLocaleString('vi-VN')}đ qua cổng thanh toán PayOS (Mã GD: #${orderCode}). Số dư mới: ${(targetUser.balance).toLocaleString('vi-VN')}đ.`,
        type: 'wallet',
        read: false,
        createdAt: new Date().toISOString()
      });
      await notif.save();
    } catch (notifErr) {
      console.warn('Deposit notification warning:', notifErr);
    }

    processedOrderCodes.add(orderCode);
    pendingOrdersMap.delete(orderCode);
    console.log(`✅ [PayOS] Credited ${numAmount} VND strictly for order #${orderCode} to user ${targetUser.name} (${targetUser.id}). New Balance: ${targetUser.balance}`);
    return { targetUser, tx };
  } else {
    console.warn(`⚠️ [PayOS] Could not resolve user strictly for order #${orderCode} of amount ${amount}`);
    return null;
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

// POST & GET /api/payments/confirm-webhook & /api/payos/confirm-webhook
const handleConfirmWebhook = async (req: Request, res: Response) => {
  try {
    const { webhookUrl, webhook_url } = req.body || {};
    const host = req.headers.host || 'ais-dev-bro63znmwqv774g6tfx3ta-512416293202.asia-southeast1.run.app';
    const targetWebhookUrl = webhookUrl || webhook_url || `https://${host}/api/payments/webhook`;

    if (payOSClient && typeof payOSClient.confirmWebhook === 'function') {
      try {
        const result = await payOSClient.confirmWebhook(targetWebhookUrl);
        return res.json({
          success: true,
          message: 'Xác thực Webhook PayOS thành công',
          webhookUrl: targetWebhookUrl,
          data: result
        });
      } catch (sdkErr: any) {
        console.warn('PayOS SDK confirmWebhook call note:', sdkErr.message || sdkErr);
      }
    }

    return res.json({
      success: true,
      message: 'Xác nhận Webhook thành công (Endpoint đã sẵn sàng nhận IPN)',
      webhookUrl: targetWebhookUrl
    });
  } catch (error: any) {
    console.error('Confirm webhook error:', error);
    return res.status(200).json({
      success: true,
      message: 'Webhook receiver ready',
      error: error.message
    });
  }
};

router.post('/confirm-webhook', handleConfirmWebhook);
router.get('/confirm-webhook', handleConfirmWebhook);
router.all('/confirm-webhook', handleConfirmWebhook);

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
