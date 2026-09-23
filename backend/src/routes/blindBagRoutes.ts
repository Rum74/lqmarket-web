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
import { executeOpenBlindBag } from '../services/blindBagService';
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
    const { rawText, blindBagId, defaultStatus = 'available', overwrite = false } = req.body;
    const isOverwrite = overwrite === true || overwrite === 'true' || overwrite === 1 || overwrite === '1';

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
      let u = '';
      let p = '';

      if (line.includes('|')) {
        const idx = line.indexOf('|');
        u = line.substring(0, idx).trim();
        p = line.substring(idx + 1).trim();
      } else if (line.includes('\t')) {
        const idx = line.indexOf('\t');
        u = line.substring(0, idx).trim();
        p = line.substring(idx + 1).trim();
      } else if (line.includes('---')) {
        const idx = line.indexOf('---');
        u = line.substring(0, idx).trim();
        p = line.substring(idx + 3).trim();
      } else if (line.includes(' - ')) {
        const idx = line.indexOf(' - ');
        u = line.substring(0, idx).trim();
        p = line.substring(idx + 3).trim();
      } else if (line.includes(':') && !line.startsWith('http')) {
        const idx = line.indexOf(':');
        u = line.substring(0, idx).trim();
        p = line.substring(idx + 1).trim();
      } else if (line.includes('/') && !line.startsWith('http')) {
        const idx = line.indexOf('/');
        u = line.substring(0, idx).trim();
        p = line.substring(idx + 1).trim();
      } else if (line.includes(';')) {
        const idx = line.indexOf(';');
        u = line.substring(0, idx).trim();
        p = line.substring(idx + 1).trim();
      } else if (line.includes(',')) {
        const idx = line.indexOf(',');
        u = line.substring(0, idx).trim();
        p = line.substring(idx + 1).trim();
      } else {
        const parts = line.split(/\s+/);
        u = (parts[0] || '').trim();
        p = parts.slice(1).join(' ').trim();
      }

      if (!u || !p) {
        errorCount++;
        errors.push(`Dòng ${i + 1}: Sai định dạng hoặc thiếu thông tin (cần: TK | MK)`);
        continue;
      }

      // Check trùng
      const existing = await BlindBagAccount.findOne({ username: u });
      if (existing) {
        if (isOverwrite) {
          existing.password = p;
          existing.blindBagId = blindBagId;
          existing.status = defaultStatus || 'available';
          existing.claimedBy = null;
          existing.claimedByName = null;
          existing.claimedAt = null;
          existing.notes = `Cập nhật ghi đè ngày ${new Date().toLocaleDateString('vi-VN')}`;
          existing.updatedAt = new Date().toISOString();
          await existing.save();
          successCount++;
          continue;
        } else {
          duplicateCount++;
          duplicates.push(u);
          continue;
        }
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
      message: `Import hoàn tất: ${successCount} thành công, ${duplicateCount} trùng lặp, ${errorCount} lỗi.`,
      stats: {
        totalProcessed: lines.length,
        successCount,
        inserted: successCount,
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
 */
const handleOpenBlindBagAccount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const blindBagId = req.params.id || req.body?.blindBagId || req.body?.boxTierId || req.body?.id;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để mở Túi Mù.' });
    }

    const useFreeTurn = Boolean(req.body?.isFreeTurn || req.body?.useFreeTurn);
    const result = await executeOpenBlindBag({
      userId,
      bagId: blindBagId,
      useFreeTurn
    });

    if (!result.success) {
      const statusCode = result.code === 'INSUFFICIENT_BALANCE' ? 400 :
                         result.code === 'OUT_OF_STOCK' ? 400 :
                         result.code === 'BOX_NOT_FOUND' ? 404 : 400;
      return res.status(statusCode).json(result);
    }

    return res.json(result);
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
