import { Router, Request, Response } from 'express';
import { Account, IAccount } from '../models/Account';
import { User } from '../models/User';
import { Order } from '../models/Order';
import { Setting } from '../models/Setting';
import { Notification } from '../models/Notification';
import { getSellerStats } from '../services/sellerService';
import {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  AuthenticatedRequest
} from '../middleware/auth';

const router = Router();

// GET /api/accounts (and /api/products)
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      search,
      rank,
      minPrice,
      maxPrice,
      minHeroes,
      minSkins,
      server,
      rareSkinType,
      securityType,
      badge,
      status,
      sellerId,
      sortBy = 'newest',
      page = '1',
      limit = '100'
    } = req.query;

    const conditions: any[] = [];
    const currentUserId = req.user?.userId;
    const isUserAdmin = req.user?.role === 'admin';

    if (sellerId) {
      conditions.push({ sellerId });
      if (status) {
        conditions.push({ status });
      }
    } else if (status) {
      conditions.push({ status });
    } else if (isUserAdmin) {
      // Admin sees all accounts by default if no status specified
    } else if (currentUserId) {
      // Logged-in user: show public accounts PLUS their own pending/rejected accounts
      conditions.push({
        $or: [
          { status: { $in: ['approved', 'sold'] } },
          { sellerId: currentUserId }
        ]
      });
    } else {
      conditions.push({ status: { $in: ['approved', 'sold'] } });
    }

    if (search) {
      const searchRegex = new RegExp(String(search).trim(), 'i');
      conditions.push({
        $or: [
          { title: searchRegex },
          { code: searchRegex },
          { description: searchRegex },
          { 'rareSkins.name': searchRegex },
          { notableHeroes: searchRegex }
        ]
      });
    }

    if (rank && rank !== 'all') {
      conditions.push({ rank });
    }

    if (minPrice || maxPrice) {
      const priceFilter: any = {};
      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);
      conditions.push({ price: priceFilter });
    }

    if (minHeroes && Number(minHeroes) > 0) {
      conditions.push({ heroesCount: { $gte: Number(minHeroes) } });
    }

    if (minSkins && Number(minSkins) > 0) {
      conditions.push({ skinsCount: { $gte: Number(minSkins) } });
    }

    if (server && server !== 'all') {
      conditions.push({ server });
    }

    if (badge && badge !== 'all') {
      conditions.push({ badgeTag: badge });
    }

    if (securityType && securityType !== 'all') {
      conditions.push({ 'credentials.securityType': securityType });
    }

    if (rareSkinType && rareSkinType !== 'all') {
      conditions.push({ 'rareSkins.tier': rareSkinType });
    }

    const filterQuery: any = conditions.length > 1 ? { $and: conditions } : conditions.length === 1 ? conditions[0] : {};

    // Sorting
    let sortObj: any = { createdAt: -1 };
    if (sortBy === 'price_asc') sortObj = { price: 1 };
    else if (sortBy === 'price_desc') sortObj = { price: -1 };
    else if (sortBy === 'most_skins') sortObj = { skinsCount: -1 };
    else if (sortBy === 'most_heroes') sortObj = { heroesCount: -1 };
    else if (sortBy === 'views') sortObj = { views: -1 };
    else if (sortBy === 'newest') sortObj = { createdAt: -1 };

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(200, Math.max(1, Number(limit) || 100));
    const skip = (pageNum - 1) * limitNum;

    const [accounts, total] = await Promise.all([
      Account.find(filterQuery)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Account.countDocuments(filterQuery)
    ]);

    // Sanitize credentials for public queries
    const sanitized = accounts.map((acc: any) => {
      // Hide password unless current user is the seller or admin
      const isOwner = currentUserId && acc.sellerId === currentUserId;
      if (!isOwner && !isUserAdmin) {
        return {
          ...acc,
          credentials: {
            ...acc.credentials,
            password: '••••••••',
            secretNotes: ''
          }
        };
      }
      return acc;
    });

    return res.json({
      success: true,
      data: sanitized,
      accounts: sanitized,
      products: sanitized,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error: any) {
    console.error('Get accounts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách tài khoản.',
      data: [],
      accounts: [],
      products: []
    });
  }
});

// GET /api/accounts/public-stats (Public stats from Database)
router.get('/public-stats', async (req: Request, res: Response) => {
  try {
    const [
      totalSuccessfulOrders,
      totalSoldAccounts,
      totalAvailableAccounts,
      autoApproveSetting
    ] = await Promise.all([
      Order.countDocuments({ status: 'completed' }),
      Account.countDocuments({ status: 'sold' }),
      Account.countDocuments({ status: 'approved' }),
      Setting.findOne({ key: 'auto_approve_accounts' })
    ]);

    const totalCompletedTransactions = Math.max(totalSuccessfulOrders, totalSoldAccounts, 0);

    return res.json({
      success: true,
      totalCompletedTransactions,
      totalAvailableAccounts,
      isAutoApprove: autoApproveSetting ? Boolean(autoApproveSetting.value) : false
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tải số liệu thống kê.',
      totalCompletedTransactions: 0,
      totalAvailableAccounts: 0,
      isAutoApprove: false
    });
  }
});

