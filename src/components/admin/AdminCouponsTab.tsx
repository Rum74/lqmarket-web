import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CouponItem } from '../../types';
import { Ticket, Plus, Check, X, Trash2, Power, AlertCircle, Percent, DollarSign } from 'lucide-react';

export const AdminCouponsTab: React.FC = () => {
  const { coupons, adminCreateCoupon, adminToggleCoupon, adminDeleteCoupon } = useApp();
  const [isCreating, setIsCreating] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountVal, setDiscountVal] = useState(10);
  const [minOrder, setMinOrder] = useState(300000);
  const [maxDiscount, setMaxDiscount] = useState(100000);
  const [maxUses, setMaxUses] = useState(200);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res: any = await adminCreateCoupon({
        code: code.trim().toUpperCase(),
        discountPercent: discountType === 'percent' ? discountVal : undefined,
        discountAmount: discountType === 'fixed' ? discountVal : undefined,
        minOrder,
        maxDiscount: discountType === 'percent' ? maxDiscount : undefined,
        maxUses,
        description: description || `Mã giảm giá ${code.toUpperCase()}`
      });

      if (res && res.success === false) {
        setErrorMsg(res.message || 'Lỗi tạo mã giảm giá');
      } else {
        setIsCreating(false);
        setCode('');
        setDescription('');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Lỗi khi lưu mã giảm giá');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Ticket size={18} className="text-amber-400" />
            <span>Quản Lý Mã Giảm Giá & Voucher (Coupons)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Tạo và cấu hình mã coupon khuyến mãi cho người mua áp dụng khi thanh toán
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
        >
          <Plus size={15} />
          <span>TẠO MÃ COUPON MỚI</span>
        </button>
      </div>

      {/* Create form modal */}
      {isCreating && (
        <div className="p-6 bg-slate-900 border border-amber-500/40 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-white">Thêm Mã Giảm Giá Mới</h4>
            <button
              onClick={() => setIsCreating(false)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Mã Coupon (Viết hoa, không dấu): *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="VD: BANMOI50K"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Loại giảm giá:
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDiscountType('percent')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      discountType === 'percent'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Theo phần trăm (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('fixed')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      discountType === 'fixed'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Số tiền cố định (VNĐ)
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {discountType === 'percent' ? 'Mức giảm (%)' : 'Số tiền giảm (VNĐ)'}: *
                </label>
                <input
                  type="number"
                  required
                  value={discountVal}
                  onChange={e => setDiscountVal(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Đơn hàng tối thiểu (VNĐ):
                </label>
                <input
                  type="number"
                  required
                  value={minOrder}
                  onChange={e => setMinOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Số lượt dùng tối đa:
                </label>
                <input
                  type="number"
                  required
                  value={maxUses}
                  onChange={e => setMaxUses(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Mô tả hiển thị:</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="VD: Giảm 10% tối đa 100k cho đơn từ 300k"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer"
              >
                {isSubmitting ? 'Đang lưu...' : 'Lưu Mã Giảm Giá'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coupons.map(coupon => (
          <div
            key={coupon.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                    {coupon.code}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      coupon.isActive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {coupon.isActive ? 'Đang Hoạt Động' : 'Tạm Khóa'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => adminToggleCoupon(coupon.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title={coupon.isActive ? 'Tạm khóa' : 'Kích hoạt'}
                  >
                    <Power size={14} className={coupon.isActive ? 'text-emerald-400' : 'text-slate-500'} />
                  </button>
                  <button
                    onClick={() => adminDeleteCoupon(coupon.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Xóa coupon"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-300 font-medium mt-2">{coupon.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
              <div>
                <span>Mức giảm:</span>
                <div className="font-bold text-white font-mono">
                  {coupon.discountPercent ? `${coupon.discountPercent}%` : `${coupon.discountAmount?.toLocaleString()}đ`}
                </div>
              </div>
              <div>
                <span>Đơn tối thiểu:</span>
                <div className="font-bold text-white font-mono">{coupon.minOrder.toLocaleString('vi-VN')}đ</div>
              </div>
              <div>
                <span>Đã dùng:</span>
                <div className="font-bold text-amber-400 font-mono">
                  {coupon.usedCount} / {coupon.maxUses}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
