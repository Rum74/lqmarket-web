import React from 'react';
import { useApp } from '../../context/AppContext';
import { Award, Check, X, Shield, Sparkles, Crown, Zap, Gift } from 'lucide-react';

interface LoyaltyTierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoyaltyTierModal: React.FC<LoyaltyTierModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, orders } = useApp();

  if (!isOpen) return null;

  // Calculate actual total spent and completed orders
  const myCompletedOrders = orders.filter(
    o => o.buyerId === currentUser.id && o.status === 'completed'
  );
  const totalSpent = myCompletedOrders.reduce((sum, o) => sum + o.accountPrice, 0);
  const completedOrdersCount = myCompletedOrders.length;

  // Tier criteria
  const tiers = [
    {
      id: 'Member',
      name: 'Hội Viên Đồng (Member)',
      minSpent: 0,
      minOrders: 0,
      color: 'from-slate-700 to-slate-800',
      badgeColor: 'text-slate-300 bg-slate-800 border-slate-700',
      perks: [
        'Miễn phí trung gian bảo vệ người mua',
        'Tích lũy điểm uy tín thành viên',
        'Hỗ trợ qua chat hệ thống 24/7'
      ]
    },
    {
      id: 'Silver',
      name: 'Hội Viên Bạc (Silver)',
      minSpent: 500000,
      minOrders: 2,
      color: 'from-slate-400 to-slate-600',
      badgeColor: 'text-slate-200 bg-slate-700 border-slate-500',
      perks: [
        'Giảm 2% phí khi bán tài khoản',
        'Voucher sinh nhật 30.000đ',
        'Mở khóa phòng chat VIP'
      ]
    },
    {
      id: 'Gold',
      name: 'Hội Viên Vàng (Gold)',
      minSpent: 2000000,
      minOrders: 5,
      color: 'from-amber-400 to-amber-600',
      badgeColor: 'text-amber-300 bg-amber-500/20 border-amber-500/40',
      perks: [
        'Giảm 3% phí khi bán tài khoản',
        'Voucher độc quyền 50.000đ mỗi tháng',
        'Huy hiệu Vàng hiển thị trang trọng'
      ]
    },
    {
      id: 'Diamond',
      name: 'Hội Viên Kim Cương (Diamond)',
      minSpent: 5000000,
      minOrders: 10,
      color: 'from-cyan-400 to-blue-600',
      badgeColor: 'text-cyan-300 bg-cyan-500/20 border-cyan-500/40',
      perks: [
        'Hỗ trợ xử lý khiếu nại ưu tiên hàng đầu',
        'Voucher độc quyền 100.000đ mỗi tháng',
        'Xem trước các tài khoản VIP vừa đăng'
      ]
    },
    {
      id: 'VIP',
      name: 'Khách Hàng Hoàng Gia (VIP Lord)',
      minSpent: 10000000,
      minOrders: 20,
      color: 'from-purple-500 to-pink-600',
      badgeColor: 'text-purple-300 bg-purple-500/20 border-purple-500/40',
      perks: [
        'Miễn phí 100% phí bảo hiểm giao dịch',
        'Đội ngũ Admin hỗ trợ riêng qua Zalo 1-1',
        'Voucher độc quyền 200.000đ',
        'Huy hiệu VIP vương miện danh giá'
      ]
    }
  ];

  // Determine current tier
  let currentTier = tiers[0];
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (totalSpent >= tiers[i].minSpent || completedOrdersCount >= tiers[i].minOrders) {
      currentTier = tiers[i];
      break;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Crown size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-white">HỆ THỐNG CẤP BẬC HỘI VIÊN (LOYALTY)</h3>
              <p className="text-[11px] text-slate-400">Tích lũy chi tiêu & số đơn hàng để nâng cấp quyền lợi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current status banner */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Crown size={24} />
            </div>
            <div>
              <div className="text-xs text-slate-400">Cấp bậc hiện tại của bạn:</div>
              <div className="text-lg font-black text-amber-400">{currentTier.name}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px]">Tổng chi tiêu:</span>
              <span className="font-bold text-emerald-400 font-mono">
                {totalSpent.toLocaleString('vi-VN')}đ
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px]">Đơn hoàn tất:</span>
              <span className="font-bold text-white font-mono">{completedOrdersCount} đơn</span>
            </div>
          </div>
        </div>

        {/* Tiers List */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
          {tiers.map(t => {
            const isMyTier = currentTier.id === t.id;
            return (
              <div
                key={t.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isMyTier
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${t.badgeColor}`}>
                      {t.name}
                    </span>
                    {isMyTier && (
                      <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                        ĐANG SỞ HỮU
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    Từ <strong className="text-slate-200">{t.minSpent.toLocaleString('vi-VN')}đ</strong> hoặc{' '}
                    <strong className="text-slate-200">{t.minOrders} đơn</strong>
                  </div>
                </div>

                <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-300">
                  {t.perks.map((p, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <Check size={13} className="text-emerald-400 shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
