import React from 'react';
import {
  ShieldCheck,
  Lock,
  Zap,
  HelpCircle,
  Clock,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Phone,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const GuideView: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <div className="space-y-10 pb-12 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="text-center space-y-3 p-6 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
          <ShieldCheck size={14} />
          <span>CẨM NANG & CHÍNH SÁCH BẢO VỆ GIAO DỊCH</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          HƯỚNG DẪN MUA BÁN & ĐỔI MẬT KHẨU GARENA AN TOÀN
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          Tìm hiểu quy trình giao dịch trung gian Escrow, cách thức bảo mật tài khoản Liên Quân sau khi mua và các chính sách giải quyết khiếu nại.
        </p>
      </div>

      {/* Section 1: Escrow Explained */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Lock size={20} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">1. Cơ Chế Giao Dịch Trung Gian (Escrow) Là Gì?</h2>
            <p className="text-xs text-slate-400">Bảo đảm người mua không bị lừa và người bán nhận đủ tiền.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <strong className="text-amber-400 block text-sm">Bước 1: Giữ tiền an toàn</strong>
            <p className="text-slate-400 leading-relaxed">
              Khi khách bấm Mua Ngay, số tiền sẽ được đóng băng trong tài khoản trung gian của sàn LQMarket. Người bán không thể rút tiền ngay.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <strong className="text-cyan-400 block text-sm">Bước 2: Cấp mật khẩu ngay</strong>
            <p className="text-slate-400 leading-relaxed">
              Hệ thống tự động hiển thị tên tài khoản, mật khẩu và ghi chú bảo mật trên màn hình đơn hàng trong vòng 5 giây.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <strong className="text-emerald-400 block text-sm">Bước 3: Khách xác nhận</strong>
            <p className="text-slate-400 leading-relaxed">
              Khách vào game kiểm tra đúng rank, skin, đổi pass. Khi bấm [Xác nhận nhận acc], tiền mới được thanh toán vào ví của Seller.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Step-by-step password change */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <KeyRound size={20} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">2. Hướng Dẫn Đổi Thông Tin Garena Chi Tiết</h2>
            <p className="text-xs text-slate-400">Thực hiện ngay sau khi nhận thông tin đăng nhập từ hệ thống.</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">1</span>
            <div>
              <strong className="text-white block">Truy cập trang quản lý tài khoản chính thức:</strong>
              <p className="text-slate-400 mt-0.5">Vào website <span className="text-amber-400 font-mono">account.garena.com</span> và đăng nhập với tài khoản & mật khẩu vừa nhận.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">2</span>
            <div>
              <strong className="text-white block">Đổi mật khẩu mới:</strong>
              <p className="text-slate-400 mt-0.5">Vào mục <em>Bảo mật</em> → Chọn <em>Thay đổi Mật khẩu</em>. Đặt mật khẩu gồm chữ hoa, chữ thường, số và ký tự đặc biệt.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">3</span>
            <div>
              <strong className="text-white block">Liên kết Số Điện Thoại & Email của bạn:</strong>
              <p className="text-slate-400 mt-0.5">Đối với nick trắng thông tin, hãy liên kết ngay số điện thoại chính chủ của bạn để bảo vệ acc 100% vĩnh viễn.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">4</span>
            <div>
              <strong className="text-white block">Đăng xuất tất cả thiết bị cũ:</strong>
              <p className="text-slate-400 mt-0.5">Bấm nút "Đăng xuất khỏi tất cả phiên đăng nhập khác" để đảm bảo chỉ có thiết bị của bạn truy cập.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Policies & FAQ */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <FileText size={18} className="text-purple-400" />
          <span>3. Câu Hỏi Thường Gặp (FAQ) & Phí Sàn</span>
        </h2>

        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <strong className="text-amber-300 block">Q: Người mua có mất phí trung gian không?</strong>
            <p className="text-slate-400">A: Không. Người mua được miễn phí 100% phí giao dịch.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <strong className="text-amber-300 block">Q: Phí sàn đối với người bán là bao nhiêu?</strong>
            <p className="text-slate-400">A: Phí sàn cố định là 5% trên mỗi giao dịch thành công để duy trì hệ thống kiểm duyệt và quỹ bảo hiểm rủi ro.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <strong className="text-amber-300 block">Q: Nếu tài khoản nhận được sai mật khẩu thì phải làm sao?</strong>
            <p className="text-slate-400">A: Trong trang Quản lý đơn hàng, bạn chỉ cần bấm nút [Khiếu Nại Lỗi]. Hệ thống sẽ giữ nguyên tiền và Admin sẽ can thiệp hoàn tiền 100% cho bạn.</p>
          </div>
        </div>
      </div>

      {/* Section 4: 24/7 Hotline & Dispute Support */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-left">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
            <Phone size={26} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">KÊNH HỖ TRỢ & KHIẾU NẠI TRỰC TIẾP 24/7</span>
            <h3 className="text-lg font-black text-white">Hotline / Zalo: 0966 923 416</h3>
            <p className="text-xs text-slate-400 mt-0.5">Tiếp nhận khiếu nại đơn hàng, hỗ trợ nạp rút và bảo hiểm Escrow</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          <a
            href="tel:0966923416"
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
          >
            <Phone size={14} /> Gọi Hotline
          </a>
          <a
            href="https://zalo.me/0966923416"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/20"
          >
            <ExternalLink size={14} /> Chat Zalo
          </a>
        </div>
      </div>
    </div>
  );
};
