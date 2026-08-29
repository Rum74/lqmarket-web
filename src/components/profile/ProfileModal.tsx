import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { compressAvatar } from '../../utils/imageCompressor';
import { changeUserPassword } from '../../lib/authService';
import {
  User,
  Shield,
  KeyRound,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  Building,
  Phone,
  Mail,
  Wallet,
  Sparkles,
  Save,
  Star,
  ShoppingBag,
  Lock,
  Eye,
  EyeOff,
  Calendar
} from 'lucide-react';

const PRESET_AVATARS = [
  { name: 'Florentino', url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop&q=80' },
  { name: 'Nakroth', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80' },
  { name: 'Raz', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80' },
  { name: 'Tulen', url: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=80' },
  { name: 'Murad', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80' },
  { name: 'Capheny', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' },
  { name: 'Violet', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80' },
  { name: 'Lauriel', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
];

const VIETNAM_BANKS = [
  'MB Bank (Quân Đội)',
  'Vietcombank',
  'Techcombank',
  'VPBank',
  'ACB (Á Châu)',
  'BIDV',
  'VietinBank',
  'TPBank',
  'Sacombank',
  'Agribank',
  'HDBank',
  'Ví Điện Tử MoMo',
  'Ví ZaloPay'
];

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUserProfile, orders, accounts } = useApp();

  const [activeTab, setActiveTab] = useState<'info' | 'avatar' | 'security' | 'banking'>('info');

  // Personal Info form
  const [name, setName] = useState(currentUser.name || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [bio, setBio] = useState(currentUser.bio || '');

  // Banking form
  const [bankName, setBankName] = useState(currentUser.bankName || VIETNAM_BANKS[0]);
  const [bankAccount, setBankAccount] = useState(currentUser.bankAccount || '');
  const [bankAccountName, setBankAccountName] = useState(currentUser.bankAccountName || currentUser.name || '');

  // Avatar form
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatar || '');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password change form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Toast / Status state
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when currentUser or modal open state updates
  useEffect(() => {
    if (isOpen && currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setBio(currentUser.bio || '');
      setBankName(currentUser.bankName || VIETNAM_BANKS[0]);
      setBankAccount(currentUser.bankAccount || '');
      setBankAccountName(currentUser.bankAccountName || currentUser.name || '');
      setAvatarPreview(currentUser.avatar || '');
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Stats calculation dynamically from real orders
  const myBuyOrders = orders.filter(o => o.buyerId === currentUser.id);
  const mySellOrders = orders.filter(o => o.sellerId === currentUser.id);
  const myCompletedSales = mySellOrders.filter(o => o.status === 'completed').length;
  const myListedAccounts = accounts.filter(a => a.sellerId === currentUser.id).length;

  const formatJoinDate = (dateStr?: string) => {
    if (!dateStr) return 'Mới tham gia';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return 'Mới tham gia';
    }
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  // Handle local image file upload with automatic client-side compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, JPEG)');
      return;
    }

    try {
      showToast('success', 'Đang tối ưu dung lượng ảnh đại diện...');
      const compressedDataUrl = await compressAvatar(file);
      setAvatarPreview(compressedDataUrl);
    } catch {
      showToast('error', 'Không thể xử lý hình ảnh này. Vui lòng thử ảnh khác');
    }
  };

  // Save personal info
  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'Họ tên không được để trống');
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile({
        name: name.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        avatar: avatarPreview
      });
      showToast('success', 'Cập nhật thông tin tài khoản thành công!');
    } catch {
      showToast('error', 'Có lỗi xảy ra khi lưu thông tin');
    } finally {
      setIsSaving(false);
    }
  };

  // Save banking info
  const handleSaveBanking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankAccount.trim()) {
      showToast('error', 'Vui lòng nhập số tài khoản ngân hàng');
      return;
    }
    if (!bankAccountName.trim()) {
      showToast('error', 'Vui lòng nhập tên chủ tài khoản ngân hàng');
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile({
        bankName,
        bankAccount: bankAccount.trim(),
        bankAccountName: bankAccountName.trim().toUpperCase()
      });
      showToast('success', 'Đã lưu thông tin tài khoản ngân hàng rút tiền thành công!');
    } catch {
      showToast('error', 'Không thể lưu thông tin ngân hàng');
    } finally {
      setIsSaving(false);
    }
  };

  // Save avatar
  const handleSaveAvatar = async () => {
    if (!avatarPreview) {
      showToast('error', 'Vui lòng chọn ảnh đại diện');
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile({ avatar: avatarPreview });
      showToast('success', 'Đã cập nhật ảnh đại diện mới thành công!');
    } catch {
      showToast('error', 'Không thể lưu avatar');
    } finally {
      setIsSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      showToast('error', 'Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('error', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setIsSaving(true);
    try {
      const res = await changeUserPassword(newPassword, currentPassword);
      if (res.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showToast('success', res.message);
      } else {
        showToast('error', res.message);
      }
    } catch {
      showToast('error', 'Không thể đổi mật khẩu. Vui lòng thử lại sau.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-500/50 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-emerald-500 border border-slate-950 text-slate-950">
                <CheckCircle2 size={10} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{currentUser.name}</h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {currentUser.role === 'admin' ? 'Quản Trị Viên' : currentUser.role === 'seller' ? 'Người Bán' : 'Người Mua'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-400 font-mono">
                <span>{currentUser.email}</span>
                <span className="flex items-center gap-1 text-slate-400 font-sans">
                  <Calendar size={11} className="text-amber-400" /> Tham gia: {formatJoinDate(currentUser.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 gap-2 overflow-x-auto text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'info'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User size={14} />
            <span>Thông Tin Cá Nhân</span>
          </button>

          <button
            onClick={() => setActiveTab('avatar')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'avatar'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera size={14} />
            <span>Đổi Avatar</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound size={14} />
            <span>Đổi Mật Khẩu</span>
          </button>

          <button
            onClick={() => setActiveTab('banking')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'banking'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard size={14} />
            <span>Tài Khoản Rút Tiền</span>
          </button>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Status Message Notification */}
          {statusMsg && (
            <div
              className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2.5 animate-in fade-in ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-red-500/15 border-red-500/40 text-red-300'
              }`}
            >
              {statusMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Quick Account Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Số Dư Khả Dụng</div>
              <div className="text-sm font-black text-emerald-400 mt-0.5">
                {(currentUser.balance || 0).toLocaleString('vi-VN')}đ
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Đang Tạm Giữ</div>
              <div className="text-sm font-black text-amber-400 mt-0.5">
                {(currentUser.pendingBalance || 0).toLocaleString('vi-VN')}đ
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Đã Mua</div>
              <div className="text-sm font-black text-cyan-400 mt-0.5">{myBuyOrders.length} đơn</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Đã Bán Thành Công</div>
              <div className="text-sm font-black text-purple-400 mt-0.5">
                {myCompletedSales} acc
              </div>
            </div>
          </div>

          {/* TAB 1: PERSONAL INFO */}
          {activeTab === 'info' && (
            <form onSubmit={handleSaveInfo} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <User size={13} className="text-amber-400" />
                  <span>Họ và Tên Hiển Thị:</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  placeholder="Nhập họ tên của bạn..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Mail size={13} className="text-cyan-400" />
                    <span>Email Đăng Nhập:</span>
                  </label>
                  <input
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800/80 rounded-xl text-xs text-slate-400 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-500 block">Email dùng để đăng nhập và bảo mật tài khoản</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Phone size={13} className="text-emerald-400" />
                    <span>Số Điện Thoại Liên Hệ (Zalo):</span>
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    placeholder="VD: 0987654321"
                  />
                  <span className="text-[10px] text-slate-500 block">Nhận thông báo khi có người đặt mua acc</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-purple-400" />
                  <span>Giới Thiệu Shop / Bio:</span>
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
                  placeholder="Giới thiệu về độ uy tín của bạn, giờ trực máy hỗ trợ, cam kết bảo hành..."
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save size={15} />
                <span>{isSaving ? 'Đang lưu vào database...' : 'Lưu Thay Đổi Thông Tin'}</span>
              </button>
            </form>
          )}

          {/* TAB 2: AVATAR CUSTOMIZATION */}
          {activeTab === 'avatar' && (
            <div className="space-y-6">
              {/* Current Preview */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-5">
                <div className="relative">
                  <img
                    src={avatarPreview || currentUser.avatar}
                    alt="Preview"
                    className="w-24 h-24 rounded-3xl object-cover border-4 border-amber-400 shadow-xl"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 p-2 bg-amber-500 text-slate-950 rounded-xl shadow-md hover:bg-amber-400 transition-colors cursor-pointer"
                    title="Tải ảnh lên từ thiết bị"
                  >
                    <Upload size={14} />
                  </button>
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <h4 className="text-xs font-bold text-white">Tải Lên Ảnh Đại Diện Tùy Chỉnh</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Hỗ trợ định dạng PNG, JPG, JPEG (tối đa 3MB). Bạn có thể chọn ảnh từ máy hoặc bấm vào các avatar tướng Liên Quân bên dưới.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Upload size={13} />
                    <span>Chọn File Từ Máy Tính / Điện Thoại</span>
                  </button>
                </div>
              </div>

              {/* Or enter custom URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Hoặc Dán Đường Dẫn Ảnh Trực Tuyến (URL):</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customAvatarUrl}
                    onChange={e => setCustomAvatarUrl(e.target.value)}
                    placeholder="https://example.com/my-avatar.jpg"
                    className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customAvatarUrl.trim()) {
                        setAvatarPreview(customAvatarUrl.trim());
                        setCustomAvatarUrl('');
                      }
                    }}
                    className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-700 cursor-pointer"
                  >
                    Áp Dụng
                  </button>
                </div>
              </div>

              {/* Preset Heroes Avatars */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-400" />
                  <span>Bộ Sưu Tập Avatar Tướng Liên Quân Hot:</span>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {PRESET_AVATARS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarPreview(item.url)}
                      className={`group relative rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                        avatarPreview === item.url
                          ? 'border-amber-400 scale-105 shadow-md shadow-amber-500/20'
                          : 'border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full aspect-square object-cover group-hover:scale-110 transition-transform"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[9px] text-center font-bold text-slate-300 py-0.5">
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveAvatar}
                disabled={isSaving}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save size={15} />
                <span>{isSaving ? 'Đang cập nhật database...' : 'Cập Nhật Avatar Này'}</span>
              </button>
            </div>
          )}

          {/* TAB 3: SECURITY & PASSWORD */}
          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
                <Shield size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Bảo mật tài khoản:</strong> Mật khẩu mới cần tối thiểu 6 ký tự. Hãy sử dụng mật khẩu mạnh để bảo vệ số dư và các tài khoản game của bạn.
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <KeyRound size={13} className="text-amber-400" />
                  <span>Mật Khẩu Mới:</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 pr-10 font-mono"
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  <span>Xác Nhận Mật Khẩu Mới:</span>
                </label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  placeholder="Nhập lại mật khẩu mới..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <KeyRound size={15} />
                <span>{isSaving ? 'Đang cập nhật mật khẩu...' : 'Xác Nhận Đổi Mật Khẩu'}</span>
              </button>
            </form>
          )}

          {/* TAB 4: BANKING & WITHDRAWAL */}
          {activeTab === 'banking' && (
            <form onSubmit={handleSaveBanking} className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs flex items-start gap-2.5">
                <CreditCard size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Thông tin rút tiền tự động:</strong> Khi bạn bán được tài khoản game và đơn hàng hoàn tất, tiền sẽ được chuyển tự động vào tài khoản ngân hàng dưới đây trong vòng 3 phút.
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Building size={13} className="text-amber-400" />
                  <span>Tên Ngân Hàng Hoặc Ví Điện Tử:</span>
                </label>
                <select
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {VIETNAM_BANKS.map((b, idx) => (
                    <option key={idx} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <CreditCard size={13} className="text-emerald-400" />
                    <span>Số Tài Khoản Ngân Hàng:</span>
                  </label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={e => setBankAccount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    placeholder="VD: 1029384756"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <User size={13} className="text-cyan-400" />
                    <span>Tên Chủ Tài Khoản (In Hoa Không Dấu):</span>
                  </label>
                  <input
                    type="text"
                    value={bankAccountName}
                    onChange={e => setBankAccountName(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono uppercase"
                    placeholder="VD: NGUYEN VAN A"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save size={15} />
                <span>{isSaving ? 'Đang lưu...' : 'Lưu Thông Tin Ngân Hàng Rút Tiền'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
