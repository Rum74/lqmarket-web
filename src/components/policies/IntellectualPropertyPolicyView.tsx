import React from 'react';
import { Award, ShieldCheck, Copyright, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { PolicyLayout } from './PolicyLayout';

export const IntellectualPropertyPolicyView: React.FC = () => {
  return (
    <PolicyLayout
      id="so-huu-tri-tue"
      title="Chính Sách Quyền Sở Hữu Trí Tuệ & Thương Hiệu"
      subtitle="Quy định về bảo vệ quyền tác giả, nhãn hiệu thương mại và quy chế xử lý vi phạm sở hữu trí tuệ đối với các nội dung trên website LQMarket."
      icon={<Award size={24} />}
    >
      {/* 1. Tuyên bố thương hiệu & Phân biệt nhãn hiệu */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>I. TUYÊN BỐ THƯƠNG HIỆU & KHÔNG GÂY NHẦM LẪN</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 space-y-2">
            <strong className="block text-sm text-amber-400 font-bold flex items-center gap-1.5">
              <AlertTriangle size={16} /> Nguyên tắc minh bạch nhãn hiệu:
            </strong>
            <p>
              LQMarket là tên thương mại và dịch vụ độc lập của đơn vị chủ quản <strong>[TÊN CHỦ THỂ]</strong>. LQMarket tuyên bố không có mối quan hệ liên kết đại lý, tài trợ hoặc sở hữu đối với các thương hiệu "Liên Quân Mobile", "Arena of Valor", "Garena", "Tencent Games".
            </p>
            <p className="text-slate-400">
              Các tên gọi, logo, biểu tượng, hình ảnh nhân vật trò chơi và tài nguyên đồ họa thuộc trò chơi Liên Quân Mobile thuộc quyền sở hữu trí tuệ hợp pháp của Garena Online Private Limited và Tencent Holdings Ltd. Việc sử dụng tên gọi trên website LQMarket chỉ mang tính chất mô tả định danh sản phẩm phục vụ nhu cầu trao đổi hợp pháp giữa cộng đồng người dùng.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Tài sản sở hữu trí tuệ của LQMarket */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>II. TÀI SẢN SỞ HỮU TRÍ TUỆ CỦA LQMARKET</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>Tất cả các tài sản số dưới đây thuộc quyền sở hữu độc quyền của Ban Quản Trị LQMarket:</p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-400 pl-1">
            <li><strong>Nhãn hiệu & Nhận diện thương hiệu:</strong> Logo LQMarket, slogan, phối màu nhận diện và các tài sản thiết kế đồ họa độc quyền của sàn.</li>
            <li><strong>Mã nguồn & Cấu trúc hệ thống:</strong> Toàn bộ mã nguồn trang web, thuật toán kiểm duyệt tự động, cơ chế tích hợp ký quỹ Escrow, giao diện người dùng (UI/UX).</li>
            <li><strong>Nội dung biên soạn:</strong> Các bài viết hướng dẫn, cẩm nang leo rank, điều khoản dịch vụ và văn bản quy chế do LQMarket xuất bản.</li>
          </ul>
          <p className="text-slate-400 pt-1">
            Mọi hành vi sao chép, trích xuất mã nguồn, nhân bản giao diện web hoặc sử dụng nhãn hiệu LQMarket cho mục đích thương mại mà chưa có sự đồng ý bằng văn bản đều cấu thành hành vi xâm phạm quyền sở hữu trí tuệ.
          </p>
        </div>
      </section>

      {/* 3. Trách nhiệm của người dùng khi tải nội dung */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>III. TRÁCH NHIỆM CỦA NGƯỜI DÙNG ĐỐI VỚI NỘI DUNG ĐĂNG TẢI</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            <strong>3.1. Quyền sở hữu nội dung đăng tải:</strong> Thành viên chịu trách nhiệm hoàn toàn về hình ảnh, mô tả sản phẩm hoặc nội dung bình luận do mình tải lên hệ thống.
          </p>
          <p>
            <strong>3.2. Không xâm phạm quyền của bên thứ ba:</strong> Nghiêm cấm người dùng tải lên hình ảnh có bản quyền của tác giả khác, ảnh cá nhân của người khác mà không có sự đồng ý, hoặc nội dung mạo danh logo, huy hiệu của các tổ chức nhà nước hay doanh nghiệp khác.
          </p>
          <p>
            <strong>3.3. Cấp quyền hiển thị:</strong> Khi đăng bài trên sàn, Người Bán cấp quyền miễn phí, không độc quyền cho LQMarket được sử dụng hình ảnh sản phẩm để hiển thị, quảng bá bài đăng trong khuôn khổ dịch vụ của sàn.
          </p>
        </div>
      </section>

      {/* 4. Cơ chế thông báo và gỡ bỏ nội dung vi phạm (Notice & Takedown) */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>IV. CƠ CHẾ TIẾP NHẬN & GỠ BỎ NỘI DUNG VI PHẠM (TAKEDOWN)</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            LQMarket tuân thủ quy trình xử lý thông báo vi phạm bản quyền theo quy định pháp luật sở hữu trí tuệ Việt Nam:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-400 pl-1">
            <li><strong>Tiếp nhận khiếu nại bản quyền:</strong> Chủ sở hữu quyền sở hữu trí tuệ hoặc đại diện hợp pháp gửi văn bản yêu cầu qua email: <span className="text-amber-400 font-mono">[EMAIL]</span>.</li>
            <li><strong>Hồ sơ khiếu nại:</strong> Cần kèm theo giấy tờ chứng minh quyền sở hữu, đường dẫn URL bài viết/sản phẩm bị xâm phạm và thông tin liên hệ của chủ quyền.</li>
            <li><strong>Xác minh và gỡ bỏ:</strong> Trong vòng <strong>48 giờ</strong> kể từ khi nhận đủ tài liệu hợp lệ, LQMarket sẽ tạm dừng hiển thị hoặc gỡ bỏ vĩnh viễn nội dung bị khiếu nại, đồng thời thông báo cho người đăng tải nội dung.</li>
          </ol>
        </div>
      </section>
    </PolicyLayout>
  );
};
