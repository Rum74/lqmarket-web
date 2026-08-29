import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { RankTier, RareSkin, AccountItem } from '../../types';
import { RankBadge } from '../common/RankBadge';
import { compressImage } from '../../utils/imageCompressor';
import { getDynamicSellerInfo } from '../../utils/sellerHelper';
import { uploadImageToStorage } from '../../lib/storageService';
import {
  PlusCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Swords,
  Shirt,
  Lock,
  Clock,
  AlertCircle,
  Eye,
  Store,
  DollarSign,
  TrendingUp,
  Tag,
  Upload,
  Loader2,
  Trash2
} from 'lucide-react';

const PRESET_SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=800&q=80'
];

const POPULAR_RARE_SKINS = [
  { hero: 'Nakroth', name: 'Thứ Nguyên Vệ Thần', tier: 'SSS' as const },
  { hero: "Tel'Annas", name: 'Thần Sứ F.E.E-X1', tier: 'SSS' as const },
  { hero: 'Florentino', name: 'Tinh Hệ Hắc Ám', tier: 'SSS' as const },
  { hero: 'Florentino', name: 'Ultraman Bão Vũ', tier: 'Anime' as const },
  { hero: 'Raz', name: 'Muay Thái', tier: 'Tuyệt Sắc' as const },
  { hero: 'Tulen', name: 'Chí Tôn Kiếm Tiên', tier: 'SSS' as const },
  { hero: 'Lauriel', name: 'Thứ Nguyên Vệ Thần', tier: 'SSS' as const },
  { hero: 'Murad', name: 'Chí Tôn Thần Kiếm', tier: 'Tuyệt Sắc' as const },
  { hero: 'Capheny', name: 'Kimono Hạc Vũ', tier: 'Tuyệt Sắc' as const },
  { hero: 'Ngộ Không', name: 'Nhóc Tì Bá Đạo (Evo 5)', tier: 'Evo' as const },
  { hero: 'Valhein', name: 'Hoàng Tử Băng Giá', tier: 'Tuyệt Sắc' as const }
];

