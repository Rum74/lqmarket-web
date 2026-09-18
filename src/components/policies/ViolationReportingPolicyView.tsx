import React from 'react';
import { Flag, AlertTriangle, Phone, Mail, MessageSquare, ShieldAlert, CheckCircle, ExternalLink } from 'lucide-react';
import { PolicyLayout } from './PolicyLayout';
import { useApp } from '../../context/AppContext';

export const ViolationReportingPolicyView: React.FC = () => {
  const { setIsChatOpen } = useApp();

  const violationTypes = [
    {
      title: 'Lừa đảo & Chiếm đoạt tài sản',
      desc: 'Hành vi lừa đảo thu hồi acc sau khi bán, gửi thông tin giả mạo hoặc lừa nạp tiền ngoài hệ thống.'
    },
    {
      title: 'Gian lận thanh toán & Nạp rút',
      desc: 'Sử dụng thẻ ngân hàng bất hợp pháp, rửa tiền, tạo đơn ảo nhằm trục lợi khuyến mãi hoặc gian lận voucher.'
    },
    {
      title: 'Tài khoản nghi bị trộm cắp / Hack',
      desc: 'Phát hiện tài khoản game của bạn hoặc của người khác đang bị kẻ gian rao bán trái phép trên sàn.'
    },
    {
      title: 'Thông tin sản phẩm sai lệch / Treo đầu dê bán thịt chó',
      desc: 'Rao bán acc trắng thông tin nhưng dính SĐT, khai khống rank, thiếu skin so với mô tả hoặc hình ảnh giả mạo.'
    },
    {
      title: 'Người bán (Seller) vi phạm quy chế',
      desc: 'Seller không bàn giao tài khoản, có thái độ đe dọa, xúc phạm khách hàng hoặc né tránh trách nhiệm bảo hành.'
    },
    {
      title: 'Nội dung phản cảm, độc hại',
      desc: 'Mô tả hoặc hình ảnh đăng bán chứa nội dung vi phạm thuần phong mỹ tục, từ ngữ thô tục hoặc kích động bạo lực.'
    },
    {
      title: 'Xâm phạm quyền sở hữu trí tuệ',
      desc: 'Sử dụng trái phép logo, hình ảnh bản quyền hoặc mạo danh tổ chức/cá nhân khác.'
    },
    {
      title: 'Giao dịch ngoài sàn (Giao dịch chui)',
      desc: 'Các hành vi nhắn tin gạ gẫm chuyển khoản trực tiếp qua ngân hàng hoặc ví cá nhân để trốn phí và lừa đảo.'
    }
  ];

  return (
    <PolicyLayout
      id="bao-cao-vi-pham"
      title="Chính Sách Tiếp Nhận & Xử Lý Báo Cáo Vi Phạm"
      subtitle="Hướng dẫn người dùng nhận diện và gửi báo cáo về các hành vi vi phạm quy chế, gian lận, lừa đảo hoặc vi phạm bản quyền trên nền tảng LQMarket."
      icon={<Flag size={24} />}
    >
      {/* 1. Các hành vi cần báo cáo */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>I. CÁC HÀNH VI CẦN BÁO CÁO NGAY</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          LQMarket khuyến khích cộng đồng thành viên chung tay xây dựng môi trường giao dịch văn minh, an toàn bằng cách báo cáo ngay khi phát hiện các dấu hiệu vi phạm sau:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {violationTypes.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <strong className="text-rose-400 flex items-center gap-2 text-sm">
                <AlertTriangle size={15} /> {item.title}
              </strong>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Các kênh tiếp nhận báo cáo chính thức */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>II. CÁC KÊNH TIẾP NHẬN BÁO CÁO CHÍNH THỨC</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Khi phát hiện vi phạm, bạn có thể gửi thông tin báo cáo qua một trong các kênh hỗ trợ trực tiếp hiện có của LQMarket:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Phone size={18} />
            </div>
            <strong className="text-white block text-sm">Hotline / Zalo Khẩn Cấp</strong>
            <p className="text-xs text-slate-400">Tiếp nhận báo cáo các vụ việc lừa đảo, chiếm đoạt tài sản khẩn cấp 24/7:</p>
            <a href="tel:0966923416" className="text-amber-400 font-black text-sm block hover:underline">
              0966 923 416
            </a>
            <a
              href="https://zalo.me/0966923416"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyan-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Chat Zalo hỗ trợ</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Mail size={18} />
            </div>
            <strong className="text-white block text-sm">Hộp Thư Báo Cáo Vi Phạm</strong>
            <p className="text-xs text-slate-400">Gửi email kèm chứng cứ văn bản, hình ảnh hoặc yêu cầu pháp lý:</p>
            <span className="text-emerald-400 font-mono text-xs block font-bold">
              [EMAIL]
            </span>
            <span className="text-[11px] text-slate-500 block">Thời gian phản hồi: 2 - 12 giờ</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <MessageSquare size={18} />
            </div>
            <strong className="text-white block text-sm">Live Chat Trực Tuyến</strong>
            <p className="text-xs text-slate-400">Trò chuyện trực tiếp với CSKH sàn qua cửa sổ chat trên website:</p>
            <button
              onClick={() => setIsChatOpen(true)}
              className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Mở Khung Chat Sàn
            </button>
          </div>
        </div>
      </section>

      {/* 3. Nội dung cần chuẩn bị khi gửi báo cáo */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>III. NỘI DUNG CẦN CUNG CẤP TRONG BÁO CÁO</span>
        </h2>
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>Để LQMarket có thể xử lý vi phạm nhanh chóng và chính xác nhất, người báo cáo vui lòng cung cấp:</p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-400 pl-1">
            <li><strong>Mã sản phẩm hoặc Link bài đăng vi phạm</strong> (hoặc Mã đơn hàng nếu đã giao dịch).</li>
            <li><strong>Tên hiển thị / ID của Seller hoặc tài khoản có hành vi gian lận.</strong></li>
            <li><strong>Mô tả chi tiết hành vi vi phạm:</strong> Sự việc diễn ra như thế nào, vào thời gian nào.</li>
            <li><strong>Tài liệu chứng minh:</strong> Ảnh chụp màn hình tin nhắn, video quay màn hình, biên lai chuyển tiền hoặc các bằng chứng liên quan.</li>
          </ul>
        </div>
      </section>

      {/* 4. Quy trình xử lý báo cáo */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>IV. QUY TRÌNH XỬ LÝ & BẢO VỆ NGƯỜI BÁO CÁO</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            <strong>4.1. Cam kết bảo mật danh tính:</strong> LQMarket cam kết giữ kín tuyệt đối danh tính, số điện thoại và thông tin cá nhân của người gửi báo cáo vi phạm, không để lộ cho bên bị báo cáo nhằm tránh các hành vi trả thù.
          </p>
          <p>
            <strong>4.2. Thời hạn xử lý:</strong> Đội ngũ Giám sát nội dung sẽ tiến hành xác minh trong vòng <strong>2 giờ đến 24 giờ</strong> kể từ lúc tiếp nhận. Nếu vi phạm có cơ sở rõ ràng, sàn sẽ lập tức gỡ bỏ sản phẩm, đóng băng tài khoản vi phạm và thông báo kết quả cho người báo cáo.
          </p>
        </div>
      </section>
    </PolicyLayout>
  );
};
