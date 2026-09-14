import React from 'react';
import { useApp } from '../../context/AppContext';
import { RankBadge } from '../common/RankBadge';
import { getDynamicSellerInfo } from '../../utils/sellerHelper';
import {
  X,
  Swords,
  Shirt,
  ShieldCheck,
  Star,
  Check,
  Zap,
  Eye,
  Trash2,
  Scale,
  Shield,
  CheckCircle2
} from 'lucide-react';

interface AccountCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountCompareModal: React.FC<AccountCompareModalProps> = ({ isOpen, onClose }) => {
  const {
    accounts,
    allUsers,
    orders,
    compareAccountIds,
    removeFromCompare,
    clearCompare,
    setSelectedAccountId,
    startCheckout
  } = useApp();

  if (!isOpen) return null;

  const compareAccounts = accounts.filter(a => compareAccountIds.includes(a.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Scale size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>SO SÁNH TÀI KHOẢN LIÊN QUÂN</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {compareAccounts.length} / 3 acc
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Đối chiếu thông số kỹ thuật, rank, giá bán và độ uy tín của người bán trước khi quyết định mua
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {compareAccounts.length > 0 && (
              <button
                onClick={clearCompare}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Xóa danh sách so sánh"
              >
                <Trash2 size={13} />
                <span className="hidden sm:inline">Xóa Hết</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-x-auto max-h-[75vh]">
          {compareAccounts.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Scale size={44} className="mx-auto text-slate-600" />
              <p className="text-sm text-slate-400">Chưa có tài khoản nào được chọn để so sánh.</p>
              <p className="text-xs text-slate-500">
                Bấm nút [So Sánh] ở thẻ tài khoản ngoài danh sách để thêm tối đa 3 tài khoản đối chiếu.
              </p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr>
                  <th className="p-3 bg-slate-950/70 border border-slate-800 text-slate-400 font-bold uppercase text-[11px] w-40">
                    Thuộc Tính
                  </th>
                  {compareAccounts.map(acc => (
                    <th
                      key={acc.id}
                      className="p-3 bg-slate-950/80 border border-slate-800 text-white min-w-[220px] max-w-[280px]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            #{acc.code}
                          </span>
                          <h4 className="font-bold text-white text-xs line-clamp-1">{acc.title}</h4>
                        </div>
                        <button
                          onClick={() => removeFromCompare(acc.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                          title="Bỏ khỏi so sánh"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {/* Image */}
                <tr>
                  <td className="p-3 font-semibold text-slate-400 bg-slate-950/40 border border-slate-800">
                    Ảnh đại diện
                  </td>
                  {compareAccounts.map(acc => (
                    <td key={acc.id} className="p-3 border border-slate-800 bg-slate-900/50 text-center">
                      <img
                        src={acc.images[0]}
                        alt={acc.title}
                        className="w-full h-28 object-cover rounded-xl border border-slate-800"
                      />
                    </td>
                  ))}
                </tr>

                {/* Price */}
                <tr>
                  <td className="p-3 font-semibold text-slate-400 bg-slate-950/40 border border-slate-800">
                    Giá Bán
                  </td>
                  {compareAccounts.map(acc => (
                    <td key={acc.id} className="p-3 border border-slate-800 bg-slate-900/50">
                      <div className="text-base sm:text-lg font-black text-amber-400">
                        {acc.price.toLocaleString('vi-VN')}đ
                      </div>
                      {acc.originalPrice && acc.originalPrice > acc.price && (
                        <div className="text-xs text-slate-500 line-through">
                          {acc.originalPrice.toLocaleString('vi-VN')}đ
                        </div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Rank */}
                <tr>
                  <td className="p-3 font-semibold text-slate-400 bg-slate-950/40 border border-slate-800">
                    Bậc Rank
                  </td>
                  {compareAccounts.map(acc => (
                    <td key={acc.id} className="p-3 border border-slate-800 bg-slate-900/50">
                      <RankBadge rank={acc.rank} size="sm" />
                    </td>
                  ))}
                </tr>

                {/* Heroes */}
                <tr>
                  <td className="p-3 font-semibold text-slate-400 bg-slate-950/40 border border-slate-800">
                    Số Tướng
                  </td>
                  {compareAccounts.map(acc => (
                    <td key={acc.id} className="p-3 border border-slate-800 bg-slate-900/50 font-bold text-white">
                      <span className="flex items-center gap-1.5">
                        <Swords size={14} className="text-amber-400" />
                        <span>{acc.heroesCount} tướng</span>
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Skins */}
                <tr>
                  <td className="p-3 font-semibold text-slate-400 bg-slate-950/40 border border-slate-800">
                    Số Trang Phục
                  </td>
                  {compareAccounts.map(acc => (
                    <td key={acc.id} className="p-3 border border-slate-800 bg-slate-900/50 font-bold text-purple-300">
                      <span className="flex items-center gap-1.5">
                        <Shirt size={14} className="text-purple-400" />
                        <span>{acc.skinsCount} skin</span>
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Rune */}
                <tr>
                  <td className="p-3 font-semibold text-slate-400 bg-slate-950/40 border border-slate-800">
                    Bảng Ngọc
                  </td>
                  {compareAccounts.map(acc => (
                    <td key={acc.id} className="p-3 border border-slate-800 bg-slate-900/50 text-slate-300">
                      {acc.runePages || '90/90 Full Ngọc III'}
                    </td>
                  ))}
                </tr>

                {/* Security */}
                <tr>
                  <td className="p-3 font-semibold text-slate-400 bg-slate-950/40 border border-slate-800">
                    Bảo Mật
                  </td>
                  {compareAccounts.map(acc => (
                    <td key={acc.id} className="p-3 border border-slate-800 bg-slate-900/50 text-emerald-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <ShieldCheck size={14} />
                        <span>{acc.credentials?.securityType || 'Trắng Thông Tin'}</span>
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Seller & Trust Score */}
                <tr>
                  <td className="p-3 font-semibold text-slate-400 bg-slate-950/40 border border-slate-800">
                    Người Bán & Trust Score
                  </td>
                  {compareAccounts.map(acc => {
                    const sellerInfo = getDynamicSellerInfo(acc.sellerId, allUsers, orders, acc);
                    return (
                      <td key={acc.id} className="p-3 border border-slate-800 bg-slate-900/50">
                        <div className="flex items-center gap-2">
                          <img
                            src={sellerInfo.avatar}
                            alt={sellerInfo.name}
                            className="w-8 h-8 rounded-lg object-cover border border-amber-500/30"
                          />
                          <div>
                            <div className="font-bold text-white text-xs">{sellerInfo.name}</div>
                            <div className="flex items-center gap-1 text-[11px] text-amber-400">
                              <Star size={11} className="fill-amber-400" />
                              <span>{sellerInfo.averageRating}</span>
                              <span className="text-slate-400">({sellerInfo.completedSales} đã bán)</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 inline-block">
                          🛡️ Trust Score: {sellerInfo.trustScore}/100
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Actions */}
                <tr>
                  <td className="p-3 font-semibold text-slate-400 bg-slate-950/40 border border-slate-800">
                    Thao Tác
                  </td>
                  {compareAccounts.map(acc => (
                    <td key={acc.id} className="p-3 border border-slate-800 bg-slate-900/50 space-y-2">
                      <button
                        onClick={() => {
                          onClose();
                          startCheckout(acc.id);
                        }}
                        className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/20"
                      >
                        <Zap size={14} />
                        <span>MUA NGAY</span>
                      </button>

                      <button
                        onClick={() => {
                          onClose();
                          setSelectedAccountId(acc.id);
                        }}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye size={14} />
                        <span>Xem Chi Tiết</span>
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
