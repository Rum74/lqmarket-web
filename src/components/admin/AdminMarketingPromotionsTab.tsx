import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PromotionItem, PromotionKPIStats, PromotionRewardLogItem } from '../../types';
import { api } from '../../lib/apiClient';
import { PromotionPopupModal } from '../common/PromotionPopupModal';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Copy,
  Trash2,
  Play,
  Pause,
  Clock,
  Sparkles,
  Zap,
  Tag,
  DollarSign,
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Gift,
  HelpCircle,
  ShieldCheck,
  Send
} from 'lucide-react';

export const AdminMarketingPromotionsTab: React.FC = () => {
  const { currentUser } = useApp();

  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [stats, setStats] = useState<PromotionKPIStats | null>(null);
  const [rewardLogs, setRewardLogs] = useState<PromotionRewardLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<'campaigns' | 'audit_logs'>('campaigns');

  // Preview State
  const [previewItem, setPreviewItem] = useState<PromotionItem | null>(null);

  // Edit / Create Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<PromotionItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Manual Retry Deposit Bonus State
  const [retryOrderCodeInput, setRetryOrderCodeInput] = useState('');
  const [isRetryingBonus, setIsRetryingBonus] = useState(false);
  const [retryResultMsg, setRetryResultMsg] = useState<string | null>(null);

  // Form State
  const defaultFormData: Partial<PromotionItem> = {
    code: '',
    title: '',
    description: '',
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    terms: '• Nạp tối thiểu từ 100.000đ.\n• Tiền thưởng cộng tự động vào số dư ví sau khi thanh toán VietQR PayOS thành công.',
    ctaText: 'Nạp Ví Nhận Ngay',
    ctaUrl: '/wallet',
    ctaAction: 'open_deposit',
    type: 'deposit_bonus',
    status: 'active',
    isActive: true,
    priority: 50,
    showPopup: true,
    popupDelaySeconds: 3,
    popupFrequency: 'once_per_session',
    hideHoursAfterClose: 24,
    targetAudience: 'all',
    bonusPercent: 5,
    bonusAmount: 0,
    minDeposit: 100000,
    maxBonusPerTx: 20000,
    maxBonusPerUser: 100000,
    firstDepositOnly: false,
    discountPercent: 10,
    discountAmount: 0,
    minOrder: 500000,
    maxDiscount: 200000,
    maxUsesPerUser: 1,
    totalBudget: 10000000,
    maxUses: 500,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16)
  };

  const [formData, setFormData] = useState<Partial<PromotionItem>>(defaultFormData);

  // Load Promotions & Stats
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [promoRes, statsRes, logsRes] = await Promise.all([
        api.get('/api/promotions').catch(() => ({ promotions: [] })),
        api.get('/api/promotions/stats').catch(() => ({ stats: null })),
        api.get('/api/promotions/reward-logs').catch(() => ({ logs: [] }))
      ]);

      if (promoRes && Array.isArray(promoRes.promotions)) {
        setPromotions(promoRes.promotions);
      }
      if (statsRes && statsRes.stats) {
        setStats(statsRes.stats);
      }
      if (logsRes && Array.isArray(logsRes.logs)) {
        setRewardLogs(logsRes.logs);
      }
    } catch (err) {
      console.error('Error fetching promotion data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Quick Notification Helper
  const flashSuccess = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingPromotion(null);
    setFormData({
      ...defaultFormData,
      code: `PROMO_${Math.floor(1000 + Math.random() * 9000)}`,
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16)
    });
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (promo: PromotionItem) => {
    setEditingPromotion(promo);
    setFormData({
      ...promo,
      startDate: promo.startDate ? new Date(promo.startDate).toISOString().slice(0, 16) : '',
      endDate: promo.endDate ? new Date(promo.endDate).toISOString().slice(0, 16) : ''
    });
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Submit Create or Edit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.title.trim()) {
      setFormError('Vui lòng nhập tiêu đề chương trình');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const payload = {
        ...formData,
        code: (formData.code || '').trim().toUpperCase(),
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString()
      };

      if (editingPromotion) {
        const res: any = await api.put(`/api/promotions/${editingPromotion.id}`, payload);
        if (res && res.success) {
          flashSuccess(`Cập nhật thành công chương trình [${res.promotion?.code || payload.code}]`);
          setIsFormModalOpen(false);
          fetchData();
        } else {
          setFormError(res?.message || 'Lỗi cập nhật chương trình');
        }
      } else {
        const res: any = await api.post('/api/promotions', payload);
        if (res && res.success) {
          flashSuccess(`Tạo mới thành công chương trình [${res.promotion?.code || payload.code}]`);
          setIsFormModalOpen(false);
          fetchData();
        } else {
          setFormError(res?.message || 'Lỗi tạo chương trình');
        }
      }
    } catch (err: any) {
      setFormError(err?.response?.data?.message || err.message || 'Lỗi xử lý yêu cầu');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle status quick action
  const handleToggleStatus = async (promo: PromotionItem) => {
    try {
      const nextStatus = promo.status === 'active' ? 'paused' : 'active';
      const nextActive = nextStatus === 'active';
      const res: any = await api.patch(`/api/promotions/${promo.id}/status`, {
        status: nextStatus,
        isActive: nextActive
      });
      if (res && res.success) {
        flashSuccess(`Đã chuyển trạng thái [${promo.code}] sang: ${nextStatus.toUpperCase()}`);
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi đổi trạng thái');
    }
  };

  // Clone Promotion
  const handleClonePromotion = async (promo: PromotionItem) => {
    if (!window.confirm(`Bạn có chắc muốn nhân bản chương trình [${promo.code}]?`)) return;
    try {
      const res: any = await api.post(`/api/promotions/${promo.id}/clone`, {});
      if (res && res.success) {
        flashSuccess(`Đã nhân bản chương trình thành [${res.promotion?.code}]`);
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi nhân bản chương trình');
    }
  };

  // Delete Promotion
  const handleDeletePromotion = async (promo: PromotionItem) => {
    if (!window.confirm(`Xóa vĩnh viễn chương trình [${promo.code}] (${promo.title})?`)) return;
    try {
      const res: any = await api.delete(`/api/promotions/${promo.id}`);
      if (res && res.success) {
        flashSuccess(`Đã xóa chương trình [${promo.code}]`);
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa chương trình');
    }
  };

  // Manual Retry Deposit Bonus
  const handleRetryDepositBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!retryOrderCodeInput.trim()) return;

    try {
      setIsRetryingBonus(true);
      setRetryResultMsg(null);
      const res: any = await api.post('/api/promotions/retry-deposit-bonus', {
        orderCode: retryOrderCodeInput.trim()
      });
      if (res && res.success) {
        setRetryResultMsg(res.message);
        flashSuccess(res.message);
        fetchData();
      } else {
        setRetryResultMsg(`Thất bại: ${res?.message || 'Không thể cấp bù'}`);
      }
    } catch (err: any) {
      setRetryResultMsg(`Lỗi: ${err?.response?.data?.message || err.message}`);
    } finally {
      setIsRetryingBonus(false);
    }
  };

  // Filtered List
  const filteredPromotions = promotions.filter(p => {
    if (typeFilter !== 'all' && p.type !== typeFilter) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return (
        p.title.toLowerCase().includes(s) ||
        p.code.toLowerCase().includes(s) ||
        (p.description && p.description.toLowerCase().includes(s))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* POPUP PREVIEW COMPONENT */}
      {previewItem && (
        <PromotionPopupModal
          previewPromotion={previewItem}
          onClosePreview={() => setPreviewItem(null)}
        />
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-rose-500 font-black text-xs uppercase tracking-wider">
            <Megaphone size={16} />
            <span>Hệ Thống Marketing LQMarket</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            Quản Lý Khuyến Mãi & Popup Ưu Đãi
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Cấu hình popup quảng cáo, thưởng nạp ví VietQR PayOS tự động, voucher giảm giá mua acc và quản lý ngân sách.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchData}
            title="Làm mới dữ liệu"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white text-xs sm:text-sm font-black rounded-xl shadow-lg shadow-red-600/20 flex items-center gap-2 cursor-pointer transition-all transform active:scale-98"
          >
            <Plus size={16} />
            <span>Tạo Chương Trình Mới</span>
          </button>
        </div>
      </div>

      {/* ACTION SUCCESS BANNER */}
      {actionSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* KPI STATS OVERVIEW CARDS */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-bold block">Chương Trình Đang Chạy</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-white">{stats.activePromotions}</span>
              <span className="text-xs text-slate-400">/ {stats.totalPromotions}</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-medium">Hoạt động ổn định</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-bold block">Ngân Sách Đã Chi</span>
            <div className="text-xl font-black text-amber-400 font-mono">
              {stats.spentBudget.toLocaleString('vi-VN')}đ
            </div>
            <span className="text-[10px] text-slate-400">
              Tổng quỹ: {stats.totalBudget ? stats.totalBudget.toLocaleString('vi-VN') + 'đ' : 'Không giới hạn'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-bold block">Hiển Thị & Click</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-rose-400 font-mono">{stats.totalImpressions}</span>
              <span className="text-xs text-slate-400">lượt xem</span>
            </div>
            <span className="text-[10px] text-cyan-400 font-bold">
              {stats.totalClicks} clicks (CTR {stats.ctr})
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-bold block">Thưởng Nạp Ví Đã Cấp</span>
            <div className="text-xl font-black text-emerald-400 font-mono">
              {stats.totalDepositBonusGranted.toLocaleString('vi-VN')}đ
            </div>
            <span className="text-[10px] text-slate-400">
              {stats.depositBonusCount} lượt giao dịch VietQR
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-400 font-bold block">Giảm Giá Đơn Hàng Mua Acc</span>
            <div className="text-xl font-black text-purple-400 font-mono">
              {stats.totalDiscountGranted.toLocaleString('vi-VN')}đ
            </div>
            <span className="text-[10px] text-slate-400">
              {stats.discountOrderCount} đơn hàng áp dụng voucher
            </span>
          </div>
        </div>
      )}

      {/* NAVIGATION SUB-TABS */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('campaigns')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'campaigns'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <Megaphone size={14} />
            <span>Danh Sách Chương Trình ({promotions.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('audit_logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'audit_logs'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <ShieldCheck size={14} />
            <span>Đối Soát & Cấp Bù Thưởng ({rewardLogs.length})</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SUB-TAB 1: CAMPAIGNS LIST */}
      {/* ======================================================== */}
      {activeSubTab === 'campaigns' && (
        <div className="space-y-4">
          {/* TOOLBAR FILTER */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên, mã code hoặc mô tả..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                aria-label="Lọc theo loại khuyến mãi"
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option value="all">Tất cả loại</option>
                <option value="deposit_bonus">Thưởng nạp ví</option>
                <option value="account_discount">Mã giảm giá mua acc</option>
                <option value="banner_announcement">Banner thông báo</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                aria-label="Lọc theo trạng thái"
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang chạy</option>
                <option value="paused">Tạm dừng</option>
                <option value="draft">Bản nháp</option>
                <option value="expired">Hết hạn</option>
                <option value="out_of_budget">Hết ngân sách</option>
              </select>
            </div>
          </div>

          {/* PROMOTIONS LIST / CARDS */}
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Đang tải danh sách khuyến mãi...</p>
            </div>
          ) : filteredPromotions.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-slate-800 space-y-3">
              <Megaphone size={36} className="text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300">Không tìm thấy chương trình khuyến mãi nào</p>
              <button
                onClick={handleOpenCreate}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Tạo Chương Trình Đầu Tiên
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPromotions.map(promo => {
                const percentSpent =
                  promo.totalBudget > 0
                    ? Math.min(100, Math.round(((promo.spentBudget || 0) / promo.totalBudget) * 100))
                    : 0;

                return (
                  <div
                    key={promo.id}
                    className={`rounded-2xl bg-slate-900/90 border transition-all flex flex-col justify-between overflow-hidden shadow-lg ${
                      promo.status === 'active' && promo.isActive
                        ? 'border-slate-800 hover:border-rose-500/50'
                        : 'border-slate-800/60 opacity-80'
                    }`}
                  >
                    {/* CARD HEADER WITH BANNER PREVIEW */}
                    <div className="relative h-28 bg-slate-950 overflow-hidden shrink-0">
                      <img
                        src={promo.bannerUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'}
                        alt={promo.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                      {/* BADGES */}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span className="bg-slate-950/90 text-white font-mono font-black text-[10px] px-2 py-0.5 rounded border border-slate-700">
                          {promo.code}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            promo.status === 'active' && promo.isActive
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : promo.status === 'paused'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : promo.status === 'out_of_budget'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {promo.status === 'active' && promo.isActive
                            ? '● Đang chạy'
                            : promo.status === 'paused'
                            ? 'Tạm dừng'
                            : promo.status === 'out_of_budget'
                            ? 'Hết ngân sách'
                            : promo.status === 'draft'
                            ? 'Bản nháp'
                            : promo.status}
                        </span>
                      </div>

                      {/* POPUP INDICATOR */}
                      <div className="absolute top-2 right-2">
                        {promo.showPopup ? (
                          <span className="bg-red-600/90 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow">
                            Popup ON
                          </span>
                        ) : (
                          <span className="bg-slate-800 text-slate-400 text-[9px] px-1.5 py-0.5 rounded">
                            Popup OFF
                          </span>
                        )}
                      </div>

                      {/* PRIORITY BADGE */}
                      <div className="absolute bottom-2 left-2 text-[10px] text-amber-400 font-bold bg-slate-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                        Ưu tiên: {promo.priority}
                      </div>
                    </div>

                    {/* CARD CONTENT */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-black text-white line-clamp-1">{promo.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {promo.description || promo.terms || 'Chưa có mô tả chi tiết'}
                        </p>
                      </div>

                      {/* HIGHLIGHT RULES */}
                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1 text-xs">
                        {promo.type === 'deposit_bonus' && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Thưởng nạp:</span>
                            <span className="font-bold text-emerald-400">
                              {promo.bonusPercent ? `+${promo.bonusPercent}%` : `${promo.bonusAmount?.toLocaleString('vi-VN')}đ`}
                              {promo.maxBonusPerTx ? ` (Max ${promo.maxBonusPerTx.toLocaleString('vi-VN')}đ)` : ''}
                            </span>
                          </div>
                        )}

                        {promo.type === 'account_discount' && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Giảm giá:</span>
                            <span className="font-bold text-purple-400">
                              {promo.discountPercent ? `-${promo.discountPercent}%` : `-${promo.discountAmount?.toLocaleString('vi-VN')}đ`}
                              {promo.maxDiscount ? ` (Max ${promo.maxDiscount.toLocaleString('vi-VN')}đ)` : ''}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Lượt dùng:</span>
                          <span className="text-slate-200 font-mono">
                            {promo.usedCount || 0} / {promo.maxUses ? promo.maxUses : '∞'}
                          </span>
                        </div>
                      </div>

                      {/* BUDGET PROGRESS */}
                      {promo.totalBudget > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-400">Ngân sách đã cấp:</span>
                            <span className="font-mono text-amber-400 font-bold">
                              {(promo.spentBudget || 0).toLocaleString('vi-VN')}đ / {promo.totalBudget.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                              style={{ width: `${percentSpent}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* FOOTER ACTIONS */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1 text-xs">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setPreviewItem(promo)}
                            title="Xem trước popup trên giao diện khách"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg cursor-pointer"
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(promo)}
                            title={promo.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                            className={`p-1.5 rounded-lg cursor-pointer ${
                              promo.status === 'active'
                                ? 'bg-amber-950/60 hover:bg-amber-900 text-amber-300'
                                : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300'
                            }`}
                          >
                            {promo.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleClonePromotion(promo)}
                            title="Nhân bản"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                          >
                            <Copy size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeletePromotion(promo)}
                            title="Xóa chương trình"
                            className="p-1.5 bg-slate-800 hover:bg-rose-900 text-rose-400 rounded-lg cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(promo)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1"
                        >
                          <Edit2 size={13} /> Sửa
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: REWARD LOGS & SAFE RETRY AUDIT */}
      {/* ======================================================== */}
      {activeSubTab === 'audit_logs' && (
        <div className="space-y-6">
          {/* RETRY BONUS TOOL FOR PAYOS DEPOSITS */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wide">
              <Zap size={16} />
              <span>Cấp Bù Thưởng Nạp Ví An Toàn (Anti-Duplicate Idempotent)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Nếu một giao dịch nạp tiền PayOS VietQR đã ghi nhận thành công nhưng chưa nhận được thưởng do gián đoạn mạng, bạn có thể nhập <strong>mã đơn (orderCode)</strong> để hệ thống đối soát và tự động cấp bù an toàn. Cơ chế chống trùng lặp sẽ chặn tuyệt đối mọi hành vi cấp thưởng lần 2.
            </p>

            <form onSubmit={handleRetryDepositBonus} className="flex flex-col sm:flex-row gap-2 max-w-lg">
              <input
                type="number"
                required
                value={retryOrderCodeInput}
                onChange={e => setRetryOrderCodeInput(e.target.value)}
                placeholder="Nhập mã đơn PayOS (VD: 84920182)"
                className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 font-mono"
              />
              <button
                type="submit"
                disabled={isRetryingBonus || !retryOrderCodeInput.trim()}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                {isRetryingBonus ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Đang kiểm tra...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Cấp Bù Thưởng</span>
                  </>
                )}
              </button>
            </form>

            {retryResultMsg && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-amber-300">
                {retryResultMsg}
              </div>
            )}
          </div>

          {/* REWARD LOGS TABLE */}
          <div className="rounded-2xl sm:rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                Lịch Sử Đối Soát Ưu Đãi & Cấp Thưởng ({rewardLogs.length})
              </h3>
            </div>

            {rewardLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                Chưa có bản ghi cấp thưởng hoặc giảm giá nào trong hệ thống.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-950/60">
                      <th className="py-3 px-4">Thời Gian</th>
                      <th className="py-3 px-4">Loại Ưu Đãi</th>
                      <th className="py-3 px-4">Chương Trình / Code</th>
                      <th className="py-3 px-4">Người Nhận</th>
                      <th className="py-3 px-4">Mã Đơn / GD</th>
                      <th className="py-3 px-4">Số Tiền Gốc</th>
                      <th className="py-3 px-4">Giá Trị Thưởng / Giảm</th>
                      <th className="py-3 px-4">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {rewardLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 text-slate-400 font-mono">
                          {new Date(log.createdAt).toLocaleString('vi-VN')}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.promotionType === 'deposit_bonus'
                                ? 'bg-amber-400/20 text-amber-400'
                                : 'bg-purple-400/20 text-purple-400'
                            }`}
                          >
                            {log.promotionType === 'deposit_bonus' ? 'Thưởng Nạp Ví' : 'Giảm Giá Mua Acc'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{log.promotionCode}</div>
                          <div className="text-[10px] text-slate-400">{log.promotionTitle}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-200">{log.userName || log.userId}</div>
                          <div className="text-[10px] text-slate-400">{log.userEmail}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-300">
                          {log.orderCode ? `#${log.orderCode}` : log.orderId || '-'}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {log.baseAmount.toLocaleString('vi-VN')}đ
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                          +{log.rewardAmount.toLocaleString('vi-VN')}đ
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {log.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CREATE / EDIT PROMOTION MODAL */}
      {/* ======================================================== */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-4 sm:p-6 max-w-2xl w-full max-h-[92vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
                <Megaphone size={18} />
                <span>{editingPromotion ? 'Chỉnh Sửa Chương Trình Khuyến Mãi' : 'Tạo Mới Chương Trình Khuyến Mãi'}</span>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600/50 text-rose-200 text-xs font-bold flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              {/* SECTION: BASIC INFO */}
              <div className="space-y-3">
                <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">1. Thông tin chương trình</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Mã chương trình (Code / Slug) *</label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="VD: NAPVIET5, VIP50K"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 font-mono font-bold focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Loại khuyến mãi *</label>
                    <select
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:border-rose-500 cursor-pointer"
                    >
                      <option value="deposit_bonus">Thưởng Nạp Ví (Deposit Bonus)</option>
                      <option value="account_discount">Mã Giảm Giá Mua Acc (Coupon)</option>
                      <option value="banner_announcement">Banner Thông Báo Sự Kiện</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Tiêu đề popup / Tên chương trình *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="VD: Đại Tiệc Nạp Ví - Tặng 5% Tiền Nạp VietQR"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Mô tả ngắn gọn hiển thị popup</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="VD: Nạp ví ngay nhận thêm 5% giá trị nạp trực tiếp vào số dư tài khoản..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Banner URL (Ảnh bìa popup)</label>
                  <input
                    type="text"
                    value={formData.bannerUrl}
                    onChange={e => setFormData({ ...formData, bannerUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:border-rose-500"
                  />
                </div>
              </div>

              {/* SECTION: REWARD RULES */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">2. Quy tắc ưu đãi</h4>

                {formData.type === 'deposit_bonus' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <div>
                      <label className="text-slate-300 block mb-1">Thưởng (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.bonusPercent}
                        onChange={e => setFormData({ ...formData, bonusPercent: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1">Nạp tối thiểu (VNĐ)</label>
                      <input
                        type="number"
                        min="0"
                        step="10000"
                        value={formData.minDeposit}
                        onChange={e => setFormData({ ...formData, minDeposit: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1">Thưởng tối đa / GD (VNĐ)</label>
                      <input
                        type="number"
                        min="0"
                        step="5000"
                        value={formData.maxBonusPerTx}
                        onChange={e => setFormData({ ...formData, maxBonusPerTx: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200"
                      />
                    </div>

                    <div className="sm:col-span-3 flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="firstDepositOnlyCheck"
                        checked={formData.firstDepositOnly}
                        onChange={e => setFormData({ ...formData, firstDepositOnly: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-900 text-rose-600 cursor-pointer"
                      />
                      <label htmlFor="firstDepositOnlyCheck" className="text-slate-300 cursor-pointer select-none">
                        Chỉ áp dụng cho lần nạp đầu tiên của tài khoản
                      </label>
                    </div>
                  </div>
                )}

                {formData.type === 'account_discount' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <div>
                      <label className="text-slate-300 block mb-1">Giảm giá (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.discountPercent}
                        onChange={e => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1">Đơn tối thiểu (VNĐ)</label>
                      <input
                        type="number"
                        min="0"
                        step="50000"
                        value={formData.minOrder}
                        onChange={e => setFormData({ ...formData, minOrder: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1">Giảm tối đa (VNĐ)</label>
                      <input
                        type="number"
                        min="0"
                        step="10000"
                        value={formData.maxDiscount}
                        onChange={e => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Thể lệ & Điều kiện tham gia</label>
                  <textarea
                    rows={2}
                    value={formData.terms}
                    onChange={e => setFormData({ ...formData, terms: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:border-rose-500"
                  />
                </div>
              </div>

              {/* SECTION: BUDGET & TARGETING */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">3. Ngân sách & Đối tượng</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1">Tổng ngân sách (VNĐ, 0 = không giới hạn)</label>
                    <input
                      type="number"
                      min="0"
                      step="500000"
                      value={formData.totalBudget}
                      onChange={e => setFormData({ ...formData, totalBudget: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">Giới hạn số lượt dùng (0 = không giới hạn)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.maxUses}
                      onChange={e => setFormData({ ...formData, maxUses: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">Đối tượng mục tiêu</label>
                    <select
                      value={formData.targetAudience}
                      onChange={e => setFormData({ ...formData, targetAudience: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 cursor-pointer"
                    >
                      <option value="all">Tất cả khách truy cập</option>
                      <option value="logged_in">Người dùng đã đăng nhập</option>
                      <option value="guest_only">Khách chưa đăng nhập</option>
                      <option value="new_users_only">Thành viên mới (dưới 7 ngày)</option>
                      <option value="first_time_deposit">Người chưa từng nạp tiền</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION: POPUP & SCHEDULE CONFIG */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">4. Cấu hình popup & Thời gian</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1">Bật Popup?</label>
                    <select
                      value={formData.showPopup ? 'true' : 'false'}
                      onChange={e => setFormData({ ...formData, showPopup: e.target.value === 'true' })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 cursor-pointer"
                    >
                      <option value="true">BẬT Popup</option>
                      <option value="false">TẮT Popup</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">Độ trễ popup (giây)</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={formData.popupDelaySeconds}
                      onChange={e => setFormData({ ...formData, popupDelaySeconds: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">Tần suất xuất hiện</label>
                    <select
                      value={formData.popupFrequency}
                      onChange={e => setFormData({ ...formData, popupFrequency: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 cursor-pointer"
                    >
                      <option value="once_per_session">1 lần / phiên trình duyệt</option>
                      <option value="once_per_day">1 lần / ngày</option>
                      <option value="every_time">Mỗi lần tải trang</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">Độ ưu tiên (1-100)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.priority}
                      onChange={e => setFormData({ ...formData, priority: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1">Bắt đầu (Asia/Ho_Chi_Minh)</label>
                    <input
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">Kết thúc (Asia/Ho_Chi_Minh)</label>
                    <input
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1">Văn bản nút CTA</label>
                    <input
                      type="text"
                      value={formData.ctaText}
                      onChange={e => setFormData({ ...formData, ctaText: e.target.value })}
                      placeholder="VD: Nạp Ví Nhận Ngay"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">Hành động nút CTA</label>
                    <select
                      value={formData.ctaAction}
                      onChange={e => setFormData({ ...formData, ctaAction: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 cursor-pointer"
                    >
                      <option value="open_deposit">Mở Modal Nạp Ví VietQR</option>
                      <option value="navigate">Chuyển hướng đến URL</option>
                      <option value="copy_code">Sao chép mã ưu đãi</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">Đường dẫn đích (CTA URL)</label>
                    <input
                      type="text"
                      value={formData.ctaUrl}
                      onChange={e => setFormData({ ...formData, ctaUrl: e.target.value })}
                      placeholder="/wallet hoặc /accounts"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPreviewItem(formData as PromotionItem)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  <Eye size={14} /> Xem Trước Popup Ngay
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                  >
                    Hủy
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black rounded-xl shadow-lg cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <span>{editingPromotion ? 'Cập Nhật Chương Trình' : 'Lưu & Xuất Bản'}</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
