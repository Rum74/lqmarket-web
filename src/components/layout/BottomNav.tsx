import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Gamepad2,
  Layers,
  PlusCircle,
  ShoppingBag,
  User,
  Wallet,
  ShieldCheck,
  Flame,
  Heart
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    isLoggedIn,
    currentUser,
    openLoginModal,
    openProfileModal,
    setIsWalletOpen,
    orders,
    accounts
  } = useApp();

  const myOrdersCount = isLoggedIn
    ? orders.filter(o => o.buyerId === currentUser.id || o.sellerId === currentUser.id).length
    : 0;

  const pendingAdminCount =
    isLoggedIn && currentUser.role === 'admin'
      ? accounts.filter(a => a.status === 'pending').length
      : 0;

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Thanh điều hướng di động"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 shadow-2xl safe-area-pb"
    >
      <div className="grid grid-cols-5 items-center justify-around h-15 px-1 max-w-lg mx-auto">
        {/* Tab 1: Trang Chủ */}
        <button
          id="mobile-nav-home"
          onClick={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
            currentView === 'home'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <div className="relative">
            <Gamepad2 className={`w-5 h-5 ${currentView === 'home' ? 'text-amber-400' : ''}`} />
            {currentView === 'home' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-400 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight leading-none">Trang Chủ</span>
        </button>

        {/* Tab 2: Tất Cả Acc */}
        <button
          id="mobile-nav-accounts"
          onClick={() => {
            setCurrentView('accounts');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
            currentView === 'accounts'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <div className="relative">
            <Layers className={`w-5 h-5 ${currentView === 'accounts' ? 'text-amber-400' : ''}`} />
            {currentView === 'accounts' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-400 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight leading-none">Mua Acc</span>
        </button>

        {/* Tab 3: Đăng Bán (Prominent Center Button) */}
        <div className="flex items-center justify-center -mt-4">
          <button
            id="mobile-nav-sell"
            onClick={() => {
              if (!isLoggedIn) {
                openLoginModal();
              } else {
                setCurrentView('sell');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shadow-lg transition-all transform active:scale-95 cursor-pointer ${
              currentView === 'sell'
                ? 'bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 shadow-amber-500/40 ring-2 ring-amber-400'
                : 'bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 shadow-amber-500/25 hover:brightness-110'
            }`}
            title="Đăng bán acc Liên Quân"
          >
            <PlusCircle className="w-6 h-6 stroke-[2.5]" />
            <span className="text-[8px] font-black tracking-tighter uppercase leading-none mt-0.5">
              Bán Acc
            </span>
          </button>
        </div>

        {/* Tab 4: Đơn Hàng */}
        <button
          id="mobile-nav-orders"
          onClick={() => {
            if (!isLoggedIn) {
              openLoginModal();
            } else {
              setCurrentView('orders');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer relative ${
            currentView === 'orders'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <div className="relative">
            <ShoppingBag className={`w-5 h-5 ${currentView === 'orders' ? 'text-amber-400' : ''}`} />
            {myOrdersCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-amber-500 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {myOrdersCount}
              </span>
            )}
            {currentView === 'orders' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-400 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight leading-none">Đơn Hàng</span>
        </button>

        {/* Tab 5: Tài Khoản / Ví / Admin */}
        <button
          id="mobile-nav-profile"
          onClick={() => {
            if (!isLoggedIn) {
              openLoginModal();
            } else {
              openProfileModal();
            }
          }}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer relative ${
            currentView === 'admin'
              ? 'text-red-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <div className="relative">
            {isLoggedIn ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover border border-amber-500/50"
              />
            ) : (
              <User className="w-5 h-5" />
            )}
            {pendingAdminCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {pendingAdminCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight leading-none">
            {isLoggedIn ? (currentUser.role === 'admin' ? 'Admin' : 'Hồ Sơ') : 'Tài Khoản'}
          </span>
        </button>
      </div>
    </nav>
  );
};
