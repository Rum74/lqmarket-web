import { Router, Response } from 'express';
import { BlindBagAccount } from '../models/BlindBagAccount';
import { BlindBagClaim } from '../models/BlindBagClaim';
import { MysteryBox } from '../models/MysteryBox';
import { Setting } from '../models/Setting';
import { User } from '../models/User';
import { WalletTransaction } from '../models/WalletTransaction';
import { Notification } from '../models/Notification';
import { UserInventory } from '../models/UserInventory';
import { MysteryHistory } from '../models/MysteryHistory';
import {
  authenticateToken,
  requireAdmin,
  AuthenticatedRequest
} from '../middleware/auth';

const router = Router();

// ========================================================
// 1. ADMIN APIS: QUẢN LÝ KHO ACC TÚI MÙ (BlindBagAccount)
// ========================================================

const handleGetStats = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const [total, available, claimed, reserved, disabled] = await Promise.all([
      BlindBagAccount.countDocuments({}),
      BlindBagAccount.countDocuments({ status: 'available' }),
      BlindBagAccount.countDocuments({ status: 'claimed' }),
      BlindBagAccount.countDocuments({ status: 'reserved' }),
      BlindBagAccount.countDocuments({ status: 'disabled' })
    ]);

    return res.json({
      success: true,
      stats: {
        total,
        available,
        claimed,
        reserved,
        disabled
      }
    });
  } catch (error: any) {
    console.error('Error fetching blind bag account stats:', error);
    return res.status(500).json({ success: false, message: 'Lỗi tải thống kê kho ACC', error: error.message });
  }
};

router.get('/accounts/stats', authenticateToken, requireAdmin, handleGetStats);
router.get('/admin/stats', authenticateToken, requireAdmin, handleGetStats);
router.get('/stats', authenticateToken, requireAdmin, handleGetStats);

const handleListAccounts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, blindBagId, search } = req.query;

    const filter: any = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (blindBagId && blindBagId !== 'all') {
      filter.blindBagId = blindBagId;
    }
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim();
      filter.$or = [
        { username: { $regex: q, $options: 'i' } },
        { id: { $regex: q, $options: 'i' } },
        { claimedByName: { $regex: q, $options: 'i' } }
      ];
    }

    const accounts = await BlindBagAccount.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Mask passwords for table listing security
    const masked = (accounts || []).map((acc: any) => ({
      ...acc,
      password: '••••••••••'
    }));

    return res.json({
      success: true,
      data: masked,
      accounts: masked,
      total: masked.length
    });
  } catch (error: any) {
    console.error('Error listing blind bag accounts:', error);
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách tài khoản kho', error: error.message });
  }
};

router.get('/accounts', authenticateToken, requireAdmin, handleListAccounts);
router.get('/admin/accounts', authenticateToken, requireAdmin, handleListAccounts);

/**
 * GET /api/blind-bags/accounts/:id/reveal-password
 * Xem mật khẩu gốc của một ACC (Chỉ Admin mới có quyền)
 */
const handleRevealPassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const acc = await BlindBagAccount.findOne({ id });
    if (!acc) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản trong kho' });
    }

    return res.json({
      success: true,
      id: acc.id,
      username: acc.username,
      password: acc.password
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi truy xuất mật khẩu', error: error.message });
  }
};

router.get('/accounts/:id/reveal-password', authenticateToken, requireAdmin, handleRevealPassword);
router.get('/admin/accounts/:id/reveal-password', authenticateToken, requireAdmin, handleRevealPassword);

/**
 * POST /api/blind-bags/accounts/import
 * Nhập nhiều ACC cùng lúc (dạng text dòng: username | password)
 * Có báo cáo thống kê: thành công, trùng lặp, lỗi định dạng
 */
