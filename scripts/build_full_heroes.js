import fs from 'fs';
import { HEROES_LIST, ROLE_OPTIONS, LANE_OPTIONS, PLAYSTYLE_OPTIONS } from './generate_official_heroes.js';

// Add Gildur, Wiro, and other classic heroes
const ADDITIONAL_HEROES = [
  {
    id: 'hero_liliana',
    name: 'Liliana',
    title: 'Cửu Vĩ Yêu Hồ',
    role: 'Pháp sư',
    secondaryRoles: ['Sát thủ'],
    playstyles: ['Cấu rỉa', 'Sát thương dồn', 'Cơ động', 'Ám sát chủ lực'],
    primaryLane: 'Mid',
    secondaryLanes: ['Rừng'],
    damageType: 'Phép',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    ratings: { tankiness: 4, damage: 10, crowdControl: 7, engage: 8, peel: 4, mobility: 10, earlyGame: 7, lateGame: 10 },
    signatureSkill: 'Biến Hình Cửu Vĩ Hồ & Đạn Linh Lực (Hoán đổi dạng người và cáo, tích tụ quả cầu linh lực khổng lồ)',
    counters: ['Aleister', 'Arum', 'Kaine'],
    synergies: ['Thane', 'Baldum', 'Helen'],
    tags: ['Nữ hoàng đường giữa', '6 chiêu thức biến ảo', 'Cấu rỉa và sốc dame hoàn hảo'],
    tacticalNotes: 'Biểu tượng pháp sư đường giữa toàn năng nhất lịch sử Liên Quân. Dạng người cấu rỉa tầm xa cực đau, dạng cáo lướt cào sốc chết chủ lực trong chớp mắt.',
    difficulty: 'Khó',
    isActive: true
  },
  {
    id: 'hero_gildur',
    name: 'Gildur',
    title: 'Vua Hoàng Kim',
    role: 'Pháp sư',
    secondaryRoles: ['Đỡ đòn', 'Trợ thủ'],
    playstyles: ['Khống chế', 'Cấu rỉa', 'Chống chịu', 'Mở giao tranh'],
    primaryLane: 'Mid',
    secondaryLanes: ['Support', 'Caesar'],
    damageType: 'Phép',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    ratings: { tankiness: 8, damage: 8, crowdControl: 10, engage: 8, peel: 8, mobility: 6, earlyGame: 7, lateGame: 9 },
    signatureSkill: 'Vương Triều Vàng Ròng (Bắn vàng làm choáng từ xa và dựng nhà tù hoàng kim làm choáng liên tục 3.5 giây)',
    counters: ['Chaugnar', 'Kaine', 'Aleister'],
    synergies: ['Elsu', 'Yue', 'Violet'],
    tags: ['Vua vàng ròng', 'Làm choáng tầm xa', 'Nhà tù khống chế 3.5 giây'],
    tacticalNotes: 'Vụ Nổ Vàng tầm xa làm choáng và cấu rỉa cực thốn. Chiêu cuối áp sát giữ chân cả đội hình đối phương.',
    difficulty: 'Dễ',
    isActive: true
  },
  {
    id: 'hero_wiro',
    name: 'Wiro',
    title: 'Chiến Binh 212',
    role: 'Đấu sĩ',
    secondaryRoles: ['Đỡ đòn'],
    playstyles: ['Chống chịu', 'Khống chế', 'Mở giao tranh'],
    primaryLane: 'Support',
    secondaryLanes: ['Caesar'],
    damageType: 'Vật lý',
    avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80',
    ratings: { tankiness: 9, damage: 7, crowdControl: 9, engage: 9, peel: 7, mobility: 5, earlyGame: 8, lateGame: 8 },
    signatureSkill: 'Thần Lực 212 (Hồi sinh tại chỗ và gồng búa nện xuống hất tung toàn bộ giao tranh)',
    counters: ['Hayate', 'Lauriel', 'Florentino'],
    synergies: ['Krixi', 'Natalya', 'Hayate'],
    tags: ['Nội tại hồi sinh đồng minh dẫm', 'Hất tung diện rộng', 'Đấu sĩ trâu bò'],
    tacticalNotes: 'Khi cạn máu bước vào trạng thái hồi sinh, đồng đội giẫm lên 3 dấu ấn sẽ lập tức hồi đầy máu cho Wiro.',
    difficulty: 'Trung bình',
    isActive: true
  }
];

