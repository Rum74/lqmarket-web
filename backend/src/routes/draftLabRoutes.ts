import { Router, Response } from 'express';
import { authenticateToken, requireAdmin, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { DraftHero } from '../models/DraftHero';
import { DraftAnalysis } from '../models/DraftAnalysis';
import { DraftSetting } from '../models/DraftSetting';
import { INITIAL_DRAFT_HEROES } from '../data/draftHeroesData.js';
import { compareTeams, evaluateTeam, DISCLAIMER_TEXT } from '../services/draftAnalysisService.js';
import { DraftHero as IDraftHeroType } from '../types/draftLab.js';

const router = Router();

// Helper to get or init draft settings
async function getSettingsDoc() {
  try {
    let settings = await DraftSetting.findOne({ id: 'default_draft_settings' }).lean();
    if (!settings) {
      settings = await DraftSetting.create({
        id: 'default_draft_settings',
        enabled: true,
        allowDuplicatesBetweenTeams: false,
        maxSavedDraftsFree: 10,
        maxSavedDraftsPremium: 100,
        announcementNotice:
          'LQ Draft Lab – Phòng phân tích đội hình Liên Quân Mobile chính thức hoạt động! Phân tích chiến thuật & so sánh đội hình chuẩn xác.'
      });
    }
    return settings;
  } catch (err) {
    return {
      id: 'default_draft_settings',
      enabled: true,
      allowDuplicatesBetweenTeams: false,
      maxSavedDraftsFree: 10,
      maxSavedDraftsPremium: 100,
      announcementNotice: ''
    };
  }
}

// ==========================================
// 1. PUBLIC ROUTES
// ==========================================

/**
 * GET /api/draft-lab/status
 * Check if Draft Lab is enabled & return active settings
 */
router.get('/status', async (_req, res: Response) => {
  try {
    const settings = await getSettingsDoc();
    return res.json({
      success: true,
      data: {
        enabled: settings.enabled ?? true,
        allowDuplicatesBetweenTeams: settings.allowDuplicatesBetweenTeams ?? false,
        maxSavedDraftsFree: settings.maxSavedDraftsFree ?? 10,
        announcementNotice: settings.announcementNotice || '',
        disclaimer: DISCLAIMER_TEXT
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Không thể kiểm tra trạng thái LQ Draft Lab',
      error: error.message
    });
  }
});

/**
 * GET /api/draft-lab/heroes
 * Returns active heroes list (database custom/overrides merged with initial defaults)
 */
router.get('/heroes', async (_req, res: Response) => {
  try {
    const dbHeroes = await DraftHero.find({ isActive: true }).lean();

    // Map by ID so admin DB overrides take precedence over hardcoded defaults
    const heroMap = new Map<string, any>();
    for (const h of INITIAL_DRAFT_HEROES) {
      heroMap.set(h.id, h);
    }
    for (const dbH of dbHeroes) {
      heroMap.set(dbH.id, { ...heroMap.get(dbH.id), ...dbH });
    }

    const allHeroes = Array.from(heroMap.values());

    return res.json({
      success: true,
      count: allHeroes.length,
      data: allHeroes
    });
  } catch (error: any) {
    console.error('Error fetching draft heroes:', error);
    // Graceful fallback to initial dataset
    return res.json({
      success: true,
      count: INITIAL_DRAFT_HEROES.length,
      data: INITIAL_DRAFT_HEROES
    });
  }
});

/**
 * POST /api/draft-lab/analyze
 * Pure tactical analysis. Guest or logged in.
 */
router.post('/analyze', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { teamA, teamB, teamAName, teamBName, saveToHistory } = req.body;

    if (!Array.isArray(teamA) || !Array.isArray(teamB)) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu đội hình Đội A và Đội B không hợp lệ.'
      });
    }

    const result = compareTeams(
      teamA as IDraftHeroType[],
      teamB as IDraftHeroType[],
      teamAName || 'Đội A (Xanh)',
      teamBName || 'Đội B (Đỏ)'
    );

    // If user is authenticated and asks to log to history
    if (req.user && saveToHistory) {
      try {
        await DraftAnalysis.create({
          id: result.id,
          userId: req.user.userId,
          userEmail: req.user.email,
          userName: req.user.name || req.user.username || '',
          title: result.title,
          teamAName: result.teamAName,
          teamBName: result.teamBName,
          teamAHeroIds: teamA.map((h: any) => h.id),
          teamBHeroIds: teamB.map((h: any) => h.id),
          teamAHeroes: teamA,
          teamBHeroes: teamB,
          evaluationA: result.evalA,
          evaluationB: result.evalB,
          headToHead: result.headToHead,
          isSaved: false
        });
      } catch (logErr) {
        console.warn('Could not auto-log draft analysis history:', logErr);
      }
    }

    return res.json({
      success: true,
      disclaimer: DISCLAIMER_TEXT,
      data: result
    });
  } catch (error: any) {
    console.error('Error in /api/draft-lab/analyze:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi trong quá trình phân tích chiến thuật.',
      error: error.message
    });
  }
});

