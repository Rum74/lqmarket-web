import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { authenticateToken, generateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, username, email, password, phone, role = 'buyer' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = (username || email.split('@')[0] || `user_${Date.now()}`)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_]/g, '');

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email hoặc tên đăng nhập này đã được sử dụng.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`;

    const newUser = new User({
      id: userId,
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
      phone: phone || '',
      avatar,
      role: role === 'seller' ? 'seller' : 'buyer',
      balance: 0,
      pendingBalance: 0,
      rating: 5.0,
      completedSales: 0,
      isVerifiedSeller: false,
      sellerTier: 'FREE',
      wishlistIds: [],
      status: 'active'
    });

    await newUser.save();

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role
    });

    const userResponse = newUser.toJSON();

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
    const { identifier, usernameOrEmail, email, password } = req.body;
    const loginKey = (identifier || usernameOrEmail || email || '').toLowerCase().trim();

    if (!loginKey || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tên đăng nhập/email và mật khẩu.'
      });
    }

    const user = await User.findOne({
      $or: [{ email: loginKey }, { username: loginKey }]
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
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        // Fallback check for initial dev/admin test accounts
        if (password !== user.password) {
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

    const userResponse = user.toJSON();

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
    const { name, phone, avatar, bio, bankName, bankAccount, bankAccountName } = req.body;

    const updated = await User.findOneAndUpdate(
      { id: userId },
      {
        $set: {
          ...(name ? { name: name.trim() } : {}),
          ...(phone !== undefined ? { phone } : {}),
          ...(avatar ? { avatar } : {}),
          ...(bio !== undefined ? { bio } : {}),
          ...(bankName !== undefined ? { bankName } : {}),
          ...(bankAccount !== undefined ? { bankAccount } : {}),
          ...(bankAccountName !== undefined ? { bankAccountName } : {}),
          updatedAt: new Date().toISOString()
        }
      },
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

export default router;
