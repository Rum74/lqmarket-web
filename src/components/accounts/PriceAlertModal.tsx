import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AccountItem } from '../../types';
import { Bell, X, Check, ArrowRight, ShieldCheck, DollarSign } from 'lucide-react';

interface PriceAlertModalProps {
  isOpen: boolean;
  account: AccountItem | null;
  onClose: () => void;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({ isOpen, account, onClose }) => {
  const { setPriceAlert, currentUser, isLoggedIn, openLoginModal } = useApp();
  const [targetPrice, setTargetPrice] = useState<number>(account ? Math.round(account.price * 0.85) : 0);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !account) return null;

  const handleSave = () => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    if (targetPrice <= 0 || targetPrice >= account.price) {
      return;
    }
    setPriceAlert(account.id, targetPrice);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 text-left space-y-5 animate-in fade-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Bell size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">ĐẶT THÔNG BÁO GIẢM GIÁ</h3>
              <p className="text-[11px] text-slate-400">Tự động báo chuông khi người bán giảm giá</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Account summary */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
          <img
            src={account.images[0]}
            alt={account.title}
            className="w-14 h-14 rounded-xl object-cover border border-slate-800 shrink-0"
          />
          <div className="min-w-0">
            <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
              #{account.code}
            </span>
            <h4 className="text-xs font-bold text-white truncate mt-0.5">{account.title}</h4>
            <div className="text-xs text-slate-400 mt-1">
              Giá hiện tại: <strong className="text-amber-400 font-bold">{account.price.toLocaleString('vi-VN')}đ</strong>
            </div>
          </div>
        </div>

        {/* Target price input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            Thông báo cho tôi khi giá giảm xuống bằng hoặc dưới:
          </label>
          <div className="relative">
            <input
              type="number"
              step={10000}
              min={10000}
              max={account.price - 10000}
              value={targetPrice}
              onChange={e => setTargetPrice(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-400 font-bold font-mono">
              VNĐ
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Tiết kiệm dự kiến:</span>
            <span className="text-emerald-400 font-bold">
              {(account.price - targetPrice > 0 ? account.price - targetPrice : 0).toLocaleString('vi-VN')}đ (
              {Math.round(((account.price - targetPrice) / account.price) * 100)}%)
            </span>
          </div>
        </div>

        {/* Preset suggestions */}
        <div className="grid grid-cols-3 gap-2">
          {[0.9, 0.8, 0.7].map(pct => {
            const val = Math.round((account.price * pct) / 10000) * 10000;
            return (
              <button
                key={pct}
                onClick={() => setTargetPrice(val)}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  targetPrice === val
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Giảm {(1 - pct) * 100}% ({val.toLocaleString('vi-VN')}đ)
              </button>
            );
          })}
        </div>

        {isSuccess && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-2">
            <Check size={14} />
            <span>Đã đặt thông báo thành công! Hệ thống sẽ báo chuông ngay khi giá giảm.</span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={targetPrice <= 0 || targetPrice >= account.price}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Bell size={14} />
            <span>Xác Nhận Theo Dõi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
