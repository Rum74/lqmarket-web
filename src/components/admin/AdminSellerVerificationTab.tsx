import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Check, X, Clock, ExternalLink, Phone, AlertCircle, Award } from 'lucide-react';

export const AdminSellerVerificationTab: React.FC = () => {
  const { sellerVerificationRequests, adminReviewSellerVerification } = useApp();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const pendingRequests = sellerVerificationRequests.filter(r => r.status === 'pending');
  const reviewedRequests = sellerVerificationRequests.filter(r => r.status !== 'pending');

  const handleApprove = (reqId: string) => {
    adminReviewSellerVerification(reqId, 'approved');
  };

  const handleReject = (reqId: string) => {
    if (!rejectionReason.trim()) return;
    adminReviewSellerVerification(reqId, 'rejected', rejectionReason);
    setRejectingId(null);
    setRejectionReason('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-400" />
          <span>Xét Duyệt Người Bán Xác Minh (Verified Seller Applications)</span>
        </h3>
        <p className="text-xs text-slate-400">
          Kiểm tra CCCD/CMND, SĐT và cam kết bảo hành trước khi cấp huy hiệu 🛡️ Verified Seller
        </p>
      </div>

      {/* Pending requests */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase text-amber-400 tracking-wider">
          Hồ Sơ Đang Chờ Duyệt ({pendingRequests.length})
        </h4>

        {pendingRequests.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
            Hiện không có hồ sơ xác minh nào đang chờ duyệt.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingRequests.map(req => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-4 shadow-lg"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={req.userAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${req.userName}`}
                      alt={req.userName}
                      className="w-12 h-12 rounded-xl object-cover border border-amber-500/40"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{req.userName}</span>
                        <span className="text-[10px] font-mono text-slate-400">ID: #{req.userId}</span>
                      </div>
                      <div className="text-xs text-amber-400 font-semibold mt-0.5">
                        Họ tên CCCD: <span className="text-white font-bold">{req.fullName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-xs text-slate-400">
                    <div>Ngày nộp: {new Date(req.appliedAt).toLocaleDateString('vi-VN')}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Số điện thoại:</span>
                    <span className="font-bold text-slate-200 font-mono">{req.userPhone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Số CCCD / CMND:</span>
                    <span className="font-bold text-amber-400 font-mono">{req.idCardNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Zalo / Facebook:</span>
                    {req.socialLink ? (
                      <a
                        href={req.socialLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>Xem liên kết</span>
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-slate-400">{req.zaloPhone || 'Không cung cấp'}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <Check size={14} />
                    <span>Đã tích chọn cam kết bảo hành 100% tài khoản</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRejectingId(req.id)}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Từ Chối
                    </button>
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer flex items-center gap-1"
                    >
                      <ShieldCheck size={14} />
                      <span>Phê Duyệt 🛡️ Verified</span>
                    </button>
                  </div>
                </div>

                {/* Rejecting reason prompt */}
                {rejectingId === req.id && (
                  <div className="p-3 bg-slate-950 border border-rose-500/40 rounded-xl space-y-2 mt-2">
                    <label className="text-xs font-bold text-rose-400 block">
                      Lý do từ chối hồ sơ:
                    </label>
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      placeholder="VD: Số CCCD không hợp lệ / Thiếu liên kết mạng xã hội..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setRejectingId(null);
                          setRejectionReason('');
                        }}
                        className="px-3 py-1 bg-slate-800 text-slate-400 text-xs rounded-lg cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Xác Nhận Từ Chối
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Already reviewed */}
      {reviewedRequests.length > 0 && (
        <div className="space-y-3 pt-4">
          <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
            Lịch Sử Đã Xử Lý ({reviewedRequests.length})
          </h4>
          <div className="space-y-2">
            {reviewedRequests.map(r => (
              <div
                key={r.id}
                className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">{r.fullName} ({r.userName})</span>
                  <span className="text-slate-500">SĐT: {r.userPhone}</span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                    r.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {r.status === 'approved' ? '🛡️ Đã Phê Duyệt' : 'Đã Từ Chối'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