const handleBulkImport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { rawText, blindBagId, defaultStatus = 'available' } = req.body;

    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập danh sách tài khoản cần import.' });
    }

    if (!blindBagId) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn Túi mù cần gán ACC.' });
    }

    const lines = rawText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length === 0) {
      return res.status(400).json({ success: false, message: 'Không có dòng dữ liệu hợp lệ nào.' });
    }

    let successCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    const duplicates: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Hỗ trợ phân cách bằng '|', '\t', hoặc dấu cách nếu chia 2 từ
      let parts: string[] = [];
      if (line.includes('|')) {
        parts = line.split('|');
      } else if (line.includes('\t')) {
        parts = line.split('\t');
      } else if (line.includes(' - ')) {
        parts = line.split(' - ');
      } else if (line.includes(':') && !line.startsWith('http')) {
        parts = line.split(':');
      } else {
        parts = line.split(/\s+/);
      }

      if (parts.length < 2) {
        errorCount++;
        errors.push(`Dòng ${i + 1}: Sai định dạng (cần: TK | MK)`);
        continue;
      }

      const u = parts[0].trim();
      const p = parts.slice(1).join('|').trim();

      if (!u || !p) {
        errorCount++;
        errors.push(`Dòng ${i + 1}: Thiếu TK hoặc MK`);
        continue;
      }

      // Check trùng
      const existing = await BlindBagAccount.findOne({ username: u });
      if (existing) {
        duplicateCount++;
        duplicates.push(u);
        continue;
      }

      try {
        await BlindBagAccount.create({
          id: `bga_${Date.now()}_${Math.random().toString(36).substring(2, 6)}_${i}`,
          username: u,
          password: p,
          blindBagId,
          status: defaultStatus || 'available',
          notes: 'Imported bulk',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        successCount++;
      } catch (err: any) {
        errorCount++;
        errors.push(`Dòng ${i + 1} (${u}): ${err.message}`);
      }
    }

    return res.json({
      success: true,
      message: `Import hoàn tất: ${successCount} thành công, ${duplicateCount} trùng, ${errorCount} lỗi.`,
      stats: {
        totalProcessed: lines.length,
        successCount,
        duplicateCount,
        errorCount,
        duplicates,
        errors
      }
    });
  } catch (error: any) {
    console.error('Error importing bulk blind bag accounts:', error);
    return res.status(500).json({ success: false, message: 'Lỗi import danh sách tài khoản', error: error.message });
  }
};

router.post('/accounts/import', authenticateToken, requireAdmin, handleBulkImport);
router.post('/admin/import', authenticateToken, requireAdmin, handleBulkImport);
router.post('/import', authenticateToken, requireAdmin, handleBulkImport);

