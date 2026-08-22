import React from 'react';
import { useApp } from '../../context/AppContext';
import { AccountCard } from '../accounts/AccountCard';
import { Heart, Search, ArrowRight } from 'lucide-react';

export const WishlistView: React.FC = () => {
  const { wishlistIds, accounts, setCurrentView } = useApp();

  const wishlistedAccounts = accounts.filter(a => wishlistIds.includes(a.id));

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-md mb-1">
            <Heart size={13} className="fill-rose-400" />
            <span>ACC YÊU THÍCH ĐÃ LƯU</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            DANH SÁCH ACC QUAN TÂM
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Lưu lại các tài khoản Liên Quân ưng ý để dễ dàng so sánh và theo dõi giá.
          </p>
        </div>

        <button
          onClick={() => setCurrentView('accounts')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer w-fit"
        >
          <Search size={14} className="text-amber-400" />
          <span>Tìm thêm tài khoản</span>
        </button>
      </div>

      {wishlistedAccounts.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-800/80 flex items-center justify-center mx-auto text-rose-400">
            <Heart size={28} />
          </div>
          <h3 className="text-base font-bold text-white">Bạn chưa lưu tài khoản nào vào danh sách yêu thích</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Bấm vào biểu tượng trái tim ❤️ ở góc bất kỳ acc nào trên sàn để lưu lại xem sau.
          </p>
          <button
            onClick={() => setCurrentView('accounts')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Khám phá tài khoản ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {wishlistedAccounts.map(acc => (
            <AccountCard key={acc.id} account={acc} />
          ))}
        </div>
      )}
    </div>
  );
};
