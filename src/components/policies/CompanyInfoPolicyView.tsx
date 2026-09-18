import React from 'react';
import { Building2, Mail, Phone, MapPin, Hash, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { PolicyLayout } from './PolicyLayout';

export const CompanyInfoPolicyView: React.FC = () => {
  return (
    <PolicyLayout
      id="thong-tin-chu-quan"
      title="Thông Tin Đơn Vị Chủ Quản Nền Tảng LQMarket"
      subtitle="Minh bạch thông tin pháp lý, cơ quan chủ quản vận hành và các đầu mối liên hệ chính thức của sàn thương mại điện tử LQMarket."
      icon={<Building2 size={24} />}
    >
      {/* Thông tin pháp lý chính thức */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>I. THÔNG TIN PHÁP LÝ ĐƠN VỊ CHỦ QUẢN</span>
        </h2>
        
        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 block uppercase tracking-wider text-[10px] font-bold">Tên đơn vị chủ thể:</span>
              <span className="text-amber-400 font-bold text-sm block">[TÊN CHỦ THỂ]</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 block uppercase tracking-wider text-[10px] font-bold">Mã số thuế doanh nghiệp / Hộ KD:</span>
              <span className="text-white font-mono font-bold text-sm block">[MST]</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1 sm:col-span-2">
              <span className="text-slate-500 block uppercase tracking-wider text-[10px] font-bold">Địa chỉ trụ sở / Địa chỉ liên hệ:</span>
              <span className="text-slate-200 text-xs block font-medium">[ĐỊA CHỈ]</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 block uppercase tracking-wider text-[10px] font-bold">Hộp thư điện tử (Email):</span>
              <span className="text-emerald-400 font-mono text-xs block font-bold">[EMAIL]</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 block uppercase tracking-wider text-[10px] font-bold">Hotline / Số điện thoại hỗ trợ:</span>
              <span className="text-amber-400 font-bold text-sm block">[SỐ ĐIỆN THOẠI]</span>
            </div>
          </div>
        </div>
      </section>

      {/* Lĩnh vực hoạt động */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>II. LĨNH VỰC HOẠT ĐỘNG CHÍNH</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Đơn vị chủ quản vận hành nền tảng thương mại điện tử <strong>LQMarket</strong> nhằm mục đích:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
            <li>Cung cấp sàn thương mại điện tử kết nối giao dịch tài khoản trò chơi trực tuyến Liên Quân Mobile (Arena of Valor) giữa các thành viên.</li>
            <li>Cung cấp hạ tầng kỹ thuật trung gian ký quỹ Escrow bảo đảm giữ tiền và giải ngân giao dịch an toàn 100%.</li>
            <li>Cung cấp dịch vụ trọng tài độc lập xử lý tranh chấp, khiếu nại và bảo vệ quyền lợi hợp pháp của người tiêu dùng trên môi trường số.</li>
          </ul>
        </div>
      </section>

      {/* Cam kết tuân thủ pháp luật */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>III. CAM KẾT TUÂN THỦ PHÁP LUẬT VIỆT NAM</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Đơn vị chủ quản cam kết thực hiện đầy đủ nghĩa vụ thuế đối với Nhà nước, tuân thủ các quy định hiện hành về thương mại điện tử, bảo vệ dữ liệu cá nhân (Nghị định 13/2023/NĐ-CP) và an toàn an ninh mạng của Nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.
          </p>
          <p>
            Mọi phản ánh, văn bản pháp lý hoặc liên hệ từ các cơ quan hữu quan xin vui lòng gửi về trụ sở hoặc hộp thư điện tử chính thức: <span className="text-amber-400 font-mono">[EMAIL]</span>.
          </p>
        </div>
      </section>
    </PolicyLayout>
  );
};
