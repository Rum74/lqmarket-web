import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RankBadge } from '../common/RankBadge';
import { UserProfile, UserRole } from '../../types';
import confetti from '../../utils/confetti';
import { AdminPayoutManagement } from './AdminPayoutManagement';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  DollarSign,
  ShoppingBag,
  Users,
  Store,
  Eye,
  Trash2,
  Sparkles,
  RotateCcw,
  Check,
  Award,
  Layers,
  Settings,
  Lock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Phone,
  Mail,
  Wallet,
  UserPlus,
  Edit2,
  Plus,
  Minus,
  Search,
  Filter,
  X,
  Key,
  BadgeCheck
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const {
    currentUser,
    loginUser,
    setCurrentView,
    openLoginModal,
    accounts,
    updateAccountStatus,
    deleteAccount,
    orders,
    transactions,
    adminResolveDispute,
    disputeOrder,
    allUsers,
    adminCreateUser,
    adminUpdateUser,
    adminDeleteUser,
    adminAdjustUserBalance,
    setSelectedAccountId,
    resetToDefaultData,
    clearAllFirebaseData,
    seedSampleData,
    cloudSyncStatus
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pending' | 'accounts' | 'disputes' | 'payouts' | 'users' | 'settings'>('pending');
  const [rejectionModalAccId, setRejectionModalAccId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [isWipingData, setIsWipingData] = useState(false);
  const [isSeedingData, setIsSeedingData] = useState(false);
  const [showWipeConfirmModal, setShowWipeConfirmModal] = useState(false);

  // User Management State
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'buyer' | 'seller' | 'admin' | 'verified'>('all');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [adjustingUserBalance, setAdjustingUserBalance] = useState<{
    user: UserProfile;
    amount: string;
    isAdding: boolean;
    reason: string;
  } | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);

  // New user form state
  const [newUserForm, setNewUserForm] = useState<{
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
    balance: string;
    isVerifiedSeller: boolean;
    sellerTier: 'STANDARD' | 'PRO' | 'VIP';
    bio: string;
  }>({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'buyer',
    balance: '0',
    isVerifiedSeller: false,
    sellerTier: 'STANDARD',
    bio: ''
  });

  // Non-Admin access restriction screen
  if (currentUser.role !== 'admin') {
    return (
      <div className="p-8 sm:p-12 bg-slate-900 border border-red-500/30 rounded-3xl text-center space-y-6 max-w-2xl mx-auto my-8 shadow-2xl">
        <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
          <ShieldAlert size={32} />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
            <span>KHU VỰC QUẢN TRỊ VIÊN CẤP CAO</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Truy Cập Bị Hạn Chế
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
            Trang Quản trị & Kiểm duyệt chỉ dành riêng cho tài khoản Super Admin của hệ thống LQMarket. Vui lòng đăng nhập tài khoản Admin để truy cập.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 text-left space-y-2">
          <div className="font-bold text-amber-400">Thông tin tài khoản Super Admin:</div>
          <div className="text-slate-400">Email: <span className="font-mono text-white">admin@lqmarket.vn</span></div>
          <div className="text-slate-400">Mật khẩu: <span className="font-mono text-white">admin123</span></div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={openLoginModal}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-red-500/20 cursor-pointer"
          >
            Đăng Nhập Quản Trị Viên
          </button>
          <button
            onClick={() => setCurrentView('home')}
            className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Về Trang Chủ
          </button>
        </div>
      </div>
    );
  }

  // Dispute resolution confirm modal state
  const [resolvingDispute, setResolvingDispute] = useState<{
    orderId: string;
    type: 'refund_buyer' | 'payout_seller';
    orderCode: string;
    amount: number;
    buyerName: string;
    sellerName: string;
  } | null>(null);

  // Real Counts & Stats computed strictly from live state
  const pendingAccounts = accounts.filter(a => a.status === 'pending');
  const approvedAccounts = accounts.filter(a => a.status === 'approved');
  const soldAccounts = accounts.filter(a => a.status === 'sold');
  const disputedOrders = orders.filter(o => o.status === 'disputed');
  const completedOrders = orders.filter(o => o.status === 'completed');
  const pendingWithdrawals = transactions.filter(t => t.type === 'withdraw' && t.status === 'pending');

  // Real Marketplace Revenue: 5% fee from actual completed transactions
  const totalCompletedOrderValue = completedOrders.reduce((sum, o) => sum + (o?.totalAmount || 0), 0);
  const totalMarketplaceRevenue = Math.round(totalCompletedOrderValue * 0.05);
  const totalSystemUserBalance = (allUsers || []).reduce((sum, u) => sum + (u?.balance || 0), 0);
  const totalEscrowHolding = (allUsers || []).reduce((sum, u) => sum + (u?.pendingBalance || 0), 0);

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleApprove = (accountId: string) => {
    updateAccountStatus(accountId, 'approved');
    showNotification('Đã phê duyệt tài khoản thành công! Acc đã xuất hiện công khai trên sàn.');
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionModalAccId) return;
    updateAccountStatus(
      rejectionModalAccId,
      'rejected',
      rejectionReasonInput.trim() || 'Hình ảnh hoặc thông tin tài khoản chưa đạt tiêu chuẩn.'
    );
    setRejectionModalAccId(null);
    setRejectionReasonInput('');
    showNotification('Đã từ chối duyệt tài khoản.');
  };

  const handleExecuteDisputeResolution = () => {
    if (!resolvingDispute) return;
    adminResolveDispute(resolvingDispute.orderId, resolvingDispute.type);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}

    if (resolvingDispute.type === 'refund_buyer') {
      showNotification(`Đã hoàn tiền 100% (${resolvingDispute.amount.toLocaleString('vi-VN')}đ) cho người mua ${resolvingDispute.buyerName}!`);
    } else {
      showNotification(`Đã bác bỏ khiếu nại và giải ngân (+${resolvingDispute.amount.toLocaleString('vi-VN')}đ) cho người bán ${resolvingDispute.sellerName}!`);
    }

    setResolvingDispute(null);
  };

  // Helper to create sample dispute for quick testing if empty
  const handleCreateTestDispute = () => {
    const activeOrder = orders.find(o => o.status === 'account_delivered' || o.status === 'inspecting');
    if (activeOrder) {
      disputeOrder(activeOrder.id, 'Mật khẩu đăng nhập Garena báo sai, không vào được game.');
      setActiveTab('disputes');
      showNotification(`Đã tạo khiếu nại kiểm thử cho đơn hàng ${activeOrder.orderCode}`);
    } else {
      showNotification('Vui lòng thực hiện một đơn mua trước để có đơn hàng tạo khiếu nại.');
    }
  };

  // User Management Filter & Handlers
  const filteredUsers = (allUsers || []).filter(u => {
    if (!u || !u.id) return false;
    const q = userSearchTerm.trim().toLowerCase();
    const matchSearch =
      q === '' ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q)) ||
      (u.id && u.id.toLowerCase().includes(q));

    if (!matchSearch) return false;

    if (userRoleFilter === 'all') return true;
    if (userRoleFilter === 'buyer') return u.role === 'buyer';
    if (userRoleFilter === 'seller') return u.role === 'seller';
    if (userRoleFilter === 'admin') return u.role === 'admin';
    if (userRoleFilter === 'verified') return Boolean(u.isVerifiedSeller);
    return true;
  });

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name.trim() || !newUserForm.email.trim() || !newUserForm.password.trim()) {
      alert('Vui lòng điền họ tên, email và mật khẩu.');
      return;
    }
    const balanceNum = Math.max(0, parseFloat(newUserForm.balance) || 0);
    const created = adminCreateUser({
      name: newUserForm.name.trim(),
      email: newUserForm.email.trim(),
      phone: newUserForm.phone.trim(),
      password: newUserForm.password.trim(),
      role: newUserForm.role,
      balance: balanceNum,
      isVerifiedSeller: newUserForm.isVerifiedSeller,
      sellerTier: newUserForm.sellerTier,
      bio: newUserForm.bio.trim()
    });
    if (created) {
      showNotification(`Đã tạo thành công tài khoản "${created.name}"`);
      setIsAddUserModalOpen(false);
      setNewUserForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'buyer',
        balance: '0',
        isVerifiedSeller: false,
        sellerTier: 'STANDARD',
        bio: ''
      });
    }
  };

  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    adminUpdateUser(editingUser.id, {
      name: editingUser.name,
      email: editingUser.email,
      phone: editingUser.phone,
      role: editingUser.role,
      isVerifiedSeller: editingUser.isVerifiedSeller,
      sellerTier: editingUser.sellerTier,
      bio: editingUser.bio,
      rating: editingUser.rating
    });
    showNotification(`Đã cập nhật thông tin thành viên "${editingUser.name}"`);
    setEditingUser(null);
  };

  const handleAdjustBalanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingUserBalance) return;
    const num = Math.abs(parseFloat(adjustingUserBalance.amount) || 0);
    if (num <= 0) return;
    const delta = adjustingUserBalance.isAdding ? num : -num;
    adminAdjustUserBalance(
      adjustingUserBalance.user.id,
      delta,
      adjustingUserBalance.reason || (adjustingUserBalance.isAdding ? 'Admin nạp tiền ví' : 'Admin trừ tiền ví')
    );
    showNotification(
      `Đã ${adjustingUserBalance.isAdding ? 'cộng' : 'trừ'} ${num.toLocaleString('vi-VN')}đ cho "${adjustingUserBalance.user.name}"`
    );
    setAdjustingUserBalance(null);
  };

  const handleDeleteUserSubmit = () => {
    if (!deletingUser) return;
    if (deletingUser.id === currentUser.id) {
      alert('Không thể xóa tài khoản Admin đang đăng nhập.');
      return;
    }
    adminDeleteUser(deletingUser.id);
    showNotification(`Đã xóa tài khoản "${deletingUser.name}" khỏi hệ thống.`);
    setDeletingUser(null);
  };

  return (
    <div className="space-y-8 pb-12 text-left">
      {/* Action Success Toast Banner */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between shadow-xl animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-400 hover:text-white cursor-pointer">
            <XCircle size={14} />
          </button>
        </div>
      )}

      {/* Admin Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-red-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-red-950/30 via-slate-900 to-slate-950 shadow-2xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-red-400 bg-red-500/15 border border-red-500/30 px-3 py-1 rounded-lg mb-1">
            <ShieldAlert size={14} />
            <span>SUPER ADMIN CONTROL CENTER • DỮ LIỆU THẬT 100%</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            TRUNG TÂM KIỂM DUYỆT & VẬN HÀNH LQMARKET
          </h1>
          <p className="text-xs text-slate-400">
            Duyệt tin đăng bán, xử lý khiếu nại trung gian Escrow và quản lý người dùng toàn hệ thống.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto max-w-full pb-1.5 sm:pb-1.5 scrollbar-none">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'pending'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Duyệt ACC</span>
            {pendingAccounts.length > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {pendingAccounts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'accounts'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tất Cả Acc ({accounts.length})
          </button>

          <button
            onClick={() => setActiveTab('disputes')}
            className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'disputes'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle size={13} />
            <span>Khiếu Nại & Tranh Chấp</span>
            {disputedOrders.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-bounce">
                {disputedOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'payouts'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wallet size={13} />
            <span>Giải Ngân & Rút Tiền</span>
            {pendingWithdrawals.length > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full animate-bounce">
                {pendingWithdrawals.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'users'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Người Dùng ({allUsers.length})
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'settings'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Hệ Thống
          </button>
        </div>
      </div>

      {/* TOP STATS ROW (100% REAL DYNAMIC CALCULATIONS) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Doanh thu sàn (5%)</span>
            <DollarSign size={14} className="text-amber-400" />
          </div>
          <div className="text-lg sm:text-xl font-black text-amber-400">
            {totalMarketplaceRevenue.toLocaleString('vi-VN')}đ
          </div>
          <div className="text-[10px] text-slate-500">Từ {completedOrders.length} đơn hoàn tất</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tổng đơn hàng</span>
            <ShoppingBag size={14} className="text-cyan-400" />
          </div>
          <div className="text-lg sm:text-xl font-black text-cyan-400">
            {orders.length}
          </div>
          <div className="text-[10px] text-slate-500">
            {completedOrders.length} xong • {orders.filter(o => o.status === 'account_delivered').length} đang kiểm tra
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Acc đang bán</span>
            <Layers size={14} className="text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-400">
            {approvedAccounts.length}
          </div>
          <div className="text-[10px] text-slate-500">{soldAccounts.length} acc đã bán thành công</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
            <span>Chờ duyệt bài ⏳</span>
            <ShieldAlert size={14} />
          </div>
          <div className="text-lg sm:text-xl font-black text-amber-400">
            {pendingAccounts.length}
          </div>
          <div className="text-[10px] text-slate-500">Cần admin kiểm tra</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Thành viên</span>
            <Users size={14} className="text-purple-400" />
          </div>
          <div className="text-lg sm:text-xl font-black text-purple-400">
            {allUsers.length}
          </div>
          <div className="text-[10px] text-slate-500">
            {allUsers.filter(u => u.role === 'seller').length} Seller • {allUsers.filter(u => u.role === 'buyer').length} Buyer
          </div>
        </div>
      </div>

      {/* TAB 1: PENDING REVIEWS QUEUE */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span>Hàng Đợi Duyệt Tin Đăng ({pendingAccounts.length} tài khoản)</span>
            </h2>
          </div>

          {pendingAccounts.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
              <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">Tất cả bài đăng đã được kiểm duyệt!</h3>
              <p className="text-xs text-slate-400">Hiện không có tài khoản nào trong hàng đợi chờ duyệt.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingAccounts.map(acc => (
                <div
                  key={acc.id}
                  className="bg-slate-900 border border-amber-500/40 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/30">
                        #{acc.code}
                      </span>
                      <RankBadge rank={acc.rank} size="sm" />
                      <span className="text-xs text-slate-400">
                        Người đăng: <strong className="text-white">{acc.sellerName}</strong>
                      </span>
                    </div>

                    <div className="text-sm font-black text-amber-400">
                      Giá niêm yết: {acc.price.toLocaleString('vi-VN')}đ
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-3">
                      <img
                        src={acc.images[0]}
                        alt={acc.title}
                        className="w-full aspect-[16/10] rounded-xl object-cover border border-slate-800"
                      />
                    </div>

                    <div className="lg:col-span-9 space-y-2 text-xs">
                      <h3 className="text-sm font-bold text-white">{acc.title}</h3>
                      <div className="flex flex-wrap gap-3 text-slate-300">
                        <span>⚔️ {acc.heroesCount} Tướng</span>
                        <span>🎨 {acc.skinsCount} Skin</span>
                        <span>🛡️ {acc.runePages}</span>
                        <span>🌐 Server: {acc.server}</span>
                        <span className="text-emerald-400">🔒 {acc.credentials.securityType}</span>
                      </div>

                      <p className="text-slate-400 italic bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                        "{acc.description}"
                      </p>

                      {/* Secret verification preview for Admin only */}
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 flex items-center gap-4">
                        <span>User: <strong className="text-white">{acc.credentials.username}</strong></span>
                        <span>Pass: <strong className="text-amber-300">{acc.credentials.password}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Approve / Reject Actions */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => setSelectedAccountId(acc.id)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>Xem chi tiết</span>
                    </button>

                    <button
                      onClick={() => setRejectionModalAccId(acc.id)}
                      className="px-3.5 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-bold rounded-xl border border-rose-800/60 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle size={14} />
                      <span>Từ Chối Duyệt</span>
                    </button>

                    <button
                      onClick={() => handleApprove(acc.id)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 size={14} />
                      <span>PHÊ DUYỆT & LÊN SÀN</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ALL ACCOUNTS MANAGER */}
      {activeTab === 'accounts' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Quản Lý Toàn Bộ {accounts.length} Tài Khoản</h3>
          </div>

          <div className="divide-y divide-slate-800">
            {accounts.map(acc => (
              <div
                key={acc.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={acc.images[0]}
                    alt={acc.title}
                    className="w-16 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-400">#{acc.code}</span>
                      <RankBadge rank={acc.rank} size="sm" />
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          acc.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : acc.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-300'
                            : acc.status === 'sold'
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {acc.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white mt-1 line-clamp-1">{acc.title}</h4>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Seller: {acc.sellerName} • Giá: {acc.price.toLocaleString('vi-VN')}đ
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => setSelectedAccountId(acc.id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Eye size={12} />
                    <span>Xem</span>
                  </button>

                  <button
                    onClick={() => {
                      deleteAccount(acc.id);
                      showNotification(`Đã xóa tài khoản #${acc.code}`);
                    }}
                    className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={12} />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DISPUTES RESOLVER (ESCROW ARBITRATION CENTER) */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle size={16} className="text-rose-400" />
              <span>Xử Lý Tranh Chấp & Khiếu Nại Đơn Hàng ({disputedOrders.length})</span>
            </h2>

            <button
              onClick={handleCreateTestDispute}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1 cursor-pointer"
            >
              <Sparkles size={12} />
              <span>Tạo khiếu nại mẫu để test xử lý</span>
            </button>
          </div>

          {disputedOrders.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3 shadow-xl">
              <CheckCircle2 size={40} className="text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Không Có Khiếu Nại Nào Cần Xử Lý</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Tất cả giao dịch Escrow hiện tại đang hoạt động an toàn hoặc đã được giải quyết xong.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {disputedOrders.map(order => {
                const buyer = allUsers.find(u => u.id === order.buyerId);
                const seller = allUsers.find(u => u.id === order.sellerId);

                return (
                  <div
                    key={order.id}
                    className="bg-slate-900 border border-rose-500/50 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-rose-500/20 text-rose-300 px-2.5 py-1 rounded-lg border border-rose-500/30">
                          {order.orderCode}
                        </span>
                        <span className="text-xs text-slate-400">
                          Acc: <strong className="text-white">#{order.accountCode}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-amber-400">
                          Tiền giữ Escrow: {order.totalAmount.toLocaleString('vi-VN')}đ
                        </span>
                        <span className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold px-2 py-0.5 rounded-full">
                          ĐANG TRANH CHẤP
                        </span>
                      </div>
                    </div>

                    {/* Account Info */}
                    <div>
                      <h4 className="text-sm font-bold text-white">{order.accountTitle}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        {/* Buyer Details */}
                        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                          <span className="text-[10px] font-bold text-cyan-400 block uppercase">
                            Khách Mua Hàng (Khiếu Nại):
                          </span>
                          <p className="font-bold text-white">{order.buyerName}</p>
                          <p className="text-slate-400 flex items-center gap-1 text-[11px]">
                            <Mail size={11} /> {buyer?.email || 'N/A'} • <Phone size={11} /> {buyer?.phone || 'N/A'}
                          </p>
                        </div>

                        {/* Seller Details */}
                        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                          <span className="text-[10px] font-bold text-amber-400 block uppercase">
                            Người Bán (Shop/Seller):
                          </span>
                          <p className="font-bold text-white">{order.sellerName}</p>
                          <p className="text-slate-400 flex items-center gap-1 text-[11px]">
                            <Mail size={11} /> {seller?.email || 'N/A'} • <Phone size={11} /> {seller?.phone || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Credentials inspection */}
                    {order.credentialsDelivered && (
                      <div className="p-3 rounded-2xl bg-slate-950 border border-amber-500/30 text-xs font-mono space-y-1">
                        <span className="text-[10px] font-sans font-bold text-amber-400 block">
                          🔑 THÔNG TIN GARENA ĐÃ BÀN GIAO CHO KHÁCH:
                        </span>
                        <div className="flex flex-wrap gap-4 text-slate-300">
                          <span>User: <strong className="text-white">{order.credentialsDelivered.username}</strong></span>
                          <span>Pass: <strong className="text-amber-300">{order.credentialsDelivered.password}</strong></span>
                          <span>Bảo mật: <strong className="text-emerald-400">{order.credentialsDelivered.securityType}</strong></span>
                        </div>
                      </div>
                    )}

                    {/* Dispute Reason from Buyer */}
                    <div className="p-3.5 bg-rose-950/40 border border-rose-500/30 rounded-2xl text-xs text-rose-300 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-rose-400">
                        <AlertTriangle size={14} />
                        <span>Nội dung khiếu nại của người mua:</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed font-medium">"{order.disputeReason}"</p>
                    </div>

                    {/* Decision Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                      <button
                        onClick={() =>
                          setResolvingDispute({
                            orderId: order.id,
                            type: 'refund_buyer',
                            orderCode: order.orderCode,
                            amount: order.totalAmount,
                            buyerName: order.buyerName,
                            sellerName: order.sellerName
                          })
                        }
                        className="w-full sm:w-auto px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw size={13} />
                        <span>↩️ Chấp nhận khiếu nại: Hoàn 100% Tiền Cho Người Mua</span>
                      </button>

                      <button
                        onClick={() =>
                          setResolvingDispute({
                            orderId: order.id,
                            type: 'payout_seller',
                            orderCode: order.orderCode,
                            amount: order.totalAmount,
                            buyerName: order.buyerName,
                            sellerName: order.sellerName
                          })
                        }
                        className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 size={13} />
                        <span>💰 Bác bỏ khiếu nại: Giải Ngân Cho Người Bán</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: USERS & SELLERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Header & Actions Bar */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-amber-400" />
                <h3 className="text-sm font-bold text-white">Quản Lý {allUsers.length} Tài Khoản Người Dùng</h3>
              </div>
              <p className="text-xs text-slate-400">
                Tổng số dư ví toàn sàn: <strong className="text-amber-400 font-bold">{totalSystemUserBalance.toLocaleString('vi-VN')}đ</strong>
              </p>
            </div>

            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer self-stretch sm:self-auto justify-center"
            >
              <UserPlus size={15} />
              <span>Thêm Thành Viên Mới</span>
            </button>
          </div>

          {/* Search & Filter bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={userSearchTerm}
                onChange={e => setUserSearchTerm(e.target.value)}
                placeholder="Tìm kiếm theo Tên, Email, SĐT, User ID..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl focus:outline-none focus:border-amber-500 placeholder-slate-500"
              />
              {userSearchTerm && (
                <button
                  onClick={() => setUserSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'Tất Cả' },
                { id: 'buyer', label: 'Khách Mua' },
                { id: 'seller', label: 'Người Bán' },
                { id: 'verified', label: '✓ Verified' },
                { id: 'admin', label: '🛡️ Admin' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setUserRoleFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    userRoleFilter === tab.id
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* User List */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            {filteredUsers.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-xs space-y-2">
                <Users size={28} className="mx-auto text-slate-600" />
                <p>Không tìm thấy thành viên nào phù hợp với bộ lọc.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {filteredUsers.map(user => (
                  <div
                    key={user.id}
                    className="p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
                  >
                    {/* User Info */}
                    <div className="flex items-start sm:items-center gap-3.5">
                      <img
                        src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80'}
                        alt={user.name || 'User'}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-500/30 shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-white">{user.name || 'Thành viên'}</h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              user.role === 'admin'
                                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                : user.role === 'seller'
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                            }`}
                          >
                            {user.role === 'admin' ? 'SUPER ADMIN' : user.role === 'seller' ? 'SELLER (SHOP)' : 'BUYER (KHÁCH)'}
                          </span>

                          {user.isVerifiedSeller && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                              <ShieldCheck size={10} /> Verified
                            </span>
                          )}

                          {user.sellerTier && user.sellerTier !== 'STANDARD' && (
                            <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 font-black px-1.5 py-0.2 rounded uppercase">
                              {user.sellerTier}
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="flex items-center gap-1"><Mail size={11} /> {user.email || 'N/A'}</span>
                          <span>• SĐT: <strong className="text-slate-300">{user.phone || 'Chưa cập nhật'}</strong></span>
                          <span>• ID: <code className="text-slate-500 font-mono text-[10px]">{user.id}</code></span>
                          {user.completedSales !== undefined && user.completedSales > 0 && (
                            <span className="text-emerald-400">• Đã bán: <strong>{user.completedSales}</strong> đơn</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Balance & Actions */}
                    <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                      {/* Wallet Balance Box */}
                      <div className="p-2 px-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                        <Wallet size={14} className="text-amber-400" />
                        <div>
                          <div className="text-[9px] text-slate-500 uppercase font-bold">Số dư ví:</div>
                          <div className="text-xs font-black text-amber-400">
                            {(user.balance || 0).toLocaleString('vi-VN')}đ
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() =>
                            setAdjustingUserBalance({
                              user,
                              amount: '100000',
                              isAdding: true,
                              reason: 'Admin nạp tiền điều chỉnh ví'
                            })
                          }
                          className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/40 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          title="Nạp / Trừ tiền ví"
                        >
                          <Plus size={13} className="text-emerald-400" />
                          <span className="hidden sm:inline">Ví tiền</span>
                        </button>

                        <button
                          onClick={() => setEditingUser({ ...user })}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-amber-950/60 text-slate-300 hover:text-amber-400 border border-slate-700 hover:border-amber-500/40 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          title="Chỉnh sửa thông tin thành viên"
                        >
                          <Edit2 size={13} className="text-amber-400" />
                          <span className="hidden sm:inline">Sửa</span>
                        </button>

                        {user.id !== currentUser.id && (
                          <button
                            onClick={() => setDeletingUser(user)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 text-xs transition-colors cursor-pointer"
                            title="Xóa tài khoản"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PAYOUTS & WITHDRAWALS */}
      {activeTab === 'payouts' && <AdminPayoutManagement />}

      {/* TAB 5: SYSTEM SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Settings size={16} className="text-amber-400" />
            <span>Cấu Hình Vận Hành Hệ Thống Sàn LQMarket</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Phí trung gian giao dịch sàn:</label>
              <div className="text-lg font-black text-amber-400">5.0% (Người bán trả sau khi đơn hoàn tất)</div>
              <p className="text-[11px] text-slate-500">Miễn phí 100% cho người mua</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Thời gian khiếu nại tối đa:</label>
              <div className="text-lg font-black text-cyan-400">24 Giờ</div>
              <p className="text-[11px] text-slate-500">Sau 24h không khiếu nại, hệ thống tự động giải ngân cho seller</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Trạng Thái Đồng Bộ Firebase Firestore Cloud:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    cloudSyncStatus === 'synced' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    cloudSyncStatus === 'syncing' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {cloudSyncStatus === 'synced' ? '🟢 CLOUD SYNCED' : cloudSyncStatus === 'syncing' ? '🟡 SYNCING...' : '⚪ OFFLINE'}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">Database ID: <code className="text-amber-400">ai-studio-lqmarketsnmuabna-5c65ea81-a93a-42d1-adc3-f6cddc5ddc25</code></p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Wipe Cloud DB */}
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-800/40 space-y-3 flex flex-col justify-between">
                <div>
                  <h5 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <Trash2 size={14} />
                    <span>Xoá Toàn Bộ Dữ Liệu Firebase</span>
                  </h5>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Xoá vĩnh viễn toàn bộ tài khoản đăng bán, đơn hàng, giao dịch ví và tin nhắn trên Firebase Firestore (giữ lại tài khoản Super Admin).
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isWipingData}
                  onClick={() => setShowWipeConfirmModal(true)}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl border border-rose-500 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-950/50"
                >
                  <Trash2 size={13} />
                  <span>{isWipingData ? 'Đang xoá dữ liệu...' : 'Xoá Sạch Toàn Bộ Firebase'}</span>
                </button>
              </div>

              {/* Seed Sample Demo Accounts */}
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 space-y-3 flex flex-col justify-between">
                <div>
                  <h5 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <Sparkles size={14} />
                    <span>Nạp Dữ Liệu Mẫu Lên Firebase</span>
                  </h5>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Nạp lại danh sách tài khoản Liên Quân demo (VIP, Chiến Tướng, Nakroth Thứ Nguyên...) và user mẫu lên Firebase Firestore.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isSeedingData}
                  onClick={async () => {
                    setIsSeedingData(true);
                    const res = await seedSampleData();
                    setIsSeedingData(false);
                    showNotification(res.message);
                  }}
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl border border-cyan-500 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-950/50"
                >
                  <RefreshCw size={13} className={isSeedingData ? 'animate-spin' : ''} />
                  <span>{isSeedingData ? 'Đang nạp dữ liệu...' : 'Nạp Lại Dữ Liệu Mẫu (Seed)'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DISPUTE RESOLUTION CONFIRMATION MODAL */}
      {resolvingDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
              <ShieldAlert size={20} />
              <span>Xác Nhận Xử Lý Trọng Tài Escrow</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span>Đơn hàng:</span>
                <strong className="text-white font-mono">{resolvingDispute.orderCode}</strong>
              </div>
              <div className="flex justify-between">
                <span>Số tiền xử lý:</span>
                <strong className="text-amber-400 font-black">{resolvingDispute.amount.toLocaleString('vi-VN')}đ</strong>
              </div>
              <div className="flex justify-between">
                <span>Quyết định trọng tài:</span>
                <strong className={resolvingDispute.type === 'refund_buyer' ? 'text-purple-400' : 'text-emerald-400'}>
                  {resolvingDispute.type === 'refund_buyer' ? 'Hoàn tiền 100% cho Người Mua' : 'Giải ngân cho Người Bán'}
                </strong>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {resolvingDispute.type === 'refund_buyer'
                ? `Hệ thống sẽ hoàn trả ${resolvingDispute.amount.toLocaleString('vi-VN')}đ vào ví của người mua (${resolvingDispute.buyerName}) và đóng đơn hàng.`
                : `Hệ thống sẽ giải ngân +${resolvingDispute.amount.toLocaleString('vi-VN')}đ vào số dư khả dụng của người bán (${resolvingDispute.sellerName}) và hoàn tất đơn hàng.`}
            </p>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setResolvingDispute(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteDisputeResolution}
                className={`px-4 py-2 text-white text-xs font-black rounded-xl shadow-lg cursor-pointer ${
                  resolvingDispute.type === 'refund_buyer'
                    ? 'bg-purple-600 hover:bg-purple-500'
                    : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                Xác Nhận Thực Hiện
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectionModalAccId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <XCircle size={18} />
              <span>Từ Chối Duyệt Tin Đăng</span>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Nhập lý do từ chối (Gửi thông báo cho Seller):
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReasonInput}
                  onChange={e => setRejectionReasonInput(e.target.value)}
                  placeholder="VD: Sai thông tin đăng nhập, ảnh bìa mờ, giá bán không hợp lý..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setRejectionModalAccId(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Gửi Thông Báo Từ Chối
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WIPE FIREBASE CONFIRMATION MODAL */}
      {showWipeConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-rose-800/80 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl shadow-rose-950/40">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
              <AlertTriangle size={20} />
              <span>Xác Nhận Xoá Toàn Bộ Dữ Liệu Firebase?</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Hành động này sẽ <strong>xoá vĩnh viễn toàn bộ</strong> tài khoản đăng bán, đơn hàng, giao dịch ví tiền và tin nhắn chat đang lưu trên cơ sở dữ liệu đám mây <strong>Firebase Firestore</strong>.
            </p>
            <p className="text-[11px] text-slate-400">
              * Tài khoản Super Admin (<code className="text-amber-400">admin@lqmarket.vn</code>) sẽ được giữ lại để bạn có thể tiếp tục quản trị hệ thống.
            </p>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowWipeConfirmModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isWipingData}
                onClick={async () => {
                  setIsWipingData(true);
                  setShowWipeConfirmModal(false);
                  const res = await clearAllFirebaseData();
                  setIsWipingData(false);
                  showNotification(res.message);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-lg shadow-rose-950/50 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>Xác Nhận Xoá Sạch</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <UserPlus size={18} />
                <span>Tạo Tài Khoản Thành Viên Mới</span>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Họ và tên hiển thị *</label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={e => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder="VD: Nguyễn Văn A"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Email đăng nhập *</label>
                  <input
                    type="email"
                    required
                    value={newUserForm.email}
                    onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    placeholder="user@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Mật khẩu khởi tạo *</label>
                  <input
                    type="password"
                    required
                    value={newUserForm.password}
                    onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Số điện thoại / Zalo</label>
                  <input
                    type="text"
                    value={newUserForm.phone}
                    onChange={e => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                    placeholder="0987654321"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Số dư ví ban đầu (VNĐ)</label>
                  <input
                    type="number"
                    value={newUserForm.balance}
                    onChange={e => setNewUserForm({ ...newUserForm, balance: e.target.value })}
                    placeholder="0"
                    min="0"
                    step="10000"
                    className="w-full bg-slate-950 border border-slate-800 text-amber-400 font-bold rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Vai trò hệ thống</label>
                  <select
                    value={newUserForm.role}
                    onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value as UserRole })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                  >
                    <option value="buyer">Khách Mua Hàng (Buyer)</option>
                    <option value="seller">Người Bán Hàng (Seller)</option>
                    <option value="admin">Quản Trị Viên (Super Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Cấp bậc Seller</label>
                  <select
                    value={newUserForm.sellerTier}
                    onChange={e => setNewUserForm({ ...newUserForm, sellerTier: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                  >
                    <option value="STANDARD">Standard (Chuẩn)</option>
                    <option value="PRO">Pro Seller (Chuyên nghiệp)</option>
                    <option value="VIP">VIP Merchant (Đối tác VIP)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="new-verified-seller"
                  checked={newUserForm.isVerifiedSeller}
                  onChange={e => setNewUserForm({ ...newUserForm, isVerifiedSeller: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="new-verified-seller" className="text-slate-300 text-xs font-semibold cursor-pointer">
                  Cấp huy hiệu xác thực <strong>Verified Seller Uy Tín</strong>
                </label>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Giới thiệu shop / Bio</label>
                <textarea
                  rows={2}
                  value={newUserForm.bio}
                  onChange={e => setNewUserForm({ ...newUserForm, bio: e.target.value })}
                  placeholder="VD: Shop chuyên cung cấp nick Liên Quân uy tín, bảo hành 100%..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl shadow-lg cursor-pointer"
                >
                  Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Edit2 size={18} />
                <span>Chỉnh Sửa Thông Tin Thành Viên</span>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Họ và tên</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editingUser.email}
                    onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Số điện thoại / Zalo</label>
                  <input
                    type="text"
                    value={editingUser.phone || ''}
                    onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })}
                    placeholder="0987654321"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Vai trò hệ thống</label>
                  <select
                    value={editingUser.role}
                    onChange={e => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                  >
                    <option value="buyer">Khách Mua Hàng (Buyer)</option>
                    <option value="seller">Người Bán Hàng (Seller)</option>
                    <option value="admin">Quản Trị Viên (Super Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Cấp bậc Seller</label>
                  <select
                    value={editingUser.sellerTier || 'STANDARD'}
                    onChange={e => setEditingUser({ ...editingUser, sellerTier: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="PRO">Pro Seller</option>
                    <option value="VIP">VIP Merchant</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="edit-verified-seller"
                  checked={Boolean(editingUser.isVerifiedSeller)}
                  onChange={e => setEditingUser({ ...editingUser, isVerifiedSeller: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="edit-verified-seller" className="text-slate-300 text-xs font-semibold cursor-pointer">
                  Cấp chứng nhận <strong>Verified Seller Uy Tín</strong>
                </label>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Giới thiệu shop / Bio</label>
                <textarea
                  rows={2}
                  value={editingUser.bio || ''}
                  onChange={e => setEditingUser({ ...editingUser, bio: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg cursor-pointer"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADJUST USER BALANCE MODAL */}
      {adjustingUserBalance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Wallet size={18} />
                <span>Điều Chỉnh Số Dư Ví Thành Viên</span>
              </div>
              <button
                onClick={() => setAdjustingUserBalance(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Thành viên:</span>
                <strong className="text-white">{adjustingUserBalance.user.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-300 font-mono">{adjustingUserBalance.user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Số dư hiện tại:</span>
                <strong className="text-amber-400 font-black">
                  {(adjustingUserBalance.user.balance || 0).toLocaleString('vi-VN')}đ
                </strong>
              </div>
            </div>

            <form onSubmit={handleAdjustBalanceSubmit} className="space-y-4 text-xs">
              {/* Type toggle */}
              <div>
                <label className="text-slate-300 font-bold block mb-1.5">Loại thao tác:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustingUserBalance({ ...adjustingUserBalance, isAdding: true })}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      adjustingUserBalance.isAdding
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    <Plus size={14} />
                    <span>Cộng Tiền Ví (+)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustingUserBalance({ ...adjustingUserBalance, isAdding: false })}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      !adjustingUserBalance.isAdding
                        ? 'bg-rose-500 text-slate-950 font-black shadow-lg shadow-rose-500/20'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    <Minus size={14} />
                    <span>Trừ Tiền Ví (-)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Số tiền (VNĐ):</label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="10000"
                  value={adjustingUserBalance.amount}
                  onChange={e => setAdjustingUserBalance({ ...adjustingUserBalance, amount: e.target.value })}
                  placeholder="100000"
                  className="w-full bg-slate-950 border border-slate-800 text-amber-400 font-black text-sm rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Lý do điều chỉnh (Lưu vào lịch sử ví):</label>
                <input
                  type="text"
                  required
                  value={adjustingUserBalance.reason}
                  onChange={e => setAdjustingUserBalance({ ...adjustingUserBalance, reason: e.target.value })}
                  placeholder="VD: Admin nạp bù tiền khuyến mãi, hoàn phí sự kiện..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingUserBalance(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-slate-950 font-black rounded-xl shadow-lg cursor-pointer ${
                    adjustingUserBalance.isAdding
                      ? 'bg-emerald-500 hover:bg-emerald-400'
                      : 'bg-rose-500 hover:bg-rose-400'
                  }`}
                >
                  Xác Nhận {adjustingUserBalance.isAdding ? 'Cộng Tiền' : 'Trừ Tiền'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE USER CONFIRMATION MODAL */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-rose-800/80 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
              <AlertTriangle size={20} />
              <span>Xóa Tài Khoản Thành Viên?</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn xóa tài khoản <strong>"{deletingUser.name}"</strong> ({deletingUser.email}) khỏi hệ thống và Firebase Firestore?
            </p>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteUserSubmit}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>Xác Nhận Xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
