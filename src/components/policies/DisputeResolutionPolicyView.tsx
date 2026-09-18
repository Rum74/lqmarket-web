import React from 'react';
import { Scale, CheckCircle2, AlertCircle, FileCheck, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { PolicyLayout } from './PolicyLayout';

export const DisputeResolutionPolicyView: React.FC = () => {
  const steps = [
    {
      step: 1,
      title: '1. Gửi yêu cầu khiếu nại / tranh chấp',
      desc: 'Người mua hoặc người bán bấm nút [Khiếu nại] trong trang chi tiết đơn hàng hoặc liên hệ Hotline/Zalo CSKH của sàn trong thời hạn bảo hành 24 giờ kể từ khi bàn giao.'
    },
    {
      step: 2,
      title: '2. LQMarket tiếp nhận & đóng băng tiền',
      desc: 'Hệ thống lập tức kích hoạt trạng thái "Tranh chấp", phong tỏa 100% số tiền giao dịch tại ví ký quỹ Escrow nhằm bảo toàn tài sản, không cho phép giải ngân hay rút tiền.'
    },
    {
      step: 3,
      title: '3. Các bên cung cấp chứng cứ hợp lệ',
      desc: 'Người Mua cung cấp video quay màn hình liền mạch từ lúc mở đơn hàng đến lúc đăng nhập vào game; Người Bán cung cấp lịch sử tạo acc, ảnh chụp thông tin gốc và xác nhận bảo mật.'
    },
    {
      step: 4,
      title: '4. LQMarket kiểm tra dữ liệu kỹ thuật',
      desc: 'Đội ngũ Trọng tài LQMarket đối chiếu log bàn giao hệ thống, thời gian đăng nhập lần đầu, kiểm tra tình trạng tài khoản trên cổng Garena và lịch sử trao đổi của hai bên.'
    },
    {
      step: 5,
      title: '5. Xác định hướng xử lý theo Quy chế',
      desc: 'Căn cứ vào chứng cứ thực tế và quy định tại Quy Chế Hoạt Động, Trọng tài đưa ra phán quyết khách quan: Lỗi thuộc về Người Bán, Lỗi thuộc về Người Mua, hoặc do lỗi hệ thống.'
    },
    {
      step: 6,
      title: '6. Thông báo kết quả chính thức',
      desc: 'Hệ thống gửi thông báo phân giải bằng văn bản kèm lý do chi tiết đến cả hai bên thông qua thông báo trên web và tin nhắn Zalo/Hotline hỗ trợ.'
    },
    {
      step: 7,
      title: '7. Thực hiện thi hành phán quyết',
      desc: 'Hoàn trả 100% tiền về ví Người Mua (nếu Seller vi phạm hoặc acc lỗi); hoặc giải ngân tiền cho Seller (nếu Người Mua khiếu nại vô căn cứ hoặc cố tình phá hoại); áp dụng chế tài xử phạt nếu có.'
    }
  ];

  return (
    <PolicyLayout
      id="giai-quyet-tranh-chap"
      title="Chính Sách Giải Quyết Tranh Chấp & Khiếu Nại"
      subtitle="Quy trình 7 bước giải quyết tranh chấp minh bạch, công bằng giữa Người Mua và Người Bán dưới sự điều phối trọng tài của LQMarket."
      icon={<Scale size={24} />}
    >
      {/* Nguyên tắc giải quyết tranh chấp */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>I. NGUYÊN TẮC GIẢI QUYẾT TRANH CHẤP</span>
        </h2>
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>
            Tại LQMarket, quyền lợi chính đáng của các bên luôn được đặt lên hàng đầu. Mọi tranh chấp phát sinh trong quá trình mua bán tài khoản Liên Quân Mobile được giải quyết dựa trên các nguyên tắc cơ bản:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
            <li><strong>Thượng tôn chứng cứ:</strong> Mọi phán quyết đều căn cứ vào video quay màn hình, hình ảnh chứng minh và nhật ký hệ thống xác thực.</li>
            <li><strong>Bảo toàn tài chính qua Escrow:</strong> Tiền giao dịch luôn bị đóng băng an toàn trong ví sàn cho tới khi có kết luận cuối cùng.</li>
            <li><strong>Công bằng, không thiên vị:</strong> Trọng tài sàn đóng vai trò trung gian độc lập, bảo vệ lẽ phải và triệt tiêu mọi hành vi gian lận.</li>
            <li><strong>Xử lý nhanh chóng:</strong> Thời gian tiếp nhận và xử lý khiếu nại thông thường từ 2 giờ đến tối đa 24 giờ làm việc.</li>
          </ul>
        </div>
      </section>

      {/* Quy trình 7 bước */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>II. QUY TRÌNH 7 BƯỚC XỬ LÝ TRANH CHẤP CHI TIẾT</span>
        </h2>

        <div className="space-y-3">
          {steps.map((item) => (
            <div key={item.step} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black flex items-center justify-center">
                  {item.step}
                </span>
                <span>{item.title}</span>
              </h3>
              <p className="text-xs text-slate-400 pl-7 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Yêu cầu về bằng chứng hợp lệ */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>III. TIÊU CHUẨN BẰNG CHỨNG HỢP LỆ</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1.5">
              <strong className="text-emerald-400 block text-sm flex items-center gap-1.5">
                <FileCheck size={16} /> Bằng chứng hợp lệ được chấp nhận:
              </strong>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Video quay màn hình liền mạch, không cắt ghép từ lúc bấm mở thông tin đơn hàng trên web đến khi đăng nhập báo lỗi.</li>
                <li>Ảnh chụp rõ ràng thông báo lỗi từ hệ thống Garena chính thức (account.garena.com).</li>
                <li>Ảnh chụp màn hình thông tin nhân vật, bậc rank và bảng skin thực tế trong game đối chiếu với bài đăng.</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-rose-500/30 space-y-1.5">
              <strong className="text-rose-400 block text-sm flex items-center gap-1.5">
                <AlertCircle size={16} /> Bằng chứng KHÔNG hợp lệ:
              </strong>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Video bị cắt đoạn, chỉnh sửa hoặc quay sau khi đã nhận tài khoản nhiều giờ.</li>
                <li>Ảnh chụp mờ, che giấu tên tài khoản hoặc chụp từ thiết bị khác không rõ nguồn gốc.</li>
                <li>Lời khai suông không có bất kỳ tư liệu quay chụp xác thực đi kèm.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Kháng nghị & Hỗ trợ pháp lý */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>IV. QUYỀN KHÁNG NGHỊ & HỖ TRỢ PHÁP LÝ</span>
        </h2>
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>
            Sau khi có thông báo kết quả, nếu một trong hai bên có thêm chứng cứ mới có giá trị thay đổi bản chất vụ việc, có quyền gửi yêu cầu kháng nghị trong vòng <strong>12 giờ</strong> kể từ thời điểm nhận kết quả. Phán quyết sau kháng nghị của Ban Trọng Tài LQMarket là phán quyết cuối cùng trên hệ thống nền tảng.
          </p>
          <p>
            Trường hợp vụ việc có dấu hiệu lừa đảo chiếm đoạt tài sản quy mô lớn, các bên có quyền đưa vụ việc ra Tòa án nhân dân hoặc Cơ quan Công an có thẩm quyền giải quyết theo quy định pháp luật. LQMarket sẽ cung cấp đầy đủ hồ sơ, nhật ký dữ liệu khi nhận được yêu cầu hợp pháp.
          </p>
        </div>
      </section>
    </PolicyLayout>
  );
};
