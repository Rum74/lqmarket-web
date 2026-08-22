import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OrderItem } from '../../types';
import confetti from '../../utils/confetti';
import {
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Eye,
  EyeOff,
  Star,
  MessageCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Lock,
  XCircle,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const {
    currentUser,
    orders,
    confirmOrderReceived,
    disputeOrder,
    submitReview,
    openChatWith,
    openSellerProfile,
    setCurrentView,
    openLoginModal,
    openRegisterModal,
    loginUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<'buy_orders' | 'sell_orders'>('buy_orders');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Confirm Received Modal state
  const [confirmingOrder, setConfirmingOrder] = useState<OrderItem | null>(null);

  // Dispute Modal state
  const [disputingOrderId, setDisputingOrderId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');

  // Review Modal state
  const [reviewingOrderId, setReviewingOrderId] = useState<string | null>(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Guest (Not Logged In) prompt
  if (!currentUser.id) {
    return (
      <div className="p-8 sm:p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-6 max-w-2xl mx-auto my-8 shadow-2xl">
        <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
          <ShoppingBag size={32} />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
            <span>TRA CỨU & QUẢN LÝ ĐƠN HÀNG</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Vui Lòng Đăng Nhập Để Xem Đơn Hàng
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
            Bạn cần đăng nhập tài khoản để tra cứu lịch sử mua nick, nhận tài khoản mật khẩu Garena bảo mật và đánh giá người bán.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => loginUser('vanb.gamer@gmail.com', '123456')}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            Đăng Nhập Khách Mua Mẫu (1-Click)
          </button>
          <button
            onClick={openLoginModal}
            className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Đăng Nhập Tài Khoản Khác
          </button>
        </div>
      </div>
    );
  }

  const buyOrders = orders.filter(o => o.buyerId === currentUser.id);
  const sellOrders = orders.filter(o => o.sellerId === currentUser.id);

  const displayedOrders = activeTab === 'buy_orders' ? buyOrders : sellOrders;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const togglePasswordVisibility = (orderId: string) => {
    setShowPasswordMap(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const handleExecuteConfirmReceived = () => {
    if (!confirmingOrder) return;
    const orderId = confirmingOrder.id;

    confirmOrderReceived(orderId);
    setConfirmingOrder(null);

    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 }
      });
    } catch {}

    showToast('Xác nhận nhận acc thành công! Tiền đã được chuyển cho người bán. Vui lòng để lại đánh giá uy tín.');

    // Auto open review prompt
    setTimeout(() => {
      setReviewingOrderId(orderId);
      setRatingStars(5);
      setReviewComment('Acc rất ngon, đúng như mô tả, giao pass cực nhanh!');
    }, 600);
  };

  const handleOpenDispute = (orderId: string) => {
    setDisputingOrderId(orderId);
    setDisputeReason('');
  };

  const handleSubmitDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputingOrderId || !disputeReason.trim()) return;

    disputeOrder(disputingOrderId, disputeReason.trim());
    setDisputingOrderId(null);
    showToast('Đã gửi khiếu nại thành công! Admin LQMarket sẽ kiểm tra và giải quyết hoàn tiền theo quy định.');
  };

  const handleOpenReview = (orderId: string) => {
    setReviewingOrderId(orderId);
    setRatingStars(5);
    setReviewComment('Acc rất ngon, đúng như mô tả, giao pass cực nhanh!');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingOrderId) return;
    submitReview(reviewingOrderId, ratingStars, reviewComment.trim());
    setReviewingOrderId(null);
    showToast('Cảm ơn bạn đã gửi đánh giá cho Shop!');
  };

  return (
    <div className="space-y-8 pb-12 text-left">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between shadow-2xl animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white cursor-pointer">
            <XCircle size={14} />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-md mb-1">
            <ShieldCheck size={13} />
            <span>HỆ THỐNG GIAO DỊCH TRUNG GIAN ESCROW</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            QUẢN LÝ ĐƠN HÀNG & BÀN GIAO ACC
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Lấy thông tin đăng nhập Garena, kiểm tra tài khoản, đổi mật khẩu và bấm xác nhận hoàn tất.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            id="orders-tab-buy"
            onClick={() => setActiveTab('buy_orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'buy_orders'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag size={14} />
            <span>Đơn Mua Của Tôi ({buyOrders.length})</span>
          </button>

          <button
            id="orders-tab-sell"
            onClick={() => setActiveTab('sell_orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sell_orders'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Đơn Bán Của Tôi ({sellOrders.length})</span>
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {displayedOrders.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-3xl bg-slate-800/80 flex items-center justify-center mx-auto text-slate-500">
              <ShoppingBag size={28} />
            </div>
            <h3 className="text-base font-bold text-white">Chưa có đơn hàng nào trong mục này</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Bạn có thể dạo quanh sàn để chọn tài khoản yêu thích hoặc kiểm tra các bài đăng đang bán.
            </p>
            <button
              onClick={() => setCurrentView('accounts')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Xem Danh Sách Acc
            </button>
          </div>
        ) : (
          displayedOrders.map(order => {
            const isDeliveredOrInspecting =
              order.status === 'account_delivered' || order.status === 'inspecting';
            const isCompleted = order.status === 'completed';
            const isDisputed = order.status === 'disputed';
            const isRefunded = order.status === 'refunded';

            return (
              <div
                key={order.id}
                id={`order-card-${order.orderCode.replace('#', '')}`}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold bg-slate-950 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/30">
                      {order.orderCode}
                    </span>
                    <span className="text-xs text-slate-400">
                      Mã acc: <strong className="text-white">#{order.accountCode}</strong>
                    </span>
                    <span className="text-[11px] text-slate-500 hidden sm:inline">
                      • {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    {isDeliveredOrInspecting && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full animate-pulse">
                        <Clock size={13} />
                        <span>ĐÃ GIAO ACC — ĐANG KIỂM TRA</span>
                      </span>
                    )}

                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
                        <CheckCircle2 size={13} />
                        <span>GIAO DỊCH HOÀN TẤT</span>
                      </span>
                    )}

                    {isDisputed && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full animate-bounce">
                        <AlertTriangle size={13} />
                        <span>ĐANG KHIẾU NẠI (ADMIN ĐANG XỬ LÝ)</span>
                      </span>
                    )}

                    {isRefunded && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full">
                        <RefreshCw size={13} />
                        <span>ĐÃ HOÀN TIỀN 100%</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Account Details & Price */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">{order.accountTitle}</h3>
                    <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                      <span>
                        Người bán:{' '}
                        <button
                          onClick={() => openSellerProfile(order.sellerId)}
                          className="text-amber-400 hover:text-amber-300 font-bold underline decoration-amber-500/40 cursor-pointer"
                          title="Bấm xem hồ sơ shop"
                        >
                          {order.sellerName}
                        </button>
                      </span>
                      <span>Người mua: <strong className="text-cyan-400">{order.buyerName}</strong></span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">Tổng tiền thanh toán:</div>
                    <div className="text-lg sm:text-xl font-black text-amber-400">
                      {order.totalAmount.toLocaleString('vi-VN')}đ
                    </div>
                    <span className="text-[10px] text-emerald-400">Phí trung gian: 0đ (Được bảo hiểm)</span>
                  </div>
                </div>

                {/* SECRET CREDENTIALS BOX (Delivered to Buyer) */}
                {order.credentialsDelivered && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3 shadow-inner">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                        <Lock size={14} />
                        <span>THÔNG TIN ĐĂNG NHẬP GARENA CỦA BẠN:</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {order.credentialsDelivered.securityType}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Username */}
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Tài khoản Garena:</span>
                          <span className="text-xs font-mono font-bold text-white select-all">
                            {order.credentialsDelivered.username}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopy(order.credentialsDelivered!.username, `user_${order.id}`)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs"
                          title="Sao chép tên tài khoản"
                        >
                          {copiedField === `user_${order.id}` ? (
                            <Check size={13} className="text-emerald-400" />
                          ) : (
                            <Copy size={13} />
                          )}
                          <span>{copiedField === `user_${order.id}` ? 'Đã chép' : 'Chép'}</span>
                        </button>
                      </div>

                      {/* Password */}
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Mật khẩu đăng nhập:</span>
                          <span className="text-xs font-mono font-bold text-amber-300 select-all">
                            {showPasswordMap[order.id]
                              ? order.credentialsDelivered.password
                              : '••••••••••••••••'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => togglePasswordVisibility(order.id)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title={showPasswordMap[order.id] ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                          >
                            {showPasswordMap[order.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                          <button
                            onClick={() => handleCopy(order.credentialsDelivered!.password, `pass_${order.id}`)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs"
                            title="Sao chép mật khẩu"
                          >
                            {copiedField === `pass_${order.id}` ? (
                              <Check size={13} className="text-emerald-400" />
                            ) : (
                              <Copy size={13} />
                            )}
                            <span>{copiedField === `pass_${order.id}` ? 'Đã chép' : 'Chép'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {order.credentialsDelivered.securityNote && (
                      <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                        <strong className="text-slate-300">Ghi chú seller:</strong> {order.credentialsDelivered.securityNote}
                      </div>
                    )}
                  </div>
                )}

                {/* Dispute reason if active */}
                {order.disputeReason && (
                  <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <div>
                      <strong>Lý do khiếu nại:</strong> {order.disputeReason}
                    </div>
                  </div>
                )}

                {/* Review if provided */}
                {order.ratingGiven && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-400">
                        {Array.from({ length: order.ratingGiven }).map((_, i) => (
                          <Star key={i} size={12} className="fill-amber-400" />
                        ))}
                      </div>
                      <span>"{order.reviewComment}"</span>
                    </div>
                  </div>
                )}

                {/* Bottom Interactive Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        openChatWith({
                          id: activeTab === 'buy_orders' ? order.sellerId : order.buyerId,
                          name: activeTab === 'buy_orders' ? order.sellerName : order.buyerName,
                          avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=160&q=80',
                          role: activeTab === 'buy_orders' ? 'seller' : 'buyer'
                        })
                      }
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageCircle size={13} className="text-amber-400" />
                      <span>Chat với {activeTab === 'buy_orders' ? 'Người Bán' : 'Người Mua'}</span>
                    </button>
                  </div>

                  {/* Buyer action buttons when inspecting */}
                  {activeTab === 'buy_orders' && isDeliveredOrInspecting && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenDispute(order.id)}
                        className="px-3 py-2 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 text-xs font-bold rounded-xl border border-rose-800/60 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <AlertTriangle size={13} />
                        <span>Khiếu Nại Lỗi</span>
                      </button>

                      <button
                        id={`btn-confirm-received-${order.id}`}
                        onClick={() => setConfirmingOrder(order)}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 size={15} />
                        <span>XÁC NHẬN ĐÃ NHẬN ACC (HOÀN TẤT)</span>
                      </button>
                    </div>
                  )}

                  {/* Buyer review button if completed */}
                  {activeTab === 'buy_orders' && isCompleted && !order.ratingGiven && (
                    <button
                      onClick={() => handleOpenReview(order.id)}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-xl border border-amber-500/40 flex items-center gap-1 cursor-pointer"
                    >
                      <Star size={13} />
                      <span>Đánh giá 5 sao cho Shop</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CONFIRM RECEIVED MODAL (DIRECT IN-APP DIALOG) */}
      {confirmingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
              <CheckCircle2 size={20} />
              <span>Xác Nhận Đã Nhận Acc & Giải Ngân</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span>Mã đơn hàng:</span>
                <strong className="text-white font-mono">{confirmingOrder.orderCode}</strong>
              </div>
              <div className="flex justify-between">
                <span>Tài khoản:</span>
                <strong className="text-white">{confirmingOrder.accountTitle}</strong>
              </div>
              <div className="flex justify-between">
                <span>Số tiền giải ngân cho shop:</span>
                <strong className="text-emerald-400 font-bold">{confirmingOrder.accountPrice.toLocaleString('vi-VN')}đ</strong>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn xác nhận đã đăng nhập thành công vào game, kiểm tra đúng số tướng/skin và đã đổi mật khẩu bảo mật? Sau khi xác nhận, tiền sẽ được chuyển trực tiếp vào ví của người bán.
            </p>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setConfirmingOrder(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Kiểm tra thêm
              </button>
              <button
                type="button"
                onClick={handleExecuteConfirmReceived}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1"
              >
                <CheckCircle2 size={14} />
                <span>ĐỒNG Ý HOÀN TẤT ĐƠN HÀNG</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISPUTE MODAL */}
      {disputingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertTriangle size={18} />
              <span>Gửi Khiếu Nại Đơn Hàng Tới Super Admin</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Nếu mật khẩu sai, tài khoản bị khóa hoặc thiếu skin so với mô tả, vui lòng mô tả chi tiết để Super Admin can thiệp hoàn tiền 100%.
            </p>

            <form onSubmit={handleSubmitDispute} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Mô tả sự cố bạn gặp phải:
                </label>
                <textarea
                  required
                  rows={4}
                  value={disputeReason}
                  onChange={e => setDisputeReason(e.target.value)}
                  placeholder="VD: Mật khẩu Garena đăng nhập báo sai / Tài khoản không đúng số skin như mô tả..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setDisputingOrderId(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Gửi Khiếu Nại Cho Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {reviewingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Star size={18} className="fill-amber-400" />
              <span>Đánh Giá Uy Tín Người Bán</span>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="space-y-2 text-center py-2">
                <div className="text-xs text-slate-300 font-medium">Chọn số sao đánh giá:</div>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRatingStars(star)}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        size={24}
                        className={
                          star <= ratingStars
                            ? 'text-amber-400 fill-amber-400 scale-110'
                            : 'text-slate-600'
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Nhận xét của bạn:
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Nhập cảm nhận của bạn về tài khoản và tốc độ giao dịch..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setReviewingOrderId(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Gửi Đánh Giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
