import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MysteryBoxTierConfig,
  MysteryBoxRewardItem,
  UserInventoryItem
} from '../../types';
import { UnboxModal } from './UnboxModal';
import {
  PackageOpen,
  Sparkles,
  Trophy,
  Flame,
  ShieldCheck,
  Zap,
  Gift,
  Coins,
  Ticket,
  Gamepad2,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Info,
  Clock,
  Wallet,
  Copy,
  Check,
  Eye,
  EyeOff,
  Star,
  Layers,
  ArrowUpRight,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

export const MysteryBoxView: React.FC = () => {
  const {
    currentUser,
    isLoggedIn,
    mysteryBoxes,
    mysteryRewards,
    mysteryHistory,
    userInventory,
    userFreeTurns,
    isMysteryBoxEventActive,
    openMysteryBox,
    useUserInventoryItem,
    setCurrentView,
    setIsWalletModalOpen,
    openLoginModal
  } = useApp();

  const [activeTab, setActiveTab] = useState<'boxes' | 'inventory' | 'history' | 'rules'>('boxes');
  const [selectedBoxForModal, setSelectedBoxForModal] = useState<MysteryBoxTierConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpeningBox, setIsOpeningBox] = useState(false);
  const [openedRewardResult, setOpenedRewardResult] = useState<MysteryBoxRewardItem | null>(null);
  const [previewTierRewards, setPreviewTierRewards] = useState<string | null>(null);

  // Inventory filter state
  const [inventoryFilter, setInventoryFilter] = useState<'all' | 'account' | 'voucher'>('all');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Handle Box Opening
  const handleStartUnbox = async (box: MysteryBoxTierConfig) => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    const freeTurns = userFreeTurns[box.id] || 0;
    if (freeTurns <= 0 && currentUser.balance < box.price) {
      setIsWalletModalOpen(true);
      return;
    }

    setSelectedBoxForModal(box);
    setOpenedRewardResult(null);
    setIsOpeningBox(true);
    setIsModalOpen(true);

    try {
      const res = await openMysteryBox(box.id);
      if (res.success && res.reward) {
        setOpenedRewardResult(res.reward);
      } else {
        alert(res.message);
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error(err);
      setIsModalOpen(false);
    } finally {
      setIsOpeningBox(false);
    }
  };

  const handleOpenAnother = (boxId: string) => {
    const box = mysteryBoxes.find(b => b.id === boxId);
    if (box) {
      handleStartUnbox(box);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePasswordVisibility = (itemId: string) => {
    setRevealedPasswords(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // Filtered inventory items for current user
  const myInventoryItems = userInventory.filter(
    item => item.userId === currentUser.id && (inventoryFilter === 'all' || item.rewardType === inventoryFilter)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* 1. HERO BANNER */}
      <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 pt-8 pb-10 sm:py-12 px-4">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={14} className="animate-spin" />
                <span>Siêu Phẩm Xé Túi Mù May Mắn</span>
                <Flame size={14} className="text-orange-500 animate-bounce" />
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                XÉ TÚI MÙ MAY MẮN <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400">
                  100% TRÚNG THƯỞNG ACC VIP
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Chỉ từ <strong className="text-amber-400">20.000đ</strong> có cơ hội sở hữu ngay tài khoản Liên Quân Full Tướng, Full Skin SSS, Chiến Tướng, Tiền mặt hoàn ví và Voucher siêu giá trị!
              </p>

              {/* Guarantees Badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 pt-2 text-[11px] font-medium text-slate-300">
                <span className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-lg">
                  <ShieldCheck size={14} className="text-emerald-400" /> Trắng Thông Tin 100%
                </span>
                <span className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-lg">
                  <Zap size={14} className="text-amber-400" /> Nhận Acc Liền Tay
                </span>
                <span className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-lg">
                  <Coins size={14} className="text-yellow-400" /> Hoàn Tiền Vào Ví
                </span>
              </div>
            </div>

            {/* User Quick Wallet Widget */}
            <div className="w-full md:w-80 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                  <Wallet size={14} className="text-amber-400" /> Số dư ví của bạn
                </span>
                <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  {isLoggedIn ? currentUser.role.toUpperCase() : 'KHÁCH'}
                </span>
              </div>

              <div className="text-2xl font-black text-white font-mono">
                {isLoggedIn ? `${currentUser.balance.toLocaleString('vi-VN')}đ` : 'Chưa đăng nhập'}
              </div>

              {isLoggedIn ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsWalletModalOpen(true)}
                    className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Coins size={14} /> Nạp Thêm Tiền
                  </button>
                  <button
                    onClick={() => setActiveTab('inventory')}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Gift size={14} /> Túi Đồ ({userInventory.filter(i => i.userId === currentUser.id).length})
                  </button>
                </div>
              ) : (
                <button
                  onClick={openLoginModal}
                  className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
                >
                  Đăng Nhập Để Xé Túi Mù
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. REAL-TIME WINNERS TICKER (Hides if empty) */}
      {mysteryHistory && mysteryHistory.length > 0 && (
        <div className="bg-slate-900 border-b border-slate-800/80 py-2.5 px-4 overflow-hidden">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 uppercase tracking-wider shrink-0 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              <Trophy size={13} className="animate-bounce" />
              <span className="hidden sm:inline">Vừa Trúng Thưởng:</span>
              <span className="sm:hidden">Trúng:</span>
            </div>

            <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-4 text-xs whitespace-nowrap">
              {mysteryHistory.slice(0, 10).map((h, idx) => (
                <div key={h.id || idx} className="inline-flex items-center gap-2 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800">
                  <span className="font-bold text-slate-200">{h.userName}</span>
                  <span className="text-slate-500">vừa xé trúng</span>
                  <span className="font-black text-amber-300">{h.rewardTitle}</span>
                  <span className="text-[10px] text-slate-400">({h.openedAt})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN NAVIGATION TABS */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('boxes')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'boxes'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <PackageOpen size={16} />
            <span>Chọn Túi Mù</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'inventory'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Gift size={16} />
            <span>Túi Đồ Của Tôi</span>
            {isLoggedIn && (
              <span className="px-1.5 py-0.2 bg-slate-950 text-amber-400 text-[10px] font-black rounded-full">
                {userInventory.filter(i => i.userId === currentUser.id).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'history'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Clock size={16} />
            <span>Lịch Sử Server</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'rules'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <HelpCircle size={16} />
            <span>Quy Định & Tỷ Lệ</span>
          </button>
        </div>
      </div>

      {/* 4. TAB CONTENTS */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        {/* TAB 1: MYSTERY BOXES GRID */}
        {activeTab === 'boxes' && (
          <div className="space-y-8">
            {/* Global Inactive Event Notice */}
            {!isMysteryBoxEventActive && (
              <div className="bg-rose-950/80 border border-rose-700/80 rounded-2xl p-4 sm:p-5 flex items-center gap-3 text-rose-200 shadow-xl">
                <AlertTriangle className="w-8 h-8 text-rose-400 shrink-0" />
                <div>
                  <div className="text-sm sm:text-base font-black text-white">
                    Chương Trình Xé Túi Mù Hiện Đang Tạm Đóng
                  </div>
                  <div className="text-xs text-rose-300/90 mt-0.5">
                    Ban quản trị đang nâng cấp và bổ sung thêm các phần thưởng mới. Bạn vẫn có thể truy cập tab "Túi Đồ Của Tôi" để nhận thông tin nick và voucher đã trúng trước đó!
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {mysteryBoxes.map(box => {
                const isBoxActive = isMysteryBoxEventActive && box.isActive !== false;
                const freeTurns = userFreeTurns[box.id] || 0;
                const availableRewards = mysteryRewards.filter(
                  r => r.boxTierId === box.id || r.boxTierId === 'all'
                );

                return (
                  <div
                    key={box.id}
                    className={`relative rounded-3xl bg-slate-900/90 border ${box.borderColor} p-5 flex flex-col justify-between shadow-xl transition-all duration-300 ${
                      isBoxActive ? 'hover:-translate-y-1 hover:shadow-2xl' : 'opacity-70 grayscale-[25%] border-dashed'
                    } overflow-hidden group`}
                  >
                    {/* Top Tier Tag */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isBoxActive ? `bg-gradient-to-r ${box.colorGradient} text-white shadow-sm` : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isBoxActive ? (box.tagText || box.badge || 'HOT') : 'TẠM ĐÓNG'}
                      </span>

                      {box.stockRemaining !== undefined && (
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                          <Layers size={12} className="text-amber-400" />
                          Còn lại: <strong className="text-slate-200">{box.stockRemaining} túi</strong>
                        </span>
                      )}
                    </div>

                    {/* Box 3D Art Representation */}
                    <div className="py-5 flex flex-col items-center justify-center relative">
                      <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br ${box.colorGradient} p-5 flex items-center justify-center shadow-lg ${
                        isBoxActive ? 'transform group-hover:scale-105 transition-transform' : 'opacity-60'
                      }`}>
                        <PackageOpen className="w-14 h-14 text-white drop-shadow-md" />
                      </div>

                      {isBoxActive && freeTurns > 0 && (
                        <span className="absolute -top-1 right-8 px-2 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full shadow-md animate-bounce">
                          {freeTurns} lượt free
                        </span>
                      )}
                    </div>

                    {/* Box Title & Description */}
                    <div className="space-y-1.5 text-center mt-2">
                      <h3 className="text-base sm:text-lg font-black text-white">{box.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2">{box.description}</p>
                    </div>

                    {/* Highlights Reward Pills */}
                    <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                        <span>Phần thưởng nổi bật:</span>
                        <button
                          onClick={() => setPreviewTierRewards(previewTierRewards === box.id ? null : box.id)}
                          className="text-[10px] text-amber-400 hover:underline cursor-pointer flex items-center gap-0.5"
                        >
                          Xem kho ({availableRewards.length})
                        </button>
                      </div>

                      <div className="space-y-1">
                        {availableRewards.slice(0, 2).map((r, i) => (
                          <div key={r.id || i} className="flex items-center justify-between text-[11px] bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800/80">
                            <span className="truncate max-w-[140px] text-slate-300 font-medium">
                              {r.type === 'account' ? '🎮' : r.type === 'cash' ? '💵' : r.type === 'voucher' ? '🎟️' : '🔄'} {r.title}
                            </span>
                            <span className="font-bold text-amber-400 shrink-0">
                              {r.value >= 1000 ? `${(r.value / 1000).toLocaleString()}k` : r.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Expanded Reward Drawer if clicked */}
                    {previewTierRewards === box.id && (
                      <div className="mt-3 p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs max-h-40 overflow-y-auto">
                        <div className="font-bold text-[11px] text-amber-400 pb-1 border-b border-slate-800">
                          Tất cả quà có thể xé trúng:
                        </div>
                        {availableRewards.map((r, i) => (
                          <div key={r.id || i} className="flex items-center justify-between py-1 text-[11px] border-b border-slate-900 last:border-0">
                            <span className="text-slate-300 truncate max-w-[130px]">{r.title}</span>
                            <span className="text-amber-400 font-mono font-bold">{r.value.toLocaleString('vi-VN')}đ</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Price & Action Button */}
                    <div className="mt-5 pt-3 border-t border-slate-800 space-y-2">
                      <div className="flex items-baseline justify-center gap-1.5">
                        <span className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 font-mono">
                          {box.price.toLocaleString('vi-VN')}đ
                        </span>
                        <span className="text-[11px] text-slate-400">/ lượt xé</span>
                      </div>

                      <button
                        id={`unbox-btn-${box.id}`}
                        disabled={!isBoxActive}
                        onClick={() => isBoxActive && handleStartUnbox(box)}
                        className={`w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                          !isBoxActive
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                            : freeTurns > 0
                            ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-rose-500/25 animate-pulse cursor-pointer'
                            : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:from-amber-400 hover:to-orange-300 text-slate-950 shadow-amber-500/20 cursor-pointer active:scale-95'
                        }`}
                      >
                        <Zap size={16} />
                        <span>
                          {!isMysteryBoxEventActive
                            ? 'Chương Trình Tạm Dừng'
                            : box.isActive === false
                            ? 'Hạng Túi Tạm Đóng'
                            : freeTurns > 0
                            ? `Xé Miễn Phí (Còn ${freeTurns})`
                            : 'Xé Túi Mù Ngay'}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Why Play Mystery Box on LQMarket */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-black text-white text-center mb-6">
                TẠI SAO NÊN CHƠI TÚI MÙ TẠI LQMARKET?
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <ShieldCheck size={20} />
                  </div>
                  <h3 className="font-bold text-sm text-white">Bảo Hành Trắng Thông Tin</h3>
                  <p className="text-xs text-slate-400">100% nick trúng thưởng đều đổi được mật khẩu và gắn số điện thoại/email của bạn.</p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Coins size={20} />
                  </div>
                  <h3 className="font-bold text-sm text-white">Cơ Chế Bảo Hiểm Hoàn Tiền</h3>
                  <p className="text-xs text-slate-400">Nếu không trúng acc, bạn vẫn nhận được tiền hoàn vào ví hoặc voucher mua nick.</p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Gamepad2 size={20} />
                  </div>
                  <h3 className="font-bold text-sm text-white">Kho Acc Khủng Tuyển Chọn</h3>
                  <p className="text-xs text-slate-400">Tài khoản từ Cao Thủ đến Chiến Tướng, full tướng và các skin siêu phẩm SSS.</p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                    <Zap size={20} />
                  </div>
                  <h3 className="font-bold text-sm text-white">Trả Thưởng Tự Động 1s</h3>
                  <p className="text-xs text-slate-400">Tài khoản và mật khẩu hiển thị ngay tức thì, đồng bộ tự động vào Túi Đồ.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER INVENTORY (TÚI ĐỒ CỦA TÔI) */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Gift className="text-amber-400" />
                  Kho Quà &amp; Tài Khoản Đã Xé Trúng
                </h2>
                <p className="text-xs text-slate-400">Xem lại thông tin đăng nhập các tài khoản và mã voucher của bạn</p>
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setInventoryFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    inventoryFilter === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tất cả ({userInventory.filter(i => i.userId === currentUser.id).length})
                </button>
                <button
                  onClick={() => setInventoryFilter('account')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    inventoryFilter === 'account' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tài khoản ({userInventory.filter(i => i.userId === currentUser.id && i.rewardType === 'account').length})
                </button>
                <button
                  onClick={() => setInventoryFilter('voucher')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    inventoryFilter === 'voucher' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Voucher ({userInventory.filter(i => i.userId === currentUser.id && i.rewardType === 'voucher').length})
                </button>
              </div>
            </div>

            {!isLoggedIn ? (
              <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800 space-y-3">
                <PackageOpen className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">Vui lòng đăng nhập</h3>
                <p className="text-xs text-slate-400">Đăng nhập để xem danh sách phần thưởng bạn đã trúng</p>
                <button
                  onClick={openLoginModal}
                  className="py-2 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer"
                >
                  Đăng Nhập Ngay
                </button>
              </div>
            ) : myInventoryItems.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800 space-y-3">
                <PackageOpen className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">Túi đồ hiện đang trống</h3>
                <p className="text-xs text-slate-400">Bạn chưa xé trúng phần thưởng nào. Hãy thử vận may ngay!</p>
                <button
                  onClick={() => setActiveTab('boxes')}
                  className="py-2 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer"
                >
                  Xé Túi Mù Ngay
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myInventoryItems.map(item => (
                  <div
                    key={item.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                          {item.rewardType === 'account' ? (
                            <Gamepad2 className="w-5 h-5 text-amber-400" />
                          ) : (
                            <Ticket className="w-5 h-5 text-cyan-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white">{item.title}</h4>
                          <span className="text-[11px] text-slate-400">
                            Nhận lúc: {new Date(item.receivedAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-black text-amber-400 font-mono">
                        {item.value.toLocaleString('vi-VN')}đ
                      </span>
                    </div>

                    {/* Account Item Credentials Viewer */}
                    {item.rewardType === 'account' && item.accountData && (
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-[11px]">Tài khoản:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-amber-300">{item.accountData.credentials.username}</span>
                            <button
                              onClick={() => handleCopyText(item.accountData?.credentials.username || '', `acc_u_${item.id}`)}
                              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded cursor-pointer"
                              title="Sao chép"
                            >
                              {copiedId === `acc_u_${item.id}` ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-[11px]">Mật khẩu:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-emerald-400">
                              {revealedPasswords[item.id] ? item.accountData.credentials.password : '••••••••••••'}
                            </span>
                            <button
                              onClick={() => togglePasswordVisibility(item.id)}
                              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded cursor-pointer"
                            >
                              {revealedPasswords[item.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                            <button
                              onClick={() => handleCopyText(item.accountData?.credentials.password || '', `acc_p_${item.id}`)}
                              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded cursor-pointer"
                              title="Sao chép"
                            >
                              {copiedId === `acc_p_${item.id}` ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                          <span>Bảo mật: <strong className="text-emerald-400">{item.accountData.credentials.securityType}</strong></span>
                          <span>Server: <strong className="text-slate-300">{item.accountData.rank || 'Liên Quân VN'}</strong></span>
                        </div>
                      </div>
                    )}

                    {/* Voucher Code Viewer */}
                    {item.rewardType === 'voucher' && item.voucherCode && (
                      <div className="p-3 bg-cyan-950/30 rounded-xl border border-cyan-800/50 flex items-center justify-between">
                        <div>
                          <div className="text-[11px] text-slate-400">Mã khuyến mãi:</div>
                          <div className="font-mono font-black text-cyan-400 text-sm">{item.voucherCode}</div>
                        </div>

                        <button
                          onClick={() => handleCopyText(item.voucherCode || '', `v_${item.id}`)}
                          className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 border border-cyan-800 text-cyan-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === `v_${item.id}` ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          <span>{copiedId === `v_${item.id}` ? 'Đã sao chép' : 'Sao chép'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SERVER HISTORY */}
        {activeTab === 'history' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">Lịch Sử Mở Túi Toàn Hệ Thống</h2>
                <p className="text-xs text-slate-400">Dữ liệu được cập nhật theo thời gian thực 100% minh bạch</p>
              </div>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <CheckCircle2 size={13} /> Trực Tiếp
              </span>
            </div>

            <div className="divide-y divide-slate-800">
              {mysteryHistory.map((item, idx) => (
                <div key={item.id || idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                      alt=""
                      className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                    />
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{item.userName}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded">
                          {item.boxName}
                        </span>
                      </div>
                      <div className="text-[11px] text-amber-400 font-medium">
                        Trúng: {item.rewardTitle}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-black text-slate-200">
                      {item.rewardValue ? `${item.rewardValue.toLocaleString('vi-VN')}đ` : 'Phần quà VIP'}
                    </div>
                    <span className="text-[10px] text-slate-500">{item.openedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: RULES & DROP RATES */}
        {activeTab === 'rules' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-300">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg sm:text-xl font-black text-white">Quy Định &amp; Tỷ Lệ Trúng Thưởng</h2>
              <p className="text-slate-400 mt-1">Hệ thống thuật toán ngẫu nhiên công bằng, công khai 100%</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Star size={16} className="text-amber-400" /> 1. Cơ Chế Hoạt Động Của Túi Mù
                </h3>
                <p className="leading-relaxed">
                  Người chơi chọn một trong các hạng túi mù phù hợp với nhu cầu. Sau khi bấm xé, hệ thống sẽ sử dụng thuật toán ngẫu nhiên có trọng số (Weighted Probability) để mở ra 1 trong các phần thưởng: Tài khoản Liên Quân, Tiền mặt hoàn ví, Voucher giảm giá hoặc Lượt xé miễn phí.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400" /> 2. Cam Kết Bảo Hành Tài Khoản
                </h3>
                <p className="leading-relaxed">
                  Tất cả tài khoản trúng từ Túi Mù đều thuộc sở hữu vĩnh viễn của người chơi. Thông tin tài khoản được gửi tự động và lưu vào mục <strong>Túi Đồ Của Tôi</strong>. Người chơi có thể đăng nhập ngay và đổi mật khẩu an toàn.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Coins size={16} className="text-yellow-400" /> 3. Tiền Hoàn Ví &amp; Voucher
                </h3>
                <p className="leading-relaxed">
                  Nếu trúng tiền hoàn ví, tiền sẽ được cộng ngay lập tức vào số dư ví của tài khoản bạn. Bạn có thể sử dụng để mua tài khoản khác trên sàn hoặc rút về tài khoản ngân hàng bất kỳ lúc nào.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* UNBOX MODAL ARENA */}
      <UnboxModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        box={selectedBoxForModal}
        onOpenAnother={handleOpenAnother}
        isOpening={isOpeningBox}
        rewardResult={openedRewardResult}
        onGoToInventory={() => setActiveTab('inventory')}
        onGoToOrders={() => setCurrentView('orders')}
        userBalance={currentUser.balance}
        freeTurnsCount={selectedBoxForModal ? userFreeTurns[selectedBoxForModal.id] || 0 : 0}
      />
    </div>
  );
};
