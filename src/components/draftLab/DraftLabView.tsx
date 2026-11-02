import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DraftHero, HeroLane, TeamEvaluation, DraftComparisonResult, TeamSlot } from '../../types/draftLab';
import { INITIAL_DRAFT_HEROES } from '../../data/draftHeroesData';
import { compareTeams, evaluateTeam, DISCLAIMER_TEXT } from '../../utils/draftAnalysisEngine';
import { HeroPickerModal } from './HeroPickerModal';
import { DraftHistoryModal } from './DraftHistoryModal';
import api from '../../lib/apiClient';
import {
  Swords,
  Shield,
  Zap,
  Target,
  Sparkles,
  RefreshCw,
  Share2,
  Download,
  Bookmark,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  TrendingUp,
  Info,
  Layers,
  Award,
  ChevronRight,
  Crown,
  Copy,
  Check,
  RotateCcw,
  Plus
} from 'lucide-react';

const LANE_DEFS: { lane: HeroLane; name: string; icon: string }[] = [
  { lane: 'Caesar', name: 'Đường Tà Thần Caesar', icon: '⚔️' },
  { lane: 'Rừng', name: 'Đường Rừng', icon: '🌲' },
  { lane: 'Mid', name: 'Đường Giữa', icon: '⚡' },
  { lane: 'AD', name: 'Xạ Thủ Rồng', icon: '🏹' },
  { lane: 'Support', name: 'Trợ Thủ / Đỡ Đòn', icon: '🛡️' }
];

