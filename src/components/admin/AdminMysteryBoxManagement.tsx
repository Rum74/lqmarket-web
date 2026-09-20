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
  EyeOff,
  Palette,
  Tag
} from 'lucide-react';

export const BOX_THEME_PRESETS = [
  {
    id: 'amber',
    label: 'Vàng Hoàng Gia (Gold / VIP)',
    colorGradient: 'from-amber-600/80 via-yellow-700/60 to-slate-950',
    borderColor: 'border-amber-500/60 hover:border-amber-400',
    iconBg: 'bg-amber-500/20 text-amber-300',
    color: 'from-amber-500 to-yellow-600',
    accentColor: '#F59E0B',
    previewBg: 'bg-amber-500'
  },
  {
    id: 'emerald',
    label: 'Xanh Lục Bảo (1k / 5k / Tiết kiệm)',
    colorGradient: 'from-emerald-600/80 via-teal-800/60 to-slate-950',
    borderColor: 'border-emerald-500/60 hover:border-emerald-400',
    iconBg: 'bg-emerald-500/20 text-emerald-300',
    color: 'from-emerald-500 to-teal-600',
    accentColor: '#10B981',
    previewBg: 'bg-emerald-500'
  },
  {
    id: 'cyan',
    label: 'Xanh Lam Pha Lê (Ice Cyan)',
    colorGradient: 'from-cyan-600/80 via-blue-800/60 to-slate-950',
    borderColor: 'border-cyan-500/60 hover:border-cyan-400',
    iconBg: 'bg-cyan-500/20 text-cyan-300',
    color: 'from-cyan-500 to-blue-600',
    accentColor: '#06B6D4',
    previewBg: 'bg-cyan-500'
  },
  {
    id: 'purple',
    label: 'Tím Huyền Ảo (Thần Tài / Thần Bí)',
    colorGradient: 'from-purple-600/80 via-indigo-800/60 to-slate-950',
    borderColor: 'border-purple-500/60 hover:border-purple-400',
    iconBg: 'bg-purple-500/20 text-purple-300',
    color: 'from-purple-500 to-indigo-600',
    accentColor: '#8B5CF6',
    previewBg: 'bg-purple-500'
  },
  {
    id: 'rose',
    label: 'Đỏ Hồng Ruby (Kim Cương / Siêu Cấp)',
    colorGradient: 'from-rose-600/80 via-red-800/60 to-slate-950',
    borderColor: 'border-rose-500/60 hover:border-rose-400',
    iconBg: 'bg-rose-500/20 text-rose-300',
    color: 'from-rose-500 to-red-600',
    accentColor: '#F43F5E',
    previewBg: 'bg-rose-500'
  },
  {
    id: 'orange',
    label: 'Cam Rực Lửa (Đồng / Chiến Binh)',
    colorGradient: 'from-orange-600/80 via-amber-800/60 to-slate-950',
    borderColor: 'border-orange-500/60 hover:border-orange-400',
    iconBg: 'bg-orange-500/20 text-orange-300',
    color: 'from-orange-500 to-amber-600',
    accentColor: '#F97316',
    previewBg: 'bg-orange-500'
  },
  {
    id: 'slate',
    label: 'Bạc Ánh Kim (Bạc / Titan)',
    colorGradient: 'from-slate-600/80 via-slate-800/60 to-slate-950',
    borderColor: 'border-slate-400/60 hover:border-slate-300',
    iconBg: 'bg-slate-400/20 text-slate-200',
    color: 'from-slate-400 to-slate-200',
    accentColor: '#94A3B8',
    previewBg: 'bg-slate-400'
  }
];

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
    adminCreateBoxTier,
    adminUpdateBoxTier,
    adminDeleteBoxTier,
    adminImportAccountToMysteryBox,
    adminResetMysteryBoxes
  } = useApp();

  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('all');
  const [msg, setMsg] = useState<string | null>(null);

  // Box Tier Creation & Management
  const [isCreateTierModalOpen, setIsCreateTierModalOpen] = useState(false);
  const [isSubmittingTier, setIsSubmittingTier] = useState(false);
  const [newTierName, setNewTierName] = useState('');
  const [newTierId, setNewTierId] = useState('');
  const [newTierPrice, setNewTierPrice] = useState<number>(10000);
  const [newTierOriginalPrice, setNewTierOriginalPrice] = useState<number | ''>(20000);
  const [newTierBadge, setNewTierBadge] = useState('HOT');
  const [newTierDescription, setNewTierDescription] = useState('Cơ hội nhận tài khoản VIP & quà ngẫu nhiên');
  const [newTierTagline, setNewTierTagline] = useState('100% mở là có quà');
  const [newTierStock, setNewTierStock] = useState<number>(500);
  const [newTierThemePreset, setNewTierThemePreset] = useState('amber');
  const [newTierIsActive, setNewTierIsActive] = useState(true);

  // Full Tier Edit Modal
  const [editingFullTier, setEditingFullTier] = useState<MysteryBoxTierConfig | null>(null);
  const [editTierName, setEditTierName] = useState('');
  const [editTierPrice, setEditTierPrice] = useState<number>(10000);
  const [editTierOriginalPrice, setEditTierOriginalPrice] = useState<number | ''>('');
  const [editTierBadge, setEditTierBadge] = useState('');
  const [editTierDescription, setEditTierDescription] = useState('');
  const [editTierTagline, setEditTierTagline] = useState('');
  const [editTierStock, setEditTierStock] = useState<number>(500);
  const [editTierThemePreset, setEditTierThemePreset] = useState('amber');
  const [editTierIsActive, setEditTierIsActive] = useState(true);

  // Tier Delete Confirmation Modal
  const [tierToDelete, setTierToDelete] = useState<MysteryBoxTierConfig | null>(null);
  const [isDeletingTier, setIsDeletingTier] = useState(false);

  // Custom Delete Modal state (Rewards)
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

  const generateTierIdFromName = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    return slug ? `box_${slug}` : `box_${Date.now()}`;
  };

  const handleOpenCreateTierModal = () => {
    setNewTierName('');
    setNewTierId('');
    setNewTierPrice(10000);
    setNewTierOriginalPrice(20000);
    setNewTierBadge('HOT');
    setNewTierDescription('Cơ hội nhận tài khoản VIP & quà ngẫu nhiên');
    setNewTierTagline('100% mở là có quà');
    setNewTierStock(500);
    setNewTierThemePreset('amber');
    setNewTierIsActive(true);
    setIsCreateTierModalOpen(true);
  };

  const handleCreateTierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTierName.trim()) {
      showNotification('Vui lòng nhập tên hạng Túi Mù!');
      return;
    }
    const finalId = (newTierId.trim() || generateTierIdFromName(newTierName)).trim();
    const existing = mysteryBoxes.find(b => b.id === finalId);
    if (existing) {
      showNotification(`Mã định danh "${finalId}" đã tồn tại. Vui lòng chọn mã khác!`);
      return;
    }

    const preset = BOX_THEME_PRESETS.find(p => p.id === newTierThemePreset) || BOX_THEME_PRESETS[0];

    setIsSubmittingTier(true);
    const res = await adminCreateBoxTier({
      id: finalId,
      name: newTierName.trim(),
      price: Number(newTierPrice),
      originalPrice: newTierOriginalPrice ? Number(newTierOriginalPrice) : undefined,
      badge: newTierBadge.trim() || undefined,
      description: newTierDescription.trim() || 'Túi mù may mắn',
      tagline: newTierTagline.trim() || undefined,
      jackpotPreview: newTierTagline.trim() || undefined,
      stockRemaining: Number(newTierStock),
      colorGradient: preset.colorGradient,
      borderColor: preset.borderColor,
      iconBg: preset.iconBg,
      color: preset.color,
      accentColor: preset.accentColor,
      isActive: newTierIsActive
    });
    setIsSubmittingTier(false);

    showNotification(res.message);
    if (res.success) {
      setIsCreateTierModalOpen(false);
    }
  };

  const handleOpenEditFullTier = (tier: MysteryBoxTierConfig) => {
    setEditingFullTier(tier);
    setEditTierName(tier.name);
    setEditTierPrice(tier.price);
    setEditTierOriginalPrice(tier.originalPrice || '');
    setEditTierBadge(tier.badge || '');
    setEditTierDescription(tier.description || '');
    setEditTierTagline(tier.tagline || tier.jackpotPreview || '');
    setEditTierStock(tier.stockRemaining);
    const matchedPreset = BOX_THEME_PRESETS.find(p => p.colorGradient === tier.colorGradient) || BOX_THEME_PRESETS[0];
    setEditTierThemePreset(matchedPreset.id);
    setEditTierIsActive(tier.isActive !== false);
  };

  const handleEditFullTierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFullTier) return;
    if (!editTierName.trim()) {
      showNotification('Vui lòng nhập tên Túi Mù!');
      return;
    }

    const preset = BOX_THEME_PRESETS.find(p => p.id === editTierThemePreset) || BOX_THEME_PRESETS[0];

    setIsSubmittingTier(true);
    const res = await adminUpdateBoxTier(editingFullTier.id, {
      name: editTierName.trim(),
      price: Number(editTierPrice),
      originalPrice: editTierOriginalPrice ? Number(editTierOriginalPrice) : undefined,
      badge: editTierBadge.trim() || undefined,
      description: editTierDescription.trim() || undefined,
      tagline: editTierTagline.trim() || undefined,
      jackpotPreview: editTierTagline.trim() || undefined,
      stockRemaining: Number(editTierStock),
      colorGradient: preset.colorGradient,
      borderColor: preset.borderColor,
      iconBg: preset.iconBg,
      color: preset.color,
      accentColor: preset.accentColor,
      isActive: editTierIsActive
    });
    setIsSubmittingTier(false);

    showNotification(res.message);
    if (res.success) {
      setEditingFullTier(null);
    }
  };

  const handleConfirmDeleteTier = async () => {
    if (!tierToDelete) return;
    setIsDeletingTier(true);
    const res = await adminDeleteBoxTier(tierToDelete.id);
    setIsDeletingTier(false);
    showNotification(res.message);
    if (res.success) {
      setTierToDelete(null);
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
            Quản Lý Các Hạng Túi Mù &amp; Kho Quà
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tạo mới không giới hạn túi mù, sửa giá mở/số lượng/màu sắc/mô tả, bật/tắt từng hạng và quản lý kho quà thưởng
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenCreateTierModal}
            className="py-2 px-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer flex items-center gap-1.5 transition-all shadow-emerald-950/40"
          >
            <Plus size={15} />
            <span>Tạo Túi Mù Mới</span>
          </button>

          <button
            onClick={handleResetTiers}
            disabled={isResettingTiers}
            className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 shadow cursor-pointer flex items-center gap-1.5 transition-all"
            title="Đồng bộ / Nạp lại danh mục mẫu vào Database"
          >
            <RefreshCw size={14} className={isResettingTiers ? 'animate-spin text-amber-400' : 'text-amber-400'} />
            <span>{isResettingTiers ? 'Đang nạp...' : 'Nạp Mẫu DB'}</span>
          </button>

          <button
            onClick={() => setImportModalOpen(true)}
            className="py-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center gap-1.5"
          >
            <Gamepad2 size={15} />
            <span>Nhập Acc từ Sàn</span>
          </button>

          <button
            onClick={() => setNewRewardModalOpen(true)}
            className="py-2 px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer flex items-center gap-1.5"
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. Danh Sách Các Hạng Túi Mù ({mysteryBoxes.length} Hạng Túi)
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
              Có thể tạo thêm / chỉnh sửa / xoá
            </span>
          </div>
          <button
            onClick={handleOpenCreateTierModal}
            className="self-start sm:self-auto py-1 px-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-bold text-xs rounded-lg border border-emerald-500/30 cursor-pointer flex items-center gap-1 transition-all"
          >
            <Plus size={13} />
            <span>Thêm Hạng Túi Mới</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mysteryBoxes.map(tier => {
            const isEditing = editingTierId === tier.id;
            const isTierActive = tier.isActive !== false;
            const hasDiscount = tier.originalPrice && tier.originalPrice > tier.price;
            const discountPercent = hasDiscount ? Math.round(((tier.originalPrice! - tier.price) / tier.originalPrice!) * 100) : 0;

            return (
              <div
                key={tier.id}
                className={`bg-slate-900 border ${tier.borderColor || 'border-slate-800'} rounded-2xl p-4 space-y-3 flex flex-col justify-between transition-all relative overflow-hidden shadow-lg ${
                  !isTierActive ? 'opacity-70 bg-slate-950/80 border-dashed border-slate-700' : ''
                }`}
              >
                {/* Status bar top */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white bg-gradient-to-r ${tier.colorGradient || 'from-amber-600 to-slate-950'}`}>
                      {tier.name}
                    </span>
                    {tier.badge && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black tracking-wider uppercase">
                        {tier.badge}
                      </span>
                    )}
                  </div>

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
                    <div className="space-y-1.5">
                      <div className="flex items-baseline justify-between flex-wrap gap-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-black text-white font-mono">
                            {tier.price.toLocaleString('vi-VN')}đ
                          </span>
                          {hasDiscount && (
                            <span className="text-[11px] font-mono text-slate-500 line-through">
                              {tier.originalPrice!.toLocaleString('vi-VN')}đ
                            </span>
                          )}
                        </div>
                        {hasDiscount && (
                          <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1 rounded">
                            -{discountPercent}%
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Kho: <strong className="text-slate-200">{tier.stockRemaining} túi</strong></span>
                        <span>Đã mở: <strong className="text-amber-400">{tier.totalOpened || 0}</strong></span>
                      </div>

                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {tier.description || 'Túi mù may mắn'}
                      </div>

                      {(tier.tagline || tier.jackpotPreview) && (
                        <div className="text-[10px] text-amber-300/90 font-medium flex items-center gap-1 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 line-clamp-1">
                          <Sparkles size={11} className="text-amber-400 shrink-0" />
                          <span>{tier.tagline || tier.jackpotPreview}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1.5">
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
                    <div className="flex items-center gap-1.5 w-full">
                      <button
                        onClick={() => handleOpenEditFullTier(tier)}
                        className="flex-1 py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors border border-amber-500/30"
                        title="Chỉnh sửa chi tiết: Tên, Giá, Giá gốc, Mô tả, Huy hiệu, Màu sắc..."
                      >
                        <Edit2 size={12} /> Sửa Chi Tiết
                      </button>

                      <button
                        onClick={() => handleStartEditTier(tier)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg cursor-pointer transition-colors border border-slate-700"
                        title="Sửa nhanh giá mở và số lượng"
                      >
                        <Zap size={13} />
                      </button>

                      <button
                        onClick={() => handleToggleTier(tier.id, isTierActive)}
                        className={`p-1.5 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 transition-colors ${
                          isTierActive
                            ? 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60'
                            : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60'
                        }`}
                        title={isTierActive ? 'Tắt bán hạng túi này' : 'Bật bán lại hạng túi này'}
                      >
                        <Power size={13} />
                      </button>

                      <button
                        onClick={() => setTierToDelete(tier)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg cursor-pointer transition-colors border border-rose-500/20"
                        title="Xóa hạng túi này"
                      >
                        <Trash2 size={13} />
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

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedTierFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap transition-colors ${
                selectedTierFilter === 'all'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Tất cả ({mysteryRewards.length})
            </button>
            {mysteryBoxes.map(b => {
              const count = mysteryRewards.filter(r => r.boxTierId === b.id).length;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedTierFilter(b.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap transition-colors ${
                    selectedTierFilter === b.id
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {b.name} ({count})
                </button>
              );
            })}
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
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditRewardModal(rew)}
                          className="p-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 rounded-lg transition-colors cursor-pointer"
                          title="Chỉnh sửa phần thưởng"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setRewardToDelete(rew)}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Xoá phần thưởng"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRewards.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      <p className="font-bold text-sm">Chưa có phần thưởng nào trong danh mục này.</p>
                      <button
                        onClick={handleResetTiers}
                        disabled={isResettingTiers}
                        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer"
                      >
                        <RefreshCw size={14} className={isResettingTiers ? 'animate-spin' : ''} />
                        <span>Nạp Data Seed Kho Quà Mặc Định Vào DB Ngay</span>
                      </button>
                    </td>
                  </tr>
                )}
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
                  {mysteryBoxes.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.price.toLocaleString('vi-VN')}đ)
                    </option>
                  ))}
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
                    {mysteryBoxes.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.price.toLocaleString('vi-VN')}đ)
                      </option>
                    ))}
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

      {/* MODAL 3: CREATE NEW BOX TIER */}
      {isCreateTierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <PackageOpen size={20} />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">Tạo Hạng Túi Mù Mới</h3>
                  <p className="text-xs text-slate-400">Thiết lập thông số, màu sắc và giá mở cho túi mù mới</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateTierModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTierSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">
                    Tên Hạng Túi <span className="text-rose-400">*</span>:
                  </label>
                  <input
                    type="text"
                    value={newTierName}
                    onChange={e => {
                      setNewTierName(e.target.value);
                      if (!newTierId) {
                        setNewTierId(generateTierIdFromName(e.target.value));
                      }
                    }}
                    placeholder="VD: Túi Học Sinh / Túi Siêu Cấp 5K"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">
                    Mã định danh (ID) <span className="text-slate-500 font-normal">(tự tạo slug)</span>:
                  </label>
                  <input
                    type="text"
                    value={newTierId}
                    onChange={e => setNewTierId(e.target.value)}
                    placeholder="VD: box_hoc_sinh"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-mono focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">
                    Giá mở túi (VNĐ) <span className="text-rose-400">*</span>:
                  </label>
                  <input
                    type="number"
                    value={newTierPrice}
                    onChange={e => setNewTierPrice(Number(e.target.value))}
                    min={1000}
                    step={1000}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">
                    Giá niêm yết gốc <span className="text-slate-500 font-normal">(để gạch ngang)</span>:
                  </label>
                  <input
                    type="number"
                    value={newTierOriginalPrice}
                    onChange={e => setNewTierOriginalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="20000"
                    step={1000}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Huy hiệu tag nổi bật:</label>
                  <input
                    type="text"
                    value={newTierBadge}
                    onChange={e => setNewTierBadge(e.target.value)}
                    placeholder="VD: HOT, MỚI, SALE 50%"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Số lượng túi trong kho:</label>
                  <input
                    type="number"
                    value={newTierStock}
                    onChange={e => setNewTierStock(Number(e.target.value))}
                    min={1}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Khẩu hiệu / Cam kết xé:</label>
                  <input
                    type="text"
                    value={newTierTagline}
                    onChange={e => setNewTierTagline(e.target.value)}
                    placeholder="100% mở là có quà, tỷ lệ trúng cao"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Mô tả chi tiết túi:</label>
                <textarea
                  value={newTierDescription}
                  onChange={e => setNewTierDescription(e.target.value)}
                  rows={2}
                  placeholder="Cơ hội trúng ngay tài khoản Liên Quân VIP & hoàn tiền mặt..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>

              {/* Theme Presets */}
              <div className="space-y-2">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Palette size={14} className="text-amber-400" />
                  <span>Chọn Tone Màu &amp; Giao Diện Thẻ Túi Mù:</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BOX_THEME_PRESETS.map(preset => {
                    const isSelected = newTierThemePreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setNewTierThemePreset(preset.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-400/20 text-white'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full ${preset.previewBg} shrink-0 shadow`} />
                        <span className="text-[11px] font-bold truncate">{preset.label.split('(')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Xem trước hiển thị:</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{newTierName || 'Tên Túi Mù'}</span>
                    {newTierBadge && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase">
                        {newTierBadge}
                      </span>
                    )}
                  </div>
                  <div className="font-mono font-black text-emerald-400 text-sm">
                    {newTierPrice ? Number(newTierPrice).toLocaleString('vi-VN') : 0}đ
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmittingTier}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus size={16} />
                  <span>{isSubmittingTier ? 'Đang tạo túi mù...' : 'Tạo Hạng Túi Mù Mới'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateTierModalOpen(false)}
                  disabled={isSubmittingTier}
                  className="py-3 px-5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer hover:bg-slate-700 transition-colors"
                >
                  Huỷ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT FULL TIER CONFIG */}
      {editingFullTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">Chỉnh Sửa Chi Tiết Hạng Túi Mù</h3>
                  <p className="text-xs text-slate-400">Mã định danh: <strong className="text-amber-400 font-mono">{editingFullTier.id}</strong></p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingFullTier(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditFullTierSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">
                    Tên Hạng Túi <span className="text-rose-400">*</span>:
                  </label>
                  <input
                    type="text"
                    value={editTierName}
                    onChange={e => setEditTierName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Huy hiệu tag nổi bật:</label>
                  <input
                    type="text"
                    value={editTierBadge}
                    onChange={e => setEditTierBadge(e.target.value)}
                    placeholder="VD: HOT, VIP, SALE 50%"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">
                    Giá mở túi (VNĐ) <span className="text-rose-400">*</span>:
                  </label>
                  <input
                    type="number"
                    value={editTierPrice}
                    onChange={e => setEditTierPrice(Number(e.target.value))}
                    min={1000}
                    step={1000}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">
                    Giá niêm yết gốc <span className="text-slate-500 font-normal">(để gạch ngang)</span>:
                  </label>
                  <input
                    type="number"
                    value={editTierOriginalPrice}
                    onChange={e => setEditTierOriginalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="VD: 50000"
                    step={1000}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Số lượng túi trong kho:</label>
                  <input
                    type="number"
                    value={editTierStock}
                    onChange={e => setEditTierStock(Number(e.target.value))}
                    min={0}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Khẩu hiệu / Cam kết xé:</label>
                <input
                  type="text"
                  value={editTierTagline}
                  onChange={e => setEditTierTagline(e.target.value)}
                  placeholder="100% mở là có quà, tỷ lệ trúng cao"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Mô tả chi tiết túi:</label>
                <textarea
                  value={editTierDescription}
                  onChange={e => setEditTierDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              {/* Theme Presets */}
              <div className="space-y-2">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Palette size={14} className="text-amber-400" />
                  <span>Tone Màu &amp; Giao Diện Thẻ:</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BOX_THEME_PRESETS.map(preset => {
                    const isSelected = editTierThemePreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setEditTierThemePreset(preset.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-400/20 text-white'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full ${preset.previewBg} shrink-0 shadow`} />
                        <span className="text-[11px] font-bold truncate">{preset.label.split('(')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <div>
                  <div className="font-bold text-white">Trạng thái bán túi:</div>
                  <div className="text-[11px] text-slate-400">Nếu tắt, người dùng sẽ không thấy và không mở được túi này</div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditTierIsActive(!editTierIsActive)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5 transition-all ${
                    editTierIsActive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}
                >
                  <Power size={14} />
                  <span>{editTierIsActive ? 'Đang Mở Bán' : 'Tạm Tắt'}</span>
                </button>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmittingTier}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <Save size={16} />
                  <span>{isSubmittingTier ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingFullTier(null)}
                  disabled={isSubmittingTier}
                  className="py-3 px-5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer hover:bg-slate-700 transition-colors"
                >
                  Huỷ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: DELETE TIER CONFIRMATION */}
      {tierToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="font-black text-white text-base">Xác Nhận Xoá Hạng Túi Mù</h3>
                <p className="text-xs text-slate-400">Bạn có chắc chắn muốn xoá hạng túi mù này không?</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
              <div className="text-slate-400">Hạng túi sẽ xoá:</div>
              <div className="font-black text-white text-sm flex items-center gap-2">
                <span>{tierToDelete.name}</span>
                <span className="font-mono text-xs text-amber-400">({tierToDelete.id})</span>
              </div>
              <div className="flex items-center gap-3 pt-1 text-slate-400">
                <span>Giá mở: <strong className="text-emerald-400">{tierToDelete.price.toLocaleString('vi-VN')}đ</strong></span>
                <span>Kho: <strong className="text-slate-300">{tierToDelete.stockRemaining}</strong></span>
              </div>
              <p className="text-[11px] text-rose-400/90 pt-1">
                Lưu ý: Các phần thưởng gắn liền với hạng túi này sẽ cần được gán lại sang túi khác nếu cần.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleConfirmDeleteTier}
                disabled={isDeletingTier}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>{isDeletingTier ? 'Đang xoá...' : 'Xác Nhận Xoá Túi'}</span>
              </button>
              <button
                type="button"
                onClick={() => setTierToDelete(null)}
                disabled={isDeletingTier}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Huỷ Bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: EDIT REWARD MODAL */}
      {editingReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="text-amber-400" size={18} />
                <h3 className="font-black text-white text-base">Chỉnh Sửa Phần Thưởng</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingReward(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRewardEdit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Hạng Túi Mù:</label>
                  <select
                    value={editTier}
                    onChange={e => setEditTier(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">Tất cả các túi</option>
                    {mysteryBoxes.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.price.toLocaleString('vi-VN')}đ)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Độ hiếm (Rarity):</label>
                  <select
                    value={editRarity}
                    onChange={e => setEditRarity(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500"
                  >
                    <option value="common">Thường (Common)</option>
                    <option value="rare">Hiếm (Rare)</option>
                    <option value="epic">Sử Thi (Epic)</option>
                    <option value="legendary">Huyền Thoại (Legendary)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">Tên hiển thị phần thưởng:</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">Mô tả phụ (tuỳ chọn):</label>
                <input
                  type="text"
                  value={editSubtitle}
                  onChange={e => setEditSubtitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Trị giá hiển thị (VNĐ):</label>
                  <input
                    type="number"
                    value={editValue}
                    onChange={e => setEditValue(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Trọng số may mắn (Drop Weight):</label>
                  <input
                    type="number"
                    value={editWeight}
                    onChange={e => setEditWeight(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              {editingReward.type === 'voucher' && (
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Mã Voucher:</label>
                  <input
                    type="text"
                    value={editVoucherCode}
                    onChange={e => setEditVoucherCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {editingReward.type === 'account' && (
                <div className="space-y-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="text-[11px] font-bold text-amber-400">Thông tin đăng nhập tài khoản:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block">Tài khoản:</label>
                      <input
                        type="text"
                        value={editAccUsername}
                        onChange={e => setEditAccUsername(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">Mật khẩu:</label>
                      <input
                        type="text"
                        value={editAccPassword}
                        onChange={e => setEditAccPassword(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={isSavingRewardEdit}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer transition-all flex items-center justify-center gap-1"
                >
                  <Save size={14} />
                  <span>{isSavingRewardEdit ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingReward(null)}
                  disabled={isSavingRewardEdit}
                  className="py-2.5 px-4 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer hover:bg-slate-700 transition-colors"
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
