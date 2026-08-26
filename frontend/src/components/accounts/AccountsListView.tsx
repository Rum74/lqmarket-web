import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AccountCard } from './AccountCard';
import { RankTier } from '../../types';
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Swords,
  Shirt,
  Sparkles,
  ArrowUpDown,
  X,
  Layers,
  ShieldCheck,
  Tag
} from 'lucide-react';

const RANKS_LIST: RankTier[] = [
  'Chiến Tướng',
  'Cao Thủ',
  'Tinh Anh',
  'Kim Cương',
  'Bạch Kim',
  'Vàng',
  'Bạc',
  'Đồng'
];

export const AccountsListView: React.FC = () => {
  const { accounts, filterOptions, setFilterOptions, resetFilters } = useApp();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter approved accounts only
  const approvedAccounts = accounts.filter(a => a.status === 'approved');

  // Filter logic
  const filteredAccounts = approvedAccounts.filter(acc => {
    // Search query
    if (filterOptions.search.trim()) {
      const q = filterOptions.search.toLowerCase();
      const matchTitle = acc.title.toLowerCase().includes(q);
      const matchCode = acc.code.toLowerCase().includes(q);
      const matchHero = acc.notableHeroes.some(h => h.toLowerCase().includes(q));
      const matchSkin = acc.rareSkins.some(
        s => s.name.toLowerCase().includes(q) || s.hero.toLowerCase().includes(q)
      );
      if (!matchTitle && !matchCode && !matchHero && !matchSkin) return false;
    }

    // Rank filter
    if (filterOptions.rank !== 'all') {
      if (filterOptions.rank === 'Đồng - Bạc') {
        if (acc.rank !== 'Đồng' && acc.rank !== 'Bạc') return false;
      } else if (acc.rank !== filterOptions.rank) {
        return false;
      }
    }

    // Price range
    if (acc.price < filterOptions.minPrice || acc.price > filterOptions.maxPrice) {
      return false;
    }

    // Min Heroes
    if (acc.heroesCount < filterOptions.minHeroes) {
      return false;
    }

    // Min Skins
    if (acc.skinsCount < filterOptions.minSkins) {
      return false;
    }

    // Server
    if (filterOptions.server !== 'all' && acc.server !== filterOptions.server) {
      return false;
    }

    // Rare Skin Tier
    if (filterOptions.rareSkinType !== 'all') {
      const hasTier = acc.rareSkins.some(s => s.tier === filterOptions.rareSkinType);
      if (!hasTier) return false;
    }

    // Badge
    if (filterOptions.badge !== 'all' && acc.badgeTag !== filterOptions.badge) {
      return false;
    }

    return true;
  });

  // Sort logic
  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    switch (filterOptions.sortBy) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'most_skins':
        return b.skinsCount - a.skinsCount;
      case 'most_heroes':
        return b.heroesCount - a.heroesCount;
      case 'views':
        return b.views - a.views;
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const activeFilterCount =
    (filterOptions.rank !== 'all' ? 1 : 0) +
    (filterOptions.minPrice > 0 || filterOptions.maxPrice < 6000000 ? 1 : 0) +
    (filterOptions.minHeroes > 0 ? 1 : 0) +
    (filterOptions.minSkins > 0 ? 1 : 0) +
    (filterOptions.rareSkinType !== 'all' ? 1 : 0) +
    (filterOptions.badge !== 'all' ? 1 : 0) +
    (filterOptions.search ? 1 : 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Layers className="text-amber-400" />
            <span>TẤT CẢ ACC LIÊN QUÂN MOBILE</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Hiển thị <strong className="text-amber-400">{sortedAccounts.length}</strong> / {approvedAccounts.length} tài khoản đang bán trên sàn
          </p>
        </div>

        {/* Mobile Filter Toggle & Quick Sort */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="lg:hidden px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-2 cursor-pointer"
          >
            <Filter size={14} className="text-amber-400" />
            <span>Bộ Lọc</span>
            {activeFilterCount > 0 && (
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5">
            <ArrowUpDown size={14} className="text-slate-400" />
            <select
              value={filterOptions.sortBy}
              onChange={e =>
                setFilterOptions(prev => ({
                  ...prev,
                  sortBy: e.target.value as any
                }))
              }
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer font-medium"
            >
              <option value="newest" className="bg-slate-900 text-slate-200">Mới nhất</option>
              <option value="price_asc" className="bg-slate-900 text-slate-200">Giá: Thấp đến Cao</option>
              <option value="price_desc" className="bg-slate-900 text-slate-200">Giá: Cao đến Thấp</option>
              <option value="most_skins" className="bg-slate-900 text-slate-200">Nhiều Trang Phục nhất</option>
              <option value="most_heroes" className="bg-slate-900 text-slate-200">Nhiều Tướng nhất</option>
              <option value="views" className="bg-slate-900 text-slate-200">Xem nhiều nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Sidebar Filters (Desktop & Drawer Mobile) */}
        <div
          className={`${
            isMobileFilterOpen ? 'block fixed inset-0 z-50 bg-slate-950/95 p-6 overflow-y-auto' : 'hidden lg:block'
          } lg:relative lg:bg-transparent lg:p-0 lg:z-auto space-y-5`}
        >
          {/* Mobile Drawer Close Button */}
          {isMobileFilterOpen && (
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 lg:hidden">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-amber-400" />
                <span>BỘ LỌC TÌM KIẾM</span>
              </h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900"
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* Filter Card Container */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Bộ Lọc Chi Tiết</span>
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer"
                  title="Đặt lại bộ lọc"
                >
                  <RotateCcw size={12} />
                  <span>Xóa lọc</span>
                </button>
              )}
            </div>

            {/* Filter 1: Search by Text */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Tìm kiếm từ khóa:</label>
              <div className="relative">
                <input
                  type="text"
                  value={filterOptions.search}
                  onChange={e => setFilterOptions(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Nhập tên tướng, skin, mã acc..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-amber-500"
                />
                <Search size={13} className="absolute left-2.5 top-3 text-slate-500" />
              </div>
            </div>

            {/* Filter 2: Rank Tier */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Hạng Rank:</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setFilterOptions(prev => ({ ...prev, rank: 'all' }))}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filterOptions.rank === 'all'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  Tất cả rank
                </button>
                {RANKS_LIST.map(r => (
                  <button
                    key={r}
                    onClick={() => setFilterOptions(prev => ({ ...prev, rank: r }))}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all truncate cursor-pointer ${
                      filterOptions.rank === r
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800/80'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter 3: Price Range */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">Khoảng Giá:</label>
                <span className="text-xs font-bold text-amber-400">
                  {filterOptions.minPrice.toLocaleString('vi-VN')}đ - {filterOptions.maxPrice.toLocaleString('vi-VN')}đ
                </span>
              </div>

              {/* Quick price chips */}
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: 'Dưới 200k', min: 0, max: 200000 },
                  { label: '200k - 500k', min: 200000, max: 500000 },
                  { label: '500k - 1 Triệu', min: 500000, max: 1000000 },
                  { label: '1Tr - 2 Triệu', min: 1000000, max: 2000000 },
                  { label: 'Trên 2 Triệu', min: 2000000, max: 6000000 },
                  { label: 'Tất cả giá', min: 0, max: 6000000 }
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      setFilterOptions(prev => ({
                        ...prev,
                        minPrice: chip.min,
                        maxPrice: chip.max
                      }))
                    }
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border transition-colors truncate cursor-pointer ${
                      filterOptions.minPrice === chip.min && filterOptions.maxPrice === chip.max
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter 4: Min Heroes Count */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <Swords size={13} className="text-amber-400" />
                <span>Số lượng Tướng tối thiểu:</span>
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {[0, 60, 80, 100, 110].map(cnt => (
                  <button
                    key={cnt}
                    onClick={() => setFilterOptions(prev => ({ ...prev, minHeroes: cnt }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      filterOptions.minHeroes === cnt
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {cnt === 0 ? 'Tất cả' : `${cnt}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter 5: Min Skins Count */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <Shirt size={13} className="text-purple-400" />
                <span>Số lượng Trang phục (Skin):</span>
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {[0, 80, 120, 180, 250].map(cnt => (
                  <button
                    key={cnt}
                    onClick={() => setFilterOptions(prev => ({ ...prev, minSkins: cnt }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      filterOptions.minSkins === cnt
                        ? 'bg-purple-500 text-white font-bold border-purple-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {cnt === 0 ? 'Tất cả' : `${cnt}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter 6: Rare Skin Tier (SSS, Tuyệt Sắc, Anime, Evo) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <Sparkles size={13} className="text-amber-400" />
                <span>Bậc Skin Đặc Biệt:</span>
              </label>
              <select
                value={filterOptions.rareSkinType}
                onChange={e => setFilterOptions(prev => ({ ...prev, rareSkinType: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="all">Tất cả bậc skin</option>
                <option value="SSS">Skin SSS (Thứ Nguyên Vệ Thần, Kiếm Tiên...)</option>
                <option value="Tuyệt Sắc">Skin Tuyệt Sắc</option>
                <option value="Anime">Skin Collab Anime (Kimetsu, OPM, Ultraman)</option>
                <option value="Evo">Skin Nâng Cấp Evo (Ngộ Không, Lữ Bố)</option>
                <option value="Tiệc Bãi Biển">Skin Tiệc Bãi Biển</option>
              </select>
            </div>

            {/* Mobile Apply Button */}
            {isMobileFilterOpen && (
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl"
              >
                Áp dụng bộ lọc ({filteredAccounts.length} kết quả)
              </button>
            )}
          </div>
        </div>

        {/* Product Cards Grid Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Active Filter Tags */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
              <span className="text-xs text-slate-400 font-medium">Đang lọc theo:</span>
              {filterOptions.search && (
                <span className="inline-flex items-center gap-1 text-xs bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                  "{filterOptions.search}"
                  <X
                    size={12}
                    className="cursor-pointer hover:text-white"
                    onClick={() => setFilterOptions(prev => ({ ...prev, search: '' }))}
                  />
                </span>
              )}
              {filterOptions.rank !== 'all' && (
                <span className="inline-flex items-center gap-1 text-xs bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                  Rank: {filterOptions.rank}
                  <X
                    size={12}
                    className="cursor-pointer hover:text-white"
                    onClick={() => setFilterOptions(prev => ({ ...prev, rank: 'all' }))}
                  />
                </span>
              )}
              {filterOptions.rareSkinType !== 'all' && (
                <span className="inline-flex items-center gap-1 text-xs bg-purple-500/10 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-lg">
                  Bậc: {filterOptions.rareSkinType}
                  <X
                    size={12}
                    className="cursor-pointer hover:text-white"
                    onClick={() => setFilterOptions(prev => ({ ...prev, rareSkinType: 'all' }))}
                  />
                </span>
              )}
              {filterOptions.minHeroes > 0 && (
                <span className="inline-flex items-center gap-1 text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg">
                  {filterOptions.minHeroes}+ Tướng
                  <X
                    size={12}
                    className="cursor-pointer hover:text-white"
                    onClick={() => setFilterOptions(prev => ({ ...prev, minHeroes: 0 }))}
                  />
                </span>
              )}
              {filterOptions.minSkins > 0 && (
                <span className="inline-flex items-center gap-1 text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg">
                  {filterOptions.minSkins}+ Skin
                  <X
                    size={12}
                    className="cursor-pointer hover:text-white"
                    onClick={() => setFilterOptions(prev => ({ ...prev, minSkins: 0 }))}
                  />
                </span>
              )}
              <button
                onClick={resetFilters}
                className="text-xs text-rose-400 hover:text-rose-300 underline ml-auto cursor-pointer"
              >
                Xóa tất cả
              </button>
            </div>
          )}

          {/* Results Grid */}
          {sortedAccounts.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-slate-800/80 flex items-center justify-center mx-auto text-slate-500">
                <Search size={28} />
              </div>
              <h3 className="text-base font-bold text-white">Không tìm thấy tài khoản phù hợp</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Hãy thử nới lỏng các tiêu chí lọc (mức giá, rank, số lượng tướng/skin) hoặc đặt lại bộ lọc để xem toàn bộ tài khoản.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Xem tất cả tài khoản
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {sortedAccounts.map(acc => (
                <AccountCard key={acc.id} account={acc} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
