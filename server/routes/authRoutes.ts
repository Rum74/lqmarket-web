import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
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

export default router;
