import React from 'react';
import { BookCheck, ShieldAlert, Scale, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { PolicyLayout } from './PolicyLayout';

export const TermsOfServicePolicyView: React.FC = () => {
  return (
    <PolicyLayout
      id="dieu-khoan-su-dung"
      title="Điều Khoản Sử Dụng Dịch Vụ Nền Tảng LQMarket"
      subtitle="Thỏa thuận pháp lý ràng buộc giữa người dùng và LQMarket quy định về việc truy cập, tạo tài khoản và sử dụng dịch vụ trên hệ thống."
      icon={<BookCheck size={24} />}
    >
      {/* 1. Điều kiện sử dụng website */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>I. ĐIỀU KIỆN SỬ DỤNG WEBSITE</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Bằng việc truy cập, đăng ký tài khoản hoặc sử dụng bất kỳ dịch vụ nào trên website LQMarket, bạn xác nhận rằng bạn đã đọc kỹ, hiểu rõ và đồng ý bị ràng buộc vô điều kiện bởi toàn bộ các điều khoản trong văn bản này cùng Quy chế hoạt động của sàn.
          </p>
          <p>
            Người dùng phải từ đủ 15 tuổi trở lên hoặc có sự đồng ý, giám sát của người đại diện hợp pháp theo pháp luật Việt Nam để thực hiện các giao dịch dân sự trên nền tảng.
          </p>
        </div>
      </section>

      {/* 2. Đăng ký & Trách nhiệm bảo mật tài khoản */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>II. ĐĂNG KÝ TÀI KHOẢN & TRÁCH NHIỆM BẢO MẬT</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            <strong>2.1. Thông tin tài khoản:</strong> Bạn cam kết cung cấp thông tin trung thực, chính xác khi đăng ký thành viên. Nghiêm cấm tạo tài khoản giả mạo người khác.
          </p>
          <p>
            <strong>2.2. Trách nhiệm bảo mật cá nhân:</strong> Bạn chịu trách nhiệm duy trì tính bảo mật của tên đăng nhập và mật khẩu cá nhân. Mọi hoạt động được thực hiện dưới tài khoản của bạn sẽ được xem là do chính bạn thực hiện.
          </p>
          <p>
            <strong>2.3. Thông báo sự cố:</strong> Nếu phát hiện tài khoản bị truy cập trái phép, bạn có nghĩa vụ thông báo ngay lập tức cho bộ phận hỗ trợ của LQMarket qua Hotline để thực hiện các biện pháp bảo vệ khẩn cấp.
          </p>
        </div>
      </section>

      {/* 3. Nội dung người dùng & Hành vi bị cấm */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-rose-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>III. NỘI DUNG NGƯỜI DÙNG & CÁC HÀNH VI BỊ CẤM</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>Khi tham gia cộng đồng LQMarket, người dùng cam kết KHÔNG thực hiện các hành vi sau:</p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-400 pl-1">
            <li>Đăng tải tài khoản game bất hợp pháp, tài khoản bị hack, trộm cắp hoặc có nguồn gốc gian lận.</li>
            <li>Thực hiện hành vi gian dối, tráo pass, thu hồi tài khoản (back acc) sau khi đã hoàn tất bán nhận tiền.</li>
            <li>Giao dịch ngoài hệ sinh thái sàn (dẫn dụ thành viên chat Zalo, Facebook riêng để lừa đảo hoặc trốn phí sàn).</li>
            <li>Tấn công kỹ thuật, khai thác lỗ hổng bảo mật, phát tán virus, mã độc hoặc làm tê liệt hoạt động của máy chủ sàn.</li>
            <li>Đăng tải ngôn từ thù địch, xúc phạm danh dự nhân phẩm của người khác, vi phạm thuần phong mỹ tục hoặc pháp luật Việt Nam.</li>
            <li>Gian lận hệ thống nạp rút, rửa tiền hoặc lợi dụng khuyến mãi trái phép.</li>
          </ul>
        </div>
      </section>

      {/* 4. Tạm khóa & Chấm dứt tài khoản */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>IV. TẠM KHÓA & CHẤM DỨT TÀI KHOẢN</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Ban Quản Trị LQMarket có quyền đơn phương tạm đình chỉ hoặc chấm dứt vĩnh viễn quyền truy cập tài khoản của bạn, đồng thời đóng băng số dư ví để đối soát bồi thường mà không cần báo trước nếu:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
            <li>Bạn vi phạm bất kỳ điều khoản nào trong Điều khoản sử dụng hoặc Quy chế hoạt động.</li>
            <li>Có yêu cầu từ cơ quan công an, tòa án hoặc cơ quan quản lý nhà nước có thẩm quyền.</li>
            <li>Phát hiện các hoạt động gian lận, lừa đảo hoặc gây nguy hại nghiêm trọng đến an toàn của các thành viên khác.</li>
          </ul>
        </div>
      </section>

      {/* 5. Giới hạn trách nhiệm pháp lý */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>V. GIỚI HẠN TRÁCH NHIỆM PHÁP LÝ</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            <strong>5.1. Vai trò trung gian:</strong> LQMarket cung cấp hạ tầng kỹ thuật trung gian ký quỹ Escrow nhằm giảm thiểu rủi ro mua bán giữa cộng đồng game thủ. LQMarket không phải là nhà phát hành trò chơi Liên Quân Mobile và không sở hữu các tài sản ảo trong game.
          </p>
          <p>
            <strong>5.2. Miễn trừ sự kiện bất khả kháng:</strong> Sàn không chịu trách nhiệm bồi thường trong trường hợp máy chủ của nhà phát hành game (Garena/Tencent) bảo trì, cập nhật chính sách khóa tài khoản trên diện rộng, hoặc các sự cố cáp quang quốc tế nằm ngoài tầm kiểm soát hợp lý của sàn.
          </p>
          <p>
            <strong>5.3. Giao dịch ngoài sàn:</strong> LQMarket hoàn toàn miễn trừ mọi trách nhiệm pháp lý và tài chính đối với bất kỳ giao dịch nào được hai bên tự ý thỏa thuận, thanh toán ngoài hệ thống website LQMarket.
          </p>
        </div>
      </section>

      {/* 6. Thay đổi điều khoản, Luật áp dụng & Kênh liên hệ */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>VI. THAY ĐỔI ĐIỀU KHOẢN, LUẬT ÁP DỤNG & LIÊN HỆ</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            <strong>6.1. Thay đổi điều khoản:</strong> LQMarket có quyền điều chỉnh, bổ sung Điều khoản sử dụng bất kỳ lúc nào để phù hợp với pháp luật và thực tiễn hoạt động. Phiên bản cập nhật sẽ được công bố công khai trên website kèm ngày có hiệu lực.
          </p>
          <p>
            <strong>6.2. Luật áp dụng & Giải quyết tranh chấp:</strong> Điều khoản này được điều chỉnh và giải thích theo pháp luật của Nước Cộng hòa Xã hội Chủ nghĩa Việt Nam. Mọi tranh chấp không thể thương lượng hòa giải sẽ được chuyển đến Tòa án có thẩm quyền tại Việt Nam giải quyết.
          </p>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 font-mono">
            <div>• Kênh giải đáp thắc mắc: Ban Pháp Chế LQMarket</div>
            <div>• Hộp thư điện tử: <span className="text-amber-400">[EMAIL]</span></div>
            <div>• Hotline: <span className="text-amber-400">[SỐ ĐIỆN THOẠI]</span></div>
          </div>
        </div>
      </section>
    </PolicyLayout>
  );
};
