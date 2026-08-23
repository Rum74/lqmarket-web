import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MysteryBoxRewardItem,
  MysteryBoxTierConfig
} from '../../types';
import {
  PackageOpen,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Coins,
  Ticket,
  Gamepad2,
  RotateCcw,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Save,
  X,
  AlertTriangle,
  RefreshCw,
  Power,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff
} from 'lucide-react';

export const AdminMysteryBoxManagement: React.FC = () => {
  const {
    mysteryBoxes,
    mysteryRewards,
    mysteryHistory,
    accounts,
    isMysteryBoxEventActive,
    adminToggleMysteryBoxEvent,
    adminToggleTierActive,
    adminAddMysteryReward,
    adminUpdateMysteryReward,
    adminDeleteMysteryReward,
    adminUpdateBoxTier,
    adminImportAccountToMysteryBox,
    adminResetMysteryBoxes
  } = useApp();

  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('all');
  const [msg, setMsg] = useState<string | null>(null);

  // Custom Delete Modal state
  const [rewardToDelete, setRewardToDelete] = useState<MysteryBoxRewardItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResettingTiers, setIsResettingTiers] = useState(false);
  const [isTogglingMasterEvent, setIsTogglingMasterEvent] = useState(false);

  // Show/Hide password toggle in table
  const [showPasswordIds, setShowPasswordIds] = useState<Record<string, boolean>>({});

  // Import Account modal
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedAccIdForImport, setSelectedAccIdForImport] = useState<string>('');
  const [targetTierForImport, setTargetTierForImport] = useState<string>('box_diamond');

  // New Reward modal
  const [newRewardModalOpen, setNewRewardModalOpen] = useState(false);
  const [newRewardType, setNewRewardType] = useState<'account' | 'cash' | 'voucher' | 'free_turn'>('account');
  const [newRewardTier, setNewRewardTier] = useState<string>('box_bronze');
  const [newRewardTitle, setNewRewardTitle] = useState('');
  const [newRewardSubtitle, setNewRewardSubtitle] = useState('');
  const [newRewardValue, setNewRewardValue] = useState<number>(50000);
  const [newRewardRarity, setNewRewardRarity] = useState<'common' | 'rare' | 'epic' | 'legendary'>('rare');
  const [newRewardWeight, setNewRewardWeight] = useState<number>(15);
  const [newRewardVoucherCode, setNewRewardVoucherCode] = useState('');

  // Account specific inputs for New Reward
  const [newAccUsername, setNewAccUsername] = useState('');
  const [newAccPassword, setNewAccPassword] = useState('');
  const [newAccSecurityType, setNewAccSecurityType] = useState<'Trắng Thông Tin' | 'SĐT Có Thể Đổi' | 'Email Đã Đổi' | 'Facebook Đã Huỷ'>('Trắng Thông Tin');
  const [newAccRank, setNewAccRank] = useState<any>('Kim Cương');
  const [newAccHeroes, setNewAccHeroes] = useState<number>(45);
  const [newAccSkins, setNewAccSkins] = useState<number>(30);
  const [newAccRareSkin, setNewAccRareSkin] = useState('');
  const [newAccSecretNotes, setNewAccSecretNotes] = useState('');

  // Edit Reward Modal State
  const [editingReward, setEditingReward] = useState<MysteryBoxRewardItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editTier, setEditTier] = useState('box_bronze');
  const [editValue, setEditValue] = useState<number>(0);
  const [editRarity, setEditRarity] = useState<'common' | 'rare' | 'epic' | 'legendary'>('rare');
  const [editWeight, setEditWeight] = useState<number>(10);
  const [editVoucherCode, setEditVoucherCode] = useState('');
  // Edit Account credentials
  const [editAccUsername, setEditAccUsername] = useState('');
  const [editAccPassword, setEditAccPassword] = useState('');
  const [editAccSecurityType, setEditAccSecurityType] = useState<'Trắng Thông Tin' | 'SĐT Có Thể Đổi' | 'Email Đã Đổi' | 'Facebook Đã Huỷ'>('Trắng Thông Tin');
  const [editAccRank, setEditAccRank] = useState<any>('Kim Cương');
  const [editAccHeroes, setEditAccHeroes] = useState<number>(40);
  const [editAccSkins, setEditAccSkins] = useState<number>(30);
  const [editAccRareSkin, setEditAccRareSkin] = useState('');
  const [editAccSecretNotes, setEditAccSecretNotes] = useState('');
  const [isSavingRewardEdit, setIsSavingRewardEdit] = useState(false);

  // Editing Tier Price/Stock
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [tierPriceInput, setTierPriceInput] = useState<number>(0);
  const [tierStockInput, setTierStockInput] = useState<number>(0);

  const showNotification = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(null), 3500);
  };

  const togglePasswordVisibility = (rewardId: string) => {
    setShowPasswordIds(prev => ({ ...prev, [rewardId]: !prev[rewardId] }));
  };

  const handleToggleMasterEvent = async (targetActive: boolean) => {
    setIsTogglingMasterEvent(true);
    const res = await adminToggleMysteryBoxEvent(targetActive);
    setIsTogglingMasterEvent(false);
    showNotification(res.message);
  };

  const handleToggleTier = async (tierId: string, currentActive: boolean) => {
    const nextState = !currentActive;
    const res = await adminToggleTierActive(tierId, nextState);
    if (res.success) {
      showNotification(`Đã ${nextState ? 'BẬT' : 'TẮT'} hạng túi mù thành công!`);
    } else {
      showNotification(res.message);
    }
  };

  const handleStartEditTier = (tier: MysteryBoxTierConfig) => {
    setEditingTierId(tier.id);
    setTierPriceInput(tier.price);
    setTierStockInput(tier.stockRemaining);
  };

  const handleSaveTier = async (tierId: string) => {
    const res = await adminUpdateBoxTier(tierId, {
      price: Number(tierPriceInput),
      stockRemaining: Number(tierStockInput)
    });
    if (res.success) {
      showNotification('Đã cập nhật cấu hình Túi Mù thành công!');
      setEditingTierId(null);
    } else {
      showNotification(res.message);
    }
  };

  const handleImportAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccIdForImport) {
      alert('Vui lòng chọn 1 tài khoản từ sàn!');
      return;
    }
    const res = await adminImportAccountToMysteryBox(selectedAccIdForImport, targetTierForImport);
    showNotification(res.message);
    if (res.success) {
      setImportModalOpen(false);
      setSelectedAccIdForImport('');
    }
  };

  const handleOpenEditRewardModal = (rew: MysteryBoxRewardItem) => {
    setEditingReward(rew);
    setEditTitle(rew.title);
    setEditSubtitle(rew.subtitle || '');
    setEditTier(rew.boxTierId);
    setEditValue(rew.value);
    setEditRarity(rew.rarity);
    setEditWeight(rew.dropWeight || 10);
    setEditVoucherCode(rew.voucherCode || '');

    if (rew.accountData) {
      setEditAccUsername(rew.accountData.credentials?.username || '');
      setEditAccPassword(rew.accountData.credentials?.password || '');
      setEditAccSecurityType(rew.accountData.credentials?.securityType || 'Trắng Thông Tin');
      setEditAccRank(rew.accountData.rank || 'Kim Cương');
      setEditAccHeroes(rew.accountData.heroesCount || 40);
      setEditAccSkins(rew.accountData.skinsCount || 30);
      setEditAccRareSkin(rew.accountData.rareSkinName || '');
      setEditAccSecretNotes(rew.accountData.credentials?.secretNotes || '');
    } else {
      setEditAccUsername('');
      setEditAccPassword('');
      setEditAccSecurityType('Trắng Thông Tin');
      setEditAccRank('Kim Cương');
      setEditAccHeroes(40);
      setEditAccSkins(30);
      setEditAccRareSkin('');
      setEditAccSecretNotes('');
    }
  };

  const handleSaveRewardEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReward) return;

    setIsSavingRewardEdit(true);
    const updates: Partial<MysteryBoxRewardItem> = {
      title: editTitle.trim(),
      subtitle: editSubtitle.trim() || undefined,
      boxTierId: editTier,
      value: Number(editValue),
      rarity: editRarity,
      dropWeight: Number(editWeight),
      voucherCode: editingReward.type === 'voucher' ? editVoucherCode.trim() : undefined
    };

    if (editingReward.type === 'account') {
      updates.accountData = {
        rank: editAccRank,
        heroesCount: Number(editAccHeroes),
        skinsCount: Number(editAccSkins),
        rareSkinName: editAccRareSkin.trim() || undefined,
        description: editSubtitle.trim() || undefined,
        credentials: {
          username: editAccUsername.trim(),
          password: editAccPassword.trim(),
          securityType: editAccSecurityType,
          secretNotes: editAccSecretNotes.trim() || undefined
        }
      };
    }

    const res = await adminUpdateMysteryReward(editingReward.id, updates);
    setIsSavingRewardEdit(false);
    showNotification(res.message);
    if (res.success) {
      setEditingReward(null);
    }
  };

  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRewardTitle.trim()) {
      alert('Vui lòng nhập tên phần thưởng!');
      return;
    }

    const payload: Omit<MysteryBoxRewardItem, 'id'> = {
      boxTierId: newRewardTier,
      type: newRewardType,
      title: newRewardTitle.trim(),
      subtitle: newRewardSubtitle.trim() || undefined,
      value: Number(newRewardValue),
      rarity: newRewardRarity,
      dropWeight: Number(newRewardWeight),
      voucherCode: newRewardType === 'voucher' ? newRewardVoucherCode.trim() || `VOUCHER_${Date.now().toString().slice(-4)}` : undefined
    };

    if (newRewardType === 'account') {
      if (!newAccUsername.trim() || !newAccPassword.trim()) {
        alert('Vui lòng nhập đầy đủ Tài khoản và Mật khẩu thật để trao cho người trúng!');
        return;
      }
      payload.accountData = {
        rank: newAccRank,
        heroesCount: Number(newAccHeroes),
        skinsCount: Number(newAccSkins),
        rareSkinName: newAccRareSkin.trim() || undefined,
        description: newRewardSubtitle.trim() || undefined,
        credentials: {
          username: newAccUsername.trim(),
          password: newAccPassword.trim(),
          securityType: newAccSecurityType,
          secretNotes: newAccSecretNotes.trim() || undefined
        }
      };
    }

    const res = await adminAddMysteryReward(payload);
    showNotification(res.message);
    if (res.success) {
      setNewRewardModalOpen(false);
      setNewRewardTitle('');
      setNewRewardSubtitle('');
      setNewRewardValue(50000);
      setNewAccUsername('');
      setNewAccPassword('');
    }
  };

  const handleConfirmDelete = async () => {
    if (!rewardToDelete) return;
    setIsDeleting(true);
    const res = await adminDeleteMysteryReward(rewardToDelete.id);
    setIsDeleting(false);
    setRewardToDelete(null);
    showNotification(res.message);
  };

  const handleResetTiers = async () => {
    setIsResettingTiers(true);
    const res = await adminResetMysteryBoxes();
    setIsResettingTiers(false);
    showNotification(res.message);
  };

  const filteredRewards = mysteryRewards.filter(
    r => selectedTierFilter === 'all' || r.boxTierId === selectedTierFilter || r.boxTierId === 'all'
  );

  const availableMarketAccounts = accounts.filter(a => a.status === 'approved');

  return (
    <div className="space-y-6">
      {/* 0. MASTER PROGRAM TOGGLE BANNER */}
      <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-lg ${
        isMysteryBoxEventActive
          ? 'bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border-emerald-700/60 text-emerald-200'
          : 'bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-900 border-rose-700/60 text-rose-200'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shrink-0 shadow-inner ${
            isMysteryBoxEventActive
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
          }`}>
            <Power size={22} className={isMysteryBoxEventActive ? 'text-emerald-400' : 'text-rose-400'} />
          </div>
          <div>
            <div className="text-sm sm:text-base font-black text-white flex flex-wrap items-center gap-2">
              <span>Chương Trình Xé Túi Mù:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                isMysteryBoxEventActive
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-rose-500 text-white shadow-sm'
              }`}>
                {isMysteryBoxEventActive ? 'ĐANG BẬT (HOẠT ĐỘNG)' : 'ĐÃ TẮT (TẠM NGƯNG)'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              {isMysteryBoxEventActive
                ? 'Sự kiện xé túi mù đang mở trên toàn hệ thống. Người dùng có thể tham gia xé các hạng túi được BẬT bên dưới.'
                : 'Đã tạm đóng toàn bộ chương trình xé túi mù. Người dùng sẽ không thể mở bất kỳ hạng túi nào.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleToggleMasterEvent(!isMysteryBoxEventActive)}
          disabled={isTogglingMasterEvent}
          className={`w-full sm:w-auto px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0 ${
            isMysteryBoxEventActive
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-950/40'
          }`}
        >
          <Power size={16} className={isTogglingMasterEvent ? 'animate-spin' : ''} />
          <span>{isMysteryBoxEventActive ? 'TẮT CHƯƠNG TRÌNH' : 'BẬT CHƯƠNG TRÌNH'}</span>
        </button>
      </div>

      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <PackageOpen className="text-amber-400" />
            Quản Lý 4 Hạng Túi Mù & Kho Quà
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Bật/tắt từng hạng túi, sửa giá mở/số lượng, thêm voucher/tiền hoàn ví và chuyển nick từ sàn vào kho quà
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleResetTiers}
            disabled={isResettingTiers}
            className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 shadow cursor-pointer flex items-center gap-1.5 transition-all"
            title="Đảm bảo hiển thị đầy đủ 4 hạng Túi Mù mặc định & phần thưởng chuẩn"
          >
            <RefreshCw size={14} className={isResettingTiers ? 'animate-spin text-amber-400' : 'text-amber-400'} />
            <span>{isResettingTiers ? 'Đang khôi phục...' : 'Khôi Phục Đủ 4 Hạng Túi'}</span>
          </button>

          <button
            onClick={() => setImportModalOpen(true)}
            className="py-2 px-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center gap-1.5"
          >
            <Gamepad2 size={15} />
            <span>Nhập Acc từ Sàn Vào Túi Mù</span>
          </button>

          <button
            onClick={() => setNewRewardModalOpen(true)}
            className="py-2 px-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>Thêm Quà Mới</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3.5 bg-emerald-950/90 border border-emerald-700 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2 shadow">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* 1. BOX TIERS OVERVIEW & CONFIG */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            1. Danh Sách 4 Hạng Túi Mù (Có Thể Bật/Tắt Từng Hạng)
          </h3>
          <span className="text-[11px] text-slate-500">
            Gợi ý: Nhấn nút bật/tắt để tạm ngừng bán hạng túi mong muốn
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mysteryBoxes.map(tier => {
            const isEditing = editingTierId === tier.id;
            const isTierActive = tier.isActive !== false;

            return (
              <div
                key={tier.id}
                className={`bg-slate-900 border ${tier.borderColor} rounded-2xl p-4 space-y-3 flex flex-col justify-between transition-all relative overflow-hidden ${
                  !isTierActive ? 'opacity-70 bg-slate-950/80 border-dashed border-slate-700' : ''
                }`}
              >
                {/* Status bar top */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white bg-gradient-to-r ${tier.colorGradient}`}>
                    {tier.name}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggleTier(tier.id, isTierActive)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer flex items-center gap-1 transition-all ${
                      isTierActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
                    }`}
                    title={isTierActive ? 'Nhấn để tắt hạng túi này' : 'Nhấn để bật lại hạng túi này'}
                  >
                    <span className={`w-2 h-2 rounded-full ${isTierActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                    <span>{isTierActive ? 'Đang Bật' : 'Đã Tắt'}</span>
                  </button>
                </div>

                <div className="space-y-1">
                  {isEditing ? (
                    <div className="space-y-2 text-xs pt-1">
                      <div>
                        <label className="text-[10px] text-slate-400 block">Giá mở (VNĐ):</label>
                        <input
                          type="number"
                          value={tierPriceInput}
                          onChange={e => setTierPriceInput(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block">Số lượng túi còn:</label>
                        <input
                          type="number"
                          value={tierStockInput}
                          onChange={e => setTierStockInput(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-black text-white font-mono">
                          {tier.price.toLocaleString('vi-VN')}đ
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          Đã mở: <strong className="text-amber-400">{tier.totalOpened || 0}</strong>
                        </span>
                      </div>

                      <div className="text-xs text-slate-400">
                        Còn trong kho: <strong className="text-slate-200">{tier.stockRemaining} túi</strong>
                      </div>

                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {tier.description}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleSaveTier(tier.id)}
                        className="flex-1 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Save size={13} /> Lưu
                      </button>
                      <button
                        onClick={() => setEditingTierId(null)}
                        className="py-1.5 px-2 bg-slate-800 text-slate-300 text-xs rounded-lg cursor-pointer"
                      >
                        Huỷ
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 w-full">
                      <button
                        onClick={() => handleStartEditTier(tier)}
                        className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <Edit2 size={12} /> Sửa Giá &amp; Kho
                      </button>

                      <button
                        onClick={() => handleToggleTier(tier.id, isTierActive)}
                        className={`py-1.5 px-2.5 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 transition-colors ${
                          isTierActive
                            ? 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60'
                            : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60'
                        }`}
                        title={isTierActive ? 'Tắt bán hạng túi này' : 'Bật bán lại hạng túi này'}
                      >
                        <Power size={12} />
                        <span>{isTierActive ? 'Tắt' : 'Bật'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. REWARD POOL TABLE */}
      <div className="space-y-3 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            2. Kho Phần Thưởng Đang Có ({mysteryRewards.length} phần thưởng)
          </h3>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {['all', 'box_bronze', 'box_gold', 'box_diamond', 'box_special'].map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTierFilter(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap ${
                  selectedTierFilter === tab
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'all'
                  ? 'Tất cả'
                  : tab === 'box_bronze'
                  ? 'Túi Đồng'
                  : tab === 'box_gold'
                  ? 'Túi Vàng'
                  : tab === 'box_diamond'
                  ? 'Túi Kim Cương'
                  : 'Túi Thần Tài'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Loại Quà</th>
                  <th className="py-3 px-4">Tên Phần Thưởng</th>
                  <th className="py-3 px-4">Hạng Túi</th>
                  <th className="py-3 px-4">Trị Giá</th>
                  <th className="py-3 px-4">Độ Hiếm / Tỷ Trọng</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredRewards.map(rew => (
                  <tr key={rew.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-bold">
                        {rew.type === 'account' ? (
                          <span className="text-amber-400 flex items-center gap-1"><Gamepad2 size={14} /> Acc Game</span>
                        ) : rew.type === 'cash' ? (
                          <span className="text-emerald-400 flex items-center gap-1"><Coins size={14} /> Tiền Mặt</span>
                        ) : rew.type === 'voucher' ? (
                          <span className="text-cyan-400 flex items-center gap-1"><Ticket size={14} /> Voucher</span>
                        ) : (
                          <span className="text-purple-400 flex items-center gap-1"><RotateCcw size={14} /> Lượt Quay</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-white max-w-xs truncate">
                      {rew.title}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-slate-950 rounded text-[10px] font-bold text-slate-300 border border-slate-800">
                        {rew.boxTierId}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {rew.value.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-bold uppercase text-slate-400">
                        {rew.rarity} (Trọng số: {rew.dropWeight})
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setRewardToDelete(rew)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Xoá phần thưởng"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL 0: CUSTOM DELETE CONFIRMATION MODAL */}
      {rewardToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="font-black text-white text-base">Xác Nhận Xoá Phần Thưởng</h3>
                <p className="text-xs text-slate-400">Hành động này sẽ loại bỏ quà khỏi kho Túi Mù.</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
              <div className="text-slate-400">Tên phần thưởng:</div>
              <div className="font-bold text-white text-sm">{rewardToDelete.title}</div>
              <div className="flex items-center gap-3 pt-1 text-slate-400">
                <span>Hạng túi: <strong className="text-amber-400">{rewardToDelete.boxTierId}</strong></span>
                <span>Trị giá: <strong className="text-emerald-400">{rewardToDelete.value.toLocaleString('vi-VN')}đ</strong></span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>{isDeleting ? 'Đang xoá...' : 'Xác Nhận Xoá'}</span>
              </button>
              <button
                type="button"
                onClick={() => setRewardToDelete(null)}
                disabled={isDeleting}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Huỷ Bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: IMPORT ACCOUNT FROM MARKETPLACE */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <Gamepad2 className="text-purple-400" />
                Nhập Tài Khoản Từ Sàn Vào Kho Quà Túi Mù
              </h3>
              <button onClick={() => setImportModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleImportAccount} className="space-y-4 text-xs">
              <p className="text-slate-300">
                Hệ thống sẽ lấy tài khoản đang bán trên sàn chuyển thành phần thưởng bí ẩn của Túi Mù. Khi người chơi xé trúng, tài khoản và mật khẩu sẽ tự động trao thưởng trực tiếp.
              </p>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">Chọn tài khoản trên sàn:</label>
                <select
                  value={selectedAccIdForImport}
                  onChange={e => setSelectedAccIdForImport(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-purple-500"
                  required
                >
                  <option value="">-- Chọn tài khoản ({availableMarketAccounts.length} acc có sẵn) --</option>
                  {availableMarketAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      #{acc.code} - {acc.rank} ({acc.heroesCount}T/{acc.skinsCount}S) - {acc.price.toLocaleString('vi-VN')}đ
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">Chuyển vào Hạng Túi Mù:</label>
                <select
                  value={targetTierForImport}
                  onChange={e => setTargetTierForImport(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-purple-500"
                >
                  <option value="box_bronze">Túi Đồng (20.000đ)</option>
                  <option value="box_gold">Túi Vàng (50.000đ)</option>
                  <option value="box_diamond">Túi Kim Cương (100.000đ)</option>
                  <option value="box_special">Túi Thần Tài VIP (200.000đ)</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow cursor-pointer"
                >
                  Xác Nhận Nhập Vào Túi Mù
                </button>
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="py-2.5 px-4 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Huỷ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW REWARD */}
      {newRewardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <Plus className="text-amber-400" />
                Thêm Phần Thưởng Mới Vào Túi Mù
              </h3>
              <button onClick={() => setNewRewardModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateReward} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Loại phần thưởng:</label>
                  <select
                    value={newRewardType}
                    onChange={e => setNewRewardType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                  >
                    <option value="cash">Tiền mặt hoàn ví</option>
                    <option value="voucher">Voucher giảm giá</option>
                    <option value="free_turn">Lượt quay miễn phí</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Áp dụng cho Hạng Túi:</label>
                  <select
                    value={newRewardTier}
                    onChange={e => setNewRewardTier(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                  >
                    <option value="all">Tất cả các túi (All Tiers)</option>
                    <option value="box_bronze">Túi Đồng (20k)</option>
                    <option value="box_gold">Túi Vàng (50k)</option>
                    <option value="box_diamond">Túi Kim Cương (100k)</option>
                    <option value="box_special">Túi Thần Tài (200k)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">Tên hiển thị phần thưởng:</label>
                <input
                  type="text"
                  value={newRewardTitle}
                  onChange={e => setNewRewardTitle(e.target.value)}
                  placeholder="Ví dụ: Hoàn tiền mặt 50.000đ vào ví"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Giá trị (VNĐ):</label>
                  <input
                    type="number"
                    value={newRewardValue}
                    onChange={e => setNewRewardValue(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Trọng số may mắn (Drop Weight):</label>
                  <input
                    type="number"
                    value={newRewardWeight}
                    onChange={e => setNewRewardWeight(Number(e.target.value))}
                    placeholder="20 (càng cao càng dễ trúng)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              {newRewardType === 'voucher' && (
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Mã Voucher (tuỳ chọn):</label>
                  <input
                    type="text"
                    value={newRewardVoucherCode}
                    onChange={e => setNewRewardVoucherCode(e.target.value)}
                    placeholder="VD: TUIMU50K"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase"
                  />
                </div>
              )}

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer"
                >
                  Thêm Phần Thưởng
                </button>
                <button
                  type="button"
                  onClick={() => setNewRewardModalOpen(false)}
                  className="py-2.5 px-4 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Huỷ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