const handleAddSingleAccount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { username, password, blindBagId, status, notes } = req.body;

    if (!username || !username.trim() || !password || !password.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ Tên tài khoản (TK) và Mật khẩu (MK).' });
    }

    if (!blindBagId) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn Hạng Túi Mù tương ứng.' });
    }

    const cleanUsername = username.trim();
    const existing = await BlindBagAccount.findOne({ username: cleanUsername });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `ACC "${cleanUsername}" đã tồn tại trong kho túi mù.`
      });
    }

    const newAcc = await BlindBagAccount.create({
      id: `bga_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      username: cleanUsername,
      password: password.trim(),
      blindBagId,
      status: status || 'available',
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return res.status(201).json({
      success: true,
      message: `Đã thêm tài khoản "${cleanUsername}" vào kho Túi Mù thành công!`,
      account: {
        ...newAcc.toJSON(),
        password: '••••••••••'
      }
    });
  } catch (error: any) {
    console.error('Error adding single blind bag account:', error);
    return res.status(500).json({ success: false, message: 'Lỗi thêm tài khoản vào kho', error: error.message });
  }
};

router.post('/accounts', authenticateToken, requireAdmin, handleAddSingleAccount);
router.post('/admin/accounts', authenticateToken, requireAdmin, handleAddSingleAccount);

/**
 * PUT /api/blind-bags/accounts/:id
 * Cập nhật thông tin ACC (TK, MK, Túi mù gán, Trạng thái, Ghi chú)
 */
const handleUpdateAccount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { username, password, blindBagId, status, notes } = req.body;

    const acc = await BlindBagAccount.findOne({ id });
    if (!acc) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản trong kho' });
    }

    if (username && username.trim() !== acc.username) {
      const cleanUsername = username.trim();
      const existing = await BlindBagAccount.findOne({ username: cleanUsername, id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ success: false, message: `Tên tài khoản "${cleanUsername}" đã tồn tại ở bản ghi khác.` });
      }
      acc.username = cleanUsername;
    }

    if (password && password.trim()) {
      acc.password = password.trim();
    }

    if (blindBagId !== undefined) {
      acc.blindBagId = blindBagId;
    }

    if (status !== undefined) {
      acc.status = status;
    }

    if (notes !== undefined) {
      acc.notes = notes;
    }

    acc.updatedAt = new Date().toISOString();
    await acc.save();

    return res.json({
      success: true,
      message: 'Đã cập nhật thông tin tài khoản kho thành công!',
      account: {
        ...acc.toJSON(),
        password: '••••••••••'
      }
    });
  } catch (error: any) {
    console.error('Error updating blind bag account:', error);
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật tài khoản', error: error.message });
  }
};

router.put('/accounts/:id', authenticateToken, requireAdmin, handleUpdateAccount);
router.patch('/accounts/:id', authenticateToken, requireAdmin, handleUpdateAccount);
router.put('/admin/accounts/:id', authenticateToken, requireAdmin, handleUpdateAccount);
router.patch('/admin/accounts/:id', authenticateToken, requireAdmin, handleUpdateAccount);

const handleDeleteAccount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const acc = await BlindBagAccount.findOne({ id });
    if (!acc) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản' });
    }

    if (acc.status === 'claimed') {
      return res.status(400).json({
        success: false,
        message: 'Không thể xoá tài khoản ĐÃ TRAO cho người dùng vì sẽ phá vỡ lịch sử đối soát giao dịch. Bạn chỉ có thể chỉnh sửa ghi chú hoặc đổi trạng thái nếu cần!'
      });
    }

    await BlindBagAccount.findOneAndDelete({ id });
    return res.json({
      success: true,
      message: `Đã xoá tài khoản "${acc.username}" khỏi kho Túi Mù!`
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi xoá tài khoản', error: error.message });
  }
};

router.delete('/accounts/:id', authenticateToken, requireAdmin, handleDeleteAccount);
router.delete('/admin/accounts/:id', authenticateToken, requireAdmin, handleDeleteAccount);

const handleListClaims = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { blindBagId, search } = req.query;
    const filter: any = {};
    if (blindBagId && blindBagId !== 'all') {
      filter.blindBagId = blindBagId;
    }
    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { username: { $regex: q, $options: 'i' } },
        { userName: { $regex: q, $options: 'i' } },
        { userId: { $regex: q, $options: 'i' } }
      ];
    }

    const claims = await BlindBagClaim.find(filter).sort({ claimedAt: -1 }).limit(100).lean();
    return res.json({
      success: true,
      data: claims,
      claims,
      total: claims.length
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải lịch sử nhận ACC', error: error.message });
  }
};

router.get('/claims', authenticateToken, requireAdmin, handleListClaims);
router.get('/admin/claims', authenticateToken, requireAdmin, handleListClaims);

// ========================================================
// 2. USER OPEN BLIND BAG API (MỞ TÚI MÙ THẬT TỪ KHO ACC)
// ========================================================

/**
 * POST /api/blind-bags/open hoặc POST /api/blind-bags/:id/open
 * Luồng chuẩn theo User Request:
 * 1. Xác thực người dùng
 * 2. Kiểm tra chương trình Túi mù có đang mở không
 * 3. Tìm túi mù tương ứng
 * 4. Kiểm tra số dư hoặc lượt mở miễn phí
 * 5. Atomically chọn 1 ACC trong kho BlindBagAccount có status = "available" & blindBagId = túi hiện tại
 *    Sử dụng findOneAndUpdate atomically để chống race condition khi 2 người mở cùng lúc!
 * 6. Nếu hết ACC (available = 0) -> return OUT_OF_STOCK (Tuyệt đối không random / fake TK/MK)
 * 7. Trừ tiền số dư ví người dùng (nếu không dùng free turn)
 * 8. Ghi log BlindBagClaim, UserInventory, WalletTransaction, MysteryHistory, Notification
 * 9. Trả kết quả chính xác TK + MK của ACC đó!
 */
const handleOpenBlindBagAccount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const blindBagId = req.params.id || req.body?.blindBagId || req.body?.boxTierId || req.body?.id;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để mở Túi Mù.' });
    }

    // 1. Kiểm tra sự kiện
    const setting = await Setting.findOne({
      key: { $in: ['mystery_box_active', 'mystery_box_event_active'] }
    });
    if (setting && setting.value === false) {
      return res.status(400).json({
        success: false,
        message: 'Chương trình Xé Túi Mù hiện đang tạm đóng. Vui lòng quay lại sau!'
      });
    }

    // 2. Tìm thông tin Túi mù
    let box = await MysteryBox.findOne({
      $or: [{ id: blindBagId }, { tier: blindBagId }]
    });
    if (!box) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin gói Túi Mù này.'
      });
    }

    if (box.isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'Hạng Túi Mù này đang tạm dừng hoạt động.'
      });
    }

    // 3. Kiểm tra user & số dư ví
    let user = await User.findOne({ id: userId });
    if (!user) {
      user = await User.create({
        id: userId,
        name: req.user?.email ? req.user.email.split('@')[0] : 'Thành Viên',
        email: req.user?.email || `user_${userId}@lqmarket.vn`,
        role: 'buyer',
        balance: 500000,
        createdAt: new Date().toISOString()
      });
    }

    const isFreeTurn = Boolean(req.body?.isFreeTurn || req.body?.useFreeTurn);
    const boxPrice = isFreeTurn ? 0 : box.price;

    if (!isFreeTurn && user.balance < boxPrice) {
      return res.status(400).json({
        success: false,
        message: `Số dư không đủ để mở túi này. Cần ${boxPrice.toLocaleString('vi-VN')}đ, số dư hiện tại: ${user.balance.toLocaleString('vi-VN')}đ.`,
        errorCode: 'INSUFFICIENT_BALANCE',
        requiredAmount: boxPrice,
        currentBalance: user.balance
      });
    }

    // 4. ATOMICALLY CHỌN VÀ GIỮ ACC TRONG KHO BLINDBAGACCOUNT
    // Khớp theo box.id hoặc box.tier (ví dụ: 'box_bronze' hoặc 'bronze' hoặc 'blindbag_1000')
    const candidateBagIds = [box.id, box.tier];
    if (box.price === 1000) candidateBagIds.push('blindbag_1000');
    if (box.price === 5000) candidateBagIds.push('blindbag_5000');
    if (box.price === 10000) candidateBagIds.push('blindbag_10000');
    if (box.price === 19000 || box.price === 20000) candidateBagIds.push('blindbag_20000', 'box_bronze');

    const nowIso = new Date().toISOString();

    // Dùng findOneAndUpdate atomic để đảm bảo nếu 2 người mở cùng lúc thì không bao giờ nhận trùng ACC!
    const claimedAccount = await BlindBagAccount.findOneAndUpdate(
      {
        blindBagId: { $in: candidateBagIds },
        status: 'available'
      },
      {
        $set: {
          status: 'claimed',
          claimedBy: user.id,
          claimedByName: user.name || user.email,
          claimedAt: nowIso,
          updatedAt: nowIso
        }
      },
      { new: true }
    );

    // 5. NẾU HẾT ACC TRONG KHO (available = 0)
    if (!claimedAccount) {
      return res.status(400).json({
        success: false,
        code: 'OUT_OF_STOCK',
        message: 'Kho tài khoản phần thưởng hiện đã hết. Vui lòng quay lại sau!'
      });
    }

    // 6. TRỪ TIỀN VÍ
    if (boxPrice > 0) {
      user.balance -= boxPrice;
      await user.save();

      // Ghi lịch sử giao dịch ví
      const tx = new WalletTransaction({
        id: `tx_bga_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        type: 'purchase',
        amount: -boxPrice,
        status: 'success',
        note: `Mở Túi Mù: ${box.name} (Nhận Acc #${claimedAccount.username})`,
        createdAt: nowIso
      });
      await tx.save();
    }

    // 7. GHI LỊCH SỬ NHẬN ACC (BlindBagClaim)
    const claimRecord = new BlindBagClaim({
      id: `bbc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: user.id,
      userName: user.name || user.email,
      blindBagId: box.id,
      blindBagAccountId: claimedAccount.id,
      username: claimedAccount.username,
      claimedAt: nowIso,
      status: 'success'
    });
    await claimRecord.save();

    // 8. TỰ ĐỘNG LƯU VÀO USER INVENTORY (Kho đồ của User để xem lại bất kỳ lúc nào)
    const inventoryItem = new UserInventory({
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: user.id,
      source: 'mystery_box',
      rewardType: 'account',
      title: `Acc Liên Quân: ${claimedAccount.username}`,
      value: box.price,
      rarity: 'epic',
      accountData: {
        rank: 'Tinh Anh',
        heroesCount: 40,
        skinsCount: 25,
        credentials: {
          username: claimedAccount.username,
          password: claimedAccount.password,
          securityType: 'Trắng Thông Tin',
          secretNotes: claimedAccount.notes || 'Tài khoản nhận từ kho Túi Mù'
        }
      },
      isUsed: false,
      receivedAt: nowIso
    });
    await inventoryItem.save();

    // 9. GHI VÀO LỊCH SỬ MỞ TÚI CHUNG (MysteryHistory) ĐỂ BẢNG FEED CẬP NHẬT
    const historyItem = new MysteryHistory({
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      boxTierId: box.tier || box.id,
      boxName: box.name,
      rewardId: claimedAccount.id,
      rewardType: 'account',
      rewardTitle: `Acc Liên Quân: ${claimedAccount.username}`,
      rewardValue: box.price,
      rewardRarity: 'epic',
      accountDelivered: {
        username: claimedAccount.username,
        password: claimedAccount.password,
        securityType: 'Trắng Thông Tin',
        secretNotes: claimedAccount.notes || 'Tài khoản nhận từ kho Túi Mù'
      },
      openedAt: nowIso
    });
    await historyItem.save();

    // 10. TĂNG TOTAL OPENED CỦA TÚI MÙ
    box.totalOpened = (box.totalOpened || 0) + 1;
    await box.save();

    // 11. GỬI THÔNG BÁO CHO USER
    const notif = new Notification({
      id: `notif_${Date.now()}`,
      userId: user.id,
      title: 'Chúc mừng mở Túi Mù thành công!',
      message: `Bạn vừa mở ${box.name} và nhận được tài khoản Liên Quân: ${claimedAccount.username}. Xem thông tin đăng nhập trong Kho Đồ!`,
      type: 'system',
      createdAt: nowIso
    });
    await notif.save();

    // 12. TRẢ KẾT QUẢ ĐÚNG TK + MK THẬT TỪ DATABASE
    return res.json({
      success: true,
      message: `🎉 CHÚC MỪNG! Bạn đã nhận được tài khoản Liên Quân: ${claimedAccount.username}!`,
      reward: {
        id: claimedAccount.id,
        accountId: claimedAccount.id,
        type: 'account',
        title: `Tài Khoản Liên Quân [${claimedAccount.username}]`,
        username: claimedAccount.username,
        password: claimedAccount.password,
        value: box.price,
        rarity: 'epic',
        accountData: {
          rank: 'Tinh Anh',
          heroesCount: 40,
          skinsCount: 25,
          credentials: {
            username: claimedAccount.username,
            password: claimedAccount.password,
            securityType: 'Trắng Thông Tin',
            secretNotes: claimedAccount.notes || ''
          }
        }
      },
      newBalance: user.balance
    });
  } catch (error: any) {
    console.error('Error opening blind bag account:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi mở Túi Mù.',
      error: error.message
    });
  }
};

router.post('/open', authenticateToken, handleOpenBlindBagAccount);
router.post('/open/:id', authenticateToken, handleOpenBlindBagAccount);
router.post('/:id/open', authenticateToken, handleOpenBlindBagAccount);

export default router;
