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
        <div className="w-full max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-8">
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
      <div className="w-full max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <img
                src={LQMARKET_LOGO}
                alt="LQMarket Logo"
                referrerPolicy="no-referrer"
                className="w-9 h-9 min-w-[36px] min-h-[36px] aspect-square rounded-full object-cover shadow-md shadow-amber-500/20 border border-amber-500/40 shrink-0"
              />
              <span className="text-lg font-black tracking-tight text-white">
                LQ<span className="text-amber-400">MARKET</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sàn giao dịch và marketplace tài khoản Liên Quân Mobile (Arena of Valor) uy tín hàng đầu. Nền tảng kết nối người mua và người bán với cơ chế trung gian an toàn tuyệt đối.
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
              <li>
                <button
                  onClick={() => setCurrentView('referral')}
                  className="text-amber-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Giới Thiệu Bạn Bè (Nhận Thưởng)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Chính Sách & Quy Định Mới */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Chính Sách & Quy Định</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => {
                    setCurrentView('quy_che_hoat_dong');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Quy chế hoạt động
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('dieu_khoan_su_dung');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Điều khoản sử dụng
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('chinh_sach_nguoi_mua');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Chính sách người mua
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('chinh_sach_bao_mat');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Chính sách bảo mật
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('chinh_sach_tai_khoan_game');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Chính sách tài khoản game
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('giai_quyet_tranh_chap');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Giải quyết tranh chấp
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('bao_cao_vi_pham');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Báo cáo vi phạm
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('so_huu_tri_tue');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Sở hữu trí tuệ
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('thong_tin_chu_quan');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Thông tin chủ quản
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Payment Partners & Hotline */}
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
            Tuyên bố miễn trừ trách nhiệm: LQMarket là nền tảng thương mại điện tử độc lập hỗ trợ kết nối giao dịch giữa người mua và người bán tài khoản game. LQMarket không liên kết chính thức, không được bảo trợ hoặc tài trợ bởi Garena / Tencent Games. Liên Quân Mobile và các tên thương hiệu, hình ảnh liên quan thuộc quyền sở hữu của các chủ thể tương ứng.
          </p>
          <p className="mt-2 text-slate-400">
            © 2026 LQMarket.vn – Nền tảng giao dịch tài khoản Liên Quân Mobile.
          </p>
        </div>
      </div>
    </footer>
  );
};
