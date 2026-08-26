import { Router, Response } from 'express';
import { User } from '../models/User';
import { Account } from '../models/Account';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/favorites
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    const wishlistIds = user.wishlistIds || [];
    const accounts = await Account.find({ id: { $in: wishlistIds } }).lean();

    return res.json({
      success: true,
      wishlistIds,
      accounts,
      data: accounts
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách yêu thích' });
  }
});

// POST /api/favorites/:productId
router.post('/:productId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.userId;

    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    if (!user.wishlistIds.includes(productId)) {
      user.wishlistIds.push(productId);
      await user.save();
    }

    return res.json({
      success: true,
      message: 'Đã thêm vào danh sách yêu thích!',
      wishlistIds: user.wishlistIds
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi thêm yêu thích' });
  }
});

// DELETE /api/favorites/:productId
router.delete('/:productId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.userId;

    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    user.wishlistIds = user.wishlistIds.filter((id: string) => id !== productId);
    await user.save();

    return res.json({
      success: true,
      message: 'Đã xóa khỏi danh sách yêu thích!',
      wishlistIds: user.wishlistIds
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi xóa yêu thích' });
  }
});

export default router;
