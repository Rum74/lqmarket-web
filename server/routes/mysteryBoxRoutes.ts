import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { MysteryBox } from '../models/MysteryBox';
import { MysteryReward } from '../models/MysteryReward';
import { MysteryHistory } from '../models/MysteryHistory';
import { UserInventory } from '../models/UserInventory';
import { User } from '../models/User';
import { WalletTransaction } from '../models/WalletTransaction';
import { Notification } from '../models/Notification';
import {
  authenticateToken,
  optionalAuth,
  AuthenticatedRequest
} from '../middleware/auth';

const router = Router();

// GET /api/mystery-boxes
router.get('/', async (req: Request, res: Response) => {
  try {
    const boxes = await MysteryBox.find({ isActive: true }).lean();
    return res.json({
      success: true,
      data: boxes,
      boxes
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách Túi Mù' });
  }
});

// GET /api/mystery-boxes/:id
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
      $or: [{ boxTierId: box.tier }, { boxTierId: 'all' }]
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

// GET /api/mystery-boxes/history
router.get('/public/history', async (req: Request, res: Response) => {
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
});

// POST /api/mystery-boxes/:id/open (Authoritative Server-Side Mystery Box Engine)
router.post('/:id/open', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để mở Túi Mù.' });
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
      boxTierId: { $in: [box.tier, 'all'] },
      $or: [{ stock: { $exists: false } }, { stock: { $gt: 0 } }, { stock: null }]
    });

    if (!rewards || rewards.length === 0) {
      // Fallback in case rewards collection hasn't been seeded yet
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
      boxTierId: box.tier,
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

    // 9. Increment Box totalOpened
    box.totalOpened = (box.totalOpened || 0) + 1;
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

export default router;
