import React, { useState, useEffect } from 'react';
import { DraftHero, HeroRole, HeroLane } from '../../types/draftLab';
import { INITIAL_DRAFT_HEROES, ROLE_OPTIONS, LANE_OPTIONS } from '../../data/draftHeroesData';
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
  Check
} from 'lucide-react';

export const AdminDraftLabTab: React.FC = () => {
  const [heroes, setHeroes] = useState<DraftHero[]>(INITIAL_DRAFT_HEROES);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('Tất cả');

  // Module toggle
  const [isModuleEnabled, setIsModuleEnabled] = useState(true);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Edit / Add Hero Modal State
  const [editingHero, setEditingHero] = useState<Partial<DraftHero> | null>(null);
  const [isSavingHero, setIsSavingHero] = useState(false);

  // Load Admin Data
  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [heroesRes, statsRes] = await Promise.all([
        api.get('/api/draft-lab/heroes').catch(() => null),
        api.get('/api/draft-lab/admin/stats').catch(() => null)
      ]);

      if (heroesRes?.data?.success && Array.isArray(heroesRes.data.data)) {
        setHeroes(heroesRes.data.data);
      }
      if (statsRes?.data?.success) {
        setStats(statsRes.data.data);
        if (statsRes.data.data.settings) {
          setIsModuleEnabled(statsRes.data.data.settings.enabled ?? true);
        }
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
      if (!h.name.toLowerCase().includes(q) && !h.title.toLowerCase().includes(q)) return false;
    }
    if (selectedRole !== 'Tất cả') {
      if (h.role !== selectedRole && h.secondaryRole !== selectedRole) return false;
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
      if (res.data?.success) {
        setStatusMsg(`Đã lưu thông tin tướng ${editingHero.name} thành công!`);
        setEditingHero(null);
        loadAdminData();
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        alert(res.data?.message || 'Không thể lưu tướng.');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi lưu thông tin tướng.');
    } finally {
      setIsSavingHero(false);
    }
  };

  // Delete Hero
  const handleDeleteHero = async (heroId: string, heroName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa tướng "${heroName}" khỏi danh sách?`)) return;
    try {
      const res = await api.delete(`/api/draft-lab/admin/hero/${heroId}`);
      if (res.data?.success) {
        setStatusMsg(`Đã xóa tướng ${heroName} khỏi hệ thống.`);
        loadAdminData();
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (err) {
      alert('Không thể xóa tướng.');
    }
  };

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <span className="text-xs font-bold text-slate-400">TỔNG TƯỚNG LIÊN QUÂN</span>
          <p className="text-2xl font-black text-white font-mono">{heroes.length}</p>
          <span className="text-[11px] text-slate-500">Chuẩn 6 vai trò chính</span>
        </div>

        {/* Total Analyses Count */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-1">
          <span className="text-xs font-bold text-slate-400">LƯỢT PHÂN TÍCH</span>
          <p className="text-2xl font-black text-amber-400 font-mono">
            {stats?.totalAnalyses ?? 0}
          </p>
          <span className="text-[11px] text-slate-500">Người dùng & khách truy cập</span>
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

      {/* Hero Management Table & Search */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Swords className="w-5 h-5 text-amber-400" /> QUẢN LÝ DANH SÁCH TƯỚNG
            </h3>
            <p className="text-xs text-slate-400">
              Thêm mới, cập nhật vai trò, chỉ số chiến thuật hoặc ẩn/hiện tướng
            </p>
          </div>

          <button
            onClick={() =>
              setEditingHero({
                name: '',
                title: '',
                role: 'Đấu sĩ',
                primaryLane: 'Caesar',
                damageType: 'Vật lý',
                avatar: '',
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
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95 shrink-0 self-start sm:self-auto"
          >
            <Plus size={15} />
            <span>Thêm Tướng Mới</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm tướng theo tên hoặc danh hiệu..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 text-xs">
            {ROLE_OPTIONS.map(r => (
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
                <th className="p-3">Vai Trò</th>
                <th className="p-3">Đường Đi</th>
                <th className="p-3">Loại Sát Thương</th>
                <th className="p-3">Chỉ Số Chính (Tank/Dmg/CC)</th>
                <th className="p-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {filteredHeroes.map(hero => (
                <tr key={hero.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="p-3 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                      <img src={hero.avatar} alt={hero.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="font-bold text-white block">{hero.name}</span>
                      <span className="text-[10px] text-slate-400">{hero.title}</span>
                    </div>
                  </td>
                  <td className="p-3 font-semibold text-slate-300">
                    {hero.role} {hero.secondaryRole ? `· ${hero.secondaryRole}` : ''}
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
                      title="Chỉnh sửa"
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Modal */}
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
                  placeholder="Ví dụ: Erin, Billow..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Danh Hiệu</label>
                <input
                  type="text"
                  value={editingHero.title || ''}
                  onChange={e => setEditingHero({ ...editingHero, title: e.target.value })}
                  placeholder="Ví dụ: Tinh Linh Ánh Trăng..."
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
