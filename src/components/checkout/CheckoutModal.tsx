import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RankBadge } from '../common/RankBadge';
import confetti from '../../utils/confetti';
import {
  ShieldCheck,
  X,
  Lock,
  Wallet,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  Zap,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Clock,
  Sparkles,
  Swords,
  Shirt,
  Info
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    checkoutAccountId,
    setCheckoutAccountId,
    accounts,
    currentUser,
    isLoggedIn,
    openLoginModal,
    createOrder,
    setIsWalletOpen,
    setCurrentView,
    orders
  } = useApp();

  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

  const [copiedUser, setCopiedUser] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  if (!isCheckoutOpen || !checkoutAccountId) return null;

  const account = accounts.find(a => a.id === checkoutAccountId);
  if (!account) return null;

  const completedOrder = completedOrderId ? orders.find(o => o.id === completedOrderId) : null;
  const isBalanceSufficient = currentUser.balance >= account.price;
  const deficitAmount = Math.max(0, account.price - currentUser.balance);

  const handleClose = () => {
    setIsCheckoutOpen(false);
    if (typeof setCheckoutAccountId === 'function') {
      setCheckoutAccountId(null);
    }
    setCompletedOrderId(null);
    setErrorMessage('');
    setIsProcessing(false);
  };

  const handleConfirmPurchase = () => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Vui lòng tích chọn đồng ý điều khoản giao dịch trung gian an toàn.');
      return;
    }

    if (!isBalanceSufficient) {
      setErrorMessage('Số dư ví của bạn không đủ. Vui lòng nạp thêm tiền để thanh toán.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    setTimeout(() => {
      const result = createOrder(account.id);
      setIsProcessing(false);

      if (result.success && result.orderId) {
        setCompletedOrderId(result.orderId);
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore if confetti fails
        }
      } else {
        setErrorMessage(result.message || 'Giao dịch không thành công. Vui lòng thử lại!');
      }
    }, 600);
  };

  const handleCopy = (text: string, type: 'user' | 'pass') => {
    navigator.clipboard.writeText(text);
    if (type === 'user') {
      setCopiedUser(true);
      setTimeout(() => setCopiedUser(false), 2000);
    } else {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-0 text-left my-6">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-1.5">
                {completedOrder ? 'MUA ACC THÀNH CÔNG' : 'XÁC NHẬN THANH TOÁN MUA ACC'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Giao Dịch Trung Gian Escrow • Bàn Giao Tự Động 100%
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {completedOrder ? (
            /* SUCCESS DELIVERED STATE */
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 size={32} />
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-black text-white">
                  Thanh Toán & Nhận Tài Khoản Thành Công!
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Mã đơn hàng: <strong className="text-amber-400 font-mono">{completedOrder.orderCode}</strong>
                </p>
              </div>

              {/* Delivered Credentials Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 text-left space-y-3 shadow-inner">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Lock size={13} /> THÔNG TIN ĐĂNG NHẬP GARENA:
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded">
                    ĐÃ BÀN GIAO
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Tài khoản (Username / Email / SĐT):</span>
                      <span className="font-mono font-bold text-slate-100 text-xs sm:text-sm">
                        {completedOrder.credentialsDelivered?.username}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(completedOrder.credentialsDelivered?.username || '', 'user')}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedUser ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiedUser ? 'Đã chép' : 'Chép'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Mật khẩu ban đầu:</span>
                      <span className="font-mono font-bold text-amber-400 text-xs sm:text-sm">
                        {completedOrder.credentialsDelivered?.password}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(completedOrder.credentialsDelivered?.password || '', 'pass')}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedPass ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiedPass ? 'Đã chép' : 'Chép'}</span>
                    </button>
                  </div>

                  {completedOrder.credentialsDelivered?.securityNote && (
                    <div className="p-2 bg-slate-900/60 rounded-xl text-[11px] text-slate-400 border border-slate-800/80">
                      💡 <strong>Ghi chú từ shop:</strong> {completedOrder.credentialsDelivered.securityNote}
                    </div>
                  )}
                </div>
              </div>

              {/* 3 Step Security Guide */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left text-xs text-slate-300 space-y-1.5">
                <div className="font-bold text-amber-400 flex items-center gap-1">
                  <ShieldCheck size={14} /> 3 BƯỚC CẦN LÀM NGAY:
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                  <li>Đăng nhập vào game Liên Quân Mobile hoặc <span className="text-amber-300">account.garena.com</span> để kiểm tra đúng số tướng/skin.</li>
                  <li>Đổi mật khẩu và cài đặt SĐT/Email bảo mật chính chủ của bạn.</li>
                  <li>Vào mục <strong>[Đơn Hàng]</strong> bấm <em>Xác nhận đã nhận acc</em> để hoàn tất giao dịch.</li>
                </ol>
              </div>

              {/* Navigation Actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    handleClose();
                    setCurrentView('orders');
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink size={14} />
                  <span>VÀO QUẢN LÝ ĐƠN HÀNG</span>
                </button>
                <button
                  onClick={handleClose}
                  className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          ) : (
            /* CHECKOUT CONFIRMATION STATE */
            <>
              {/* Account Overview Box */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <img
                  src={account.images[0]}
                  alt={account.title}
                  className="w-20 h-16 rounded-xl object-cover border border-slate-700/80 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                      #{account.code}
                    </span>
                    <RankBadge rank={account.rank} size="sm" />
                  </div>
                  <h4 className="text-xs font-bold text-white truncate" title={account.title}>
                    {account.title}
                  </h4>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Swords size={11} className="text-amber-400" /> {account.heroesCount} Tướng
                    </span>
                    <span className="flex items-center gap-1">
                      <Shirt size={11} className="text-purple-400" /> {account.skinsCount} Skin
                    </span>
                    <span className="text-emerald-400 truncate">
                      {account.credentials.securityType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Cost Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Giá bán tài khoản:</span>
                  <span className="font-bold text-white">{account.price.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Phí bảo hiểm trung gian Escrow:</span>
                  <span className="text-emerald-400 font-bold">0đ (Miễn phí)</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                  <span className="font-bold text-slate-200">Tổng tiền thanh toán:</span>
                  <span className="text-xl font-black text-amber-400">
                    {account.price.toLocaleString('vi-VN')}
                    <span className="text-xs text-amber-500 ml-1">VNĐ</span>
                  </span>
                </div>
              </div>

              {/* Payment Source & Wallet Balance */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Wallet size={15} className="text-amber-400" />
                    <span className="font-semibold">Nguồn tiền: Ví điện tử LQMarket Pay</span>
                  </div>
                  <span className="font-mono font-bold text-amber-300">
                    {currentUser.balance.toLocaleString('vi-VN')}đ
                  </span>
                </div>

                {isBalanceSufficient ? (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="shrink-0" />
                      <span>Số dư ví khả dụng đủ để thanh toán.</span>
                    </div>
                    <span className="font-bold">
                      Còn lại: {(currentUser.balance - account.price).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-2.5">
                    <div className="flex items-center justify-between text-rose-400 font-bold">
                      <div className="flex items-center gap-1.5">
                        <AlertCircle size={14} />
                        <span>Số dư không đủ thanh toán</span>
                      </div>
                      <span className="font-mono">Thiếu: {deficitAmount.toLocaleString('vi-VN')}đ</span>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Vui lòng nạp tiền vào ví qua cổng thanh toán QR Pay để hoàn tất mua tài khoản này.
                    </p>

                    <button
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        setIsWalletOpen(true);
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <PlusCircle size={14} />
                      <span>Nạp Tiền Vào Ví (QR Pay 24/7)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Escrow Guarantee Notice */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-slate-300">
                <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed text-slate-300">
                  <strong className="text-emerald-400">Bảo vệ 100% người mua:</strong> Tiền sẽ được tạm giữ an toàn trong quỹ Escrow. Shop chỉ nhận được tiền sau khi bạn đã kiểm tra tài khoản thành công và bấm xác nhận.
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Agree Terms Checkbox */}
              <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={e => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-950"
                />
                <span className="text-[11px] text-slate-400">
                  Tôi đồng ý với quy định giao dịch trung gian và cam kết đổi mật khẩu sau khi nhận tài khoản.
                </span>
              </label>

              {/* Checkout Action Button */}
              <button
                id="checkout-confirm-pay-btn"
                onClick={handleConfirmPurchase}
                disabled={isProcessing || !isBalanceSufficient}
                className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer ${
                  isBalanceSufficient
                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:from-amber-400 hover:to-orange-300 text-slate-950 shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                {isProcessing ? (
                  <span>Đang xử lý giao dịch Escrow...</span>
                ) : (
                  <>
                    <Zap size={16} className={isBalanceSufficient ? 'fill-slate-950' : ''} />
                    <span>XÁC NHẬN MUA & NHẬN MẬT KHẨU NGAY</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
