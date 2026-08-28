import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { MysteryBox } from '../models/MysteryBox';
import { MysteryReward } from '../models/MysteryReward';
import { MysteryHistory } from '../models/MysteryHistory';
import { UserInventory } from '../models/UserInventory';
import { User } from '../models/User';
import { Account } from '../models/Account';
import { Setting } from '../models/Setting';
import { WalletTransaction } from '../models/WalletTransaction';
import { Notification } from '../models/Notification';
import {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  AuthenticatedRequest
} from '../middleware/auth';

const router = Router();

// ========================================================
// 1. SETTINGS & EVENT STATUS
// ========================================================

// GET /api/mystery-boxes/settings
router.get('/settings', async (req: Request, res: Response) => {
  try {
    const setting = await Setting.findOne({ key: 'mystery_box_active' });
    const isActive = setting ? setting.value !== false : true;
    return res.json({
      success: true,
      isMysteryBoxEventActive: isActive,
      isEventActive: isActive,
      isActive
    });
  } catch (error: any) {
    return res.json({
      success: true,
      isMysteryBoxEventActive: true,
      isEventActive: true,
      isActive: true
    });
  }
});

// POST /api/mystery-boxes/settings (Admin updates event active status)
router.post('/settings', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { isActive, isEventActive, isMysteryBoxEventActive } = req.body;
    let targetActive = true;
    if (typeof isEventActive === 'boolean') targetActive = isEventActive;
    else if (typeof isMysteryBoxEventActive === 'boolean') targetActive = isMysteryBoxEventActive;
    else if (typeof isActive === 'boolean') targetActive = isActive;

    await Setting.findOneAndUpdate(
      { key: 'mystery_box_active' },
      { $set: { value: targetActive, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );

    return res.json({
      success: true,
      message: `Đã ${targetActive ? 'BẬT' : 'TẮT'} toàn bộ sự kiện Xé Túi Mù May Mắn trên hệ thống!`,
      isMysteryBoxEventActive: targetActive,
      isEventActive: targetActive,
      isActive: targetActive
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật cấu hình Túi Mù' });
  }
});

// ========================================================
// 2. BOX TIERS
// ========================================================

// GET /api/mystery-boxes
router.get('/', async (req: Request, res: Response) => {
  try {
    const boxes = await MysteryBox.find().lean();
    return res.json({
      success: true,
      data: boxes,
      boxes
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách Túi Mù' });
  }
});

// PUT /api/mystery-boxes/:id (Admin update box tier config)
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const box = await MysteryBox.findOne({
      $or: [{ id }, { tier: id }]
    });

    if (!box) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hạng Túi Mù' });
    }

    if (updates.price !== undefined) box.price = Number(updates.price);
    if (updates.stockRemaining !== undefined) box.stockRemaining = Number(updates.stockRemaining);
    if (updates.isActive !== undefined) box.isActive = Boolean(updates.isActive);
    if (updates.name) box.name = updates.name;
    if (updates.description) box.description = updates.description;
    if (updates.badge) box.badge = updates.badge;
    if (updates.color) box.color = updates.color;

    await box.save();

    return res.json({
      success: true,
      message: `Đã cập nhật hạng "${box.name}" thành công!`,
      box: box.toJSON()
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật Túi Mù' });
  }
});

// GET /api/mystery-boxes/:id (Single box tier detail)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const box = await MysteryBox.findOne({
      $or: [{ id }, { tier: id }]
    });

    if (!box) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy Túi Mù' });
    }

    const rewards = await MysteryReward.find({
      $or: [{ boxTierId: box.tier }, { boxTierId: box.id }, { boxTierId: 'all' }]
    }).lean();

    return res.json({
      success: true,
      box: box.toJSON(),
      rewards
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải chi tiết Túi Mù' });
  }
});

// ========================================================
// 3. REWARDS MANAGEMENT (ADMIN)
// ========================================================

