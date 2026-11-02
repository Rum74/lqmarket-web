import fs from 'fs';
import path from 'path';

// Load existing 118 heroes from src/data/draftHeroesData.ts by regex or evaluation
const tsContent = fs.readFileSync('src/data/draftHeroesData.ts', 'utf8');

// Match the JSON array inside INITIAL_DRAFT_HEROES
const match = tsContent.match(/export const INITIAL_DRAFT_HEROES:\s*DraftHero\[\]\s*=\s*(\[[\s\S]*?\]);\s*$/m);
if (!match) {
  console.error('Could not find INITIAL_DRAFT_HEROES array');
  process.exit(1);
}

const existingHeroes = JSON.parse(match[1]);
console.log('Loaded existing heroes:', existingHeroes.length);

// 12 Additional heroes to reach 130
const additionalHeroes = [
  {
    id: "hero_evita",
    name: "Evita",
    title: "Phù Thủy Hỗn Mang",
    role: "Pháp sư",
    secondaryRoles: ["Đấu sĩ"],
    playstyles: ["Cấu rỉa", "Khống chế", "Sát thương duy trì"],
    primaryLane: "Mid",
    secondaryLanes: ["Caesar"],
    damageType: "Phép",
    avatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=80",
    ratings: {
      tankiness: 5,
      damage: 9,
      crowdControl: 8,
      engage: 6,
      peel: 6,
      mobility: 7,
      earlyGame: 7,
      lateGame: 9
    },
    signatureSkill: "Triệu Hồi Ma Vật Hỗn Mang (Tạo vùng cấm địa gây sát thương diện rộng và làm chậm)",
    counters: ["Veera", "Natalya", "Kahlii", "Valhein"],
    synergies: ["Maloch", "Grakk", "Toro", "Dolia"],
    tags: ["Tướng thứ 130", "Pháp sư meta 2026", "Cấu rỉa diện rộng"],
    tacticalNotes: "Vị tướng thứ 130 của Liên Quân Mobile ra mắt tháng 10/2026. Sở hữu nội tại Ma lực hắc ám cực mạnh trong giao tranh tổng và ép góc đường giữa.",
    difficulty: "Khó",
    isActive: true
  },
  {
    id: "hero_tamyn",
    name: "Tamyn",
    title: "Chiến Thần Quang Minh",
    role: "Đấu sĩ",
    secondaryRoles: ["Sát thủ"],
    playstyles: ["Sát thương dồn", "Cơ động", "Đẩy lẻ"],
    primaryLane: "Caesar",
    secondaryLanes: ["Rừng"],
    damageType: "Vật lý",
    avatar: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=150&auto=format&fit=crop&q=80",
    ratings: {
      tankiness: 7,
      damage: 9,
      crowdControl: 6,
      engage: 8,
      peel: 5,
      mobility: 9,
      earlyGame: 8,
      lateGame: 8
    },
    signatureSkill: "Phi Đoản Thương Tái Hồi (Ném đoản thương gây sát thương kép và lướt tiếp cận áp sát)",
    counters: ["Omen", "Florentino", "Yena"],
    synergies: ["Dyadia", "Dolia", "Kaine"],
    tags: ["Tướng mới 2026", "Cơ động cao", "Solo Tà Thần Caesar"],
    tacticalNotes: "Đấu sĩ solo đường Caesar cực mạnh với cơ chế ném và thu hồi đoản thương, dễ dàng bắt bài đối thủ và đảo đường gank.",
    difficulty: "Khó",
    isActive: true
  },
  {
    id: "hero_flowborn",
    name: "Flowborn",
    title: "Tinh Linh Thủy Lưu",
    role: "Xạ thủ",
    secondaryRoles: ["Sát thủ"],
    playstyles: ["Sát thương duy trì", "Cơ động", "Cấu rỉa"],
    primaryLane: "AD",
    secondaryLanes: ["Mid"],
    damageType: "Vật lý",
    avatar: "https://images.unsplash.com/photo-1563089145-599997674d42?w=150&auto=format&fit=crop&q=80",
    ratings: {
      tankiness: 4,
      damage: 10,
      crowdControl: 5,
      engage: 5,
      peel: 6,
      mobility: 8,
      earlyGame: 7,
      lateGame: 10
    },
    signatureSkill: "Thủy Lưu Xuyên Phá (Đạn nước tầm xa dồn sát thương xuyên giáp liên tục)",
    counters: ["Valhein", "Violet", "Tel'Annas"],
    synergies: ["Helen", "Teeri", "Dolia", "Aya"],
    tags: ["Xạ thủ meta 2026", "DPS cao", "Thủy lưu"],
    tacticalNotes: "Xạ thủ công kích tầm xa siêu mạnh cuối trận. Tận dụng lướt nước né kỹ năng khống chế của sát thủ đối phương.",
    difficulty: "Trung bình",
    isActive: true
  },
  {
    id: "hero_edras",
    name: "Edras",
    title: "Hiền Triết Khởi Nguyên",
    role: "Pháp sư",
    secondaryRoles: ["Trợ thủ"],
    playstyles: ["Cấu rỉa", "Khống chế", "Đa dụng"],
    primaryLane: "Mid",
    secondaryLanes: ["Support"],
    damageType: "Phép",
    avatar: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&auto=format&fit=crop&q=80",
    ratings: {
      tankiness: 5,
      damage: 8,
      crowdControl: 9,
      engage: 7,
      peel: 8,
      mobility: 6,
      earlyGame: 6,
      lateGame: 9
    },
    signatureSkill: "Trận Đồ Thái Cổ (Khóa diện rộng và câm lặng nhiều kẻ địch cùng lúc)",
    counters: ["Lauriel", "Raz", "Tulen"],
    synergies: ["Maloch", "Hayate", "Elsu"],
    tags: ["Cổ thuật Athanor", "Khống chế cứng", "Giao tranh tổng"],
    tacticalNotes: "Người sáng lập Tháp Quang Minh, sở hữu khả năng kiểm soát giao tranh cực mạnh và cản bước tiến các sát thủ băng vào.",
    difficulty: "Trung bình",
    isActive: true
  },
  {
    id: "hero_goverra",
    name: "Goverra",
    title: "Nữ Hoàng Tro Tàn",
    role: "Pháp sư",
    secondaryRoles: ["Sát thủ"],
    playstyles: ["Sát thương dồn", "Cơ động", "Ám sát chủ lực"],
    primaryLane: "Mid",
    secondaryLanes: ["Rừng"],
    damageType: "Phép",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    ratings: {
      tankiness: 4,
      damage: 10,
      crowdControl: 6,
      engage: 7,
      peel: 4,
      mobility: 8,
      earlyGame: 8,
      lateGame: 9
    },
    signatureSkill: "Lửa Tro Tàn (Thiêu đốt mục tiêu và kích nổ dồn dame phép diện rộng)",
    counters: ["Veera", "Krixi", "Yorn"],
    synergies: ["Nakroth", "Quillen", "Grakk"],
    tags: ["Phép dồn dame", "Sát thủ phép", "Meta 2026"],
    tacticalNotes: "Pháp sư sát thủ có khả năng sốc chết xạ thủ đối phương trong nửa giây bằng chuỗi chiêu hỏa thiêu liên hoàn.",
    difficulty: "Khó",
    isActive: true
  },
  {
    id: "hero_heino",
    name: "Heino",
    title: "Định Mệnh Thời Không",
    role: "Pháp sư",
    secondaryRoles: ["Đấu sĩ"],
    playstyles: ["Cấu rỉa", "Sát thương duy trì", "Đa dụng"],
    primaryLane: "Mid",
    secondaryLanes: ["Caesar"],
    damageType: "Phép",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    ratings: {
      tankiness: 6,
      damage: 9,
      crowdControl: 6,
      engage: 7,
      peel: 6,
      mobility: 7,
      earlyGame: 7,
      lateGame: 10
    },
    signatureSkill: "Đảo Ngược Thời Gian (Hồi sinh vùng máu và quay ngược vị trí giao tranh)",
    counters: ["Natalya", "Aleister", "Florentino"],
    synergies: ["Dolia", "Dyadia", "Arthur"],
    tags: ["Quay ngược thời gian", "Định mệnh", "Cặp đôi Dolia"],
    tacticalNotes: "Tướng chuyển giao mang cơ chế hồi máu và quay ngược thời không độc nhất, cực kỳ khó bị hạ gục.",
    difficulty: "Khó",
    isActive: true
  },
  {
    id: "hero_billow",
    name: "Billow",
    title: "Kình Ngư Biển Sâu",
    role: "Sát thủ",
    secondaryRoles: ["Đấu sĩ"],
    playstyles: ["Sát thương dồn", "Cơ động", "Ám sát chủ lực"],
    primaryLane: "Rừng",
    secondaryLanes: ["Caesar"],
    damageType: "Vật lý",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    ratings: {
      tankiness: 5,
      damage: 10,
      crowdControl: 6,
      engage: 8,
      peel: 4,
      mobility: 9,
      earlyGame: 8,
      lateGame: 8
    },
    signatureSkill: "Sóng Thần Đột Kích (Lặn sâu và bộc phá nuốt trọn mục tiêu ít máu)",
    counters: ["Tel'Annas", "Capheny", "Yorn"],
    synergies: ["Dolia", "Dyadia", "Krizzix"],
    tags: ["Sát thủ thủy tộc", "Lặn biển", "Sốc dame chủ lực"],
    tacticalNotes: "Sát thủ đi rừng độc đáo với khả năng lặn dưới lòng đất/nước tiếp cận không bị phát hiện và sốc dame dứt điểm.",
    difficulty: "Khó",
    isActive: true
  },
  {
    id: "hero_bolt_baron",
    name: "Bolt Baron",
    title: "Bá Chủ Thiên Lôi",
    role: "Đấu sĩ",
    secondaryRoles: ["Đỡ đòn"],
    playstyles: ["Chống chịu", "Mở giao tranh", "Khống chế"],
    primaryLane: "Caesar",
    secondaryLanes: ["Support"],
    damageType: "Vật lý",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    ratings: {
      tankiness: 9,
      damage: 7,
      crowdControl: 8,
      engage: 9,
      peel: 7,
      mobility: 6,
      earlyGame: 7,
      lateGame: 8
    },
    signatureSkill: "Sấm Sét Hủy Diệt (Phóng tia sét liên hoàn gây choáng diện rộng và hút sát thương)",
    counters: ["Maloch", "Arthur", "Taara"],
    synergies: ["Hayate", "Laville", "Tulen"],
    tags: ["Thiên lôi", "Mở combat mạnh", "Đường Tà Thần"],
    tacticalNotes: "Đấu sĩ tiên phong mở giao tranh xuất sắc với lượng giáp sấm sét khổng lồ cản phá hàng thủ đối phương.",
    difficulty: "Trung bình",
    isActive: true
  },
  {
    id: "hero_ybneth",
    name: "Y'bneth",
    title: "Đại Thụ Cổ Đại",
    role: "Đỡ đòn",
    secondaryRoles: ["Đấu sĩ"],
    playstyles: ["Chống chịu", "Mở giao tranh", "Khống chế", "Bảo kê"],
    primaryLane: "Support",
    secondaryLanes: ["Caesar"],
    damageType: "Vật lý",
    avatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=80",
    ratings: {
      tankiness: 10,
      damage: 5,
      crowdControl: 9,
      engage: 8,
      peel: 9,
      mobility: 4,
      earlyGame: 8,
      lateGame: 8
    },
    signatureSkill: "Cây Bách Vạn Năm (Hóa đại thụ xả hạt súng liên hoàn vừa hồi máu vừa gây choáng)",
    counters: ["Arum", "Grakk", "Arthur"],
    synergies: ["Hayate", "Capheny", "Elsu"],
    tags: ["Hồi phục bụi cỏ", "Mở combat", "Chống chịu trâu bò"],
    tacticalNotes: "Tận dụng nội tại đứng trong bụi cỏ hồi phục lượng máu cực lớn để trao đổi chiêu thức thắng mọi kèo đầu trận.",
    difficulty: "Dễ",
    isActive: true
  },
  {
    id: "hero_the_flash",
    name: "The Flash",
    title: "Tia Chớp Nhanh Nhất Thế Giới",
    role: "Pháp sư",
    secondaryRoles: ["Sát thủ"],
    playstyles: ["Sát thương dồn", "Cơ động", "Mở giao tranh"],
    primaryLane: "Mid",
    secondaryLanes: ["Rừng"],
    damageType: "Phép",
    avatar: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=150&auto=format&fit=crop&q=80",
    ratings: {
      tankiness: 5,
      damage: 9,
      crowdControl: 7,
      engage: 9,
      peel: 4,
      mobility: 10,
      earlyGame: 7,
      lateGame: 8
    },
    signatureSkill: "Lốc Xoáy Tia Chớp (Hóa vô địch hút toàn bộ kẻ địch xung quanh vào tâm bão)",
    counters: ["Tel'Annas", "Yorn", "Veera"],
    synergies: ["Maloch", "Hayate", "Slimz"],
    tags: ["Tốc độ siêu phàm", "Vô địch lướt", "Đảo gank tốc độ"],
    tacticalNotes: "Tận dụng Hành Trình Siêu Tốc lao vào cấu rỉa rồi kích hoạt Lốc Xoáy vô địch né sát thương rút về an toàn.",
    difficulty: "Trung bình",
    isActive: true
  },
  {
    id: "hero_omega",
    name: "Omega",
    title: "Cỗ Máy Chiến Tranh",
    role: "Đỡ đòn",
    secondaryRoles: ["Trợ thủ"],
    playstyles: ["Chống chịu", "Khống chế", "Bảo kê", "Mở giao tranh"],
    primaryLane: "Support",
    secondaryLanes: ["Caesar"],
    damageType: "Vật lý",
    avatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=80",
    ratings: {
      tankiness: 9,
      damage: 5,
      crowdControl: 9,
      engage: 8,
      peel: 9,
      mobility: 7,
      earlyGame: 7,
      lateGame: 8
    },
    signatureSkill: "Chế Độ Nghiền Nát (Tạo khiên lá chắn càn quét và khóa trụ công trình)",
    counters: ["Valhein", "Violet", "Natalya"],
    synergies: ["Yorn", "Tel'Annas", "Slimz"],
    tags: ["Khóa trụ", "Bảo kê xạ thủ", "Khống chế liên tục"],
    tacticalNotes: "Bộ kỹ năng gây choáng công trình và bảo kê xạ thủ cực tốt, cản phá triệt để các sát thủ lao vào bắn phá.",
    difficulty: "Dễ",
    isActive: true
  },
  {
    id: "hero_augur",
    name: "Augur",
    title: "Đại Ty Mệnh",
    role: "Sát thủ",
    secondaryRoles: ["Đấu sĩ"],
    playstyles: ["Sát thương dồn", "Cơ động", "Ám sát chủ lực"],
    primaryLane: "Rừng",
    secondaryLanes: ["Caesar"],
    damageType: "Vật lý",
    avatar: "https://images.unsplash.com/photo-1563089145-599997674d42?w=150&auto=format&fit=crop&q=80",
    ratings: {
      tankiness: 6,
      damage: 10,
      crowdControl: 6,
      engage: 8,
      peel: 4,
      mobility: 10,
      earlyGame: 8,
      lateGame: 9
    },
    signatureSkill: "Thần Đạo Sinh Tử (Tạo cầu nối linh hồn vượt địa hình xuyên tường và kết liễu mục tiêu)",
    counters: ["Tel'Annas", "Yorn", "Valhein", "Veera", "Natalya"],
    synergies: ["Dolia", "Dyadia", "Teeri", "Yue"],
    tags: ["Vượt địa hình", "Kết liễu sinh mệnh", "Sát thủ đỉnh cao"],
    tacticalNotes: "Tướng sát thủ thượng đẳng với khả năng tạo lối đi trên không xuyên qua mọi địa hình vách tường và kết liễu nhanh.",
    difficulty: "Khó",
    isActive: true
  }
];

