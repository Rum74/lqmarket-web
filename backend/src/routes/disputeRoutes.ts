import { Router, Response } from 'express';
import { Dispute } from '../models/Dispute';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { WalletTransaction } from '../models/WalletTransaction';
import { Notification } from '../models/Notification';
import { AuditLog } from '../models/AuditLog';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/disputes
 * List disputes: Admin sees all, normal user sees their own (buyer or seller)
 */
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const isAdmin = req.user?.role === 'admin';

    const query = isAdmin ? {} : { $or: [{ buyerId: userId }, { sellerId: userId }] };
    const disputes = await Dispute.find(query).sort({ createdAt: -1 }).lean();

    return res.json({ success: true, data: disputes, disputes });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách khiếu nại' });
  }
});

/**
 * POST /api/disputes
 * Buyer opens a dispute ticket for an order
 */
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { orderId, reason, evidencePhotos, evidenceVideo, buyerNote } = req.body;

    if (!orderId || !reason) {
      return res.status(400).json({ success: false, message: 'Thiếu mã đơn hàng hoặc lý do khiếu nại' });
    }

    const order = await Order.findOne({ id: orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    if (order.buyerId !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bạn không phải là người mua của đơn hàng này' });
    }

    // Check if duplicate dispute
    const existing = await Dispute.findOne({ orderId, status: { $in: ['pending', 'under_review', 'more_info_needed'] } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Đơn hàng này đang có khiếu nại chờ xử lý' });
    }

    const id = `DSP${Math.floor(100000 + Math.random() * 900000)}`;
    const newDispute = new Dispute({
      id,
      orderId: order.id,
      orderCode: order.orderCode || order.id,
      accountId: order.accountId,
      accountCode: order.accountCode,
      accountTitle: order.accountTitle,
      amount: (order as any).totalAmount || (order as any).accountPrice || 0,
      buyerId: order.buyerId,
      buyerName: order.buyerName,
      sellerId: order.sellerId,
      sellerName: order.sellerName,
      reason,
      evidencePhotos: Array.isArray(evidencePhotos) ? evidencePhotos : [],
      evidenceVideo: evidenceVideo || '',
      buyerNote: buyerNote || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    await newDispute.save();

    // Mark order status as disputed if possible
    try {
      (order as any).disputed = true;
      (order as any).disputeId = id;
      await order.save();
    } catch {}

    // Send notifications to seller
    try {
      const sellerNotif = new Notification({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: order.sellerId,
        type: 'order',
        title: 'Khiếu nại đơn hàng mới',
        message: `Người mua đã mở khiếu nại cho đơn #${order.orderCode || order.id}. Lý do: ${reason}. BQT đang can thiệp giải quyết.`,
        read: false,
        createdAt: new Date().toISOString()
      });
      await sellerNotif.save();
    } catch {}

    return res.status(201).json({
      success: true,
      message: 'Mở khiếu nại thành công! Ban Quản Trị sẽ đối soát và giải quyết trong vòng 24 giờ.',
      dispute: newDispute.toJSON(),
      data: newDispute.toJSON()
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tạo khiếu nại: ' + error.message });
  }
});

/**
 * PUT /api/disputes/:id/resolve
 * Admin resolves dispute ticket
 */
router.put('/:id/resolve', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { resolution, adminDecisionNote } = req.body;

    const dispute = await Dispute.findOne({ id });
    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ khiếu nại' });
    }

    const order = await Order.findOne({ id: dispute.orderId });

    if (resolution === 'resolved_buyer_refund') {
      // Refund money to buyer's balance
      const buyer = await User.findOne({ id: dispute.buyerId });
      if (buyer) {
        buyer.balance = (buyer.balance || 0) + dispute.amount;
        await buyer.save();

        // Create wallet transaction record for refund
        const tx = new WalletTransaction({
          id: `tx_ref_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: buyer.id,
          userName: buyer.name || buyer.username,
          userEmail: buyer.email || '',
          type: 'deposit',
          amount: dispute.amount,
          balanceAfter: buyer.balance,
          status: 'success',
          note: `Hoàn tiền khiếu nại thành công đơn #${dispute.orderCode} (Mã KN: #${dispute.id})`,
          createdAt: new Date().toISOString()
        });
        await tx.save();

        // Notification to buyer
        const buyerNotif = new Notification({
          id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: buyer.id,
          type: 'order',
          title: 'Khiếu nại được chấp thuận - Đã hoàn tiền',
          message: `Khiếu nại #${dispute.id} cho đơn #${dispute.orderCode} đã được giải quyết: Hoàn trả ${dispute.amount.toLocaleString('vi-VN')}đ về số dư ví của bạn.`,
          read: false,
          createdAt: new Date().toISOString()
        });
        await buyerNotif.save();
      }

      // Notification to seller
      const sellerNotif = new Notification({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: dispute.sellerId,
        type: 'order',
        title: 'Khiếu nại đơn hàng đã hoàn tiền cho người mua',
        message: `Admin đã kết luận hoàn tiền cho người mua đối với đơn #${dispute.orderCode}. Ghi chú: ${adminDecisionNote || 'Sản phẩm không đúng mô tả hoặc thông tin lỗi'}.`,
        read: false,
        createdAt: new Date().toISOString()
      });
      await sellerNotif.save();

      if (order) {
        order.status = 'refunded';
        await order.save();
      }

      dispute.status = 'resolved_buyer_refund';
    } else if (resolution === 'resolved_seller_payout') {
      // Release payout to seller
      const seller = await User.findOne({ id: dispute.sellerId });
      if (seller) {
        const platformFee = Math.round(dispute.amount * 0.05);
        const sellerNet = dispute.amount - platformFee;

        seller.balance = (seller.balance || 0) + sellerNet;
        seller.completedSales = (seller.completedSales || 0) + 1;
        await seller.save();

        const tx = new WalletTransaction({
          id: `tx_payout_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: seller.id,
          userName: seller.name || seller.username,
          userEmail: seller.email || '',
          type: 'seller_payout',
          amount: sellerNet,
          balanceAfter: seller.balance,
          status: 'success',
          note: `Thanh toán doanh thu đơn #${dispute.orderCode} sau khi giải quyết tranh chấp (Trừ 5% phí sàn: ${platformFee.toLocaleString('vi-VN')}đ)`,
          createdAt: new Date().toISOString()
        });
        await tx.save();

        // Notification to seller
        const sellerNotif = new Notification({
          id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: seller.id,
          type: 'order',
          title: 'Tranh chấp đã xử lý - Giải ngân thành công',
          message: `Khiếu nại #${dispute.id} cho đơn #${dispute.orderCode} đã giải quyết có lợi cho người bán: +${sellerNet.toLocaleString('vi-VN')}đ vào ví.`,
          read: false,
          createdAt: new Date().toISOString()
        });
        await sellerNotif.save();
      }

      // Notification to buyer
      const buyerNotif = new Notification({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: dispute.buyerId,
        type: 'order',
        title: 'Kết quả giải quyết khiếu nại',
        message: `Khiếu nại #${dispute.id} cho đơn #${dispute.orderCode} bị bác bỏ do tài khoản đúng mô tả. Quyết định của BQT: ${adminDecisionNote || 'Tài khoản hoạt động bình thường'}.`,
        read: false,
        createdAt: new Date().toISOString()
      });
      await buyerNotif.save();

      if (order) {
        order.status = 'completed';
        await order.save();
      }

      dispute.status = 'resolved_seller_payout';
    } else if (resolution === 'more_info_needed') {
      dispute.status = 'more_info_needed';
    } else {
      dispute.status = 'under_review';
    }

    dispute.adminDecisionNote = adminDecisionNote || '';
    dispute.resolvedAt = new Date().toISOString();
    dispute.resolvedBy = req.user?.username || 'Admin';
    await dispute.save();

    // Audit Log
    try {
      await AuditLog.create({
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        adminId: req.user?.userId || 'admin',
        adminName: req.user?.username || 'Admin',
        action: 'RESOLVE_DISPUTE',
        targetType: 'dispute',
        targetId: dispute.id,
        details: `Giải quyết khiếu nại #${dispute.id} (Đơn #${dispute.orderCode}): ${resolution}. Ghi chú: ${adminDecisionNote || ''}`
      });
    } catch {}

    return res.json({
      success: true,
      message: 'Đã cập nhật giải quyết khiếu nại thành công',
      dispute: dispute.toJSON(),
      data: dispute.toJSON()
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi giải quyết khiếu nại' });
  }
});

export default router;
