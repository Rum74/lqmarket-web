import React from 'react';
import { FileText, ShieldCheck, CheckCircle2, AlertOctagon, HelpCircle, Lock, Scale, Building2 } from 'lucide-react';
import { PolicyLayout } from './PolicyLayout';

export const OperatingRegulationsView: React.FC = () => {
  return (
    <PolicyLayout
      id="quy-che-hoat-dong"
      title="Quy Chế Hoạt Động Sàn Thương Mại Điện Tử LQMarket"
      subtitle="Văn bản quy định nguyên tắc hoạt động, quyền hạn, nghĩa vụ của các bên tham gia giao dịch trung gian tài khoản Liên Quân Mobile trên nền tảng LQMarket."
      icon={<FileText size={24} />}
    >
      {/* 1. Giới thiệu & Mô hình hoạt động */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>I. NGUYÊN TẮC CHUNG & MÔ HÌNH HOẠT ĐỘNG</span>
        </h2>
        <div className="space-y-3 text-slate-300">
          <p>
            <strong>1.1. Giới thiệu LQMarket:</strong> LQMarket là website thương mại điện tử hoạt động theo mô hình sàn giao dịch trung gian (Marketplace), phục vụ nhu cầu kết nối, trao đổi, mua bán tài khoản trò chơi trực tuyến Liên Quân Mobile (Arena of Valor) giữa các cá nhân người dùng có nhu cầu hợp pháp.
          </p>
          <p>
            <strong>1.2. Chủ quản sàn:</strong> Nền tảng được vận hành bởi:
          </p>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5 font-mono">
            <div>• Tên đơn vị chủ quản: <span className="text-amber-400 font-bold">[TÊN CHỦ THỂ]</span></div>
            <div>• Mã số thuế: <span className="text-amber-400">[MÃ SỐ THUẾ]</span></div>
            <div>• Trụ sở chính: <span className="text-amber-400">[ĐỊA CHỈ]</span></div>
            <div>• Hộp thư điện tử liên hệ: <span className="text-amber-400">[EMAIL]</span></div>
            <div>• Hotline hỗ trợ trực tuyến: <span className="text-amber-400">[SỐ ĐIỆN THOẠI]</span></div>
          </div>
          <p>
            <strong>1.3. Mô hình hoạt động:</strong> LQMarket áp dụng cơ chế <em>Ký Quỹ Trung Gian Tự Động (Escrow System)</em>. Toàn bộ tiền giao dịch khi người mua thanh toán sẽ được giữ an toàn tại tài khoản trung gian của sàn và chỉ được giải ngân cho Người Bán khi Người Mua đã nhận tài khoản, kiểm tra đúng mô tả và xác nhận hoàn tất hoặc hết thời hạn bảo hành theo quy định.
          </p>
        </div>
      </section>

      {/* 2. Vai trò của các chủ thể */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>II. VAI TRÒ CỦA CÁC BÊN THAM GIA</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h3 className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
              <ShieldCheck size={16} /> Vai trò của LQMarket
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cung cấp hạ tầng kỹ thuật, giao diện hiển thị, hệ thống ký quỹ Escrow, công cụ chat trực tiếp và đóng vai trò trọng tài độc lập giải quyết khiếu nại, tranh chấp giữa người mua và người bán.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h3 className="font-bold text-cyan-400 text-sm flex items-center gap-1.5">
              <CheckCircle2 size={16} /> Vai trò Người Mua
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tìm kiếm, đối chiếu kỹ thông số tài khoản (rank, tướng, trang phục, tình trạng liên kết thông tin), nạp tiền vào ví sàn, kiểm tra đăng nhập và đổi mật khẩu an toàn theo hướng dẫn.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h3 className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
              <Scale size={16} /> Vai trò Người Bán (Seller)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cung cấp sản phẩm với thông tin trung thực, chính xác; cam kết chịu trách nhiệm pháp lý và vật chất về nguồn gốc tài khoản; thực hiện nghĩa vụ bảo hành và hỗ trợ người mua khi có lỗi.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Quy trình chi tiết */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>III. QUY TRÌNH GIAO DỊCH & VẬN HÀNH</span>
        </h2>
        
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-slate-200">1. Quy trình đăng ký tài khoản thành viên</h3>
            <p className="text-slate-400 leading-relaxed">
              Người dùng đăng ký tài khoản trên LQMarket bằng tên tài khoản, mật khẩu, địa chỉ email hoặc số điện thoại. Người dùng có trách nhiệm bảo mật thông tin đăng nhập cá nhân và chịu trách nhiệm cho các hoạt động phát sinh từ tài khoản của mình.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-slate-200">2. Quy trình đăng bán & kiểm duyệt sản phẩm</h3>
            <p className="text-slate-400 leading-relaxed">
              Người Bán khởi tạo thông tin đăng bán: Tên tài khoản hiển thị, bậc rank, số lượng tướng, số lượng trang phục, tình trạng liên kết thông tin (Trắng thông tin, Đổi được SĐT, Đổi được Email), tải lên hình ảnh chụp thực tế trong game và đặt giá bán. Hệ thống tự động quét từ khóa cấm, kiểm tra trùng lặp thông tin và đưa vào danh sách kiểm duyệt trước khi hiển thị công khai.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-slate-200">3. Quy trình giao dịch ký quỹ (Escrow Transaction)</h3>
            <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1 leading-relaxed">
              <li>Người mua lựa chọn sản phẩm phù hợp và nhấn chọn [Mua Ngay].</li>
              <li>Hệ thống phong tỏa số tiền tương ứng trong ví số dư của Người Mua đưa vào trạng thái Ký Quỹ Trung Gian.</li>
              <li>Hệ thống tự động hiển thị thông tin đăng nhập (Tài khoản, Mật khẩu, Ghi chú bảo mật) cho Người Mua ngay lập tức.</li>
              <li>Người Mua tiến hành đăng nhập, kiểm tra tài khoản thực tế và thực hiện đổi thông tin bảo mật theo hướng dẫn.</li>
              <li>Khi Người Mua nhấn [Xác nhận nhận acc] hoặc sau khi hết thời hạn khiếu nại (24 giờ) mà không có tranh chấp phát sinh, hệ thống sẽ tự động giải ngân tiền vào ví của Người Bán (khấu trừ phí sàn theo quy định).</li>
            </ol>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-slate-200">4. Quy trình thanh toán & nạp rút</h3>
            <p className="text-slate-400 leading-relaxed">
              LQMarket hỗ trợ nạp tiền tự động 24/7 qua cổng chuyển khoản ngân hàng chuẩn VietQR và các đối tác thanh toán hợp pháp. Tiền nạp được quy đổi thành số dư ví theo tỷ lệ 1 VNĐ = 1 VNĐ. Khi có số dư khả dụng, người bán có thể gửi yêu cầu rút tiền về tài khoản ngân hàng chính chủ bất kỳ lúc nào.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-slate-200">5. Quy trình xử lý khiếu nại & giải quyết tranh chấp</h3>
            <p className="text-slate-400 leading-relaxed">
              Trong vòng 24 giờ kể từ thời điểm nhận thông tin tài khoản, nếu tài khoản sai mật khẩu, bị khóa vĩnh viễn hoặc sai lệch thông số so với mô tả, Người Mua có quyền nhấn nút [Khiếu nại] tại chi tiết đơn hàng. Số tiền giao dịch sẽ lập tức bị đóng băng. Hai bên có nghĩa vụ cung cấp bằng chứng (video quay màn hình đăng nhập liền mạch, ảnh lỗi). Ban Quản Trị LQMarket sẽ xem xét hồ sơ, đối chiếu dữ liệu kỹ thuật và đưa ra phán quyết hoàn tiền 100% cho Người Mua hoặc giải ngân cho Người Bán theo đúng sự thật khách quan.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Quyền và nghĩa vụ */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>IV. QUYỀN VÀ NGHĨA VỤ CÁC BÊN</span>
        </h2>
        
        <div className="space-y-4 text-xs text-slate-300">
          <div>
            <h3 className="font-bold text-white text-sm mb-1.5">1. Quyền và nghĩa vụ của Người Mua</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1 leading-relaxed">
              <li>Được bảo vệ quyền lợi tài chính qua tài khoản ký quỹ trung gian Escrow của LQMarket.</li>
              <li>Được nhận đúng tài khoản có đặc điểm, thông số và trang phục như Người Bán đã công bố.</li>
              <li>Có nghĩa vụ thanh toán đầy đủ tiền giao dịch và kiểm tra kỹ thông tin trước khi nhấn đặt mua.</li>
              <li>Có nghĩa vụ tự quay video màn hình liên tục từ lúc mở thông tin đơn hàng đến khi đăng nhập lần đầu vào game để làm căn cứ khiếu nại nếu có sự cố.</li>
              <li>Chủ động đổi mật khẩu, kích hoạt các bước bảo mật tài khoản ngay sau khi tiếp nhận.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white text-sm mb-1.5">2. Quyền và nghĩa vụ của Người Bán</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1 leading-relaxed">
              <li>Được nhận đủ số tiền bán sản phẩm sau khi khấu trừ phí dịch vụ sàn theo biểu phí hiện hành.</li>
              <li>Cam kết và chịu toàn bộ trách nhiệm về nguồn gốc hợp pháp của tài khoản đăng bán; nghiêm cấm tuyệt đối việc rao bán tài khoản hack, cướp đoạt, lừa đảo hoặc có tranh chấp.</li>
              <li>Cung cấp đầy đủ, chính xác thông tin đăng nhập và hỗ trợ người mua đổi thông tin bảo mật nếu tài khoản có liên kết trước đó.</li>
              <li>Bồi hoàn 100% giá trị đơn hàng và chịu chế tài xử phạt nếu tài khoản bị chủ cũ thu hồi (back acc) hoặc bị khóa do lỗi từ phía người bán.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white text-sm mb-1.5">3. Quyền và nghĩa vụ của LQMarket</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1 leading-relaxed">
              <li>Duy trì sự vận hành ổn định, an toàn và bảo mật của nền tảng sàn giao dịch.</li>
              <li>Bảo toàn nguyên vẹn số tiền ký quỹ của các bên trong suốt quá trình giao dịch diễn ra.</li>
              <li>Có quyền từ chối hiển thị, gỡ bỏ sản phẩm, tạm khóa hoặc chấm dứt vĩnh viễn tài khoản của bất kỳ thành viên nào có dấu hiệu vi phạm quy chế hoặc gian lận.</li>
              <li>Hợp tác đầy đủ và cung cấp dữ liệu giao dịch cho cơ quan nhà nước có thẩm quyền khi có văn bản yêu cầu hợp pháp theo quy định pháp luật.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. Các hành vi bị cấm & Xử lý vi phạm */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-rose-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>V. CÁC HÀNH VI BỊ CẤM & CHẾ TÀI XỬ LÝ</span>
        </h2>
        
        <div className="space-y-3 text-xs text-slate-300">
          <p className="font-semibold text-rose-300">Nghiêm cấm tuyệt đối các hành vi sau trên toàn hệ thống LQMarket:</p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-400 pl-1 leading-relaxed">
            <li>Đăng bán tài khoản game do trộm cắp, hack, lừa đảo chiếm đoạt hoặc tài khoản có tranh chấp sở hữu.</li>
            <li>Rao bán thông tin giả mạo, hình ảnh chỉnh sửa sai lệch so với thực tế của tài khoản.</li>
            <li>Thực hiện hành vi "back acc" (lợi dụng giấy tờ cá nhân, CMND/CCCD hoặc email gốc để yêu cầu nhà phát hành thu hồi tài khoản sau khi đã bán nhận tiền).</li>
            <li>Giao dịch ngoài sàn (lôi kéo thành viên giao dịch riêng qua Zalo, Facebook, chuyển khoản trực tiếp nhằm né phí sàn hoặc lừa đảo).</li>
            <li>Sử dụng các công cụ can thiệp phần mềm, tấn công phá hoại, spam hoặc can thiệp dữ liệu máy chủ LQMarket.</li>
            <li>Tạo nhiều tài khoản ảo nhằm gian lận mã giới thiệu, thổi phồng đánh giá uy tín hoặc rửa tiền.</li>
          </ul>

          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-200 space-y-2">
            <h4 className="font-bold text-rose-400 flex items-center gap-1.5">
              <AlertOctagon size={16} /> Chế tài xử lý vi phạm:
            </h4>
            <p className="leading-relaxed">
              Tùy theo mức độ vi phạm, Ban Quản Trị LQMarket có quyền áp dụng một hoặc nhiều biện pháp chế tài sau mà không cần bồi hoàn: (1) Cảnh cáo; (2) Gỡ bỏ toàn bộ sản phẩm vi phạm; (3) Đóng băng số dư ví để bồi thường thiệt hại cho nạn nhân; (4) Khóa tài khoản vĩnh viễn và đưa thông tin vào danh sách đen (Blacklist); (5) Chuyển giao hồ sơ, bằng chứng sang cơ quan Công an có thẩm quyền đối với các hành vi lừa đảo chiếm đoạt tài sản.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Quy định lưu trữ thông tin & Cung cấp cho cơ quan chức năng */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>VI. LƯU TRỮ DỮ LIỆU & PHỐI HỢP CƠ QUAN NHÀ NƯỚC</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            <strong>6.1. Lưu trữ thông tin giao dịch:</strong> Toàn bộ dữ liệu về đăng ký tài khoản, lịch sử đăng bán, biến động số dư, nhật ký giao dịch mua bán, IP truy cập và lịch sử trò chuyện được lưu trữ an toàn trong hệ thống dữ liệu tối thiểu theo thời hạn luật định nhằm phục vụ công tác đối soát, bảo vệ quyền lợi người dùng và thanh tra khi cần thiết.
          </p>
          <p>
            <strong>6.2. Cung cấp thông tin theo yêu cầu hợp pháp:</strong> LQMarket có trách nhiệm và cam kết phối hợp, cung cấp thông tin liên quan đến tài khoản, nhật ký giao dịch cho Cơ quan Cảnh sát Điều tra, Tòa án, Viện Kiểm sát hoặc cơ quan quản lý Nhà nước có thẩm quyền khi nhận được văn bản yêu cầu chính thức theo đúng trình tự pháp luật quy định.
          </p>
        </div>
      </section>
    </PolicyLayout>
  );
};
