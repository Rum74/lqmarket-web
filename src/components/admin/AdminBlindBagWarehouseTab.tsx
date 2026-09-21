import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BlindBagAccountItem } from '../../types';
import {
  Database,
  Plus,
  Upload,
  Search,
  Filter,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Lock,
  Tag,
  RefreshCw,
  Trash2,
  Edit2,
  Copy,
  Check,
  Package,
  Layers,
  Sparkles,
  History,
  ShieldCheck,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const DEFAULT_TIER_OPTIONS = [
  { id: 'box_bronze', label: 'Túi Đồng (20.000đ)', price: 20000, color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' },
  { id: 'box_gold', label: 'Túi Vàng (50.000đ)', price: 50000, color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' },
  { id: 'box_diamond', label: 'Túi Kim Cương (100.000đ)', price: 100000, color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' },
  { id: 'box_special', label: 'Túi Thần Tài (200.000đ)', price: 200000, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' }
];

export const AdminBlindBagWarehouseTab: React.FC = () => {
  const {
    blindBagAccounts,
    blindBagClaims,
    blindBagStats,
    mysteryBoxes,
    fetchBlindBagAccounts,
    fetchBlindBagStats,
    fetchBlindBagClaims,
    adminAddBlindBagAccount,
    adminImportBlindBagAccounts,
    adminUpdateBlindBagAccount,
    adminDeleteBlindBagAccount,
    adminRevealBlindBagPassword
  } = useApp();

  // Dynamic Tier Options derived from AppContext mysteryBoxes
  const tierOptions = React.useMemo(() => {
    if (!mysteryBoxes || mysteryBoxes.length === 0) {
      return DEFAULT_TIER_OPTIONS;
    }
    const colorMap: Record<string, string> = {
      box_bronze: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
      box_silver: 'text-slate-300 border-slate-400/30 bg-slate-400/10',
      box_gold: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
      box_diamond: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
      box_special: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      blindbag_1000: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      blindbag_5000: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
      blindbag_10000: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
      blindbag_20000: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    };

    const fallbackColors = [
      'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
      'text-purple-400 border-purple-500/30 bg-purple-500/10',
      'text-amber-400 border-amber-500/30 bg-amber-500/10',
      'text-rose-400 border-rose-500/30 bg-rose-500/10',
      'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    ];

    return mysteryBoxes.map((b, idx) => ({
      id: b.id,
      label: `${b.name} (${b.price.toLocaleString('vi-VN')}đ)`,
      price: b.price,
      color: colorMap[b.id] || fallbackColors[idx % fallbackColors.length]
    }));
  }, [mysteryBoxes]);

  // Navigation & Sub-views
  const [subTab, setSubTab] = useState<'inventory' | 'claims'>('inventory');

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'claimed' | 'reserved' | 'disabled'>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Pagination for Inventory
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, tierFilter, searchTerm, subTab]);

  // Pagination calculations for Inventory
  const totalItems = blindBagAccounts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedAccounts = blindBagAccounts.slice(startIndex, startIndex + pageSize);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingAcc, setEditingAcc] = useState<BlindBagAccountItem | null>(null);
  const [deletingAccId, setDeletingAccId] = useState<string | null>(null);

  // Single Add Form
  const [addForm, setAddForm] = useState({
    username: '',
    password: '',
    blindBagId: mysteryBoxes[0]?.id || 'box_bronze',
    status: 'available',
    notes: ''
  });

  // Bulk Import Form
  const [importForm, setImportForm] = useState({
    blindBagId: mysteryBoxes[0]?.id || 'box_bronze',
    defaultStatus: 'available',
    rawText: ''
  });
  const [importResult, setImportResult] = useState<any | null>(null);

  // UI helpers
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Initial load
  useEffect(() => {
    loadData();
  }, [statusFilter, tierFilter]);

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchBlindBagStats(),
      fetchBlindBagAccounts({
        status: statusFilter,
        blindBagId: tierFilter,
        search: searchTerm
      }),
      fetchBlindBagClaims({
        blindBagId: tierFilter,
        search: searchTerm
      })
    ]);
    setIsLoading(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  // Reveal password handler
  const handleTogglePassword = async (id: string) => {
    if (revealedPasswords[id]) {
      const next = { ...revealedPasswords };
      delete next[id];
      setRevealedPasswords(next);
    } else {
      const pass = await adminRevealBlindBagPassword(id);
      if (pass) {
        setRevealedPasswords(prev => ({ ...prev, [id]: pass }));
      }
    }
  };

  // Single Add Action
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.username.trim() || !addForm.password.trim()) {
      showToast('Vui lòng nhập tài khoản và mật khẩu!');
      return;
    }
    const res = await adminAddBlindBagAccount(addForm);
    if (res.success) {
      showToast(res.message);
      setIsAddModalOpen(false);
      setAddForm({
        username: '',
        password: '',
        blindBagId: 'blindbag_1000',
        status: 'available',
        notes: ''
      });
      loadData();
    } else {
      showToast(res.message);
    }
  };

  // Bulk Import Action
  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importForm.rawText.trim()) {
      showToast('Vui lòng nhập danh sách tài khoản cần nạp!');
      return;
    }
    const res = await adminImportBlindBagAccounts(importForm);
    if (res.success) {
      setImportResult(res.stats);
      showToast(res.message);
      loadData();
    } else {
      showToast(res.message);
    }
  };

  // Edit Action
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAcc) return;
    const res = await adminUpdateBlindBagAccount(editingAcc.id, {
      username: editingAcc.username,
      blindBagId: editingAcc.blindBagId,
      status: editingAcc.status,
      notes: editingAcc.notes
    });
    if (res.success) {
      showToast(res.message);
      setEditingAcc(null);
      loadData();
    } else {
      showToast(res.message);
    }
  };

  // Delete Action
  const handleDeleteConfirm = async (id: string) => {
    const res = await adminDeleteBlindBagAccount(id);
    showToast(res.message);
    setDeletingAccId(null);
    loadData();
  };

  const getTierBadge = (bagId: string) => {
    const t = tierOptions.find(opt => opt.id === bagId);
    if (!t) return <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">{bagId}</span>;
    return (
      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${t.color}`}>
        {t.label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={11} /> Sẵn sàng
          </span>
        );
      case 'claimed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Package size={11} /> Đã trao
          </span>
        );
      case 'reserved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Lock size={11} /> Đang giữ
          </span>
        );
      case 'disabled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle size={11} /> Đã khóa
          </span>
        );
      default:
        return <span className="text-[11px] text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* TOAST MESSAGE */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 border border-amber-500/50 text-white text-sm px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Sparkles className="text-amber-400 shrink-0" size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400">
                <Database size={22} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  KHO TÀI KHOẢN TÚI MÙ
                  <span className="text-xs font-normal text-amber-400 px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                    Kho Lưu Trữ Độc Lập
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Tách biệt hoàn toàn với Acc đăng bán trên sàn marketplace. Cấp tài khoản tự động & chống race condition khi xé túi.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
              <span>Làm mới</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Thêm 1 ACC</span>
            </button>

            <button
              onClick={() => {
                setImportResult(null);
                setIsImportModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Upload size={14} />
              <span>Nhập File / Hàng Loạt</span>
            </button>
          </div>
        </div>

        {/* STATS METRIC CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Tổng trong kho</span>
              <Layers size={13} className="text-slate-400" />
            </div>
            <div className="text-xl font-black text-white">{blindBagStats.total || 0}</div>
            <div className="text-[10px] text-slate-500">Tài khoản lưu trữ</div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
            <div className="text-xs text-emerald-400 font-bold flex items-center justify-between">
              <span>Còn hàng (Available)</span>
              <CheckCircle2 size={13} className="text-emerald-400" />
            </div>
            <div className="text-xl font-black text-emerald-400">{blindBagStats.available || 0}</div>
            <div className="text-[10px] text-emerald-500/80">Sẵn sàng mở xé</div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-1">
            <div className="text-xs text-blue-400 font-bold flex items-center justify-between">
              <span>Đã trao (Claimed)</span>
              <Package size={13} className="text-blue-400" />
            </div>
            <div className="text-xl font-black text-blue-400">{blindBagStats.claimed || 0}</div>
            <div className="text-[10px] text-blue-500/80">Người dùng đã nhận</div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1">
            <div className="text-xs text-amber-400 font-bold flex items-center justify-between">
              <span>Đang giữ (Reserved)</span>
              <Lock size={13} className="text-amber-400" />
            </div>
            <div className="text-xl font-black text-amber-400">{blindBagStats.reserved || 0}</div>
            <div className="text-[10px] text-amber-500/80">Giao dịch đang xử lý</div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-1 col-span-2 sm:col-span-1">
            <div className="text-xs text-rose-400 font-bold flex items-center justify-between">
              <span>Tạm khóa (Disabled)</span>
              <AlertCircle size={13} className="text-rose-400" />
            </div>
            <div className="text-xl font-black text-rose-400">{blindBagStats.disabled || 0}</div>
            <div className="text-[10px] text-rose-500/80">Chờ kiểm tra mật khẩu</div>
          </div>
        </div>

        {/* SUB TABS NAVIGATION */}
        <div className="flex items-center gap-2 border-b border-slate-800 pt-2">
          <button
            onClick={() => setSubTab('inventory')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              subTab === 'inventory'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database size={13} />
            <span>Danh Sách Tài Khoản Trong Kho ({blindBagAccounts.length})</span>
          </button>

          <button
            onClick={() => setSubTab('claims')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              subTab === 'claims'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History size={13} />
            <span>Lịch Sử Trao Quà ({blindBagClaims.length})</span>
          </button>
        </div>

        {/* SEARCH & FILTERS ROW */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between pt-1">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input
              type="text"
              placeholder="Tìm theo Username, ID tài khoản..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <select
              value={tierFilter}
              onChange={e => setTierFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">Tất cả Hạng Túi Mù</option>
              {tierOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">Tất cả Trạng Thái</option>
              <option value="available">Sẵn Sàng (Available)</option>
              <option value="claimed">Đã Trao (Claimed)</option>
              <option value="reserved">Đang Giữ (Reserved)</option>
              <option value="disabled">Đã Khóa (Disabled)</option>
            </select>
          </div>
        </div>
      </div>

      {/* CONTENT: INVENTORY TABLE */}
      {subTab === 'inventory' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Tài Khoản (TK)</th>
                  <th className="py-3 px-4">Mật Khẩu (MK)</th>
                  <th className="py-3 px-4">Gán Vào Túi Mù</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4">Người Nhận</th>
                  <th className="py-3 px-4">Ngày Nhập</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {blindBagAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <Database className="mx-auto mb-2 text-slate-600 opacity-50" size={32} />
                      <p className="font-bold">Chưa có tài khoản nào trong kho Túi Mù.</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Hãy nhấn nút "Nhập File / Hàng Loạt" hoặc "Thêm 1 ACC" để bắt đầu nạp tài khoản.
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedAccounts.map(acc => {
                    const isRevealed = Boolean(revealedPasswords[acc.id]);
                    const displayPassword = isRevealed ? revealedPasswords[acc.id] : acc.password;

                    return (
                      <tr key={acc.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-white">
                          <div className="flex items-center gap-1.5">
                            <span>{acc.username}</span>
                            <button
                              onClick={() => handleCopy(acc.username, `user_${acc.id}`)}
                              title="Sao chép tên tài khoản"
                              className="text-slate-500 hover:text-amber-400 p-0.5 transition-colors cursor-pointer"
                            >
                              {copiedId === `user_${acc.id}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-500 font-sans block">{acc.id}</span>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-300">
                          <div className="flex items-center gap-2">
                            <span className={isRevealed ? 'text-amber-300 font-bold' : 'text-slate-400'}>
                              {displayPassword}
                            </span>
                            <button
                              onClick={() => handleTogglePassword(acc.id)}
                              title={isRevealed ? 'Ẩn mật khẩu' : 'Xem mật khẩu'}
                              className="text-slate-500 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                            {isRevealed && (
                              <button
                                onClick={() => handleCopy(displayPassword, `pass_${acc.id}`)}
                                title="Sao chép mật khẩu"
                                className="text-slate-500 hover:text-amber-400 p-0.5 transition-colors cursor-pointer"
                              >
                                {copiedId === `pass_${acc.id}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {getTierBadge(acc.blindBagId)}
                        </td>

                        <td className="py-3 px-4">
                          {getStatusBadge(acc.status)}
                        </td>

                        <td className="py-3 px-4">
                          {acc.claimedBy ? (
                            <div className="space-y-0.5">
                              <span className="text-white font-medium block">
                                {acc.claimedByName || acc.claimedBy}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono block">
                                {acc.claimedAt ? new Date(acc.claimedAt).toLocaleString('vi-VN') : ''}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px]">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-[11px] text-slate-400">
                          {new Date(acc.createdAt).toLocaleDateString('vi-VN')}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingAcc(acc)}
                              title="Chỉnh sửa thông tin"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            >
                              <Edit2 size={13} />
                            </button>

                            {acc.status !== 'claimed' ? (
                              <button
                                onClick={() => setDeletingAccId(acc.id)}
                                title="Xóa tài khoản khỏi kho"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            ) : (
                              <span className="p-1.5 text-slate-600" title="Tài khoản đã trao không thể xóa để lưu vết đối soát">
                                <Lock size={13} />
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalItems > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-950/90 border-t border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span>
                  Hiển thị <strong className="text-white">{startIndex + 1}</strong> - <strong className="text-white">{Math.min(startIndex + pageSize, totalItems)}</strong> trên tổng số <strong className="text-amber-400 font-mono">{totalItems}</strong> tài khoản
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500">Mỗi trang:</span>
                  <select
                    value={pageSize}
                    onChange={e => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={validCurrentPage <= 1}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-colors cursor-pointer"
                    title="Trang trước"
                  >
                    <ChevronLeft size={14} />
                  </button>

                  <div className="flex items-center gap-1 px-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - validCurrentPage) <= 1)
                      .reduce((acc: (number | string)[], p, idx, arr) => {
                        if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                          acc.push('...');
                        }
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, idx) =>
                        p === '...' ? (
                          <span key={`dots-${idx}`} className="px-1 text-slate-600">...</span>
                        ) : (
                          <button
                            key={`page-${p}`}
                            onClick={() => setCurrentPage(Number(p))}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              validCurrentPage === p
                                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={validCurrentPage >= totalPages}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-colors cursor-pointer"
                    title="Trang sau"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTENT: CLAIMS LOG TABLE */}
      {subTab === 'claims' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Mã Giao Dịch</th>
                  <th className="py-3 px-4">Người Nhận</th>
                  <th className="py-3 px-4">Gói Túi Mù</th>
                  <th className="py-3 px-4">Tài Khoản Đã Nhận</th>
                  <th className="py-3 px-4">Thời Gian Nhận</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {blindBagClaims.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <History className="mx-auto mb-2 text-slate-600 opacity-50" size={32} />
                      <p className="font-bold">Chưa có lượt nhận tài khoản nào từ Túi Mù.</p>
                    </td>
                  </tr>
                ) : (
                  blindBagClaims.map(claim => (
                    <tr key={claim.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-400">
                        {claim.id}
                      </td>
                      <td className="py-3 px-4 font-medium text-white">
                        {claim.userName || claim.userId}
                      </td>
                      <td className="py-3 px-4">
                        {getTierBadge(claim.blindBagId)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">
                        {claim.username}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(claim.claimedAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                          <CheckCircle2 size={12} /> Thành công
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: SINGLE ADD */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Plus size={16} className="text-amber-400" />
                Thêm 1 Tài Khoản Vào Kho Túi Mù
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Tên Tài Khoản (TK) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: lq_master01"
                  value={addForm.username}
                  onChange={e => setAddForm({ ...addForm, username: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Mật Khẩu (MK) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Pass@2026"
                  value={addForm.password}
                  onChange={e => setAddForm({ ...addForm, password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Gán Cho Túi Mù</label>
                <select
                  value={addForm.blindBagId}
                  onChange={e => setAddForm({ ...addForm, blindBagId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {tierOptions.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Trạng Thái Ban Đầu</label>
                <select
                  value={addForm.status}
                  onChange={e => setAddForm({ ...addForm, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="available">Sẵn sàng cấp (Available)</option>
                  <option value="disabled">Tạm khóa (Disabled)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Ghi chú (Tùy chọn)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Acc trắng TT, có Raz Brolly"
                  value={addForm.notes}
                  onChange={e => setAddForm({ ...addForm, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all cursor-pointer shadow-lg"
                >
                  Thêm Vào Kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BULK IMPORT */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Upload size={16} className="text-amber-400" />
                  Nhập Tài Khoản Hàng Loạt Vào Túi Mù
                </h3>
                <p className="text-[11px] text-slate-400">
                  Định dạng mỗi dòng: <span className="font-mono text-amber-300 font-bold">username | password</span>
                </p>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Gán Cho Túi Mù</label>
                  <select
                    value={importForm.blindBagId}
                    onChange={e => setImportForm({ ...importForm, blindBagId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {tierOptions.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Trạng Thái Ban Đầu</label>
                  <select
                    value={importForm.defaultStatus}
                    onChange={e => setImportForm({ ...importForm, defaultStatus: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="available">Sẵn sàng cấp (Available)</option>
                    <option value="disabled">Tạm khóa (Disabled)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block flex justify-between">
                  <span>Dữ Liệu Nhập (Mỗi dòng 1 ACC)</span>
                  <span className="text-slate-500 font-normal">Hỗ trợ ngăn cách bằng | hoặc tab</span>
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder={`acc001 | pass001\nacc002 | pass002\nacc003 | pass003`}
                  value={importForm.rawText}
                  onChange={e => setImportForm({ ...importForm, rawText: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono text-xs focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              {/* REPORT STATS IF IMPORTED */}
              {importResult && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span>Kết Quả Import:</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                      +{importResult.successCount} Thành công
                    </div>
                    <div className="p-2 rounded bg-amber-500/10 text-amber-400 font-bold">
                      {importResult.duplicateCount} Trùng lặp
                    </div>
                    <div className="p-2 rounded bg-rose-500/10 text-rose-400 font-bold">
                      {importResult.errorCount} Lỗi định dạng
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all cursor-pointer shadow-lg"
                >
                  Bắt Đầu Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT */}
      {editingAcc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Edit2 size={16} className="text-amber-400" />
                Cập Nhật Tài Khoản Kho
              </h3>
              <button
                onClick={() => setEditingAcc(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Tên Tài Khoản (TK)</label>
                <input
                  type="text"
                  required
                  value={editingAcc.username}
                  onChange={e => setEditingAcc({ ...editingAcc, username: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Gán Vào Túi Mù</label>
                <select
                  value={editingAcc.blindBagId}
                  onChange={e => setEditingAcc({ ...editingAcc, blindBagId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {tierOptions.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Trạng Thái</label>
                <select
                  value={editingAcc.status}
                  onChange={e => setEditingAcc({ ...editingAcc, status: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="available">Sẵn sàng (Available)</option>
                  <option value="claimed">Đã trao (Claimed)</option>
                  <option value="reserved">Đang giữ (Reserved)</option>
                  <option value="disabled">Đã khóa (Disabled)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Ghi Chú</label>
                <input
                  type="text"
                  value={editingAcc.notes || ''}
                  onChange={e => setEditingAcc({ ...editingAcc, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAcc(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl cursor-pointer shadow-lg"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRM */}
      {deletingAccId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-800/60 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <Trash2 size={18} />
              <span>Xóa Tài Khoản Khỏi Kho?</span>
            </div>
            <p className="text-xs text-slate-300">
              Hành động này sẽ xóa vĩnh viễn tài khoản này khỏi kho túi mù. Bạn có chắc chắn không?
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setDeletingAccId(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDeleteConfirm(deletingAccId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