/**
 * GET /api/draft-lab/share/:id
 * Retrieve shared analysis by ID
 */
router.get('/share/:id', async (req, res: Response) => {
  try {
    const { id } = req.params;
    const analysis = await DraftAnalysis.findOne({ id }).lean();

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy kết quả phân tích hoặc liên kết đã hết hạn.'
      });
    }

    // Increment view count asynchronously
    DraftAnalysis.updateOne({ id }, { $inc: { viewCount: 1 } }).catch(() => {});

    return res.json({
      success: true,
      disclaimer: DISCLAIMER_TEXT,
      data: analysis
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi tải liên kết chia sẻ.',
      error: error.message
    });
  }
});

// ==========================================
// 2. AUTHENTICATED USER ROUTES
// ==========================================

/**
 * POST /api/draft-lab/save
 * Save a team draft & analysis into user's profile
 */
router.post('/save', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập.' });
    }

    const {
      title,
      teamA,
      teamB,
      teamAName,
      teamBName,
      evalA,
      evalB,
      headToHead
    } = req.body;

    if (!Array.isArray(teamA) || teamA.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Đội hình chưa có tướng nào để lưu.'
      });
    }

    // Check saved limit
    const settings = await getSettingsDoc();
    const maxSaved = settings.maxSavedDraftsFree ?? 10;
    const currentSavedCount = await DraftAnalysis.countDocuments({ userId, isSaved: true });

    if (currentSavedCount >= maxSaved) {
      return res.status(403).json({
        success: false,
        message: `Bạn đã đạt giới hạn lưu tối đa (${maxSaved} đội hình) của gói tiêu chuẩn. Hãy xóa bớt đội hình cũ để lưu thêm.`
      });
    }

    const draftId = `saved_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const savedDoc = await DraftAnalysis.create({
      id: draftId,
      userId,
      userEmail: req.user?.email || '',
      userName: req.user?.name || req.user?.username || '',
      title: title?.trim() || `${teamAName || 'Đội A'} vs ${teamBName || 'Đội B'}`,
      teamAName: teamAName || 'Đội A (Xanh)',
      teamBName: teamBName || 'Đội B (Đỏ)',
      teamAHeroIds: teamA.map((h: any) => h.id),
      teamBHeroIds: (teamB || []).map((h: any) => h.id),
      teamAHeroes: teamA,
      teamBHeroes: teamB || [],
      evaluationA: evalA || null,
      evaluationB: evalB || null,
      headToHead: headToHead || null,
      isSaved: true
    });

    return res.json({
      success: true,
      message: 'Đã lưu đội hình và kết quả phân tích thành công!',
      data: savedDoc
    });
  } catch (error: any) {
    console.error('Error saving draft:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể lưu đội hình.',
      error: error.message
    });
  }
});

/**
 * GET /api/draft-lab/saved
 * List user's saved drafts
 */
router.get('/saved', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const saved = await DraftAnalysis.find({ userId, isSaved: true })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.json({
      success: true,
      count: saved.length,
      data: saved
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách đội hình đã lưu.',
      error: error.message
    });
  }
});

/**
 * DELETE /api/draft-lab/saved/:id
 * Delete user's saved draft
 */
router.delete('/saved/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const existing = await DraftAnalysis.findOne({ id }).lean();
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Đội hình không tồn tại.' });
    }

    if (existing.userId !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa đội hình này.' });
    }

    await DraftAnalysis.deleteOne({ id });

    return res.json({
      success: true,
      message: 'Đã xóa đội hình khỏi danh sách đã lưu.'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Không thể xóa đội hình.',
      error: error.message
    });
  }
});

/**
 * GET /api/draft-lab/history
 * List user's recent analysis history
 */
router.get('/history', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const history = await DraftAnalysis.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return res.json({
      success: true,
      data: history
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Không thể tải lịch sử phân tích.',
      error: error.message
    });
  }
});

// ==========================================
// 3. ADMIN MANAGEMENT ROUTES
// ==========================================

/**
 * GET /api/draft-lab/admin/stats
 * Admin dashboard overview stats
 */
router.get('/admin/stats', authenticateToken, requireAdmin, async (_req, res: Response) => {
  try {
    const [totalAnalyses, totalSaved, recentAnalyses, dbHeroes] = await Promise.all([
      DraftAnalysis.countDocuments({}),
      DraftAnalysis.countDocuments({ isSaved: true }),
      DraftAnalysis.find({}).sort({ createdAt: -1 }).limit(10).lean(),
      DraftHero.find({}).lean()
    ]);

    const settings = await getSettingsDoc();

    // Role breakdown
    const roleBreakdown: Record<string, number> = {
      'Đấu sĩ': 0,
      'Pháp sư': 0,
      'Xạ thủ': 0,
      'Sát thủ': 0,
      'Đỡ đòn': 0,
      'Trợ thủ': 0
    };

    let missingAvatarCount = 0;
    let missingInfoCount = 0;

    for (const h of dbHeroes) {
      if (roleBreakdown[h.role] !== undefined) {
        roleBreakdown[h.role]++;
      }
      if (!h.avatar || h.avatar.includes('placeholder')) {
        missingAvatarCount++;
      }
      if (!h.notes && !h.signatureSkill) {
        missingInfoCount++;
      }
    }

    // Missing compared to official roster
    const dbNames = new Set(dbHeroes.map(h => h.name.toLowerCase().trim()));
    const missingOfficialCount = INITIAL_DRAFT_HEROES.filter(
      h => !dbNames.has(h.name.toLowerCase().trim())
    ).length;

    return res.json({
      success: true,
      data: {
        totalAnalyses,
        totalSaved,
        totalCustomHeroes: dbHeroes.length,
        totalOfficialHeroes: INITIAL_DRAFT_HEROES.length,
        missingOfficialCount,
        roleBreakdown,
        missingAvatarCount,
        missingInfoCount,
        lastDataSync: '01/11/2026',
        dataSource: 'Garena Liên Quân Mobile Việt Nam (01/11/2026)',
        settings,
        recentAnalyses
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi tải thống kê quản trị LQ Draft Lab.',
      error: error.message
    });
  }
});

/**
 * GET /api/draft-lab/admin/heroes/missing
 * Return heroes from official roster not yet in database
 */
router.get('/admin/heroes/missing', authenticateToken, requireAdmin, async (_req, res: Response) => {
  try {
    const dbHeroes = await DraftHero.find({}).lean();
    const existingIds = new Set(dbHeroes.map(h => h.id));
    const existingNames = new Set(dbHeroes.map(h => h.name.toLowerCase().trim()));

    const missingHeroes = INITIAL_DRAFT_HEROES.filter(
      h => !existingIds.has(h.id) && !existingNames.has(h.name.toLowerCase().trim())
    );

    return res.json({
      success: true,
      count: missingHeroes.length,
      totalOfficialHeroes: INITIAL_DRAFT_HEROES.length,
      totalInDb: dbHeroes.length,
      data: missingHeroes
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Không thể kiểm tra danh sách tướng còn thiếu.',
      error: error.message
    });
  }
});

/**
 * POST /api/draft-lab/admin/heroes/batch
 * Bulk add or sync heroes with duplicate prevention and retry support
 */
router.post('/admin/heroes/batch', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { heroes, skipExisting = true, updateExisting = false } = req.body;
    if (!Array.isArray(heroes) || heroes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách tướng cung cấp không hợp lệ hoặc đang trống.'
      });
    }

    const dbHeroes = await DraftHero.find({}).lean();
    const existingMapById = new Map<string, any>();
    const existingMapByName = new Map<string, any>();
    for (const h of dbHeroes) {
      existingMapById.set(h.id, h);
      existingMapByName.set(h.name.toLowerCase().trim(), h);
    }

    let addedCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;
    const errors: { index: number; heroName: string; reason: string }[] = [];
    const addedList: any[] = [];

    for (let i = 0; i < heroes.length; i++) {
      const item = heroes[i];
      if (!item || !item.name || !item.name.trim()) {
        errors.push({ index: i, heroName: item?.name || 'Vô danh', reason: 'Tên tướng không được để trống' });
        continue;
      }
      if (!item.role) {
        errors.push({ index: i, heroName: item.name, reason: 'Vai trò chính là bắt buộc' });
        continue;
      }

      const normalizedName = item.name.toLowerCase().trim();
      const existing = existingMapById.get(item.id) || existingMapByName.get(normalizedName);

      if (existing) {
        if (skipExisting && !updateExisting) {
          skippedCount++;
          continue;
        }
        if (updateExisting) {
          await DraftHero.updateOne(
            { id: existing.id },
            {
              $set: {
                ...item,
                id: existing.id,
                notes: existing.notes || item.notes || '',
                tacticalNotes: existing.tacticalNotes || item.tacticalNotes || '',
                updatedAt: new Date().toISOString()
              }
            }
          );
          updatedCount++;
          continue;
        }
        skippedCount++;
        continue;
      }

      // Create new record
      try {
        const heroId =
          item.id ||
          `hero_${normalizedName.replace(/[^a-z0-9]/g, '_')}_${Math.random().toString(36).substring(2, 6)}`;
        const created = await DraftHero.create({
          ...item,
          id: heroId,
          name: item.name.trim(),
          title: item.title || '',
          role: item.role,
          secondaryRoles: Array.isArray(item.secondaryRoles)
            ? item.secondaryRoles
            : item.secondaryRole
            ? [item.secondaryRole]
            : [],
          playstyles: Array.isArray(item.playstyles) ? item.playstyles : [],
          primaryLane: item.primaryLane || 'Caesar',
          secondaryLanes: Array.isArray(item.secondaryLanes)
            ? item.secondaryLanes
            : item.secondaryLane
            ? [item.secondaryLane]
            : [],
          damageType: item.damageType || 'Vật lý',
          avatar:
            item.avatar ||
            'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=80',
          ratings: {
            tankiness: item.ratings?.tankiness ?? 5,
            damage: item.ratings?.damage ?? 5,
            crowdControl: item.ratings?.crowdControl ?? 5,
            engage: item.ratings?.engage ?? 5,
            peel: item.ratings?.peel ?? 5,
            mobility: item.ratings?.mobility ?? 5,
            earlyGame: item.ratings?.earlyGame ?? 5,
            lateGame: item.ratings?.lateGame ?? 5
          },
          signatureSkill: item.signatureSkill || '',
          counters: Array.isArray(item.counters) ? item.counters : [],
          synergies: Array.isArray(item.synergies) ? item.synergies : [],
          tags: Array.isArray(item.tags) ? item.tags : [],
          difficulty: item.difficulty || 'Trung bình',
          isActive: item.isActive !== false,
          notes: item.notes || '',
          tacticalNotes: item.tacticalNotes || item.notes || '',
          dataSource: item.dataSource || 'Garena Liên Quân Mobile VN (01/11/2026)',
          lastUpdated: new Date().toISOString()
        });

        existingMapById.set(created.id, created);
        existingMapByName.set(normalizedName, created);
        addedCount++;
        addedList.push(created);
      } catch (err: any) {
        errors.push({ index: i, heroName: item.name, reason: err.message || 'Lỗi thêm vào cơ sở dữ liệu' });
      }
    }

    const totalInDb = await DraftHero.countDocuments({});

    return res.json({
      success: true,
      message: `Đã xử lý danh sách: Thêm mới ${addedCount}, Bỏ qua ${skippedCount} trùng lặp, Lỗi ${errors.length}.`,
      addedCount,
      skippedCount,
      updatedCount,
      errorCount: errors.length,
      errors,
      totalInDb
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Không thể thêm danh sách tướng hàng loạt.',
      error: error.message
    });
  }
});

/**
 * GET /api/draft-lab/admin/heroes/check-duplicates
 * Check for duplicate heroes by name or id
 */
router.get('/admin/heroes/check-duplicates', authenticateToken, requireAdmin, async (_req, res: Response) => {
  try {
    const dbHeroes = await DraftHero.find({}).lean();
    const nameMap = new Map<string, any[]>();
    for (const h of dbHeroes) {
      const norm = h.name.toLowerCase().trim();
      const list = nameMap.get(norm) || [];
      list.push(h);
      nameMap.set(norm, list);
    }

    const duplicates: { name: string; count: number; items: any[] }[] = [];
    for (const [name, list] of nameMap.entries()) {
      if (list.length > 1) {
        duplicates.push({ name, count: list.length, items: list });
      }
    }

    return res.json({
      success: true,
      duplicateCount: duplicates.length,
      duplicates
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Không thể kiểm tra dữ liệu trùng lặp.',
      error: error.message
    });
  }
});

/**
 * POST /api/draft-lab/admin/hero
 * Add or update hero
 */
router.post('/admin/hero', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const heroData = req.body;
    if (!heroData.name || !heroData.role || !heroData.primaryLane) {
      return res.status(400).json({
        success: false,
        message: 'Tên tướng, vai trò và đường đi là bắt buộc.'
      });
    }

    const heroId = heroData.id || `hero_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const updated = await DraftHero.findOneAndUpdate(
      { id: heroId },
      {
        ...heroData,
        id: heroId,
        updatedAt: new Date().toISOString()
      },
      { upsert: true, new: true }
    );

    return res.json({
      success: true,
      message: `Đã lưu thông tin tướng ${heroData.name} thành công!`,
      data: updated
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Không thể lưu thông tin tướng.',
      error: error.message
    });
  }
});

/**
 * DELETE /api/draft-lab/admin/hero/:id
 * Delete or disable hero
 */
router.delete('/admin/hero/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await DraftHero.deleteOne({ id });

    return res.json({
      success: true,
      message: `Đã xóa tướng có mã ${id} khỏi cơ sở dữ liệu.`
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Không thể xóa tướng.',
      error: error.message
    });
  }
});

/**
 * POST /api/draft-lab/admin/settings
 * Update settings (enabled toggle, rules, limits)
 */
router.post('/admin/settings', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const settingsData = req.body;

    const updated = await DraftSetting.findOneAndUpdate(
      { id: 'default_draft_settings' },
      {
        ...settingsData,
        updatedAt: new Date().toISOString()
      },
      { upsert: true, new: true }
    );

    return res.json({
      success: true,
      message: 'Đã cập nhật cấu hình LQ Draft Lab thành công!',
      data: updated
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Không thể cập nhật cấu hình.',
      error: error.message
    });
  }
});

export default router;
