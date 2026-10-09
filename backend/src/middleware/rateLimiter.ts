import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory sliding window counters per IP/key
const rateLimitStores = new Map<string, Map<string, RateLimitRecord>>();

/**
 * Creates a fast in-memory rate limiting middleware
 * @param bucketName Identifier for this bucket (e.g., 'auth', 'payment', 'global')
 * @param maxRequests Maximum requests allowed within windowMs
 * @param windowMs Time window in milliseconds (default 60 seconds)
 * @param message Custom error message on rate limit exceeded
 */
export function createRateLimiter(options: {
  bucketName: string;
  maxRequests: number;
  windowMs?: number;
  message?: string;
}) {
  const {
    bucketName,
    maxRequests,
    windowMs = 60 * 1000,
    message = 'Bạn đang thực hiện quá nhiều yêu cầu. Vui lòng thử lại sau giây lát.'
  } = options;

  if (!rateLimitStores.has(bucketName)) {
    rateLimitStores.set(bucketName, new Map<string, RateLimitRecord>());
  }
  const store = rateLimitStores.get(bucketName)!;

  // Cleanup expired entries periodically (every 5 minutes)
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  return (req: Request, res: Response, next: NextFunction) => {
    // Determine client identifier: IP, forwarded IP, or authenticated user ID
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    const userId = (req as any).user?.userId || '';
    const key = userId ? `${ip}_${userId}` : ip;

    const now = Date.now();
    let record = store.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs
      };
      store.set(key, record);
      return next();
    }

    record.count += 1;

    if (record.count > maxRequests) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

      console.warn(`⚠️ [RATE LIMIT] Exceeded in "${bucketName}" by ${key} (count: ${record.count})`);

      return res.status(429).json({
        success: false,
        errorCode: 'RATE_LIMIT_EXCEEDED',
        message,
        retryAfter: retryAfterSeconds
      });
    }

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    next();
  };
}

// Pre-configured rate limiters
export const globalRateLimiter = createRateLimiter({
  bucketName: 'global',
  maxRequests: 400,
  windowMs: 60 * 1000,
  message: 'Hệ thống phát hiện lượng truy cập quá tải từ thiết bị của bạn. Vui lòng thử lại sau 1 phút.'
});

export const authRateLimiter = createRateLimiter({
  bucketName: 'auth',
  maxRequests: 12,
  windowMs: 60 * 1000,
  message: 'Bạn đã thử đăng nhập/đăng ký quá nhiều lần. Vui lòng chờ 1 phút để tiếp tục.'
});

export const paymentRateLimiter = createRateLimiter({
  bucketName: 'payment',
  maxRequests: 25,
  windowMs: 60 * 1000,
  message: 'Yêu cầu thanh toán quá thường xuyên. Vui lòng chờ một chút trước khi tạo giao dịch mới.'
});

export const promotionRateLimiter = createRateLimiter({
  bucketName: 'promotion',
  maxRequests: 50,
  windowMs: 60 * 1000,
  message: 'Thao tác khuyến mãi quá nhanh. Vui lòng thử lại sau.'
});

export const uploadRateLimiter = createRateLimiter({
  bucketName: 'upload',
  maxRequests: 25,
  windowMs: 5 * 60 * 1000,
  message: 'Bạn đã tải lên quá nhiều tệp trong thời gian ngắn. Vui lòng thử lại sau 5 phút.'
});

export const adminRateLimiter = createRateLimiter({
  bucketName: 'admin',
  maxRequests: 150,
  windowMs: 60 * 1000,
  message: 'Yêu cầu quản trị vượt quá tần suất cho phép. Vui lòng thử lại sau.'
});
