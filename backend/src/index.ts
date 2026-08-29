import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB, getDBConnectionStatus } from './config/db';

// Modular Route Handlers
import authRoutes from './routes/authRoutes';
import accountRoutes from './routes/accountRoutes';
import orderRoutes from './routes/orderRoutes';
import walletRoutes from './routes/walletRoutes';
import paymentRoutes from './routes/paymentRoutes';
import mysteryBoxRoutes from './routes/mysteryBoxRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import favoriteRoutes from './routes/favoriteRoutes';
import chatRoutes from './routes/chatRoutes';
import notificationRoutes from './routes/notificationRoutes';
import adminRoutes from './routes/adminRoutes';
import uploadRoutes from './routes/uploadRoutes';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 5000;

  // CORS Configuration
  const allowedOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map(url => url.trim().replace(/\/$/, ''))
    .filter(Boolean);

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(origin) ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.includes('cholienquan.com')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
  }));
  app.options('*', cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Connect Database (MongoDB Atlas)
  await connectDB();

  // ==========================================
  // SYSTEM HEALTH & DIAGNOSTICS
  // ==========================================
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      message: 'LQMarket API is running',
      status: 'ok',
      service: 'LQMarket Standalone API Backend',
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
  app.use('/api/auth', authRoutes);
  app.use('/api/accounts', accountRoutes);
  app.use('/api/products', accountRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/wallet', walletRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/payos', paymentRoutes);
  app.use('/api/mystery-boxes', mysteryBoxRoutes);
  app.use('/api/mystery-box', mysteryBoxRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/favorites', favoriteRoutes);
  app.use('/api/conversations', chatRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/messages', chatRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/upload', uploadRoutes);

  // Global Webhook listeners
  app.all('/webhook', (req, res, next) => {
    req.url = '/webhook';
    paymentRoutes(req, res, next);
  });
  app.all('/api/webhook', (req, res, next) => {
    req.url = '/webhook';
    paymentRoutes(req, res, next);
  });

  // Valuation helper
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 LQMarket Standalone Backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