// GET /api/mystery-boxes/rewards/all
router.get('/rewards/all', async (req: Request, res: Response) => {
  try {
    const rewards = await MysteryReward.find().lean();
    return res.json({
      success: true,
      data: rewards,
      rewards
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách phần thưởng' });
  }
});

// POST /api/mystery-boxes/rewards (Admin Add Reward)
router.post('/rewards', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rewardData = req.body;
    const newId = rewardData.id || `rew_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newReward = new MysteryReward({
      id: newId,
      boxTierId: rewardData.boxTierId || 'box_bronze',
      type: rewardData.type || 'account',
      title: rewardData.title,
      description: rewardData.description || rewardData.subtitle || '',
      subtitle: rewardData.subtitle || rewardData.description || '',
      value: Number(rewardData.value) || 0,
      rarity: rewardData.rarity || 'rare',
      dropWeight: Number(rewardData.dropWeight) || 10,
      dropRate: Number(rewardData.dropRate) || 10,
      stock: rewardData.stock,
      accountData: rewardData.accountData,
      voucherCode: rewardData.voucherCode,
      voucherDiscount: rewardData.voucherDiscount
    });

    await newReward.save();

    return res.status(201).json({
      success: true,
      message: 'Đã thêm phần thưởng vào kho Túi Mù thành công!',
      reward: newReward.toJSON()
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi thêm phần thưởng', error: error.message });
  }
});

// PUT /api/mystery-boxes/rewards/:id (Admin Update Reward)
router.put('/rewards/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const reward = await MysteryReward.findOne({ id });
    if (!reward) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phần thưởng' });
    }

    if (updates.title !== undefined) reward.title = updates.title;
    if (updates.subtitle !== undefined) (reward as any).subtitle = updates.subtitle;
    if (updates.description !== undefined) reward.description = updates.description;
    if (updates.boxTierId !== undefined) reward.boxTierId = updates.boxTierId;
    if (updates.value !== undefined) reward.value = Number(updates.value);
    if (updates.rarity !== undefined) reward.rarity = updates.rarity;
    if (updates.dropWeight !== undefined) reward.dropWeight = Number(updates.dropWeight);
    if (updates.voucherCode !== undefined) reward.voucherCode = updates.voucherCode;
    if (updates.voucherDiscount !== undefined) reward.voucherDiscount = Number(updates.voucherDiscount);
    if (updates.accountData !== undefined) reward.accountData = updates.accountData;
    if (updates.stock !== undefined) reward.stock = updates.stock;

    await reward.save();

    return res.json({
      success: true,
      message: 'Đã cập nhật phần thưởng thành công!',
      reward: reward.toJSON()
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật phần thưởng' });
  }
});

// DELETE /api/mystery-boxes/rewards/:id (Admin Delete Reward)
router.delete('/rewards/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await MysteryReward.findOneAndDelete({ id });
    return res.json({
      success: true,
      message: 'Đã xóa phần thưởng khỏi kho Túi Mù thành công!'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi xóa phần thưởng' });
  }
});

// POST /api/mystery-boxes/import-account (Admin Import Account from Market to Mystery Box)
router.post('/import-account', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { accountId, targetTierId } = req.body;
    if (!accountId || !targetTierId) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin accountId hoặc targetTierId' });
    }

    const acc = await Account.findOne({ id: accountId });
    if (!acc) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản trên sàn' });
    }

    const newReward = new MysteryReward({
      id: `rew_import_${Date.now()}`,
      boxTierId: targetTierId,
      type: 'account',
      title: `Acc ${acc.rank} ${acc.heroesCount}T ${acc.skinsCount}S - ${acc.title}`,
      description: `${acc.credentials.securityType} - Đổi thông tin ngay`,
      value: acc.price,
      rarity: acc.price >= 500000 ? 'legendary' : acc.price >= 150000 ? 'epic' : 'rare',
      dropWeight: targetTierId === 'box_diamond' || targetTierId === 'box_special' ? 18 : 12,
      accountData: {
        rank: acc.rank,
        heroesCount: acc.heroesCount,
        skinsCount: acc.skinsCount,
        rareSkinName: acc.rareSkins?.[0]?.name || '',
        credentials: acc.credentials
      }
    });

    await newReward.save();

    acc.status = 'sold';
    await acc.save();

    return res.json({
      success: true,
      message: `Đã nhập Acc #${acc.code} vào kho quà của "${targetTierId}" thành công!`,
      reward: newReward.toJSON()
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi nhập tài khoản vào Túi Mù' });
  }
});

