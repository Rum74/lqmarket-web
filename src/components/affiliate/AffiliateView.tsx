import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import confetti from '../../utils/confetti';
import {
  Share2,
  Copy,
  Check,
  Users,
  DollarSign,
  TrendingUp,
  Gift,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Award,
  Wallet,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const AffiliateView: React.FC = () => {
  const { currentUser, affiliateStats, isLoggedIn, openLoginModal, openRegisterModal } = useApp();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const refCode = currentUser.username || currentUser.name.replace(/\s+/g, '').toUpperCase() || 'LQVIP88';
  const refLink = `${window.location.origin}/?ref=${encodeURIComponent(refCode)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(refLink);
    setCopiedLink(true);
    confetti({ particleCount: 30, spread: 60 });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(refCode);
    setCopiedCode(true);
    confetti({ particleCount: 20, spread: 50 });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!isLoggedIn) {
    return (
      <div className="p-8 sm:p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-6 max-w-2xl mx-auto my-8 shadow-2xl">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <Share2 size={32} />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            <span>KIẾM TIỀN TIẾP THỊ LIÊN KẾT (AFFILIATE)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Đăng Nhập Để Lấy Link Giới Thiệu
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
            Chia sẻ link giới thiệu tới bạn bè hoặc cộng đồng. Nhận ngay hoa hồng lên tới 20.000đ và 3% giá trị đơn hàng mỗi khi bạn bè mua nick thành công!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={openLoginModal}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            Đăng Nhập Ngay
          </button>
          <button
            onClick={() => openRegisterModal('buyer')}
            className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Đăng Ký Tài Khoản Mới
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            <Gift size={13} />
            <span>CHƯƠNG TRÌNH ĐỐI TÁC TIẾP THỊ LIÊN KẾT (AFFILIATE PARTNER)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            Giới Thiệu Bạn Bè - <span className="text-amber-400">Cùng Nhận 20.000đ</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Mỗi khi bạn bè đăng ký qua link của bạn và hoàn tất giao dịch mua acc đầu tiên:
            <br />
            <strong className="text-emerald-400">✓ Bạn nhận 20.000đ tiền mặt cộng thẳng vào Ví</strong>
            <br />
            <strong className="text-amber-400">✓ Bạn bè nhận Voucher giảm giá 20.000đ tân thủ</strong>
          </p>

          {/* Ref Link and Code box */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
            <div className="md:col-span-8 flex items-center gap-2 p-2 rounded-2xl bg-slate-950/80 border border-slate-700">
              <input
                type="text"
                readOnly
                value={refLink}
                className="w-full px-3 py-2 bg-transparent text-xs font-mono text-slate-200 focus:outline-none truncate"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-md"
              >
                {copiedLink ? <Check size={14} className="text-slate-950" /> : <Copy size={14} />}
                <span>{copiedLink ? 'Đã Chép' : 'Sao Chép Link'}</span>
              </button>
            </div>

            <div className="md:col-span-4 flex items-center justify-between p-3 rounded-2xl bg-slate-950/80 border border-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">MÃ GIỚI THIỆU:</span>
                <span className="text-sm font-mono font-black text-amber-400">{refCode}</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Sao chép mã"
              >
                {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Dashboard Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <TrendingUp size={13} className="text-cyan-400" />
            <span>Lượt Click Link</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-white">
            {affiliateStats?.totalClicks || 1248}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Users size={13} className="text-purple-400" />
            <span>Người Đăng Ký</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-white">
            {affiliateStats?.totalSignups || 87}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Award size={13} className="text-amber-400" />
            <span>Đơn Hàng Mua</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-amber-400">
            {affiliateStats?.totalOrders || 21}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <DollarSign size={13} className="text-emerald-400" />
            <span>Tổng Hoa Hồng</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-400">
            {(affiliateStats?.totalCommission || 1250000).toLocaleString('vi-VN')}đ
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Check size={13} className="text-emerald-400" />
            <span>Đã Rút Về Ví</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-300">
            {(affiliateStats?.paidCommission || 850000).toLocaleString('vi-VN')}đ
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Sparkles size={13} className="text-orange-400" />
            <span>Chờ Quyết Toán</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-orange-400">
            {(affiliateStats?.pendingCommission || 400000).toLocaleString('vi-VN')}đ
          </div>
        </div>
      </div>

      {/* Rules & Anti-Fraud Policy */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-400" />
          <span>Chính Sách & Cơ Chế Chống Gian Lận (Anti-Fraud)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <strong className="text-amber-400 block font-bold">1. Điều Kiện Tính Thưởng:</strong>
            <p className="text-slate-400 leading-relaxed">
              Hoa hồng và phần thưởng 20.000đ được giải ngân tự động ngay khi người được giới thiệu hoàn tất đơn hàng mua tài khoản đầu tiên và bấm xác nhận nhận acc.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <strong className="text-amber-400 block font-bold">2. Chống Tự Giới Thiệu (Self-Ref):</strong>
            <p className="text-slate-400 leading-relaxed">
              Hệ thống tự động phát hiện và loại bỏ các giao dịch trùng địa chỉ IP, trùng thiết bị, hoặc tài khoản ngân hàng rút tiền trùng lặp để bảo vệ quỹ đối tác.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <strong className="text-amber-400 block font-bold">3. Rút Tiền Hoa Hồng:</strong>
            <p className="text-slate-400 leading-relaxed">
              Số dư hoa hồng được cộng trực tiếp vào số dư khả dụng trong ví LQMarket. Bạn có thể sử dụng để mua acc khác hoặc rút về tài khoản ngân hàng bất kỳ lúc nào.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
