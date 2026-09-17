import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Gift,
  Users,
  Save,
  CheckCircle2,
  Clock,
  Coins,
  Search,
  Filter,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ShieldAlert
} from 'lucide-react';

export const AdminReferralsTab: React.FC = () => {
  const {
    adminReferrals,
    referralSettings,
    fetchAdminReferrals,
    adminUpdateReferralSettings
  } = useApp();

  const [settingsForm, setSettingsForm] = useState({
    enabled: referralSettings.enabled ?? true,
    rewardType: referralSettings.rewardType || 'fixed_amount',
    referrerReward: referralSettings.referrerReward || 10000,
    referredUserReward: referralSettings.referredUserReward || 10000,
    minOrderValue: referralSettings.minOrderValue || 20000
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'rewarded'>('all');

  useEffect(() => {
    fetchAdminReferrals();
  }, [fetchAdminReferrals]);

  useEffect(() => {
    setSettingsForm({
      enabled: referralSettings.enabled ?? true,
      rewardType: referralSettings.rewardType || 'fixed_amount',
      referrerReward: referralSettings.referrerReward || 10000,
      referredUserReward: referralSettings.referredUserReward || 10000,
      minOrderValue: referralSettings.minOrderValue || 20000
    });
  }, [referralSettings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);
    try {
      const res = await adminUpdateReferralSettings({
        enabled: settingsForm.enabled,
        rewardType: settingsForm.rewardType as any,
        referrerReward: Number(settingsForm.referrerReward),
        referredUserReward: Number(settingsForm.referredUserReward),
        minOrderValue: Number(settingsForm.minOrderValue)
      });
      if (res.success) {
        setSaveSuccess('Đã cập nhật cấu hình hệ thống giới thiệu thành công!');
        setTimeout(() => setSaveSuccess(null), 3000);
      } else {
        setSaveError(res.message || 'Không thể lưu cài đặt.');
      }
    } catch (err: any) {
      setSaveError(err.message || 'Lỗi kết nối khi cập nhật cài đặt.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredReferrals = adminReferrals.filter(ref => {
    const matchesSearch =
      (ref.referralCode && ref.referralCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ref.referrerName && ref.referrerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ref.referredUserName && ref.referredUserName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ref.referrerId && ref.referrerId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ref.referredUserId && ref.referredUserId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ref.qualifyingOrderId && ref.qualifyingOrderId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'completed' || statusFilter === 'rewarded'
        ? ref.status === 'rewarded' || ref.status === 'completed'
        : ref.status === 'pending';

    return matchesSearch && matchesStatus;
  });

  const totalPaidOut = adminReferrals
    .filter(r => r.status === 'rewarded' || r.status === 'completed')
    .reduce((sum, r) => sum + (r.referrerReward || 0) + (r.referredUserReward || 0), 0);

  const completedCount = adminReferrals.filter(r => r.status === 'rewarded' || r.status === 'completed').length;
  const pendingCount = adminReferrals.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Top Header & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tổng lượt mời</span>
            <Users size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">{adminReferrals.length}</div>
          <div className="text-[11px] text-slate-500">Người dùng đã đăng ký qua mã</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Đã hoàn tất đơn</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{completedCount}</div>
          <div className="text-[11px] text-slate-500">Đã chi trả hoa hồng vào ví</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Đang chờ đơn đầu</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{pendingCount}</div>
          <div className="text-[11px] text-slate-500">Chưa mua acc đầu tiên</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tổng tiền đã thưởng</span>
            <Coins size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {totalPaidOut.toLocaleString('vi-VN')}đ
          </div>
          <div className="text-[11px] text-slate-500">Tổng ngân sách đã giải ngân</div>
        </div>
      </div>

      {/* Referral Settings Configuration Form */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Gift size={18} className="text-amber-400" />
            <h3 className="text-sm font-bold text-slate-200">Cấu Hình Chính Sách Referral</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Trạng thái hệ thống:</span>
            <button
              type="button"
              onClick={() => setSettingsForm(prev => ({ ...prev, enabled: !prev.enabled }))}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                settingsForm.enabled
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {settingsForm.enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              <span>{settingsForm.enabled ? 'ĐANG BẬT' : 'ĐANG TẮT'}</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Thưởng người giới thiệu (VNĐ):
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={settingsForm.referrerReward}
                onChange={e => setSettingsForm({ ...settingsForm, referrerReward: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:border-amber-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">Cộng trực tiếp vào ví sau khi bạn bè mua acc</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Thưởng người được mời (VNĐ):
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={settingsForm.referredUserReward}
                onChange={e => setSettingsForm({ ...settingsForm, referredUserReward: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:border-amber-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">Thưởng chào mừng sau khi kích hoạt/mua hàng</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Đơn hàng tối thiểu (VNĐ):
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                value={settingsForm.minOrderValue}
                onChange={e => setSettingsForm({ ...settingsForm, minOrderValue: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:border-amber-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">Giá trị đơn hàng đầu tiên tối thiểu để kích hoạt thưởng</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Loại hình trả thưởng:
              </label>
              <select
                value={settingsForm.rewardType}
                onChange={e => setSettingsForm({ ...settingsForm, rewardType: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none cursor-pointer"
              >
                <option value="fixed_amount">Số tiền cố định (VNĐ)</option>
                <option value="percentage">Phần trăm giá trị đơn (%)</option>
              </select>
              <span className="text-[10px] text-slate-500">Mặc định số tiền VNĐ cố định an toàn</span>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 size={14} />
              <span>{saveSuccess}</span>
            </div>
          )}

          {saveError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle size={14} />
              <span>{saveError}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-500/10"
            >
              <Save size={14} />
              <span>{isSaving ? 'Đang lưu...' : 'Lưu Cài Đặt Referral'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Referrals Data Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-200">Danh Sách Lịch Sử Giới Thiệu (Toàn Sàn)</h3>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[11px] text-slate-400">
              {filteredReferrals.length} bản ghi
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <input
                type="text"
                placeholder="Tìm mã, user, đơn..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <Search size={14} className="absolute left-2.5 top-2 text-slate-500" />
            </div>

            {/* Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="completed">Đã thưởng (Completed)</option>
              <option value="pending">Chờ đơn đầu (Pending)</option>
            </select>
          </div>
        </div>

        {filteredReferrals.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Không tìm thấy bản ghi giới thiệu nào phù hợp.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Mã Referral</th>
                  <th className="py-2.5 px-3">Người Giới Thiệu</th>
                  <th className="py-2.5 px-3">Người Được Mời</th>
                  <th className="py-2.5 px-3">Đơn Hàng Điều Kiện</th>
                  <th className="py-2.5 px-3">Hoa Hồng Người Mời</th>
                  <th className="py-2.5 px-3">Thưởng Người Mới</th>
                  <th className="py-2.5 px-3">Trạng Thái</th>
                  <th className="py-2.5 px-3">Thời Gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredReferrals.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-amber-400">
                      {item.referralCode}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-200">
                        {item.referrerName || item.referrerId}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">{item.referrerId}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-200">
                        {item.referredUserName || item.referredUserId}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">{item.referredUserId}</div>
                    </td>
                    <td className="py-3 px-3">
                      {item.qualifyingOrderId ? (
                        <div>
                          <div className="font-mono text-slate-300 font-semibold">{item.qualifyingOrderId}</div>
                          <div className="text-[10px] text-slate-400">
                            Giá trị: {(item.orderAmount || 0).toLocaleString('vi-VN')}đ
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Chưa mua acc</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      +{(item.referrerReward || 0).toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-cyan-400">
                      +{(item.referredUserReward || 0).toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-3 px-3">
                      {item.status === 'rewarded' || item.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium text-[10px]">
                          <CheckCircle2 size={11} />
                          <span>Đã trả thưởng</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-medium text-[10px]">
                          <Clock size={11} />
                          <span>Chờ đơn hàng</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {new Date(item.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
