import React, { useState, useEffect } from 'react';
import { DraftHero, HeroRole, HeroLane, HeroPlaystyle, PLAYSTYLE_OPTIONS } from '../../types/draftLab';
import { INITIAL_DRAFT_HEROES, ROLE_OPTIONS, LANE_OPTIONS } from '../../data/draftHeroesData';
import { BatchAddHeroesModal } from './BatchAddHeroesModal';
import api from '../../lib/apiClient';
import {
  Swords,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  Shield,
  Zap,
  TrendingUp,
  Sliders,
  Power,
  X,
  Check,
  Layers,
  Download,
  Copy,
  Sparkles,
  Info,
  Bot,
  RefreshCw
} from 'lucide-react';

export const AdminDraftLabTab: React.FC = () => {
  const [heroes, setHeroes] = useState<DraftHero[]>(INITIAL_DRAFT_HEROES);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('Tất cả');

  // AI Intelligence Stats
  const [aiStats, setAiStats] = useState<{
    isGeminiAvailable: boolean;
    activeModel: string;
    patchVersion: string;
    groundingEnabled: boolean;
    cachedAnalysesCount: number;
  } | null>(null);
  const [isClearingCache, setIsClearingCache] = useState(false);

  // Module toggle
  const [isModuleEnabled, setIsModuleEnabled] = useState(true);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Batch Add Modal State
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  // Duplicate Check Modal / State
  const [duplicateScan, setDuplicateScan] = useState<{
    duplicateCount: number;
    duplicates: { name: string; count: number; items: any[] }[];
  } | null>(null);
  const [isScanningDuplicates, setIsScanningDuplicates] = useState(false);

  // Edit / Add Hero Modal State
  const [editingHero, setEditingHero] = useState<Partial<DraftHero> | null>(null);
  const [isSavingHero, setIsSavingHero] = useState(false);

  // Load Admin Data
  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [heroesRes, statsRes, aiRes] = await Promise.all([
        api.get('/api/draft-lab/heroes').catch(() => null),
        api.get('/api/draft-lab/admin/stats').catch(() => null),
        api.get('/api/draft-lab/admin/ai-settings').catch(() => null)
      ]);

      const isHeroesSuccess = Boolean(heroesRes?.success || heroesRes?.data?.success);
      if (isHeroesSuccess) {
        const list = Array.isArray(heroesRes?.data?.data)
          ? heroesRes.data.data
          : Array.isArray(heroesRes?.data)
          ? heroesRes.data
          : Array.isArray(heroesRes)
          ? heroesRes
          : [];
        if (list.length > 0) setHeroes(list);
      }

      const isStatsSuccess = Boolean(statsRes?.success || statsRes?.data?.success);
      if (isStatsSuccess) {
        const statsData = statsRes?.data?.data || statsRes?.data || statsRes;
        setStats(statsData);
        if (statsData?.settings) {
          setIsModuleEnabled(statsData.settings.enabled ?? true);
        }
      }

      const isAiSuccess = Boolean(aiRes?.success || aiRes?.data?.success);
      if (isAiSuccess) {
        const aiData = aiRes?.data?.data || aiRes?.data || aiRes;
        setAiStats(aiData);
      }
    } catch (err) {
      console.warn('Error loading admin draft lab data:', err);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    loadAdminData();
  }, []);

  // Filtered heroes list
  const filteredHeroes = heroes.filter(h => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = h.name.toLowerCase().includes(q);
      const matchTitle = h.title?.toLowerCase().includes(q) ?? false;
      const matchTag = h.tags?.some(t => t.toLowerCase().includes(q)) ?? false;
      if (!matchName && !matchTitle && !matchTag) return false;
    }
    if (selectedRole !== 'Tất cả') {
      const isPrimary = h.role === selectedRole;
      const isSecondaryLegacy = h.secondaryRole === selectedRole;
      const isSecondaryArr = h.secondaryRoles?.includes(selectedRole as HeroRole) ?? false;
      if (!isPrimary && !isSecondaryLegacy && !isSecondaryArr) return false;
    }
    return true;
  });

  // Toggle Module
  const handleToggleModule = async () => {
    try {
      setIsUpdatingSettings(true);
      const nextState = !isModuleEnabled;
      const res = await api.post('/api/draft-lab/admin/settings', {
        enabled: nextState
      });
      if (res.data?.success) {
        setIsModuleEnabled(nextState);
        setStatusMsg(`Đã ${nextState ? 'BẬT' : 'TẮT'} module LQ Draft Lab thành công!`);
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể cập nhật trạng thái module.');
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  // Check duplicates
  const handleCheckDuplicates = async () => {
    setIsScanningDuplicates(true);
    try {
      const res = await api.get('/api/draft-lab/admin/heroes/check-duplicates');
      if (res.data?.success) {
        setDuplicateScan(res.data);
        if (res.data.duplicateCount === 0) {
          setStatusMsg('Cơ sở dữ liệu hoàn toàn sạch sẽ, không có tướng nào bị trùng lặp!');
          setTimeout(() => setStatusMsg(null), 3500);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể quét dữ liệu trùng.');
    } finally {
      setIsScanningDuplicates(false);
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(heroes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `lienquan_heroes_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['id', 'name', 'title', 'role', 'primaryLane', 'damageType', 'playstyles', 'difficulty'];
    const rows = heroes.map(h => [
      h.id,
      `"${h.name}"`,
      `"${h.title || ''}"`,
      `"${h.role}"`,
      `"${h.primaryLane}"`,
      `"${h.damageType}"`,
      `"${(h.playstyles || []).join(';')}"`,
      `"${h.difficulty}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `lienquan_heroes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Save / Update Hero
  const handleSaveHeroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHero || !editingHero.name || !editingHero.role || !editingHero.primaryLane) {
      alert('Vui lòng điền đủ Tên tướng, Vai trò và Đường đi.');
      return;
    }

    setIsSavingHero(true);
    try {
      const payload = {
        ...editingHero,
        id: editingHero.id || `hero_${editingHero.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        isActive: editingHero.isActive ?? true,
        secondaryRoles: editingHero.secondaryRoles || (editingHero.secondaryRole ? [editingHero.secondaryRole] : []),
        playstyles: editingHero.playstyles || [],
        tacticalNotes: editingHero.tacticalNotes || editingHero.notes || '',
        ratings: {
          tankiness: Number(editingHero.ratings?.tankiness || 5),
          damage: Number(editingHero.ratings?.damage || 5),
          crowdControl: Number(editingHero.ratings?.crowdControl || 5),
          engage: Number(editingHero.ratings?.engage || 5),
          peel: Number(editingHero.ratings?.peel || 5),
          mobility: Number(editingHero.ratings?.mobility || 5),
          earlyGame: Number(editingHero.ratings?.earlyGame || 5),
          lateGame: Number(editingHero.ratings?.lateGame || 5)
        }
      };

      const res = await api.post('/api/draft-lab/admin/hero', payload);
      const isSuccess = Boolean(res?.success || res?.data?.success);
      if (isSuccess) {
        setStatusMsg(`Đã lưu thông tin tướng ${editingHero.name} thành công!`);
        setEditingHero(null);
        loadAdminData();
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        alert(res?.message || res?.data?.message || 'Không thể lưu tướng.');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Lỗi khi lưu thông tin tướng.');
    } finally {
      setIsSavingHero(false);
    }
  };

  // Delete Hero
  const handleDeleteHero = async (heroId: string, heroName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa tướng "${heroName}" khỏi danh sách?`)) return;
    try {
      const res = await api.delete(`/api/draft-lab/admin/hero/${heroId}`);
      const isSuccess = Boolean(res?.success || res?.data?.success);
      if (isSuccess) {
        setStatusMsg(`Đã xóa tướng ${heroName} khỏi hệ thống.`);
        loadAdminData();
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        alert(res?.message || res?.data?.message || 'Không thể xóa tướng.');
      }
    } catch (err) {
      alert('Không thể xóa tướng.');
    }
  };

  // Clear AI Cache
  const handleClearAiCache = async () => {
    if (!confirm('Xác nhận xóa sạch toàn bộ bộ nhớ đệm phân tích AI để làm mới dữ liệu?')) return;
    setIsClearingCache(true);
    try {
      const res = await api.post('/api/draft-lab/admin/ai-cache/clear');
      const isSuccess = Boolean(res?.success || res?.data?.success);
      if (isSuccess) {
        setStatusMsg('Đã dọn sạch toàn bộ bộ nhớ đệm AI thành công!');
        loadAdminData();
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        alert(res?.message || res?.data?.message || 'Không thể xóa bộ nhớ đệm AI.');
      }
    } catch (err) {
      alert('Không thể xóa bộ nhớ đệm AI.');
    } finally {
      setIsClearingCache(false);
    }
  };

  // Role Breakdown counts

  const roleBreakdown: Record<string, number> = {
    'Đấu sĩ': 0,
    'Pháp sư': 0,
    'Xạ thủ': 0,
    'Sát thủ': 0,
    'Đỡ đòn': 0,
    'Trợ thủ': 0
  };
  heroes.forEach(h => {
    if (roleBreakdown[h.role] !== undefined) roleBreakdown[h.role]++;
  });

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      {/* Toast Alert */}
      {statusMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{statusMsg}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-emerald-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Top Overview Cards & Toggle Switch */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Module Switch Card */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">TRẠNG THÁI MODULE</span>
            <Power
              size={16}
              className={isModuleEnabled ? 'text-emerald-400' : 'text-slate-600'}
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <span
              className={`text-sm font-black ${
                isModuleEnabled ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isModuleEnabled ? 'ĐANG BẬT' : 'ĐÃ TẮT'}
            </span>
            <button
              onClick={handleToggleModule}
              disabled={isUpdatingSettings}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                isModuleEnabled
                  ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40'
              }`}
            >
              {isModuleEnabled ? 'Tắt Module' : 'Bật Module'}
            </button>
          </div>
        </div>

        {/* Total Heroes */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">TỔNG TƯỚNG LIÊN QUÂN</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              01/11/2026
            </span>
          </div>
          <p className="text-2xl font-black text-white font-mono">
            {heroes.length}{' '}
            <span className="text-xs text-slate-500 font-normal">/ {INITIAL_DRAFT_HEROES.length} tướng</span>
          </p>
          <span className="text-[11px] text-slate-500 block truncate">
            Nguồn: Garena Liên Quân Mobile VN
          </span>
        </div>

        {/* Total Analyses Count */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-1">
          <span className="text-xs font-bold text-slate-400">LƯỢT PHÂN TÍCH</span>
          <p className="text-2xl font-black text-amber-400 font-mono">
            {stats?.totalAnalyses ?? 0}
          </p>
          <span className="text-[11px] text-slate-500">Người dùng &amp; khách truy cập</span>
        </div>

        {/* Total Saved Drafts */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-1">
          <span className="text-xs font-bold text-slate-400">ĐỘI HÌNH ĐÃ LƯU</span>
          <p className="text-2xl font-black text-blue-400 font-mono">
            {stats?.totalSaved ?? 0}
          </p>
          <span className="text-[11px] text-slate-500">Thành viên đăng nhập lưu</span>
        </div>
      </div>

      {/* AI Intelligence & Caching Status Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
            <Bot size={22} />
          </div>
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-black text-sm text-white">AI CHUYÊN GIA CHIẾN THUẬT (GEMINI FLASH)</h4>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
                Mô hình: {aiStats?.activeModel || 'gemini-3.8-flash'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                Grounding: Garena VN &amp; ĐTDV
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Đang lưu trữ <strong className="text-white">{aiStats?.cachedAnalysesCount ?? 0}</strong> trận đối đầu trong bộ nhớ đệm (Cache) để tối ưu thời gian phản hồi &lt;500ms.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleClearAiCache}
            disabled={isClearingCache}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw size={13} className={isClearingCache ? 'animate-spin' : ''} />
            <span>Xóa Cache AI</span>
          </button>
        </div>
      </div>


      {/* Role Distribution & Health Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Info size={14} className="text-amber-400" />
            <span>Phân bổ vai trò trong hệ thống:</span>
          </span>
          <span className="text-slate-400 text-[11px]">
            Cập nhật máy chủ Việt Nam: <strong>01/11/2026</strong>
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold">
          {Object.entries(roleBreakdown).map(([role, count]) => (
            <div
              key={role}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2"
            >
              <span className="text-slate-400">{role}:</span>
              <span className="text-amber-400 font-mono font-bold">{count}</span>
            </div>
          ))}
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
            <span className="text-slate-400">Còn thiếu:</span>
            <span className="text-rose-400 font-mono font-bold">
              {Math.max(0, INITIAL_DRAFT_HEROES.length - heroes.length)}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Management Table & Search */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Swords className="w-5 h-5 text-amber-400" /> QUẢN LÝ DANH SÁCH TƯỚNG LIÊN QUÂN
            </h3>
            <p className="text-xs text-slate-400">
              Quản trị toàn diện tướng, vai trò chính/phụ, chất tướng và chỉ số chiến thuật chuẩn Garena
            </p>
          </div>

          {/* Action Buttons Bar */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {/* THÊM DANH SÁCH TƯỚNG (Batch Add Button) */}
            <button
              onClick={() => setIsBatchModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-lg active:scale-95"
            >
              <Layers size={15} />
              <span>+ THÊM DANH SÁCH TƯỚNG</span>
            </button>

            {/* Thêm 1 Tướng Mới */}
            <button
              onClick={() =>
                setEditingHero({
                  name: '',
                  title: '',
                  role: 'Đấu sĩ',
                  primaryLane: 'Caesar',
                  damageType: 'Vật lý',
                  avatar: '',
                  secondaryRoles: [],
                  playstyles: [],
                  tacticalNotes: '',
                  ratings: {
                    tankiness: 5,
                    damage: 5,
                    crowdControl: 5,
                    engage: 5,
                    peel: 5,
                    mobility: 5,
                    earlyGame: 5,
                    lateGame: 5
                  },
                  signatureSkill: '',
                  counters: [],
                  synergies: [],
                  tags: [],
                  difficulty: 'Trung bình',
                  isActive: true
                })
              }
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus size={14} />
              <span>Thêm 1 Tướng</span>
            </button>

            {/* Check Duplicates */}
            <button
              onClick={handleCheckDuplicates}
              disabled={isScanningDuplicates}
              className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all"
              title="Quét dữ liệu trùng lặp"
            >
              <AlertTriangle size={14} className="text-amber-400" />
              <span>Kiểm tra trùng</span>
            </button>

            {/* Export buttons */}
            <button
              onClick={handleExportJSON}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer"
              title="Xuất danh sách JSON"
            >
              <Download size={14} />
            </button>
          </div>
        </div>

        {/* Duplicate Scan Alert (if any) */}
        {duplicateScan && duplicateScan.duplicateCount > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>
                Phát hiện <strong>{duplicateScan.duplicateCount}</strong> tướng có bản ghi trùng lặp trong database!
              </span>
            </div>
            <button
              onClick={() => setDuplicateScan(null)}
              className="text-slate-400 hover:text-white text-xs underline cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên (Dyadia, Dolia, Stuart, Florentino, Elsu...)..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 text-xs">
            {['Tất cả', ...ROLE_OPTIONS].map(r => (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-all ${
                  selectedRole === r
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Table of Heroes */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Tướng</th>
                <th className="p-3">Vai Trò Chính / Phụ</th>
                <th className="p-3">Chất Tướng (Playstyle)</th>
                <th className="p-3">Đường Đi</th>
                <th className="p-3">Loại Sát Thương</th>
                <th className="p-3">Chỉ Số Chính (Tank/Dmg/CC)</th>
                <th className="p-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {filteredHeroes.map(hero => {
                const secRoles =
                  hero.secondaryRoles && hero.secondaryRoles.length > 0
                    ? hero.secondaryRoles.join(', ')
                    : hero.secondaryRole || '';

                return (
                  <tr key={hero.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="p-3 flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                        <img
                          src={hero.avatar}
                          alt={hero.name}
                          className="w-full h-full object-cover"
                          onError={e => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div>
                        <span className="font-bold text-white block text-sm">{hero.name}</span>
                        <span className="text-[10px] text-amber-400/90">{hero.title}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-200 block">{hero.role}</span>
                      {secRoles && (
                        <span className="text-[10px] text-slate-400 block">Phụ: {secRoles}</span>
                      )}
                    </td>
                    <td className="p-3">
                      {hero.playstyles && hero.playstyles.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {hero.playstyles.slice(0, 3).map(ps => (
                            <span
                              key={ps}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/80"
                            >
                              {ps}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-600 italic text-[11px]">Chưa gắn</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[10px]">
                        {hero.primaryLane}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          hero.damageType === 'Chuẩn'
                            ? 'bg-amber-400/20 text-amber-300'
                            : hero.damageType === 'Phép'
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {hero.damageType}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-400">
                      <span className="text-emerald-400">{hero.ratings.tankiness}</span> /{' '}
                      <span className="text-rose-400">{hero.ratings.damage}</span> /{' '}
                      <span className="text-amber-400">{hero.ratings.crowdControl}</span>
                    </td>
                    <td className="p-3 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => setEditingHero(hero)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Chỉnh sửa chi tiết"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteHero(hero.id, hero.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Add Modal */}
      <BatchAddHeroesModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        existingHeroes={heroes}
        onSuccess={() => {
          loadAdminData();
          setStatusMsg('Đã cập nhật danh sách tướng thành công!');
          setTimeout(() => setStatusMsg(null), 3500);
        }}
      />

      {/* Edit / Add Single Hero Modal */}
      {editingHero && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
          <div
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <h4 className="font-black text-sm text-white">
                {editingHero.id ? `CHỈNH SỬA TƯỚNG: ${editingHero.name}` : 'THÊM TƯỚNG LIÊN QUÂN MỚI'}
              </h4>
              <button
                onClick={() => setEditingHero(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveHeroSubmit} className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Tên Tướng *</label>
                <input
                  type="text"
                  required
                  value={editingHero.name || ''}
                  onChange={e => setEditingHero({ ...editingHero, name: e.target.value })}
                  placeholder="Ví dụ: Dyadia, Dolia, Stuart..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Danh Hiệu</label>
                <input
                  type="text"
                  value={editingHero.title || ''}
                  onChange={e => setEditingHero({ ...editingHero, title: e.target.value })}
                  placeholder="Ví dụ: Vũ Điệu Ước Nguyện, Cửu Vĩ Yêu Hồ..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Vai Trò Chính *</label>
                  <select
                    value={editingHero.role || 'Đấu sĩ'}
                    onChange={e => setEditingHero({ ...editingHero, role: e.target.value as HeroRole })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                  >
                    {['Đấu sĩ', 'Pháp sư', 'Xạ thủ', 'Sát thủ', 'Đỡ đòn', 'Trợ thủ'].map(r => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Đường Đi Chính *</label>
                  <select
                    value={editingHero.primaryLane || 'Caesar'}
                    onChange={e => setEditingHero({ ...editingHero, primaryLane: e.target.value as HeroLane })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                  >
                    {['Caesar', 'Rừng', 'Mid', 'AD', 'Support'].map(l => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Playstyles Selection (Chất tướng) */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Chất Tướng (Đặc điểm chiến đấu)
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800">
                  {PLAYSTYLE_OPTIONS.map(ps => {
                    const isSelected = editingHero.playstyles?.includes(ps);
                    return (
                      <button
                        type="button"
                        key={ps}
                        onClick={() => {
                          const current = new Set(editingHero.playstyles || []);
                          if (current.has(ps)) current.delete(ps);
                          else current.add(ps);
                          setEditingHero({ ...editingHero, playstyles: Array.from(current) });
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {ps}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Loại Sát Thương</label>
                  <select
                    value={editingHero.damageType || 'Vật lý'}
                    onChange={e => setEditingHero({ ...editingHero, damageType: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                  >
                    {['Vật lý', 'Phép', 'Chuẩn', 'Hỗn hợp'].map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Độ Khó</label>
                  <select
                    value={editingHero.difficulty || 'Trung bình'}
                    onChange={e => setEditingHero({ ...editingHero, difficulty: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                  >
                    {['Dễ', 'Trung bình', 'Khó', 'Rất khó'].map(diff => (
                      <option key={diff} value={diff}>
                        {diff}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Link Ảnh Avatar</label>
                <input
                  type="text"
                  value={editingHero.avatar || ''}
                  onChange={e => setEditingHero({ ...editingHero, avatar: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Kỹ Năng Nổi Bật</label>
                <input
                  type="text"
                  value={editingHero.signatureSkill || ''}
                  onChange={e => setEditingHero({ ...editingHero, signatureSkill: e.target.value })}
                  placeholder="Mô tả kỹ năng trấn phái..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Ghi Chú Chiến Thuật</label>
                <textarea
                  rows={2}
                  value={editingHero.tacticalNotes || editingHero.notes || ''}
                  onChange={e =>
                    setEditingHero({
                      ...editingHero,
                      tacticalNotes: e.target.value,
                      notes: e.target.value
                    })
                  }
                  placeholder="Lối chơi, thời điểm tăng tiến sức mạnh..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              {/* Sliders for ratings */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="font-bold text-slate-300 block">Chỉ số chiến thuật (1 - 10):</span>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span>Chống chịu: {editingHero.ratings?.tankiness || 5}</span>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={editingHero.ratings?.tankiness || 5}
                      onChange={e =>
                        setEditingHero({
                          ...editingHero,
                          ratings: { ...(editingHero.ratings as any), tankiness: Number(e.target.value) }
                        })
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <span>Sát thương: {editingHero.ratings?.damage || 5}</span>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={editingHero.ratings?.damage || 5}
                      onChange={e =>
                        setEditingHero({
                          ...editingHero,
                          ratings: { ...(editingHero.ratings as any), damage: Number(e.target.value) }
                        })
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <span>Khống chế: {editingHero.ratings?.crowdControl || 5}</span>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={editingHero.ratings?.crowdControl || 5}
                      onChange={e =>
                        setEditingHero({
                          ...editingHero,
                          ratings: { ...(editingHero.ratings as any), crowdControl: Number(e.target.value) }
                        })
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingHero(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingHero}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl cursor-pointer"
                >
                  {isSavingHero ? 'Đang lưu...' : 'Lưu Tướng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
