import { Router, Request, Response } from 'express';
import { Account, IAccount } from '../models/Account';
import { User } from '../models/User';
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

    const filterQuery: any = {};

    // Only show approved accounts to public users, or all if admin/seller querying own
    const currentUserId = req.user?.userId;
    const isUserAdmin = req.user?.role === 'admin';

    if (sellerId) {
      filterQuery.sellerId = sellerId;
      if (status) {
        filterQuery.status = status;
      }
    } else if (status && isUserAdmin) {
      filterQuery.status = status;
    } else {
      filterQuery.status = { $in: ['approved', 'sold'] };
    }

    if (search) {
      const searchRegex = new RegExp(String(search).trim(), 'i');
      filterQuery.$or = [
        { title: searchRegex },
        { code: searchRegex },
        { description: searchRegex },
        { 'rareSkins.name': searchRegex },
        { notableHeroes: searchRegex }
      ];
    }

    if (rank && rank !== 'all') {
      filterQuery.rank = rank;
    }

    if (minPrice || maxPrice) {
      filterQuery.price = {};
      if (minPrice) filterQuery.price.$gte = Number(minPrice);
      if (maxPrice) filterQuery.price.$lte = Number(maxPrice);
    }

    if (minHeroes && Number(minHeroes) > 0) {
      filterQuery.heroesCount = { $gte: Number(minHeroes) };
    }

    if (minSkins && Number(minSkins) > 0) {
      filterQuery.skinsCount = { $gte: Number(minSkins) };
    }

    if (server && server !== 'all') {
      filterQuery.server = server;
    }

    if (badge && badge !== 'all') {
      filterQuery.badgeTag = badge;
    }

    if (securityType && securityType !== 'all') {
      filterQuery['credentials.securityType'] = securityType;
    }

    if (rareSkinType && rareSkinType !== 'all') {
      filterQuery['rareSkins.tier'] = rareSkinType;
    }

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

    const result = account.toJSON();
    if (!isOwner && !isUserAdmin) {
      result.credentials = {
        ...result.credentials,
        password: '••••••••',
        secretNotes: ''
      };
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
router.post('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sellerId = req.user?.userId || req.body.sellerId;
    let seller = sellerId ? await User.findOne({ $or: [{ id: sellerId }, { email: sellerId }] }) : null;

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
      credentials,
      sellerName,
      sellerAvatar
    } = req.body;

    if (!title || !price || !rank || !credentials?.username || !credentials?.password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ tiêu đề, giá tiền, rank và thông tin đăng nhập tài khoản.'
      });
    }

    const sellerNameFinal = seller ? seller.name : (sellerName || 'Người bán');
    const sellerIdFinal = seller ? seller.id : (sellerId || `user_${Date.now()}`);
    const sellerAvatarFinal = seller?.avatar || sellerAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${sellerIdFinal}`;

    const accountId = `acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const randomCodeNum = Math.floor(10000 + Math.random() * 90000);
    const code = `LQ${randomCodeNum}`;

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
      sellerId: sellerIdFinal,
      sellerName: sellerNameFinal,
      sellerAvatar: sellerAvatarFinal,
      sellerRating: seller?.rating || 5.0,
      sellerCompletedSales: seller?.completedSales || 0,
      sellerResponseTime: '< 15 phút',
      sellerVerified: seller?.isVerifiedSeller || false,
      status: 'approved', // Auto-approved for verified or standard listings
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

    return res.status(201).json({
      success: true,
      message: 'Đăng bán tài khoản thành công!',
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

    allowedUpdates.forEach(key => {
      if (req.body[key] !== undefined) {
        (account as any)[key] = req.body[key];
      }
    });

    await account.save();

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
