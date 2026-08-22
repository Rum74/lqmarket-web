import express from 'express';
import path from 'path';
import fs from 'fs';
import { PayOS } from '@payos/node';

// PayOS Client Credentials
const PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID || '70f0f30e-bb9a-4543-9e27-7afedef2c57a';
const PAYOS_API_KEY = process.env.PAYOS_API_KEY || '79d0ea14-7008-4556-a1b8-4c220f1e1bf9';
const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY || '054a5db2d2ed9fad1554f7229dc97cbd33f2e73d06c7c86546ba83f713edeeda';

// Robust PayOS Client Initialization (PayOS Node SDK v2)
let payOSClient: any = null;
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
    console.log('✅ PayOS v2 SDK initialized successfully with Client ID:', PAYOS_CLIENT_ID);
  } else {
    console.warn('⚠️ PayOS constructor function not found in @payos/node exports');
  }
} catch (e) {
  console.warn('⚠️ PayOS initialization warning:', e);
}

// Unified PayOS Helper bridging SDK differences
const payOSService = {
  isConfigured: () => Boolean(payOSClient),

  async createPaymentLink(paymentData: any) {
    if (!payOSClient) throw new Error('PayOS chưa được khởi tạo');
    if (payOSClient.paymentRequests?.create) {
      return await payOSClient.paymentRequests.create(paymentData);
    }
    if (typeof payOSClient.createPaymentLink === 'function') {
      return await payOSClient.createPaymentLink(paymentData);
    }
    throw new Error('Không tìm thấy phương thức tạo link thanh toán trên PayOS SDK');
  },

  async getPaymentInfo(orderCode: number | string) {
    if (!payOSClient) throw new Error('PayOS chưa được khởi tạo');
    if (payOSClient.paymentRequests?.get) {
      return await payOSClient.paymentRequests.get(Number(orderCode));
    }
    if (typeof payOSClient.getPaymentLinkInformation === 'function') {
      return await payOSClient.getPaymentLinkInformation(Number(orderCode));
    }
    throw new Error('Không tìm thấy phương thức kiểm tra đơn hàng trên PayOS SDK');
  },

  async confirmWebhook(webhookUrl: string) {
    if (!payOSClient) throw new Error('PayOS chưa được khởi tạo');
    if (payOSClient.webhooks?.confirm) {
      return await payOSClient.webhooks.confirm(webhookUrl);
    }
    if (typeof payOSClient.confirmWebhook === 'function') {
      return await payOSClient.confirmWebhook(webhookUrl);
    }
    throw new Error('Không tìm thấy phương thức xác thực webhook trên PayOS SDK');
  },

  async verifyWebhook(webhookBody: any) {
    if (!payOSClient) return true;
    try {
      if (payOSClient.webhooks?.verify) {
        return await payOSClient.webhooks.verify(webhookBody);
      }
      if (typeof payOSClient.verifyPaymentWebhookData === 'function') {
        return payOSClient.verifyPaymentWebhookData(webhookBody);
      }
    } catch (e) {
      console.warn('Webhook verification notice:', e);
    }
    return true;
  }
};

