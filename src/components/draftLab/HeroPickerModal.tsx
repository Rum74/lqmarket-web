import React, { useState, useMemo } from 'react';
import { DraftHero, HeroRole, HeroLane, HeroPlaystyle, PLAYSTYLE_OPTIONS } from '../../types/draftLab';
import { ROLE_OPTIONS, LANE_OPTIONS } from '../../data/draftHeroesData';
import {
  Search,
  X,
  Shield,
  Zap,
  Sword,
  Sparkles,
  Info,
  Check,
  AlertCircle
} from 'lucide-react';

interface HeroPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  heroes: DraftHero[];
  onSelectHero: (hero: DraftHero) => void;
  targetSlotName: string;
  targetLane: HeroLane;
  selectedHeroIdsInTeam: string[];
  selectedHeroIdsOtherTeam: string[];
  allowCrossTeamDuplicates: boolean;
}

export const HeroPickerModal: React.FC<HeroPickerModalProps> = ({
  isOpen,
  onClose,
  heroes,
  onSelectHero,
  targetSlotName,
  targetLane,
  selectedHeroIdsInTeam,
  selectedHeroIdsOtherTeam,
  allowCrossTeamDuplicates
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('Tất cả');
  const [selectedLane, setSelectedLane] = useState<string>('all');
  const [selectedDamageType, setSelectedDamageType] = useState<string>('all');
  const [selectedPlaystyle, setSelectedPlaystyle] = useState<string>('all');

  const filteredHeroes = useMemo(() => {
    return heroes.filter(hero => {
      // 1. Text search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchName = hero.name.toLowerCase().includes(query);
        const matchTitle = hero.title?.toLowerCase().includes(query) ?? false;
        const matchTag = hero.tags?.some(t => t.toLowerCase().includes(query)) ?? false;
        const matchPlaystyle =
          hero.playstyles?.some(p => p.toLowerCase().includes(query)) ?? false;
        if (!matchName && !matchTitle && !matchTag && !matchPlaystyle) return false;
      }

      // 2. Role filter
      if (selectedRole !== 'Tất cả') {
        const isPrimary = hero.role === selectedRole;
        const isSecondaryLegacy = hero.secondaryRole === selectedRole;
        const isSecondaryArr = hero.secondaryRoles?.includes(selectedRole as HeroRole) ?? false;
        if (!isPrimary && !isSecondaryLegacy && !isSecondaryArr) return false;
      }

      // 3. Lane filter
      if (selectedLane !== 'all') {
        const isPrimaryLane = hero.primaryLane === selectedLane;
        const isSecondaryLaneLegacy = hero.secondaryLane === selectedLane;
        const isSecondaryLaneArr = hero.secondaryLanes?.includes(selectedLane as HeroLane) ?? false;
        if (!isPrimaryLane && !isSecondaryLaneLegacy && !isSecondaryLaneArr) return false;
      }

      // 4. Damage type filter
      if (selectedDamageType !== 'all') {
        if (hero.damageType !== selectedDamageType) return false;
      }

      // 5. Playstyle filter (Chất tướng)
      if (selectedPlaystyle !== 'all') {
        if (!hero.playstyles || !hero.playstyles.includes(selectedPlaystyle as HeroPlaystyle)) {
          return false;
        }
      }

      return true;
    });
  }, [heroes, searchTerm, selectedRole, selectedLane, selectedDamageType, selectedPlaystyle]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-left"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black text-white tracking-wide">
                CHỌN TƯỚNG LIÊN QUÂN MOBILE
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {targetSlotName}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Chọn tướng phù hợp cho vị trí <strong className="text-amber-300">{targetLane}</strong> (Hỗ trợ lọc theo Vai trò &amp; Chất tướng chuẩn 01/11/2026)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-800 space-y-2.5 bg-slate-950/40">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên tướng (Dyadia, Dolia, Stuart, Florentino, Elsu...)"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Role Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0 mr-1">
              Vai trò chính:
            </span>
            {['Tất cả', ...ROLE_OPTIONS].map(role => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-all ${
                  selectedRole === role
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Playstyle (Chất tướng) Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] font-semibold text-amber-400/90 shrink-0 mr-1">
              Chất tướng:
            </span>
            <button
              onClick={() => setSelectedPlaystyle('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium cursor-pointer whitespace-nowrap transition-all ${
                selectedPlaystyle === 'all'
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Tất cả chất tướng
            </button>
            {PLAYSTYLE_OPTIONS.map(ps => (
              <button
                key={ps}
                onClick={() => setSelectedPlaystyle(ps)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium cursor-pointer whitespace-nowrap transition-all ${
                  selectedPlaystyle === ps
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {ps}
              </button>
            ))}
          </div>

          {/* Lane & Damage Type Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0 mr-1">
              Đường đi:
            </span>
            {LANE_OPTIONS.map(lane => {
              const val = (lane as any).value || (lane as any).id;
              return (
                <button
                  key={val}
                  onClick={() => setSelectedLane(val)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer whitespace-nowrap transition-all ${
                    selectedLane === val
                      ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lane.label}
                </button>
              );
            })}

            <span className="text-slate-700 mx-1">|</span>

            {/* Damage Type Filter */}
            {['all', 'Vật lý', 'Phép', 'Chuẩn', 'Hỗn hợp'].map(dType => (
              <button
                key={dType}
                onClick={() => setSelectedDamageType(dType)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer whitespace-nowrap transition-all ${
                  selectedDamageType === dType
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {dType === 'all' ? 'Tất Cả Dame' : dType}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Grid */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 min-h-[320px]">
          {filteredHeroes.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto opacity-70" />
              <p className="font-semibold text-sm">Không tìm thấy tướng nào phù hợp với bộ lọc hiện tại.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedRole('Tất cả');
                  setSelectedLane('all');
                  setSelectedDamageType('all');
                  setSelectedPlaystyle('all');
                }}
                className="text-xs text-amber-400 hover:underline cursor-pointer"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
              {filteredHeroes.map(hero => {
                const isPickedInSameTeam = selectedHeroIdsInTeam.includes(hero.id);
                const isPickedInOtherTeam =
                  !allowCrossTeamDuplicates && selectedHeroIdsOtherTeam.includes(hero.id);
                const isBlocked = isPickedInSameTeam || isPickedInOtherTeam;

                const secondaryRolesText =
                  hero.secondaryRoles && hero.secondaryRoles.length > 0
                    ? hero.secondaryRoles.join(', ')
                    : hero.secondaryRole || '';

                return (
                  <button
                    key={hero.id}
                    disabled={isBlocked}
                    onClick={() => {
                      if (!isBlocked) {
                        onSelectHero(hero);
                        onClose();
                      }
                    }}
                    className={`group relative rounded-xl border p-2.5 text-left transition-all flex flex-col justify-between ${
                      isBlocked
                        ? 'bg-slate-950/40 border-slate-800/50 opacity-40 cursor-not-allowed'
                        : 'bg-slate-950/80 hover:bg-slate-800/90 border-slate-800 hover:border-amber-500/50 hover:shadow-lg cursor-pointer active:scale-98'
                    }`}
                  >
                    <div>
                      {/* Avatar / Portrait */}
                      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-slate-800 mb-2 border border-slate-800">
                        <img
                          src={hero.avatar}
                          alt={hero.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={e => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />

                        {/* Lane & Damage Indicator */}
                        <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between text-[10px] text-white font-bold">
                          <span className="bg-slate-900/90 px-1.5 py-0.5 rounded backdrop-blur-xs border border-slate-700">
                            {hero.primaryLane}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded backdrop-blur-xs ${
                              hero.damageType === 'Chuẩn'
                                ? 'bg-amber-500/90 text-slate-950 font-black'
                                : hero.damageType === 'Phép'
                                ? 'bg-purple-600/90 text-white'
                                : 'bg-rose-600/90 text-white'
                            }`}
                          >
                            {hero.damageType}
                          </span>
                        </div>

                        {/* Picked Stamp */}
                        {isPickedInSameTeam && (
                          <div className="absolute inset-0 bg-black/75 flex items-center justify-center p-1 text-center">
                            <span className="text-[10px] font-black text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/40">
                              ĐÃ CHỌN
                            </span>
                          </div>
                        )}
                        {isPickedInOtherTeam && (
                          <div className="absolute inset-0 bg-black/75 flex items-center justify-center p-1 text-center">
                            <span className="text-[10px] font-black text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/40">
                              ĐỐI THỦ CHỌN
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Name & Title */}
                      <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-400 transition-colors truncate">
                        {hero.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate">
                        {hero.role} {secondaryRolesText ? `· ${secondaryRolesText}` : ''}
                      </p>

                      {/* Playstyles Pills */}
                      {hero.playstyles && hero.playstyles.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {hero.playstyles.slice(0, 2).map(ps => (
                            <span
                              key={ps}
                              className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800/90 text-slate-300 border border-slate-700/80"
                            >
                              {ps}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Stats Mini Bars */}
                    <div className="mt-2 pt-1.5 border-t border-slate-800/80 space-y-1 text-[10px] text-slate-400 font-mono">
                      <div className="flex items-center justify-between">
                        <span>Chống chịu</span>
                        <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${hero.ratings.tankiness * 10}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Sát thương</span>
                        <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-rose-500"
                            style={{ width: `${hero.ratings.damage * 10}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Khống chế</span>
                        <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400"
                            style={{ width: `${hero.ratings.crowdControl * 10}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/80 text-xs text-slate-400">
          <span>
            Đang hiển thị <strong>{filteredHeroes.length}</strong> / {heroes.length} tướng (Dữ liệu máy chủ Việt Nam 01/11/2026)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl cursor-pointer transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
