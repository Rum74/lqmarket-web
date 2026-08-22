import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { Footer } from './components/layout/Footer';
import { HomeView } from './components/home/HomeView';
import { AccountsListView } from './components/accounts/AccountsListView';
import { SellAccountView } from './components/seller/SellAccountView';
import { OrdersView } from './components/orders/OrdersView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { WishlistView } from './components/wishlist/WishlistView';
import { GuideView } from './components/guide/GuideView';
import { AccountDetailModal } from './components/accounts/AccountDetailModal';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { WalletModal } from './components/wallet/WalletModal';
import { ChatModal } from './components/chat/ChatModal';
import { AuthModal } from './components/auth/AuthModal';
import { SellerProfileModal } from './components/seller/SellerProfileModal';
import { ProfileModal } from './components/profile/ProfileModal';

const MainLayout: React.FC = () => {
  const { currentView, isProfileModalOpen, setIsProfileModalOpen } = useApp();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 pb-16 md:pb-0">
      {/* Main Navigation Header */}
      <Navbar />

      {/* Main App Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {currentView === 'home' && <HomeView />}
        {currentView === 'accounts' && <AccountsListView />}
        {currentView === 'sell' && <SellAccountView />}
        {currentView === 'orders' && <OrdersView />}
        {currentView === 'admin' && <AdminDashboardView />}
        {currentView === 'wishlist' && <WishlistView />}
        {currentView === 'guide' && <GuideView />}
      </main>

      {/* Account Detail Modal */}
      <AccountDetailModal />

      {/* User Profile & Password/Avatar Settings Modal */}
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />

      {/* Seller Profile & Reviews Modal */}
      <SellerProfileModal />

      {/* Escrow Checkout & Buy Now Modal */}
      <CheckoutModal />

      {/* Wallet Top-up & Withdrawal Modal (VietQR API Integration) */}
      <WalletModal />

      {/* Authentication Modal (Login / Register / 3 User Roles) */}
      <AuthModal />

      {/* Live Messenger Modal */}
      <ChatModal />

      {/* Global Footer */}
      <Footer />

      {/* Mobile Bottom Navigation (Visible on screen < md) */}
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
