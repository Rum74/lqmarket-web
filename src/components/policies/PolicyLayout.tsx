import React, { ReactNode } from 'react';
import {
  ShieldAlert,
  ChevronRight,
  FileText,
  Lock,
  UserCheck,
  Gamepad2,
  Scale,
  Flag,
  Award,
  Building2,
  BookCheck,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface PolicyLayoutProps {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: ReactNode;
}

export const PolicyLayout: React.FC<PolicyLayoutProps> = ({
  id,
  title,
  subtitle,
  icon,
  children
}) => {
  const { currentView, setCurrentView } = useApp();

  const policyNavigation = [
    { key: 'quy_che_hoat_dong', path: '/quy-che-hoat-dong', label: 'Quy Chế Hoạt Động', icon: <FileText size={15} /> },
    { key: 'dieu_khoan_su_dung', path: '/dieu-khoan-su-dung', label: 'Điều Khoản Sử Dụng', icon: <BookCheck size={15} /> },
    { key: 'chinh_sach_nguoi_mua', path: '/chinh-sach-nguoi-mua', label: 'Chính Sách Người Mua', icon: <UserCheck size={15} /> },
    { key: 'chinh_sach_bao_mat', path: '/chinh-sach-bao-mat', label: 'Chính Sách Bảo Mật', icon: <Lock size={15} /> },
    { key: 'chinh_sach_tai-khoan-game', keyAlt: 'chinh_sach_tai_khoan_game', path: '/chinh-sach-tai-khoan-game', label: 'Chính Sách Acc Game', icon: <Gamepad2 size={15} /> },
    { key: 'giai_quyet_tranh_chap', path: '/giai-quyet-tranh-chap', label: 'Giải Quyết Tranh Chấp', icon: <Scale size={15} /> },
    { key: 'bao_cao_vi_pham', path: '/bao-cao-vi-pham', label: 'Báo Cáo Vi Phạm', icon: <Flag size={15} /> },
    { key: 'so_huu_tri_tue', path: '/so-huu-tri-tue', label: 'Sở Hữu Trí Tuệ', icon: <Award size={15} /> },
    { key: 'thong_tin_chu_quan', path: '/thong-tin-chu-quan', label: 'Thông Tin Chủ Quản', icon: <Building2 size={15} /> },
  ];

  return (
    <div id={id} className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pb-3 border-b border-slate-800">
        <button
          onClick={() => setCurrentView('home')}
          className="hover:text-amber-400 transition-colors cursor-pointer"
        >
          Trang chủ
        </button>
        <ChevronRight size={14} className="text-slate-600" />
        <span className="text-slate-300">Chính sách & Quy định</span>
        <ChevronRight size={14} className="text-slate-600" />
        <span className="text-amber-400 font-semibold">{title}</span>
      </nav>

      {/* Main Document Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 md:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
              <ShieldAlert size={14} />
              <span>VĂN BẢN QUY PHẠM & CHÍNH SÁCH CHÍNH THỨC</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 inline-flex">
                {icon}
              </span>
              <span>{title}</span>
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              {subtitle}
            </p>
          </div>

          <div className="shrink-0 p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs space-y-1.5 min-w-[210px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Phiên bản:</span>
              <span className="font-mono font-bold text-amber-400">1.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Ngày cập nhật:</span>
              <span className="font-mono font-medium text-slate-300">18/09/2026</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Hiệu lực:</span>
              <span className="text-emerald-400 font-semibold">Đang áp dụng</span>
            </div>
          </div>
        </div>

        {/* Mandatory Independent Platform Statement */}
        <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3 text-xs text-amber-200/90 leading-relaxed">
          <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>Tuyên bố minh bạch pháp lý:</strong> LQMarket là nền tảng độc lập và không phải website chính thức của Garena hoặc Liên Quân Mobile. LQMarket hoạt động với tư cách là sàn thương mại điện tử trung gian kết nối cộng đồng người dùng và bảo vệ giao dịch qua tài khoản ký quỹ Escrow.
          </div>
        </div>
      </div>

      {/* Main Grid Layout: Policy Navigation Sidebar + Content Body */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Navigation Index Panel */}
        <aside className="lg:col-span-1 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto pr-1 space-y-4">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-2.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
              Hệ Thống Chính Sách
            </h3>
            <div className="space-y-1">
              {policyNavigation.map((item) => {
                const isActive = currentView === item.key || (item.keyAlt && currentView === item.keyAlt);
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      setCurrentView((item.keyAlt || item.key) as any);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className={isActive ? 'text-slate-950' : 'text-slate-400'}>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <div className="text-[11px] text-slate-500 px-2 font-semibold uppercase">Tài liệu khác</div>
              <button
                onClick={() => {
                  setCurrentView('guide');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>Quy trình Escrow & Đổi Pass</span>
                <ChevronRight size={13} />
              </button>
              <button
                onClick={() => {
                  setCurrentView('guide');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>Chính Sách Hoàn Tiền</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </aside>

        {/* Policy Content Body */}
        <div className="lg:col-span-3 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 md:p-10 space-y-8 text-slate-200 text-sm leading-relaxed">
          {children}

          {/* Legal Footer Note on Every Policy */}
          <div className="pt-8 border-t border-slate-800 space-y-3 text-xs text-slate-400">
            <div className="flex flex-wrap items-center justify-between gap-2 text-slate-500">
              <div>Phiên bản: <strong>1.0</strong> | Ngày cập nhật: <strong>18/09/2026</strong></div>
              <div>Ban hành bởi Ban Quản Trị LQMarket</div>
            </div>
            <p className="leading-relaxed">
              Mọi thắc mắc, phản ánh hoặc yêu cầu hỗ trợ liên quan đến văn bản chính sách này, vui lòng liên hệ bộ phận Pháp chế & CSKH LQMarket qua Hotline: <strong className="text-amber-400">[SỐ ĐIỆN THOẠI]</strong> hoặc Hộp thư điện tử: <strong className="text-amber-400">[EMAIL]</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
