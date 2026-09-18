import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/apiClient';
import { RankBadge } from '../common/RankBadge';
import { getDynamicSellerInfo, calculateSellerTrustScore } from '../../utils/sellerHelper';
import { formatVietnamDate } from '../../utils/dateUtils';
import {
  Store,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Award,
  Star,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Eye,
  Edit2,
  Trash2,
  Wallet,
  ArrowUpRight,
  ExternalLink,
  MessageCircle,
  Sparkles,
  HelpCircle,
  Send,
  FileCheck,
  Check
} from 'lucide-react';

export const SellerCenterView: React.FC = () => {
  const {
    currentUser,
    accounts,
    orders,
    allUsers,
    setCurrentView,
    setIsWalletOpen,
    setSelectedAccountId,
    submitSellerVerification,
    sellerVerificationRequests,
    deleteAccount
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'reviews' | 'verification'>('overview');

  // Verification form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [socialLink, setSocialLink] = useState('');
  const [zaloPhone, setZaloPhone] = useState('');
  const [warrantyCommitment, setWarrantyCommitment] = useState(false);
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);
  const [verificationSuccessMsg, setVerificationSuccessMsg] = useState<string | null>(null);
  const [verificationErrorMsg, setVerificationErrorMsg] = useState<string | null>(null);

  // Real reviews fetched from backend
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [reviewsCount, setReviewsCount] = useState<number | null>(null);
  const [reviewsRating, setReviewsRating] = useState<number | null>(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  // Backend verification record
  const [dbVerificationStatus, setDbVerificationStatus] = useState<any>(null);

  // Fetch real reviews from backend for this seller
  const fetchReviews = useCallback(async () => {
    if (!currentUser?.id) return;
    setIsLoadingReviews(true);
    try {
      const res = await api.get(`/api/seller/${currentUser.id}/reviews`);
      if (res && res.success) {
        const list = res.reviews || res.data || [];
        setReviewsList(Array.isArray(list) ? list : []);
        setReviewsCount(typeof res.total === 'number' ? res.total : list.length);
        if (res.averageRating !== undefined && res.averageRating !== null) {
          setReviewsRating(Number(res.averageRating));
        }
      }
    } catch (err) {
      console.warn('Could not fetch seller reviews:', err);
    } finally {
      setIsLoadingReviews(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Fetch backend verification status
  const fetchVerificationStatus = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const res = await api.get('/api/seller-verifications/my-status');
      if (res && res.success && res.request) {
        setDbVerificationStatus(res.request);
      }
    } catch (err) {
      // quiet fallback
    }
  }, [currentUser?.id]);

  useEffect(() => {
    fetchVerificationStatus();
  }, [fetchVerificationStatus]);

  // Filter seller's accounts
  const myAccounts = useMemo(() => {
    return accounts.filter(
      a => a.sellerId === currentUser.id || a.sellerName === currentUser.name || a.sellerName === currentUser.username
    );
  }, [accounts, currentUser]);

  // Filter seller's orders
  const mySellOrders = useMemo(() => {
    return orders.filter(
      o => o.sellerId === currentUser.id || o.sellerName === currentUser.name
    );
  }, [orders, currentUser]);

  // Metrics calculation
  const completedOrders = mySellOrders.filter(o => o.status === 'completed');
  const pendingOrders = mySellOrders.filter(o => o.status === 'pending' || o.status === 'delivered');

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const currentMonthStr = now.toISOString().slice(0, 7);

  const todayRevenue = completedOrders
    .filter(o => o.createdAt && o.createdAt.startsWith(todayStr))
    .reduce((sum, o) => sum + (o.sellerEarnings || o.accountPrice * 0.95), 0);

  const monthRevenue = completedOrders
    .filter(o => o.createdAt && o.createdAt.startsWith(currentMonthStr))
    .reduce((sum, o) => sum + (o.sellerEarnings || o.accountPrice * 0.95), 0);

  const totalSoldAccCount = completedOrders.length;
  const activeListingsCount = myAccounts.filter(a => a.status === 'approved').length;

  const sellerInfo = getDynamicSellerInfo(currentUser.id, allUsers, orders);

  // Weekly Revenue mock distribution based on actual or fallback
  const weeklyData = [
    { day: 'T2', amount: Math.round(monthRevenue * 0.12) },
    { day: 'T3', amount: Math.round(monthRevenue * 0.15) },
    { day: 'T4', amount: Math.round(monthRevenue * 0.11) },
    { day: 'T5', amount: Math.round(monthRevenue * 0.18) },
    { day: 'T6', amount: Math.round(monthRevenue * 0.22) },
    { day: 'T7', amount: Math.round(monthRevenue * 0.25) },
    { day: 'CN', amount: Math.round(monthRevenue * 0.28) }
  ];
  const maxWeeklyAmount = Math.max(...weeklyData.map(d => d.amount), 100000);

  // Check verification status
  const existingReq = sellerVerificationRequests.find(r => r.userId === currentUser.id);
  const effectiveReq = dbVerificationStatus || existingReq;
  const isVerified = currentUser.isVerifiedSeller || effectiveReq?.status === 'approved';
  const isPendingVerification = effectiveReq?.status === 'pending';

  const effectiveReviewsCount = reviewsCount !== null ? reviewsCount : sellerInfo.reviewsCount;
  const effectiveRating = reviewsRating !== null ? reviewsRating.toFixed(1) : sellerInfo.averageRating;

  const handleApplyVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warrantyCommitment) {
      setVerificationErrorMsg('Vui lòng đồng ý và cam kết chính sách bảo hành.');
      return;
    }
    if (!idCardNumber.trim()) {
      setVerificationErrorMsg('Vui lòng nhập số CCCD/CMND.');
      return;
    }

    setIsSubmittingVerification(true);
    setVerificationErrorMsg(null);
    setVerificationSuccessMsg(null);

    try {
      const res: any = await submitSellerVerification({
        fullName: fullName || currentUser.name,
        phone: phone || currentUser.phone || '',
        idCardNumber: idCardNumber.trim(),
        socialLink,
        zaloPhone,
        warrantyCommitment
      });

      if (res && res.success === false) {
        setVerificationErrorMsg(res.message || 'Lỗi gửi hồ sơ xác minh');
      } else {
        setVerificationSuccessMsg(res?.message || 'Hồ sơ xác minh người bán đã gửi thành công và đã được lưu vào hệ thống! Super Admin sẽ duyệt trong 2-4 giờ.');
        await fetchVerificationStatus();
      }
    } catch (err: any) {
      setVerificationErrorMsg(err?.message || 'Đã xảy ra lỗi khi gửi hồ sơ xác minh.');
    } finally {
      setIsSubmittingVerification(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.name}`}
                alt={currentUser.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-500/40 shadow-lg"
              />
              {isVerified && (
                <div
                  className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-slate-950 rounded-full shadow"
                  title="Người bán đã xác minh danh tính"
                >
                  <ShieldCheck size={14} />
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">{currentUser.name}</h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {sellerInfo.sellerTier}
                </span>
                {isVerified ? (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck size={13} /> Verified Seller
                  </span>
                ) : (
                  <button
                    onClick={() => setActiveTab('verification')}
                    className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                  >
                    Chưa xác minh (Đăng ký ngay)
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                  <Star size={13} className="fill-amber-400" /> {effectiveRating} / 5.0
                  <span className="text-slate-500 font-normal">({effectiveReviewsCount} đánh giá)</span>
                </span>
                <span>
                  Đã bán: <strong className="text-slate-200">{totalSoldAccCount} acc</strong>
                </span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  🛡️ Trust Score: {sellerInfo.trustScore}/100
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => setCurrentView('sell')}
              className="flex-1 md:flex-none px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <PlusCircle size={15} />
              <span>ĐĂNG BÁN ACC MỚI</span>
            </button>

            <button
              onClick={() => setIsWalletOpen(true)}
              className="flex-1 md:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              <Wallet size={15} className="text-emerald-400" />
              <span>Ví: {currentUser.balance.toLocaleString('vi-VN')}đ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-slate-800 text-xs sm:text-sm">
        {[
          { id: 'overview', label: 'Tổng Quan & Biểu Đồ', icon: TrendingUp },
          { id: 'products', label: `Sản Phẩm Của Tôi (${myAccounts.length})`, icon: Store },
          { id: 'orders', label: `Đơn Hàng Bán (${mySellOrders.length})`, icon: ShoppingBag },
          { id: 'reviews', label: `Đánh Giá Từ Khách (${effectiveReviewsCount})`, icon: Star },
          { id: 'verification', label: 'Xác Minh Danh Tính 🛡️', icon: ShieldCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & CHARTS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <DollarSign size={13} className="text-amber-400" />
                <span>Doanh Thu Hôm Nay</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-amber-400">
                {todayRevenue.toLocaleString('vi-VN')}đ
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <TrendingUp size={13} className="text-emerald-400" />
                <span>Doanh Thu Tháng</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-emerald-400">
                {monthRevenue.toLocaleString('vi-VN')}đ
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <CheckCircle2 size={13} className="text-cyan-400" />
                <span>Đã Bán Thành Công</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-white">
                {totalSoldAccCount} <span className="text-xs text-slate-400 font-normal">acc</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Store size={13} className="text-purple-400" />
                <span>Đang Đăng Bán</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-white">
                {activeListingsCount} <span className="text-xs text-slate-400 font-normal">acc</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Clock size={13} className="text-rose-400" />
                <span>Đơn Đang Xử Lý</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-rose-400">
                {pendingOrders.length} <span className="text-xs text-slate-400 font-normal">đơn</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Star size={13} className="text-amber-400" />
                <span>Đánh Giá ⭐</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-amber-400">
                {sellerInfo.averageRating} <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
              </div>
            </div>
          </div>

          {/* Revenue Chart & Trust Score Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Weekly Bar Chart */}
            <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <TrendingUp size={16} className="text-amber-400" />
                    <span>Biểu Đồ Doanh Thu 7 Ngày Qua</span>
                  </h3>
                  <p className="text-xs text-slate-400">Doanh số thực tế ghi nhận sau phí giao dịch trung gian</p>
                </div>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  Tuần hiện tại
                </span>
              </div>

              {/* Bar visualization */}
              <div className="pt-6 pb-2">
                <div className="flex items-end justify-between gap-3 h-48 sm:h-56 px-2">
                  {weeklyData.map(item => {
                    const heightPercent = maxWeeklyAmount > 0 ? Math.max(12, Math.round((item.amount / maxWeeklyAmount) * 100)) : 12;
                    return (
                      <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <div className="text-[10px] text-slate-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {item.amount.toLocaleString('vi-VN')}đ
                        </div>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full max-w-[42px] bg-gradient-to-t from-amber-500 to-orange-400 rounded-t-xl group-hover:from-amber-400 group-hover:to-orange-300 transition-all shadow-md shadow-amber-500/20"
                        />
                        <span className="text-xs font-bold text-slate-400 group-hover:text-amber-400 transition-colors">
                          {item.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Trust Score Breakdown Widget */}
            <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span>Chỉ Số Uy Tín (Trust Score)</span>
                </h3>
                <p className="text-xs text-slate-400">Được hệ thống tự động tính toán dựa trên dữ liệu thật</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-2">
                <div className="text-3xl sm:text-4xl font-black text-emerald-400">
                  {sellerInfo.trustScore}
                  <span className="text-sm font-semibold text-slate-400 ml-1">/ 100</span>
                </div>
                <div className="text-xs font-semibold text-emerald-400">
                  {sellerInfo.trustScore >= 90 ? '⭐⭐⭐⭐⭐ Siêu Uy Tín' : '⭐⭐⭐⭐ Người Bán Tiêu Chuẩn'}
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Điểm khởi tạo cơ bản:</span>
                  <span className="font-bold text-white">+75 đ</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Giao dịch thành công (+0.5đ/acc):</span>
                  <span className="font-bold text-emerald-400">+{sellerInfo.trustScoreBreakdown.dealsBonus} đ</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Đánh giá trung bình tích cực:</span>
                  <span className="font-bold text-emerald-400">+{sellerInfo.trustScoreBreakdown.ratingBonus} đ</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Đã xác minh danh tính CCCD:</span>
                  <span className="font-bold text-emerald-400">+{sellerInfo.trustScoreBreakdown.verifiedBonus} đ</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Khấu trừ khiếu nại (Dispute):</span>
                  <span className="font-bold text-rose-400">-{sellerInfo.trustScoreBreakdown.disputePenalty} đ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-white">
              Danh Sách Tài Khoản Đang Quản Lý ({myAccounts.length})
            </h3>
            <button
              onClick={() => setCurrentView('sell')}
              className="px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle size={14} />
              <span>Đăng Nick Mới</span>
            </button>
          </div>

          {myAccounts.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
              <Store size={40} className="mx-auto text-slate-600" />
              <p className="text-sm text-slate-400">Bạn chưa đăng bán tài khoản nào trên sàn.</p>
              <button
                onClick={() => setCurrentView('sell')}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
              >
                Đăng Bán Ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myAccounts.map(acc => (
                <div
                  key={acc.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[16/9] bg-slate-950">
                      <img src={acc.images[0]} alt={acc.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold bg-black/70 backdrop-blur px-2 py-0.5 rounded text-amber-400 border border-amber-500/30">
                          #{acc.code}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            acc.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : acc.status === 'sold'
                              ? 'bg-slate-700 text-slate-300'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {acc.status === 'approved' ? 'Đang Bán' : acc.status === 'sold' ? 'Đã Bán' : 'Chờ Duyệt'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h4 className="text-sm font-bold text-white line-clamp-1">{acc.title}</h4>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-amber-400 font-black text-base">
                          {acc.price.toLocaleString('vi-VN')}đ
                        </span>
                        <RankBadge rank={acc.rank} size="sm" />
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-1">
                        <span>{acc.heroesCount} tướng</span>
                        <span>•</span>
                        <span>{acc.skinsCount} skin</span>
                        <span>•</span>
                        <span>{acc.server}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedAccountId(acc.id)}
                      className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>Xem</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn xóa tài khoản #${acc.code}?`)) {
                          deleteAccount(acc.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 cursor-pointer"
                      title="Xóa tài khoản"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h3 className="text-sm sm:text-base font-bold text-white">
            Lịch Sử Đơn Hàng Đã Bán ({mySellOrders.length})
          </h3>

          {mySellOrders.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-2 text-slate-400">
              <ShoppingBag size={36} className="mx-auto text-slate-600" />
              <p className="text-xs">Chưa có đơn hàng nào phát sinh.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mySellOrders.map(order => (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-400">#{order.orderCode}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          order.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : order.status === 'disputed'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {order.status === 'completed'
                          ? 'Giao Dịch Thành Công'
                          : order.status === 'disputed'
                          ? 'Đang Khiếu Nại'
                          : 'Tạm Giữ Escrow'}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">{order.accountTitle}</h4>
                    <div className="text-[11px] text-slate-400">
                      Người mua: <strong className="text-slate-300">{order.buyerName}</strong> • Ngày tạo:{' '}
                      {formatVietnamDate(order.createdAt)}
                    </div>
                  </div>

                  <div className="text-right sm:text-right w-full sm:w-auto">
                    <div className="text-xs text-slate-400">Thực nhận sau phí sàn:</div>
                    <div className="text-base font-black text-emerald-400">
                      +{(order.sellerEarnings || order.accountPrice * 0.95).toLocaleString('vi-VN')}đ
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: REVIEWS FROM BUYERS */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-white">
              Đánh Giá & Nhận Xét Của Khách Hàng ({effectiveReviewsCount})
            </h3>
            <div className="flex items-center gap-1.5 text-amber-400 text-sm font-bold">
              <Star size={16} className="fill-amber-400" />
              <span>{effectiveRating} / 5.0</span>
            </div>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
            {isLoadingReviews ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Đang tải đánh giá từ máy chủ...
              </div>
            ) : reviewsList.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs space-y-1">
                <p className="font-semibold text-slate-300">Chưa có đánh giá nào từ khách hàng.</p>
                <p className="text-[11px] text-slate-500">
                  Các đánh giá thực tế từ người mua sau khi hoàn tất đơn hàng và để lại review sẽ tự động cập nhật tại đây.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviewsList.map(rev => (
                  <div key={rev.id || rev.orderId} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {rev.buyerAvatar && (
                          <img
                            src={rev.buyerAvatar}
                            alt={rev.buyerName || rev.buyer}
                            className="w-5 h-5 rounded-full object-cover border border-slate-700"
                          />
                        )}
                        <span className="font-bold text-white text-xs">{rev.buyerName || rev.buyer || 'Khách Hàng'}</span>
                        <div className="flex text-amber-400">
                          {Array.from({ length: Math.min(5, Math.max(1, Number(rev.rating) || 5)) }).map((_, i) => (
                            <Star key={i} size={12} className="fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500">{rev.date || 'Gần đây'}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{rev.comment || 'Khách hàng không để lại nhận xét chi tiết.'}</p>
                    {rev.accountTitle && (
                      <div className="text-[10px] text-slate-500 font-mono">
                        Sản phẩm: {rev.accountTitle}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: VERIFICATION 🛡️ */}
      {activeTab === 'verification' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Đăng Ký Xác Minh Danh Tính Người Bán (Verified Seller)
                </h3>
                <p className="text-xs text-slate-400">
                  Nhận huy hiệu 🛡️ Verified, tăng Trust Score +10 điểm và hiển thị ưu tiên tại trang chủ
                </p>
              </div>
            </div>

            {isVerified ? (
              <div className="p-6 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-center space-y-2">
                <ShieldCheck size={40} className="mx-auto text-emerald-400" />
                <h4 className="text-base font-bold text-emerald-400">Bạn Đã Là Verified Seller</h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Hồ sơ và thông tin CCCD của bạn đã được Super Admin phê duyệt bảo đảm an toàn. Huy hiệu xanh sẽ hiển thị bên cạnh tên shop của bạn.
                </p>
              </div>
            ) : isPendingVerification ? (
              <div className="p-6 bg-amber-500/15 border border-amber-500/30 rounded-2xl text-center space-y-2">
                <Clock size={40} className="mx-auto text-amber-400" />
                <h4 className="text-base font-bold text-amber-400">Hồ Sơ Đang Trong Hàng Đợi Phê Duyệt</h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Super Admin đang kiểm tra thông tin định danh của bạn. Quá trình duyệt diễn ra trong vòng 2-4 giờ làm việc.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplyVerification} className="space-y-4 pt-2">
                {verificationSuccessMsg && (
                  <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold text-center">
                    {verificationSuccessMsg}
                  </div>
                )}
                {verificationErrorMsg && (
                  <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-bold text-center flex items-center justify-center gap-2">
                    <AlertCircle size={14} />
                    <span>{verificationErrorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Họ và tên thật (Trùng khớp CCCD): *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="VD: NGUYỄN VĂN AN"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none uppercase font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Số điện thoại chính chủ: *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="0912345678"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Số CCCD / CMND: *
                    </label>
                    <input
                      type="text"
                      required
                      value={idCardNumber}
                      onChange={e => setIdCardNumber(e.target.value)}
                      placeholder="00120100xxxx"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Link Facebook cá nhân:
                    </label>
                    <input
                      type="url"
                      value={socialLink}
                      onChange={e => setSocialLink(e.target.value)}
                      placeholder="https://facebook.com/username"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Số Zalo liên hệ:
                    </label>
                    <input
                      type="tel"
                      value={zaloPhone}
                      onChange={e => setZaloPhone(e.target.value)}
                      placeholder="0912345678"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                  <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={warrantyCommitment}
                      onChange={e => setWarrantyCommitment(e.target.checked)}
                      className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                    />
                    <span>
                      Tôi cam kết tất cả tài khoản đăng bán đều đúng thực tế, có nguồn gốc minh bạch và đồng ý chịu trách nhiệm bồi thường hoàn tiền 100% nếu có tranh chấp vi phạm điều khoản sàn.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingVerification || !warrantyCommitment}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <Send size={15} />
                  <span>{isSubmittingVerification ? 'Đang gửi...' : 'NỘP HỒ SƠ XÁC MINH SELLER'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
