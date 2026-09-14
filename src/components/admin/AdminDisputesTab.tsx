import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  MessageCircle,
  HelpCircle
} from 'lucide-react';

export const AdminDisputesTab: React.FC = () => {
  const { disputeTickets, adminResolveDisputeTicket, orders } = useApp();
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});

  const pendingDisputes = disputeTickets.filter(
    d => d.status === 'pending' || d.status === 'under_review' || d.status === 'more_info_needed'
  );
  const resolvedDisputes = disputeTickets.filter(
    d => d.status === 'resolved_buyer_refund' || d.status === 'resolved_seller_payout'
  );

  const handleResolve = (
    ticketId: string,
    action: 'resolved_buyer_refund' | 'resolved_seller_payout' | 'more_info_needed'
  ) => {
    const note = resolutionNotes[ticketId] || '';
    adminResolveDisputeTicket(ticketId, action, note);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <AlertTriangle size={18} className="text-rose-400" />
          <span>Trung Tâm Xử Lý Tranh Chấp & Khiếu Nại (Dispute Resolution)</span>
        </h3>
        <p className="text-xs text-slate-400">
          Xem xét bằng chứng từ Người mua và Người bán để đưa ra phán quyết hoàn tiền hoặc thanh toán tiền cọc Escrow
        </p>
      </div>

      {/* Active disputes */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase text-rose-400 tracking-wider">
          Khiếu Nại Cần Xử Lý ({pendingDisputes.length})
        </h4>

        {pendingDisputes.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
            Hiện không có tranh chấp nào cần can thiệp. Tất cả đơn hàng đều diễn ra an toàn.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {pendingDisputes.map(dispute => (
              <div
                key={dispute.id}
                className="p-6 rounded-3xl bg-slate-900 border border-rose-500/30 space-y-5 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/30">
                      DISPUTE #{dispute.id}
                    </span>
                    <span className="text-xs font-mono text-slate-400">Đơn hàng: #{dispute.orderCode}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400">Số tiền bảo lưu Escrow:</span>
                    <div className="text-base font-black text-amber-400 font-mono">
                      {dispute.amount.toLocaleString('vi-VN')}đ
                    </div>
                  </div>
                </div>

                {/* Buyer vs Seller Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div>
                    <div className="text-[11px] text-slate-400 font-semibold mb-1">NGƯỜI MUA (BUYER):</div>
                    <div className="text-sm font-bold text-white">{dispute.buyerName}</div>
                    <div className="text-xs text-slate-400 font-mono">ID: #{dispute.buyerId}</div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-400 font-semibold mb-1">NGƯỜI BÁN (SELLER):</div>
                    <div className="text-sm font-bold text-amber-400">{dispute.sellerName}</div>
                    <div className="text-xs text-slate-400 font-mono">ID: #{dispute.sellerId}</div>
                  </div>
                </div>

                {/* Account & Reason */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300">
                    Sản phẩm: <strong className="text-white">#{dispute.accountCode} - {dispute.accountTitle}</strong>
                  </div>
                  <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl text-xs text-rose-200">
                    <strong className="block text-rose-400 mb-1 font-bold">Lý do khiếu nại:</strong>
                    {dispute.reason}
                  </div>
                </div>

                {/* Evidence */}
                {(dispute.evidencePhotos?.length > 0 || dispute.evidenceVideo) && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-300">Bằng chứng gửi kèm (Evidence):</div>
                    <div className="flex flex-wrap gap-2">
                      {dispute.evidencePhotos.map((photo, idx) => (
                        <a
                          key={idx}
                          href={photo}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs rounded-lg flex items-center gap-1.5 border border-slate-700 font-semibold"
                        >
                          <span>Xem Ảnh Bằng Chứng {idx + 1}</span>
                          <ExternalLink size={12} />
                        </a>
                      ))}
                      {dispute.evidenceVideo && (
                        <a
                          href={dispute.evidenceVideo}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs rounded-lg flex items-center gap-1.5 border border-slate-700 font-semibold"
                        >
                          <span>Xem Video Bằng Chứng</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Admin Note input */}
                <div>
                  <input
                    type="text"
                    value={resolutionNotes[dispute.id] || ''}
                    onChange={e =>
                      setResolutionNotes({ ...resolutionNotes, [dispute.id]: e.target.value })
                    }
                    placeholder="Ghi chú phân xử của Admin (Lý do giải quyết hoặc yêu cầu thêm)..."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
                  <button
                    onClick={() => handleResolve(dispute.id, 'resolved_buyer_refund')}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <XCircle size={15} />
                    <span>HOÀN TIỀN CHO BUYER (100%)</span>
                  </button>

                  <button
                    onClick={() => handleResolve(dispute.id, 'resolved_seller_payout')}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={15} />
                    <span>GIẢI QUYẾT CHO SELLER (GIẢI NGÂN)</span>
                  </button>

                  <button
                    onClick={() => handleResolve(dispute.id, 'more_info_needed')}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <HelpCircle size={15} />
                    <span>YÊU CẦU THÊM THÔNG TIN</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved disputes history */}
      {resolvedDisputes.length > 0 && (
        <div className="space-y-3 pt-4">
          <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
            Lịch Sử Khiếu Nại Đã Phán Quyết ({resolvedDisputes.length})
          </h4>
          <div className="space-y-2">
            {resolvedDisputes.map(d => (
              <div
                key={d.id}
                className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">#{d.id}</span>
                    <span className="text-slate-400">Đơn #{d.orderCode}</span>
                    <span className="font-semibold text-slate-300">{d.accountTitle}</span>
                  </div>
                  {d.adminDecisionNote && (
                    <div className="text-[11px] text-slate-400 mt-1">
                      Phán quyết: <span className="text-white">{d.adminDecisionNote}</span>
                    </div>
                  )}
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                    d.status === 'resolved_buyer_refund'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {d.status === 'resolved_buyer_refund' ? 'Đã Hoàn Tiền Buyer' : 'Đã Giải Ngân Seller'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