// GET /api/accounts/seller/:sellerId (Public Seller Profile endpoint)
router.get('/seller/:sellerId', async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.params;
    const sellerData = await getSellerStats(sellerId);
    if (!sellerData) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người bán' });
    }
    return res.json({
      success: true,
      seller: sellerData,
      user: sellerData,
      reviews: sellerData.reviews,
      accounts: sellerData.accounts,
      stats: {
        totalSales: sellerData.totalSold,
        rating: sellerData.rating,
        reviewsCount: sellerData.reviewsCount,
        activeListings: sellerData.activeListings,
        totalListings: sellerData.totalListings
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải thông tin người bán' });
  }
});

// GET /api/accounts/seller/:sellerId/stats
router.get('/seller/:sellerId/stats', async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.params;
    const sellerData = await getSellerStats(sellerId);
    if (!sellerData) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người bán' });
    }
    return res.json({
      success: true,
      stats: {
        totalSales: sellerData.totalSold,
        rating: sellerData.rating,
        reviewsCount: sellerData.reviewsCount,
        activeListings: sellerData.activeListings,
        totalListings: sellerData.totalListings
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải thống kê người bán' });
  }
});

// GET /api/accounts/seller/:sellerId/reviews
router.get('/seller/:sellerId/reviews', async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.params;
    const sellerData = await getSellerStats(sellerId);
    if (!sellerData) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người bán' });
    }
    return res.json({
      success: true,
      reviews: sellerData.reviews,
      count: sellerData.reviewsCount,
      rating: sellerData.rating,
      averageRating: sellerData.averageRating
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải đánh giá người bán' });
  }
});

// GET /api/accounts/:id
router.get('/:id', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const account = await Account.findOne({
      $or: [{ id }, { code: id }]
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản.'
      });
    }

    // Increment views
    Account.updateOne({ _id: account._id }, { $inc: { views: 1 } }).exec();

    const currentUserId = req.user?.userId;
    const isUserAdmin = req.user?.role === 'admin';
    const isOwner = currentUserId && account.sellerId === currentUserId;

    const result: any = account.toJSON();
    if (!isOwner && !isUserAdmin) {
      result.credentials = {
        ...result.credentials,
        password: '••••••••',
        secretNotes: ''
      };
    }

    // Synchronize seller stats in real time directly from MongoDB
    try {
      const sellerStats = await getSellerStats(account.sellerId || account.sellerName);
      if (sellerStats) {
        result.sellerCompletedSales = sellerStats.totalSold;
        result.sellerRating = sellerStats.rating;
        result.sellerTier = sellerStats.sellerTier;
        result.sellerVerified = sellerStats.isVerifiedSeller;
        result.sellerReviewsCount = sellerStats.reviewsCount;
      }
    } catch (sErr) {
      console.warn('Sync seller stats in account get warning:', sErr);
    }

    return res.json({
      success: true,
      data: result,
      account: result,
      product: result
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin tài khoản.'
    });
  }
});

