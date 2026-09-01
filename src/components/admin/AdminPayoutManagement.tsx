import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { WalletTransaction, OrderItem } from '../../types';
import confetti from '../../utils/confetti';
import { VIETQR_BANKS, getBankInfo, getBankBinCode, buildVietQrUrl } from '../../utils/vietqrBanks';
import {
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Search,
  Filter,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Building,
  User,
  Sparkles,
  Phone,
  Mail,
  RefreshCw,
  ChevronDown
} from 'lucide-react';

export const AdminPayoutManagement: React.FC = () => {
  const {
    transactions,
    orders,
    allUsers,
    adminApproveWithdrawal,
    adminRejectWithdrawal,
    adminDisburseEarly,
    withdrawBalance,
    refreshAllData
  } = useApp();

  const [isRefreshingData, setIsRefreshingData] = useState(false);

  useEffect(() => {
    refreshAllData();
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshingData(true);
    await refreshAllData();
    setTimeout(() => {
      setIsRefreshingData(false);
      showToast('Đã đồng bộ dữ liệu rút tiền mới nhất từ hệ thống!');
    }, 400);
  };

  const [activeSubTab, setActiveSubTab] = useState<'withdrawals' | 'escrow'>('withdrawals');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'success' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [selectedTxForQr, setSelectedTxForQr] = useState<WalletTransaction | null>(null);
  const [qrCustomBankBin, setQrCustomBankBin] = useState<string>('970436');
  const [selectedTxForApprove, setSelectedTxForApprove] = useState<WalletTransaction | null>(null);
  const [approveRefNote, setApproveRefNote] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  const [selectedTxForReject, setSelectedTxForReject] = useState<WalletTransaction | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const [selectedOrderForEarlyPayout, setSelectedOrderForEarlyPayout] = useState<OrderItem | null>(null);
  const [isDisbursingEarly, setIsDisbursingEarly] = useState(false);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastInfo, setToastInfo] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastInfo({ message: msg, type });
    setTimeout(() => setToastInfo(null), 4000);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Filter withdrawal transactions
  const withdrawalTransactions = transactions.filter(t => t.type === 'withdraw');

  const filteredWithdrawals = withdrawalTransactions.filter(t => {
    if (statusFilter === 'pending' && t.status !== 'pending') return false;
    if (statusFilter === 'success' && (t.status !== 'success' && t.status !== 'approved' && t.status !== 'completed')) return false;
    if (statusFilter === 'failed' && (t.status !== 'failed' && t.status !== 'rejected' && t.status !== 'cancelled')) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchId = t.id.toLowerCase().includes(q);
      const matchNote = t.note.toLowerCase().includes(q);
      const matchUser = (t.userName && t.userName.toLowerCase().includes(q)) || false;
      const matchEmail = (t.userEmail && t.userEmail.toLowerCase().includes(q)) || false;
      const matchBank = (t.bankName && t.bankName.toLowerCase().includes(q)) || false;
      const matchAcc = (t.bankAccount && t.bankAccount.includes(q)) || false;
      const matchAccName = (t.bankAccountName && t.bankAccountName.toLowerCase().includes(q)) || false;

      return matchId || matchNote || matchUser || matchEmail || matchBank || matchAcc || matchAccName;
    }

    return true;
  });

  // Calculate Metrics from direct database records
  const pendingWithdrawals = withdrawalTransactions.filter(t => t.status === 'pending');
  const totalPendingAmount = pendingWithdrawals.reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const successWithdrawals = withdrawalTransactions.filter(t => t.status === 'success' || t.status === 'approved' || t.status === 'completed');
  const totalSuccessAmount = successWithdrawals.reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const escrowOrders = orders.filter(
    o => o.status === 'account_delivered' || o.status === 'inspecting'
  );
  const totalEscrowAmount = escrowOrders.reduce((sum, o) => sum + o.accountPrice, 0);

  // Approve action
  const handleConfirmApprove = async () => {
    if (!selectedTxForApprove) return;
    setIsApproving(true);
    const res = await adminApproveWithdrawal(selectedTxForApprove.id, approveRefNote.trim(), selectedTxForApprove);
    setIsApproving(false);
    setSelectedTxForApprove(null);
    setApproveRefNote('');

    if (res.success) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  // Reject action
  const handleConfirmReject = async () => {
    if (!selectedTxForReject || !rejectReason.trim()) return;
    setIsRejecting(true);
    const res = await adminRejectWithdrawal(selectedTxForReject.id, rejectReason.trim(), selectedTxForReject);
    setIsRejecting(false);
    setSelectedTxForReject(null);
    setRejectReason('');
    
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  // Disburse early action
  const handleConfirmDisburseEarly = async () => {
    if (!selectedOrderForEarlyPayout) return;
    setIsDisbursingEarly(true);
    const res = await adminDisburseEarly(selectedOrderForEarlyPayout.id);
    setIsDisbursingEarly(false);
    setSelectedOrderForEarlyPayout(null);

    if (res.success) {
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {}
      showToast(res.message);
    } else {
      showToast(res.message);
    }
  };

  // Demo create withdrawal if empty
  const handleCreateDemoWithdrawal = () => {
    const seller = allUsers.find(u => u.role === 'seller') || allUsers[0];
    if (!seller) return;

    withdrawBalance(500000, 'MB Bank - 0987654321 (NGUYEN VAN TEST)', {
      bankName: 'MB Bank (Quân Đội)',
      bankCode: '970422',
      bankAccount: '0987654321',
      bankAccountName: seller.name.toUpperCase()
    });
    showToast('Đã tạo 1 lệnh rút tiền mẫu 500.000đ để kiểm thử quy trình giải ngân!');
  };

  return (
    <div className="space-y-6">
      {/* Toast alert */}
      {toastInfo && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl border text-xs font-bold shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 ${
            toastInfo.type === 'error'
              ? 'bg-rose-950/95 border-rose-500/60 text-rose-200 shadow-rose-950/50'
              : 'bg-emerald-950/95 border-emerald-500/60 text-emerald-200 shadow-emerald-950/50'
          }`}
        >
          {toastInfo.type === 'error' ? (
            <XCircle size={18} className="text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          )}
          <span>{toastInfo.message}</span>
        </div>
      )}

      {/* TOP BANNER & METRICS */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-red-500/20 text-amber-400 border border-amber-500/30">
                <Wallet size={20} />
              </span>
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                Trung Tâm Giải Ngân & Rút Tiền Người Bán
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Thực hiện chuyển khoản VietQR Napas 24/7 trực tiếp cho người bán, giải phóng bảo chứng Escrow và quản lý lịch sử thanh toán.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshingData}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-60"
              title="Đồng bộ lại danh sách lệnh rút tiền mới nhất"
            >
              <RefreshCw size={14} className={`text-cyan-400 ${isRefreshingData ? 'animate-spin' : ''}`} />
              <span>{isRefreshingData ? 'Đang tải...' : 'Làm Mới'}</span>
            </button>

            <button
              onClick={handleCreateDemoWithdrawal}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Sparkles size={14} className="text-amber-400" />
              <span>Tạo Lệnh Rút Mẫu</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Pending Payouts */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-slate-950 border border-amber-500/30 space-y-2 relative overflow-hidden">
            {pendingWithdrawals.length > 0 && (
              <span className="absolute top-3 right-3 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            )}
            <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
              <span>Chờ Chuyển Khoản ⏳</span>
              <Clock size={16} />
            </div>
            <div className="text-xl font-black text-amber-300 font-mono">
              {totalPendingAmount.toLocaleString('vi-VN')}đ
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Số lệnh đang chờ:</span>
              <strong className="text-amber-300 font-mono">{pendingWithdrawals.length} lệnh</strong>
            </div>
          </div>

          {/* Card 2: Completed Payouts */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-slate-950 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
              <span>Đã Giải Ngân Thành Công</span>
              <CheckCircle2 size={16} />
            </div>
            <div className="text-xl font-black text-emerald-400 font-mono">
              {totalSuccessAmount.toLocaleString('vi-VN')}đ
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Đã hoàn tất:</span>
              <strong className="text-emerald-300 font-mono">{successWithdrawals.length} lệnh</strong>
            </div>
          </div>

          {/* Card 3: Escrow Pending */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-slate-950 border border-purple-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs text-purple-400 font-bold">
              <span>Đang Giữ Trong Escrow 🛡️</span>
              <ShieldCheck size={16} />
            </div>
            <div className="text-xl font-black text-purple-300 font-mono">
              {totalEscrowAmount.toLocaleString('vi-VN')}đ
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Đơn đang kiểm tra:</span>
              <strong className="text-purple-300 font-mono">{escrowOrders.length} đơn</strong>
            </div>
          </div>

          {/* Card 4: VietQR Live 24/7 Gateway */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-slate-950 border border-cyan-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs text-cyan-400 font-bold">
              <span>Cổng VietQR Napas 24/7</span>
              <Zap size={16} />
            </div>
            <div className="text-sm font-black text-cyan-300">
              Quét Mã QR Chuyển Tiền
            </div>
            <div className="text-[11px] text-slate-400">
              Tự động điền STK, Tên & Số tiền chính xác 100%
            </div>
          </div>
        </div>

        {/* WORKFLOW STEP GUIDE FOR ADMIN */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Zap size={14} className="text-amber-400" />
            <span>Quy Trình 4 Bước Giải Ngân Cho Người Bán:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold text-amber-400 font-mono">BƯỚC 1</span>
              <div className="font-bold text-white">Đơn hàng hoàn tất</div>
              <p className="text-[11px] text-slate-400">
                Người mua bấm "Xác nhận nhận acc" hoặc hết 24h bảo chứng $\rightarrow$ Tiền chuyển vào ví người bán.
              </p>
            </div>

            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold text-amber-400 font-mono">BƯỚC 2</span>
              <div className="font-bold text-white">Người bán tạo lệnh rút</div>
              <p className="text-[11px] text-slate-400">
                Người bán nhập STK ngân hàng và số tiền cần rút về tài khoản cá nhân.
              </p>
            </div>

            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold text-cyan-400 font-mono">BƯỚC 3 (ADMIN)</span>
              <div className="font-bold text-white">Quét mã VietQR</div>
              <p className="text-[11px] text-slate-400">
                Admin bấm "Quét VietQR 24/7" $\rightarrow$ Mở App Ngân hàng trên điện thoại quét mã chuyển tiền ngay.
              </p>
            </div>

            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 font-mono">BƯỚC 4</span>
              <div className="font-bold text-white">Xác nhận hoàn tất</div>
              <p className="text-[11px] text-slate-400">
                Admin bấm "Xác Nhận Đã Chuyển" $\rightarrow$ Hệ thống tự động gửi thông báo Realtime cho người bán!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SUB-TABS: WITHDRAWALS QUEUE & ESCROW DISBURSEMENT */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('withdrawals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'withdrawals'
                ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wallet size={14} />
            <span>Danh Sách Lệnh Rút Tiền</span>
            {pendingWithdrawals.length > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {pendingWithdrawals.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('escrow')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'escrow'
                ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck size={14} />
            <span>Đơn Hàng Tạm Giữ & Giải Ngân Sớm</span>
            {escrowOrders.length > 0 && (
              <span className="bg-purple-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {escrowOrders.length}
              </span>
            )}
          </button>
        </div>

        {/* Filter controls */}
        {activeSubTab === 'withdrawals' && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm seller, STK, mã lệnh..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl focus:outline-none focus:border-red-500 w-48 sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-red-500"
            >
              <option value="all">Tất cả trạng thái ({withdrawalTransactions.length})</option>
              <option value="pending">⏳ Chờ chuyển khoản ({pendingWithdrawals.length})</option>
              <option value="success">✅ Đã giải ngân ({successWithdrawals.length})</option>
              <option value="failed">❌ Đã từ chối</option>
            </select>
          </div>
        )}
      </div>

      {/* SUB-TAB 1: WITHDRAWALS LIST */}
      {activeSubTab === 'withdrawals' && (
        <div className="space-y-4">
          {filteredWithdrawals.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
              <CheckCircle2 size={40} className="text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">Không có lệnh rút tiền nào phù hợp</h3>
              <p className="text-xs text-slate-400">
                Tất cả các yêu cầu giải ngân của người bán đã được xử lý hoặc chưa có lệnh rút mới.
              </p>
              <button
                onClick={handleCreateDemoWithdrawal}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={14} className="text-amber-400" />
                <span>Tạo lệnh rút thử nghiệm</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredWithdrawals.map(tx => {
                const user = allUsers.find(u => u.id === tx.userId);
                const isPending = tx.status === 'pending';
                const isSuccess = tx.status === 'success' || tx.status === 'approved' || tx.status === 'completed';
                const isFailed = tx.status === 'failed' || tx.status === 'rejected' || tx.status === 'cancelled';
                const cleanAmount = Math.abs(tx.amount);

                const bankBin = getBankBinCode(tx.bankName, tx.bankCode);
                const bankAccountClean = tx.bankAccount || '';
                const bankAccountNameClean = tx.bankAccountName || tx.userName || user?.name || '';

                return (
                  <div
                    key={tx.id}
                    className={`bg-slate-900 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl border transition-all ${
                      isPending
                        ? 'border-amber-500/50 bg-gradient-to-r from-amber-500/5 to-slate-900'
                        : isSuccess
                        ? 'border-emerald-500/30'
                        : 'border-rose-500/30 opacity-75'
                    }`}
                  >
                    {/* Header: ID, Status, Timestamp */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-xs font-mono font-bold bg-slate-950 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-800">
                          #{tx.id}
                        </span>

                        {isPending && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                            <span>Chờ Admin Chuyển Khoản</span>
                          </span>
                        )}

                        {isSuccess && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 size={13} className="text-emerald-400" />
                            <span>Đã Giải Ngân Thành Công</span>
                          </span>
                        )}

                        {isFailed && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                            <XCircle size={13} className="text-rose-400" />
                            <span>Đã Từ Chối (Đã Hoàn Ví)</span>
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-400 font-mono">
                        Yêu cầu lúc: {new Date(tx.createdAt).toLocaleTimeString('vi-VN')} {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                        {tx.processedAt && (
                          <span className="text-emerald-400 block sm:inline sm:ml-2">
                            • Xử lý lúc: {new Date(tx.processedAt).toLocaleTimeString('vi-VN')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Main Content Grid: Seller Info + Bank Details + Amount */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                      {/* Col 1: Seller Info */}
                      <div className="lg:col-span-4 space-y-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                            alt={tx.userName || user?.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-white text-xs flex items-center gap-1.5">
                              <span>{tx.userName || user?.name || 'Người bán'}</span>
                              {user?.isVerifiedSeller && (
                                <ShieldCheck size={13} className="text-cyan-400" />
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Mail size={11} />
                              <span>{tx.userEmail || user?.email || 'seller@lqmarket.vn'}</span>
                            </div>
                            {user?.phone && (
                              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                <Phone size={11} />
                                <span>{user.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded-xl border border-slate-800/80">
                          <span>Số dư ví hiện tại: </span>
                          <strong className="text-amber-400 font-mono">{user?.balance?.toLocaleString('vi-VN') || 0}đ</strong>
                        </div>
                      </div>

                      {/* Col 2: Bank Account Details Card */}
                      <div className="lg:col-span-5 bg-slate-950 rounded-2xl p-3.5 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-800/80">
                          <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                            <Building size={13} className="text-amber-400" />
                            <span>{tx.bankName || 'Ngân Hàng / Ví MoMo'}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">BIN: {bankBin}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Số tài khoản nhận:</span>
                            <div className="flex items-center gap-1 font-mono font-bold text-amber-300 text-sm mt-0.5">
                              <span>{bankAccountClean || 'Chưa cập nhật'}</span>
                              {bankAccountClean && (
                                <button
                                  type="button"
                                  onClick={() => handleCopy(bankAccountClean, `acc_${tx.id}`)}
                                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                                  title="Sao chép số tài khoản"
                                >
                                  {copiedKey === `acc_${tx.id}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                </button>
                              )}
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 block">Tên chủ tài khoản:</span>
                            <div className="flex items-center gap-1 font-bold text-white text-xs uppercase mt-0.5">
                              <span className="truncate">{bankAccountNameClean || 'N/A'}</span>
                              {bankAccountNameClean && (
                                <button
                                  type="button"
                                  onClick={() => handleCopy(bankAccountNameClean, `name_${tx.id}`)}
                                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                                  title="Sao chép tên"
                                >
                                  {copiedKey === `name_${tx.id}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {tx.note && (
                          <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800/80">
                            Ghi chú: {tx.note}
                          </p>
                        )}

                        {tx.rejectReason && (
                          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300">
                            <strong>Lý do từ chối:</strong> {tx.rejectReason}
                          </div>
                        )}
                      </div>

                      {/* Col 3: Amount & Action Buttons */}
                      <div className="lg:col-span-3 text-right space-y-2.5">
                        <div>
                          <span className="text-[11px] text-slate-400 block">Số tiền giải ngân:</span>
                          <div className="text-xl font-black text-amber-400 font-mono flex items-center justify-end gap-1">
                            <span>{cleanAmount.toLocaleString('vi-VN')}đ</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(String(cleanAmount), `amt_${tx.id}`)}
                              className="text-slate-400 hover:text-white p-1 cursor-pointer"
                              title="Sao chép số tiền"
                            >
                              {copiedKey === `amt_${tx.id}` ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                            </button>
                          </div>
                        </div>

                        {/* Action buttons for pending withdrawal */}
                        {isPending && (
                          <div className="flex flex-col gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const initialBin = getBankBinCode(tx.bankName, tx.bankCode);
                                setQrCustomBankBin(initialBin);
                                setSelectedTxForQr(tx);
                              }}
                              className="w-full py-2 px-3 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20 cursor-pointer"
                            >
                              <QrCode size={14} />
                              <span>Quét VietQR 24/7</span>
                            </button>

                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedTxForApprove(tx)}
                                className="py-2 px-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-emerald-600/20"
                              >
                                <Check size={13} />
                                <span>Xác Nhận Đã Chuyển</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setSelectedTxForReject(tx)}
                                className="py-2 px-2 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 border border-slate-700 hover:border-rose-700 cursor-pointer"
                              >
                                <XCircle size={13} />
                                <span>Từ Chối</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: ESCROW ORDERS & EARLY PAYOUT */}
      {activeSubTab === 'escrow' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-800/40 text-xs text-slate-300 space-y-1">
            <h4 className="font-bold text-purple-300 flex items-center gap-2">
              <ShieldCheck size={16} />
              <span>Cơ Chế Bảo Chứng Giao Dịch Escrow (Tạm Giữ Tiền)</span>
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Khi người mua nạp tiền và mua tài khoản, tiền được hệ thống giữ tạm thời trong trạng thái <strong>pendingBalance</strong>. Sau khi người bán giao thông tin tài khoản và người mua bấm "Xác nhận nhận acc" (hoặc quá 24h bảo chứng an toàn không có khiếu nại), tiền sẽ tự động chuyển sang số dư khả dụng <strong>balance</strong> của người bán.
              Admin có thể dùng nút <strong>"⚡ Giải ngân sớm"</strong> bên dưới để giải phóng tiền ngay cho người bán uy tín.
            </p>
          </div>

          {escrowOrders.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
              <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">Không có đơn hàng nào đang tạm giữ Escrow</h3>
              <p className="text-xs text-slate-400">Tất cả các đơn hàng đã được giải ngân hoặc hoàn tất.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {escrowOrders.map(order => (
                <div
                  key={order.id}
                  className="bg-slate-900 border border-purple-500/40 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-lg border border-purple-500/30">
                        #{order.orderCode}
                      </span>
                      <span className="text-xs font-bold text-white">{order.accountTitle}</span>
                    </div>

                    <div className="text-xs font-black text-amber-400 font-mono">
                      Giá trị đơn: {order.accountPrice.toLocaleString('vi-VN')}đ
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 block">Người Mua:</span>
                      <div className="font-bold text-white">{order.buyerName}</div>
                      <div className="text-[10px] text-slate-500">ID: {order.buyerId}</div>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 block">Người Bán (Nhận Tiền):</span>
                      <div className="font-bold text-emerald-400">{order.sellerName}</div>
                      <div className="text-[10px] text-slate-500">ID: {order.sellerId}</div>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 block">Trạng Thái Escrow:</span>
                      <div className="font-bold text-cyan-400">Đã bàn giao tài khoản</div>
                      <div className="text-[10px] text-slate-400">Đang trong thời gian bảo chứng</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-800 text-xs">
                    <span className="text-slate-400 text-[11px]">
                      Tạo lúc: {new Date(order.createdAt).toLocaleTimeString('vi-VN')} {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedOrderForEarlyPayout(order)}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Zap size={14} />
                      <span>Giải Ngân Sớm Cho Người Bán (+{(order.accountPrice - (order.fee || Math.round(order.accountPrice * 0.05))).toLocaleString('vi-VN')}đ)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: VIETQR NAPAS 24/7 QUICK SCAN */}
      {selectedTxForQr && (() => {
        const currentBankInfo = getBankInfo(qrCustomBankBin) || getBankInfo(selectedTxForQr.bankName) || {
          bin: qrCustomBankBin,
          shortName: selectedTxForQr.bankName || 'Ngân Hàng',
          name: selectedTxForQr.bankName || 'Ngân Hàng Thụ Hưởng'
        };
        const memo = `LQMARKET GIAI NGAN ${selectedTxForQr.id.slice(-6)}`;
        const accountName = selectedTxForQr.bankAccountName || selectedTxForQr.userName || '';
        const qrUrl = buildVietQrUrl(
          qrCustomBankBin,
          selectedTxForQr.bankAccount,
          Math.abs(selectedTxForQr.amount),
          memo,
          accountName
        );

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
            <div className="bg-slate-900 border border-amber-500/50 rounded-3xl p-5 sm:p-6 max-w-md w-full space-y-4 shadow-2xl my-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <QrCode size={18} />
                  <span>Mã VietQR Chuyển Tiền Giải Ngân 24/7</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTxForQr(null)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <XCircle size={18} />
                </button>
              </div>

              {/* Bank Selector & Change Bank Option */}
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Ngân hàng thụ hưởng:</span>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">BIN: {qrCustomBankBin}</span>
                </div>
                <select
                  value={qrCustomBankBin}
                  onChange={e => setQrCustomBankBin(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white font-bold text-xs rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                >
                  {VIETQR_BANKS.map(b => (
                    <option key={b.bin} value={b.bin}>
                      {b.shortName} - {b.name} (BIN: {b.bin})
                    </option>
                  ))}
                </select>
              </div>

              {/* QR Image Container */}
              <div className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-inner">
                <img
                  src={qrUrl}
                  alt={`VietQR ${currentBankInfo.shortName}`}
                  className="w-60 h-60 sm:w-64 sm:h-64 object-contain"
                  onError={e => {
                    // Fallback
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="text-[11px] text-slate-800 font-bold mt-1 text-center">
                  <span>{currentBankInfo.shortName} • Napas 24/7 Chuyển Tiền Miễn Phí</span>
                </div>
              </div>

              {/* Recipient Details & Copy Buttons */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs text-slate-300">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Ngân hàng:</span>
                  <strong className="text-white text-right">{currentBankInfo.shortName} ({currentBankInfo.name})</strong>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Số tài khoản:</span>
                  <div className="flex items-center gap-1 font-mono font-bold text-amber-300">
                    <span>{selectedTxForQr.bankAccount}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedTxForQr.bankAccount || '', 'modal_acc')}
                      className="p-1 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {copiedKey === 'modal_acc' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Chủ tài khoản:</span>
                  <strong className="text-white uppercase">{selectedTxForQr.bankAccountName || selectedTxForQr.userName}</strong>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Số tiền giải ngân:</span>
                  <div className="flex items-center gap-1 font-mono font-black text-amber-400 text-sm">
                    <span>{Math.abs(selectedTxForQr.amount).toLocaleString('vi-VN')}đ</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(String(Math.abs(selectedTxForQr.amount)), 'modal_amt')}
                      className="p-1 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {copiedKey === 'modal_amt' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Nội dung chuyển:</span>
                  <div className="flex items-center gap-1 font-mono font-bold text-cyan-300 text-[11px]">
                    <span>{memo}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(memo, 'modal_memo')}
                      className="p-1 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {copiedKey === 'modal_memo' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedTxForQr(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const tx = selectedTxForQr;
                    setSelectedTxForQr(null);
                    setSelectedTxForApprove(tx);
                  }}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  <Check size={14} />
                  <span>Xác Nhận Đã Chuyển Tiền</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 2: CONFIRM APPROVAL MODAL */}
      {selectedTxForApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
              <CheckCircle2 size={20} />
              <span>Xác Nhận Hoàn Tất Giải Ngân</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn đang xác nhận đã chuyển khoản thành công{' '}
              <strong className="text-amber-400 font-black font-mono">
                {Math.abs(selectedTxForApprove.amount).toLocaleString('vi-VN')}đ
              </strong>{' '}
              cho người bán <strong>{selectedTxForApprove.userName || selectedTxForApprove.bankAccountName}</strong> về STK{' '}
              <span className="font-mono text-white font-bold">{selectedTxForApprove.bankAccount}</span> ({selectedTxForApprove.bankName}).
            </p>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Mã bút toán / Ghi chú ngân hàng (Tùy chọn):
              </label>
              <input
                type="text"
                value={approveRefNote}
                onChange={e => setApproveRefNote(e.target.value)}
                placeholder="VD: FT240820987654321..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedTxForApprove(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isApproving}
                onClick={handleConfirmApprove}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-600/30 cursor-pointer flex items-center gap-1.5"
              >
                <Check size={14} />
                <span>{isApproving ? 'Đang xử lý...' : 'Xác Nhận Giải Ngân'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REJECT WITHDRAWAL MODAL */}
      {selectedTxForReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-rose-500/50 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
              <XCircle size={20} />
              <span>Từ Chối Lệnh Rút & Hoàn Tiền Ví</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Số tiền{' '}
              <strong className="text-amber-400 font-mono">
                {Math.abs(selectedTxForReject.amount).toLocaleString('vi-VN')}đ
              </strong>{' '}
              sẽ được <strong>hoàn trả lại 100%</strong> vào ví LQMarket của người bán (
              {selectedTxForReject.userName}).
            </p>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Lý do từ chối (Gửi thông báo cho Seller):
              </label>
              <textarea
                required
                rows={3}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="VD: Sai số tài khoản hoặc tên chủ tài khoản không khớp, vui lòng kiểm tra lại..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedTxForReject(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isRejecting || !rejectReason.trim()}
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-lg shadow-rose-600/30 cursor-pointer flex items-center gap-1.5"
              >
                <XCircle size={14} />
                <span>{isRejecting ? 'Đang hoàn ví...' : 'Từ Chối & Hoàn Ví Cho Seller'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EARLY PAYOUT CONFIRMATION */}
      {selectedOrderForEarlyPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-teal-500/50 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-base">
              <Zap size={20} />
              <span>Xác Nhận Giải Ngân Sớm Đơn Hàng</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Mã đơn hàng:</span>
                <strong className="text-white font-mono">{selectedOrderForEarlyPayout.orderCode}</strong>
              </div>
              <div className="flex justify-between">
                <span>Tài khoản:</span>
                <strong className="text-white">{selectedOrderForEarlyPayout.accountTitle}</strong>
              </div>
              <div className="flex justify-between">
                <span>Người bán nhận tiền:</span>
                <strong className="text-emerald-400">{selectedOrderForEarlyPayout.sellerName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Giá bán tài khoản:</span>
                <strong className="text-slate-300 font-mono">{selectedOrderForEarlyPayout.accountPrice.toLocaleString('vi-VN')}đ</strong>
              </div>
              <div className="flex justify-between text-rose-400">
                <span>Khấu trừ phí sàn (5%):</span>
                <span className="font-mono font-bold">-{(selectedOrderForEarlyPayout.fee || Math.round(selectedOrderForEarlyPayout.accountPrice * 0.05)).toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2 text-emerald-400 font-bold">
                <span>Số tiền thực giải ngân:</span>
                <strong className="text-emerald-400 font-black font-mono text-sm">
                  +{(selectedOrderForEarlyPayout.accountPrice - (selectedOrderForEarlyPayout.fee || Math.round(selectedOrderForEarlyPayout.accountPrice * 0.05))).toLocaleString('vi-VN')}đ
                </strong>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Hệ thống sẽ chuyển ngay{' '}
              <strong className="text-emerald-400 font-bold">
                +{(selectedOrderForEarlyPayout.accountPrice - (selectedOrderForEarlyPayout.fee || Math.round(selectedOrderForEarlyPayout.accountPrice * 0.05))).toLocaleString('vi-VN')}đ
              </strong>{' '}
              (đã khấu trừ 5% phí sàn) từ số dư tạm giữ Escrow sang <strong>số dư khả dụng</strong> của người bán và đánh dấu đơn hàng là hoàn tất.
            </p>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrderForEarlyPayout(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isDisbursingEarly}
                onClick={handleConfirmDisburseEarly}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-600/30 cursor-pointer flex items-center gap-1.5"
              >
                <Zap size={14} />
                <span>{isDisbursingEarly ? 'Đang giải ngân...' : 'Giải Ngân Ngay'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
