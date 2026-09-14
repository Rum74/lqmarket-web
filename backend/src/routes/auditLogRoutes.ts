import { Router, Response } from 'express';
import { AuditLog } from '../models/AuditLog';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/admin/audit-logs
 * List all admin audit actions
 */
router.get('/', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(200).lean();
    return res.json({ success: true, data: logs, logs, auditLogs: logs });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải nhật ký hoạt động' });
  }
});

/**
 * POST /api/admin/audit-logs
 * Record an audit log
 */
router.post('/', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { action, targetType, targetId, details } = req.body;
    if (!action || !details) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin nhật ký' });
    }

    const log = new AuditLog({
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      adminId: req.user?.userId || 'admin',
      adminName: req.user?.username || 'Admin',
      action,
      targetType: targetType || 'general',
      targetId: targetId || '',
      details,
      timestamp: new Date().toISOString()
    });

    await log.save();
    return res.status(201).json({ success: true, log: log.toJSON(), data: log.toJSON() });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi lưu nhật ký' });
  }
});

export default router;
