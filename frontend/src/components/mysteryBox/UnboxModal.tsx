import React, { useState, useEffect } from 'react';
import {
  MysteryBoxTierConfig,
  MysteryBoxRewardItem,
  AccountCredentials
} from '../../types';
import {
  PackageOpen,
  Sparkles,
  Trophy,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Coins,
  Ticket,
  Gamepad2,
  X,
  ExternalLink
} from 'lucide-react';

interface UnboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  box: MysteryBoxTierConfig | null;
  onOpenAnother: (boxId: string) => void;
  isOpening: boolean;
  rewardResult: MysteryBoxRewardItem | null;
  onGoToInventory: () => void;
  onGoToOrders: () => void;
  userBalance: number;
  freeTurnsCount: number;
}

export const UnboxModal: React.FC<UnboxModalProps> = ({
  isOpen,
  onClose,
  box,
  onOpenAnother,
  isOpening,
  rewardResult,
  onGoToInventory,
  onGoToOrders,
  userBalance,
  freeTurnsCount
}) => {
  const [animationStage, setAnimationStage] = useState<'shaking' | 'bursting' | 'revealed'>('shaking');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (isOpening) {
      setAnimationStage('shaking');
      const timer1 = setTimeout(() => setAnimationStage('bursting'), 1400);
      const timer2 = setTimeout(() => setAnimationStage('revealed'), 2200);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else if (rewardResult) {
      setAnimationStage('revealed');
    }
  }, [isOpening, rewardResult]);

  if (!isOpen || !box) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-amber-400 via-rose-500 to-purple-600 border-amber-400/80 shadow-amber-500/50';
      case 'epic':
        return 'from-yellow-400 to-amber-600 border-yellow-400/80 shadow-yellow-500/40';
      case 'rare':
        return 'from-purple-400 to-indigo-600 border-purple-400/80 shadow-purple-500/40';
      default:
        return 'from-cyan-400 to-blue-600 border-cyan-400/80 shadow-cyan-500/30';
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 uppercase tracking-wider animate-pulse">👑 SIÊU PHẨM SSS</span>;
      case 'epic':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-yellow-400 text-slate-950 uppercase tracking-wider">🌟 VIP BẬC CAO</span>;
      case 'rare':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500 text-white uppercase tracking-wider">💎 HIẾM</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500 text-slate-950 uppercase tracking-wider">✨ MAY MẮN</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      {/* Ambient Radial Lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 rounded-full blur-[100px] animate-pulse" />
      </div>

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden text-center z-10">
        {/* Close Button */}
        {!isOpening && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        )}

        {/* 1. OPENING / SUSPENSE STAGE */}
        {isOpening || animationStage !== 'revealed' ? (
          <div className="py-10 space-y-6 flex flex-col items-center justify-center">
            {/* Box Icon with shaking & glowing beam */}
            <div className="relative">
              <div className={`w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-gradient-to-br ${box.colorGradient} border-2 ${box.borderColor} p-6 flex flex-col items-center justify-center shadow-2xl ${
                animationStage === 'shaking' ? 'animate-bounce' : 'scale-110 rotate-6 transition-transform'
              }`}>
                <PackageOpen className="w-16 h-16 sm:w-20 sm:h-20 text-amber-300 animate-pulse" />
                <span className="text-xs font-black text-white mt-2 tracking-wider uppercase">{box.name}</span>
              </div>

              {/* Laser Particles Effect */}
              {animationStage === 'bursting' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 bg-amber-400/40 rounded-full blur-2xl animate-ping" />
                  <Sparkles className="w-16 h-16 text-yellow-300 animate-spin" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-amber-200 uppercase tracking-wide">
                {animationStage === 'shaking' ? 'Đang Xé Túi Mù...' : 'Tia Sáng Bùng Nổ...'}
              </h3>
              <p className="text-xs text-slate-400">Vận may đang tìm đến với bạn! Xin vui lòng chờ giây lát...</p>
            </div>
          </div>
        ) : (
          /* 2. REVEALED PRIZE STAGE */
          rewardResult && (
            <div className="space-y-5 animate-scaleUp">
              {/* Header Title */}
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">KẾT QUẢ MỞ TÚI</span>
                  <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  CHÚC MỪNG BẠN TRÚNG THƯỞNG!
                </h2>
              </div>

              {/* Rarity & Prize Card */}
              <div className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border-2 shadow-xl ${
                getRarityGlow(rewardResult.rarity)
              } space-y-3.5 text-left`}>
                <div className="flex items-center justify-between">
                  {getRarityBadge(rewardResult.rarity)}
                  <span className="text-[11px] font-bold text-slate-400">
                    Trị giá ước tính: <strong className="text-amber-400">{rewardResult.value.toLocaleString('vi-VN')}đ</strong>
                  </span>
                </div>

                {/* Reward Main Info */}
                <div className="flex items-start gap-3 pt-1">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                    {rewardResult.type === 'account' ? (
                      <Gamepad2 className="w-6 h-6 text-amber-400" />
                    ) : rewardResult.type === 'cash' ? (
                      <Coins className="w-6 h-6 text-emerald-400" />
                    ) : rewardResult.type === 'voucher' ? (
                      <Ticket className="w-6 h-6 text-cyan-400" />
                    ) : (
                      <RotateCcw className="w-6 h-6 text-purple-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm sm:text-base font-black text-white truncate">
                      {rewardResult.title}
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">
                      {rewardResult.subtitle || 'Phần thưởng độc quyền từ hệ thống Túi Mù May Mắn LQMarket.'}
                    </p>
                  </div>
                </div>

                {/* Specific details based on reward type */}
                {/* 1. If Account: Show Login Credentials */}
                {rewardResult.type === 'account' && rewardResult.accountData && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
                    <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-700/60 space-y-2 font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">Tài khoản:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-amber-300">{rewardResult.accountData.credentials.username}</span>
                          <button
                            onClick={() => copyToClipboard(rewardResult.accountData?.credentials.username || '', 'user')}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded cursor-pointer"
                            title="Sao chép tài khoản"
                          >
                            {copiedField === 'user' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">Mật khẩu:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-emerald-400">
                            {showPassword ? rewardResult.accountData.credentials.password : '••••••••••••'}
                          </span>
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded cursor-pointer"
                          >
                            {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(rewardResult.accountData?.credentials.password || '', 'pass')}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded cursor-pointer"
                            title="Sao chép mật khẩu"
                          >
                            {copiedField === 'pass' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800 text-slate-400">
                        <span>Bảo mật:</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <ShieldCheck size={12} /> {rewardResult.accountData.credentials.securityType}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-amber-400/90 italic">
                      * Tài khoản đã được tự động lưu vào mục <strong>Túi Đồ</strong> &amp; <strong>Đơn Hàng</strong> của bạn để xem lại bất cứ lúc nào.
                    </p>
                  </div>
                )}

                {/* 2. If Cash: Show Added Notice */}
                {rewardResult.type === 'cash' && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs space-y-1">
                    <div className="text-emerald-300 font-bold flex items-center gap-1.5">
                      <Coins size={14} className="text-emerald-400" />
                      <span>Đã cộng thành công vào ví!</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Số tiền trúng thưởng đã được cộng trực tiếp vào số dư ví của bạn. Bạn có thể dùng để xé tiếp túi mù hoặc rút về ngân hàng.
                    </p>
                  </div>
                )}

                {/* 3. If Voucher: Show Voucher Code & Copy */}
                {rewardResult.type === 'voucher' && (
                  <div className="p-3 bg-cyan-950/40 border border-cyan-800/60 rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-300 font-bold">Mã giảm giá của bạn:</span>
                      <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-cyan-800">
                        <span className="font-mono font-black text-cyan-400">{rewardResult.voucherCode}</span>
                        <button
                          onClick={() => copyToClipboard(rewardResult.voucherCode || '', 'voucher')}
                          className="p-1 hover:bg-slate-800 text-cyan-400 rounded cursor-pointer"
                        >
                          {copiedField === 'voucher' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Áp dụng giảm ngay {rewardResult.value.toLocaleString('vi-VN')}đ khi thanh toán đơn mua nick trên sàn.
                    </p>
                  </div>
                )}

                {/* 4. If Free Turn */}
                {rewardResult.type === 'free_turn' && (
                  <div className="p-3 bg-purple-950/40 border border-purple-800/60 rounded-xl text-xs space-y-1">
                    <div className="text-purple-300 font-bold flex items-center gap-1.5">
                      <RotateCcw size={14} className="text-purple-400" />
                      <span>Nhận 1 lượt mở miễn phí!</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Bạn có thể dùng lượt quay này để xé tiếp ngay mà không bị trừ tiền số dư ví!
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  id="unbox-again-btn"
                  onClick={() => onOpenAnother(box.id)}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:from-amber-400 hover:to-orange-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <RotateCcw size={16} />
                  <span>
                    {freeTurnsCount > 0
                      ? `Xé Tiếp (Miễn Phí còn ${freeTurnsCount})`
                      : `Xé Tiếp (${box.price.toLocaleString('vi-VN')}đ)`}
                  </span>
                </button>

                {rewardResult.type === 'account' ? (
                  <button
                    onClick={() => {
                      onClose();
                      onGoToOrders();
                    }}
                    className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Xem Đơn Hàng</span>
                    <ExternalLink size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onClose();
                      onGoToInventory();
                    }}
                    className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Xem Túi Đồ</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
