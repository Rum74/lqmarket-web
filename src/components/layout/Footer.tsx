import React from 'react';
import { ShieldCheck, Zap, Headphones, RefreshCw, Award, Lock, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LQMARKET_LOGO } from '../../assets/logo';

export const Footer: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-sm mt-16">
      {/* Top Value Propositions */}
      <div className="border-b border-slate-800/80 py-8 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Giao Dịch Trung Gian</h4>
                <p className="text-[11px] text-slate-400">Giữ tiền an toàn 100% qua hệ thống Escrow</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Bàn Giao Tức Thì</h4>
                <p className="text-[11px] text-slate-400">Nhận mật khẩu và thông tin acc trong 5s</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Bảo Hành 1 Đổi 1</h4>
                <p className="text-[11px] text-slate-400">Cam kết đúng mô tả, hoàn tiền 100% nếu lỗi</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Hỗ Trợ 24/7</h4>
                <p className="text-[11px] text-slate-400">Admin & Đội ngũ CSKH trực tuyến liên tục</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <img
                src={LQMARKET_LOGO}
                alt="LQMarket Logo"
                referrerPolicy="no-referrer"
                className="w-9 h-9 min-w-[36px] min-h-[36px] aspect-square rounded-full object-cover shadow-md shadow-amber-500/20 border border-amber-500/40 shrink-0"
              />
              <span className="text-lg font-black tracking-tight text-white">
                LQ<span className="text-amber-400">MARKET</span>
                <span className="ml-1.5 text-xs text-amber-400 font-mono font-bold bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                  cholienquan.com
                </span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sàn giao dịch và marketplace tài khoản Liên Quân Mobile (Arena of Valor) uy tín hàng đầu - Chợ Liên Quân (cholienquan.com). Nền tảng kết nối người mua và người bán với cơ chế trung gian an toàn tuyệt đối.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg w-fit">
              <Lock className="w-3.5 h-3.5" />
              <span>Bảo mật SSL 256-bit & Escrow</span>
            </div>
          </div>

          {/* Col 2: Fast Navigation */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Danh Mục Mua Acc</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setCurrentView('accounts')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Acc Cao Thủ / Chiến Tướng
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('accounts')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Acc Siêu Skin SSS Thứ Nguyên
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('accounts')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Acc Trắng Thông Tin 100%
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('accounts')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Acc Giá Rẻ Dưới 200k
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('accounts')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Acc Full Tướng / Full Ngọc 90
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Policy & Guide */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Hỗ Trợ & Hướng Dẫn</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setCurrentView('guide')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Quy Trình Giao Dịch Trung Gian
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('guide')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Cách Đổi Mật Khẩu & SĐT Garena
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('guide')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Chính Sách Hoàn Tiền & Khiếu Nại
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('sell')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Quy Định Đăng Bán Dành Cho Seller
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('guide')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Bảng Phí Sàn & Gói VIP Seller
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Payment Partners & Hotline */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Thanh Toán & Liên Hệ</h3>
            <p className="text-xs text-slate-400 mb-2">Hỗ trợ nạp rút tự động 24/7 qua QR Pay:</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              <span className="text-[11px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-1 rounded font-medium">VietQR</span>
              <span className="text-[11px] bg-pink-950/40 border border-pink-800/40 text-pink-300 px-2 py-1 rounded font-medium">MoMo</span>
              <span className="text-[11px] bg-blue-950/40 border border-blue-800/40 text-blue-300 px-2 py-1 rounded font-medium">MB Bank</span>
              <span className="text-[11px] bg-green-950/40 border border-green-800/40 text-green-300 px-2 py-1 rounded font-medium">Vietcombank</span>
              <span className="text-[11px] bg-red-950/40 border border-red-800/40 text-red-300 px-2 py-1 rounded font-medium">Techcombank</span>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-1">
              <span className="text-slate-400 block text-[10px]">Hotline / Zalo Khiếu Nại 24/7:</span>
              <a
                href="tel:0966923416"
                className="text-amber-400 hover:text-amber-300 font-black text-sm block tracking-wide transition-colors"
              >
                0966 923 416
              </a>
              <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                <a
                  href="https://zalo.me/0966923416"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                >
                  <ExternalLink size={10} /> Chat Zalo hỗ trợ
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 text-[11px] text-slate-400 text-center leading-relaxed">
          <p>
            Tuyên bố miễn trừ trách nhiệm: LQMarket là nền tảng sàn thương mại điện tử độc lập phục vụ việc kết nối giao dịch giữa các cá nhân game thủ. LQMarket không liên kết chính thức hoặc được tài trợ bởi Garena / Tencent Games. Tên thương hiệu và hình ảnh Liên Quân Mobile thuộc quyền sở hữu của các bên liên quan.
          </p>
          <p className="mt-2 text-slate-400">
            © {new Date().getFullYear()} LQMarket.vn - Sàn Giao Dịch Acc Liên Quân Uy Tín Hàng Đầu. (Hệ thống v2.5 - Cập nhật 5% Phí Sàn)
          </p>
        </div>
      </div>
    </footer>
  );
};
