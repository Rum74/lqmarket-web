import React from 'react';
import { UserCheck, ShieldCheck, AlertTriangle, CheckCircle, ExternalLink, HelpCircle, FileText } from 'lucide-react';
import { PolicyLayout } from './PolicyLayout';
import { useApp } from '../../context/AppContext';

export const BuyerPolicyView: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <PolicyLayout
      id="chinh-sach-nguoi-mua"
      title="Chính Sách Dành Cho Người Mua (Buyer Policy)"
      subtitle="Quy định toàn diện về quyền lợi, nghĩa vụ, hướng dẫn nhận tài khoản, quy trình kiểm tra và cơ chế bảo vệ tài chính cho người mua tại LQMarket."
      icon={<UserCheck size={24} />}
    >
      {/* 1. Quyền lợi của Người Mua */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>I. QUYỀN LỢI CỦA NGƯỜI MUA</span>
        </h2>
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>Khi thực hiện giao dịch mua tài khoản Liên Quân Mobile trên LQMarket, Người Mua được bảo đảm các quyền lợi sau:</p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-400 pl-1">
            <li><strong>Bảo vệ tiền ký quỹ Escrow 100%:</strong> Số tiền thanh toán của bạn sẽ được giữ an toàn tại tài khoản trung gian của sàn và người bán không thể rút tiền cho đến khi bạn xác nhận hài lòng hoặc hết thời hạn bảo hành.</li>
            <li><strong>Nhận thông tin đăng nhập tức thì:</strong> Nhận tài khoản, mật khẩu và thông tin liên quan chỉ sau 5 giây thanh toán thành công trực tiếp trên màn hình đơn hàng.</li>
            <li><strong>Quyền kiểm tra và đối soát:</strong> Được quyền đăng nhập kiểm tra bậc xếp hạng (rank), số tướng, số trang phục (skin) thực tế so với thông tin mô tả của Người Bán.</li>
            <li><strong>Quyền khiếu nại & hoàn tiền:</strong> Được quyền bấm nút khiếu nại đóng băng giao dịch và yêu cầu hoàn trả 100% tiền nếu tài khoản sai mật khẩu, bị khóa hoặc sai lệch so với bài đăng bán.</li>
          </ul>
        </div>
      </section>

      {/* 2. Nghĩa vụ của Người Mua */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>II. NGHĨA VỤ CỦA NGƯỜI MUA</span>
        </h2>
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>Để đảm bảo quyền lợi tối đa và làm căn cứ pháp lý giải quyết tranh chấp, Người Mua có nghĩa vụ:</p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-400 pl-1">
            <li><strong>Kiểm tra thông tin trước khi mua:</strong> Đọc kỹ thông số tài khoản (tình trạng liên kết SĐT, Email, CMND, bậc rank, tướng tủ) trước khi nhấn nút "Mua Ngay".</li>
            <li><strong>BẮT BUỘC quay video màn hình nhận acc:</strong> Bắt đầu quay video màn hình liên tục không ngắt quãng từ trước khi bấm mở thông tin tài khoản trên LQMarket cho đến lúc đăng nhập vào game lần đầu tiên. Video này là bằng chứng bắt buộc để sàn hỗ trợ hoàn tiền nếu mật khẩu sai.</li>
            <li><strong>Đổi mật khẩu & cài đặt bảo mật ngay:</strong> Thực hiện ngay việc đổi mật khẩu mới, cập nhật email/SĐT bảo mật cá nhân trên cổng Garena chính thức (account.garena.com) ngay sau khi đăng nhập thành công.</li>
            <li><strong>Bảo mật thông tin:</strong> Tự chịu trách nhiệm bảo mật tài khoản game sau khi đã tiếp nhận bàn giao thành công; tuyệt đối không chia sẻ cho bên thứ ba hoặc đăng nhập trên các thiết bị không an toàn.</li>
          </ul>
        </div>
      </section>

      {/* 3. Quy định kiểm tra & Giao dịch */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>III. QUY ĐỊNH GIAO DỊCH & BÀN GIAO</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            <strong>3.1. Kênh giao dịch hợp lệ:</strong> Tất cả giao dịch mua tài khoản phải được thực hiện trực tiếp thông qua hệ thống website LQMarket. Mọi thỏa thuận, giao dịch riêng qua Zalo, Facebook, chuyển tiền ngoài hệ thống đều bị nghiêm cấm và LQMarket hoàn toàn từ chối trách nhiệm giải quyết rủi ro phát sinh.
          </p>
          <p>
            <strong>3.2. Thời hạn kiểm tra & Khiếu nại:</strong> Người Mua có thời hạn <strong>24 giờ</strong> kể từ lúc nhận thông tin tài khoản để kiểm tra thực tế và gửi khiếu nại (nếu có sự cố). Sau 24 giờ, nếu Người Mua không khiếu nại, hệ thống sẽ tự động hoàn tất đơn hàng và giải ngân tiền cho Người Bán.
          </p>
        </div>
      </section>

      {/* 4. Quy trình Báo lỗi, Khiếu nại & Hoàn tiền */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>IV. QUY TRÌNH BÁO LỖI, KHIẾU NẠI & HOÀN TIỀN</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>Khi phát sinh sự cố về tài khoản vừa mua, Người Mua thực hiện theo quy trình sau:</p>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-400 pl-1">
            <li>Truy cập mục <strong>Đơn hàng của tôi</strong> trên thanh điều hướng website.</li>
            <li>Bấm chọn đơn hàng có sự cố và nhấn nút <strong>[Khiếu Nại Đơn Hàng]</strong>.</li>
            <li>Ghi rõ lý do khiếu nại (Sai mật khẩu, Bị khóa game, Sai mô tả skin/rank) và tải lên video quay màn hình chứng minh.</li>
            <li>Hệ thống lập tức đóng băng số tiền đơn hàng và chuyển cho Đội ngũ Trọng tài LQMarket xác minh trong vòng 2 - 24 giờ.</li>
          </ol>

          {/* Direct Link to Existing Refund Policy */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 mt-2">
            <div className="space-y-1">
              <strong className="text-amber-400 text-sm block">Xem chi tiết Chính Sách Hoàn Tiền & Khiếu Nại hiện hành:</strong>
              <p className="text-slate-400 text-xs">Tham khảo chi tiết điều kiện hoàn tiền 100%, thời gian xử lý và bảng tỷ lệ hỗ trợ bồi thường.</p>
            </div>
            <button
              onClick={() => {
                setCurrentView('guide');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <span>Xem Chính Sách Hoàn Tiền</span>
              <ExternalLink size={13} />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Các hành vi bị cấm đối với Người Mua */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-rose-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>V. CÁC HÀNH VI BỊ CẤM ĐỐI VỚI NGƯỜI MUA</span>
        </h2>
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
            <li>Cố tình đổi thông tin tài khoản thành công nhưng quay video giả mạo thông báo mật khẩu sai để chiếm đoạt tiền và acc.</li>
            <li>Sử dụng phần mềm can thiệp (hack, map, mod skin), nạp quân huy lậu dẫn đến tài khoản bị nhà phát hành khóa rồi yêu cầu hoàn tiền.</li>
            <li>Thực hiện hành vi lăng mạ, đe dọa hoặc tống tiền Người Bán hay nhân viên hỗ trợ của sàn.</li>
            <li>Lợi dụng kẽ hở hệ thống để gian lận tiền thưởng giới thiệu hoặc voucher giảm giá.</li>
          </ul>
          <p className="text-rose-400 font-medium pt-1">
            Người mua vi phạm các quy định trên sẽ bị khóa tài khoản vĩnh viễn, tịch thu toàn bộ số dư và chuyển thông tin cho cơ quan chức năng xử lý nếu gây thiệt hại nghiêm trọng.
          </p>
        </div>
      </section>
    </PolicyLayout>
  );
};
