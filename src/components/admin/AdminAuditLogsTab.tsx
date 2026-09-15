import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/apiClient';
import { AdminAuditLog } from '../../types';
import { ShieldAlert, Search, Filter, Clock, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';

export const AdminAuditLogsTab: React.FC = () => {
  const { adminAuditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dbLogs, setDbLogs] = useState<AdminAuditLog[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/admin/audit-logs');
      if (res && res.success) {
        const list = res.logs || res.data || res.auditLogs;
        if (Array.isArray(list)) {
          setDbLogs(list);
        }
      }
    } catch (err) {
      console.warn('Could not fetch audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const rawLogs = dbLogs !== null ? dbLogs : adminAuditLogs;
  // Exclude legacy mock logs
  const realLogs = rawLogs.filter(log => log.id !== 'log_01' && log.id !== 'log_02');

  const filteredLogs = realLogs.filter(log => {
    const matchesSearch =
      (log.adminName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.targetId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' ? true : log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert size={18} className="text-amber-400" />
            <span>Nhật Ký Thao Tác Hệ Thống (Admin Audit Logs)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Lưu vết tất cả các thao tác quan trọng của Admin: duyệt tiền, xử lý khiếu nại, xác minh seller
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Tìm theo Admin, Target ID..."
              className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Tất cả hành động</option>
            <option value="APPROVE_WITHDRAWAL">Duyệt rút tiền</option>
            <option value="REFUND_DISPUTE">Hoàn tiền khiếu nại</option>
            <option value="RESOLVE_DISPUTE_SELLER">Thắng khiếu nại Seller</option>
            <option value="APPROVE_SELLER">Duyệt Verified Seller</option>
            <option value="CREATE_COUPON">Tạo mã giảm giá</option>
          </select>

          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
            title="Làm mới nhật ký từ máy chủ"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-400 text-xs">
          Chưa có bản ghi nhật ký thao tác nào phù hợp với bộ lọc.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Thời Gian</th>
                  <th className="p-3.5">Người Thao Tác</th>
                  <th className="p-3.5">Hành Động</th>
                  <th className="p-3.5">Đối Tượng (Target)</th>
                  <th className="p-3.5">Chi Tiết Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString('vi-VN')}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-bold text-white">{log.adminName}</div>
                      <span className="text-[10px] text-amber-400 font-mono">ADMIN SUPER</span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.action.includes('APPROVE') || log.action.includes('REFUND')
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap font-mono text-slate-300 text-xs">
                      #{log.targetId}
                    </td>
                    <td className="p-3.5 text-slate-300 leading-relaxed max-w-md">
                      {log.details}
                      {log.amount && (
                        <span className="font-mono font-bold text-amber-400 ml-1">
                          ({log.amount.toLocaleString('vi-VN')}đ)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
