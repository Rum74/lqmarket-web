import { Router, Response } from 'express';
import { AuditLog } from '../models/AuditLog';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'log_init_01',
    adminId: 'user_admin_super',
    adminName: 'Super Admin',
    action: 'SYSTEM_INIT',
    targetType: 'system',
    targetId: 'sys_init',
    details: 'Khởi động hệ thống sàn giao dịch LQMarket thành công',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'log_init_02',
    adminId: 'user_admin_super',
    adminName: 'Super Admin',
    action: 'UPDATE_SETTINGS',
    targetType: 'system',
    targetId: 'settings',
    details: 'Đồng bộ cấu hình cổng thanh toán và phí bảo hiểm Escrow',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

export async function ensureAuditLogsSeeded() {
  try {
    const count = await AuditLog.countDocuments();
    if (count === 0) {
      for (const item of INITIAL_AUDIT_LOGS) {
        await AuditLog.create(item);
      }
    }
  } catch (err) {
    console.warn('[AuditLog] Seeding error:', err);
  }
}

ensureAuditLogsSeeded();

/**
 * GET /api/admin/audit-logs
 * List all admin audit actions
 */
router.get('/', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await ensureAuditLogsSeeded();
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
    const { action, targetType, targetId, details, amount } = req.body;
    if (!action || !details) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin nhật ký' });
    }

    const log = new AuditLog({
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      adminId: req.user?.userId || 'admin',
      adminName: req.user?.username || req.user?.name || 'Admin',
      action,
      targetType: targetType || 'general',
      targetId: targetId || '',
      details,
      amount: typeof amount === 'number' ? amount : undefined,
      timestamp: new Date().toISOString()
    });

    await log.save();
    return res.status(201).json({ success: true, log: log.toJSON(), data: log.toJSON() });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi lưu nhật ký' });
  }
});

export default router;
