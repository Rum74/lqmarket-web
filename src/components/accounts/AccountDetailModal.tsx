import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/apiClient';
import { RankBadge } from '../common/RankBadge';
import { getDynamicSellerInfo } from '../../utils/sellerHelper';
import {
  X,
  ShieldCheck,
  Star,
  Zap,
  Heart,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Swords,
  Shirt,
  Shield,
  Layers,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check
} from 'lucide-react';

export const AccountDetailModal: React.FC = () => {
  const {
    selectedAccountId,
    setSelectedAccountId,
    accounts,
    startCheckout,
    toggleWishlist,
    isWishlisted,
    openChatWith,
    openSellerProfile,
    allUsers,
    orders
  } = useApp();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [liveSellerStats, setLiveSellerStats] = useState<{
    completedSales?: number;
    reviewsCount?: number;
    averageRating?: string | null;
    sellerTier?: string;
    isVerifiedSeller?: boolean;
    name?: string;
    avatar?: string;
  } | null>(null);

  if (!selectedAccountId) return null;

  const account = accounts.find(a => a.id === selectedAccountId);
  if (!account) return null;

  useEffect(() => {
    if (!account?.sellerId) return;
    let isMounted = true;
    api.get(`/api/auth/seller/${account.sellerId}`)
      .then(res => {
        if (!isMounted) return;
        if (res && res.success && (res.seller || res.stats)) {
          const sellerObj = res.seller || {};
          const statsObj = res.stats || {};
          setLiveSellerStats({
            completedSales: statsObj.totalSold ?? sellerObj.completedSales ?? statsObj.totalSales,
            reviewsCount: statsObj.reviewsCount ?? statsObj.reviewCount ?? (Array.isArray(res.reviews) ? res.reviews.length : undefined),
            averageRating: statsObj.averageRating ?? (sellerObj.rating ? String(sellerObj.rating) : undefined),
            sellerTier: sellerObj.sellerTier,
            isVerifiedSeller: sellerObj.isVerifiedSeller,
            name: sellerObj.name,
            avatar: sellerObj.avatar
          });
        }
      })
      .catch(err => {
        console.warn('Could not fetch live seller stats in detail modal:', err);
      });
    return () => {
      isMounted = false;
    };
  }, [account?.sellerId]);

  const rawSellerInfo = getDynamicSellerInfo(account.sellerId, allUsers, orders, account);
  const sellerInfo = {
    ...rawSellerInfo,
    name: liveSellerStats?.name || rawSellerInfo.name,
    avatar: liveSellerStats?.avatar || rawSellerInfo.avatar,
    completedSales: liveSellerStats?.completedSales ?? rawSellerInfo.completedSales,
    reviewsCount: liveSellerStats?.reviewsCount ?? rawSellerInfo.reviewsCount,
    averageRating: liveSellerStats?.averageRating ?? rawSellerInfo.averageRating,
    sellerTier: liveSellerStats?.sellerTier || rawSellerInfo.sellerTier,
    isVerifiedSeller: liveSellerStats?.isVerifiedSeller ?? rawSellerInfo.isVerifiedSeller
  };
  const wishlisted = isWishlisted(account.id);
  const discountPercent = account.originalPrice
    ? Math.round(((account.originalPrice - account.price) / account.originalPrice) * 100)
    : 0;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(account.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleChatSeller = () => {
    openChatWith({
      id: sellerInfo.id,
      name: sellerInfo.name,
      avatar: sellerInfo.avatar,
      role: 'seller'
    });
  };

  const handleBuyNow = () => {
    setSelectedAccountId(null);
    startCheckout(account.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1.5">
              <span>#{account.code}</span>
              <button
                onClick={handleCopyCode}
                className="hover:text-white cursor-pointer"
                title="Sao chép mã acc"
              >
                {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </button>
            </span>
            <RankBadge rank={account.rank} size="md" />
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck size={13} /> {account.credentials.securityType}
            </span>
          </div>

          <button
            id="close-detail-modal-btn"
            onClick={() => setSelectedAccountId(null)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {/* Main Hero & Gallery Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Gallery Column */}
            <div className="lg:col-span-7 space-y-3">
              {/* Main Active Image */}
              <div className="relative aspect-[16/10] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 group">
                <img
                  src={account.images[activeImageIdx] || account.images[0]}
                  alt={account.title}
                  className="w-full h-full object-cover"
                />

                {account.images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImageIdx(prev => (prev === 0 ? account.images.length - 1 : prev - 1))
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/90 text-white rounded-full transition-all cursor-pointer"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() =>
                        setActiveImageIdx(prev => (prev === account.images.length - 1 ? 0 : prev + 1))
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/90 text-white rounded-full transition-all cursor-pointer"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}

                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-md rounded text-[11px] text-slate-300 font-mono">
                  {activeImageIdx + 1} / {account.images.length}
                </div>
              </div>

              {/* Thumbnails */}
              {account.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {account.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        activeImageIdx === idx ? 'border-amber-500 scale-95' : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Specs & Purchase Info */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {account.title}
                </h2>

                {/* Price Box */}
                <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30">
                  <div className="text-xs text-slate-400 font-medium">Giá bán niêm yết:</div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400">
                      {account.price.toLocaleString('vi-VN')}
                      <span className="text-sm font-semibold text-amber-500 ml-1">VNĐ</span>
                    </span>
                    {account.originalPrice && account.originalPrice > account.price && (
                      <span className="text-sm text-slate-500 line-through">
                        {account.originalPrice.toLocaleString('vi-VN')}đ
                      </span>
                    )}
                    {discountPercent > 0 && (
                      <span className="text-xs font-black bg-rose-500 text-white px-2 py-0.5 rounded-md">
                        Tiết kiệm {discountPercent}%
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
                    <CheckCircle2 size={13} /> Miễn phí trung gian cho người mua (0đ)
                  </div>
                </div>

                {/* Main 4 Specs Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                      <Swords size={16} />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Tướng sở hữu</div>
                      <div className="text-sm font-bold text-slate-100">{account.heroesCount} / 118</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                      <Shirt size={16} />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Trang phục (Skin)</div>
                      <div className="text-sm font-bold text-purple-300">{account.skinsCount}</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Bảng Ngọc Cấp 3</div>
                      <div className="text-sm font-bold text-cyan-300">90 Full III</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Shield size={16} />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Máy chủ</div>
                      <div className="text-sm font-bold text-emerald-300">{account.server}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  id="modal-buy-now-btn"
                  onClick={handleBuyNow}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:from-amber-400 hover:to-orange-300 text-slate-950 font-black rounded-2xl transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
                >
                  <Zap size={18} className="fill-slate-950" />
                  <span>MUA NGAY (GIAO DỊCH TRUNG GIAN)</span>
                </button>

                <div className="flex gap-2">
                  <button
                    id="modal-chat-seller-btn"
                    onClick={handleChatSeller}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle size={15} className="text-amber-400" />
                    <span>Chat Với Người Bán</span>
                  </button>

                  <button
                    id="modal-wishlist-toggle-btn"
                    onClick={() => toggleWishlist(account.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      wishlisted
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    <Heart size={15} className={wishlisted ? 'fill-rose-400' : ''} />
                    <span>{wishlisted ? 'Đã Lưu' : 'Yêu Thích'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Rare Skins Highlight Block */}
          {account.rareSkins && account.rareSkins.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Sparkles size={14} />
                <span>Trang Phục Hiếm & Bậc Cao Tiêu Biểu:</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {account.rareSkins.map((skin, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/20 text-xs text-slate-200"
                  >
                    <span className="text-[10px] font-black bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/40">
                      {skin.tier}
                    </span>
                    <span className="font-semibold text-amber-400">{skin.hero}:</span>
                    <span>{skin.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description & Rune Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Mô tả chi tiết từ người bán:
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">
                {account.description}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Thông tin bảng ngọc & bảo mật:
              </h3>
              <ul className="text-xs text-slate-400 space-y-1.5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span>Bảng ngọc: {account.runePages}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span>Loại tài khoản: Garena trắng thông tin (Đổi SĐT & Mail tự do)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span>Lịch sử đấu sạch, điểm uy tín 100/100 tuyệt đối</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Seller Reputation Profile */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => openSellerProfile(account.sellerId)}
              title="Bấm để xem hồ sơ và các acc khác của người bán này"
            >
              <img
                src={sellerInfo.avatar}
                alt={sellerInfo.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-500/40 group-hover:scale-105 transition-transform"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                    {sellerInfo.name}
                  </h4>
                  {sellerInfo.isVerifiedSeller && (
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <ShieldCheck size={11} /> Đã Xác Thực
                    </span>
                  )}
                  <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md font-bold uppercase">
                    {sellerInfo.sellerTier}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                  {sellerInfo.reviewsCount > 0 ? (
                    <span className="flex items-center gap-1 text-amber-400 font-semibold">
                      <Star size={13} className="fill-amber-400" /> {sellerInfo.averageRating} / 5.0
                      <span className="text-[11px] text-slate-400 font-normal">({sellerInfo.reviewsCount})</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs font-medium">Chưa có đánh giá</span>
                  )}
                  <span>Đã bán: <strong className="text-slate-200">{sellerInfo.completedSales}</strong> acc</span>
                  <span className="flex items-center gap-1 text-cyan-300">
                    <Clock size={12} /> Giao trong {account.sellerResponseTime}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => openSellerProfile(account.sellerId)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-initial justify-center"
              >
                <span>Hồ Sơ Shop</span>
              </button>

              <button
                onClick={handleChatSeller}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-initial justify-center"
              >
                <MessageCircle size={14} />
                <span>Chat Với Shop</span>
              </button>
            </div>
          </div>

          {/* Escrow Guarantee Statement */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-emerald-400 block mb-1">
                Chính Sách Bảo Vệ Giao Dịch Trung Gian LQMarket:
              </strong>
              Khi bạn bấm Mua Ngay, hệ thống sẽ tạm giữ tiền an toàn và bàn giao mật khẩu acc ngay lập tức. Tiền chỉ chuyển cho người bán khi bạn đã vào game kiểm tra đúng thông tin và bấm [Xác Nhận Nhận Acc]. Trong trường hợp sai thông tin, bạn được hoàn tiền 100%.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
