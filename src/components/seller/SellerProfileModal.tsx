import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/apiClient';
import { UserProfile } from '../../types';
import { AccountCard } from '../accounts/AccountCard';
import { getDynamicSellerInfo } from '../../utils/sellerHelper';
import {
  X,
  ShieldCheck,
  Star,
  MessageCircle,
  Clock,
  CheckCircle2,
  Award,
  Package,
  Calendar,
  Zap,
  TrendingUp,
  ShieldAlert,
  ThumbsUp,
  Store,
  Sparkles,
  ExternalLink,
  Loader2
} from 'lucide-react';

export const SellerProfileModal: React.FC = () => {
  const {
    selectedSellerId,
    setSelectedSellerId,
    allUsers,
    setAllUsers,
    accounts,
    orders,
    openChatWith,
    setSelectedAccountId
  } = useApp();

  const [activeTab, setActiveTab] = useState<'listings' | 'reviews' | 'policies'>('listings');
  const [fetchedSeller, setFetchedSeller] = useState<UserProfile | null>(null);
  const [fetchedReviews, setFetchedReviews] = useState<any[]>([]);
  const [isLoadingSeller, setIsLoadingSeller] = useState(false);

  // When selectedSellerId opens, fetch latest seller profile & reviews from backend
  useEffect(() => {
    if (!selectedSellerId) {
      setFetchedSeller(null);
      setFetchedReviews([]);
      setIsLoadingSeller(false);
      return;
    }

    // Try finding by sellerId or sellerName in accounts list for instant display
    const accMatching = accounts.find(a => a.sellerId === selectedSellerId || a.sellerName === selectedSellerId);
    if (accMatching && accMatching.sellerName) {
      const derivedUser: UserProfile = {
        id: selectedSellerId,
        name: accMatching.sellerName,
        username: accMatching.sellerName.toLowerCase().replace(/\s+/g, ''),
        email: `${selectedSellerId}@cholienquan.com`,
        phone: '',
        role: 'seller',
        avatar: accMatching.sellerAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedSellerId}`,
        balance: 0,
        pendingBalance: 0,
        rating: accMatching.sellerRating || 5.0,
        completedSales: accMatching.sellerCompletedSales || 0,
        isVerifiedSeller: accMatching.sellerVerified ?? true,
        sellerTier: 'VIP',
        createdAt: accMatching.createdAt || new Date().toISOString()
      };
      setFetchedSeller(derivedUser);
    }

    // Fetch live data & all reviews from server API
    setIsLoadingSeller(true);
    api.get(`/api/auth/seller/${selectedSellerId}`)
      .then(res => {
        if (res && res.success && (res.seller || res.user)) {
          const sellerObj = res.seller || res.user;
          setFetchedSeller(sellerObj);
          if (Array.isArray(res.reviews)) {
            setFetchedReviews(res.reviews);
          }
          if (typeof setAllUsers === 'function') {
            setAllUsers(prev => {
              if (prev.some(u => u.id === sellerObj.id)) {
                return prev.map(u => u.id === sellerObj.id ? { ...u, ...sellerObj } : u);
              }
              return [...prev, sellerObj];
            });
          }
        }
      })
      .catch(err => {
        console.warn('Could not fetch seller profile:', err);
      })
      .finally(() => {
        setIsLoadingSeller(false);
      });
  }, [selectedSellerId, accounts, setAllUsers]);

  if (!selectedSellerId) return null;

  const accMatching = accounts.find(a => a.sellerId === selectedSellerId || a.sellerName === selectedSellerId);
  const seller = fetchedSeller || allUsers.find(u => u.id === selectedSellerId || u.username === selectedSellerId);
  const sellerInfo = getDynamicSellerInfo(selectedSellerId, allUsers, orders, accMatching || (seller as any));

  // Accounts belonging to this seller
  const sellerAccounts = accounts.filter(
    a => (a.sellerId === selectedSellerId || a.sellerName === (seller?.name || accMatching?.sellerName)) &&
         (a.status === 'approved' || a.status === 'sold')
  );
  const activeListings = sellerAccounts.filter(a => a.status === 'approved');

  // Reviews list: prioritize server reviews fetched directly from MongoDB
  const sellerReviews = fetchedReviews.length > 0
    ? fetchedReviews
    : orders
        .filter(o => (o.sellerId === selectedSellerId || o.sellerName === (seller?.name || accMatching?.sellerName)) && (o.reviewComment || o.ratingGiven || (o as any).review?.comment))
        .map(o => {
          const buyerUser = allUsers.find(u => u.id === o.buyerId);
          return {
            id: o.id,
            buyerName: o.buyerName || buyerUser?.name || 'Khách Hàng',
            buyerAvatar:
              buyerUser?.avatar ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
            rating: o.ratingGiven || (o as any).review?.rating || 5,
            date: o.completedAt
              ? new Date(o.completedAt).toLocaleDateString('vi-VN')
              : new Date(o.createdAt).toLocaleDateString('vi-VN'),
            accountCode: o.accountCode,
            accountTitle: o.accountTitle,
            comment: o.reviewComment || (o as any).review?.comment || 'Giao dịch thành công, nhận tài khoản nhanh chóng.'
          };
        });

  const soldAccountsOnClient = sellerAccounts.filter(a => a.status === 'sold').length;
  const completedOrdersOnClient = orders.filter(o => 
    (o.sellerId === selectedSellerId || o.sellerName === (seller?.name || accMatching?.sellerName)) &&
    (o.status === 'completed' || o.status === 'account_delivered' || o.status === 'escrow_hold')
  ).length;

  const completedSalesCount = Math.max(
    fetchedSeller?.completedSales ?? 0,
    seller?.completedSales ?? 0,
    sellerInfo?.completedSales ?? 0,
    soldAccountsOnClient,
    completedOrdersOnClient,
    sellerReviews.length
  );
  const averageRating = fetchedSeller?.rating ?? (seller?.rating || sellerInfo?.averageRating || 5.0);

  const formatJoinDate = (dateStr?: string) => {
    if (!dateStr) return 'Mới tham gia sàn';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `Tham gia sàn: ${day}/${month}/${year}`;
    } catch {
      return 'Mới tham gia sàn';
    }
  };

  if (isLoadingSeller && !seller) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <Loader2 size={36} className="animate-spin text-amber-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Đang tải hồ sơ người bán...</h3>
          <p className="text-xs text-slate-400">Vui lòng đợi giây lát</p>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
          <button
            onClick={() => setSelectedSellerId(null)}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full cursor-pointer"
          >
            <X size={20} />
          </button>
          <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
            <Store size={28} />
          </div>
          <h3 className="text-base font-bold text-white">Không Tìm Thấy Người Bán</h3>
          <p className="text-xs text-slate-400">
            Hồ sơ người bán này không tồn tại hoặc đã được xoá khỏi hệ thống.
          </p>
          <button
            onClick={() => setSelectedSellerId(null)}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  const handleChat = () => {
    setSelectedSellerId(null);
    openChatWith({
      id: seller.id,
      name: seller.name,
      avatar: seller.avatar,
      role: 'seller'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Banner Cover */}
        <div className="relative h-36 sm:h-44 bg-gradient-to-r from-amber-600 via-orange-600 to-slate-900 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-black/60" />
          
          <button
            id="close-seller-profile-btn"
            onClick={() => setSelectedSellerId(null)}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer z-10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile Card Header Info */}
        <div className="px-6 pb-4 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 mb-4">
            {/* Avatar & Main Info */}
            <div className="flex items-end gap-4">
              <div className="relative">
                <img
                  src={sellerInfo?.avatar || seller.avatar}
                  alt={sellerInfo?.name || seller.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-slate-900 bg-slate-800 shadow-xl"
                />
                {sellerInfo?.isVerifiedSeller && (
                  <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-slate-950 rounded-full border-2 border-slate-900" title="Shop đã xác thực CCCD & Uy tín">
                    <ShieldCheck size={16} />
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white">{sellerInfo?.name || seller.name}</h2>
                  {sellerInfo?.isVerifiedSeller && (
                    <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <ShieldCheck size={13} /> Đã Xác Thực
                    </span>
                  )}
                  <span className="text-xs bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md font-extrabold uppercase">
                    {sellerInfo?.sellerTier}
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <Calendar size={13} className="text-amber-400" /> {formatJoinDate(seller.createdAt)}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                id="seller-chat-direct-btn"
                onClick={handleChat}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
              >
                <MessageCircle size={16} />
                <span>Nhắn Tin Với Shop</span>
              </button>
            </div>
          </div>

          {/* Key Trust Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl">
            <div className="text-center sm:text-left sm:pl-2">
              <div className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                <Star size={13} className="text-amber-400 fill-amber-400" />
                <span>Đánh Giá Uy Tín</span>
              </div>
              <div className="text-lg font-black text-amber-400 mt-0.5">
                {averageRating ? (
                  <>
                    {averageRating} <span className="text-xs text-slate-500 font-normal">/ 5.0</span>
                  </>
                ) : (
                  <span className="text-xs text-slate-400 font-medium">Chưa có đánh giá</span>
                )}
              </div>
            </div>

            <div className="text-center sm:text-left sm:pl-2 sm:border-l sm:border-slate-800">
              <div className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                <Package size={13} className="text-purple-400" />
                <span>Số Lượng Đã Bán</span>
              </div>
              <div className="text-lg font-black text-purple-300 mt-0.5">
                {completedSalesCount} <span className="text-xs text-slate-500 font-normal">acc</span>
              </div>
            </div>

            <div className="text-center sm:text-left sm:pl-2 sm:border-l sm:border-slate-800">
              <div className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                <Clock size={13} className="text-cyan-400" />
                <span>Tốc Độ Phản Hồi</span>
              </div>
              <div className="text-lg font-black text-cyan-300 mt-0.5">
                100% <span className="text-xs text-slate-500 font-normal">(Tự động)</span>
              </div>
            </div>

            <div className="text-center sm:text-left sm:pl-2 sm:border-l sm:border-slate-800">
              <div className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                <TrendingUp size={13} className="text-emerald-400" />
                <span>Giao Dịch Thành Công</span>
              </div>
              <div className="text-lg font-black text-emerald-400 mt-0.5">
                100%
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-800 flex gap-6 text-sm font-bold bg-slate-950/40">
          <button
            onClick={() => setActiveTab('listings')}
            className={`py-3 relative cursor-pointer flex items-center gap-1.5 transition-colors ${
              activeTab === 'listings' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Store size={16} />
            <span>Acc Đang Bán ({activeListings.length})</span>
            {activeTab === 'listings' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 relative cursor-pointer flex items-center gap-1.5 transition-colors ${
              activeTab === 'reviews' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star size={16} />
            <span>Đánh Giá Khách Hàng ({sellerReviews.length})</span>
            {activeTab === 'reviews' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('policies')}
            className={`py-3 relative cursor-pointer flex items-center gap-1.5 transition-colors ${
              activeTab === 'policies' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck size={16} />
            <span>Cam Kết & Bảo Hành</span>
            {activeTab === 'policies' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 max-h-[50vh] overflow-y-auto space-y-6">
          {/* TAB 1: LISTINGS */}
          {activeTab === 'listings' && (
            <div className="space-y-4">
              {activeListings.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <Package size={36} className="mx-auto text-slate-600 mb-2" />
                  <p>Shop hiện tại đang cập nhật thêm acc mới.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeListings.map(acc => (
                    <AccountCard
                      key={acc.id}
                      account={acc}
                      onOpenDetail={id => {
                        setSelectedSellerId(null);
                        setSelectedAccountId(id);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-3">
              {sellerReviews.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <Star size={36} className="mx-auto text-slate-600 mb-2" />
                  <p className="text-sm font-semibold text-slate-400">Chưa có đánh giá nào từ khách hàng</p>
                  <p className="text-xs text-slate-500 mt-1">Đánh giá sẽ xuất hiện tự động khi người mua hoàn tất đơn hàng và gửi nhận xét.</p>
                </div>
              ) : (
                sellerReviews.map(rev => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.buyerAvatar}
                          alt={rev.buyerName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-200">{rev.buyerName}</div>
                          <div className="text-[10px] text-slate-500">{rev.date}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={i < Math.floor(rev.rating) ? 'fill-amber-400' : 'text-slate-600'}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 leading-relaxed pl-10">
                      "{rev.comment}"
                    </div>

                    {rev.accountCode && (
                      <div className="pl-10 pt-1 flex items-center gap-2 text-[11px] text-amber-400/80">
                        <span className="font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          #{rev.accountCode}
                        </span>
                        {rev.accountTitle && <span className="text-slate-400 truncate">{rev.accountTitle}</span>}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: POLICIES */}
          {activeTab === 'policies' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <ShieldCheck size={18} />
                  <span>Cam Kết Bảo Hành & Quyền Lợi Người Mua</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-2 pl-6 list-disc">
                  <li>
                    <strong>100% Trắng Thông Tin:</strong> Tài khoản bán ra cam kết chưa liên kết Số điện thoại hoặc Email, người mua có thể tự do liên kết bảo mật chính chủ ngay sau khi nhận acc.
                  </li>
                  <li>
                    <strong>Bảo Hiểm Escrow:</strong> Tiền được sàn LQMarket giữ an toàn. Chỉ khi người mua vào game kiểm tra đúng 100% thông tin và bấm [Xác Nhận Nhận Acc] thì tiền mới chuyển cho shop.
                  </li>
                  <li>
                    <strong>Bảo Hành Trọn Đời:</strong> Cam kết hoàn tiền 100% hoặc đổi acc tương đương nếu phát hiện bất kỳ tranh chấp tài khoản nào sau khi mua.
                  </li>
                  <li>
                    <strong>Hỗ Trợ Nhanh 24/7:</strong> Hướng dẫn chi tiết cách đổi mật khẩu Garena, cách bật xác thực 2 lớp an toàn qua Chat trực tiếp.
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200/90 leading-relaxed">
                  <strong>Khuyến Cáo Bảo Mật:</strong> Tuyệt đối không giao dịch chuyển khoản trực tiếp bên ngoài sàn để tránh bị lừa đảo mạo danh. Tất cả giao dịch trên LQMarket đều được kiểm soát bởi hợp đồng trung gian tự động.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