// Merge without duplicates
const map = new Map();
existingHeroes.forEach(h => {
  // Normalize Richter / Riktor
  if (h.name.toLowerCase() === 'riktor') {
    h.tags = Array.from(new Set([...(h.tags || []), 'Richter', 'Riktor']));
    h.title = 'Thợ Săn Bầu Trời (Riktor / Richter)';
  }
  map.set(h.name.toLowerCase().trim(), h);
});

additionalHeroes.forEach(h => {
  const key = h.name.toLowerCase().trim();
  if (!map.has(key)) {
    map.set(key, h);
  }
});

const merged = Array.from(map.values());
console.log('Final merged hero count:', merged.length);

if (merged.length !== 130) {
  console.error('ERROR: Total heroes is not 130, got:', merged.length);
  process.exit(1);
}

// Write updated src/data/draftHeroesData.ts
const newSrcContent = `import { DraftHero, HeroRole, HeroLane, HeroPlaystyle } from '../types/draftLab';

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
  totalHeroes: 130,
  note: 'Danh sách 130 tướng chính thức cập nhật mới nhất theo máy chủ Liên Quân Mobile Garena Việt Nam (bao gồm Evita, Tamyn, Flowborn, Heino, Dolia, Dyadia, Augur).'
};

export const INITIAL_DRAFT_HEROES: DraftHero[] = ${JSON.stringify(merged, null, 2)};
`;

fs.writeFileSync('src/data/draftHeroesData.ts', newSrcContent);
console.log('Saved src/data/draftHeroesData.ts (130 heroes)');

// Write updated backend/src/data/draftHeroesData.ts
const newBackendContent = `import { DraftHero, HeroRole, HeroLane, HeroPlaystyle } from '../types/draftLab.js';

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
  totalHeroes: 130,
  note: 'Danh sách 130 tướng chính thức cập nhật mới nhất theo máy chủ Liên Quân Mobile Garena Việt Nam (bao gồm Evita, Tamyn, Flowborn, Heino, Dolia, Dyadia, Augur).'
};

export const INITIAL_DRAFT_HEROES: DraftHero[] = ${JSON.stringify(merged, null, 2)};
`;

fs.writeFileSync('backend/src/data/draftHeroesData.ts', newBackendContent);
console.log('Saved backend/src/data/draftHeroesData.ts (130 heroes)');