export const DraftLabView: React.FC = () => {
  const { isLoggedIn, currentUser, openLoginModal } = useApp();

  // All available heroes
  const [heroes, setHeroes] = useState<DraftHero[]>(INITIAL_DRAFT_HEROES);
  const [isLoadingHeroes, setIsLoadingHeroes] = useState(false);

  // Team A (Blue Team) & Team B (Red Team) - 5 slots each
  const [teamA, setTeamA] = useState<(DraftHero | null)[]>([null, null, null, null, null]);
  const [teamB, setTeamB] = useState<(DraftHero | null)[]>([null, null, null, null, null]);
  const [teamAName, setTeamAName] = useState('Đội Xanh (Blue Team)');
  const [teamBName, setTeamBName] = useState('Đội Đỏ (Red Team)');

  // Settings
  const [allowCrossTeamDuplicates, setAllowCrossTeamDuplicates] = useState(false);

  // Active Picker Modal State
  const [pickerState, setPickerState] = useState<{
    isOpen: boolean;
    team: 'A' | 'B';
    slotIndex: number;
    lane: HeroLane;
    slotName: string;
  }>({
    isOpen: false,
    team: 'A',
    slotIndex: 0,
    lane: 'Caesar',
    slotName: 'Đường Tà Thần Caesar'
  });

  // Analysis result state
  const [analysisResult, setAnalysisResult] = useState<DraftComparisonResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Saved and history modal
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);

  // Canvas ref for image export
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch heroes and status from backend
  useEffect(() => {
    let isMounted = true;
    const fetchDraftData = async () => {
      try {
        setIsLoadingHeroes(true);
        const res = await api.get('/api/draft-lab/heroes');
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          if (isMounted) setHeroes(res.data.data);
        }
      } catch (err) {
        console.warn('Could not fetch heroes from backend, using initial dataset:', err);
      } finally {
        if (isMounted) setIsLoadingHeroes(false);
      }
    };
    fetchDraftData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch saved drafts if user is logged in
  useEffect(() => {
    if (!isLoggedIn) {
      setSavedDrafts([]);
      return;
    }
    const fetchSaved = async () => {
      try {
        const res = await api.get('/api/draft-lab/saved');
        if (res.data?.success && Array.isArray(res.data.data)) {
          setSavedDrafts(res.data.data);
        }
      } catch (err) {
        console.warn('Could not load saved drafts:', err);
      }
    };
    fetchSaved();
  }, [isLoggedIn]);

  // Selected hero IDs for validation
  const teamAHeroIds = useMemo(() => teamA.filter((h): h is DraftHero => h !== null).map(h => h.id), [teamA]);
  const teamBHeroIds = useMemo(() => teamB.filter((h): h is DraftHero => h !== null).map(h => h.id), [teamB]);

  // Slot click handler
  const handleSlotClick = (team: 'A' | 'B', slotIndex: number) => {
    const laneDef = LANE_DEFS[slotIndex] || LANE_DEFS[0];
    setPickerState({
      isOpen: true,
      team,
      slotIndex,
      lane: laneDef.lane,
      slotName: `${laneDef.name} (${team === 'A' ? teamAName : teamBName})`
    });
  };

  // Hero selected from modal
  const handleSelectHero = (hero: DraftHero) => {
    if (pickerState.team === 'A') {
      const nextTeamA = [...teamA];
      nextTeamA[pickerState.slotIndex] = hero;
      setTeamA(nextTeamA);
    } else {
      const nextTeamB = [...teamB];
      nextTeamB[pickerState.slotIndex] = hero;
      setTeamB(nextTeamB);
    }
    // Invalidate stale comparison result
    setAnalysisResult(null);
  };

  // Remove hero from slot
  const handleRemoveHero = (team: 'A' | 'B', slotIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (team === 'A') {
      const next = [...teamA];
      next[slotIndex] = null;
      setTeamA(next);
    } else {
      const next = [...teamB];
      next[slotIndex] = null;
      setTeamB(next);
    }
    setAnalysisResult(null);
  };

  // Clear entire team
  const handleClearTeam = (team: 'A' | 'B') => {
    if (team === 'A') setTeamA([null, null, null, null, null]);
    else setTeamB([null, null, null, null, null]);
    setAnalysisResult(null);
  };

  // Presets load
  const handleLoadPreset = (presetName: string) => {
    if (presetName === 'meta_sgp') {
      // Saigon Phantom championship composition
      const florentino = heroes.find(h => h.id === 'hero_florentino') || heroes[0];
      const aoi = heroes.find(h => h.id === 'hero_aoi') || heroes[9];
      const raz = heroes.find(h => h.id === 'hero_raz') || heroes[15];
      const elsu = heroes.find(h => h.id === 'hero_elsu') || heroes[21];
      const thane = heroes.find(h => h.id === 'hero_thane') || heroes[27];
      setTeamA([florentino, aoi, raz, elsu, thane]);

      const maloch = heroes.find(h => h.id === 'hero_maloch') || heroes[1];
      const nakroth = heroes.find(h => h.id === 'hero_nakroth') || heroes[10];
      const liliana = heroes.find(h => h.id === 'hero_liliana') || heroes[17];
      const capheny = heroes.find(h => h.id === 'hero_capheny') || heroes[23];
      const helen = heroes.find(h => h.id === 'hero_helen') || heroes[28];
      setTeamB([maloch, nakroth, liliana, capheny, helen]);
    } else if (presetName === 'wombo_combo') {
      const maloch = heroes.find(h => h.id === 'hero_maloch') || heroes[1];
      const zuka = heroes.find(h => h.id === 'hero_zuka') || heroes[5];
      const krixi = heroes.find(h => h.id === 'hero_krixi') || heroes[18];
      const violet = heroes.find(h => h.id === 'hero_violet') || heroes[24];
      const grakk = heroes.find(h => h.id === 'hero_grakk') || heroes[30];
      setTeamA([maloch, zuka, krixi, violet, grakk]);

      const omen = heroes.find(h => h.id === 'hero_omen') || heroes[2];
      const keera = heroes.find(h => h.id === 'hero_keera') || heroes[11];
      const tulen = heroes.find(h => h.id === 'hero_tulen') || heroes[16];
      const hayate = heroes.find(h => h.id === 'hero_hayate') || heroes[22];
      const mina = heroes.find(h => h.id === 'hero_mina') || heroes[31];
      setTeamB([omen, keera, tulen, hayate, mina]);
    }
    setAnalysisResult(null);
  };

  // Perform Analysis
  const handleAnalyze = async () => {
    const validHeroesA = teamA.filter((h): h is DraftHero => h !== null);
    const validHeroesB = teamB.filter((h): h is DraftHero => h !== null);

    if (validHeroesA.length === 0 && validHeroesB.length === 0) {
      setAnalysisError('Vui lòng chọn ít nhất 1 đội hình để tiến hành phân tích chiến thuật.');
      return;
    }

    setAnalysisError(null);
    setIsAnalyzing(true);

    try {
      // Direct client calculation + backend optional logging
      const res = compareTeams(validHeroesA, validHeroesB, teamAName, teamBName);
      setAnalysisResult(res);

      // Async backend logging if user is logged in
      if (isLoggedIn) {
        api.post('/api/draft-lab/analyze', {
          teamA: validHeroesA,
          teamB: validHeroesB,
          teamAName,
          teamBName,
          saveToHistory: true
        }).catch(() => {});
      }

      // Smooth scroll to results
      setTimeout(() => {
        const el = document.getElementById('draft-analysis-result-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (err: any) {
      console.error('Error analyzing draft:', err);
      setAnalysisError('Có lỗi xảy ra trong quá trình phân tích chiến thuật.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save draft
  const handleSaveDraft = async () => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    if (!analysisResult) return;

    setIsSaving(true);
    setSaveSuccessMsg(null);

    try {
      const res = await api.post('/api/draft-lab/save', {
        title: `${teamAName} vs ${teamBName}`,
        teamA: analysisResult.teamA,
        teamB: analysisResult.teamB,
        teamAName: analysisResult.teamAName,
        teamBName: analysisResult.teamBName,
        evalA: analysisResult.evalA,
        evalB: analysisResult.evalB,
        headToHead: analysisResult.headToHead
      });

      if (res.data?.success) {
        setSaveSuccessMsg('Đã lưu đội hình vào tài khoản của bạn thành công!');
        if (res.data.data) {
          setSavedDrafts(prev => [res.data.data, ...prev]);
        }
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      } else {
        alert(res.data?.message || 'Không thể lưu đội hình.');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi lưu đội hình.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete saved draft
  const handleDeleteSavedDraft = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa đội hình đã lưu này?')) return;
    try {
      await api.delete(`/api/draft-lab/saved/${id}`);
      setSavedDrafts(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      alert('Không thể xóa đội hình.');
    }
  };

  // Load saved draft into state
  const handleLoadDraftFromHistory = (draft: any) => {
    if (Array.isArray(draft.teamAHeroes)) {
      const newA = [...teamA];
      draft.teamAHeroes.forEach((h: any, idx: number) => {
        if (idx < 5) newA[idx] = h;
      });
      setTeamA(newA);
    }
    if (Array.isArray(draft.teamBHeroes)) {
      const newB = [...teamB];
      draft.teamBHeroes.forEach((h: any, idx: number) => {
        if (idx < 5) newB[idx] = h;
      });
      setTeamB(newB);
    }
    if (draft.teamAName) setTeamAName(draft.teamAName);
    if (draft.teamBName) setTeamBName(draft.teamBName);

    if (draft.evaluationA && draft.evaluationB) {
      setAnalysisResult({
        id: draft.id || `loaded_${Date.now()}`,
        title: draft.title || `${draft.teamAName} vs ${draft.teamBName}`,
        teamA: draft.teamAHeroes || [],
        teamB: draft.teamBHeroes || [],
        teamAName: draft.teamAName || 'Đội A',
        teamBName: draft.teamBName || 'Đội B',
        evalA: draft.evaluationA,
        evalB: draft.evaluationB,
        headToHead: draft.headToHead,
        createdAt: draft.createdAt || new Date().toISOString()
      });
    } else {
      setAnalysisResult(null);
    }
  };

  // Copy share link
  const handleCopyShareLink = () => {
    const url = window.location.origin + '/draft-lab';
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Export Summary Card Image via Canvas
  const handleExportImage = () => {
    if (!analysisResult) return;
    setIsExportingImage(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Dark background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 630);
      bgGrad.addColorStop(0, '#090D16');
      bgGrad.addColorStop(1, '#0F172A');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 630);

      // Header Top Bar
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(0, 0, 1200, 6);

      // Title & Branding
      ctx.font = 'bold 32px sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('LQ DRAFT LAB · BÁO CÁO PHÂN TÍCH ĐỘI HÌNH', 50, 60);

      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(
        'Phòng phân tích chiến thuật Liên Quân Mobile chuyên sâu · CHOLIENQUAN.COM',
        50,
        90
      );

      // Team A Card (Blue)
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(50, 130, 520, 380);
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;
      ctx.strokeRect(50, 130, 520, 380);

      ctx.font = 'bold 22px sans-serif';
      ctx.fillStyle = '#60A5FA';
      ctx.fillText(teamAName, 70, 175);

      ctx.font = 'bold 48px monospace';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`${analysisResult.evalA.overallScore}đ`, 450, 180);

      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#CBD5E1';
      analysisResult.teamA.forEach((hero, i) => {
        ctx.fillText(`• ${LANE_DEFS[i]?.name || 'Vị trí'}: ${hero.name} (${hero.role})`, 70, 230 + i * 36);
      });

      // Team B Card (Red)
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(630, 130, 520, 380);
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(630, 130, 520, 380);

      ctx.font = 'bold 22px sans-serif';
      ctx.fillStyle = '#F87171';
      ctx.fillText(teamBName, 650, 175);

      ctx.font = 'bold 48px monospace';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`${analysisResult.evalB.overallScore}đ`, 1030, 180);

      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#CBD5E1';
      analysisResult.teamB.forEach((hero, i) => {
        ctx.fillText(`• ${LANE_DEFS[i]?.name || 'Vị trí'}: ${hero.name} (${hero.role})`, 650, 230 + i * 36);
      });

      // Bottom Verdict bar
      ctx.fillStyle = '#0B1222';
      ctx.fillRect(50, 530, 1100, 70);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(50, 530, 1100, 70);

      ctx.font = 'bold 15px sans-serif';
      ctx.fillStyle = '#F59E0B';
      ctx.fillText('KẾT LUẬN CHIẾN THUẬT: ' + analysisResult.headToHead.detailedVerdict, 70, 565);

      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText(DISCLAIMER_TEXT, 70, 588);

      // Download trigger
      const link = document.createElement('a');
      link.download = `LQ_Draft_Lab_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Error generating image:', e);
      alert('Không thể tạo báo cáo ảnh trên trình duyệt của bạn.');
    } finally {
      setIsExportingImage(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 text-left">
      {/* ========================================================
          1. HERO HEADER BANNER (ESPORTS TACTICAL ATMOSPHERE)
         ======================================================== */}
      <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-800 bg-slate-950/90 shadow-2xl">
        <div className="relative h-48 sm:h-64 md:h-72 w-full overflow-hidden">
          <img
            src="/src/assets/images/draft_lab_hero_banner_1793529534511.jpg"
            alt="LQ Draft Lab Hero Banner"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-85"
            onError={e => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-transparent to-slate-950/80" />

          {/* Banner Text Content */}
          <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-8 right-4 sm:right-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-sm">
                  MODULE MỚI · ĐỘC LẬP
                </span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  Chiến Thuật 5v5 Chuẩn Thi Đấu
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                LQ DRAFT LAB
                <span className="text-amber-400 block sm:inline sm:ml-3 text-lg sm:text-2xl font-bold text-slate-300">
                  Phòng Phân Tích Đội Hình Liên Quân Mobile
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 line-clamp-2">
                Mô phỏng cấm chọn, đánh giá chất tướng, đo lường điểm mạnh/yếu, phân tích đối đầu 5 đường và đề xuất chiến thuật leo rank chuẩn meta.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsHistoryModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-md"
              >
                <Clock size={14} className="text-amber-400" />
                <span>Đội Hình Đã Lưu ({savedDrafts.length})</span>
              </button>

              <button
                onClick={handleCopyShareLink}
                className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-md"
              >
                {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
                <span>{copiedLink ? 'Đã Sao Chép Link!' : 'Chia Sẻ'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mandatory Transparency Disclaimer Banner */}
        <div className="px-4 sm:px-6 py-2.5 bg-amber-500/10 border-t border-amber-500/20 text-[11px] sm:text-xs text-amber-300/90 flex items-center gap-2">
          <Info size={14} className="text-amber-400 shrink-0" />
          <span>{DISCLAIMER_TEXT}</span>
        </div>
      </section>

      {/* ========================================================
          2. DRAFT LAB CONTROL TOOLBAR & PRESETS
         ======================================================== */}
      <section className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" /> Đội hình mẫu chuẩn thi đấu:
            </span>
            <button
              onClick={() => handleLoadPreset('meta_sgp')}
              className="px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold transition-all cursor-pointer"
            >
              Saigon Phantom Meta (Elsu - Aoi)
            </button>
            <button
              onClick={() => handleLoadPreset('wombo_combo')}
              className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold transition-all cursor-pointer"
            >
              Wombo Combat (Maloch - Krixi)
            </button>
          </div>

          {/* Duplicates Rule Switch */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 self-start md:self-auto">
            <span className="text-[11px] text-slate-400">Chế độ cấm chọn:</span>
            <button
              onClick={() => setAllowCrossTeamDuplicates(!allowCrossTeamDuplicates)}
              className={`text-xs font-bold cursor-pointer transition-colors ${
                allowCrossTeamDuplicates ? 'text-amber-400' : 'text-blue-400'
              }`}
            >
              {allowCrossTeamDuplicates
                ? 'Đấu Tập (Cho trùng 2 đội)'
                : 'Chuẩn Giải Đấu (Không trùng)'}
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. TWO-TEAM 5v5 LINEUP SELECTION CANVASES
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* ==================== ĐỘI A (ĐỘI XANH / BLUE TEAM) ==================== */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-blue-500/30 shadow-xl space-y-4">
          {/* Header Team A */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
              <input
                type="text"
                value={teamAName}
                onChange={e => setTeamAName(e.target.value)}
                className="bg-transparent text-sm sm:text-base font-black text-white focus:outline-none focus:border-b border-blue-500"
                placeholder="Tên Đội A"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-blue-400">
                {teamAHeroIds.length}/5 TƯỚNG
              </span>
              <button
                onClick={() => handleClearTeam('A')}
                className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                Xóa
              </button>
            </div>
          </div>

          {/* 5 Slots for Team A */}
          <div className="space-y-2.5">
            {LANE_DEFS.map((laneDef, index) => {
              const hero = teamA[index];
              return (
                <div
                  key={index}
                  onClick={() => handleSlotClick('A', index)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    hero
                      ? 'bg-slate-950/80 border-blue-500/30 hover:border-blue-400 shadow-md'
                      : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950/70 border-dashed'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Lane Icon Badge */}
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col items-center justify-center shrink-0">
                      <span className="text-sm">{laneDef.icon}</span>
                      <span className="text-[9px] font-black text-blue-300 leading-tight">
                        {laneDef.lane}
                      </span>
                    </div>

                    {/* Hero Info or Empty Placeholder */}
                    {hero ? (
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl overflow-hidden border border-blue-500/40 bg-slate-800 shrink-0">
                          <img
                            src={hero.avatar}
                            alt={hero.name}
                            className="w-full h-full object-cover"
                            onError={e => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-black text-sm text-white truncate">{hero.name}</h4>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-black ${
                                hero.damageType === 'Chuẩn'
                                  ? 'bg-amber-400/20 text-amber-300'
                                  : hero.damageType === 'Phép'
                                  ? 'bg-purple-500/20 text-purple-300'
                                  : 'bg-rose-500/20 text-rose-300'
                              }`}
                            >
                              {hero.damageType}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">
                            {hero.title} · <strong className="text-slate-300">{hero.role}</strong>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-semibold text-slate-400">
                          Chưa chọn tướng ({laneDef.name})
                        </p>
                        <span className="text-[11px] text-blue-400 hover:underline">
                          + Nhấn để chọn tướng
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Slot Action Controls */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {hero ? (
                      <button
                        onClick={e => handleRemoveHero('A', index, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Gỡ bỏ tướng"
                      >
                        ✕
                      </button>
                    ) : (
                      <span className="p-1.5 text-slate-500">
                        <Plus size={16} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================== ĐỘI B (ĐỘI ĐỎ / RED TEAM) ==================== */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-rose-500/30 shadow-xl space-y-4">
          {/* Header Team B */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
              <input
                type="text"
                value={teamBName}
                onChange={e => setTeamBName(e.target.value)}
                className="bg-transparent text-sm sm:text-base font-black text-white focus:outline-none focus:border-b border-rose-500"
                placeholder="Tên Đội B"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-rose-400">
                {teamBHeroIds.length}/5 TƯỚNG
              </span>
              <button
                onClick={() => handleClearTeam('B')}
                className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                Xóa
              </button>
            </div>
          </div>

          {/* 5 Slots for Team B */}
          <div className="space-y-2.5">
            {LANE_DEFS.map((laneDef, index) => {
              const hero = teamB[index];
              return (
                <div
                  key={index}
                  onClick={() => handleSlotClick('B', index)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    hero
                      ? 'bg-slate-950/80 border-rose-500/30 hover:border-rose-400 shadow-md'
                      : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950/70 border-dashed'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Lane Icon Badge */}
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex flex-col items-center justify-center shrink-0">
                      <span className="text-sm">{laneDef.icon}</span>
                      <span className="text-[9px] font-black text-rose-300 leading-tight">
                        {laneDef.lane}
                      </span>
                    </div>

                    {/* Hero Info or Empty Placeholder */}
                    {hero ? (
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl overflow-hidden border border-rose-500/40 bg-slate-800 shrink-0">
                          <img
                            src={hero.avatar}
                            alt={hero.name}
                            className="w-full h-full object-cover"
                            onError={e => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-black text-sm text-white truncate">{hero.name}</h4>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-black ${
                                hero.damageType === 'Chuẩn'
                                  ? 'bg-amber-400/20 text-amber-300'
                                  : hero.damageType === 'Phép'
                                  ? 'bg-purple-500/20 text-purple-300'
                                  : 'bg-rose-500/20 text-rose-300'
                              }`}
                            >
                              {hero.damageType}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">
                            {hero.title} · <strong className="text-slate-300">{hero.role}</strong>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-semibold text-slate-400">
                          Chưa chọn tướng ({laneDef.name})
                        </p>
                        <span className="text-[11px] text-rose-400 hover:underline">
                          + Nhấn để chọn tướng
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Slot Action Controls */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {hero ? (
                      <button
                        onClick={e => handleRemoveHero('B', index, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Gỡ bỏ tướng"
                      >
                        ✕
                      </button>
                    ) : (
                      <span className="p-1.5 text-slate-500">
                        <Plus size={16} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================
          4. MAIN CTA BUTTON: PHÂN TÍCH ĐỘI HÌNH
         ======================================================== */}
      <div className="flex flex-col items-center justify-center gap-3 pt-2">
        {analysisError && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2 max-w-lg">
            <AlertTriangle size={16} className="shrink-0 text-rose-400" />
            <span>{analysisError}</span>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full sm:w-auto min-w-[300px] sm:min-w-[380px] py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-base sm:text-lg tracking-wide uppercase transition-all shadow-xl shadow-amber-500/25 cursor-pointer active:scale-98 flex items-center justify-center gap-3 disabled:opacity-60"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>ĐANG TÍNH TOÁN CHIẾN THUẬT...</span>
            </>
          ) : (
            <>
              <Swords className="w-6 h-6" />
              <span>PHÂN TÍCH ĐỘI HÌNH LIÊN QUÂN</span>
            </>
          )}
        </button>

        <p className="text-xs text-slate-400 text-center">
          Hệ thống sẽ đối chiếu chất tướng, nguồn sát thương, khống chế và khả năng kiểm soát bùa lợi giữa 2 đội
        </p>
      </div>

      {/* ========================================================
          5. DETAILED ANALYSIS RESULTS SECTION
         ======================================================== */}
      {analysisResult && (
        <section
          id="draft-analysis-result-section"
          className="space-y-6 pt-4 animate-in fade-in duration-300"
        >
          {/* Action Notification */}
          {saveSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Overview Scoreboard Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
              {/* Team A Score */}
              <div className="flex-1 text-center md:text-left space-y-1">
                <span className="text-xs font-black text-blue-400 tracking-wider uppercase">
                  {analysisResult.teamAName}
                </span>
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <span className="text-4xl sm:text-5xl font-black text-white font-mono">
                    {analysisResult.evalA.overallScore}
                  </span>
                  <span className="text-sm font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    Hạng {analysisResult.evalA.grade}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {analysisResult.evalA.strengths[0] || 'Đội hình cân bằng'}
                </p>
              </div>

              {/* VS & Winner Badge */}
              <div className="text-center px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 shrink-0">
                <span className="text-xs font-black text-slate-500 tracking-widest block mb-1">
                  ĐỐI ĐẦU CHIẾN THUẬT
                </span>
                <span
                  className={`text-sm sm:text-base font-black px-3 py-1 rounded-xl inline-block ${
                    analysisResult.headToHead.overallAdvantage === 'teamA'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                      : analysisResult.headToHead.overallAdvantage === 'teamB'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}
                >
                  {analysisResult.headToHead.overallAdvantage === 'teamA'
                    ? `LỢI THẾ: ${analysisResult.teamAName}`
                    : analysisResult.headToHead.overallAdvantage === 'teamB'
                    ? `LỢI THẾ: ${analysisResult.teamBName}`
                    : 'KÈO CÂN TÀI CÂN SỨC'}
                </span>
              </div>

              {/* Team B Score */}
              <div className="flex-1 text-center md:text-right space-y-1">
                <span className="text-xs font-black text-rose-400 tracking-wider uppercase">
                  {analysisResult.teamBName}
                </span>
                <div className="flex items-center justify-center md:justify-end gap-3">
                  <span className="text-sm font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    Hạng {analysisResult.evalB.grade}
                  </span>
                  <span className="text-4xl sm:text-5xl font-black text-white font-mono">
                    {analysisResult.evalB.overallScore}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {analysisResult.evalB.strengths[0] || 'Đội hình cân bằng'}
                </p>
              </div>
            </div>

            {/* Verdict text */}
            <div className="pt-4 text-xs sm:text-sm text-slate-300 leading-relaxed text-center max-w-3xl mx-auto">
              {analysisResult.headToHead.detailedVerdict}
            </div>

            {/* Tactical Action Bar */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-center gap-2.5">
              <button
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <Bookmark size={15} />
                <span>{isSaving ? 'Đang lưu...' : 'Lưu Đội Hình & Kết Quả'}</span>
              </button>

              <button
                onClick={handleExportImage}
                disabled={isExportingImage}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <Download size={15} />
                <span>{isExportingImage ? 'Đang vẽ ảnh...' : 'Tải Báo Cáo Ảnh (PNG)'}</span>
              </button>

              <button
                onClick={handleCopyShareLink}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                {copiedLink ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                <span>{copiedLink ? 'Đã sao chép liên kết!' : 'Sao Chép Link'}</span>
              </button>
            </div>
          </div>

          {/* Tactical Metric Comparison Bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* 6 Tactical Pillars */}
            <div className="p-5 rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Target className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">CHỈ SỐ CHIẾN THUẬT CỐT LÕI</h3>
              </div>

              <div className="space-y-3.5 text-xs">
                {[
                  {
                    label: 'Khả Năng Chống Chịu (Tankiness)',
                    valA: analysisResult.evalA.tankinessScore,
                    valB: analysisResult.evalB.tankinessScore
                  },
                  {
                    label: 'Sát Thương Dồn & DPS (Burst)',
                    valA: analysisResult.evalA.burstDamageScore,
                    valB: analysisResult.evalB.burstDamageScore
                  },
                  {
                    label: 'Khống Chế Cứng (Crowd Control)',
                    valA: analysisResult.evalA.crowdControlScore,
                    valB: analysisResult.evalB.crowdControlScore
                  },
                  {
                    label: 'Mở Giao Tranh (Engage)',
                    valA: analysisResult.evalA.engageScore,
                    valB: analysisResult.evalB.engageScore
                  },
                  {
                    label: 'Bảo Vệ Chủ Lực (Peel & Sustain)',
                    valA: analysisResult.evalA.peelScore,
                    valB: analysisResult.evalB.peelScore
                  },
                  {
                    label: 'Giao Tranh Tổng 5v5 (Teamfight)',
                    valA: analysisResult.evalA.teamfightScore,
                    valB: analysisResult.evalB.teamfightScore
                  }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                      <span className="text-blue-400 font-mono">{item.valA}đ</span>
                      <span>{item.label}</span>
                      <span className="text-rose-400 font-mono">{item.valB}đ</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 h-2 bg-slate-950 rounded-full p-0.5 overflow-hidden">
                      {/* Team A bar (reaches from right to left) */}
                      <div className="flex justify-end">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${item.valA}%` }}
                        />
                      </div>
                      {/* Team B bar (reaches from left to right) */}
                      <div className="flex justify-start">
                        <div
                          className="h-full bg-rose-500 rounded-full"
                          style={{ width: `${item.valB}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Damage Composition & Game Phase Curves */}
            <div className="p-5 rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">NGUỒN SÁT THƯƠNG & GIAI ĐOẠN</h3>
              </div>

              {/* Damage Mix Breakdown */}
              <div className="space-y-3 text-xs">
                <span className="text-slate-400 font-semibold block text-[11px]">
                  Cơ cấu sát thương (Vật lý / Phép / Chuẩn):
                </span>

                {/* Team A Damage Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-blue-400 font-bold">
                    <span>{analysisResult.teamAName}</span>
                    <span>
                      VL: {analysisResult.evalA.damageComposition.physical}% · Phép:{' '}
                      {analysisResult.evalA.damageComposition.magic}% · Chuẩn:{' '}
                      {analysisResult.evalA.damageComposition.trueDamage}%
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-950 flex overflow-hidden">
                    <div
                      className="bg-rose-500"
                      style={{ width: `${analysisResult.evalA.damageComposition.physical}%` }}
                      title="Vật lý"
                    />
                    <div
                      className="bg-purple-600"
                      style={{ width: `${analysisResult.evalA.damageComposition.magic}%` }}
                      title="Phép"
                    />
                    <div
                      className="bg-amber-400"
                      style={{ width: `${analysisResult.evalA.damageComposition.trueDamage}%` }}
                      title="Chuẩn"
                    />
                  </div>
                </div>

                {/* Team B Damage Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] text-rose-400 font-bold">
                    <span>{analysisResult.teamBName}</span>
                    <span>
                      VL: {analysisResult.evalB.damageComposition.physical}% · Phép:{' '}
                      {analysisResult.evalB.damageComposition.magic}% · Chuẩn:{' '}
                      {analysisResult.evalB.damageComposition.trueDamage}%
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-950 flex overflow-hidden">
                    <div
                      className="bg-rose-500"
                      style={{ width: `${analysisResult.evalB.damageComposition.physical}%` }}
                      title="Vật lý"
                    />
                    <div
                      className="bg-purple-600"
                      style={{ width: `${analysisResult.evalB.damageComposition.magic}%` }}
                      title="Phép"
                    />
                    <div
                      className="bg-amber-400"
                      style={{ width: `${analysisResult.evalB.damageComposition.trueDamage}%` }}
                      title="Chuẩn"
                    />
                  </div>
                </div>
              </div>

              {/* Game Phase Comparison */}
              <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-300">Đầu Trận (Phút 1 - 8):</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-bold ${
                        analysisResult.headToHead.earlyGameWinner === 'teamA'
                          ? 'text-blue-400 bg-blue-500/10'
                          : analysisResult.headToHead.earlyGameWinner === 'teamB'
                          ? 'text-rose-400 bg-rose-500/10'
                          : 'text-amber-400 bg-amber-500/10'
                      }`}
                    >
                      {analysisResult.headToHead.earlyGameWinner === 'teamA'
                        ? `${analysisResult.teamAName} nhỉnh hơn`
                        : analysisResult.headToHead.earlyGameWinner === 'teamB'
                        ? `${analysisResult.teamBName} nhỉnh hơn`
                        : 'Cân bằng'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {analysisResult.headToHead.earlyGameAdvantageNote}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-300">Cuối Trận (Từ Phút 15+):</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-bold ${
                        analysisResult.headToHead.lateGameWinner === 'teamA'
                          ? 'text-blue-400 bg-blue-500/10'
                          : analysisResult.headToHead.lateGameWinner === 'teamB'
                          ? 'text-rose-400 bg-rose-500/10'
                          : 'text-amber-400 bg-amber-500/10'
                      }`}
                    >
                      {analysisResult.headToHead.lateGameWinner === 'teamA'
                        ? `${analysisResult.teamAName} áp đảo`
                        : analysisResult.headToHead.lateGameWinner === 'teamB'
                        ? `${analysisResult.teamBName} áp đảo`
                        : 'Cân bằng'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {analysisResult.headToHead.lateGameAdvantageNote}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              LANE-BY-LANE 5-WAY MATCHUP BREAKDOWN
             ======================================================== */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Swords className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm sm:text-base text-white">
                  ĐỐI ĐẦU CHI TIẾT THEO TỪNG ĐƯỜNG (LANE MATCHUPS)
                </h3>
              </div>
              <span className="text-xs text-slate-400">5 Cặp Kèo Thi Đấu</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {analysisResult.headToHead.laneMatchups.map((matchup, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                    <span className="text-xs font-bold text-amber-400">{matchup.laneName}</span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        matchup.winner === 'teamA'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : matchup.winner === 'teamB'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {matchup.winner === 'teamA'
                        ? 'ĐỘI XANH THẮNG KÈO'
                        : matchup.winner === 'teamB'
                        ? 'ĐỘI ĐỎ THẮNG KÈO'
                        : 'KÈO HÒA NHAU'}
                    </span>
                  </div>

                  {/* Two Heroes Clash */}
                  <div className="flex items-center justify-between gap-2">
                    {/* Hero A */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-800 border border-blue-500/50 shrink-0">
                        {matchup.heroA ? (
                          <img
                            src={matchup.heroA.avatar}
                            alt={matchup.heroA.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] flex items-center justify-center h-full text-slate-500">
                            Trống
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-200 truncate">
                        {matchup.heroA?.name || 'Trống'}
                      </span>
                    </div>

                    <span className="text-xs font-black text-slate-600">VS</span>

                    {/* Hero B */}
                    <div className="flex items-center gap-2 min-w-0 justify-end">
                      <span className="text-xs font-bold text-slate-200 truncate">
                        {matchup.heroB?.name || 'Trống'}
                      </span>
                      <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-800 border border-rose-500/50 shrink-0">
                        {matchup.heroB ? (
                          <img
                            src={matchup.heroB.avatar}
                            alt={matchup.heroB.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] flex items-center justify-center h-full text-slate-500">
                            Trống
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Summary note */}
                  <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 p-2 rounded-xl">
                    {matchup.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================
              TACTICAL ADVICE & SUGGESTIONS
             ======================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* Team A Strengths & Weaknesses */}
            <div className="p-5 rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-blue-500/30 shadow-xl space-y-4">
              <h3 className="font-bold text-sm text-blue-400 pb-2 border-b border-slate-800">
                CHIẾN THUẬT: {analysisResult.teamAName}
              </h3>

              <div className="space-y-3 text-xs">
                {/* Playstyle Highlights */}
                {analysisResult.evalA.playstyleHighlights && analysisResult.evalA.playstyleHighlights.length > 0 && (
                  <div>
                    <span className="font-bold text-amber-400 flex items-center gap-1.5 mb-1.5">
                      <Sparkles size={13} /> Đặc điểm chất tướng nổi bật:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysisResult.evalA.playstyleHighlights.map((ph, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-semibold"
                          title={ph.description}
                        >
                          {ph.playstyle} ({ph.count})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 size={13} /> Điểm mạnh nổi bật:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {analysisResult.evalA.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-bold text-rose-400 flex items-center gap-1.5 mb-1">
                    <AlertTriangle size={13} /> Điểm cần lưu ý / Điểm yếu:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {analysisResult.evalA.weaknesses.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-slate-300 text-xs">
                  <strong className="text-blue-300 block mb-1">Lời khuyên thi đấu:</strong>
                  {analysisResult.evalA.tacticalAdvice}
                </div>

                {/* Replacement suggestions if any */}
                {analysisResult.evalA.suggestedReplacements.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
                    <strong className="text-amber-400 flex items-center gap-1">
                      <Sparkles size={13} /> Gợi ý tối ưu đội hình:
                    </strong>
                    {analysisResult.evalA.suggestedReplacements.map((sug, i) => (
                      <p key={i} className="text-slate-300">
                        • {sug.reason} (Đề xuất: <strong>{sug.suggestedHero.name}</strong>)
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Team B Strengths & Weaknesses */}
            <div className="p-5 rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-rose-500/30 shadow-xl space-y-4">
              <h3 className="font-bold text-sm text-rose-400 pb-2 border-b border-slate-800">
                CHIẾN THUẬT: {analysisResult.teamBName}
              </h3>

              <div className="space-y-3 text-xs">
                {/* Playstyle Highlights */}
                {analysisResult.evalB.playstyleHighlights && analysisResult.evalB.playstyleHighlights.length > 0 && (
                  <div>
                    <span className="font-bold text-amber-400 flex items-center gap-1.5 mb-1.5">
                      <Sparkles size={13} /> Đặc điểm chất tướng nổi bật:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysisResult.evalB.playstyleHighlights.map((ph, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-semibold"
                          title={ph.description}
                        >
                          {ph.playstyle} ({ph.count})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 size={13} /> Điểm mạnh nổi bật:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {analysisResult.evalB.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-bold text-rose-400 flex items-center gap-1.5 mb-1">
                    <AlertTriangle size={13} /> Điểm cần lưu ý / Điểm yếu:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {analysisResult.evalB.weaknesses.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-slate-300 text-xs">
                  <strong className="text-rose-300 block mb-1">Lời khuyên thi đấu:</strong>
                  {analysisResult.evalB.tacticalAdvice}
                </div>

                {/* Replacement suggestions if any */}
                {analysisResult.evalB.suggestedReplacements.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
                    <strong className="text-amber-400 flex items-center gap-1">
                      <Sparkles size={13} /> Gợi ý tối ưu đội hình:
                    </strong>
                    {analysisResult.evalB.suggestedReplacements.map((sug, i) => (
                      <p key={i} className="text-slate-300">
                        • {sug.reason} (Đề xuất: <strong>{sug.suggestedHero.name}</strong>)
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================
              6. FUTURE-READY PREMIUM FOUNDATION (TIÊU CHUẨN vs PRO)
             ======================================================== */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5 text-left">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <span className="font-black text-sm text-white">
                  LQ DRAFT LAB PRO & VIP (SẮP RA MẮT)
                </span>
                <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                  LỘ TRÌNH PHÁT TRIỂN
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Gói tiêu chuẩn hiện tại: Miễn phí 100%, phân tích chiến thuật 5v5 không giới hạn, lưu tối đa 10 đội hình.
                Gói Pro tương lai sẽ mở rộng thêm: Phân tích cấm chọn AI tuyển trạch giải đấu, xuất file PDF chiến thuật và không giới hạn lưu trữ.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 shrink-0">
              <span className="text-emerald-400 font-bold block">✓ Gói Hiện Tại: Miễn Phí 100%</span>
              <span>Không thu phí, không trừ tiền ví của người dùng.</span>
            </div>
          </div>
        </section>
      )}

      {/* Hero Picker Modal */}
      <HeroPickerModal
        isOpen={pickerState.isOpen}
        onClose={() => setPickerState(prev => ({ ...prev, isOpen: false }))}
        heroes={heroes}
        onSelectHero={handleSelectHero}
        targetSlotName={pickerState.slotName}
        targetLane={pickerState.lane}
        selectedHeroIdsInTeam={pickerState.team === 'A' ? teamAHeroIds : teamBHeroIds}
        selectedHeroIdsOtherTeam={pickerState.team === 'A' ? teamBHeroIds : teamAHeroIds}
        allowCrossTeamDuplicates={allowCrossTeamDuplicates}
      />

      {/* History Modal */}
      <DraftHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        savedDrafts={savedDrafts}
        onLoadDraft={handleLoadDraftFromHistory}
        onDeleteDraft={handleDeleteSavedDraft}
      />
    </div>
  );
};
