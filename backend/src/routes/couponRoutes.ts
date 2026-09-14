import { Router, Response } from 'express';
import { Coupon } from '../models/Coupon';
import { AuditLog } from '../models/AuditLog';
import { optionalAuth, authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const INITIAL_COUPONS_SEED = [
  {
    id: 'cpn_10',
    code: 'LQMARKET10',
    discountPercent: 10,
    minOrder: 500000,
    maxDiscount: 200000,
    maxUses: 500,
    usedCount: 84,
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    isActive: true,
    description: 'Giảm 10% tối đa 200.000đ cho đơn hàng từ 500.000đ'
  },
  {
    id: 'cpn_vip50',
    code: 'VIP50K',
    discountAmount: 50000,
    minOrder: 300000,
    maxUses: 1000,
    usedCount: 231,
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    isActive: true,
    description: 'Giảm trực tiếp 50.000đ cho đơn từ 300.000đ'
  },
  {
    id: 'cpn_newbie',
    code: 'NEWBIE20K',
    discountAmount: 20000,
    minOrder: 100000,
    maxUses: 2000,
    usedCount: 512,
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    isActive: true,
    description: 'Tặng tân thủ 20.000đ khi mua acc lần đầu tiên từ 100.000đ'
  },
  {
    id: 'cpn_sss',
    code: 'SIEKIN15',
    discountPercent: 15,
    minOrder: 1500000,
    maxDiscount: 400000,
    maxUses: 200,
    usedCount: 42,
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    isActive: true,
    description: 'Giảm 15% tối đa 400.000đ cho dàn acc siêu skin SSS từ 1.500.000đ'
  }
];

// Helper to seed initial coupons if collection is empty
export async function ensureCouponsSeeded() {
  try {
    const count = await Coupon.countDocuments();
    if (count === 0) {
      for (const c of INITIAL_COUPONS_SEED) {
        await Coupon.create(c);
      }
      console.log('[MONGO] Seeded initial marketplace coupons into MongoDB');
    }
  } catch (err) {
    console.warn('Coupon seed notice:', err);
  }
}

/**
 * GET /api/coupons
 * Fetch all coupons (Admin sees all, normal user sees active coupons)
 */
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await ensureCouponsSeeded();
    const isAdmin = req.user?.role === 'admin';
    const query = isAdmin ? {} : { isActive: true };
    const coupons = await Coupon.find(query).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: coupons, coupons });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách mã giảm giá' });
  }
});

/**
 * POST /api/coupons/apply or POST /api/coupons/validate
 * Validate a coupon code and calculate discount
 */
const validateCouponHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    await ensureCouponsSeeded();
    const { code, orderPrice } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập mã giảm giá' });
    }

    const price = Number(orderPrice) || 0;
    const cleanCode = String(code).trim().toUpperCase();

    const coupon = await Coupon.findOne({ code: cleanCode });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Mã giảm giá không tồn tại hoặc đã hết hạn.' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá này hiện đang tạm ngưng sử dụng.' });
    }

    if (coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá này đã hết lượt sử dụng.' });
    }

    const now = new Date();
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá chưa đến ngày bắt đầu áp dụng.' });
    }
    if (coupon.validTo && new Date(coupon.validTo) < now) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá đã quá hạn sử dụng.' });
    }

    if (coupon.minOrder && price < coupon.minOrder) {
      return res.status(400).json({
        success: false,
        message: `Mã này chỉ áp dụng cho đơn hàng tối thiểu từ ${coupon.minOrder.toLocaleString('vi-VN')}đ.`
      });
    }

    // Calculate discount amount
    let discount = 0;
    if (coupon.discountPercent) {
      discount = Math.round((price * coupon.discountPercent) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else if (coupon.discountAmount) {
      discount = coupon.discountAmount;
    }

    discount = Math.min(discount, price);

    return res.json({
      success: true,
      valid: true,
      message: `Áp dụng thành công mã giảm ${discount.toLocaleString('vi-VN')}đ`,
      discount,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        discountAmount: coupon.discountAmount,
        minOrder: coupon.minOrder,
        maxDiscount: coupon.maxDiscount,
        description: coupon.description
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi kiểm tra mã giảm giá' });
  }
};

router.post('/apply', validateCouponHandler);
router.post('/validate', validateCouponHandler);

/**
 * POST /api/coupons
 * Admin creates a new coupon
 */
router.post('/', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code, discountPercent, discountAmount, minOrder, maxDiscount, maxUses, validFrom, validTo, description } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Mã code không được để trống' });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Mã code này đã tồn tại trong hệ thống' });
    }

    const id = `cpn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newCoupon = new Coupon({
      id,
      code: cleanCode,
      discountPercent: discountPercent ? Number(discountPercent) : undefined,
      discountAmount: discountAmount ? Number(discountAmount) : undefined,
      minOrder: Number(minOrder) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      maxUses: Number(maxUses) || 100,
      usedCount: 0,
      validFrom: validFrom || new Date().toISOString(),
      validTo: validTo || new Date(Date.now() + 365 * 86400000).toISOString(),
      isActive: true,
      description: description || ''
    });

    await newCoupon.save();

    // Log admin audit
    try {
      await AuditLog.create({
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        adminId: req.user?.userId || 'admin',
        adminName: req.user?.username || 'Admin',
        action: 'CREATE_COUPON',
        targetType: 'coupon',
        targetId: id,
        details: `Tạo mã giảm giá mới [${cleanCode}]: ${description || ''}`
      });
    } catch {}

    return res.status(201).json({ success: true, message: 'Tạo mã giảm giá thành công', coupon: newCoupon.toJSON(), data: newCoupon.toJSON() });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tạo mã giảm giá' });
  }
});

/**
 * PUT /api/coupons/:id/toggle
 * Admin toggles coupon active status
 */
router.put('/:id/toggle', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findOne({ id });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mã giảm giá' });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    try {
      await AuditLog.create({
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        adminId: req.user?.userId || 'admin',
        adminName: req.user?.username || 'Admin',
        action: coupon.isActive ? 'ACTIVATE_COUPON' : 'DEACTIVATE_COUPON',
        targetType: 'coupon',
        targetId: coupon.id,
        details: `${coupon.isActive ? 'Kích hoạt' : 'Tạm dừng'} mã giảm giá [${coupon.code}]`
      });
    } catch {}

    return res.json({ success: true, message: 'Cập nhật trạng thái thành công', coupon: coupon.toJSON(), data: coupon.toJSON() });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật mã giảm giá' });
  }
});

/**
 * DELETE /api/coupons/:id
 * Admin deletes a coupon
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findOne({ id });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mã giảm giá' });
    }

    await Coupon.deleteOne({ id });

    try {
      await AuditLog.create({
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        adminId: req.user?.userId || 'admin',
        adminName: req.user?.username || 'Admin',
        action: 'DELETE_COUPON',
        targetType: 'coupon',
        targetId: id,
        details: `Xóa vĩnh viễn mã giảm giá [${coupon.code}]`
      });
    } catch {}

    return res.json({ success: true, message: 'Xóa mã giảm giá thành công' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi xóa mã giảm giá' });
  }
});

export default router;
