import React, { useState, useEffect } from 'react';
import { Search, X, Flame, Sparkles, SlidersHorizontal, ArrowRight, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TopSearchBar: React.FC = () => {
  const { filterOptions, setFilterOptions, setCurrentView, currentView, accounts } = useApp();
  const [keyword, setKeyword] = useState(filterOptions.search || '');

  // Keep local keyword in sync if filterOptions.search changes externally
  useEffect(() => {
    setKeyword(filterOptions.search || '');
  }, [filterOptions.search]);

  const handleSearch = (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    setFilterOptions(prev => ({
      ...prev,
      search: trimmed
    }));
    if (currentView !== 'accounts') {
      setCurrentView('accounts');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(keyword);
  };

  const handleClear = () => {
    setKeyword('');
    setFilterOptions(prev => ({ ...prev, search: '' }));
  };

  const hotKeywords = [
    { label: 'Acc VIP SSS', query: 'SSS', icon: '🔥' },
    { label: 'Chiến Tướng', query: 'Chiến Tướng', icon: '⭐' },
    { label: 'Nakroth Vệ Thần', query: 'Nakroth Thứ Nguyên', icon: '⚡' },
    { label: 'Raz Muay Thái', query: 'Raz Muay Thái', icon: '🥋' },
    { label: 'Full Tướng', query: 'Full Tướng', icon: '🛡️' },
    { label: 'Nick Dưới 100k', query: '100k', icon: '💰' },
    { label: 'Trắng Thông Tin', query: 'Trắng TT', icon: '✨' },
    { label: 'Cao Thủ', query: 'Cao Thủ', icon: '👑' }
  ];

  const approvedAccountsCount = accounts.filter(a => a.status === 'approved').length;

  return (
    <div className="w-full max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-8 mt-3 sm:mt-4 mb-2">
      <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900/95 via-[#0d1628]/95 to-slate-900/95 border border-slate-800/90 hover:border-slate-700/80 shadow-xl shadow-black/40 backdrop-blur-xl p-3 sm:p-4 md:p-5 overflow-hidden transition-all duration-300">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-16 left-1/4 w-72 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 right-1/4 w-72 h-32 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Main Search Bar Form */}
        <form onSubmit={handleSubmit} className="relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            {/* Input Wrapper */}
            <div className="relative w-full flex-1 flex items-center bg-[#070b14]/90 border border-slate-700/80 hover:border-slate-600 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/25 rounded-xl sm:rounded-2xl transition-all h-[46px] sm:h-[50px] px-3.5 sm:px-4 shadow-inner">
              <div className="flex items-center gap-2 text-amber-400 shrink-0 mr-1">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 pointer-events-none" />
              </div>

              <input
                id="main-global-search-input"
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="Tìm acc theo mã số (#MS...), rank, tướng (Florentino, Nakroth...), skin SSS, giá tiền..."
                className="w-full bg-transparent text-white placeholder:text-slate-400 text-xs sm:text-sm font-medium pr-2 py-2 focus:outline-none"
              />

              {keyword && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors mr-1 cursor-pointer shrink-0"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>

            {/* Submit Action Button */}
            <div className="w-full sm:w-auto flex items-center gap-2 shrink-0">
              <button
                type="submit"
                id="main-global-search-submit-btn"
                className="w-full sm:w-auto h-[44px] sm:h-[50px] px-5 sm:px-7 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:from-amber-400 hover:to-orange-300 text-slate-950 text-xs sm:text-sm font-extrabold rounded-xl sm:rounded-2xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap active:scale-[0.98]"
              >
                <Search className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                <span>TÌM KIẾM</span>
                <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5] hidden sm:inline-block" />
              </button>

              {/* Quick Filter toggle to go to Accounts page */}
              {currentView !== 'accounts' && (
                <button
                  type="button"
                  onClick={() => setCurrentView('accounts')}
                  className="h-[44px] sm:h-[50px] px-3 sm:px-4 bg-slate-800/70 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-semibold rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  title="Xem bộ lọc nâng cao"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">Bộ Lọc</span>
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Hot / Trending Keywords Row */}
        <div className="relative z-10 flex items-center gap-2 pt-3 mt-3 border-t border-slate-800/70 overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex items-center gap-1.5 text-rose-400 shrink-0">
            <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-bold text-slate-300">Từ khóa HOT:</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap shrink-0">
            {hotKeywords.map((item, index) => {
              const isActive = filterOptions.search?.toLowerCase() === item.query.toLowerCase();
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setKeyword(item.query);
                    handleSearch(item.query);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-xs'
                      : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 hover:border-slate-600'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Stats Pill */}
          <div className="ml-auto hidden xl:flex items-center gap-1.5 text-[11px] text-slate-400 shrink-0 pl-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Có <strong className="text-amber-400 font-bold">{approvedAccountsCount}</strong> acc đang sẵn sàng</span>
          </div>
        </div>
      </div>
    </div>
  );
};
