import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { LQMARKET_LOGO } from '../../assets/logo';
import {
  Gamepad2,
  Search,
  Heart,
  Wallet,
  Bell,
  PlusCircle,
  ShoppingBag,
  ShieldCheck,
  Menu,
  X,
  HelpCircle,
  LogOut,
  ChevronDown,
  Sparkles,
  LogIn,
  UserPlus,
  Cloud,
  Store,
  UserCheck,
  User,
  Settings
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    isLoggedIn,
    openLoginModal,
    openRegisterModal,
    logoutUser,
    currentView,
    setCurrentView,
    wishlistIds,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    setIsWalletOpen,
    openProfileModal,
    filterOptions,
    setFilterOptions,
    accounts,
    cloudSyncStatus
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const currentUserNotifications = currentUser.id ? notifications.filter(n => n.userId === currentUser.id) : [];
  const unreadNotifs = currentUserNotifications.filter(n => !n.read);
  const pendingApprovals = accounts.filter(a => a.status === 'pending').length;
  const validWishlistIds = wishlistIds.filter(wid => accounts.some(a => a.id === wid));
  const validWishlistCount = validWishlistIds.length;

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setFilterOptions(prev => ({ ...prev, search: searchInput.trim() }));
      setCurrentView('accounts');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0">
            <button
              id="navbar-logo-btn"
              onClick={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 sm:gap-2 group text-left cursor-pointer shrink-0"
            >
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 min-w-[32px] min-h-[32px] sm:min-w-[40px] sm:min-h-[40px] rounded-full aspect-square shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                <img
                  src={LQMARKET_LOGO}
                  alt="LQMarket Logo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full aspect-square rounded-full object-cover shadow-lg shadow-amber-500/25 border border-amber-500/50 block"
                />
              </div>
              <div className="shrink-0">
                <div className="flex items-center gap-1">
                  <span className="text-base sm:text-xl font-black tracking-tight text-white group-hover:text-amber-400 transition-colors">
                    LQ<span className="text-amber-400">MARKET</span>
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold tracking-wider bg-amber-500/20 text-amber-400 px-1 sm:px-1.5 py-0.5 rounded border border-amber-500/30">
                    cholienquan.com
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                  Sàn Mua Bán Acc Liên Quân Uy Tín • Chợ Liên Quân
                </p>
              </div>
            </button>
          </div>

          {/* Search Bar (Desktop / Tablet Landscape) */}
          <div className="hidden md:flex flex-1 min-w-[180px] max-w-xs lg:max-w-sm xl:max-w-md mx-2 shrink-0">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                id="navbar-search-input"
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Tìm acc theo tướng, rank, skin..."
                className="w-full bg-slate-950/90 border border-slate-700 hover:border-slate-600 text-slate-100 placeholder-slate-400 text-xs rounded-xl pl-9 pr-14 py-2 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <button
                type="submit"
                className="absolute right-1 top-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Tìm
              </button>
            </form>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
            <button
              id="nav-btn-home"
              onClick={() => setCurrentView('home')}
              className={`px-2.5 xl:px-3 py-1.5 rounded-xl text-xs xl:text-sm font-bold tracking-tight transition-colors cursor-pointer whitespace-nowrap ${
                currentView === 'home'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              Trang Chủ
            </button>

            <button
              id="nav-btn-accounts"
              onClick={() => setCurrentView('accounts')}
              className={`px-2.5 xl:px-3 py-1.5 rounded-xl text-xs xl:text-sm font-bold tracking-tight transition-colors cursor-pointer whitespace-nowrap ${
                currentView === 'accounts'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              Tất Cả Acc
            </button>

            <button
              id="nav-btn-mystery-box"
              onClick={() => setCurrentView('mystery_box')}
              className={`px-2.5 xl:px-3 py-1.5 rounded-xl text-xs xl:text-sm font-bold tracking-tight transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                currentView === 'mystery_box'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md shadow-amber-500/25'
                  : 'text-amber-400 bg-amber-400/10 border border-amber-400/30 hover:bg-amber-400/20'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
              <span>Xé Túi Mù</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white animate-pulse">
                HOT
              </span>
            </button>

            {/* Sell button visible only for non-buyers (Sellers, Admins, or Visitors) */}
            {(!isLoggedIn || currentUser.role === 'seller' || currentUser.role === 'admin') && (
              <button
                id="nav-btn-sell"
                onClick={() => {
                  if (!isLoggedIn) {
                    openRegisterModal('seller');
                  } else {
                    setCurrentView('sell');
                  }
                }}
                className={`px-2.5 xl:px-3 py-1.5 rounded-xl text-xs xl:text-sm font-bold tracking-tight transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  currentView === 'sell'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-amber-400 shrink-0" />
                <span>Đăng Bán</span>
              </button>
            )}

            <button
              id="nav-btn-orders"
              onClick={() => setCurrentView('orders')}
              className={`px-2.5 xl:px-3 py-1.5 rounded-xl text-xs xl:text-sm font-bold tracking-tight transition-colors cursor-pointer whitespace-nowrap ${
                currentView === 'orders'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              Đơn Hàng
            </button>

            <button
              id="nav-btn-guide"
              onClick={() => setCurrentView('guide')}
              className={`px-2.5 xl:px-3 py-1.5 rounded-xl text-xs xl:text-sm font-bold tracking-tight transition-colors cursor-pointer whitespace-nowrap ${
                currentView === 'guide'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              Hướng Dẫn
            </button>
          </nav>

          {/* Right Actions: Auth or Profile & Wallet */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {isLoggedIn ? (
              <>
                {/* Sleek Minimalist Wallet Pill */}
                <button
                  id="navbar-wallet-btn"
                  onClick={() => setIsWalletOpen(true)}
                  className="h-9 flex items-center gap-2 bg-slate-950/80 hover:bg-slate-900 border border-amber-500/30 hover:border-amber-500/60 px-2.5 sm:px-3 rounded-xl transition-all cursor-pointer group shadow-xs shrink-0 whitespace-nowrap"
                  title="Ví LQMarket Pay - Bấm để Nạp/Rút"
                >
                  <Wallet className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-black tracking-tight text-slate-100 group-hover:text-amber-300 transition-colors">
                      {currentUser.balance >= 1000000 
                        ? `${(currentUser.balance / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })}M` 
                        : `${currentUser.balance.toLocaleString('vi-VN')}đ`}
                    </span>
                    <span className="hidden sm:inline text-[10px] text-amber-400 font-bold">đ</span>
                  </div>
                  <span className="w-4 h-4 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 flex items-center justify-center text-[11px] font-black leading-none transition-all ml-0.5 shrink-0">
                    +
                  </span>
                </button>

                {/* Wishlist Button */}
                <button
                  id="navbar-wishlist-btn"
                  onClick={() => setCurrentView('wishlist')}
                  className={`hidden sm:flex w-9 h-9 items-center justify-center rounded-xl border relative transition-colors cursor-pointer shrink-0 ${
                    currentView === 'wishlist'
                      ? 'bg-rose-500/15 text-rose-400 border-rose-500/40'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-rose-400 hover:border-slate-700'
                  }`}
                  title="Acc đã lưu / Yêu thích"
                >
                  <Heart className="w-4 h-4" />
                  {validWishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                      {validWishlistCount}
                    </span>
                  )}
                </button>

                {/* Notification Bell */}
                <div className="relative shrink-0" ref={notifRef}>
                  <button
                    id="navbar-notif-btn"
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-slate-700 relative transition-colors cursor-pointer"
                    title="Thông báo hệ thống"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadNotifs.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow-xs">
                        {unreadNotifs.length}
                      </span>
                    )}
                  </button>

                  {/* Notification Popover */}
                  {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-72 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-left">
                      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-amber-400" />
                          <span className="text-sm font-bold text-white">Thông Báo</span>
                        </div>
                        {unreadNotifs.length > 0 && (
                          <button
                            onClick={clearAllNotifications}
                            className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer"
                          >
                            Đọc hết
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                        {currentUserNotifications.length === 0 ? (
                          <div className="p-6 text-center text-slate-500 text-xs">
                            {currentUser.id ? 'Bạn chưa có thông báo nào.' : 'Vui lòng đăng nhập để xem thông báo cá nhân.'}
                          </div>
                        ) : (
                          currentUserNotifications.map(n => (
                            <div
                              key={n.id}
                              onClick={() => markNotificationAsRead(n.id)}
                              className={`p-3 hover:bg-slate-800/60 transition-colors cursor-pointer ${
                                !n.read ? 'bg-amber-500/5' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <h4
                                  className={`text-xs font-semibold ${
                                    !n.read ? 'text-amber-400' : 'text-slate-300'
                                  }`}
                                >
                                  {n.title}
                                </h4>
                                <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                  {new Date(n.createdAt).toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Logged-in User Profile Dropdown */}
                <div className="relative shrink-0" ref={userMenuRef}>
                  <button
                    id="navbar-profile-btn"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="h-9 flex items-center gap-2 px-1.5 sm:px-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group"
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-6 h-6 rounded-lg object-cover border border-amber-500/40 group-hover:border-amber-400 transition-colors"
                    />
                    <div className="text-left hidden sm:block">
                      <span className="text-xs font-bold text-slate-200 group-hover:text-white block max-w-[90px] truncate leading-none">
                        {currentUser.name.split(' ')[0]}
                      </span>
                      <span className="text-[8px] font-black text-amber-400 uppercase tracking-wide leading-none mt-0.5 block">
                        {currentUser.role === 'admin' ? 'ADMIN' : currentUser.role === 'seller' ? 'SELLER' : 'MEMBER'}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline group-hover:text-slate-200 transition-colors" />
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-2 text-left animate-in fade-in duration-150">
                      <div className="p-3 border-b border-slate-800 bg-slate-950/40 rounded-xl mb-2">
                        <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">
                            {currentUser.role === 'buyer'
                              ? '👤 KHÁCH MUA'
                              : currentUser.role === 'seller'
                              ? '🏪 SHOP SELLER'
                              : '🛡️ SUPER ADMIN'}
                          </span>
                          <span className="text-xs font-bold text-amber-400">
                            {currentUser.balance.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs">
                        <button
                          onClick={() => {
                            openProfileModal();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <User className="w-4 h-4 text-amber-400" />
                          <span>Hồ sơ cá nhân & Đổi Avatar</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsWalletOpen(true);
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-2 cursor-pointer"
                        >
                          <Wallet className="w-4 h-4 text-amber-400" />
                          <span>Ví điện tử & Nạp VietQR</span>
                        </button>

                        <button
                          onClick={() => {
                            setCurrentView('orders');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-2 cursor-pointer"
                        >
                          <ShoppingBag className="w-4 h-4 text-cyan-400" />
                          <span>Quản lý đơn hàng</span>
                        </button>

                        {currentUser.role !== 'buyer' && (
                          <button
                            onClick={() => {
                              setCurrentView('sell');
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-2 cursor-pointer"
                          >
                            <PlusCircle className="w-4 h-4 text-emerald-400" />
                            <span>Đăng bán & Quản lý gian hàng</span>
                          </button>
                        )}

                        {currentUser.role === 'admin' && (
                          <button
                            onClick={() => {
                              setCurrentView('admin');
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full px-3 py-2 text-red-400 hover:bg-red-950/50 rounded-lg flex items-center gap-2 cursor-pointer font-bold"
                          >
                            <ShieldCheck className="w-4 h-4 text-red-400" />
                            <span>Bảng điều khiển Super Admin</span>
                          </button>
                        )}

                        <div className="pt-2 border-t border-slate-800 mt-1">
                          <button
                            onClick={() => {
                              logoutUser();
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full px-3 py-2 text-rose-400 hover:bg-rose-950/40 rounded-lg flex items-center gap-2 cursor-pointer"
                          >
                            <LogOut className="w-4 h-4 text-rose-400" />
                            <span>Đăng xuất tài khoản</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* NOT LOGGED IN BUTTONS */
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <LogIn size={13} className="text-amber-400" />
                  <span>Đăng Nhập</span>
                </button>

                <button
                  type="button"
                  onClick={() => openRegisterModal('buyer')}
                  className="px-2.5 sm:px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus size={13} />
                  <span>Đăng Ký</span>
                </button>
              </div>
            )}

            {/* Mobile / Tablet Menu Toggle */}
            <button
              id="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-400 hover:text-white rounded-xl bg-slate-950/60 border border-slate-800 shrink-0 cursor-pointer"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/98 backdrop-blur-xl border-b border-slate-800 px-4 py-4 space-y-3 shadow-2xl">
          {/* Mobile Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Tìm acc theo tướng, rank, skin..."
              className="w-full bg-slate-900 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-xs rounded-xl pl-9 pr-14 py-2.5 focus:outline-none focus:border-amber-500"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-2 py-1 bg-amber-500 text-slate-950 text-xs font-bold rounded-lg"
            >
              Tìm
            </button>
          </form>

          {/* Mobile Menu Links */}
          <div className="space-y-1">
            <button
              onClick={() => {
                setCurrentView('home');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                currentView === 'home' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <span>🏠 Trang Chủ</span>
            </button>
            <button
              onClick={() => {
                setCurrentView('accounts');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                currentView === 'accounts' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <span>⚔️ Tất Cả Acc Liên Quân ({accounts.filter(a => a.status === 'approved').length})</span>
            </button>
            <button
              onClick={() => {
                setCurrentView('mystery_box');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between ${
                currentView === 'mystery_box'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>🎁 Xé Túi Mù May Mắn</span>
                <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[9px] font-black rounded-full animate-pulse">HOT</span>
              </span>
            </button>
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  openRegisterModal('seller');
                } else {
                  setCurrentView('sell');
                }
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                currentView === 'sell' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <span>🏪 Đăng Bán & Gian Hàng</span>
              <PlusCircle className="w-4 h-4 text-amber-400" />
            </button>
            <button
              onClick={() => {
                setCurrentView('orders');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                currentView === 'orders' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <span>📦 Quản Lý Đơn Hàng</span>
            </button>
            <button
              onClick={() => {
                setCurrentView('wishlist');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                currentView === 'wishlist' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <span>❤️ Acc Đã Lưu Yêu Thích</span>
              {validWishlistCount > 0 && (
                <span className="text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                  {validWishlistCount}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setCurrentView('guide');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                currentView === 'guide' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <span>🛡️ Hướng Dẫn & Chính Sách Escrow</span>
            </button>
            {isLoggedIn && currentUser.role === 'admin' && (
              <button
                onClick={() => {
                  setCurrentView('admin');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold bg-red-950/40 text-red-400 border border-red-900/50 flex items-center justify-between"
              >
                <span>🛡️ Super Admin Control</span>
                <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                  {pendingApprovals} duyệt
                </span>
              </button>
            )}
          </div>

          {!isLoggedIn && (
            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  openLoginModal();
                  setIsMobileMenuOpen(false);
                }}
                className="py-2.5 text-center text-xs font-bold bg-slate-800 text-white rounded-xl"
              >
                Đăng Nhập
              </button>
              <button
                onClick={() => {
                  openRegisterModal('buyer');
                  setIsMobileMenuOpen(false);
                }}
                className="py-2.5 text-center text-xs font-bold bg-amber-500 text-slate-950 rounded-xl"
              >
                Đăng Ký
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