// POST /api/accounts (Create listing)
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userPayload = req.user;
    if (!userPayload) {
      return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để đăng bán.' });
    }

    const seller = await User.findOne({ id: userPayload.userId });
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản người bán.' });
    }

    const {
      title,
      price,
      originalPrice,
      rank,
      level = 30,
      heroesCount = 0,
      skinsCount = 0,
      runePages = '90/90 Full Ngọc III',
      server = 'Việt Nam',
      rareSkins = [],
      notableHeroes = [],
      badgeTag,
      images = [],
      videoUrl,
      description = '',
      credentials
    } = req.body;

    if (!title || !price || !rank || !credentials?.username || !credentials?.password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ tiêu đề, giá tiền, rank và thông tin đăng nhập tài khoản.'
      });
    }

    const accountId = `acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const randomCodeNum = Math.floor(10000 + Math.random() * 90000);
    const code = `LQ${randomCodeNum}`;

    // Check auto-approve setting from Database (Admin config)
    const autoApproveSetting = await Setting.findOne({ key: 'auto_approve_accounts' });
    const isAutoApprove = autoApproveSetting ? Boolean(autoApproveSetting.value) : false;
    const initialStatus = (seller.role === 'admin' || isAutoApprove) ? 'approved' : 'pending';

    const newAccount = new Account({
      id: accountId,
      code,
      title: title.trim(),
      price: Math.max(0, Number(price)),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      rank,
      level: Number(level) || 30,
      heroesCount: Number(heroesCount) || 0,
      skinsCount: Number(skinsCount) || 0,
      runePages,
      server,
      rareSkins,
      notableHeroes,
      badgeTag,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'],
      videoUrl,
      description,
      sellerId: seller.id,
      sellerName: seller.name,
      sellerAvatar: seller.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${seller.username}`,
      sellerRating: seller.rating || 5.0,
      sellerCompletedSales: seller.completedSales || 0,
      sellerResponseTime: '< 15 phút',
      sellerVerified: seller.isVerifiedSeller || false,
      status: initialStatus,
      credentials: {
        username: credentials.username.trim(),
        password: credentials.password.trim(),
        securityType: credentials.securityType || 'Trắng Thông Tin',
        secretNotes: credentials.secretNotes || ''
      },
      createdAt: new Date().toISOString(),
      views: 1,
      likes: 0,
      isFeatured: Boolean(req.body.isFeatured)
    });

    await newAccount.save();

    // Create Notification for seller
    try {
      const notif = new Notification({
        id: `notif_acc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: seller.id,
        type: 'account',
        title: initialStatus === 'approved' ? 'Tài khoản đã được đăng bán công khai' : 'Tài khoản đang chờ duyệt',
        message: initialStatus === 'approved'
          ? `Tài khoản "${newAccount.title}" (#${newAccount.code}) đã được phê duyệt và hiển thị công khai trên sàn LQMarket.`
          : `Tài khoản "${newAccount.title}" (#${newAccount.code}) đã được gửi lên hệ thống và đang chờ Admin duyệt.`,
        read: false,
        createdAt: new Date().toISOString()
      });
      await notif.save();
    } catch (notifErr) {
      console.warn('Account create notification notice:', notifErr);
    }

    return res.status(201).json({
      success: true,
      message: initialStatus === 'approved' ? 'Đăng bán và phê duyệt tài khoản thành công!' : 'Đăng bán thành công! Tài khoản đang chờ duyệt.',
      data: newAccount.toJSON(),
      account: newAccount.toJSON(),
      product: newAccount.toJSON()
    });
  } catch (error: any) {
    console.error('Create account error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi đăng bán tài khoản.',
      error: error.message
    });
  }
});

// PUT /api/accounts/:id
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.userId;
    const isUserAdmin = req.user?.role === 'admin';

    const account = await Account.findOne({ id });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
    }

    if (account.sellerId !== currentUserId && !isUserAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa tài khoản này.'
      });
    }

    const allowedUpdates = [
      'title',
      'price',
      'originalPrice',
      'rank',
      'level',
      'heroesCount',
      'skinsCount',
      'runePages',
      'server',
      'rareSkins',
      'notableHeroes',
      'badgeTag',
      'images',
      'videoUrl',
      'description',
      'credentials',
      'status',
      'isFeatured'
    ];

    const prevStatus = account.status;

    allowedUpdates.forEach(key => {
      if (req.body[key] !== undefined) {
        (account as any)[key] = req.body[key];
      }
    });

    await account.save();

    // Create Notification if status changed
    if (req.body.status && req.body.status !== prevStatus && account.sellerId) {
      try {
        if (req.body.status === 'approved') {
          const notif = new Notification({
            id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            userId: account.sellerId,
            type: 'account',
            title: 'Tài khoản đã được phê duyệt!',
            message: `Tài khoản "${account.title}" (#${account.code}) đã được Admin duyệt và hiển thị công khai trên sàn LQMarket.`,
            read: false,
            createdAt: new Date().toISOString()
          });
          await notif.save();
        } else if (req.body.status === 'rejected') {
          const notif = new Notification({
            id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            userId: account.sellerId,
            type: 'account',
            title: 'Tài khoản bị từ chối duyệt',
            message: `Tài khoản "${account.title}" (#${account.code}) bị từ chối duyệt. Lý do: ${req.body.rejectionReason || 'Thông tin chưa hợp lệ'}.`,
            read: false,
            createdAt: new Date().toISOString()
          });
          await notif.save();
        }
      } catch (e) {
        console.warn('Account status notification notice:', e);
      }
    }

    return res.json({
      success: true,
      message: 'Cập nhật tài khoản thành công!',
      data: account.toJSON(),
      account: account.toJSON(),
      product: account.toJSON()
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi cập nhật tài khoản.' });
  }
});

// DELETE /api/accounts/:id
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.userId;
    const isUserAdmin = req.user?.role === 'admin';

    const account = await Account.findOne({ id });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
    }

    if (account.sellerId !== currentUserId && !isUserAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa tài khoản này.'
      });
    }

    await Account.deleteOne({ id });

    return res.json({
      success: true,
      message: 'Đã xóa tài khoản thành công.'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi xóa tài khoản.' });
  }
});

// POST /api/accounts/:id/like
router.post('/:id/like', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const account = await Account.findOneAndUpdate(
      { id },
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
    }

    return res.json({
      success: true,
      likes: account.likes
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi thích tài khoản.' });
  }
});

export default router;
