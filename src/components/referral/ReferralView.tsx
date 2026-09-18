import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Gift,
  Users,
  Share2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Clock,
  ArrowRight,
  Sparkles,
  Info,
  Coins,
  QrCode,
  Award,
  ChevronRight,
  Wallet,
  AlertCircle
} from 'lucide-react';

export const ReferralView: React.FC = () => {
  const {
    currentUser,
    isLoggedIn,
    openLoginModal,
    openRegisterModal,
    referralStats,
    referralHistory,
    referralSettings,
    userReferralCode,
    userReferralLink,
    fetchReferralData,
    claimReferralReward,
    setCurrentView
  } = useApp();

  const safeSettings = referralSettings || {
    enabled: true,
    rewardType: 'fixed_amount',
    referrerReward: 10000,
    referredUserReward: 10000,
    minOrderValue: 20000,
    description: 'Giới thiệu bạn bè nhận 10.000đ khi hoàn tất đơn hàng đầu tiên.'
  };

  const safeStats = referralStats || {
    totalInvited: 0,
    completedReferrals: 0,
    pendingReferrals: 0,
    totalEarned: 0
  };

  const historyList = Array.isArray(referralHistory) ? referralHistory : [];

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState<{ message: string; isError?: boolean } | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      fetchReferralData();
    }
  }, [isLoggedIn, fetchReferralData]);

  const handleCopyCode = () => {
    if (!userReferralCode) return;
    navigator.clipboard.writeText(userReferralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!userReferralLink) return;
    navigator.clipboard.writeText(userReferralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(userReferralLink || 'https://cholienquan.com');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
  };

  const handleClaim = async () => {
    setIsClaiming(true);
    setClaimStatus(null);
    try {
      const res = await claimReferralReward();
      setClaimStatus({ message: res.message, isError: !res.success });
    } catch (err: any) {
      setClaimStatus({ message: err.message || 'Lỗi khi nhận thưởng', isError: true });
    } finally {
      setIsClaiming(false);
    }
  };

  const formatCurrency = (val: number) => {
    return (val || 0).toLocaleString('vi-VN') + 'đ';
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-6">
      {/* Breadcrumb / Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <button
            onClick={() => setCurrentView('home')}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            Trang chủ
          </button>
          <ChevronRight size={14} className="text-slate-600" />
          <span className="text-amber-400 font-semibold">Chương trình Giới thiệu bạn bè (Referral)</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('guide')}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Info size={14} />
            <span>Quy định & Chính sách</span>
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/20 p-6 md:p-8">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Sparkles size={14} />
              <span>Chương Trình Giới Thiệu Nhận Thưởng Tiền Mặt</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
              Giới thiệu bạn bè – Cả hai cùng có quà!
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Mời bạn bè tham gia sàn <strong className="text-amber-400">LQMarket</strong>. Khi bạn bè đăng ký bằng mã của bạn và hoàn tất giao dịch mua acc đầu tiên từ{' '}
              <strong className="text-amber-400">{formatCurrency(safeSettings.minOrderValue)}</strong>, bạn nhận ngay{' '}
              <strong className="text-emerald-400">+{formatCurrency(safeSettings.referrerReward)}</strong> vào số dư ví rút tiền!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            {!isLoggedIn ? (
              <div className="flex gap-2">
                <button
                  onClick={openLoginModal}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Users size={15} />
                  <span>Đăng Nhập Lấy Mã</span>
                </button>
                <button
                  onClick={() => openRegisterModal('buyer')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 cursor-pointer"
                >
                  Đăng Ký
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
                  <Wallet size={20} />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Số dư ví của bạn</div>
                  <div className="text-sm font-bold text-emerald-400">
                    {formatCurrency(currentUser?.balance || 0)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share / Referral Code Box (if logged in) */}
      {isLoggedIn && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Referral Code & Link Box */}
          <div className="lg:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 md:p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Gift size={16} className="text-amber-400" />
                <span>Mã & Liên Kết Giới Thiệu Của Bạn</span>
              </h2>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Đang kích hoạt
              </span>
            </div>

            {/* Referral Code Display */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Mã giới thiệu (Mã Referral):</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 font-mono font-bold text-lg text-amber-400 tracking-wider">
                  {userReferralCode || 'Đang tạo mã...'}
                </div>
                <button
                  onClick={handleCopyCode}
                  className={`px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                    copiedCode
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/10'
                  }`}
                >
                  {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedCode ? 'Đã sao chép' : 'Sao chép mã'}</span>
                </button>
              </div>
            </div>

            {/* Referral Link Display */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Đường dẫn chia sẻ trực tiếp:</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 font-mono truncate select-all">
                  {userReferralLink}
                </div>
                <button
                  onClick={handleCopyLink}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                    copiedLink
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedLink ? 'Đã sao chép' : 'Copy link'}</span>
                </button>
              </div>
            </div>

            {/* Quick Share Actions */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 mr-2">Chia sẻ nhanh:</span>
              <button
                onClick={handleShareFacebook}
                className="px-3 py-1.5 rounded-lg bg-[#1877F2]/20 hover:bg-[#1877F2]/30 text-[#1877F2] border border-[#1877F2]/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Share2 size={13} />
                <span>Facebook</span>
              </button>
              <button
                onClick={() => setShowQrModal(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <QrCode size={13} />
                <span>Mã QR</span>
              </button>
            </div>
          </div>

          {/* User Status / Reward Claim Card */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 md:p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-200 mb-2">
                <Award size={16} className="text-amber-400" />
                <span>Trạng Thái Của Bạn</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {currentUser?.referredBy ? (
                  <>
                    Bạn được giới thiệu bởi thành viên: <strong className="text-amber-400 font-mono">{currentUser.referredBy}</strong>
                  </>
                ) : (
                  'Bạn chưa liên kết người giới thiệu nào.'
                )}
              </p>

              {currentUser?.referredBy && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Thưởng chào mừng:</span>
                    <span className={`font-semibold ${currentUser.referralRewardReceived ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {currentUser.referralRewardReceived ? 'Đã nhận thưởng' : 'Chưa nhận'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Giá trị thưởng:</span>
                    <span className="font-bold text-emerald-400">+{formatCurrency(safeSettings.referredUserReward)}</span>
                  </div>
                </div>
              )}
            </div>

            {currentUser?.referredBy && !currentUser?.referralRewardReceived && (
              <div className="space-y-2">
                <button
                  onClick={handleClaim}
                  disabled={isClaiming}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                >
                  <Coins size={14} />
                  <span>{isClaiming ? 'Đang kiểm tra điều kiện...' : 'Nhận Thưởng Chào Mừng'}</span>
                </button>
                {claimStatus && (
                  <p className={`text-[11px] text-center ${claimStatus.isError ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {claimStatus.message}
                  </p>
                )}
              </div>
            )}

            <div className="text-[11px] text-slate-500 leading-normal">
              * Tiền thưởng sau khi nhận được cộng thẳng vào số dư ví, dùng mua acc hoặc rút về tài khoản ngân hàng bất kỳ lúc nào.
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Tổng bạn bè đã mời</span>
            <Users size={16} className="text-amber-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-100 font-mono">
            {safeStats.totalInvited}
          </div>
          <div className="text-[10px] text-slate-500">Đã đăng ký tài khoản</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Đã hoàn tất đơn hàng</span>
            <ShieldCheck size={16} className="text-emerald-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-emerald-400 font-mono">
            {safeStats.completedReferrals}
          </div>
          <div className="text-[10px] text-slate-500">Đủ điều kiện nhận thưởng</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Đang chờ đơn hàng</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-amber-400 font-mono">
            {safeStats.pendingReferrals}
          </div>
          <div className="text-[10px] text-slate-500">Chờ mua acc đầu tiên</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Tổng hoa hồng đã nhận</span>
            <Coins size={16} className="text-amber-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-amber-400 font-mono">
            {formatCurrency(safeStats.totalEarned)}
          </div>
          <div className="text-[10px] text-slate-500">Cộng trực tiếp vào ví</div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 md:p-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <h2 className="text-lg md:text-xl font-bold text-slate-100">
            Cách thức tham gia cực kỳ đơn giản (3 bước)
          </h2>
          <p className="text-xs text-slate-400">
            Không giới hạn số lượt giới thiệu – Mời càng nhiều, nhận thưởng càng lớn!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 relative space-y-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-sm flex items-center justify-center">
              1
            </div>
            <h3 className="text-sm font-bold text-slate-200">Chia sẻ mã giới thiệu</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gửi mã hoặc đường dẫn giới thiệu cá nhân của bạn cho bạn bè, hội nhóm game thủ hoặc mạng xã hội.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 relative space-y-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-sm flex items-center justify-center">
              2
            </div>
            <h3 className="text-sm font-bold text-slate-200">Bạn bè mua acc đầu tiên</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Người được giới thiệu đăng ký tài khoản và hoàn tất đơn hàng mua acc Liên Quân từ {formatCurrency(safeSettings.minOrderValue)}.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 relative space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-sm flex items-center justify-center">
              3
            </div>
            <h3 className="text-sm font-bold text-slate-200">Nhận tiền thưởng tức thì</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hệ thống tự động cộng thưởng vào số dư ví của cả người giới thiệu và người được mời ngay khi đơn hàng hoàn tất.
            </p>
          </div>
        </div>
      </div>

      {/* Referral History Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-amber-400" />
            <h3 className="text-sm font-bold text-slate-200">Danh Sách Bạn Bè Đã Mời</h3>
          </div>
          <span className="text-xs text-slate-400">
            Tổng cộng: <strong className="text-slate-200">{historyList.length}</strong> người
          </span>
        </div>

        {historyList.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 text-slate-500 mx-auto flex items-center justify-center">
              <Users size={24} />
            </div>
            <p className="text-sm text-slate-300 font-medium">Bạn chưa mời ai tham gia</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Hãy sao chép link hoặc mã giới thiệu phía trên gửi cho bạn bè để bắt đầu nhận thưởng tiền mặt!
            </p>
            {isLoggedIn && (
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition-all shadow-md shadow-amber-500/10"
              >
                <Copy size={14} />
                <span>Sao Chép Link Mời Ngay</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Người dùng</th>
                  <th className="py-3 px-4">Thời gian tham gia</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Đơn hàng đầu</th>
                  <th className="py-3 px-4 text-right">Hoa hồng nhận</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {historyList.map((item) => {
                  const rewardAmt = (item as any).rewardAmount || (item as any).referrerReward || 0;
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200">
                          {item.referredUserName || item.referredUserId || 'Thành viên'}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {item.referredUserId}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-4">
                        {item.status === 'rewarded' || item.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium text-[11px]">
                            <Check size={12} />
                            <span>Đã trả thưởng</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-medium text-[11px]">
                            <Clock size={12} />
                            <span>Chờ đơn hàng</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {item.qualifyingOrderId ? (
                          <span className="font-mono text-slate-300">
                            {item.qualifyingOrderId} ({formatCurrency(item.orderAmount || 0)})
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">Chưa phát sinh</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-bold font-mono">
                        {rewardAmt > 0 ? (
                          <span className="text-emerald-400">+{formatCurrency(rewardAmt)}</span>
                        ) : (
                          <span className="text-slate-500">0đ</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rules & Terms Notice */}
      <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 font-semibold text-slate-300">
          <AlertCircle size={15} className="text-amber-400" />
          <span>Điều khoản & Quy định chống gian lận</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1 leading-relaxed">
          <li>Mỗi tài khoản, địa chỉ IP và thiết bị chỉ được nhận thưởng người mới 01 lần duy nhất.</li>
          <li>Nghiêm cấm hành vi tự tạo tài khoản phụ (self-referral) để trục lợi hoa hồng. Hệ thống phát hiện sẽ khóa tài khoản vĩnh viễn.</li>
          <li>Đơn hàng hợp lệ để tính thưởng là đơn hàng giao dịch acc Liên Quân hoàn tất qua hệ thống Escrow tự động của LQMarket.</li>
          <li>Mọi thắc mắc và khiếu nại vui lòng liên hệ Admin qua kênh hỗ trợ trực tuyến.</li>
        </ul>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 text-center">
            <h3 className="text-base font-bold text-slate-100">Mã QR Giới Thiệu Của Bạn</h3>
            <p className="text-xs text-slate-400">
              Quét mã QR bằng camera điện thoại hoặc Zalo để mở link đăng ký kèm mã giới thiệu của bạn.
            </p>
            <div className="bg-white p-4 rounded-xl inline-block mx-auto">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(userReferralLink)}`}
                alt="QR Code"
                className="w-48 h-48"
              />
            </div>
            <div className="font-mono text-xs text-amber-400 font-bold bg-slate-950 py-2 rounded-lg border border-slate-800">
              Mã: {userReferralCode}
            </div>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
