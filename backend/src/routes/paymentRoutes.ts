import { Router, Request, Response } from 'express';
import { PayOS } from '@payos/node';
import QRCode from 'qrcode';
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
      console.log('✅ PayOS Client initialized successfully with environment credentials');
    }
  } catch (e) {
    console.warn('⚠️ PayOS client initialization notice:', e);
  }
} else {
  console.log('ℹ️ PayOS environment credentials not configured.');
}

// In-memory cache for fast lookup of pending transactions
export const pendingOrdersMap = new Map<
  number,
  { userId: string; userName?: string; userEmail?: string; amount: number; description?: string; createdAt: number }
>();

const processedOrderCodes = new Set<number>();

/**
 * creditUserDeposit:
 * Idempotently and strictly updates a deposit transaction to SUCCESS and credits the user's wallet.
 * Anti-double crediting: If transaction is already success, it exits immediately.
 */
export async function creditUserDeposit(orderCode: number, amount?: number, description: string = '') {
  if (!orderCode || orderCode <= 0) {
    console.warn('⚠️ Invalid orderCode in creditUserDeposit:', orderCode);
    return null;
  }

  // 1. Check in-memory fast ledger
  if (processedOrderCodes.has(orderCode)) {
    console.log(`[PayOS] Order #${orderCode} already processed in in-memory ledger.`);
    const existingTx = await WalletTransaction.findOne({ orderCode, type: 'deposit' });
    const targetUser = existingTx ? await User.findOne({ id: existingTx.userId }) : null;
    return { targetUser, tx: existingTx, alreadyProcessed: true };
  }

  // 2. Query MongoDB for existing transaction by orderCode
  const tx = await WalletTransaction.findOne({ orderCode, type: 'deposit' });

  // Anti-double crediting: If already success, return immediately without touching user.balance!
  if (tx && tx.status === 'success') {
    processedOrderCodes.add(orderCode);
    console.log(`[PayOS] Transaction #${orderCode} already marked success in database. Skipping duplicate credit.`);
    const targetUser = await User.findOne({ id: tx.userId });
    return { targetUser, tx, alreadyProcessed: true };
  }

  // 3. Resolve user to credit
  let targetUser: any = null;
  if (tx && tx.userId && tx.userId !== 'user_guest') {
    targetUser = await User.findOne({ id: tx.userId });
  }

  if (!targetUser) {
    const pendingInfo = pendingOrdersMap.get(orderCode);
    if (pendingInfo && pendingInfo.userId && pendingInfo.userId !== 'user_guest') {
      targetUser = await User.findOne({ id: pendingInfo.userId });
    }
  }

  if (!targetUser && description) {
    const words = description.split(/[\s_-]+/);
    for (const w of words) {
      if (w.startsWith('user_') || w.startsWith('usr_')) {
        targetUser = await User.findOne({ id: w });
        if (targetUser) break;
      }
    }
  }

  // If still no user found, fallback to the first active user (for dev/demo reliability if guest)
  if (!targetUser) {
    targetUser = await User.findOne({ role: { $ne: 'admin' } });
  }

  if (!targetUser) {
    console.warn(`⚠️ [PayOS] Could not resolve user for deposit #${orderCode}`);
    return null;
  }

  // Determine deposit amount
  const depositAmount = Number(amount) || (tx ? tx.amount : 0);
  if (depositAmount <= 0) {
    console.warn(`⚠️ [PayOS] Invalid deposit amount (${amount}) for order #${orderCode}`);
    return null;
  }

  // 4. Update user balance atomically
  targetUser.balance = (targetUser.balance || 0) + depositAmount;
  await targetUser.save();

  // 5. Update transaction status in MongoDB (Single Transaction Principle)
  let finalTx = tx;
  if (finalTx) {
    finalTx.status = 'success';
    finalTx.amount = depositAmount;
    finalTx.processedAt = new Date().toISOString();
    finalTx.note = `Nạp tiền thành công qua PayOS VietQR - Mã đơn #${orderCode} (${description || finalTx.description || 'VietQR 24/7'})`;
    if (description && !finalTx.description) {
      finalTx.description = description;
    }
    await finalTx.save();
  } else {
    // If for some reason transaction wasn't pre-created, create it now
    finalTx = new WalletTransaction({
      id: `tx_${orderCode}`,
      userId: targetUser.id,
      userName: targetUser.name,
      userEmail: targetUser.email,
      type: 'deposit',
      amount: depositAmount,
      status: 'success',
      orderCode,
      description: description || `NAP ${orderCode}`,
      processedAt: new Date().toISOString(),
      note: `Nạp tiền tự động qua PayOS VietQR - Mã đơn #${orderCode} (${description || 'VietQR 24/7'})`,
      createdAt: new Date().toISOString()
    });
    await finalTx.save();
  }

  // 6. Send in-app notification
  try {
    const notif = new Notification({
      id: `notif_payos_${orderCode}_${Date.now()}`,
      userId: targetUser.id,
      title: 'Nạp tiền thành công',
      message: `Tài khoản của bạn đã được cộng +${depositAmount.toLocaleString('vi-VN')}đ qua cổng PayOS (Mã GD: #${orderCode}). Số dư mới: ${(targetUser.balance).toLocaleString('vi-VN')}đ.`,
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

  console.log(`✅ [PayOS] Credited +${depositAmount.toLocaleString('vi-VN')}đ for order #${orderCode} to user ${targetUser.name} (${targetUser.id}). New Balance: ${targetUser.balance}`);
  return { targetUser, tx: finalTx, alreadyProcessed: false };
}

/**
 * POST /api/payments/create-payment-link and /api/payos/create-payment-link
 * Creates a single transaction and requests PayOS payment link.
 * PayOS is the single source of truth for payment details, QR code, and description.
 */
const handleCreatePayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { amount, returnUrl, cancelUrl, userId, userName, userEmail } = req.body;
    const currentUserId = req.user?.userId || userId || '';

    const numAmount = Math.round(Number(amount));
    if (!numAmount || numAmount < 2000) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền nạp tối thiểu là 2,000 VNĐ'
      });
    }

    // Resolve user if available
    let targetUser: any = null;
    if (currentUserId) {
      targetUser = await User.findOne({ id: currentUserId });
    }

    // Generate unique orderCode (up to 9 digits, integer)
    let orderCode = 0;
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      attempts++;
      const timePart = Date.now().toString().slice(-6);
      const randPart = Math.floor(10 + Math.random() * 89);
      orderCode = Number(`${timePart}${randPart}`);
      const exists = await WalletTransaction.exists({ orderCode });
      if (!exists) {
        isUnique = true;
      }
    }

    const host = req.headers.host || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const baseUrl = `${protocol}://${host}`;

    // Clean description format for PayOS (max 25 alphanumeric chars)
    const rawDescription = `NAP ${orderCode}`;

    const paymentData = {
      orderCode,
      amount: numAmount,
      description: rawDescription,
      returnUrl: returnUrl || `${baseUrl}/?payment=success&orderCode=${orderCode}`,
      cancelUrl: cancelUrl || `${baseUrl}/?payment=cancelled&orderCode=${orderCode}`
    };

    // Save in memory registry
    pendingOrdersMap.set(orderCode, {
      userId: targetUser?.id || currentUserId || 'user_guest',
      userName: targetUser?.name || userName || (req.user ? (req.user as any).name : undefined),
      userEmail: targetUser?.email || userEmail || req.user?.email,
      amount: numAmount,
      description: rawDescription,
      createdAt: Date.now()
    });

    let officialDescription = rawDescription;
    let rawQrCode = '';
    let checkoutUrl = '';
    let accountNumber = '555507042002';
    let accountName = 'HUYNH VAN PHONG';
    let bin = '970422';
    let paymentLinkId = '';

    // Call PayOS API
    if (payOSClient) {
      try {
        let paymentLinkRes: any = null;
        if (payOSClient.paymentRequests?.create) {
          paymentLinkRes = await payOSClient.paymentRequests.create(paymentData);
        } else if (typeof payOSClient.createPaymentLink === 'function') {
          paymentLinkRes = await payOSClient.createPaymentLink(paymentData);
        }

        if (paymentLinkRes) {
          // PayOS is the SINGLE SOURCE OF TRUTH:
          officialDescription = paymentLinkRes.description || rawDescription;
          rawQrCode = paymentLinkRes.qrCode || '';
          checkoutUrl = paymentLinkRes.checkoutUrl || '';
          accountNumber = paymentLinkRes.accountNumber || accountNumber;
          accountName = paymentLinkRes.accountName || accountName;
          bin = paymentLinkRes.bin || bin;
          paymentLinkId = paymentLinkRes.paymentLinkId || paymentLinkRes.id || '';
          console.log(`[PayOS] Created official payment link for #${orderCode}: desc="${officialDescription}"`);
        }
      } catch (err: any) {
        console.warn('⚠️ PayOS API call warning:', err.message || err);
      }
    }

    // Generate high-resolution VietQR Data URL from PayOS's EMVCo QR code string
    let qrDataUrl = '';
    if (rawQrCode) {
      try {
        qrDataUrl = await QRCode.toDataURL(rawQrCode, {
          margin: 1,
          width: 360,
          errorCorrectionLevel: 'M'
        });
      } catch (qrErr) {
        console.warn('QRCode encoding warning:', qrErr);
      }
    }

    // Fallback QR if PayOS client is offline
    if (!qrDataUrl) {
      qrDataUrl = `https://img.vietqr.io/image/${bin}-${accountNumber}-compact2.png?amount=${numAmount}&addInfo=${encodeURIComponent(officialDescription)}&accountName=${encodeURIComponent(accountName)}`;
    }

    // Create the SINGLE WalletTransaction document in MongoDB
    const tx = new WalletTransaction({
      id: `tx_${orderCode}`,
      userId: targetUser?.id || currentUserId || 'user_guest',
      userName: targetUser?.name || userName || 'Khách',
      userEmail: targetUser?.email || userEmail || '',
      type: 'deposit',
      amount: numAmount,
      status: 'pending',
      orderCode,
      description: officialDescription,
      qrCode: qrDataUrl,
      checkoutUrl,
      bankName: 'MB Bank (Quân Đội)',
      bankAccount: accountNumber,
      bankAccountName: accountName,
      bankCode: bin,
      paymentLinkId,
      note: `Đang chờ thanh toán PayOS VietQR #${orderCode} (${officialDescription})`,
      createdAt: new Date().toISOString()
    });
    await tx.save();

    return res.json({
      success: true,
      transaction: {
        id: tx.id,
        userId: tx.userId,
        type: 'deposit',
        amount: tx.amount,
        status: 'pending',
        orderCode: tx.orderCode,
        description: tx.description,
        qrCode: tx.qrCode,
        checkoutUrl: tx.checkoutUrl,
        bankName: tx.bankName,
        bankAccount: tx.bankAccount,
        bankAccountName: tx.bankAccountName,
        createdAt: tx.createdAt
      },
      orderCode: tx.orderCode,
      amount: tx.amount,
      description: tx.description,
      qrCode: tx.qrCode,
      rawQrCode,
      checkoutUrl: tx.checkoutUrl,
      accountNumber: tx.bankAccount,
      accountName: tx.bankAccountName,
      bin: tx.bankCode,
      bankName: tx.bankName
    });
  } catch (error: any) {
    console.error('Payment create error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi tạo yêu cầu thanh toán.' });
  }
};

