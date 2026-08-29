import { Router, Response } from 'express';
import { Notification } from '../models/Notification';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/notifications
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.json({
      success: true,
      data: notifications,
      notifications
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi tải danh sách thông báo',
      data: [],
      notifications: []
    });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const notif = await Notification.findOneAndUpdate(
      { id, userId },
      { $set: { read: true } },
      { new: true }
    );

    if (!notif) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo' });
    }

    return res.json({
      success: true,
      notification: notif.toJSON()
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật thông báo' });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    await Notification.updateMany({ userId }, { $set: { read: true } });

    return res.json({
      success: true,
      message: 'Đã đánh dấu tất cả thông báo là đã đọc.'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật thông báo' });
  }
});

export default router;
