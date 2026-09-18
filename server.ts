import 'dotenv/config';

// Force standard Vietnam Timezone (GMT+7) for all server dates
process.env.TZ = 'Asia/Ho_Chi_Minh';

import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { connectDB, getDBConnectionStatus } from './backend/src/config/db';
import { seedMemoryMarketData } from './backend/src/config/memoryStore';

// Modular Route Handlers
import authRoutes from './backend/src/routes/authRoutes';
import sellerRoutes from './backend/src/routes/sellerRoutes';
import accountRoutes from './backend/src/routes/accountRoutes';
import orderRoutes from './backend/src/routes/orderRoutes';
import walletRoutes from './backend/src/routes/walletRoutes';
import paymentRoutes from './backend/src/routes/paymentRoutes';
import mysteryBoxRoutes from './backend/src/routes/mysteryBoxRoutes';
import inventoryRoutes from './backend/src/routes/inventoryRoutes';
import favoriteRoutes from './backend/src/routes/favoriteRoutes';
import chatRoutes from './backend/src/routes/chatRoutes';
import notificationRoutes from './backend/src/routes/notificationRoutes';
import adminRoutes from './backend/src/routes/adminRoutes';
import uploadRoutes from './backend/src/routes/uploadRoutes';
import bootstrapRoutes from './backend/src/routes/bootstrapRoutes';
import couponRoutes from './backend/src/routes/couponRoutes';
import sellerVerificationRoutes from './backend/src/routes/sellerVerificationRoutes';
import disputeRoutes from './backend/src/routes/disputeRoutes';
import auditLogRoutes from './backend/src/routes/auditLogRoutes';
import priceAlertRoutes from './backend/src/routes/priceAlertRoutes';
import affiliateRoutes from './backend/src/routes/affiliateRoutes';
import { referralRouter } from './backend/src/routes/referralRoutes';

