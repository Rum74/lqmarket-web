import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { Account } from '../models/Account';
import { Order } from '../models/Order';
import { Review } from '../models/Review';
import { Notification } from '../models/Notification';
import { authenticateToken, generateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, username, email, usernameOrEmail, accountInput, password, phone, role = 'buyer' } = req.body;

    const rawName = (name || '').trim();
    const rawAccount = (username || email || usernameOrEmail || accountInput || '').trim();
    const rawPassword = (password || '').trim();

    if (!rawName || !rawAccount || !rawPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ họ tên, tên tài khoản/email và mật khẩu.'
      });
    }

    if (rawPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu bảo mật phải có ít nhất 6 ký tự.'
      });
    }

    const cleanInput = rawAccount.toLowerCase();
    const cleanEmail = cleanInput.includes('@') ? cleanInput : `${cleanInput.replace(/[^a-z0-9_]/g, '')}@cholienquan.com`;
    const cleanUsername = cleanInput.includes('@')
      ? cleanInput.split('@')[0].replace(/[^a-z0-9_]/g, '')
      : cleanInput.replace(/[^a-z0-9_]/g, '');

    // Check if user already exists in MongoDB
    const existingUser = await User.findOne({
      $or: [
        { email: cleanEmail },
        { username: cleanUsername },
        { username: cleanInput },
        ...(phone ? [{ phone: phone.trim() }] : [])
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email hoặc tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername || userId}`;

    const newUser = await User.create({
      id: userId,
      name: rawName,
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
      phone: (phone || '').trim(),
      avatar,
      role: role === 'seller' ? 'seller' : 'buyer',
      balance: 0,
      pendingBalance: 0,
      rating: 5.0,
      completedSales: 0,
      isVerifiedSeller: role === 'seller',
      sellerTier: role === 'seller' ? 'BASIC' : 'FREE',
      wishlistIds: [],
      status: 'active'
    });

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role
    });

    // Create welcome Notification
    try {
      const welcomeNotif = new Notification({
        id: `notif_reg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: newUser.id,
        type: 'system',
        title: 'Chào mừng thành viên mới!',
        message: `Chúc mừng bạn đã tạo tài khoản thành công trên Sàn giao dịch Liên Quân LQMarket. Hãy bảo vệ mật khẩu và nạp tiền để bắt đầu mua bán hoặc xé túi mù!`,
        read: false,
        createdAt: new Date().toISOString()
      });
      await welcomeNotif.save();
    } catch (notifErr) {
      console.warn('Welcome notification notice:', notifErr);
    }

    const userResponse = typeof newUser.toJSON === 'function' ? newUser.toJSON() : { ...newUser };
    delete userResponse.password;

    console.log(`✅ [Auth] New user registered successfully in MongoDB: ${newUser.username} (${newUser.email})`);

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công!',
      token,
      user: userResponse
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi đăng ký tài khoản. Vui lòng thử lại.',
      error: error.message
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { identifier, usernameOrEmail, email, username, accountInput, password } = req.body;
    const loginKey = (identifier || usernameOrEmail || email || username || accountInput || '').toLowerCase().trim();
    const rawPassword = (password || '').trim();

    if (!loginKey || !rawPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tên đăng nhập/email và mật khẩu.'
      });
    }

    const emailAlternative = loginKey.includes('@') ? loginKey : `${loginKey.replace(/[^a-z0-9_]/g, '')}@cholienquan.com`;
    const usernameAlternative = loginKey.includes('@') ? loginKey.split('@')[0] : loginKey;

    const user = await User.findOne({
      $or: [
        { email: loginKey },
        { username: loginKey },
        { email: emailAlternative },
        { username: usernameAlternative },
        { phone: loginKey },
        { id: loginKey }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản hoặc mật khẩu không chính xác.'
      });
    }

    if (user.status === 'banned') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin để được hỗ trợ.'
      });
    }

    // Verify password if stored
    if (user.password) {
      const isMatch = await bcrypt.compare(rawPassword, user.password).catch(() => false);
      if (!isMatch) {
        // Fallback check for plain-text password / seeded admin
        if (rawPassword !== user.password) {
          return res.status(401).json({
            success: false,
            message: 'Tài khoản hoặc mật khẩu không chính xác.'
          });
        }
      }
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Create login Notification
    try {
      const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ngày ' + new Date().toLocaleDateString('vi-VN');
      const loginNotif = new Notification({
        id: `notif_login_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: user.id,
        type: 'system',
        title: 'Đăng nhập thành công',
        message: `Chào mừng ${user.name || user.username}! Bạn đã đăng nhập vào hệ thống lúc ${nowStr}.`,
        read: false,
        createdAt: new Date().toISOString()
      });
      await loginNotif.save();
    } catch (notifErr) {
      console.warn('Login notification notice:', notifErr);
    }

    const userResponse = typeof user.toJSON === 'function' ? user.toJSON() : { ...user };
    delete userResponse.password;

    console.log(`🔓 [Auth] User logged in successfully: ${user.username} (${user.role})`);

    return res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      token,
      user: userResponse
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi đăng nhập. Vui lòng thử lại.',
      error: error.message
    });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin tài khoản.'
      });
    }

    return res.json({
      success: true,
      user: user.toJSON()
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tải thông tin người dùng.'
    });
  }
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  return res.json({
    success: true,
    message: 'Đã đăng xuất an toàn.'
  });
});

// POST /api/auth/refresh
router.post('/refresh', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findOne({ id: req.user?.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    const newToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return res.json({
      success: true,
      token: newToken,
      user: user.toJSON()
    });
  } catch {
    return res.status(401).json({ success: false, message: 'Không thể làm mới phiên đăng nhập' });
  }
});

// PUT /api/auth/profile (Update Profile)
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { name, phone, avatar, bio, bankName, bankAccount, bankAccountName, password } = req.body;

    const updateFields: any = {
      ...(name ? { name: name.trim() } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(avatar ? { avatar } : {}),
      ...(bio !== undefined ? { bio } : {}),
      ...(bankName !== undefined ? { bankName } : {}),
      ...(bankAccount !== undefined ? { bankAccount } : {}),
      ...(bankAccountName !== undefined ? { bankAccountName } : {}),
      updatedAt: new Date().toISOString()
    };

    if (password && typeof password === 'string' && password.trim().length >= 6) {
      updateFields.password = await bcrypt.hash(password.trim(), 10);
    }

    const updated = await User.findOneAndUpdate(
      { id: userId },
      { $set: updateFields },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    return res.json({
      success: true,
      message: 'Cập nhật thông tin thành công!',
      user: updated.toJSON()
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật hồ sơ' });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { newPassword, currentPassword } = req.body;

    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    if (currentPassword && user.password) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác' });
      }
    }

    user.password = await bcrypt.hash(newPassword.trim(), 10);
    user.updatedAt = new Date().toISOString();
    await user.save();

    return res.json({
      success: true,
      message: 'Đổi mật khẩu tài khoản thành công!'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi đổi mật khẩu' });
  }
});

// GET /api/auth/seller/:sellerId (Public Seller Profile for all users & guests)
router.get('/seller/:sellerId', async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.params;
    let user = await User.findOne({
      $or: [{ id: sellerId }, { username: sellerId }]
    });

    const accountForSeller = await Account.findOne({
      $or: [{ sellerId }, { sellerName: sellerId }]
    });

    if (!user && !accountForSeller) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ người bán'
      });
    }

    const sellerName = user?.name || accountForSeller?.sellerName || 'Shop Acc Liên Quân';
    const sellerUsername = user?.username || (user?.email ? user.email.split('@')[0] : '') || sellerId;
    const sellerAvatar = user?.avatar || accountForSeller?.sellerAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${sellerId}`;
    const isVerified = user?.isVerifiedSeller ?? (accountForSeller?.sellerVerified ?? true);

    // Build comprehensive identifier sets to match all orders, reviews, and accounts
    const sellerIdSet = new Set<string>();
    if (sellerId) sellerIdSet.add(sellerId);
    if (user?.id) sellerIdSet.add(user.id);
    if (user?.username) sellerIdSet.add(user.username);
    if (accountForSeller?.sellerId) sellerIdSet.add(accountForSeller.sellerId);

    const sellerNames = new Set<string>();
    if (sellerName) sellerNames.add(sellerName);
    if (user?.name) sellerNames.add(user.name);
    if (accountForSeller?.sellerName) sellerNames.add(accountForSeller.sellerName);
    if (sellerId && isNaN(Number(sellerId))) sellerNames.add(sellerId);

    const sellerNameRegexes = Array.from(sellerNames).map(
      name => new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    );

    // Fetch all accounts belonging to this seller
    const sellerAccounts = await Account.find({
      $or: [
        { sellerId: { $in: Array.from(sellerIdSet) } },
        { sellerName: { $in: Array.from(sellerNames) } },
        ...sellerNameRegexes.map(rx => ({ sellerName: rx }))
      ]
    }).sort({ createdAt: -1 }).lean();

    const accountIds = sellerAccounts.map(a => a.id).filter(Boolean);
    const accountCodes = sellerAccounts.map(a => a.code).filter(Boolean);

    // Fetch all orders associated with this seller or any of their accounts
    const sellerOrders = await Order.find({
      $or: [
        { sellerId: { $in: Array.from(sellerIdSet) } },
        { sellerName: { $in: Array.from(sellerNames) } },
        ...sellerNameRegexes.map(rx => ({ sellerName: rx })),
        { accountId: { $in: accountIds } },
        { accountCode: { $in: accountCodes } }
      ]
    }).sort({ completedAt: -1, createdAt: -1 }).lean();

    // Filter completed or delivered sales
    const completedOrders = sellerOrders.filter(
      o => o.status === 'completed' || o.status === 'account_delivered' || o.status === 'escrow_hold'
    );
    const allOrderIds = sellerOrders.map(o => o.id).filter(Boolean);

    // Fetch all customer reviews from the Review collection
    const dbReviews = await Review.find({
      $or: [
        { sellerId: { $in: Array.from(sellerIdSet) } },
        { sellerName: { $in: Array.from(sellerNames) } },
        ...sellerNameRegexes.map(rx => ({ sellerName: rx })),
        { accountId: { $in: accountIds } },
        { accountCode: { $in: accountCodes } },
        { orderId: { $in: allOrderIds } }
      ]
    }).sort({ createdAt: -1 }).lean();

    // Format & collect customer reviews
    const formattedReviews: any[] = [];
    const seenReviewIds = new Set<string>();

    for (const rev of dbReviews) {
      const reviewKey = rev.id || rev.orderId || `${rev.buyerId}_${rev.accountId}`;
      if (!seenReviewIds.has(reviewKey)) {
        seenReviewIds.add(reviewKey);
        formattedReviews.push({
          id: rev.id,
          buyerName: rev.buyerName || 'Khách Hàng',
          buyerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
          rating: rev.rating || 5,
          comment: rev.comment || 'Tài khoản đúng mô tả, giao dịch nhanh chóng và an toàn.',
          date: rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : '29/08/2026',
          accountCode: rev.accountCode || '',
          accountTitle: ''
        });
      }
    }

    for (const ord of sellerOrders) {
      if (ord.review?.rating || ord.review?.comment) {
        const reviewKey = ord.id;
        if (!seenReviewIds.has(reviewKey)) {
          seenReviewIds.add(reviewKey);
          formattedReviews.push({
            id: ord.id,
            buyerName: ord.buyerName || 'Người Mua',
            buyerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
            rating: ord.review?.rating || 5,
            comment: ord.review?.comment || 'Giao dịch thành công, nhận acc ngay tức thì.',
            date: ord.completedAt
              ? new Date(ord.completedAt).toLocaleDateString('vi-VN')
              : ord.createdAt
              ? new Date(ord.createdAt).toLocaleDateString('vi-VN')
              : '29/08/2026',
            accountCode: ord.accountCode || '',
            accountTitle: ord.accountTitle || ''
          });
        }
      }
    }

    // If there are sold orders without custom review, provide verified completion feedback
    if (formattedReviews.length === 0 && completedOrders.length > 0) {
      for (const ord of completedOrders.slice(0, 5)) {
        formattedReviews.push({
          id: `rev_${ord.id}`,
          buyerName: ord.buyerName || 'Người Mua Uy Tín',
          buyerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
          rating: 5,
          comment: 'Tài khoản đúng thông tin 100%, bảo mật tốt, giao dịch qua Escrow rất yên tâm.',
          date: ord.completedAt ? new Date(ord.completedAt).toLocaleDateString('vi-VN') : new Date(ord.createdAt).toLocaleDateString('vi-VN'),
          accountCode: ord.accountCode || '',
          accountTitle: ord.accountTitle || ''
        });
      }
    }

    // Accurate calculation of total sales and average rating
    const totalSales = Math.max(
      completedOrders.length,
      sellerOrders.length,
      user?.completedSales || 0,
      accountForSeller?.sellerCompletedSales || 0,
      sellerAccounts.filter(a => a.status === 'sold').length
    );

    const avgRating = formattedReviews.length > 0 
      ? (formattedReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / formattedReviews.length).toFixed(1)
      : (user?.rating || 5.0).toFixed(1);

    let tier = user?.sellerTier || 'BASIC SELLER';
    if (isVerified || totalSales >= 10 || user?.role === 'admin') {
      tier = 'VIP SELLER';
    } else if (totalSales >= 3) {
      tier = 'PRO SELLER';
    }

    const publicProfile = {
      id: user?.id || sellerId,
      name: sellerName,
      username: sellerUsername,
      avatar: sellerAvatar,
      role: user?.role || 'seller',
      isVerifiedSeller: isVerified,
      sellerTier: tier,
      rating: parseFloat(avgRating),
      completedSales: totalSales,
      bio: user?.bio || 'Chuyên cung cấp tài khoản Liên Quân chất lượng cao, bảo hành trọn đời, hỗ trợ 24/7.',
      createdAt: (user as any)?.createdAt || accountForSeller?.createdAt || '2025-01-01T00:00:00.000Z'
    };

    return res.json({
      success: true,
      seller: {
        ...publicProfile,
        completedSales: totalSales,
        rating: parseFloat(avgRating)
      },
      user: {
        ...publicProfile,
        completedSales: totalSales,
        rating: parseFloat(avgRating)
      },
      reviews: formattedReviews,
      accounts: sellerAccounts,
      stats: {
        totalSales,
        rating: parseFloat(avgRating),
        reviewsCount: formattedReviews.length,
        activeListings: sellerAccounts.filter(a => a.status === 'approved').length
      }
    });
  } catch (error: any) {
    console.error('Error fetching seller profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tải hồ sơ người bán'
    });
  }
});

// GET /api/auth/users/:id/public
router.get('/users/:id/public', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({
      $or: [{ id }, { username: id }]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    const publicProfile = {
      id: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      role: user.role,
      isVerifiedSeller: Boolean(user.isVerifiedSeller),
      sellerTier: user.sellerTier || 'STANDARD',
      rating: user.rating || 5.0,
      completedSales: user.completedSales || 0,
      bio: user.bio || '',
      createdAt: (user as any).createdAt || user.createdAt
    };

    return res.json({ success: true, user: publicProfile, seller: publicProfile });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tải hồ sơ' });
  }
});

export default router;