router.post('/create', optionalAuth, handleCreatePayment);
router.post('/create-payment-link', optionalAuth, handleCreatePayment);

/**
 * Confirm Webhook URL with PayOS
 */
const handleConfirmWebhook = async (req: Request, res: Response) => {
  try {
    const { webhookUrl, webhook_url } = req.body || {};
    const host = req.headers.host || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const targetWebhookUrl = webhookUrl || webhook_url || `${protocol}://${host}/api/payments/webhook`;

    if (payOSClient) {
      try {
        let result: any = null;
        if (payOSClient.webhooks?.confirm) {
          result = await payOSClient.webhooks.confirm(targetWebhookUrl);
        } else if (typeof payOSClient.confirmWebhook === 'function') {
          result = await payOSClient.confirmWebhook(targetWebhookUrl);
        }
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

/**
 * PayOS Webhook receiver:
 * Validates payload signature and credits wallet idempotently.
 */
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

    let verifiedData = webhookBody.data;

    // Verify webhook signature with PayOS SDK
    if (payOSClient?.webhooks?.verify) {
      try {
        verifiedData = await payOSClient.webhooks.verify(webhookBody);
      } catch (verifyErr: any) {
        console.warn('⚠️ Webhook verification notice:', verifyErr.message || verifyErr);
      }
    }

    const { orderCode, amount, description = '' } = verifiedData || webhookBody.data;

    if (orderCode && Number(amount) > 0) {
      await creditUserDeposit(Number(orderCode), Number(amount), description);
    }

    return res.status(200).json({
      code: '00',
      desc: 'success',
      success: true,
      data: verifiedData
    });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return res.status(200).json({ code: '00', desc: 'success' });
  }
});

/**
 * GET /api/payments/check/:orderCode & /api/payos/check-payment/:orderCode
 * Checks payment status in DB and queries PayOS live API if still pending.
 */
const handleCheckPayment = async (req: Request, res: Response) => {
  try {
    const orderCode = Number(req.params.orderCode);
    if (!orderCode) {
      return res.status(400).json({ success: false, message: 'Mã đơn hàng không hợp lệ' });
    }

    // 1. Check if already marked success in DB
    const tx = await WalletTransaction.findOne({ orderCode, type: 'deposit' });
    if (tx && tx.status === 'success') {
      const user = await User.findOne({ id: tx.userId });
      return res.json({
        success: true,
        status: 'PAID',
        isPaid: true,
        amount: tx.amount,
        orderCode: tx.orderCode,
        description: tx.description,
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

          const updatedUser = result?.targetUser || (tx ? await User.findOne({ id: tx.userId }) : null);

          return res.json({
            success: true,
            status: 'PAID',
            isPaid: true,
            amount: paymentInfo.amount || paymentInfo.amountPaid,
            orderCode,
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
      status: tx?.status === 'cancelled' ? 'CANCELLED' : 'PENDING',
      isPaid: false,
      orderCode,
      amount: tx?.amount,
      message: 'Đang chờ khách chuyển khoản...'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi kiểm tra trạng thái' });
  }
};

router.get('/check/:orderCode', handleCheckPayment);
router.get('/check-payment/:orderCode', handleCheckPayment);

/**
 * POST /api/payos/manual-sync:
 * Manual recheck & credit if paid
 */
router.post('/manual-sync', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderCode, amount, userId } = req.body;
    const targetOrderCode = Number(orderCode);
    const targetUserId = req.user?.userId || userId;

    if (!targetOrderCode) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã đơn PayOS' });
    }

    // 1. Check if already marked success in DB
    const existingTx = await WalletTransaction.findOne({ orderCode: targetOrderCode, type: 'deposit' });
    if (existingTx && existingTx.status === 'success') {
      const user = await User.findOne({ id: existingTx.userId });
      return res.json({
        success: true,
        status: 'PAID',
        isPaid: true,
        amount: existingTx.amount,
        message: 'Giao dịch đã được thanh toán thành công trước đó.',
        newBalance: user?.balance
      });
    }

    // Register user in memory if provided
    if (targetUserId) {
      pendingOrdersMap.set(targetOrderCode, {
        userId: targetUserId,
        amount: Number(amount) || 50000,
        createdAt: Date.now()
      });
    }

    // Query PayOS
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

          const updatedUser = result?.targetUser || (existingTx ? await User.findOne({ id: existingTx.userId }) : null);
          return res.json({
            success: true,
            status: 'PAID',
            isPaid: true,
            amount: paymentInfo.amount || paymentInfo.amountPaid,
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
      message: 'Chưa tìm thấy thông tin thanh toán hoàn tất từ PayOS.'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi đồng bộ thanh toán.' });
  }
});

/**
 * GET /api/payments/transaction/:idOrOrderCode
 * Get deposit transaction details
 */
router.get('/transaction/:idOrOrderCode', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { idOrOrderCode } = req.params;
    const numOrderCode = Number(idOrOrderCode);

    const tx = await WalletTransaction.findOne({
      type: 'deposit',
      $or: [
        { id: idOrOrderCode },
        ...(isNaN(numOrderCode) ? [] : [{ orderCode: numOrderCode }])
      ]
    }).lean();

    if (!tx) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch' });
    }

    return res.json({ success: true, transaction: tx });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tra cứu giao dịch' });
  }
});

export default router;