// Helper to resolve route modules across ESM and CJS imports
const getRouter = (routeMod: any) => {
  if (typeof routeMod === 'function') return routeMod;
  if (routeMod && typeof routeMod.default === 'function') return routeMod.default;
  if (routeMod && typeof routeMod.router === 'function') return routeMod.router;
  return routeMod;
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // CORS Configuration with CLIENT_URL support
  const allowedOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map(url => url.trim().replace(/\/$/, ''))
    .filter(Boolean);

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('cholienquan.com')) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback allow in dev/staging
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-User-Id',
      'X-User-Role',
      'x-user-id',
      'x-user-role',
      'Cache-Control',
      'Pragma'
    ],
    exposedHeaders: ['Authorization', 'X-User-Id', 'X-User-Role']
  }));
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-User-Id, X-User-Role, x-user-id, x-user-role, Cache-Control, Pragma');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });
  app.options('*', cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Connect Database (MongoDB Atlas) in background so server binds to port 3000 immediately
  connectDB().catch(err => {
    console.warn('Initial MongoDB connection notice:', err?.message || err);
  });
  seedMemoryMarketData().catch(err => {
    console.warn('Seed memory store notice:', err?.message || err);
  });

  // ==========================================
  // SYSTEM HEALTH & DIAGNOSTICS
  // ==========================================
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      message: 'LQMarket API is running',
      status: 'ok',
      service: 'LQMarket Full-Stack API Gateway',
      runtime: 'Node.js Express + TypeScript + MongoDB Atlas',
      database: getDBConnectionStatus() ? 'connected' : 'standby',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime())
    });
  });

  app.get('/api/health/db', (req, res) => {
    const isConnected = getDBConnectionStatus();
    res.json({
      success: true,
      database: isConnected ? 'connected' : 'disconnected',
      message: isConnected
        ? 'Kết nối MongoDB Atlas đang hoạt động bình thường.'
        : 'Chưa kết nối đến MongoDB Atlas. Vui lòng kiểm tra MONGODB_URI hoặc IP Access List trên MongoDB Atlas.'
    });
  });

  // ==========================================
  // MODULAR REST API ROUTES
  // ==========================================
  const resolvedAuthRoutes = getRouter(authRoutes);
  const resolvedAccountRoutes = getRouter(accountRoutes);
  const resolvedOrderRoutes = getRouter(orderRoutes);
  const resolvedWalletRoutes = getRouter(walletRoutes);
  const resolvedPaymentRoutes = getRouter(paymentRoutes);
  const resolvedMysteryBoxRoutes = getRouter(mysteryBoxRoutes);
  const resolvedInventoryRoutes = getRouter(inventoryRoutes);
  const resolvedFavoriteRoutes = getRouter(favoriteRoutes);
  const resolvedChatRoutes = getRouter(chatRoutes);
  const resolvedNotificationRoutes = getRouter(notificationRoutes);
  const resolvedAdminRoutes = getRouter(adminRoutes);
  const resolvedUploadRoutes = getRouter(uploadRoutes);
  const resolvedBootstrapRoutes = getRouter(bootstrapRoutes);
  const resolvedSellerRoutes = getRouter(sellerRoutes);
  const resolvedCouponRoutes = getRouter(couponRoutes);
  const resolvedSellerVerificationRoutes = getRouter(sellerVerificationRoutes);
  const resolvedDisputeRoutes = getRouter(disputeRoutes);
  const resolvedAuditLogRoutes = getRouter(auditLogRoutes);
  const resolvedPriceAlertRoutes = getRouter(priceAlertRoutes);
  const resolvedAffiliateRoutes = getRouter(affiliateRoutes);
  const resolvedReferralRoutes = getRouter(referralRouter);

  app.use('/api/auth', resolvedAuthRoutes);
  app.use('/api/accounts', resolvedAccountRoutes);
  app.use('/api/products', resolvedAccountRoutes); // Alias for frontend compatibility
  app.use('/api/orders', resolvedOrderRoutes);
  app.use('/api/wallet', resolvedWalletRoutes);
  app.use('/api/payments', resolvedPaymentRoutes);
  app.use('/api/payos', resolvedPaymentRoutes); // Alias for PayOS callbacks
  app.use('/api/mystery-boxes', resolvedMysteryBoxRoutes);
  app.use('/api/mystery-box', resolvedMysteryBoxRoutes); // Alias
  app.use('/api/inventory', resolvedInventoryRoutes);
  app.use('/api/favorites', resolvedFavoriteRoutes);
  app.use('/api/conversations', resolvedChatRoutes);
  app.use('/api/chat', resolvedChatRoutes); // Alias
  app.use('/api/messages', resolvedChatRoutes); // Alias
  app.use('/api/notifications', resolvedNotificationRoutes);
  app.use('/api/admin/audit-logs', resolvedAuditLogRoutes);
  app.use('/api/admin', resolvedAdminRoutes);
  app.use('/api/upload', resolvedUploadRoutes);
  app.use('/api/bootstrap', resolvedBootstrapRoutes);
  app.use('/api/sellers', resolvedSellerRoutes);
  app.use('/api/seller', resolvedSellerRoutes);
  app.use('/api/sync', resolvedBootstrapRoutes);
  app.use('/api/coupons', resolvedCouponRoutes);
  app.use('/api/seller-verifications', resolvedSellerVerificationRoutes);
  app.use('/api/disputes', resolvedDisputeRoutes);
  app.use('/api/price-alerts', resolvedPriceAlertRoutes);
  app.use('/api/affiliate', resolvedAffiliateRoutes);
  app.use('/api/referrals', resolvedReferralRoutes);
  app.use('/api/referral', resolvedReferralRoutes); // Alias

  // Global Webhook listeners (PayOS IPN)
  app.all('/webhook', (req, res, next) => {
    req.url = '/webhook';
    resolvedPaymentRoutes(req, res, next);
  });
  app.all('/api/webhook', (req, res, next) => {
    req.url = '/webhook';
    resolvedPaymentRoutes(req, res, next);
  });
  app.all('/confirm-webhook', (req, res, next) => {
    req.url = '/confirm-webhook';
    resolvedPaymentRoutes(req, res, next);
  });
  app.all('/api/confirm-webhook', (req, res, next) => {
    req.url = '/confirm-webhook';
    resolvedPaymentRoutes(req, res, next);
  });

  // Helper APIs for Valuation & Credential Validation
  app.post('/api/market/estimate-price', (req, res) => {
    try {
      const { rank, heroesCount, skinsCount, rareSkinsCount, hasSSS } = req.body;
      let basePrice = 50000;
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

      const estimatedPrice = Math.round(basePrice / 1000) * 1000;
      const minRange = Math.round((estimatedPrice * 0.85) / 1000) * 1000;
      const maxRange = Math.round((estimatedPrice * 1.15) / 1000) * 1000;

      return res.json({
        success: true,
        estimatedPrice,
        priceRange: { min: minRange, max: maxRange },
        recommendation: `Định giá đề xuất cho acc ${rank} (${heroesCount} tướng, ${skinsCount} trang phục) dao động từ ${minRange.toLocaleString('vi-VN')}đ đến ${maxRange.toLocaleString('vi-VN')}đ.`
      });
    } catch {
      return res.status(500).json({ success: false, message: 'Lỗi khi tính toán định giá' });
    }
  });

  app.post('/api/escrow/validate-credentials', (req, res) => {
    const { username, password, securityType } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, valid: false, message: 'Tên đăng nhập và mật khẩu không được để trống' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, valid: false, message: 'Mật khẩu phải tối thiểu 6 ký tự' });
    }
    return res.json({
      success: true,
      valid: true,
      checks: {
        isFormatValid: username.length >= 4 && password.length >= 6,
        isCleanType: securityType === 'Trắng Thông Tin',
        escrowEligible: true,
        riskLevel: securityType === 'Trắng Thông Tin' ? 'THẤP' : 'TRUNG BÌNH'
      },
      message: 'Thông tin tài khoản hợp lệ để giao dịch trung gian qua Escrow LQMarket.'
    });
  });

  // ==========================================
  // VITE & STATIC FILE SERVING
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
    console.log(`🚀 LQMarket Full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
