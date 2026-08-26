import { Router, Response } from 'express';
import { Order, IOrder } from '../models/Order';
import { Account } from '../models/Account';
import { User } from '../models/User';
import { WalletTransaction } from '../models/WalletTransaction';
import { Notification } from '../models/Notification';
import { Review } from '../models/Review';
import {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  AuthenticatedRequest
} from '../middleware/auth';

const router = Router();

// POST /api/orders (Create escrow purchase)
router.post('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const buyerId = req.user?.userId || req.body.buyerId;
    if (!buyerId) {
      return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để mua tài khoản.' });
    }

    const { accountId, voucherCodeUsed, voucherDiscount = 0 } = req.body;

    const buyer = await User.findOne({ $or: [{ id: buyerId }, { email: buyerId }] });
    if (!buyer) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin người mua.' });
    }

    const account = await Account.findOne({ id: accountId });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản cần mua.' });
    }

    if (account.status === 'sold') {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản này đã được bán cho người dùng khác.'
      });
    }

    if (account.sellerId === buyerId) {
      return res.status(400).json({
        success: false,
        message: 'Bạn không thể tự mua tài khoản do chính mình đăng bán.'
      });
    }

    const discountedPrice = Math.max(0, account.price - Number(voucherDiscount || 0));
    const fee = Math.round(discountedPrice * 0.05); // 5% sàn fee
    const totalAmount = discountedPrice;

    // Check balance
    if (buyer.balance < totalAmount) {
      return res.status(400).json({
        success: false,
        message: `Số dư ví không đủ (${buyer.balance.toLocaleString('vi-VN')}đ / ${totalAmount.toLocaleString('vi-VN')}đ). Vui lòng nạp thêm tiền.`,
        errorCode: 'INSUFFICIENT_BALANCE',
        requiredAmount: totalAmount,
        currentBalance: buyer.balance
      });
    }

    // Deduct buyer balance (Hold in Escrow)
    buyer.balance -= totalAmount;
    await buyer.save();

    // Mark account as sold
    account.status = 'sold';
    await account.save();

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const orderCode = `#ORD${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder = new Order({
      id: orderId,
      orderCode,
      accountId: account.id,
      accountCode: account.code,
      accountTitle: account.title,
      accountPrice: account.price,
      voucherDiscount: Number(voucherDiscount) || 0,
      voucherCodeUsed,
      fee,
      totalAmount,
      buyerId: buyer.id,
      buyerName: buyer.name,
      sellerId: account.sellerId,
      sellerName: account.sellerName,
      status: 'account_delivered', // Credentials delivered instantly via Escrow
      credentialsDelivered: account.credentials,
      createdAt: new Date().toISOString()
    });

    await newOrder.save();

    // Record buyer wallet transaction
    const buyerTx = new WalletTransaction({
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: buyer.id,
      userName: buyer.name,
      userEmail: buyer.email,
      type: 'purchase',
      amount: -totalAmount,
      status: 'success',
      note: `Thanh toán đơn hàng ${orderCode} (${account.title}) qua Trung Gian Escrow`,
      createdAt: new Date().toISOString()
    });
    await buyerTx.save();

    // Send notifications
    const buyerNotif = new Notification({
      id: `notif_${Date.now()}_1`,
      userId: buyer.id,
      title: 'Giao dịch thành công',
      message: `Đơn hàng ${orderCode} đã sẵn sàng. Thông tin đăng nhập đã được bàn giao qua hệ thống bảo vệ Escrow.`,
      type: 'order',
      linkTarget: orderId,
      createdAt: new Date().toISOString()
    });
    await buyerNotif.save();

    const sellerNotif = new Notification({
      id: `notif_${Date.now()}_2`,
      userId: account.sellerId,
      title: 'Tài khoản đã có người mua',
      message: `Tài khoản ${account.code} đã được mua bởi ${buyer.name}. Tiền (${(totalAmount - fee).toLocaleString('vi-VN')}đ) đang được giữ an toàn trên Escrow chờ người mua xác nhận.`,
      type: 'order',
      linkTarget: orderId,
      createdAt: new Date().toISOString()
    });
    await sellerNotif.save();

    return res.status(201).json({
      success: true,
      message: 'Đặt mua tài khoản thành công! Thông tin đăng nhập đã được gửi.',
      order: newOrder.toJSON(),
      data: newOrder.toJSON()
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo đơn hàng trung gian.',
      error: error.message
    });
  }
});

// GET /api/orders
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;

    let query: any = {};
    if (role === 'admin') {
      // Admin sees all orders
    } else {
      query = { $or: [{ buyerId: userId }, { sellerId: userId }] };
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

    return res.json({
      success: true,
      data: orders,
      orders
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tải danh sách đơn hàng.',
      data: [],
      orders: []
    });
  }
});

// GET /api/orders/:id
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const isUserAdmin = req.user?.role === 'admin';

    const order = await Order.findOne({
      $or: [{ id }, { orderCode: id }]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });
    }

    if (order.buyerId !== userId && order.sellerId !== userId && !isUserAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem đơn hàng này.'
      });
    }

    return res.json({
      success: true,
      data: order.toJSON(),
      order: order.toJSON()
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi lấy chi tiết đơn hàng.' });
  }
});

// POST /api/orders/:id/confirm-received (Buyer confirms & releases Escrow money to seller)
router.post('/:id/confirm-received', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const isUserAdmin = req.user?.role === 'admin';

    const order = await Order.findOne({ id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });
    }

    if (order.buyerId !== userId && !isUserAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ người mua mới có quyền xác nhận hoàn tất đơn hàng.'
      });
    }

    if (order.status === 'completed') {
      return res.json({ success: true, message: 'Đơn hàng đã được hoàn tất trước đó.', order });
    }

    order.status = 'completed';
    order.completedAt = new Date().toISOString();
    await order.save();

    // Release payout to Seller
    const sellerPayoutAmount = order.totalAmount - (order.fee || 0);
    const seller = await User.findOne({ id: order.sellerId });
    if (seller) {
      seller.balance += sellerPayoutAmount;
      seller.completedSales = (seller.completedSales || 0) + 1;
      await seller.save();

      // Record seller payout transaction
      const sellerTx = new WalletTransaction({
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: seller.id,
        userName: seller.name,
        userEmail: seller.email,
        type: 'seller_payout',
        amount: sellerPayoutAmount,
        status: 'success',
        note: `Nhận tiền bán acc đơn hàng ${order.orderCode} (Đã trừ 5% phí sàn)`,
        createdAt: new Date().toISOString()
      });
      await sellerTx.save();

      const sellerNotif = new Notification({
        id: `notif_${Date.now()}`,
        userId: seller.id,
        title: 'Thanh toán đã được giải ngân',
        message: `Người mua đã xác nhận hài lòng với đơn hàng ${order.orderCode}. Số tiền ${sellerPayoutAmount.toLocaleString('vi-VN')}đ đã được cộng vào ví của bạn.`,
        type: 'wallet',
        linkTarget: order.id,
        createdAt: new Date().toISOString()
      });
      await sellerNotif.save();
    }

    return res.json({
      success: true,
      message: 'Xác nhận hoàn tất đơn hàng và giải ngân tiền cho người bán thành công!',
      order: order.toJSON()
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi xác nhận hoàn tất đơn hàng.' });
  }
});

// POST /api/orders/:id/dispute (Open complaint)
router.post('/:id/dispute', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const { reason } = req.body;

    const order = await Order.findOne({ id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });
    }

    if (order.buyerId !== userId && order.sellerId !== userId) {
      return res.status(403).json({ success: false, message: 'Không có quyền khiếu nại đơn hàng này.' });
    }

    order.status = 'disputed';
    order.disputeReason = reason || 'Người mua khiếu nại tài khoản không đúng thông tin cam kết.';
    await order.save();

    return res.json({
      success: true,
      message: 'Đã gửi yêu cầu khiếu nại lên ban quản trị sàn LQMarket.',
      order: order.toJSON()
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi gửi khiếu nại.' });
  }
});

// POST /api/orders/:id/review
router.post('/:id/review', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const { rating = 5, comment = '' } = req.body;

    const order = await Order.findOne({ id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });
    }

    if (order.buyerId !== userId) {
      return res.status(403).json({ success: false, message: 'Chỉ người mua mới có thể đánh giá.' });
    }

    order.review = {
      rating: Number(rating),
      comment,
      createdAt: new Date().toISOString()
    };
    await order.save();

    const review = new Review({
      id: `rev_${Date.now()}`,
      orderId: order.id,
      accountId: order.accountId,
      accountCode: order.accountCode,
      buyerId: order.buyerId,
      buyerName: order.buyerName,
      sellerId: order.sellerId,
      rating: Number(rating),
      comment,
      createdAt: new Date().toISOString()
    });
    await review.save();

    return res.json({
      success: true,
      message: 'Cảm ơn bạn đã gửi đánh giá dịch vụ!',
      order: order.toJSON()
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi gửi đánh giá.' });
  }
});

export default router;
