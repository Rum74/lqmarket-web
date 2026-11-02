import React, { useState, useMemo } from 'react';
import { DraftHero, HeroRole, HeroLane, HeroPlaystyle, PLAYSTYLE_OPTIONS } from '../../types/draftLab';
import { INITIAL_DRAFT_HEROES, ROLE_OPTIONS, LANE_OPTIONS } from '../../data/draftHeroesData';
import api from '../../lib/apiClient';
import {
  X,
  Search,
  CheckSquare,
  Square,
  Sparkles,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  UploadCloud,
  FileText,
  Sliders,
  RotateCcw
} from 'lucide-react';

interface BatchAddHeroesModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingHeroes: DraftHero[];
  onSuccess: (addedCount: number) => void;
}

export const BatchAddHeroesModal: React.FC<BatchAddHeroesModalProps> = ({
  isOpen,
  onClose,
  existingHeroes,
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'official' | 'custom'>('official');

  // Search & Filters for Official Missing Roster
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('Tất cả');
  const [selectedPlaystyle, setSelectedPlaystyle] = useState('all');

  // Multi-select state
  const [selectedHeroIds, setSelectedHeroIds] = useState<Set<string>>(new Set());

  // JSON / CSV import state
  const [importFormat, setImportFormat] = useState<'json' | 'csv'>('json');
  const [rawInput, setRawInput] = useState('');
  const [parsedCustomHeroes, setParsedCustomHeroes] = useState<DraftHero[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  // Submission & Result status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultSummary, setResultSummary] = useState<{
    addedCount: number;
    skippedCount: number;
    errorCount: number;
    errors: { index: number; heroName: string; reason: string }[];
    totalInDb?: number;
  } | null>(null);

  // Compute missing heroes compared to DB (130 official roster)
  const missingHeroes = useMemo(() => {
    const existingNames = new Set(existingHeroes.map(h => h.name.toLowerCase().trim()));
    const existingIds = new Set(existingHeroes.map(h => h.id));
    return INITIAL_DRAFT_HEROES.filter(h => {
      if (existingIds.has(h.id)) return false;
      const norm = h.name.toLowerCase().trim();
      if (existingNames.has(norm)) return false;
      if ((norm === 'riktor' || norm === 'richter') && (existingNames.has('riktor') || existingNames.has('richter'))) return false;
      return true;
    });
  }, [existingHeroes]);

  // Filter missing heroes list
  const filteredMissing = useMemo(() => {
    return missingHeroes.filter(h => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchName = h.name.toLowerCase().includes(q);
        const matchTitle = h.title?.toLowerCase().includes(q) ?? false;
        if (!matchName && !matchTitle) return false;
      }
      if (selectedRole !== 'Tất cả') {
        const isPrimary = h.role === selectedRole;
        const isSecondaryArr = h.secondaryRoles?.includes(selectedRole as HeroRole) ?? false;
        const isSecondaryLegacy = h.secondaryRole === selectedRole;
        if (!isPrimary && !isSecondaryArr && !isSecondaryLegacy) return false;
      }
      if (selectedPlaystyle !== 'all') {
        if (!h.playstyles || !h.playstyles.includes(selectedPlaystyle as HeroPlaystyle)) {
          return false;
        }
      }
      return true;
    });
  }, [missingHeroes, searchTerm, selectedRole, selectedPlaystyle]);

  // Select all filtered
  const handleSelectAll = () => {
    const next = new Set(selectedHeroIds);
    filteredMissing.forEach(h => next.add(h.id));
    setSelectedHeroIds(next);
  };

  // Deselect all
  const handleDeselectAll = () => {
    setSelectedHeroIds(new Set());
  };

  // Toggle single selection
  const handleToggleHero = (heroId: string) => {
    const next = new Set(selectedHeroIds);
    if (next.has(heroId)) {
      next.delete(heroId);
    } else {
      next.add(heroId);
    }
    setSelectedHeroIds(next);
  };

