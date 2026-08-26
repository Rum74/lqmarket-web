import React from 'react';
import { AccountItem } from '../../types';
import { RankBadge } from '../common/RankBadge';
import { useApp } from '../../context/AppContext';
import { getDynamicSellerInfo } from '../../utils/sellerHelper';
import { Heart, ShieldCheck, Star, Sparkles, Eye, Zap, Swords, Shirt } from 'lucide-react';

interface AccountCardProps {
  account: AccountItem;
  onOpenDetail?: (id: string) => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({ account, onOpenDetail }) => {
  const { setSelectedAccountId, startCheckout, toggleWishlist, isWishlisted, openSellerProfile, allUsers, orders } = useApp();

  const wishlisted = isWishlisted(account.id);
  const sellerInfo = getDynamicSellerInfo(account.sellerId, allUsers, orders, account);

  const handleCardClick = () => {
    if (onOpenDetail) {
      onOpenDetail(account.id);
    } else {
      setSelectedAccountId(account.id);
    }
  };

  const discountPercent = account.originalPrice
    ? Math.round(((account.originalPrice - account.price) / account.originalPrice) * 100)
    : 0;

  return (
    <div
      id={`account-card-${account.code}`}
      className="group relative bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 flex flex-col justify-between"
    >
      {/* Top Media Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950 cursor-pointer" onClick={handleCardClick}>
        <img
          src={account.images[0] || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'}
          alt={account.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />

        {/* Badges Top-Left */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 z-10">
          <RankBadge rank={account.rank} size="sm" />
          {account.badgeTag && (
            <span
              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-sm ${
                account.badgeTag === 'VIP'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950'
                  : account.badgeTag === 'GIÁ RẺ'
                  ? 'bg-emerald-500 text-slate-950'
                  : account.badgeTag === 'SIÊU SKIN'
                  ? 'bg-purple-600 text-white'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {account.badgeTag}
            </span>
          )}
        </div>

        {/* Wishlist Button Top-Right */}
        <button
          id={`wishlist-btn-${account.code}`}
          onClick={e => {
            e.stopPropagation();
            toggleWishlist(account.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md transition-all z-10 cursor-pointer ${
            wishlisted
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-110'
              : 'bg-black/50 hover:bg-black/80 text-white/80 hover:text-rose-400'
          }`}
          title={wishlisted ? 'Bỏ yêu thích' : 'Lưu acc yêu thích'}
        >
          <Heart size={15} className={wishlisted ? 'fill-white' : ''} />
        </button>

        {/* Code & Discount Tag */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          <span className="text-[11px] font-mono font-bold bg-slate-950/80 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 backdrop-blur-xs">
            #{account.code}
          </span>
          {discountPercent > 0 && (
            <span className="text-[10px] font-black bg-rose-500 text-white px-1.5 py-0.5 rounded">
              -{discountPercent}%
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Account Title */}
          <h3
            onClick={handleCardClick}
            className="text-xs sm:text-sm font-bold text-slate-100 line-clamp-2 hover:text-amber-400 transition-colors cursor-pointer leading-snug"
            title={account.title}
          >
            {account.title}
          </h3>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-1.5 my-3 text-center">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-1.5">
              <span className="text-[10px] text-slate-400 block flex items-center justify-center gap-1">
                <Swords size={11} className="text-amber-400" /> Tướng
              </span>
              <span className="text-xs font-bold text-slate-200">{account.heroesCount}</span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-1.5">
              <span className="text-[10px] text-slate-400 block flex items-center justify-center gap-1">
                <Shirt size={11} className="text-purple-400" /> Skin
              </span>
              <span className="text-xs font-bold text-purple-300">{account.skinsCount}</span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-1.5">
              <span className="text-[10px] text-slate-400 block flex items-center justify-center gap-1">
                <Sparkles size={11} className="text-cyan-400" /> Ngọc
              </span>
              <span className="text-xs font-bold text-cyan-300">90 Full III</span>
            </div>
          </div>

          {/* Rare Skins Highlight Chips */}
          {account.rareSkins && account.rareSkins.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {account.rareSkins.slice(0, 2).map((skin, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300/90 border border-slate-700 truncate max-w-[140px]"
                >
                  ⭐ {skin.hero} {skin.name}
                </span>
              ))}
              {account.rareSkins.length > 2 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-400 border border-slate-800">
                  +{account.rareSkins.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Bottom Section: Seller & Price & Action */}
        <div className="pt-3 border-t border-slate-800/80 space-y-3">
          {/* Seller info */}
          <div
            onClick={e => {
              e.stopPropagation();
              openSellerProfile(account.sellerId);
            }}
            className="flex items-center justify-between text-[11px] text-slate-400 hover:text-amber-400 cursor-pointer group/seller transition-colors py-0.5"
            title="Xem hồ sơ và đánh giá của shop"
          >
            <div className="flex items-center gap-1.5 truncate">
              <img
                src={sellerInfo.avatar}
                alt={sellerInfo.name}
                className="w-4 h-4 rounded-full object-cover border border-slate-700 group-hover/seller:border-amber-500/50"
              />
              <span className="truncate text-slate-300 group-hover/seller:text-amber-400 font-medium">
                {sellerInfo.name}
              </span>
              {sellerInfo.isVerifiedSeller && (
                <ShieldCheck size={12} className="text-emerald-400 shrink-0" title="Người bán đã xác thực" />
              )}
            </div>
            {sellerInfo.reviewsCount > 0 ? (
              <div className="flex items-center gap-0.5 text-amber-400 font-semibold shrink-0">
                <Star size={11} className="fill-amber-400" />
                <span>{sellerInfo.averageRating}</span>
                <span className="text-[10px] text-slate-500">({sellerInfo.reviewsCount})</span>
              </div>
            ) : (
              <div className="flex items-center gap-0.5 text-slate-400 text-[10px] font-medium shrink-0">
                <span>Shop mới</span>
              </div>
            )}
          </div>

          {/* Price & Action Buttons */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-base sm:text-lg font-black text-amber-400 tracking-tight leading-none">
                {account.price.toLocaleString('vi-VN')}
                <span className="text-xs font-semibold text-amber-500 ml-0.5">đ</span>
              </div>
              {account.originalPrice && account.originalPrice > account.price && (
                <div className="text-[10px] text-slate-500 line-through">
                  {account.originalPrice.toLocaleString('vi-VN')}đ
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                id={`btn-detail-${account.code}`}
                onClick={handleCardClick}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                title="Xem chi tiết tài khoản"
              >
                Chi Tiết
              </button>

              <button
                id={`btn-buy-${account.code}`}
                onClick={e => {
                  e.stopPropagation();
                  startCheckout(account.id);
                }}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center gap-1 cursor-pointer"
              >
                <Zap size={12} className="fill-slate-950" />
                <span>Mua</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