const ALL_HEROES = [...HEROES_LIST, ...ADDITIONAL_HEROES];

// Generate TS code for frontend (relative import to ../types/draftLab)
const frontendCode = `import { DraftHero, HeroRole, HeroLane, HeroPlaystyle } from '../types/draftLab';

export const ROLE_OPTIONS: HeroRole[] = [
  'Đấu sĩ',
  'Pháp sư',
  'Xạ thủ',
  'Sát thủ',
  'Đỡ đòn',
  'Trợ thủ'
];

export const LANE_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Tất cả vị trí' },
  { value: 'Caesar', label: 'Đường Tà Thần Caesar' },
  { value: 'Rừng', label: 'Đường Rừng' },
  { value: 'Mid', label: 'Đường Giữa' },
  { value: 'AD', label: 'Đường Rồng (Xạ Thủ)' },
  { value: 'Support', label: 'Trợ Thủ / SP' }
];

export const PLAYSTYLE_OPTIONS: HeroPlaystyle[] = [
  'Sát thương dồn',
  'Sát thương duy trì',
  'Cấu rỉa',
  'Khống chế',
  'Chống chịu',
  'Mở giao tranh',
  'Bảo kê',
  'Cơ động',
  'Ám sát chủ lực',
  'Đẩy lẻ',
  'Đa dụng'
];

export const OFFICIAL_ROSTER_INFO = {
  version: '2026.11.01-VN',
  server: 'Garena Liên Quân Mobile Việt Nam',
  lastUpdated: '01/11/2026',
  totalHeroes: ${ALL_HEROES.length},
  note: 'Danh sách tướng chính thức cập nhật mới nhất theo máy chủ Liên Quân Mobile Garena Việt Nam.'
};

export const INITIAL_DRAFT_HEROES: DraftHero[] = ${JSON.stringify(ALL_HEROES, null, 2)};
`;

// Generate TS code for backend (relative import to ../types/draftLab.js for NodeNext)
const backendCode = `import { DraftHero, HeroRole, HeroLane, HeroPlaystyle } from '../types/draftLab.js';

export const ROLE_OPTIONS: HeroRole[] = [
  'Đấu sĩ',
  'Pháp sư',
  'Xạ thủ',
  'Sát thủ',
  'Đỡ đòn',
  'Trợ thủ'
];

export const LANE_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Tất cả vị trí' },
  { value: 'Caesar', label: 'Đường Tà Thần Caesar' },
  { value: 'Rừng', label: 'Đường Rừng' },
  { value: 'Mid', label: 'Đường Giữa' },
  { value: 'AD', label: 'Đường Rồng (Xạ Thủ)' },
  { value: 'Support', label: 'Trợ Thủ / SP' }
];

export const PLAYSTYLE_OPTIONS: HeroPlaystyle[] = [
  'Sát thương dồn',
  'Sát thương duy trì',
  'Cấu rỉa',
  'Khống chế',
  'Chống chịu',
  'Mở giao tranh',
  'Bảo kê',
  'Cơ động',
  'Ám sát chủ lực',
  'Đẩy lẻ',
  'Đa dụng'
];

export const OFFICIAL_ROSTER_INFO = {
  version: '2026.11.01-VN',
  server: 'Garena Liên Quân Mobile Việt Nam',
  lastUpdated: '01/11/2026',
  totalHeroes: ${ALL_HEROES.length},
  note: 'Danh sách tướng chính thức cập nhật mới nhất theo máy chủ Liên Quân Mobile Garena Việt Nam.'
};

export const INITIAL_DRAFT_HEROES: DraftHero[] = ${JSON.stringify(ALL_HEROES, null, 2)};
`;

fs.writeFileSync('src/data/draftHeroesData.ts', frontendCode);
fs.writeFileSync('backend/src/data/draftHeroesData.ts', backendCode);
console.log(`Successfully generated ${ALL_HEROES.length} heroes into src and backend data files!`);
