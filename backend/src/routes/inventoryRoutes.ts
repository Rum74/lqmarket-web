import { Router, Response } from 'express';
import { UserInventory } from '../models/UserInventory';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/inventory
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const inventory = await UserInventory.find({ userId })
      .sort({ receivedAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: inventory,
      inventory
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi tải kho đồ cá nhân',
      data: [],
      inventory: []
    });
  }
});

// GET /api/inventory/:id
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const item = await UserInventory.findOne({ id, userId });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy vật phẩm' });
    }

    return res.json({
      success: true,
      data: item.toJSON(),
      item: item.toJSON()
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi lấy thông tin vật phẩm' });
  }
});

// POST /api/inventory/:id/use
router.post('/:id/use', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const item = await UserInventory.findOne({ id, userId });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy vật phẩm' });
    }

    if (item.isUsed) {
      return res.status(400).json({ success: false, message: 'Vật phẩm này đã được sử dụng.' });
    }

    item.isUsed = true;
    await item.save();

    return res.json({
      success: true,
      message: 'Sử dụng vật phẩm thành công!',
      item: item.toJSON()
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi sử dụng vật phẩm' });
  }
});

export default router;
