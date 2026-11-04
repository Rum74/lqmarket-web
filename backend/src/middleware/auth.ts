import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Setting } from '../models/Setting';

const JWT_SECRET = process.env.JWT_SECRET || 'lqmarket_super_secure_jwt_secret_key_2026_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  username?: string;
  name?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export function generateToken(payload: AuthUserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
}

export function verifyToken(token: string): AuthUserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUserPayload;
  } catch {
    return null;
  }
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Vui lòng đăng nhập để tiếp tục.',
      errorCode: 'UNAUTHORIZED'
    });
  }

  const payload = verifyToken(token);
  if (!payload || !payload.userId) {
    return res.status(401).json({
      success: false,
      message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.',
      errorCode: 'INVALID_TOKEN'
    });
  }

  try {
    const user = await User.findOne({ id: payload.userId }).select('id email username name role status').lean();
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản không tồn tại trên hệ thống.',
        errorCode: 'USER_NOT_FOUND'
      });
    }

    if (user.status === 'banned') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn đã bị khóa vĩnh viễn do vi phạm điều khoản bảo mật.',
        errorCode: 'USER_BANNED'
      });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
      name: user.name
    };
    return next();
  } catch (dbErr) {
    req.user = payload;
    return next();
  }
}

export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (token) {
    const payload = verifyToken(token);
    if (payload && payload.userId) {
      try {
        const user = await User.findOne({ id: payload.userId }).select('id email username name role status').lean();
        if (user && user.status !== 'banned') {
          req.user = {
            userId: user.id,
            email: user.email,
            role: user.role,
            username: user.username,
            name: user.name
          };
        }
      } catch {
        req.user = payload;
      }
    }
  }

  return next();
}

export async function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Truy cập bị từ chối. Chỉ dành cho Quản trị viên (Admin).',
      errorCode: 'FORBIDDEN_ADMIN_ONLY'
    });
  }

  // Strict double-check against MongoDB
  try {
    const dbUser = await User.findOne({ id: req.user.userId }).select('role status').lean();
    if (!dbUser || dbUser.role !== 'admin' || dbUser.status === 'banned') {
      return res.status(403).json({
        success: false,
        message: 'Quyền quản trị viên không hợp lệ hoặc tài khoản đã bị đình chỉ.',
        errorCode: 'FORBIDDEN_ADMIN_VERIFICATION_FAILED'
      });
    }
  } catch (err) {
    // Continue if DB transient check
  }

  next();
}

export async function requireSeller(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user || (req.user.role !== 'seller' && req.user.role !== 'admin')) {
    return res.status(403).json({
      success: false,
      message: 'Truy cập bị từ chối. Chỉ dành cho Người bán (Seller) hoặc Admin.',
      errorCode: 'FORBIDDEN_SELLER_ONLY'
    });
  }

  try {
    const dbUser = await User.findOne({ id: req.user.userId }).select('role status').lean();
    if (!dbUser || (dbUser.role !== 'seller' && dbUser.role !== 'admin') || dbUser.status === 'banned') {
      return res.status(403).json({
        success: false,
        message: 'Quyền người bán không hợp lệ.',
        errorCode: 'FORBIDDEN_SELLER_FAILED'
      });
    }
  } catch (err) {}

  next();
}

/**
 * Check if the seller functionality is enabled system-wide.
 * Reads the 'seller_enabled' key from the Setting collection.
 */
export async function isSellerFeatureEnabled(): Promise<boolean> {
  try {
    const setting = await Setting.findOne({ key: 'seller_enabled' });
    if (!setting) return false;
    return Boolean(setting.value);
  } catch (error) {
    console.error('Error checking seller_enabled setting:', error);
    return false;
  }
}

/**
 * Middleware to check whether the Seller feature is currently enabled.
 * CRITICAL RULE:
 * - Admin users ALWAYS bypass this check and can use seller functions anytime.
 * - Regular sellers/buyers get 403 Forbidden with code SELLER_DISABLED if seller_enabled is false.
 */
export async function requireSellerEnabled(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // 1. ADMIN BYPASS: Admin is ALWAYS permitted to use seller functions regardless of toggle
    if (req.user && req.user.role === 'admin') {
      return next();
    }

    // 2. Check system-wide setting
    const enabled = await isSellerFeatureEnabled();
    if (!enabled) {
      return res.status(403).json({
        success: false,
        code: 'SELLER_DISABLED',
        errorCode: 'SELLER_DISABLED',
        message: 'Hệ thống hiện tại hoạt động theo mô hình Shop chính thức: Toàn quyền đăng bán thuộc về Quản trị viên (Admin). Chức năng Người bán tự do đang được tạm đóng.'
      });
    }

    // 3. When enabled, only registered sellers or admin can post
    if (req.user && req.user.role !== 'seller' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN_NOT_SELLER',
        errorCode: 'FORBIDDEN_NOT_SELLER',
        message: 'Bạn cần đăng ký và được duyệt làm Người bán trước khi có thể đăng bán tài khoản.'
      });
    }

    return next();
  } catch (err: any) {
    console.error('Error in requireSellerEnabled middleware:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi kiểm tra quyền hạn hệ thống.'
    });
  }
}

