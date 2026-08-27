import React from 'react';
import { useApp } from '../../context/AppContext';
import { AccountCard } from '../accounts/AccountCard';
import { getDynamicSellerInfo } from '../../utils/sellerHelper';
import {
  Zap,
  ShieldCheck,
  Award,
  Clock,
  Search,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Tag,
  Swords,
  Crown,
  Flame,
  CheckCircle2,
  Lock,
  Headphones,
  FileCheck,
  Star,
  MessageCircle,
  ExternalLink,
  Shield,
  UserCheck,
  PackageOpen,
  Gift
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { accounts, orders, allUsers, setCurrentView, setFilterOptions, openSellerProfile, openChatWith, mysteryBoxes, totalSystemCompletedSales } = useApp();

  const approvedAccounts = accounts.filter(a => a.status === 'approved');

  // Real-time dynamic counts per rank calculated directly from database
  const thachDauCount = approvedAccounts.filter(a => a.rank === 'Thách Đấu').length;
  const chienThanCount = approvedAccounts.filter(a => a.rank === 'Chiến Thần').length;
  const chienTuongCount = approvedAccounts.filter(a => a.rank === 'Chiến Tướng').length;
  const caoThuCount = approvedAccounts.filter(a => a.rank === 'Cao Thủ').length;
  const tinhAnhCount = approvedAccounts.filter(a => a.rank === 'Tinh Anh').length;
  const kimCuongCount = approvedAccounts.filter(a => a.rank === 'Kim Cương').length;
  const bachKimCount = approvedAccounts.filter(a => a.rank === 'Bạch Kim').length;
  const vangCount = approvedAccounts.filter(a => a.rank === 'Vàng').length;
  const dongBacCount = approvedAccounts.filter(a => a.rank === 'Đồng' || a.rank === 'Bạc').length;

  const totalAvailableCount = approvedAccounts.length;
  const totalCompletedSales = totalSystemCompletedSales > 0 ? totalSystemCompletedSales : (orders.filter(o => o.status === 'completed').length || accounts.filter(a => a.status === 'sold').length);

  // Prominent Sellers List from Database (Dynamic sync)
  const prominentSellers = allUsers
    .filter(u => u && u.id && (u.role === 'seller' || u.isVerifiedSeller || accounts.some(a => a.sellerId === u.id)))
    .map(u => {
      const info = getDynamicSellerInfo(u.id, allUsers, orders);
      const activeInventoryCount = approvedAccounts.filter(a => a.sellerId === u.id).length;
      return { ...info, activeInventoryCount };
    })
    .sort((a, b) => b.completedSales - a.completedSales);

  const featuredSeller = prominentSellers.length > 0 ? prominentSellers[0] : null;

  // Featured Accounts (VIP / SSS)
  const featuredAccounts = approvedAccounts.filter(a => a.isFeatured || a.badgeTag === 'VIP');

  // Budget Accounts (< 500k)
  const budgetAccounts = approvedAccounts.filter(a => a.price <= 500000);

  // Super Skin Accounts (> 150 skins or SSS)
  const superSkinAccounts = approvedAccounts.filter(
    a => a.skinsCount >= 180 || a.rareSkins.some(s => s.tier === 'SSS')
  );

  const handleRankQuickFilter = (rankName: string) => {
    setFilterOptions(prev => ({ ...prev, rank: rankName }));
    setCurrentView('accounts');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePriceQuickFilter = (max: number) => {
    setFilterOptions(prev => ({ ...prev, maxPrice: max, minPrice: 0 }));
    setCurrentView('accounts');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* 1. HERO BANNER SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 p-4 sm:p-10 lg:p-14 shadow-2xl">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
          {/* Top Pill */}
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 text-amber-400 text-[10px] sm:text-xs font-bold tracking-wide max-w-full text-center">
            <Sparkles size={13} className="animate-spin text-amber-400 shrink-0" />
            <span>SÀN GIAO DỊCH LIÊN QUÂN TRUNG GIAN #1 VN</span>
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black text-white tracking-tight leading-tight uppercase">
            MUA BÁN ACC LIÊN QUÂN{' '}
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 bg-clip-text text-transparent block sm:inline">
              AN TOÀN & GIÁ RẺ
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed px-1">
            Hàng nghìn tài khoản Cao Thủ, Chiến Tướng, Full Tướng, Siêu Skin SSS Thứ Nguyên Vệ Thần. Hệ thống trung gian Escrow bảo vệ tiền 100% — Giao acc tự động sau 5 giây.
          </p>

          {/* Action Search / Explore Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-2">
            <button
              id="hero-explore-all-btn"
              onClick={() => {
                setFilterOptions(prev => ({ ...prev, search: '', rank: 'all', minPrice: 0, maxPrice: 6000000 }));
                setCurrentView('accounts');
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:from-amber-400 hover:to-orange-300 text-slate-950 text-xs sm:text-sm font-black rounded-2xl transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Search size={16} className="text-slate-950" />
              <span>TÌM KIẾM ACC NGAY</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              id="hero-sell-btn"
              onClick={() => setCurrentView('sell')}
              className="w-full sm:w-auto px-5 py-3.5 bg-slate-800/80 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold rounded-2xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap size={16} className="text-amber-400" />
              <span>ĐĂNG BÁN ACC CỦA BẠN</span>
            </button>
          </div>

          {/* Trust Metrics Bar - Live from Database */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-slate-800/60 max-w-3xl mx-auto text-left">
            <div className="p-2.5 sm:p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
              <div className="text-sm sm:text-xl font-black text-amber-400">
                {totalAvailableCount} Acc
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Acc có sẵn trên sàn</div>
            </div>

            <div className="p-2.5 sm:p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
              <div className="text-sm sm:text-xl font-black text-emerald-400">100%</div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Bảo hiểm Escrow giữ tiền</div>
            </div>

            <div className="p-2.5 sm:p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
              <div className="text-sm sm:text-xl font-black text-cyan-400">&lt; 30s</div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Bàn giao pass tự động</div>
            </div>

            <div className="p-2.5 sm:p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
              <div className="text-sm sm:text-xl font-black text-purple-400">
                {totalCompletedSales} GD
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Giao dịch thành công</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK CATEGORIES & RANKS FILTER PILLS - DYNAMIC DATA FROM DATABASE */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Crown size={15} className="text-amber-400" />
            <span>Tìm Kiếm Nhanh Theo Hạng Rank:</span>
          </h2>
          <button
            onClick={() => setCurrentView('accounts')}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer"
          >
            <span>Tất cả</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2 sm:gap-2.5">
          {[
            { rank: 'Thách Đấu', count: `${thachDauCount} acc`, filterVal: 'Thách Đấu', color: 'border-rose-500/50 text-rose-300 hover:bg-rose-950/40 shadow-sm shadow-rose-950/30' },
            { rank: 'Chiến Thần', count: `${chienThanCount} acc`, filterVal: 'Chiến Thần', color: 'border-fuchsia-500/50 text-fuchsia-300 hover:bg-fuchsia-950/40 shadow-sm shadow-fuchsia-950/30' },
            { rank: 'Chiến Tướng', count: `${chienTuongCount} acc`, filterVal: 'Chiến Tướng', color: 'border-red-500/40 text-amber-300 hover:bg-red-950/40' },
            { rank: 'Cao Thủ', count: `${caoThuCount} acc`, filterVal: 'Cao Thủ', color: 'border-amber-500/40 text-amber-400 hover:bg-amber-950/40' },
            { rank: 'Tinh Anh', count: `${tinhAnhCount} acc`, filterVal: 'Tinh Anh', color: 'border-purple-500/40 text-purple-300 hover:bg-purple-950/40' },
            { rank: 'Kim Cương', count: `${kimCuongCount} acc`, filterVal: 'Kim Cương', color: 'border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/40' },
            { rank: 'Bạch Kim', count: `${bachKimCount} acc`, filterVal: 'Bạch Kim', color: 'border-teal-500/40 text-teal-300 hover:bg-teal-950/40' },
            { rank: 'Vàng', count: `${vangCount} acc`, filterVal: 'Vàng', color: 'border-yellow-500/40 text-yellow-400 hover:bg-yellow-950/40' },
            { rank: 'Đồng - Bạc', count: `${dongBacCount} acc`, filterVal: 'Đồng - Bạc', color: 'border-slate-600 text-slate-300 hover:bg-slate-800' }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleRankQuickFilter(item.filterVal)}
              className={`p-2.5 sm:p-3 rounded-2xl bg-slate-900 border text-center transition-all hover:scale-[1.02] cursor-pointer ${item.color}`}
            >
              <div className="text-[11px] sm:text-xs font-black uppercase tracking-tight">{item.rank}</div>
              <div className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">{item.count}</div>
            </button>
          ))}
        </div>
      </section>

      {/* MYSTERY BOX PROMOTIONAL HIGHLIGHT SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-slate-900 border-2 border-amber-500/40 p-5 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 text-center lg:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider">
              <Sparkles size={14} className="animate-spin" />
              <span>TÍNH NĂNG MỚI: XÉ TÚI MÙ MAY MẮN</span>
              <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.2 rounded-full animate-pulse">HOT</span>
            </div>

            <h2 className="text-xl sm:text-3xl font-black text-white leading-tight">
              Cơ Hội Nhận Ngay <span className="text-amber-400">Acc VIP SSS, Chiến Tướng</span> Chỉ Từ 20K!
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Mỗi túi mù cam kết 100% mở ra phần thưởng giá trị: Tài khoản Liên Quân trắng thông tin, tiền hoàn ví tức thì, hoặc voucher ưu đãi mua nick!
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <button
                id="home-open-mystery-box-btn"
                onClick={() => {
                  setCurrentView('mystery_box');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:from-amber-400 hover:to-orange-300 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <PackageOpen size={18} />
                <span>VÀO XÉ TÚI MÙ NGAY</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Quick Mini Tier Preview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 w-full lg:w-auto">
            {mysteryBoxes.slice(0, 4).map(box => (
              <button
                key={box.id}
                onClick={() => {
                  setCurrentView('mystery_box');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="p-3 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl text-center space-y-2 cursor-pointer transition-all hover:scale-105"
              >
                <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${box.colorGradient} flex items-center justify-center shadow-md`}>
                  <PackageOpen className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-black text-white truncate">{box.name}</div>
                <div className="text-xs font-mono font-bold text-amber-400">{box.price.toLocaleString('vi-VN')}đ</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURED ACCOUNTS (ACC NỔI BẬT) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
                <Flame size={16} className="animate-pulse" />
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">ACC NỔI BẬT & SIÊU PHẨM</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Tuyển chọn tài khoản bậc SSS, nhiều skin hiếm và rank cao</p>
          </div>

          <button
            id="see-all-featured-btn"
            onClick={() => setCurrentView('accounts')}
            className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Xem tất cả ({approvedAccounts.length})</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {featuredAccounts.slice(0, 4).map(acc => (
            <AccountCard key={acc.id} account={acc} />
          ))}
        </div>
      </section>

      {/* 4. BUDGET ACCOUNTS (< 500K) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                <Tag size={16} />
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">ACC GIÁ RẺ HỌC SINH / SINH VIÊN</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Giá chỉ từ 100k - 500k, ngọc 90 đầy đủ chỉ việc vào leo rank</p>
          </div>

          <button
            onClick={() => handlePriceQuickFilter(500000)}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Xem thêm acc dưới 500k</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {budgetAccounts.slice(0, 4).map(acc => (
            <AccountCard key={acc.id} account={acc} />
          ))}
        </div>
      </section>

      {/* 5. SUPER SKIN ACCOUNTS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-500/15 text-purple-400">
                <Sparkles size={16} />
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">ACC SIÊU SKIN & BỘ SƯU TẬP SSS</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Sở hữu 180+ skin, full hiệu ứng biến về, khung viền giới hạn</p>
          </div>

          <button
            onClick={() => setCurrentView('accounts')}
            className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Khám phá ngay</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {superSkinAccounts.slice(0, 4).map(acc => (
            <AccountCard key={acc.id} account={acc} />
          ))}
        </div>
      </section>

      {/* 6. PROMINENT VERIFIED SELLERS SHOWCASE */}
      {prominentSellers.length > 0 ? (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <UserCheck size={18} />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  HỒ SƠ CÁC SHOP & NGƯỜI BÁN NỔI BẬT
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Các thương gia và shop Liên Quân đã xác thực danh tính, uy tín cao với hàng trăm lượt giao dịch thành công.
              </p>
            </div>

            <button
              onClick={() => setCurrentView('sell')}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/30 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span>Trở thành người bán</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {prominentSellers.map(seller => (
              <div
                key={seller.id}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Seller Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        onClick={() => openSellerProfile(seller.id)}
                        className="relative cursor-pointer group-hover:scale-105 transition-transform"
                      >
                        <img
                          src={seller.avatar}
                          alt={seller.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/40"
                        />
                        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black uppercase flex items-center gap-0.5 border border-slate-950">
                          <CheckCircle2 size={9} /> Online
                        </span>
                      </div>

                      <div>
                        <h3
                          onClick={() => openSellerProfile(seller.id)}
                          className="text-sm font-bold text-white group-hover:text-amber-400 cursor-pointer transition-colors"
                        >
                          {seller.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {seller.isVerifiedSeller && (
                            <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold flex items-center gap-0.5">
                              <ShieldCheck size={10} /> Đã Xác Thực
                            </span>
                          )}
                          <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold uppercase">
                            {seller.sellerTier}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seller Stats */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-0.5 text-amber-400 font-bold text-xs">
                        <Star size={11} className="fill-amber-400" />
                        <span>{seller.averageRating}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Đánh giá</div>
                    </div>

                    <div>
                      <div className="text-white font-bold text-xs">{seller.completedSales}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Đã bán</div>
                    </div>

                    <div>
                      <div className="text-emerald-400 font-bold text-xs">{seller.activeInventoryCount}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Đang bán</div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {seller.bio || 'Chuyên cung cấp Acc Liên Quân VIP, rank Cao Thủ / Chiến Tướng, cam kết 100% trắng thông tin bảo hiểm trọn đời.'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                  <button
                    onClick={() => openSellerProfile(seller.id)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Xem Gian Hàng</span>
                    <ExternalLink size={12} />
                  </button>

                  <button
                    onClick={() =>
                      openChatWith({
                        id: seller.id,
                        name: seller.name,
                        avatar: seller.avatar,
                        role: 'seller'
                      })
                    }
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle size={13} />
                    <span>Nhắn Tin</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-slate-900 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              <ShieldCheck size={14} />
              <span>GIA NHẬP ĐỘI NGŨ NGƯỜI BÁN UY TÍN</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">Bạn Đang Có Tài Khoản Liên Quân Cần Thanh Lý?</h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Đăng bán tài khoản nhanh chóng chỉ trong 1 phút. Hệ thống Escrow bảo vệ an toàn cho cả người mua và người bán, rút tiền về tài khoản ngân hàng siêu tốc 24/7.
            </p>
          </div>

          <button
            onClick={() => setCurrentView('sell')}
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Zap size={16} />
            <span>ĐĂNG BÁN ACC NGAY</span>
          </button>
        </section>
      )}

      {/* 7. HOW ESCROW TRADING WORKS (HƯỚNG DẪN 4 BƯỚC) */}
      <section className="p-6 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">GIAO DỊCH AN TOÀN TUYỆT ĐỐI</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">4 BƯỚC MUA ACC TRUNG GIAN TẠI LQMARKET</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Hệ thống Escrow thông minh giữ tiền của bạn an toàn cho đến khi bạn xác nhận đã kiểm tra tài khoản thành công.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="relative p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-black text-lg flex items-center justify-center border border-amber-500/30">
                1
              </div>
              <h3 className="text-sm font-bold text-white">Chọn Acc & Đặt Mua</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tìm kiếm acc theo tướng, rank, skin và bấm nút MUA NGAY. Bạn có thể nạp tiền qua VietQR hoặc MoMo nhanh chóng.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-amber-400 font-medium flex items-center gap-1">
              <CheckCircle2 size={13} /> Miễn phí giao dịch 0đ
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 font-black text-lg flex items-center justify-center border border-cyan-500/30">
                2
              </div>
              <h3 className="text-sm font-bold text-white">Hệ Thống Giữ Tiền</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tiền của bạn sẽ được sàn LQMarket tạm giữ an toàn trong ví Escrow. Người bán KHÔNG THỂ lấy tiền nếu chưa hoàn thành đơn.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-cyan-400 font-medium flex items-center gap-1">
              <Lock size={13} /> Bảo vệ 100% số tiền
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 font-black text-lg flex items-center justify-center border border-purple-500/30">
                3
              </div>
              <h3 className="text-sm font-bold text-white">Nhận Pass & Đổi Thông Tin</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hệ thống cấp ngay tài khoản, mật khẩu và ghi chú bảo mật. Bạn đăng nhập game kiểm tra skin, ngọc và đổi pass Garena.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-purple-400 font-medium flex items-center gap-1">
              <Clock size={13} /> Cấp pass trong 5 giây
            </div>
          </div>

          {/* Step 4 */}
          <div className="relative p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-lg flex items-center justify-center border border-emerald-500/30">
                4
              </div>
              <h3 className="text-sm font-bold text-white">Xác Nhận & Hoàn Tất</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Khi acc chuẩn xác, bạn bấm [Xác Nhận Nhận Acc] để hoàn tất đơn và chuyển tiền cho seller. Nếu lỗi, bấm [Khiếu Nại] để hoàn tiền.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck size={13} /> Hoàn tiền 100% nếu sai pass
            </div>
          </div>
        </div>
      </section>

      {/* 7. WHY CHOOSE LQMARKET (CAM KẾT DỊCH VỤ) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-base font-bold text-white">Bảo Hành Trọn Đời</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Cam kết tài khoản trắng thông tin 100% hoặc đổi được thông tin số điện thoại/email. Hỗ trợ xử lý tranh chấp 1 đổi 1 hoặc hoàn tiền trọn gói.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <FileCheck size={24} />
          </div>
          <h3 className="text-base font-bold text-white">100% Đã Được Kiểm Duyệt</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Mọi bài đăng của người bán đều trải qua quy trình xác minh rank, số tướng, skin thực tế và kiểm tra tính xác thực trước khi hiển thị.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Headphones size={24} />
          </div>
          <h3 className="text-base font-bold text-white">Đội Ngũ CSKH Túc Trực 24/7</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Hỗ trợ giải đáp thắc mắc, hướng dẫn tân thủ đổi mật khẩu Garena bảo mật cao và can thiệp giải quyết khiếu nại trong vòng 15 phút.
          </p>
        </div>
      </section>
    </div>
  );
};
