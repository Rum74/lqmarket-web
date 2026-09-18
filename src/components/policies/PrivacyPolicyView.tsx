import React from 'react';
import { Lock, ShieldCheck, Database, EyeOff, UserCheck, Server, AlertCircle } from 'lucide-react';
import { PolicyLayout } from './PolicyLayout';

export const PrivacyPolicyView: React.FC = () => {
  return (
    <PolicyLayout
      id="chinh-sach-bao-mat"
      title="Chính Sách Bảo Mật & Dữ Liệu Cá Nhân"
      subtitle="Quy định rõ cách thức LQMarket thu thập, xử lý, lưu trữ và bảo mật dữ liệu thông tin của thành viên theo quy định của pháp luật Việt Nam."
      icon={<Lock size={24} />}
    >
      {/* 1. Dữ liệu thu thập */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>I. CÁC LOẠI DỮ LIỆU THU THẬP</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Nhằm mục đích cung cấp dịch vụ giao dịch trung gian, xác thực giao dịch và phòng chống gian lận, LQMarket có thể thu thập các loại dữ liệu cá nhân sau từ người dùng:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <strong className="text-white block text-sm">1. Họ và tên & Thông tin định danh</strong>
              <p className="text-slate-400">Họ tên thật, biệt danh hiển thị hoặc ảnh căn cước công dân (chỉ áp dụng đối với tài khoản Seller đối soát rút tiền hạn mức cao nhằm bảo đảm an toàn).</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <strong className="text-white block text-sm">2. Thông tin liên lạc</strong>
              <p className="text-slate-400">Số điện thoại đăng ký, địa chỉ email, địa chỉ liên hệ và tài khoản Zalo hỗ trợ xử lý đơn hàng.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <strong className="text-white block text-sm">3. Dữ liệu thanh toán & Ngân hàng</strong>
              <p className="text-slate-400">Số tài khoản ngân hàng, tên chủ thẻ, ngân hàng thụ hưởng phục vụ rút tiền; mã giao dịch tham chiếu VietQR.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <strong className="text-white block text-sm">4. Dữ liệu tài khoản game</strong>
              <p className="text-slate-400">Tên nhân vật trong game Liên Quân Mobile, bậc xếp hạng, số lượng skin/tướng, thông tin đăng nhập phục vụ bàn giao tự động qua hệ thống Escrow an toàn.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Mục đích sử dụng dữ liệu */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>II. MỤC ĐÍCH SỬ DỤNG DỮ LIỆU</span>
        </h2>
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>LQMarket chỉ sử dụng thông tin cá nhân của người dùng cho các mục đích hợp pháp sau:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
            <li>Tạo lập, kích hoạt và quản lý tài khoản người dùng trên nền tảng.</li>
            <li>Thực hiện quy trình giao dịch trung gian ký quỹ (Escrow), bàn giao tài khoản và thanh toán tiền tự động.</li>
            <li>Xác thực danh tính khi phát sinh tranh chấp, khiếu nại hoặc nghi vấn hack, gian lận, chiếm đoạt tài khoản.</li>
            <li>Gửi thông báo trạng thái đơn hàng, biến động số dư ví và các cập nhật chính sách quan trọng.</li>
            <li>Ngăn chặn và phát hiện các hành vi gian lận tài chính, rửa tiền hoặc tấn công mạng.</li>
          </ul>
        </div>
      </section>

      {/* 3. Phạm vi sử dụng & Bảo mật tuyệt đối */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>III. PHẠM VI SỬ DỤNG & NGUYÊN TẮC BẢO MẬT</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            <strong>3.1. Phạm vi nội bộ:</strong> Thông tin người dùng chỉ được xử lý trong phạm vi nội bộ hệ thống LQMarket bởi đội ngũ nhân sự được ủy quyền có cam kết bảo mật.
          </p>
          <p>
            <strong>3.2. Không mua bán dữ liệu:</strong> LQMarket tuyệt đối <strong>KHÔNG</strong> bán, cho thuê, trao đổi hoặc tiết lộ thông tin cá nhân của người dùng cho bất kỳ bên thứ ba nào vì mục đích quảng cáo, tiếp thị thương mại.
          </p>
          <p>
            <strong>3.3. Bảo mật danh tính giữa các thành viên:</strong> Hệ thống không tiết lộ thông tin cá nhân chi tiết (như số điện thoại, mật khẩu cá nhân, số căn cước) giữa Người Mua và Người Bán trừ các thông tin giao dịch cần thiết để tiếp nhận tài khoản game.
          </p>
        </div>
      </section>

      {/* 4. Thời gian lưu trữ & Biện pháp bảo vệ */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>IV. THỜI GIAN LƯU TRỮ & BIỆN PHÁP BẢO MẬT</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            <strong>4.1. Thời hạn lưu trữ:</strong> Dữ liệu thông tin cá nhân và lịch sử giao dịch được lưu trữ trong suốt thời gian người dùng duy trì tài khoản hoạt động trên LQMarket. Khi người dùng yêu cầu đóng tài khoản, dữ liệu nhật ký giao dịch tài chính vẫn được lưu giữ tối thiểu theo thời hạn pháp luật kế toán, thuế và thương mại điện tử quy định nhằm mục đích đối soát pháp lý.
          </p>
          <p>
            <strong>4.2. Biện pháp kỹ thuật bảo vệ:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
            <li>Toàn bộ đường truyền web được mã hóa bằng giao thức bảo mật <strong>SSL/TLS 256-bit</strong>.</li>
            <li>Mật khẩu người dùng được băm mã hóa một chiều chuẩn công nghiệp (Bcrypt/Argon2) không thể giải mã ngược.</li>
            <li>Hệ thống tường lửa đa tầng, ngăn chặn tấn công DDoS, SQL Injection và brute-force.</li>
          </ul>
        </div>
      </section>

      {/* 5. Cung cấp dữ liệu theo yêu cầu pháp luật */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>V. CUNG CẤP DỮ LIỆU CHO CƠ QUAN CÓ THẨM QUYỀN</span>
        </h2>
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>
            LQMarket có quyền và trách nhiệm cung cấp thông tin cá nhân, lịch sử giao dịch, địa chỉ IP và nhật ký trao đổi của người dùng cho các Cơ quan Nhà nước có thẩm quyền (bao gồm Cơ quan Công an, Viện Kiểm sát, Tòa án hoặc cơ quan quản lý chuyên ngành) khi có văn bản yêu cầu chính thức theo đúng trình tự thủ tục của pháp luật Việt Nam nhằm phục vụ điều tra các hành vi phạm tội hoặc vi phạm pháp luật.
          </p>
        </div>
      </section>

      {/* 6. Cookie & Quyền của người dùng */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>VI. QUY ĐỊNH VỀ COOKIE & QUYỀN CỦA CHỦ THỂ DỮ LIỆU</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            <strong>6.1. Sử dụng Cookie:</strong> Website sử dụng cookie và bộ nhớ cục bộ (Local Storage) để ghi nhớ trạng thái đăng nhập an toàn, ngôn ngữ và tùy chọn giao diện của người dùng. Người dùng có thể tùy chỉnh trình duyệt để từ chối cookie, tuy nhiên một số tính năng của sàn có thể bị ảnh hưởng.
          </p>
          <p>
            <strong>6.2. Quyền của người dùng:</strong> Người dùng có toàn quyền: (1) Kiểm tra, cập nhật hoặc điều chỉnh thông tin cá nhân qua giao diện quản lý hồ sơ; (2) Yêu cầu tạm khóa hoặc xóa bỏ tài khoản theo quy trình; (3) Gửi khiếu nại về việc xử lý dữ liệu cá nhân không đúng mục đích.
          </p>
        </div>
      </section>

      {/* 7. Thông tin liên hệ về dữ liệu cá nhân */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>VII. BỘ PHẬN PHỤ TRÁCH DỮ LIỆU CÁ NHÂN</span>
        </h2>
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1 font-mono">
          <div>• Phụ trách dữ liệu: Bộ phận An Ninh Thông Tin LQMarket</div>
          <div>• Địa chỉ liên hệ: <span className="text-amber-400">[ĐỊA CHỈ]</span></div>
          <div>• Email tiếp nhận xử lý dữ liệu: <span className="text-amber-400">[EMAIL]</span></div>
          <div>• Hotline bảo vệ dữ liệu: <span className="text-amber-400">[SỐ ĐIỆN THOẠI]</span></div>
        </div>
      </section>
    </PolicyLayout>
  );
};