const normalizeImportLane = (lane?: string): HeroLane => {
  if (!lane) return 'Caesar';
  const l = String(lane).trim().toLowerCase();
  if (l.includes('jungle') || l.includes('rừng') || l === 'jg') return 'Rừng';
  if (l.includes('dragon') || l.includes('ad') || l.includes('bot') || l.includes('xạ thủ')) return 'AD';
  if (l.includes('mid') || l.includes('pháp sư')) return 'Mid';
  if (l.includes('support') || l.includes('sp') || l.includes('trợ thủ') || l.includes('đỡ đòn')) return 'Support';
  if (l.includes('caesar') || l.includes('top') || l.includes('đấu sĩ')) return 'Caesar';
  return 'Caesar';
};

const normalizeImportRole = (role?: string): HeroRole => {
  if (!role) return 'Đấu sĩ';
  const r = String(role).trim().toLowerCase();
  if (r.includes('đấu sĩ') || r.includes('fighter')) return 'Đấu sĩ';
  if (r.includes('pháp sư') || r.includes('mage')) return 'Pháp sư';
  if (r.includes('xạ thủ') || r.includes('marksman')) return 'Xạ thủ';
  if (r.includes('sát thủ') || r.includes('assassin')) return 'Sát thủ';
  if (r.includes('đỡ đòn') || r.includes('tank')) return 'Đỡ đòn';
  if (r.includes('trợ thủ') || r.includes('support')) return 'Trợ thủ';
  return 'Đấu sĩ';
};

  // Submit Batch from Official Missing or Custom Input
  const handleSubmitBatch = async (heroesToAdd: DraftHero[]) => {
    if (heroesToAdd.length === 0) {
      alert('Vui lòng chọn ít nhất 1 tướng để thêm vào hệ thống.');
      return;
    }

    setIsSubmitting(true);
    setResultSummary(null);
    try {
      const res = await api.post('/api/draft-lab/admin/heroes/batch', {
        heroes: heroesToAdd,
        skipExisting: true,
        updateExisting: false
      });

      const isSuccess = Boolean(res?.success || res?.data?.success);
      if (isSuccess) {
        const summary = res?.addedCount !== undefined ? res : (res?.data || res);
        setResultSummary(summary);
        if (summary.addedCount > 0) {
          onSuccess(summary.addedCount);
        }
      } else {
        alert(res?.message || res?.data?.message || 'Có lỗi xảy ra khi thêm danh sách tướng.');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // One-click Add ALL Missing Heroes
  const handleAddAllMissing = () => {
    if (missingHeroes.length === 0) {
      alert('Tất cả tướng trong danh sách chuẩn đã có đầy đủ trong cơ sở dữ liệu!');
      return;
    }
    if (
      confirm(
        `Xác nhận thêm toàn bộ ${missingHeroes.length} tướng còn thiếu từ Garena Liên Quân Mobile VN vào database?`
      )
    ) {
      handleSubmitBatch(missingHeroes);
    }
  };

  // Parse JSON / CSV input
  const handleParseCustomInput = () => {
    setParseError(null);
    if (!rawInput.trim()) {
      setParseError('Vui lòng dán nội dung JSON hoặc CSV trước khi phân tích.');
      return;
    }

    try {
      if (importFormat === 'json') {
        const parsed = JSON.parse(rawInput);
        if (!Array.isArray(parsed)) {
          throw new Error('Dữ liệu JSON phải là một mảng [] danh sách các tướng.');
        }
        const validated = parsed.map((item, idx) => {
          if (!item.name || !item.role) {
            throw new Error(`Dòng ${idx + 1}: Thiếu thuộc tính "name" hoặc "role".`);
          }
          const heroName = String(item.name).trim();
          const mappedRole = normalizeImportRole(item.role);
          const mappedLane = normalizeImportLane(item.primaryLane);

          return {
            id: item.id || `hero_${heroName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
            name: heroName,
            title: item.title || '',
            role: mappedRole,
            secondaryRoles: Array.isArray(item.secondaryRoles) ? item.secondaryRoles : [],
            playstyles: Array.isArray(item.playstyles) ? item.playstyles : [],
            primaryLane: mappedLane,
            secondaryLanes: Array.isArray(item.secondaryLanes) ? item.secondaryLanes : [],
            damageType: item.damageType || 'Vật lý',
            avatar: item.avatar || item.avatarUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150',
            ratings: item.ratings || {
              tankiness: mappedRole === 'Đỡ đòn' ? 9 : mappedRole === 'Đấu sĩ' ? 7 : 4,
              damage: mappedRole === 'Xạ thủ' || mappedRole === 'Sát thủ' || mappedRole === 'Pháp sư' ? 9 : 6,
              crowdControl: mappedRole === 'Trợ thủ' ? 8 : 5,
              engage: 5,
              peel: 5,
              mobility: 5,
              earlyGame: item.earlyPower ?? 6,
              lateGame: item.latePower ?? 7
            },
            signatureSkill: item.signatureSkill || '',
            counters: item.counters || [],
            synergies: item.synergies || [],
            tags: item.tags || (item.isMeta ? ['Meta 2026', `Tier ${item.tier || 'S'}`] : []),
            difficulty: typeof item.difficulty === 'number'
              ? (item.difficulty >= 4 ? 'Khó' : item.difficulty >= 2 ? 'Trung bình' : 'Dễ')
              : (item.difficulty || 'Trung bình'),
            isActive: true,
            notes: item.notes || item.tacticalNotes || ''
          } as DraftHero;
        });
        setParsedCustomHeroes(validated);
      } else {

        // Parse CSV: name,title,role,primaryLane,damageType,playstyles
        const lines = rawInput.trim().split('\n');
        if (lines.length <= 1) {
          throw new Error('Dữ liệu CSV cần có ít nhất 1 dòng tiêu đề và 1 dòng dữ liệu.');
        }
        const heroes: DraftHero[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
          const [name, title, role, primaryLane, damageType, playstylesRaw] = cols;
          if (!name || !role) {
            throw new Error(`Dòng ${i + 1}: Cần tối thiểu "Tên tướng" và "Vai trò".`);
          }
          heroes.push({
            id: `hero_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
            name,
            title: title || '',
            role: (role as HeroRole) || 'Đấu sĩ',
            primaryLane: (primaryLane as HeroLane) || 'Caesar',
            damageType: (damageType as any) || 'Vật lý',
            playstyles: playstylesRaw ? (playstylesRaw.split(';').map(p => p.trim()) as any) : [],
            avatar: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150',
            ratings: { tankiness: 5, damage: 5, crowdControl: 5, engage: 5, peel: 5, mobility: 5, earlyGame: 5, lateGame: 5 },
            signatureSkill: '',
            counters: [],
            synergies: [],
            tags: [],
            difficulty: 'Trung bình',
            isActive: true
          });
        }
        setParsedCustomHeroes(heroes);
      }
    } catch (err: any) {
      setParseError(err.message || 'Lỗi cú pháp dữ liệu.');
      setParsedCustomHeroes([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-left"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Sparkles size={18} />
              </span>
              <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
                THÊM DANH SÁCH TƯỚNG HÀNG LOẠT
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Thêm số lượng lớn tướng Liên Quân Mobile vào database • Chống trùng lặp tuyệt đối
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs">
          <button
            onClick={() => setActiveTab('official')}
            className={`flex-1 py-3 px-4 font-bold border-b-2 flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'official'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles size={14} />
            <span>Tướng Còn Thiếu Từ Garena VN (01/11/2026)</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-amber-300 font-mono">
              {missingHeroes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-3 px-4 font-bold border-b-2 flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'custom'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet size={14} />
            <span>Nhập Bằng JSON / CSV Tùy Biến</span>
          </button>
        </div>

        {/* Feedback Alert Banner */}
        {resultSummary && (
          <div className="m-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-2 font-black text-sm text-emerald-400">
              <CheckCircle2 size={18} />
              <span>Kết quả thêm danh sách tướng:</span>
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono">
              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                Thêm thành công: <strong>{resultSummary.addedCount}</strong>
              </div>
              <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30 text-blue-300">
                Bỏ qua (trùng lặp): <strong>{resultSummary.skippedCount}</strong>
              </div>
              <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300">
                Lỗi bản ghi: <strong>{resultSummary.errorCount}</strong>
              </div>
            </div>
            {resultSummary.errors.length > 0 && (
              <div className="p-2 rounded bg-rose-500/10 text-rose-300 text-[11px] space-y-1">
                <span className="font-bold">Chi tiết lỗi:</span>
                {resultSummary.errors.map((e, idx) => (
                  <div key={idx}>
                    • Tướng: <strong>{e.heroName}</strong> - {e.reason}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 1: Official Roster Missing */}
        {activeTab === 'official' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Filter & Batch Actions Bar */}
            <div className="p-3 sm:p-4 border-b border-slate-800 bg-slate-950/30 space-y-2.5">
              {/* Search */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Tìm nhanh tướng còn thiếu (Dyadia, Dolia, Stuart, Charlotte...)"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Batch selection buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleSelectAll}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <CheckSquare size={13} />
                    <span>Chọn tất cả ({filteredMissing.length})</span>
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Square size={13} />
                    <span>Bỏ chọn</span>
                  </button>
                  <button
                    onClick={handleAddAllMissing}
                    disabled={isSubmitting || missingHeroes.length === 0}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer transition-all shadow-md"
                  >
                    <Sparkles size={13} />
                    <span>Thêm tất cả tướng còn thiếu ({missingHeroes.length})</span>
                  </button>
                </div>
              </div>

              {/* Roles & Playstyle Filters */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] font-semibold text-slate-400 mr-1">Vai trò:</span>
                {['Tất cả', ...ROLE_OPTIONS].map(r => (
                  <button
                    key={r}
                    onClick={() => setSelectedRole(r)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer transition-all ${
                      selectedRole === r
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}

                <span className="text-slate-700 mx-1">|</span>

                <span className="text-[11px] font-semibold text-amber-400 mr-1">Chất tướng:</span>
                <button
                  onClick={() => setSelectedPlaystyle('all')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer transition-all ${
                    selectedPlaystyle === 'all'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tất cả
                </button>
                {PLAYSTYLE_OPTIONS.slice(0, 5).map(ps => (
                  <button
                    key={ps}
                    onClick={() => setSelectedPlaystyle(ps)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer transition-all ${
                      selectedPlaystyle === ps
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {ps}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Missing Heroes */}
            <div className="p-3 sm:p-5 overflow-y-auto flex-1 min-h-[300px]">
              {missingHeroes.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-bold text-white">
                    Cơ sở dữ liệu đã đầy đủ toàn bộ {INITIAL_DRAFT_HEROES.length || 130} tướng!
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Không còn tướng nào thiếu so với danh sách chính thức Garena Liên Quân Mobile Việt Nam (01/11/2026).
                  </p>
                </div>
              ) : filteredMissing.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Không tìm thấy tướng nào phù hợp với bộ lọc tìm kiếm.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredMissing.map(hero => {
                    const isSelected = selectedHeroIds.has(hero.id);

                    return (
                      <div
                        key={hero.id}
                        onClick={() => handleToggleHero(hero.id)}
                        className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500/60 shadow-md'
                            : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                        />

                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                          <img
                            src={hero.avatar}
                            alt={hero.name}
                            className="w-full h-full object-cover"
                            onError={e => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-white truncate block">
                              {hero.name}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                              {hero.primaryLane}
                            </span>
                          </div>
                          <span className="text-[11px] text-amber-400/90 block truncate">
                            {hero.title}
                          </span>
                          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                            <span className="font-semibold text-slate-300">{hero.role}</span>
                            {hero.playstyles && hero.playstyles.length > 0 && (
                              <span className="text-slate-500 truncate">
                                • {hero.playstyles.slice(0, 2).join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Bottom Bar */}
            <div className="p-3 sm:p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/80 text-xs">
              <span className="text-slate-400">
                Đã chọn <strong>{selectedHeroIds.size}</strong> tướng / {missingHeroes.length} tướng còn thiếu
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  disabled={isSubmitting || selectedHeroIds.size === 0}
                  onClick={() => {
                    const toAdd = missingHeroes.filter(h => selectedHeroIds.has(h.id));
                    handleSubmitBatch(toAdd);
                  }}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black rounded-xl cursor-pointer transition-all shadow-md flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Xác nhận thêm ({selectedHeroIds.size} tướng đã chọn)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Custom JSON / CSV Import */}
        {activeTab === 'custom' && (
          <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4 text-xs">
            {/* Format toggle & sample buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-300">Định dạng nạp:</span>
                <button
                  onClick={() => setImportFormat('json')}
                  className={`px-3 py-1 rounded-lg font-bold cursor-pointer ${
                    importFormat === 'json' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  JSON Array
                </button>
                <button
                  onClick={() => setImportFormat('csv')}
                  className={`px-3 py-1 rounded-lg font-bold cursor-pointer ${
                    importFormat === 'csv' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  CSV (Phẩy)
                </button>
              </div>

              <button
                onClick={() => {
                  if (importFormat === 'json') {
                    setRawInput(
                      JSON.stringify(
                        [
                          {
                            name: 'Dyadia',
                            title: 'Vũ Điệu Ước Nguyện',
                            role: 'Trợ thủ',
                            primaryLane: 'Support',
                            damageType: 'Phép',
                            playstyles: ['Bảo kê', 'Khống chế', 'Cơ động']
                          }
                        ],
                        null,
                        2
                      )
                    );
                  } else {
                    setRawInput(
                      'name,title,role,primaryLane,damageType,playstyles\nDyadia,Vũ Điệu Ước Nguyện,Trợ thủ,Support,Phép,Bảo kê;Khống chế;Cơ động'
                    );
                  }
                }}
                className="text-amber-400 hover:underline cursor-pointer"
              >
                Chèn mẫu {importFormat.toUpperCase()}
              </button>
            </div>

            {/* Input textarea */}
            <div>
              <label className="font-bold text-slate-300 block mb-1.5">
                Dán dữ liệu {importFormat.toUpperCase()} vào đây:
              </label>
              <textarea
                rows={9}
                value={rawInput}
                onChange={e => setRawInput(e.target.value)}
                placeholder={
                  importFormat === 'json'
                    ? '[{\n  "name": "Dyadia",\n  "title": "Vũ Điệu Ước Nguyện",\n  "role": "Trợ thủ",\n  "primaryLane": "Support"\n}]'
                    : 'name,title,role,primaryLane,damageType,playstyles\nDyadia,Vũ Điệu Ước Nguyện,Trợ thủ,Support,Phép,Bảo kê;Khống chế'
                }
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {parseError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{parseError}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleParseCustomInput}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl cursor-pointer"
              >
                Kiểm tra &amp; Xem trước ({parsedCustomHeroes.length} tướng)
              </button>
              {parsedCustomHeroes.length > 0 && (
                <button
                  disabled={isSubmitting}
                  onClick={() => handleSubmitBatch(parsedCustomHeroes)}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl cursor-pointer"
                >
                  {isSubmitting ? 'Đang thêm...' : `Xác nhận thêm ${parsedCustomHeroes.length} tướng`}
                </button>
              )}
            </div>

            {/* Preview Parsed */}
            {parsedCustomHeroes.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="font-bold text-slate-300">
                  Xem trước {parsedCustomHeroes.length} tướng đã phân tích hợp lệ:
                </span>
                <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/60 p-2 space-y-1">
                  {parsedCustomHeroes.map((h, i) => (
                    <div key={i} className="flex items-center justify-between p-1.5 hover:bg-slate-900 rounded">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{h.name}</span>
                        <span className="text-[11px] text-slate-400">({h.title || 'Chưa có danh hiệu'})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 text-[10px]">
                          {h.role}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                          {h.primaryLane}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
