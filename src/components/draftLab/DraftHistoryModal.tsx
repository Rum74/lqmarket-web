import React from 'react';
import { SavedDraftItem, DraftComparisonResult } from '../../types/draftLab';
import { X, Clock, Trash2, ArrowRight, Shield, Award, Share2 } from 'lucide-react';

interface DraftHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedDrafts: any[];
  onLoadDraft: (draft: any) => void;
  onDeleteDraft?: (id: string) => void;
}

export const DraftHistoryModal: React.FC<DraftHistoryModalProps> = ({
  isOpen,
  onClose,
  savedDrafts,
  onLoadDraft,
  onDeleteDraft
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-left"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-black text-white">LỊCH SỬ & ĐỘI HÌNH ĐÃ LƯU</h3>
              <p className="text-xs text-slate-400">Xem lại các đội hình bạn đã lưu và phân tích trước đây</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {savedDrafts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Clock className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-semibold text-sm">Chưa có đội hình nào được lưu.</p>
              <p className="text-xs text-slate-500">
                Sau khi phân tích xong đội hình, bạn có thể bấm nút &quot;Lưu Đội Hình&quot; để lưu lại vào đây.
              </p>
            </div>
          ) : (
            savedDrafts.map((item: any) => {
              const dateStr = item.createdAt
                ? new Date(item.createdAt).toLocaleDateString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })
                : 'Vừa xong';

              return (
                <div
                  key={item.id}
                  className="p-3 sm:p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white truncate">
                        {item.title || `${item.teamAName} vs ${item.teamBName}`}
                      </span>
                      {item.isSaved && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30 font-bold shrink-0">
                          ĐÃ LƯU
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="text-blue-400 font-semibold">{item.teamAName || 'Đội A'}</span>
                      <span className="text-slate-600">vs</span>
                      <span className="text-rose-400 font-semibold">{item.teamBName || 'Đội B'}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-[11px] text-slate-500">{dateStr}</span>
                    </div>

                    {/* Mini Hero Avatars preview */}
                    <div className="flex items-center gap-1 pt-1">
                      {Array.isArray(item.teamAHeroes) &&
                        item.teamAHeroes.slice(0, 5).map((h: any, i: number) => (
                          <div
                            key={i}
                            title={h.name}
                            className="w-6 h-6 rounded-full overflow-hidden border border-blue-500/50 bg-slate-800 shrink-0"
                          >
                            <img
                              src={h.avatar}
                              alt={h.name}
                              className="w-full h-full object-cover"
                              onError={e => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                        ))}
                      <span className="text-[10px] text-slate-600 mx-1">vs</span>
                      {Array.isArray(item.teamBHeroes) &&
                        item.teamBHeroes.slice(0, 5).map((h: any, i: number) => (
                          <div
                            key={i}
                            title={h.name}
                            className="w-6 h-6 rounded-full overflow-hidden border border-rose-500/50 bg-slate-800 shrink-0"
                          >
                            <img
                              src={h.avatar}
                              alt={h.name}
                              className="w-full h-full object-cover"
                              onError={e => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => {
                        onLoadDraft(item);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                    >
                      <span>Xem lại</span>
                      <ArrowRight size={13} />
                    </button>
                    {onDeleteDraft && item.id && (
                      <button
                        onClick={() => onDeleteDraft(item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 flex justify-end bg-slate-950/80">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
