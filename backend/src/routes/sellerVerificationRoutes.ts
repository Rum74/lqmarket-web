import { Router, Response } from 'express';
import { SellerVerification } from '../models/SellerVerification';
import { User } from '../models/User';
import { Notification } from '../models/Notification';
import { AuditLog } from '../models/AuditLog';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/seller-verifications/my
 * Current user gets their verification status
 */
router.get('/my', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const verification = await SellerVerification.findOne({ userId }).sort({ appliedAt: -1 }).lean();
    return res.json({ success: true, verification: verification || null, data: verification || null });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải thông tin xác minh' });
  }
});

/**
 * POST /api/seller-verifications/apply
 * User submits verification application
 */
router.post('/apply', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    let user = await User.findOne({
      $or: [
        { id: userId },
        { username: userId },
        { email: userId }
      ]
    });

    if (!user) {
      try {
        user = await User.create({
          id: userId,
          name: req.body.fullName || req.user?.name || 'Người bán',
          username: req.user?.username || userId,
          email: req.user?.email || `${userId}@cholienquan.com`,
          phone: req.body.phone || req.body.userPhone || '',
          role: 'seller',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`,
          balance: 0,
          pendingBalance: 0,
          rating: 5.0,
          completedSales: 0,
          isVerifiedSeller: false,
          sellerTier: 'BASIC',
          status: 'active'
        });
      } catch (err) {
        user = {
          id: userId,
          name: req.body.fullName || 'Người bán',
          username: userId,
          email: `${userId}@cholienquan.com`,
          phone: req.body.phone || '',
          avatar: '',
          role: 'seller'
        } as any;
      }
    }

    const {
      idCardNumber,
      fullName,
      phone,
      socialLink,
      zaloPhone,
      idCardFrontImage,
      idCardBackImage,
      agreedWarranty,
      warrantyCommitment
    } = req.body;

    if (!idCardNumber) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp số CCCD/CMND hợp lệ' });
    }

    // Check if there is already a pending request
    const existingPending = await SellerVerification.findOne({ userId, status: 'pending' });
    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã có một hồ sơ xác minh đang chờ Ban Quản Trị xét duyệt.'
      });
    }

    const id = `svr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newRequest = new SellerVerification({
      id,
      userId: user.id,
      userName: user.name || user.username,
      userEmail: user.email || '',
      userPhone: phone || user.phone || '',
      fullName: fullName || user.name || '',
      phone: phone || user.phone || '',
      userAvatar: user.avatar || '',
      idCardNumber: String(idCardNumber).trim(),
      socialLink: socialLink || '',
      zaloPhone: zaloPhone || phone || '',
      agreedWarranty: agreedWarranty !== false,
      warrantyCommitment: warrantyCommitment !== false,
      idCardFrontImage: idCardFrontImage || '',
      idCardBackImage: idCardBackImage || '',
      status: 'pending',
      appliedAt: new Date().toISOString()
    });

    await newRequest.save();

    // Create Notification
    try {
      const notif = new Notification({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: user.id,
        type: 'system',
        title: 'Đã gửi hồ sơ Người Bán Uy Tín',
        message: 'Hồ sơ đăng ký Người Bán Uy Tín của bạn đã được gửi thành công và đang chờ Ban Quản Trị xét duyệt trong vòng 24 giờ.',
        read: false,
        createdAt: new Date().toISOString()
      });
      await notif.save();
    } catch {}

    return res.status(201).json({
      success: true,
      message: 'Gửi hồ sơ đăng ký Người Bán Uy Tín thành công! Vui lòng chờ BQT kiểm tra.',
      request: newRequest.toJSON(),
      data: newRequest.toJSON()
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi gửi hồ sơ xác minh' });
  }
});

/**
 * GET /api/seller-verifications/my-status
 * Check current user's seller verification status
 */
router.get('/my-status', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }
    const request = await SellerVerification.findOne({ userId }).sort({ appliedAt: -1 }).lean();
    return res.json({ success: true, request: request || null, data: request || null });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi kiểm tra trạng thái xác minh' });
  }
});

/**
 * GET /api/seller-verifications
 * Admin lists all verification requests
 */
router.get('/', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requests = await SellerVerification.find().sort({ appliedAt: -1 }).lean();
    return res.json({ success: true, data: requests, requests });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách hồ sơ xác minh' });
  }
});

/**
 * PUT /api/seller-verifications/:id/review
 * Admin approves or rejects a seller verification request
 */
router.put('/:id/review', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ (phải là approved hoặc rejected)' });
    }

    const verification = await SellerVerification.findOne({ id });
    if (!verification) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ xác minh' });
    }

    verification.status = status;
    verification.reviewedAt = new Date().toISOString();
    verification.reviewedBy = req.user?.username || 'Admin';
    if (status === 'rejected') {
      verification.rejectionReason = rejectionReason || 'Thông tin CCCD hoặc bảo hành không đạt yêu cầu';
    }

    await verification.save();

    // If approved, update target user's isVerifiedSeller to true
    if (status === 'approved') {
      const user = await User.findOne({ id: verification.userId });
      if (user) {
        user.isVerifiedSeller = true;
        user.sellerTier = 'PRO';
        await user.save();
      }

      // Notification to seller
      try {
        const notif = new Notification({
          id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: verification.userId,
          type: 'system',
          title: 'Hồ sơ Người Bán Uy Tín ĐÃ ĐƯỢC DUYỆT!',
          message: 'Chúc mừng! Bạn đã chính thức được cấp huy hiệu Người Bán Uy Tín trên sàn LQMarket.',
          read: false,
          createdAt: new Date().toISOString()
        });
        await notif.save();
      } catch {}
    } else {
      // Rejection notification
      try {
        const notif = new Notification({
          id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: verification.userId,
          type: 'system',
          title: 'Hồ sơ Người Bán Uy Tín bị từ chối',
          message: `Hồ sơ xác minh người bán của bạn chưa được duyệt. Lý do: ${verification.rejectionReason || 'Thông tin chưa hợp lệ'}.`,
          read: false,
          createdAt: new Date().toISOString()
        });
        await notif.save();
      } catch {}
    }

    // Audit Log
    try {
      await AuditLog.create({
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        adminId: req.user?.userId || 'admin',
        adminName: req.user?.username || 'Admin',
        action: status === 'approved' ? 'APPROVE_SELLER' : 'REJECT_SELLER',
        targetType: 'seller_verification',
        targetId: verification.id,
        details: `${status === 'approved' ? 'Phê duyệt' : 'Từ chối'} xác minh người bán [${verification.userName}] (CCCD: ${verification.idCardNumber})`
      });
    } catch {}

    return res.json({
      success: true,
      message: status === 'approved' ? 'Đã phê duyệt người bán uy tín thành công' : 'Đã từ chối hồ sơ xác minh',
      verification: verification.toJSON(),
      data: verification.toJSON()
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi xử lý hồ sơ xác minh' });
  }
});

export default router;