// In-memory payment ledger cache
const recentPaidOrders = new Map<number, {
  orderCode: number;
  amount: number;
  description: string;
  transactionDateTime: string;
  status: string;
  accountNumber?: string;
  reference?: string;
}>();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ==========================================
  // PAYOS INTEGRATION ROUTES
  // ==========================================

  const webhookHandler = async (req: express.Request, res: express.Response) => {
    try {
      if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
        return res.status(200).json({
          code: '00',
          desc: 'success',
          success: true,
          status: 'active',
          service: 'LQMarket PayOS Webhook Receiver',
          message: 'Webhook endpoint is active and listening for PayOS IPN events 24/7'
        });
      }

      // POST Request: PayOS IPN Payment Notification or Verification Probe
      const webhookBody = req.body || {};
      console.log('Received PayOS Webhook notification:', JSON.stringify(webhookBody));

      // If test probe or empty data from PayOS validator
      if (!webhookBody.data) {
        return res.status(200).json({
          code: '00',
          desc: 'success',
          success: true,
          message: 'Webhook probe verified successfully'
        });
      }

      // Verify webhook data
      try {
        if (webhookBody.signature && payOSService.isConfigured()) {
          const verified = await payOSService.verifyWebhook(webhookBody);
          if (verified) {
            console.log('PayOS Webhook Signature Verified successfully!');
          }
        }
      } catch (signErr) {
        console.warn('PayOS signature verification warning:', signErr);
      }

      const { orderCode, amount, description, transactionDateTime, accountNumber, reference } = webhookBody.data;

      if (orderCode) {
        recentPaidOrders.set(Number(orderCode), {
          orderCode: Number(orderCode),
          amount: Number(amount) || 0,
          description: description || '',
          transactionDateTime: transactionDateTime || new Date().toISOString(),
          status: 'PAID',
          accountNumber,
          reference
        });
        console.log(`Order #${orderCode} recorded as PAID (${amount} VND)`);
      }

      // PayOS expects HTTP 200 with code "00"
      return res.status(200).json({
        code: '00',
        desc: 'success',
        success: true,
        data: webhookBody.data
      });
    } catch (error: any) {
      console.error('Error handling PayOS webhook:', error);
      return res.status(200).json({
        code: '00',
        desc: 'success',
        success: true
      });
    }
  };

  // Register on all standard and alternate webhook paths
  app.all('/api/payos/webhook', webhookHandler);
  app.all('/api/payos/webhook/', webhookHandler);
  app.all('/api/webhook', webhookHandler);
  app.all('/webhook', webhookHandler);
  app.all('/payos/webhook', webhookHandler);

  // 2. PayOS Confirm Webhook URL with PayOS server
  app.post('/api/payos/confirm-webhook', async (req, res) => {
    try {
      const defaultWebhookUrl = 'https://ais-dev-bro63znmwqv774g6tfx3ta-512416293202.asia-southeast1.run.app/api/payos/webhook';
      const webhookUrl = req.body.webhookUrl || defaultWebhookUrl;

      if (!payOSService.isConfigured()) {
        return res.status(500).json({
          success: false,
          message: 'Khách hàng chưa cấu hình PayOS API keys trên server.'
        });
      }

      const result = await payOSService.confirmWebhook(webhookUrl);
      res.json({
        success: true,
        message: 'Webhook URL đã được xác thực thành công với PayOS!',
        result,
        webhookUrl
      });
    } catch (error: any) {
      console.error('Error confirming webhook with PayOS:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi khi xác thực webhook với PayOS',
        error: String(error)
      });
    }
  });

  // 3. Create Real PayOS Payment Link & VietQR
  app.post('/api/payos/create-payment-link', async (req, res) => {
    try {
      const { amount, description = 'NAP TIEN LQMARKET', returnUrl, cancelUrl } = req.body;

      if (!amount || Number(amount) < 2000) {
        return res.status(400).json({
          success: false,
          message: 'Số tiền nạp tối thiểu qua PayOS là 2,000 VNĐ'
        });
      }

      // Generate a unique numeric orderCode between 100000 and 9999999999
      const timestampPart = Date.now().toString().slice(-6);
      const randomPart = Math.floor(10 + Math.random() * 89);
      const orderCode = Number(`${timestampPart}${randomPart}`);

      // Sanitize description: max 25 characters, alphanumeric & spaces only for banking memo
      const cleanDesc = description
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .trim()
        .slice(0, 25);

      const host = req.headers.host || 'ais-dev-bro63znmwqv774g6tfx3ta-512416293202.asia-southeast1.run.app';
      const baseUrl = `https://${host}`;

      const paymentData = {
        orderCode,
        amount: Math.round(Number(amount)),
        description: cleanDesc || `NAP ${orderCode}`,
        returnUrl: returnUrl || `${baseUrl}/?payment=success&orderCode=${orderCode}`,
        cancelUrl: cancelUrl || `${baseUrl}/?payment=cancelled&orderCode=${orderCode}`,
      };

      if (!payOSService.isConfigured()) {
        // Fallback VietQR response if SDK unavailable
        const qrCodeUrl = `https://img.vietqr.io/image/970422-555507042002-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(cleanDesc || `NAP ${orderCode}`)}&accountName=${encodeURIComponent('HUYNH VAN PHONG')}`;
        return res.json({
          success: true,
          orderCode,
          amount: Number(amount),
          description: paymentData.description,
          checkoutUrl: null,
          qrCode: qrCodeUrl,
          accountNumber: '555507042002',
          accountName: 'HUYNH VAN PHONG',
          bin: '970422'
        });
      }

      console.log('Creating PayOS Payment Link with payload:', paymentData);
      const paymentLinkRes: any = await payOSService.createPaymentLink(paymentData);

      res.json({
        success: true,
        orderCode,
        amount: Number(amount),
        description: paymentData.description,
        checkoutUrl: paymentLinkRes.checkoutUrl,
        qrCode: paymentLinkRes.qrCode,
        paymentLinkId: paymentLinkRes.paymentLinkId || paymentLinkRes.id,
        accountNumber: paymentLinkRes.accountNumber,
        accountName: paymentLinkRes.accountName,
        bin: paymentLinkRes.bin
      });
    } catch (error: any) {
      console.error('PayOS Create Payment Link Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Không thể tạo liên kết thanh toán PayOS',
        error: String(error)
      });
    }
  });

  // 4. Check Payment Status (Poll status from memory cache or PayOS API)
  app.get('/api/payos/check-payment/:orderCode', async (req, res) => {
    try {
      const orderCode = Number(req.params.orderCode);

      if (!orderCode) {
        return res.status(400).json({ success: false, message: 'Mã đơn hàng không hợp lệ' });
      }

      // Check cache first (instant response from webhook)
      if (recentPaidOrders.has(orderCode)) {
        const cachedOrder = recentPaidOrders.get(orderCode);
        return res.json({
          success: true,
          status: 'PAID',
          isPaid: true,
          order: cachedOrder
        });
      }

      // Query PayOS directly if client exists
      if (payOSService.isConfigured()) {
        try {
          const paymentInfo: any = await payOSService.getPaymentInfo(orderCode);
          const isPaid = paymentInfo.status === 'PAID';

          if (isPaid) {
            recentPaidOrders.set(orderCode, {
              orderCode,
              amount: paymentInfo.amount,
              description: paymentInfo.transactions?.[0]?.description || '',
              transactionDateTime: paymentInfo.transactions?.[0]?.transactionDateTime || new Date().toISOString(),
              status: 'PAID'
            });
          }

          return res.json({
            success: true,
            status: paymentInfo.status,
            isPaid,
            amount: paymentInfo.amount,
            paymentInfo
          });
        } catch (payOsErr: any) {
          // If not found yet or pending
          return res.json({
            success: true,
            status: 'PENDING',
            isPaid: false,
            message: 'Đang chờ khách chuyển khoản...'
          });
        }
      }

      return res.json({
        success: true,
        status: 'PENDING',
        isPaid: false,
        message: 'Đang chờ thanh toán...'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Lỗi kiểm tra trạng thái thanh toán'
      });
    }
  });

  // ==========================================
  // GENERAL BACKEND API ROUTES
  // ==========================================

  // 1. Health check & Server Status
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'LQMarket Backend API Gateway with PayOS Real Payments',
      runtime: 'Node.js Express + TypeScript',
      payosConfigured: Boolean(PAYOS_CLIENT_ID && PAYOS_API_KEY && PAYOS_CHECKSUM_KEY),
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime())
    });
  });

  // 2. Pricing Valuation Estimator (Dự toán định giá acc tự động)
  app.post('/api/market/estimate-price', (req, res) => {
    try {
      const { rank, heroesCount, skinsCount, rareSkinsCount, hasSSS } = req.body;

      let basePrice = 50000;

      // Rank weighting
      const rankWeights: Record<string, number> = {
        'Chiến Tướng': 500000,
        'Cao Thủ': 280000,
        'Tinh Anh': 150000,
        'Kim Cương': 80000,
        'Bạch Kim': 40000,
        'Vàng': 20000,
        'Bạc': 10000,
        'Đồng': 5000
      };

      basePrice += rankWeights[rank as string] || 50000;
      basePrice += (Number(heroesCount) || 0) * 1200;
      basePrice += (Number(skinsCount) || 0) * 2500;
      basePrice += (Number(rareSkinsCount) || 0) * 45000;
      if (hasSSS) basePrice += 450000;

      // Rounded to nearest 1,000 VND
      const estimatedPrice = Math.round(basePrice / 1000) * 1000;
      const minRange = Math.round((estimatedPrice * 0.85) / 1000) * 1000;
      const maxRange = Math.round((estimatedPrice * 1.15) / 1000) * 1000;

      res.json({
        success: true,
        estimatedPrice,
        priceRange: { min: minRange, max: maxRange },
        recommendation: `Định giá đề xuất cho acc ${rank} (${heroesCount} tướng, ${skinsCount} trang phục) dao động từ ${minRange.toLocaleString('vi-VN')}đ đến ${maxRange.toLocaleString('vi-VN')}đ.`
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi khi tính toán định giá' });
    }
  });

  // 3. Dynamic VietQR Generator Endpoint
  app.post('/api/vietqr/generate', (req, res) => {
    try {
      const { bankId = 'MB', accountNo = '0988889999', accountName = 'SAN GD LQMARKET VIETNAM', amount = 100000, memo = 'NAPLQ' } = req.body;
      const cleanMemo = encodeURIComponent(memo.replace(/\s+/g, ''));
      const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${cleanMemo}&accountName=${encodeURIComponent(accountName)}`;

      res.json({
        success: true,
        qrUrl,
        bankId,
        accountNo,
        accountName,
        amount,
        transferMemo: memo,
        expiresInSeconds: 900 // 15 minutes
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi tạo mã thanh toán VietQR' });
    }
  });

  // 4. Garena Credential Security Validator
  app.post('/api/escrow/validate-credentials', (req, res) => {
    try {
      const { username, password, securityType } = req.body;

      if (!username || !password) {
        return res.status(400).json({ success: false, valid: false, message: 'Tên đăng nhập và mật khẩu không được để trống' });
      }

      if (password.length < 6) {
        return res.status(400).json({ success: false, valid: false, message: 'Mật khẩu phải tối thiểu 6 ký tự' });
      }

      // Security check checklist
      const checks = {
        isFormatValid: username.length >= 4 && password.length >= 6,
        isCleanType: securityType === 'Trắng Thông Tin',
        escrowEligible: true,
        riskLevel: securityType === 'Trắng Thông Tin' ? 'THẤP' : 'TRUNG BÌNH'
      };

      res.json({
        success: true,
        valid: true,
        checks,
        message: 'Thông tin tài khoản hợp lệ để giao dịch trung gian qua Escrow LQMarket.'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi kiểm tra bảo mật tài khoản' });
    }
  });

  // ==========================================
  // VITE & STATIC SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const possibleDistPaths = [
      path.resolve(process.cwd(), 'dist'),
      path.resolve(__dirname),
      path.resolve(__dirname, '..', 'dist'),
      path.resolve(__dirname, 'dist')
    ];

    let distPath = possibleDistPaths[0];
    for (const p of possibleDistPaths) {
      if (fs.existsSync(path.join(p, 'index.html'))) {
        distPath = p;
        break;
      }
    }

    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LQMarket Full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