export const SellAccountView: React.FC = () => {
  const {
    currentUser,
    accounts,
    createAccount,
    setCurrentView,
    setSelectedAccountId,
    allUsers,
    orders,
    openLoginModal,
    openRegisterModal
  } = useApp();

  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [formSubmittedSuccess, setFormSubmittedSuccess] = useState(false);
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Seller Info
  const sellerInfo = getDynamicSellerInfo(currentUser.id, allUsers, orders);

  // Form State
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<number | ''>(500000);
  const [originalPrice, setOriginalPrice] = useState<number | ''>(650000);
  const [rank, setRank] = useState<RankTier>('Cao Thủ');
  const [level, setLevel] = useState<number>(30);
  const [heroesCount, setHeroesCount] = useState<number>(95);
  const [skinsCount, setSkinsCount] = useState<number>(140);
  const [runePages, setRunePages] = useState('90/90 Full Ngọc III (Công VL, Phép, Tank)');
  const [server, setServer] = useState('Việt Nam');
  const [badgeTag, setBadgeTag] = useState<'HOT' | 'VIP' | 'GIÁ RẺ' | 'SIÊU SKIN' | 'ACC TRẮNG TT' | 'CAO THỦ'>('HOT');
  const [selectedRareSkins, setSelectedRareSkins] = useState<RareSkin[]>([
    { hero: 'Nakroth', name: 'Thứ Nguyên Vệ Thần', tier: 'SSS' }
  ]);
  const [notableHeroesInput, setNotableHeroesInput] = useState('Nakroth, Raz, Florentino, Capheny');
  const [description, setDescription] = useState('Acc tâm huyết, thông tin trắng 100%, full ngọc chuẩn thi đấu.');
  const [selectedImages, setSelectedImages] = useState<string[]>([
    PRESET_SAMPLE_IMAGES[0],
    PRESET_SAMPLE_IMAGES[1]
  ]);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Credentials State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [securityType, setSecurityType] = useState<'Trắng Thông Tin' | 'SĐT Có Thể Đổi' | 'Email Đã Đổi' | 'Facebook Đã Huỷ'>('Trắng Thông Tin');
  const [secretNotes, setSecretNotes] = useState('Vào game đổi mật khẩu và cài số điện thoại mới.');

  // Agreement
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePolicy, setAgreePolicy] = useState(false);

  // Seller's accounts
  const myAccounts = accounts.filter(a => a.sellerId === currentUser.id);
  const pendingCount = myAccounts.filter(a => a.status === 'pending').length;
  const approvedCount = myAccounts.filter(a => a.status === 'approved').length;
  const soldCount = myAccounts.filter(a => a.status === 'sold').length;

  const toggleRareSkin = (skin: { hero: string; name: string; tier: any }) => {
    const exists = selectedRareSkins.some(s => s.hero === skin.hero && s.name === skin.name);
    if (exists) {
      setSelectedRareSkins(prev => prev.filter(s => !(s.hero === skin.hero && s.name === skin.name)));
    } else {
      setSelectedRareSkins(prev => [...prev, skin]);
    }
  };

  const handleAddCustomImage = () => {
    if (customImageUrl.trim() && !selectedImages.includes(customImageUrl.trim())) {
      setSelectedImages(prev => [...prev, customImageUrl.trim()]);
      setCustomImageUrl('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressingImage(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const res = await uploadImageToStorage(file, 'accounts');
          if (res.url) {
            setSelectedImages(prev => [...prev, res.url]);
          }
        }
      }
    } catch (err) {
      console.error('Error uploading screenshot:', err);
      alert('Không thể tải hình ảnh lên. Vui lòng thử lại với định dạng JPEG hoặc PNG.');
    } finally {
      setIsCompressingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (imgUrl: string) => {
    if (selectedImages.length <= 1) {
      alert('Vui lòng giữ lại ít nhất 1 hình ảnh mô tả cho tài khoản.');
      return;
    }
    setSelectedImages(prev => prev.filter(img => img !== imgUrl));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price || !username.trim() || !password.trim()) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc (*)!');
      return;
    }
    if (!agreeTerms || !agreePolicy) {
      alert('Vui lòng đồng ý với cam kết tính xác thực và chính sách giao dịch trung gian.');
      return;
    }

    const notableHeroes = notableHeroesInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    createAccount({
      title: title.trim(),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      rank,
      level,
      heroesCount,
      skinsCount,
      runePages,
      server,
      rareSkins: selectedRareSkins,
      notableHeroes: notableHeroes.length > 0 ? notableHeroes : ['Florentino', 'Nakroth', 'Raz'],
      badgeTag,
      images: selectedImages.length > 0 ? selectedImages : [PRESET_SAMPLE_IMAGES[0]],
      description: description.trim(),
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      sellerAvatar: currentUser.avatar,
      sellerRating: sellerInfo.reviewsCount > 0 ? Number(sellerInfo.averageRating) : undefined,
      sellerCompletedSales: sellerInfo.completedSales,
      sellerResponseTime: '2 phút',
      sellerVerified: currentUser.isVerifiedSeller,
      credentials: {
        username: username.trim(),
        password: password.trim(),
        securityType,
        secretNotes: secretNotes.trim()
      }
    });

    setFormSubmittedSuccess(true);
    setActiveTab('manage');
  };

  // Guest (Not Logged In) prompt
  if (!currentUser.id) {
    return (
      <div className="p-8 sm:p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-6 max-w-2xl mx-auto my-8 shadow-2xl">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <Store size={32} />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            <span>DÀNH CHO NGƯỜI BÁN & SHOP LIÊN QUÂN</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Đăng Bán Tài Khoản Liên Quân Mobile
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
            Vui lòng đăng nhập hoặc đăng ký tài khoản Người Bán (Shop) để bắt đầu đăng tin thanh lý nick Liên Quân với độ uy tín cao, tiền về ví ngay sau khi bàn giao.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 text-left space-y-2">
          <div className="font-bold text-amber-400">Quyền lợi Người Bán:</div>
          <ul className="space-y-1 text-slate-400 list-disc list-inside">
            <li>Đăng bán tài khoản không giới hạn số lượng</li>
            <li>Hệ thống nén và tải ảnh nhanh chóng, bảo mật cao</li>
            <li>Bàn giao mật khẩu tự động & rút tiền về ATM tức thì</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={openLoginModal}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            Đăng Nhập Ngay
          </button>
          <button
            onClick={() => openRegisterModal('seller')}
            className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Đăng Ký Tài Khoản Shop
          </button>
        </div>
      </div>
    );
  }

  // Buyer role restriction check
  if (currentUser.role === 'buyer') {
    return (
      <div className="p-8 sm:p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-6 max-w-2xl mx-auto my-8 shadow-2xl">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <Store size={32} />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            <span>DÀNH RIÊNG CHO NGƯỜI BÁN (SELLER)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Chức Năng Đăng Bán Chỉ Dành Cho Shop / Người Bán
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
            Tài khoản hiện tại của bạn là <strong className="text-cyan-400">Người Mua (Buyer)</strong>. Để đảm bảo uy tín và bảo mật theo quy trình Escrow, chỉ những tài khoản đăng ký vai trò Người Bán mới có thể đăng acc lên sàn.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 text-left space-y-2">
          <div className="font-bold text-amber-400">Quyền lợi khi đăng ký Người Bán (Shop):</div>
          <ul className="space-y-1 text-slate-400 list-disc list-inside">
            <li>Đăng bán không giới hạn số lượng tài khoản Liên Quân</li>
            <li>Tự động nhận tiền qua ví LQMarket Pay sau khi người mua xác nhận</li>
            <li>Được cấp huy hiệu Shop Uy Tín và hỗ trợ giải quyết tranh chấp 24/7</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => openRegisterModal('seller')}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Đăng Ký Tài Khoản Shop Mới
          </button>
          <button
            onClick={() => setCurrentView('accounts')}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Quay Lại Mua Acc
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-md mb-1">
            <Store size={13} />
            <span>KÊNH NGƯỜI BÁN (SELLER PORTAL)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            ĐĂNG BÁN TÀI KHOẢN LIÊN QUÂN
          </h1>
          <p className="text-xs text-slate-400">
            Tiếp cận hơn 8.500+ game thủ mua acc mỗi ngày. Nhận tiền an toàn qua bảo chứng trung gian.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            id="seller-tab-create"
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle size={14} />
            <span>Đăng Tin Mới</span>
          </button>

          <button
            id="seller-tab-manage"
            onClick={() => setActiveTab('manage')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'manage'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tag size={14} />
            <span>Tin Của Tôi ({myAccounts.length})</span>
            {pendingCount > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* SUCCESS NOTICE IF JUST CREATED */}
      {formSubmittedSuccess && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-start justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-start gap-2">
            <Clock size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 block mb-0.5">Đã Gửi Duyệt Tin Đăng Thành Công!</strong>
              Tin đăng bán tài khoản của bạn đang ở trạng thái <span className="underline font-bold">Chờ Admin Duyệt</span>. Admin sẽ kiểm tra hình ảnh và thông tin trong vòng 5 - 15 phút.
            </div>
          </div>
          <button
            onClick={() => setFormSubmittedSuccess(false)}
            className="text-amber-400 hover:text-white cursor-pointer font-bold"
          >
            Đóng
          </button>
        </div>
      )}

      {/* TAB 1: CREATE LISTING FORM */}
      {activeTab === 'create' ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Block 1: Basic Info */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center">1</span>
              <span>Thông Tin Cơ Bản Về Acc</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Tiêu đề bài đăng bán <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ví dụ: Acc Cao Thủ 35 Sao - Nakroth Thứ Nguyên + Tel Thần Sứ - Full 90 Ngọc III..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm rounded-xl p-3 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Giá bán mong muốn (VNĐ) <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="number"
                    required
                    min={10000}
                    step={10000}
                    value={price}
                    onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="VD: 500000"
                    className="w-full bg-slate-950 border border-slate-800 text-amber-400 font-bold text-sm rounded-xl p-3 focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Thực nhận: {price ? Math.round(Number(price) * 0.95).toLocaleString('vi-VN') : 0}đ (Đã trừ 5% phí sàn)
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Giá gốc niêm yết (nếu có giảm giá):
                  </label>
                  <input
                    type="number"
                    min={10000}
                    value={originalPrice}
                    onChange={e => setOriginalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="VD: 650000"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-400 text-sm rounded-xl p-3 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Hạng Rank hiện tại:
                  </label>
                  <select
                    value={rank}
                    onChange={e => setRank(e.target.value as RankTier)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm rounded-xl p-3 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Thách Đấu">Thách Đấu</option>
                    <option value="Chiến Thần">Chiến Thần</option>
                    <option value="Chiến Tướng">Chiến Tướng</option>
                    <option value="Cao Thủ">Cao Thủ</option>
                    <option value="Tinh Anh">Tinh Anh</option>
                    <option value="Kim Cương">Kim Cương</option>
                    <option value="Bạch Kim">Bạch Kim</option>
                    <option value="Vàng">Vàng</option>
                    <option value="Bạc">Bạc</option>
                    <option value="Đồng">Đồng</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Nhãn nổi bật (Badge):
                  </label>
                  <select
                    value={badgeTag}
                    onChange={e => setBadgeTag(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-amber-300 font-semibold text-xs sm:text-sm rounded-xl p-3 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="HOT">🔥 HOT</option>
                    <option value="VIP">👑 VIP</option>
                    <option value="SIÊU SKIN">✨ SIÊU SKIN</option>
                    <option value="GIÁ RẺ">🏷️ GIÁ RẺ</option>
                    <option value="ACC TRẮNG TT">🛡️ TRẮNG THÔNG TIN</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Block 2: In-game Specs & Rare Skins */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center">2</span>
              <span>Thông Số Tướng, Trang Phục & Bảng Ngọc</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Số lượng Tướng sở hữu (tối đa 118):
                </label>
                <input
                  type="number"
                  min={1}
                  max={118}
                  value={heroesCount}
                  onChange={e => setHeroesCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl p-3 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Số lượng Trang phục (Skin):
                </label>
                <input
                  type="number"
                  min={0}
                  max={600}
                  value={skinsCount}
                  onChange={e => setSkinsCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 text-purple-300 font-bold text-sm rounded-xl p-3 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Thông tin Bảng Ngọc:
                </label>
                <input
                  type="text"
                  value={runePages}
                  onChange={e => setRunePages(e.target.value)}
                  placeholder="VD: 90/90 Full Ngọc III..."
                  className="w-full bg-slate-950 border border-slate-800 text-cyan-300 text-xs rounded-xl p-3 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Quick Click Checklist for Famous Skins */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-300 block">
                Chọn nhanh các Trang Phục Hiếm (Skin đắt giá):
              </label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_RARE_SKINS.map((skin, idx) => {
                  const isSelected = selectedRareSkins.some(
                    s => s.hero === skin.hero && s.name === skin.name
                  );
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => toggleRareSkin(skin)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-xs'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span>{isSelected ? '✓' : '+'}</span>
                      <strong className="text-white">{skin.hero}</strong> {skin.name}
                      <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-400 font-mono">
                        {skin.tier}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Tướng nổi bật thông thạo S (phân cách bằng dấu phẩy):
              </label>
              <input
                type="text"
                value={notableHeroesInput}
                onChange={e => setNotableHeroesInput(e.target.value)}
                placeholder="VD: Nakroth, Raz, Florentino, Capheny, Tulen"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Mô tả chi tiết tài khoản:
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Mô tả thêm về lịch sử nick, tỉ lệ thắng, các phụ kiện, khung viền..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Block 3: Screenshots & Images */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center">3</span>
              <span>Hình Ảnh / Screenshot Tài Khoản (Tối thiểu 1 ảnh)</span>
            </h2>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={customImageUrl}
                  onChange={e => setCustomImageUrl(e.target.value)}
                  placeholder="Dán link ảnh screenshot (https://...)"
                  className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddCustomImage}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Thêm Link
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isCompressingImage}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20 disabled:opacity-50"
                  >
                    {isCompressingImage ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Đang Nén...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        <span>Tải Từ Máy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Selected Images Gallery */}
              {selectedImages.length > 0 && (
                <div>
                  <span className="text-[11px] text-slate-400 block mb-2 font-medium">
                    Ảnh đã chọn ({selectedImages.length} ảnh):
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {selectedImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative w-24 h-20 rounded-xl overflow-hidden border border-amber-500/60 shadow-md group"
                      >
                        <img src={img} alt={`selected-${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img)}
                          className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-md transition-colors cursor-pointer"
                          title="Xoá ảnh này"
                        >
                          <Trash2 size={12} />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded">
                            Ảnh bìa
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preset Sample Images Selection */}
              <div>
                <span className="text-[11px] text-slate-400 block mb-2">Hoặc chọn nhanh ảnh mẫu có sẵn:</span>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {PRESET_SAMPLE_IMAGES.map((img, idx) => {
                    const isSelected = selectedImages.includes(img);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (isSelected) {
                            if (selectedImages.length > 1) {
                              setSelectedImages(prev => prev.filter(i => i !== img));
                            }
                          } else {
                            setSelectedImages(prev => [...prev, img]);
                          }
                        }}
                        className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                          isSelected ? 'border-amber-500 scale-95 shadow-md shadow-amber-500/20' : 'border-slate-800 opacity-60'
                        }`}
                      >
                        <img src={img} alt="sample" className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-amber-500 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                            ✓
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Block 4: Secret Credentials (Encrypted & Escrow Delivery) */}
          <div className="bg-slate-900/90 border border-amber-500/40 rounded-3xl p-6 space-y-5 bg-gradient-to-b from-amber-500/5 to-transparent">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Lock size={16} />
                <span>Thông Tin Đăng Nhập Bí Mật (Bàn Giao Tự Động)</span>
              </h2>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                🔒 Mã hóa bảo mật
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <strong className="text-amber-400">Lưu ý bảo mật:</strong> Thông tin tài khoản & mật khẩu dưới đây sẽ được hệ thống mã hóa và CHỈ tự động bàn giao cho người mua khi họ thanh toán thành công qua ví Escrow.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Tài khoản Garena / Tên đăng nhập <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="VD: garena_pro_player99"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl p-3 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Mật khẩu đăng nhập <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="VD: PasswordGarenaVip123!"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl p-3 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Tình trạng bảo mật tài khoản:
                </label>
                <select
                  value={securityType}
                  onChange={e => setSecurityType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm rounded-xl p-3 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="Trắng Thông Tin">Garena Trắng Thông Tin 100%</option>
                  <option value="SĐT Có Thể Đổi">SĐT có thể đổi ngay sau khi mua</option>
                  <option value="Email Đã Đổi">Email đã hủy liên kết</option>
                  <option value="Facebook Đã Huỷ">Facebook đã gỡ liên kết</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Ghi chú hướng dẫn cho người mua:
                </label>
                <input
                  type="text"
                  value={secretNotes}
                  onChange={e => setSecretNotes(e.target.value)}
                  placeholder="VD: Vào account.garena.vn đổi mật khẩu ngay..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Block 5: Agreement & Submit */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="space-y-2">
              <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={e => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-950 border-slate-700 cursor-pointer"
                />
                <span>
                  Tôi cam kết mọi thông tin về rank, tướng, skin và tài khoản là <strong>hoàn toàn chính xác</strong> với thực tế trong game.
                </span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreePolicy}
                  onChange={e => setAgreePolicy(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-950 border-slate-700 cursor-pointer"
                />
                <span>
                  Tôi đồng ý với chính sách trung gian sàn LQMarket (Phí 5% khi giao dịch hoàn tất và bảo hiểm hoàn tiền nếu sai mật khẩu).
                </span>
              </label>
            </div>

            <button
              id="submit-sell-account-btn"
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:from-amber-400 hover:to-orange-300 text-slate-950 font-black rounded-2xl transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
            >
              <PlusCircle size={18} className="text-slate-950" />
              <span>ĐĂNG BÁN NGAY — GỬI ADMIN DUYỆT TIN</span>
            </button>
          </div>
        </form>
      ) : (
        /* TAB 2: SELLER LISTINGS MANAGER */
        <div className="space-y-6">
          {/* Metrics summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="text-xs text-slate-400">Tổng tin đã đăng</div>
              <div className="text-xl font-bold text-white mt-1">{myAccounts.length}</div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="text-xs text-amber-400">Đang chờ duyệt ⏳</div>
              <div className="text-xl font-bold text-amber-400 mt-1">{pendingCount}</div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="text-xs text-emerald-400">Đang hiển thị bán</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">{approvedCount}</div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="text-xs text-purple-400">Đã bán thành công</div>
              <div className="text-xl font-bold text-purple-400 mt-1">{soldCount}</div>
            </div>
          </div>

          {/* Listings List */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Danh sách tin đăng của bạn</h3>
              <button
                onClick={() => setActiveTab('create')}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle size={13} />
                <span>Thêm Tin Mới</span>
              </button>
            </div>

            {myAccounts.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs space-y-3">
                <Store size={32} className="mx-auto text-slate-600" />
                <p>Bạn chưa đăng bán tài khoản nào.</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                >
                  Đăng tin đầu tiên ngay
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {myAccounts.map(acc => (
                  <div
                    key={acc.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={acc.images[0]}
                        alt={acc.title}
                        className="w-16 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-amber-400">#{acc.code}</span>
                          <RankBadge rank={acc.rank} size="sm" />
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              acc.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : acc.status === 'pending'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : acc.status === 'sold'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {acc.status === 'approved'
                              ? 'Đang bán'
                              : acc.status === 'pending'
                              ? 'Chờ duyệt ⏳'
                              : acc.status === 'sold'
                              ? 'Đã bán'
                              : 'Bị từ chối'}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white mt-1 line-clamp-1">{acc.title}</h4>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {acc.heroesCount} Tướng • {acc.skinsCount} Skin • {acc.price.toLocaleString('vi-VN')}đ
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => setSelectedAccountId(acc.id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>Xem</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