// ========================================================
// 4. PUBLIC HISTORY FEED
// ========================================================

// GET /api/mystery-boxes/public/history (and /api/mystery-boxes/history)
const getPublicHistoryHandler = async (req: Request, res: Response) => {
  try {
    const history = await MysteryHistory.find()
      .sort({ openedAt: -1 })
      .limit(30)
      .lean();

    // Sanitize account credentials for public feed
    const sanitized = history.map((item: any) => ({
      ...item,
      accountDelivered: item.accountDelivered
        ? {
            username: item.accountDelivered.username
              ? `${item.accountDelivered.username.slice(0, 3)}***`
              : '***',
            password: '••••••••',
            securityType: item.accountDelivered.securityType
          }
        : undefined
    }));

    return res.json({
      success: true,
      data: sanitized,
      history: sanitized
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải lịch sử trúng thưởng' });
  }
};

router.get('/public/history', getPublicHistoryHandler);
router.get('/history', getPublicHistoryHandler);

// ========================================================
// 5. UNBOXING ENGINE (AUTHORITATIVE SERVER-SIDE)
// ========================================================

// POST /api/mystery-boxes/:id/open
router.post('/:id/open', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để mở Túi Mù.' });
    }

    // Check if event is globally active
    const setting = await Setting.findOne({ key: 'mystery_box_active' });
    if (setting && setting.value === false) {
      return res.status(400).json({
        success: false,
        message: 'Chương trình Xé Túi Mù hiện đang tạm đóng. Vui lòng quay lại sau!'
      });
    }

    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    const box = await MysteryBox.findOne({
      $or: [{ id }, { tier: id }]
    });

    if (!box) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy Túi Mù này.' });
    }

    if (box.isActive === false) {
      return res.status(400).json({ success: false, message: 'Hạng Túi Mù này đang tạm khoá.' });
    }

    const boxPrice = box.price;

    // 1. Verify User Balance
    if (user.balance < boxPrice) {
      return res.status(400).json({
        success: false,
        message: `Số dư không đủ để mở túi này. Cần ${boxPrice.toLocaleString('vi-VN')}đ, số dư hiện tại: ${user.balance.toLocaleString('vi-VN')}đ.`,
        errorCode: 'INSUFFICIENT_BALANCE',
        requiredAmount: boxPrice,
        currentBalance: user.balance
      });
    }

    // 2. Load Eligible Rewards
    let rewards = await MysteryReward.find({
      boxTierId: { $in: [box.tier, box.id, 'all'] },
      $or: [{ stock: { $exists: false } }, { stock: { $gt: 0 } }, { stock: null }]
    });

    if (!rewards || rewards.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Kho phần thưởng của Túi Mù này đang được bổ sung, vui lòng thử lại sau.'
      });
    }

    // 3. Crypto-Secure Weighted Random Selection
    const totalWeight = rewards.reduce((sum, r) => sum + (r.dropWeight || 1), 0);
    const randomBuffer = crypto.randomBytes(4);
    const randomUint32 = randomBuffer.readUInt32BE(0);
    let randomVal = (randomUint32 / 0xffffffff) * totalWeight;

    let chosenReward = rewards[0];
    for (const r of rewards) {
      const w = r.dropWeight || 1;
      if (randomVal <= w) {
        chosenReward = r;
        break;
      }
      randomVal -= w;
    }

    // 4. Deduct User Wallet
    user.balance -= boxPrice;

    // 5. If reward is cash, immediately credit back
    if (chosenReward.type === 'cash' && chosenReward.value > 0) {
      user.balance += chosenReward.value;
    }

    await user.save();

    // 6. Record Wallet Transaction for Box Purchase
    const boxTx = new WalletTransaction({
      id: `tx_mb_${Date.now()}_1`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      type: 'purchase',
      amount: -boxPrice,
      status: 'success',
      note: `Mở Túi Mù May Mắn: ${box.name}`,
      createdAt: new Date().toISOString()
    });
    await boxTx.save();

    // If cash reward, record reward transaction
    if (chosenReward.type === 'cash' && chosenReward.value > 0) {
      const rewardTx = new WalletTransaction({
        id: `tx_mb_${Date.now()}_2`,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        type: 'refund',
        amount: chosenReward.value,
        status: 'success',
        note: `Trúng thưởng tiền mặt từ Túi Mù: ${chosenReward.title}`,
        createdAt: new Date().toISOString()
      });
      await rewardTx.save();
    }

    // 7. Add to User Inventory (except pure cash which was already added to balance)
    const inventoryId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const inventoryItem = new UserInventory({
      id: inventoryId,
      userId: user.id,
      source: 'mystery_box',
      rewardType: chosenReward.type,
      title: chosenReward.title,
      value: chosenReward.value,
      rarity: chosenReward.rarity,
      accountData: chosenReward.accountData,
      voucherCode: chosenReward.voucherCode,
      voucherDiscount: chosenReward.voucherDiscount,
      isUsed: false,
      receivedAt: new Date().toISOString()
    });
    await inventoryItem.save();

    // 8. Record History
    const historyItem = new MysteryHistory({
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      boxTierId: box.tier || box.id,
      boxName: box.name,
      rewardId: chosenReward.id,
      rewardType: chosenReward.type,
      rewardTitle: chosenReward.title,
      rewardValue: chosenReward.value,
      rewardRarity: chosenReward.rarity,
      accountDelivered: chosenReward.accountData?.credentials,
      voucherCodeDelivered: chosenReward.voucherCode,
      openedAt: new Date().toISOString()
    });
    await historyItem.save();

    // 9. Decrement stock if stock tracked, increment Box totalOpened
    if (typeof chosenReward.stock === 'number' && chosenReward.stock > 0) {
      chosenReward.stock -= 1;
      await chosenReward.save();
    }
    box.totalOpened = (box.totalOpened || 0) + 1;
    if (box.stockRemaining && box.stockRemaining > 0) {
      box.stockRemaining -= 1;
    }
    await box.save();

    // 10. Send Notification to User
    const notif = new Notification({
      id: `notif_${Date.now()}`,
      userId: user.id,
      title: 'Chúc mừng mở Túi Mù thành công!',
      message: `Bạn vừa mở ${box.name} và nhận được: ${chosenReward.title} (${chosenReward.rarity.toUpperCase()}). Kiểm tra tại Kho Đồ!`,
      type: 'system',
      createdAt: new Date().toISOString()
    });
    await notif.save();

    return res.json({
      success: true,
      message: `Chúc mừng bạn đã trúng: ${chosenReward.title}!`,
      reward: chosenReward.toJSON(),
      inventoryItem: inventoryItem.toJSON(),
      newBalance: user.balance
    });
  } catch (error: any) {
    console.error('Mystery box open error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi mở Túi Mù.',
      error: error.message
    });
  }
});

// ========================================================
// 6. INVENTORY
// ========================================================

// GET /api/mystery-boxes/user/inventory (User's rewards inventory)
router.get('/user/inventory', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    const items = await UserInventory.find({ userId }).sort({ receivedAt: -1 }).lean();
    return res.json({
      success: true,
      data: items,
      inventory: items,
      items
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải kho đồ' });
  }
});

// POST /api/mystery-boxes/user/inventory/:id/use
router.post('/user/inventory/:id/use', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const item = await UserInventory.findOne({ id, userId });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy vật phẩm' });
    }

    item.isUsed = true;
    item.usedAt = new Date().toISOString();
    await item.save();

    return res.json({
      success: true,
      message: 'Sử dụng vật phẩm thành công!',
      item: item.toJSON()
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi dùng vật phẩm' });
  }
});

export default router;
