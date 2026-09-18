import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { LQMARKET_LOGO } from '../../assets/logo';
import {
  Heart,
  Wallet,
  Bell,
  PlusCircle,
  ShoppingBag,
  ShoppingCart,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Sparkles,
  LogIn,
  UserPlus,
  User,
  Home,
  Layers,
  HelpCircle,
  BookOpen,
  Scale,
  Crown,
  Store,
  Share2,
  Gift
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
    setFilterOptions,
    accounts,
    compareAccountIds,
    setIsCompareModalOpen,
    setIsLoyaltyModalOpen
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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

  return (
    <header className="sticky top-0 z-50 bg-[#0b1220]/95 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/20 w-full transition-all">
      {/* Main Header Container (Synchronized with 1536px canvas) */}
      <div className="w-full max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[64px] sm:h-[68px] w-full gap-3 xl:gap-4">

          {/* ====================================================
              1. LEFT GROUP: LOGO & DESKTOP SEARCH
             ==================================================== */}
          <div className="flex items-center gap-2 xl:gap-3 shrink-0">
            {/* Mobile / Tablet Hamburger Toggle Button */}
            <button
              id="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-9 h-9 flex items-center justify-center text-slate-300 hover:text-amber-400 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer shrink-0"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            <button
              id="navbar-logo-btn"
              onClick={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 group text-left cursor-pointer shrink-0 focus:outline-none"
            >
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px] rounded-xl overflow-hidden aspect-square shrink-0 border border-amber-500/40 shadow-sm shadow-amber-500/20 group-hover:scale-105 group-hover:border-amber-400 transition-all">
                <img
                  src={LQMARKET_LOGO}
                  alt="LQMarket Logo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-xl block"
                />
              </div>

              <div className="shrink-0 flex flex-col justify-center">
                <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-amber-400 transition-colors leading-none">
                  LQ<span className="text-amber-400">MARKET</span>
                </span>
                <p className="text-[10px] text-slate-400 font-medium tracking-tight mt-0.5 hidden sm:block leading-tight">
                  Sàn Mua Bán Acc Liên Quân Uy Tín - Chất Lượng
                </p>
              </div>
            </button>
          </div>

          {/* ====================================================
              2. CENTER GROUP: NAVIGATION LINKS
             ==================================================== */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
            {/* Trang Chủ */}
            <button
              id="nav-btn-home"
              onClick={() => setCurrentView('home')}
              className={`h-[35px] px-2.5 xl:px-3 rounded-lg text-xs xl:text-[13px] font-semibold tracking-tight transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                currentView === 'home'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Trang Chủ</span>
            </button>

            {/* Tất Cả Acc */}
            <button
              id="nav-btn-accounts"
              onClick={() => setCurrentView('accounts')}
              className={`h-[35px] px-2.5 xl:px-3 rounded-lg text-xs xl:text-[13px] font-semibold tracking-tight transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                currentView === 'accounts'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Tất Cả Acc</span>
            </button>

            {/* Xé Túi Mù */}
            <button
              id="nav-btn-mystery-box"
              onClick={() => setCurrentView('mystery_box')}
              className={`h-[35px] px-2.5 xl:px-3 rounded-lg text-xs xl:text-[13px] font-semibold tracking-tight transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                currentView === 'mystery_box'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'text-amber-400 bg-amber-400/10 border border-amber-400/30 hover:bg-amber-400/20 font-bold'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>Xé Túi Mù</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white uppercase tracking-wider leading-none animate-pulse">
                HOT
              </span>
            </button>

            {/* Đăng Bán (Dành cho Người Bán / Admin / Khách) */}
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
                className={`h-[35px] px-2.5 xl:px-3 rounded-lg text-xs xl:text-[13px] font-semibold tracking-tight transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  currentView === 'sell'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Đăng Bán</span>
              </button>
            )}

            {/* Đơn Hàng */}
            <button
              id="nav-btn-orders"
              onClick={() => setCurrentView('orders')}
              className={`h-[35px] px-2.5 xl:px-3 rounded-lg text-xs xl:text-[13px] font-semibold tracking-tight transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                currentView === 'orders'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Đơn Hàng</span>
            </button>

            {/* Hướng Dẫn */}
            <button
              id="nav-btn-guide"
              onClick={() => setCurrentView('guide')}
              className={`h-[35px] px-2.5 xl:px-3 rounded-lg text-xs xl:text-[13px] font-semibold tracking-tight transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                currentView === 'guide'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Hướng Dẫn</span>
            </button>

            {/* Cẩm Nang / Blog */}
            <button
              id="nav-btn-blog"
              onClick={() => setCurrentView('blog')}
              className={`h-[35px] px-2.5 xl:px-3 rounded-lg text-xs xl:text-[13px] font-semibold tracking-tight transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                currentView === 'blog'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Cẩm Nang</span>
            </button>

            {/* Giới Thiệu (Referral) */}
            <button
              id="nav-btn-referral"
              onClick={() => setCurrentView('referral')}
              className={`h-[35px] px-2.5 xl:px-3 rounded-lg text-xs xl:text-[13px] font-semibold tracking-tight transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                currentView === 'referral'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
              }`}
            >
              <Gift className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Giới Thiệu</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-500 text-slate-950 uppercase tracking-wider leading-none">
                TẶNG TIỀN
              </span>
            </button>
          </nav>

          {/* ====================================================
              3. RIGHT GROUP: ACCOUNT & ACTIONS AREA
             ==================================================== */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
            {/* Compare Tool Pill (if accounts selected) */}
            {compareAccountIds.length > 0 && (
              <button
                id="navbar-compare-btn"
                onClick={() => setIsCompareModalOpen(true)}
                className="h-[35px] sm:h-[36px] flex items-center gap-1.5 bg-gradient-to-r from-cyan-950 to-blue-950 hover:from-cyan-900 hover:to-blue-900 border border-cyan-500/40 px-2.5 rounded-xl transition-all cursor-pointer group shadow-sm text-cyan-300 font-bold text-xs"
                title="Mở bảng so sánh tài khoản"
              >
                <Scale className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">So Sánh</span>
                <span className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-[10px] font-black">
                  {compareAccountIds.length}
                </span>
              </button>
            )}
            {isLoggedIn ? (
              <>
                {/* Wallet Balance Pill */}
                <button
                  id="navbar-wallet-btn"
                  onClick={() => setIsWalletOpen(true)}
                  className="h-[35px] sm:h-[36px] flex items-center gap-1.5 sm:gap-2 bg-[#070b14] hover:bg-slate-900 border border-amber-500/30 hover:border-amber-500/60 px-2 sm:px-2.5 rounded-xl transition-all cursor-pointer group shadow-xs shrink-0 whitespace-nowrap"
                  title="Ví LQMarket Pay - Bấm để Nạp / Rút"
                >
                  <Wallet className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-xs font-black tracking-tight text-slate-100 group-hover:text-amber-300 transition-colors">
                      {currentUser.balance >= 1000000
                        ? `${(currentUser.balance / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })}M`
                        : `${currentUser.balance.toLocaleString('vi-VN')}đ`}
                    </span>
                  </div>
                  <span className="w-4 h-4 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 flex items-center justify-center text-[10px] font-black leading-none transition-all ml-0.5 shrink-0">
                    +
                  </span>
                </button>

                {/* Wishlist Button */}
                <button
                  id="navbar-wishlist-btn"
                  onClick={() => setCurrentView('wishlist')}
                  className={`hidden sm:flex w-[35px] h-[35px] sm:w-[36px] sm:h-[36px] items-center justify-center rounded-xl border relative transition-colors cursor-pointer shrink-0 ${
                    currentView === 'wishlist'
                      ? 'bg-rose-500/15 text-rose-400 border-rose-500/40'
                      : 'bg-[#070b14] border-slate-800 text-slate-300 hover:text-rose-400 hover:border-slate-700'
                  }`}
                  title="Acc Đã Lưu Yêu Thích"
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
                    className="w-[35px] h-[35px] sm:w-[36px] sm:h-[36px] flex items-center justify-center rounded-xl bg-[#070b14] border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-slate-700 relative transition-colors cursor-pointer"
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
                    <div className="absolute right-0 mt-2 w-72 sm:w-88 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-left">
                      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-bold text-white uppercase tracking-wider">Thông Báo</span>
                        </div>
                        {unreadNotifs.length > 0 && (
                          <button
                            onClick={clearAllNotifications}
                            className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
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
                    className="h-[35px] sm:h-[36px] flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 rounded-xl bg-[#070b14] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group"
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-6 h-6 rounded-lg object-cover border border-amber-500/40 group-hover:border-amber-400 transition-colors shrink-0"
                    />
                    <div className="text-left hidden sm:block">
                      <span className="text-xs font-bold text-slate-200 group-hover:text-white block max-w-[90px] truncate leading-none">
                        {currentUser.name.split(' ')[0]}
                      </span>
                      <span className="text-[8px] font-black text-amber-400 uppercase tracking-wide leading-none mt-0.5 block">
                        {currentUser.role === 'admin' ? 'ADMIN' : currentUser.role === 'seller' ? 'SELLER' : 'MEMBER'}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline group-hover:text-slate-200 transition-colors shrink-0" />
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-2 text-left animate-in fade-in duration-150">
                      <div className="p-3 border-b border-slate-800 bg-slate-950/60 rounded-xl mb-2">
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
                          className="w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <Wallet className="w-4 h-4 text-amber-400" />
                          <span>Ví điện tử & Nạp VietQR</span>
                        </button>

                        <button
                          onClick={() => {
                            setCurrentView('orders');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <ShoppingBag className="w-4 h-4 text-cyan-400" />
                          <span>Quản lý đơn hàng</span>
                        </button>

                        {currentUser.role !== 'buyer' && (
                          <button
                            onClick={() => {
                              setCurrentView('seller_center');
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full px-3 py-2 text-amber-300 hover:text-white hover:bg-amber-500/20 rounded-lg flex items-center gap-2 cursor-pointer font-bold"
                          >
                            <Store className="w-4 h-4 text-amber-400" />
                            <span>Kênh Người Bán (Seller Center)</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setIsLoyaltyModalOpen(true);
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <Crown className="w-4 h-4 text-amber-400" />
                          <span>Cấp Bậc Hội Viên & Ưu Đãi</span>
                        </button>

                        <button
                          onClick={() => {
                            setCurrentView('referral');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <Gift className="w-4 h-4 text-amber-400" />
                          <span>Giới thiệu bạn bè (Referral)</span>
                        </button>

                        {currentUser.role !== 'buyer' && (
                          <button
                            onClick={() => {
                              setCurrentView('sell');
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-2 cursor-pointer font-medium"
                          >
                            <PlusCircle className="w-4 h-4 text-emerald-400" />
                            <span>Đăng bán tài khoản mới</span>
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
                            className="w-full px-3 py-2 text-rose-400 hover:bg-rose-950/40 rounded-lg flex items-center gap-2 cursor-pointer font-medium"
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
              /* ====================================================
                 5. AUTH BUTTONS (NOT LOGGED IN)
                 - Đăng Nhập: outline/subtle button
                 - Đăng Ký: primary yellow/orange button
                 - Height: ~36-38px, clean and prominent
                 ==================================================== */
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  id="navbar-login-btn"
                  onClick={openLoginModal}
                  className="h-[35px] sm:h-[36px] px-3 sm:px-4 rounded-full text-xs font-semibold text-slate-200 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
                >
                  <User size={13} className="text-slate-400" />
                  <span>Đăng Nhập</span>
                </button>

                <button
                  type="button"
                  id="navbar-register-btn"
                  onClick={() => openRegisterModal('buyer')}
                  className="h-[35px] sm:h-[36px] px-3.5 sm:px-4.5 rounded-full text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <UserPlus size={13} />
                  <span>Đăng Ký</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ====================================================
          MOBILE / TABLET DRAWER MENU (HÀNG MỞ RỘNG KHI BẤM MENU)
          Sạch sẽ, mượt mà, dark navy, không tràn màn hình
         ==================================================== */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0f1d]/98 backdrop-blur-xl border-b border-slate-800 px-4 py-4 space-y-2 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            <button
              onClick={() => {
                setCurrentView('home');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                currentView === 'home'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold'
                  : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <Home className="w-4 h-4 text-amber-400" />
              <span>Trang Chủ</span>
            </button>

            <button
              onClick={() => {
                setCurrentView('accounts');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                currentView === 'accounts'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold'
                  : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Tất Cả Acc Liên Quân</span>
              </div>
              <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                {accounts.filter(a => a.status === 'approved').length} acc
              </span>
            </button>

            <button
              onClick={() => {
                setCurrentView('mystery_box');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                currentView === 'mystery_box'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Xé Túi Mù May Mắn</span>
              </div>
              <span className="px-2 py-0.5 bg-rose-500 text-white text-[9px] font-black rounded-full uppercase tracking-wider animate-pulse">
                HOT
              </span>
            </button>

            {(!isLoggedIn || currentUser.role === 'seller' || currentUser.role === 'admin') && (
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    openRegisterModal('seller');
                  } else {
                    setCurrentView('sell');
                  }
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                  currentView === 'sell'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <PlusCircle className="w-4 h-4 text-emerald-400" />
                  <span>Đăng Bán & Quản Lý Gian Hàng</span>
                </div>
              </button>
            )}

            <button
              onClick={() => {
                setCurrentView('orders');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                currentView === 'orders'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold'
                  : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-cyan-400" />
              <span>Quản Lý Đơn Hàng</span>
            </button>

            <button
              onClick={() => {
                setCurrentView('wishlist');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                currentView === 'wishlist'
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold'
                  : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Acc Đã Lưu Yêu Thích</span>
              </div>
              {validWishlistCount > 0 && (
                <span className="text-[10px] bg-rose-500 text-white font-bold px-2 py-0.5 rounded-full">
                  {validWishlistCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setCurrentView('guide');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                currentView === 'guide'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold'
                  : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Hướng Dẫn & Chính Sách Escrow</span>
            </button>

            <button
              onClick={() => {
                setCurrentView('blog');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                currentView === 'blog'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold'
                  : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Cẩm Nang Leo Rank & Tin Tức</span>
            </button>

            <button
              onClick={() => {
                setCurrentView('referral');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                currentView === 'referral'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold'
                  : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <Gift className="w-4 h-4 text-amber-400" />
              <div className="flex items-center justify-between flex-1">
                <span>Giới Thiệu Bạn Bè (Referral)</span>
                <span className="text-[9px] font-black bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded-full uppercase">
                  TẶNG TIỀN
                </span>
              </div>
            </button>

            <button
              onClick={() => {
                setIsLoyaltyModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors text-amber-300 hover:bg-slate-900"
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Cấp Bậc Hội Viên (Loyalty)</span>
            </button>

            {isLoggedIn && (currentUser.role === 'seller' || currentUser.role === 'admin') && (
              <button
                onClick={() => {
                  setCurrentView('seller_center');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-2.5"
              >
                <Store className="w-4 h-4 text-amber-400" />
                <span>Kênh Quản Lý Người Bán (Seller Center)</span>
              </button>
            )}

            {isLoggedIn && currentUser.role === 'admin' && (
              <button
                onClick={() => {
                  setCurrentView('admin');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold bg-red-950/40 text-red-400 border border-red-900/50 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-red-400" />
                  <span>Bảng Điều Khiển Super Admin</span>
                </div>
                <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">
                  {pendingApprovals} duyệt
                </span>
              </button>
            )}
          </div>

          {!isLoggedIn && (
            <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  openLoginModal();
                  setIsMobileMenuOpen(false);
                }}
                className="py-2.5 text-center text-xs font-bold bg-slate-800 text-white rounded-xl border border-slate-700 flex items-center justify-center gap-1.5"
              >
                <LogIn size={14} className="text-amber-400" />
                <span>Đăng Nhập</span>
              </button>
              <button
                onClick={() => {
                  openRegisterModal('buyer');
                  setIsMobileMenuOpen(false);
                }}
                className="py-2.5 text-center text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-xl shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
              >
                <UserPlus size={14} />
                <span>Đăng Ký</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

