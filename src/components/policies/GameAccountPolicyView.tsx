import React from 'react';
import { Gamepad2, ShieldAlert, AlertTriangle, CheckCircle2, Ban, Scale, ShieldCheck } from 'lucide-react';
import { PolicyLayout } from './PolicyLayout';

export const GameAccountPolicyView: React.FC = () => {
  return (
    <PolicyLayout
      id="chinh-sach-tai-khoan-game"
      title="Chính Sách Tài Khoản Game Liên Quân Mobile"
      subtitle="Quy định nghiêm ngặt về tiêu chuẩn, nguồn gốc hợp pháp, phân loại và trách nhiệm bảo đảm đối với các sản phẩm tài khoản game đăng bán trên sàn LQMarket."
      icon={<Gamepad2 size={24} />}
    >
      {/* 1. Tuyên bố độc lập quan trọng */}
      <section className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
          <AlertTriangle size={18} />
          <span>TUYÊN BỐ ĐỘC LẬP & BẢN QUYỀN THƯƠNG HIỆU</span>
        </div>
        <p className="leading-relaxed">
          <strong>LQMarket là nền tảng độc lập và không phải website chính thức của Garena hoặc Liên Quân Mobile (Tencent Games).</strong> LQMarket không tự nhận là đại lý ủy quyền, đối tác chính thức hoặc được tài trợ bởi Garena/Tencent trừ khi có văn bản thỏa thuận chính thức được công bố hợp pháp.
        </p>
        <p className="text-slate-400">
          Nền tảng vận hành với tư cách là chợ thương mại điện tử phục vụ kết nối giao dịch giữa các cá nhân game thủ và cung cấp cơ chế bảo vệ giao dịch qua tài khoản ký quỹ trung gian Escrow.
        </p>
      </section>

      {/* 2. Trách nhiệm người bán về nguồn gốc */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>I. TRÁCH NHIỆM NGUỒN GỐC TÀI KHOẢN CỦA NGƯỜI BÁN</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            <strong>1.1. Cam kết nguồn gốc hợp pháp:</strong> Người Bán (Seller) khi đăng bán tài khoản trên LQMarket phải hoàn toàn chịu trách nhiệm trước pháp luật và trước Người Mua về quyền sở hữu hợp pháp của tài khoản mình đăng bán.
          </p>
          <p>
            <strong>1.2. Cam kết bảo hành vĩnh viễn về nguồn gốc:</strong> Người Bán cam kết không thực hiện hoặc tiếp tay cho bất kỳ hành vi nào nhằm thu hồi (back acc) lại tài khoản đã bán thông qua CMND/CCCD, email gốc, số điện thoại hoặc liên hệ với bộ phận hỗ trợ khách hàng của nhà phát hành.
          </p>
          <p>
            <strong>1.3. Nghĩa vụ bồi hoàn:</strong> Trong trường hợp tài khoản bị thu hồi hoặc phát sinh tranh chấp nguồn gốc sau khi giao dịch thành công do lỗi của Người Bán, Người Bán có nghĩa vụ bồi hoàn 100% số tiền đã nhận kèm tiền phạt vi phạm quy chế cho Người Mua theo phán quyết của LQMarket.
          </p>
        </div>
      </section>

      {/* 3. Danh mục tài khoản NGHIÊM CẤM đăng bán */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-rose-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>II. CÁC LOẠI TÀI KHOẢN NGHIÊM CẤM ĐĂNG BÁN</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p className="text-rose-300 font-semibold">
            LQMarket nghiêm cấm tuyệt đối đăng tải hoặc thực hiện giao dịch đối với các loại tài khoản sau:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-rose-900/40 space-y-1">
              <strong className="text-rose-400 flex items-center gap-1.5 text-sm">
                <Ban size={15} /> Tài khoản bị hack / trộm cắp
              </strong>
              <p className="text-slate-400">Tài khoản thu được do lừa đảo (phishing), đánh cắp mật khẩu, lợi dụng sơ hở của chủ sở hữu hợp pháp để chiếm đoạt.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-rose-900/40 space-y-1">
              <strong className="text-rose-400 flex items-center gap-1.5 text-sm">
                <Ban size={15} /> Tài khoản có nguồn gốc bất hợp pháp
              </strong>
              <p className="text-slate-400">Tài khoản được mua bán thông qua rửa tiền, sử dụng thẻ tín dụng gian lận (CC chùa), hoặc liên quan đến tội phạm công nghệ cao.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-rose-900/40 space-y-1">
              <strong className="text-rose-400 flex items-center gap-1.5 text-sm">
                <Ban size={15} /> Tài khoản nạp quân huy lậu / bị cấm
              </strong>
              <p className="text-slate-400">Tài khoản có lịch sử nạp quân huy gian lận (âm quân huy), đang bị cấm thi đấu, bị khóa tính năng hoặc có nguy cơ bị nhà phát hành khóa vĩnh viễn.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-rose-900/40 space-y-1">
              <strong className="text-rose-400 flex items-center gap-1.5 text-sm">
                <Ban size={15} /> Tài khoản tranh chấp / dính phốt
              </strong>
              <p className="text-slate-400">Tài khoản đang trong quá trình khiếu kiện, tranh chấp quyền sở hữu giữa nhiều người dùng hoặc đang bị cộng đồng phản ánh lừa đảo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Quy định về tính trung thực của thông tin sản phẩm */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>III. QUY ĐỊNH VỀ TÍNH TRUNG THỰC THÔNG TIN</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <ul className="list-disc list-inside space-y-2 text-slate-400 pl-1">
            <li>
              <strong className="text-slate-200">Cấm khai man thông tin liên kết:</strong> Nếu tài khoản còn dính Số điện thoại hoặc Email không thể gỡ, Người Bán phải ghi chú rõ ràng là "Acc có dính SĐT/Email đổi được" hoặc "Acc dính thông tin". Nghiêm cấm tuyệt đối việc gắn nhãn "Acc Trắng Thông Tin 100%" đối với tài khoản còn liên kết bảo mật của người khác.
            </li>
            <li>
              <strong className="text-slate-200">Cấm đăng thông số sai lệch:</strong> Hình ảnh bảng ngọc, số tướng, số trang phục (skin), bậc rank (Cao Thủ, Chiến Tướng, Tinh Anh) và các skin bậc cao (SSS, Thứ Nguyên, Hữu Hạn) phải đúng chính xác 100% so với tình trạng trong game thực tế.
            </li>
            <li>
              <strong className="text-slate-200">Cấm tạo giao dịch giả (Fake Orders):</strong> Nghiêm cấm hành vi tự mua tự bán hoặc cấu kết người quen tạo đơn ảo nhằm thao túng số lượng bán, đẩy thứ hạng sản phẩm hoặc buff đánh giá uy tín Seller.
            </li>
          </ul>
        </div>
      </section>

      {/* 5. Quyền xử lý của LQMarket */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>IV. QUYỀN XỬ LÝ CỦA BAN QUẢN TRỊ LQMARKET</span>
        </h2>
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>
            Khi phát hiện hoặc nhận được phản ánh có cơ sở về tài khoản game vi phạm chính sách này, Ban Quản Trị LQMarket có toàn quyền áp dụng các biện pháp:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
            <li>Gỡ bỏ ngay lập tức sản phẩm khỏi sàn hiển thị mà không cần thông báo trước.</li>
            <li>Đóng băng số tiền thanh toán của đơn hàng liên quan trong tài khoản Escrow để bảo vệ Người Mua.</li>
            <li>Tạm giữ hoặc tịch thu số dư của Người Bán vi phạm để hoàn trả bồi thường thiệt hại cho Người Mua bị lừa.</li>
            <li>Khóa vĩnh viễn tài khoản Seller vi phạm, đưa tên/SĐT/số tài khoản ngân hàng vào danh sách đen (Blacklist).</li>
            <li>Chuyển thông tin cho Cơ quan Công an thụ lý nếu hành vi có dấu hiệu tội phạm chiếm đoạt tài sản.</li>
          </ul>
        </div>
      </section>
    </PolicyLayout>
  );
};
