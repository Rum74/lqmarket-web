import { DraftHero, HeroRole, HeroLane, HeroPlaystyle } from '../types/draftLab';

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

export const INITIAL_DRAFT_HEROES: DraftHero[] = [
  {
    "id": "hero_dyadia",
    "name": "Dyadia",
    "title": "Vũ Điệu Ước Nguyện",
    "role": "Trợ thủ",
    "secondaryRoles": [
      "Pháp sư"
    ],
    "playstyles": [
      "Bảo kê",
      "Đa dụng",
      "Khống chế",
      "Cơ động"
    ],
    "primaryLane": "Support",
    "secondaryLanes": [
      "Mid"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 5,
      "damage": 6,
      "crowdControl": 8,
      "engage": 7,
      "peel": 10,
      "mobility": 8,
      "earlyGame": 7,
      "lateGame": 9
    },
    "signatureSkill": "Khúc Hát Ban Phước (Hồi máu, tăng tốc và tạo liên kết liên hoàn)",
    "counters": [
      "Aleister",
      "Arum",
      "Kaine"
    ],
    "synergies": [
      "Valhein",
      "Stuart",
      "Tulen"
    ],
    "tags": [
      "Trợ thủ meta S1-2026",
      "Buff tốc độ",
      "Hồi phục khủng"
    ],
    "tacticalNotes": "Trợ thủ hot pick bậc nhất phiên bản 2026. Tận dụng liên kết tăng tốc đảo gank sớm và bảo kê tuyệt đối xạ thủ cuối trận.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_dolia",
    "name": "Dolia",
    "title": "Nhân Ngư Biển Sâu",
    "role": "Trợ thủ",
    "secondaryRoles": [
      "Pháp sư"
    ],
    "playstyles": [
      "Bảo kê",
      "Đa dụng",
      "Khống chế"
    ],
    "primaryLane": "Support",
    "secondaryLanes": [
      "Mid"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 5,
      "damage": 5,
      "crowdControl": 8,
      "engage": 6,
      "peel": 9,
      "mobility": 7,
      "earlyGame": 7,
      "lateGame": 10
    },
    "signatureSkill": "Khúc Thủy Triều Hồi Kỹ (Làm mới ngay lập tức chiêu cuối của đồng đội)",
    "counters": [
      "Kaine",
      "Quillen",
      "Aoi"
    ],
    "synergies": [
      "Tulen",
      "Florentino",
      "Hayate"
    ],
    "tags": [
      "Reset chiêu cuối",
      "Trợ thủ chiến thuật",
      "Tạo đột biến cực mạnh"
    ],
    "tacticalNotes": "Khả năng hồi chiêu cuối ngay tức thì tạo nên những pha combo 2 lần Ulti hủy diệt (Tulen, Maloch, Hayate).",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_ming",
    "name": "Ming",
    "title": "Tinh Toán Sư Minh Thế Ẩn",
    "role": "Trợ thủ",
    "secondaryRoles": [
      "Pháp sư"
    ],
    "playstyles": [
      "Bảo kê",
      "Đa dụng",
      "Sát thương duy trì"
    ],
    "primaryLane": "Support",
    "secondaryLanes": [],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1563089145-599997674d42?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 5,
      "damage": 7,
      "crowdControl": 5,
      "engage": 5,
      "peel": 9,
      "mobility": 6,
      "earlyGame": 8,
      "lateGame": 9
    },
    "signatureSkill": "Xích Hồn Tinh Quái (Liên kết tăng vọt công vật lý/phép và hồi máu chuẩn)",
    "counters": [
      "Grakk",
      "Baldum",
      "Chaugnar"
    ],
    "synergies": [
      "Elsu",
      "Yorn",
      "Capheny"
    ],
    "tags": [
      "Buff công cực hạn",
      "Bảo kê 1-1",
      "Hyper Carry Buff"
    ],
    "tacticalNotes": "Biến bất kỳ Xạ Thủ nào thành khẩu pháo thần công hủy diệt từ phút đầu tiên. Chú ý giữ cự ly tránh bị ngắt xích.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_erin",
    "name": "Erin",
    "title": "Tinh Linh Ánh Trăng",
    "role": "Xạ thủ",
    "secondaryRoles": [
      "Pháp sư"
    ],
    "playstyles": [
      "Sát thương duy trì",
      "Cơ động",
      "Cấu rỉa",
      "Sát thương dồn"
    ],
    "primaryLane": "AD",
    "secondaryLanes": [
      "Mid"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 3,
      "damage": 10,
      "crowdControl": 5,
      "engage": 4,
      "peel": 2,
      "mobility": 9,
      "earlyGame": 6,
      "lateGame": 10
    },
    "signatureSkill": "Vũ Khúc Ánh Kim (Xả bão tiễn năng lượng phép liên tục khi di chuyển)",
    "counters": [
      "Kaine",
      "Ngộ Không",
      "Aoi"
    ],
    "synergies": [
      "Thane",
      "Helen",
      "Baldum"
    ],
    "tags": [
      "Xạ thủ sát thương phép",
      "Thả diều siêu hạng",
      "Cuối trận áp đảo"
    ],
    "tacticalNotes": "Xạ thủ bắn sát thương phép độc đáo, khắc chế đội hình đối phương dồn giáp vật lý. Rất mạnh khi có đồ chuẩn.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_charlotte",
    "name": "Charlotte",
    "title": "Hoa Kiếm Quý Tộc",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Sát thương dồn",
      "Khống chế",
      "Cơ động",
      "Đẩy lẻ"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [
      "Rừng"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 7,
      "damage": 9,
      "crowdControl": 7,
      "engage": 8,
      "peel": 4,
      "mobility": 8,
      "earlyGame": 7,
      "lateGame": 9
    },
    "signatureSkill": "Thất Tinh Đoán Kiếm (Chuỗi kiếm thuật giảm tốc đánh và miễn thương)",
    "counters": [
      "Florentino",
      "Omen",
      "Aleister"
    ],
    "synergies": [
      "Lumburr",
      "Krixi",
      "Tulen"
    ],
    "tags": [
      "Đấu sĩ kỹ năng cao",
      "Giảm tốc đánh đối thủ",
      "Solo đường Tà Thần"
    ],
    "tacticalNotes": "Khắc tinh số 1 của các đấu sĩ đánh tay nhờ khả năng giảm tốc đánh sâu. Miễn thương cao trong lúc múa kiếm.",
    "difficulty": "Khó",
    "isActive": true
  },
  {
    "id": "hero_biron",
    "name": "Biron",
    "title": "Thiết Bổng Lôi Đình",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Đỡ đòn"
    ],
    "playstyles": [
      "Chống chịu",
      "Khống chế",
      "Mở giao tranh",
      "Sát thương duy trì"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [
      "Support"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 9,
      "damage": 7,
      "crowdControl": 8,
      "engage": 8,
      "peel": 6,
      "mobility": 6,
      "earlyGame": 8,
      "lateGame": 8
    },
    "signatureSkill": "Điện Từ Phá Giáp (Nạp năng lượng giật sét, tạo lá chắn dày cộm)",
    "counters": [
      "Hayate",
      "Florentino",
      "Lauriel"
    ],
    "synergies": [
      "Violet",
      "Tulen",
      "Helen"
    ],
    "tags": [
      "Càn quét mạnh mẽ",
      "Lá chắn năng lượng",
      "Khống chế liên hoàn"
    ],
    "tacticalNotes": "Khả năng càn quét đầu và giữa trận cực kỳ uy lực. Càng tích trữ năng lượng sấm sét thì lá chắn càng dày.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_stuart",
    "name": "Stuart",
    "title": "Kẻ Nổi Loạn Thép",
    "role": "Xạ thủ",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Sát thương dồn",
      "Cấu rỉa",
      "Cơ động",
      "Ám sát chủ lực"
    ],
    "primaryLane": "AD",
    "secondaryLanes": [
      "Mid"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 10,
      "crowdControl": 6,
      "engage": 6,
      "peel": 5,
      "mobility": 8,
      "earlyGame": 9,
      "lateGame": 8
    },
    "signatureSkill": "Đạn Pháo Cao Xạ & Miễn Nhiễm (Tên lửa tầm cực xa và miễn sát thương vật lý)",
    "counters": [
      "Liliana",
      "Tulen",
      "Lauriel"
    ],
    "synergies": [
      "Baldum",
      "Helen",
      "Thane"
    ],
    "tags": [
      "Thay thế Joker",
      "Cấu rỉa tầm xa",
      "Tự bảo kê vật lý"
    ],
    "tacticalNotes": "Bản nâng cấp chính thức thay thế Joker. Khả năng miễn nhiễm vật lý 2 giây biến Stuart thành xạ thủ rất khó bị sát thủ bắt lẻ.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_kaine",
    "name": "Kaine",
    "title": "Kỵ Sĩ Đêm Tối",
    "role": "Sát thủ",
    "secondaryRoles": [
      "Đấu sĩ"
    ],
    "playstyles": [
      "Ám sát chủ lực",
      "Sát thương dồn",
      "Cơ động",
      "Đa dụng"
    ],
    "primaryLane": "Rừng",
    "secondaryLanes": [
      "Support"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 10,
      "crowdControl": 6,
      "engage": 8,
      "peel": 2,
      "mobility": 9,
      "earlyGame": 10,
      "lateGame": 6
    },
    "signatureSkill": "Huyết Dạ Tàng Hình (Tàng hình liên tục toàn bản đồ, áp sát sốc dame)",
    "counters": [
      "Elsu",
      "Max",
      "Ishar"
    ],
    "synergies": [
      "Krixi",
      "Natalya",
      "Thane"
    ],
    "tags": [
      "Thay thế Batman",
      "Tàng hình vĩnh cửu",
      "Áp lực bản đồ cực lớn"
    ],
    "tacticalNotes": "Kế thừa và hoàn thiện cơ chế của Batman. Luôn mang lại nỗi khiếp sợ cho mọi xạ thủ và pháp sư đối phương.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_bijan",
    "name": "Bijan",
    "title": "Bão Cát Sa Mạc",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Đỡ đòn"
    ],
    "playstyles": [
      "Mở giao tranh",
      "Cơ động",
      "Khống chế",
      "Chống chịu"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [
      "Rừng",
      "Support"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 8,
      "damage": 8,
      "crowdControl": 9,
      "engage": 10,
      "peel": 5,
      "mobility": 9,
      "earlyGame": 8,
      "lateGame": 8
    },
    "signatureSkill": "Cưỡi Thần Thú Sa Mạc (Lái thú chở thêm 1 đồng đội đâm xuyên giao tranh)",
    "counters": [
      "Arum",
      "Aleister",
      "Omen"
    ],
    "synergies": [
      "Valhein",
      "Krixi",
      "Maloch"
    ],
    "tags": [
      "Lái xe chở đồng đội",
      "Mở combat toàn bản đồ",
      "Đấu sĩ càn quét"
    ],
    "tacticalNotes": "Chiêu cuối cho phép lái thú chở thêm 1 đồng minh mở combat xuyên bản đồ. Rất nguy hiểm khi chở theo tanker hoặc xạ thủ.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_bonnie",
    "name": "Bonnie",
    "title": "Cô Bé Sấm Sét",
    "role": "Pháp sư",
    "secondaryRoles": [
      "Trợ thủ"
    ],
    "playstyles": [
      "Khống chế",
      "Cấu rỉa",
      "Mở giao tranh",
      "Bảo kê"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [
      "Support"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 8,
      "crowdControl": 10,
      "engage": 8,
      "peel": 8,
      "mobility": 6,
      "earlyGame": 7,
      "lateGame": 8
    },
    "signatureSkill": "Trường Điện Từ Hút Hồn (Trói chân, làm choáng và hút đối thủ vào tâm bão)",
    "counters": [
      "Chaugnar",
      "Kaine",
      "Nakroth"
    ],
    "synergies": [
      "Hayate",
      "Yorn",
      "Thane"
    ],
    "tags": [
      "Khống chế diện rộng",
      "Ngắt chiêu lướt",
      "Pháp sư kiểm soát"
    ],
    "tacticalNotes": "Khả năng ngăn chặn các tướng cơ động bay nhảy cực tốt. Chiêu cuối hút giữ mục tiêu trong vùng điện từ.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_teeri",
    "name": "Teeri",
    "title": "Xạ Thủ Tinh Anh",
    "role": "Xạ thủ",
    "secondaryRoles": [],
    "playstyles": [
      "Sát thương duy trì",
      "Cấu rỉa",
      "Sát thương dồn"
    ],
    "primaryLane": "AD",
    "secondaryLanes": [],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 3,
      "damage": 10,
      "crowdControl": 5,
      "engage": 4,
      "peel": 3,
      "mobility": 7,
      "earlyGame": 7,
      "lateGame": 9
    },
    "signatureSkill": "Song Luân Xuyên Thấu (Luân đao nảy xuyên mục tiêu và đạn bay toàn bản đồ)",
    "counters": [
      "Kaine",
      "Quillen",
      "Aoi"
    ],
    "synergies": [
      "Helen",
      "Lumburr",
      "Baldum"
    ],
    "tags": [
      "Bắn nảy mục tiêu",
      "Chiêu cuối toàn bản đồ",
      "Sát thương combat dày"
    ],
    "tacticalNotes": "Bắn cực thấm trong giao tranh địa hình hẹp nhờ cơ chế đòn đánh nảy lan giữa các tướng địch.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_yan",
    "name": "Yan",
    "title": "Họa Sĩ Thần Đồng",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Sát thương dồn",
      "Cơ động",
      "Khống chế",
      "Đẩy lẻ"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [
      "Rừng"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 6,
      "damage": 9,
      "crowdControl": 7,
      "engage": 8,
      "peel": 4,
      "mobility": 9,
      "earlyGame": 6,
      "lateGame": 10
    },
    "signatureSkill": "Phá Bản Đồ Tranh (Biến ảo chiêu thức cấp 12 mở khóa trạng thái cuồng nộ)",
    "counters": [
      "Arum",
      "Aleister",
      "Omen"
    ],
    "synergies": [
      "Helen",
      "Zip",
      "Tulen"
    ],
    "tags": [
      "Tăng tiến vô hạn cấp 12",
      "Combo biến ảo",
      "Late game quái vật"
    ],
    "tacticalNotes": "Sau cấp độ 12, Yan sở hữu chuỗi combo hồi chiêu và miễn nhiễm cực kỳ biến ảo, có thể 1 cân 3 trong combat.",
    "difficulty": "Khó",
    "isActive": true
  },
  {
    "id": "hero_yue",
    "name": "Yue",
    "title": "Nguyệt Linh Công Chúa",
    "role": "Pháp sư",
    "secondaryRoles": [],
    "playstyles": [
      "Cấu rỉa",
      "Sát thương dồn"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 3,
      "damage": 10,
      "crowdControl": 4,
      "engage": 3,
      "peel": 4,
      "mobility": 6,
      "earlyGame": 8,
      "lateGame": 9
    },
    "signatureSkill": "Giao Điểm Quạt Thần (Sát thương gấp 4 tại điểm giao cắt tâm quạt)",
    "counters": [
      "Kaine",
      "Nakroth",
      "Aoi"
    ],
    "synergies": [
      "Baldum",
      "Grakk",
      "Thane"
    ],
    "tags": [
      "Cấu rỉa tầm siêu xa",
      "Sốc chết chủ lực 1 chạm",
      "Điểm giao cắt chí mạng"
    ],
    "tacticalNotes": "Căn chuẩn tâm giao cắt của chiêu 1 và 2 để sốc bốc hơi 80% máu của bất kỳ tướng máu giấy nào từ khoảng cách an toàn.",
    "difficulty": "Khó",
    "isActive": true
  },
  {
    "id": "hero_tachi",
    "name": "Tachi",
    "title": "Cuồng Đao Sa Mạc",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Đỡ đòn"
    ],
    "playstyles": [
      "Sát thương duy trì",
      "Chống chịu",
      "Đẩy lẻ"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [
      "Rừng",
      "Support"
    ],
    "damageType": "Chuẩn",
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 8,
      "damage": 9,
      "crowdControl": 6,
      "engage": 7,
      "peel": 4,
      "mobility": 7,
      "earlyGame": 7,
      "lateGame": 9
    },
    "signatureSkill": "Phong Ấn Đoạt Mệnh (Mở 4 dấu ấn kích hoạt sát thương chuẩn và lá chắn vĩnh viễn)",
    "counters": [
      "Hayate",
      "Florentino",
      "Aleister"
    ],
    "synergies": [
      "Krixi",
      "Lumburr",
      "Helen"
    ],
    "tags": [
      "Sát thương chuẩn liên tục",
      "Miễn khống chiêu cuối",
      "Chống tanker hàng đầu"
    ],
    "tacticalNotes": "Chém 4 góc để mở phong ấn, sau đó toàn bộ đòn đánh chuyển thành sát thương chuẩn xuyên mọi loại giáp.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_iggy",
    "name": "Iggy",
    "title": "Hỏa Diễm Ma Đồng",
    "role": "Pháp sư",
    "secondaryRoles": [],
    "playstyles": [
      "Cấu rỉa",
      "Sát thương dồn",
      "Sát thương duy trì"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 3,
      "damage": 9,
      "crowdControl": 6,
      "engage": 5,
      "peel": 4,
      "mobility": 8,
      "earlyGame": 9,
      "lateGame": 8
    },
    "signatureSkill": "Hỏa Diễm Pháo Tầm Xa (Bắn quả cầu lửa khổng lồ chi viện toàn bản đồ)",
    "counters": [
      "Kaine",
      "Quillen",
      "Aoi"
    ],
    "synergies": [
      "Thane",
      "Baldum",
      "Hayate"
    ],
    "tags": [
      "Dọn lính siêu tốc",
      "Cấu rỉa tầm xa",
      "Đảo gank đầu trận"
    ],
    "tacticalNotes": "Đẩy đường cực nhanh và dùng chiêu cuối hỗ trợ giao tranh ở 2 cánh từ khoảng cách nửa bản đồ.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_aya",
    "name": "Aya",
    "title": "Ca Sĩ Tí Hon",
    "role": "Trợ thủ",
    "secondaryRoles": [
      "Pháp sư"
    ],
    "playstyles": [
      "Bảo kê",
      "Đa dụng",
      "Khống chế"
    ],
    "primaryLane": "Support",
    "secondaryLanes": [],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 3,
      "damage": 5,
      "crowdControl": 9,
      "engage": 7,
      "peel": 10,
      "mobility": 9,
      "earlyGame": 6,
      "lateGame": 10
    },
    "signatureSkill": "Khúc Ca Biến Hóa (Ngồi trên đầu đồng đội cấp lá chắn khủng và biến đối phương thành thú)",
    "counters": [
      "Chaugnar",
      "Hayate",
      "Aleister"
    ],
    "synergies": [
      "Taara",
      "Arthur",
      "Nakroth"
    ],
    "tags": [
      "Ký sinh lên đồng minh",
      "Biến thú đối phương",
      "Cặp bài trùng đấu sĩ"
    ],
    "tacticalNotes": "Cực kỳ đáng sợ khi leo lên đầu các đấu sĩ càn quét (Taara, Arthur, Florentino), biến họ thành quái vật bất tử.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_aoi",
    "name": "Aoi",
    "title": "Long Trảo Nữ Thần",
    "role": "Sát thủ",
    "secondaryRoles": [
      "Đấu sĩ"
    ],
    "playstyles": [
      "Cơ động",
      "Ám sát chủ lực",
      "Sát thương dồn"
    ],
    "primaryLane": "Rừng",
    "secondaryLanes": [
      "Caesar"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 10,
      "crowdControl": 7,
      "engage": 9,
      "peel": 2,
      "mobility": 10,
      "earlyGame": 8,
      "lateGame": 8
    },
    "signatureSkill": "Long Trảo Đu Dây (Đu dây vượt địa hình lao vào bổ nhào không thể chọn làm mục tiêu)",
    "counters": [
      "Aleister",
      "Arum",
      "Omen"
    ],
    "synergies": [
      "Tulen",
      "Helen",
      "Baldum"
    ],
    "tags": [
      "Đu dây thần tốc",
      "Bắt chủ lực cực đỉnh",
      "Sát thủ cơ động cao"
    ],
    "tacticalNotes": "Kỹ năng đu dây cho phép vượt địa hình thần tốc từ góc khuất tầm nhìn để ám sát xạ thủ rồi rút lui an toàn.",
    "difficulty": "Rất khó",
    "isActive": true
  },
  {
    "id": "hero_bright",
    "name": "Bright",
    "title": "Ánh Sáng Khởi Nguyên",
    "role": "Xạ thủ",
    "secondaryRoles": [
      "Sát thủ",
      "Đấu sĩ"
    ],
    "playstyles": [
      "Sát thương duy trì",
      "Sát thương dồn",
      "Cơ động"
    ],
    "primaryLane": "Rừng",
    "secondaryLanes": [
      "AD",
      "Caesar"
    ],
    "damageType": "Hỗn hợp",
    "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 5,
      "damage": 10,
      "crowdControl": 5,
      "engage": 7,
      "peel": 3,
      "mobility": 8,
      "earlyGame": 7,
      "lateGame": 10
    },
    "signatureSkill": "Thần Thánh Giáng Trần (Bất tử trong 3 giây và chuyển sát thương thành hồi phục)",
    "counters": [
      "Omen",
      "Aleister",
      "Arum"
    ],
    "synergies": [
      "Helen",
      "Zip",
      "Lumburr"
    ],
    "tags": [
      "Bất tử 3 giây",
      "Vừa đánh xa vừa cận chiến",
      "Sát thương chuẩn nổ"
    ],
    "tacticalNotes": "Bật chiêu cuối để bất tử 3 giây, tự do xả sát thương chuẩn mà không sợ bị sốc bốc hơi.",
    "difficulty": "Khó",
    "isActive": true
  },
  {
    "id": "hero_dextra",
    "name": "Dextra",
    "title": "Huyết Luân Cưa Sắt",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Đỡ đòn"
    ],
    "playstyles": [
      "Chống chịu",
      "Mở giao tranh"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [
      "Support",
      "Rừng"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 9,
      "damage": 7,
      "crowdControl": 6,
      "engage": 7,
      "peel": 5,
      "mobility": 7,
      "earlyGame": 7,
      "lateGame": 8
    },
    "signatureSkill": "Huyết Tế Chuyển Hóa (Chuyển 100% sát thương nhận vào thành hồi máu)",
    "counters": [
      "Hayate",
      "Aleister",
      "Arum"
    ],
    "synergies": [
      "Sinestrea",
      "Helen",
      "Tulen"
    ],
    "tags": [
      "Chuyển sát thương thành máu",
      "Cặp đôi với Sinestrea",
      "Chống chịu bất tử"
    ],
    "tacticalNotes": "Khi gần hết máu bật chiêu cuối để biến mọi đòn đánh của địch thành lượng máu hồi lại cực lớn.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_sinestrea",
    "name": "Sinestrea",
    "title": "Huyết Sắc Ngủ Say",
    "role": "Sát thủ",
    "secondaryRoles": [
      "Đấu sĩ"
    ],
    "playstyles": [
      "Ám sát chủ lực",
      "Sát thương dồn",
      "Đẩy lẻ"
    ],
    "primaryLane": "Rừng",
    "secondaryLanes": [
      "Caesar"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 10,
      "crowdControl": 5,
      "engage": 7,
      "peel": 2,
      "mobility": 8,
      "earlyGame": 7,
      "lateGame": 9
    },
    "signatureSkill": "Đổi Máu Tức Thời & Tàng Hình Ngủ (Hoán đổi thanh máu với đối phương)",
    "counters": [
      "Kaine",
      "Aleister",
      "Arum"
    ],
    "synergies": [
      "Dextra",
      "Helen",
      "Thane"
    ],
    "tags": [
      "Hoán đổi máu với địch",
      "Tàng hình tại chỗ",
      "Chuyển đổi xa gần"
    ],
    "tacticalNotes": "Căn khi máu mình sắp cạn và đối phương đầy cây để hoán đổi máu, biến nguy thành an trong chớp mắt.",
    "difficulty": "Rất khó",
    "isActive": true
  },
  {
    "id": "hero_thorne",
    "name": "Thorne",
    "title": "Ma Súng Đa Sắc",
    "role": "Xạ thủ",
    "secondaryRoles": [],
    "playstyles": [
      "Sát thương dồn",
      "Khống chế",
      "Sát thương duy trì"
    ],
    "primaryLane": "AD",
    "secondaryLanes": [
      "Rừng"
    ],
    "damageType": "Hỗn hợp",
    "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 3,
      "damage": 10,
      "crowdControl": 8,
      "engage": 5,
      "peel": 4,
      "mobility": 7,
      "earlyGame": 6,
      "lateGame": 10
    },
    "signatureSkill": "Ma Nạp 3 Màu Đạn (Tùy biến đạn Tím % máu, đạn Vàng choáng, đạn Xanh hồi chiêu)",
    "counters": [
      "Kaine",
      "Ngộ Không",
      "Aoi"
    ],
    "synergies": [
      "Helen",
      "Lumburr",
      "Baldum"
    ],
    "tags": [
      "Tùy biến 3 loại đạn",
      "Sát thương % máu khủng",
      "Xạ thủ gánh đội cuối trận"
    ],
    "tacticalNotes": "Nạp đạn Tím để bắn xuyên tanker, nạp đạn Vàng để khống chế đối phương, nạp đạn Xanh để giảm hồi chiêu.",
    "difficulty": "Khó",
    "isActive": true
  },
  {
    "id": "hero_allain",
    "name": "Allain",
    "title": "Cuồng Kiếm Song Đao",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Sát thương duy trì",
      "Sát thương dồn",
      "Đẩy lẻ"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [
      "Rừng"
    ],
    "damageType": "Hỗn hợp",
    "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 7,
      "damage": 9,
      "crowdControl": 7,
      "engage": 9,
      "peel": 4,
      "mobility": 8,
      "earlyGame": 6,
      "lateGame": 10
    },
    "signatureSkill": "Kiếm Vũ Trảm Thiên (Lao lên không trung khóa mục tiêu gây cả sát thương vật lý, phép và chuẩn)",
    "counters": [
      "Florentino",
      "Hayate",
      "Aleister"
    ],
    "synergies": [
      "Helen",
      "Zip",
      "Aya"
    ],
    "tags": [
      "Sát thương hỗn hợp cả chuẩn",
      "Chiêu cuối bất tử chọn mục tiêu",
      "Solo 1v1 cực mạnh"
    ],
    "tacticalNotes": "Chiêu cuối bắt chết chủ lực không thể né tránh. Càng đánh tay nhiều tích nội tại càng hút máu và trảm sát thương chuẩn.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_laville",
    "name": "Laville",
    "title": "Tay Súng Tinh Linh",
    "role": "Xạ thủ",
    "secondaryRoles": [],
    "playstyles": [
      "Sát thương duy trì",
      "Cơ động",
      "Khống chế"
    ],
    "primaryLane": "AD",
    "secondaryLanes": [],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 9,
      "crowdControl": 8,
      "engage": 8,
      "peel": 5,
      "mobility": 7,
      "earlyGame": 7,
      "lateGame": 9
    },
    "signatureSkill": "Đạn Ánh Sáng Xuyên Bản Đồ (Chiêu cuối bắn choáng toàn bản đồ tối đa 3.5 giây)",
    "counters": [
      "Kaine",
      "Ngộ Không",
      "Murad"
    ],
    "synergies": [
      "Helen",
      "Thane",
      "Lumburr"
    ],
    "tags": [
      "Bắn đạn choáng toàn map",
      "Khiên miễn khống",
      "Tốc đánh liên thanh"
    ],
    "tacticalNotes": "Chiêu 2 bật đúng lúc sẽ chặn hoàn toàn khống chế và tăng tốc chạy. Chiêu cuối dùng để mở giao tranh từ xa.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_rouie",
    "name": "Rouie",
    "title": "Ánh Sáng Không Gian",
    "role": "Trợ thủ",
    "secondaryRoles": [
      "Pháp sư"
    ],
    "playstyles": [
      "Đa dụng",
      "Bảo kê",
      "Cơ động",
      "Khống chế"
    ],
    "primaryLane": "Support",
    "secondaryLanes": [
      "Mid"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 5,
      "crowdControl": 8,
      "engage": 9,
      "peel": 10,
      "mobility": 9,
      "earlyGame": 7,
      "lateGame": 9
    },
    "signatureSkill": "Thần Môn Tức Thời (Về tế đàn hồi đầy máu trong 1 giây rồi truyền tống ngược lại)",
    "counters": [
      "Chaugnar",
      "Kaine",
      "Aleister"
    ],
    "synergies": [
      "Elandorr",
      "Tulen",
      "Hayate"
    ],
    "tags": [
      "Truyền tống toàn đội",
      "Về tế đàn hồi máu siêu tốc",
      "Trợ thủ chiến thuật giải đấu"
    ],
    "tacticalNotes": "Vua chiến thuật giải đấu: đặt cổng về thành hồi đầy máu rồi lập tức dùng chiêu cuối triệu hồi cả 5 người tràn xuống giao tranh.",
    "difficulty": "Khó",
    "isActive": true
  },
  {
    "id": "hero_ata",
    "name": "Ata",
    "title": "Hải Tặc Mèo Biển",
    "role": "Đỡ đòn",
    "secondaryRoles": [
      "Đấu sĩ",
      "Trợ thủ"
    ],
    "playstyles": [
      "Chống chịu",
      "Khống chế",
      "Mở giao tranh"
    ],
    "primaryLane": "Support",
    "secondaryLanes": [
      "Caesar"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 9,
      "damage": 6,
      "crowdControl": 8,
      "engage": 9,
      "peel": 7,
      "mobility": 6,
      "earlyGame": 8,
      "lateGame": 7
    },
    "signatureSkill": "Con Thuyền Khổng Lồ (Dựng tường thuyền chặn hoàn toàn đường lui của địch)",
    "counters": [
      "Hayate",
      "Lauriel",
      "Florentino"
    ],
    "synergies": [
      "Yue",
      "Natalya",
      "Krixi"
    ],
    "tags": [
      "Tạo địa hình chặn đường",
      "Thanh máu ảo hồi phục",
      "Khống chế ép góc"
    ],
    "tacticalNotes": "Máu ảo nhận vào có thể hồi lại bằng cách gây sát thương. Chiêu cuối dựng thuyền chặn hẹp hang Rồng/Caesar.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_paine",
    "name": "Paine",
    "title": "Khúc Nhạc Tử Thần",
    "role": "Sát thủ",
    "secondaryRoles": [
      "Pháp sư"
    ],
    "playstyles": [
      "Ám sát chủ lực",
      "Sát thương dồn",
      "Cơ động"
    ],
    "primaryLane": "Rừng",
    "secondaryLanes": [
      "Mid"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 10,
      "crowdControl": 7,
      "engage": 9,
      "peel": 2,
      "mobility": 10,
      "earlyGame": 10,
      "lateGame": 7
    },
    "signatureSkill": "Hồn Xuất Khiếu & Khúc Diệt Vong (Lao tới từ cự ly siêu xa gây câm lặng và sát thương phép cực lớn)",
    "counters": [
      "Arum",
      "Aleister",
      "Thane"
    ],
    "synergies": [
      "Baldum",
      "Helen",
      "Krixi"
    ],
    "tags": [
      "Câm lặng diện rộng",
      "Bay vào từ ngoài màn hình",
      "Sát thủ phép đầu trận"
    ],
    "tacticalNotes": "Bá chủ đầu và giữa trận. Chiêu 2 gây câm lặng khiến pháp sư và xạ thủ đối phương không kịp dùng tốc biến hay chiêu thức thoát thân.",
    "difficulty": "Khó",
    "isActive": true
  },
  {
    "id": "hero_keera",
    "name": "Keera",
    "title": "Hắc Ma Nữ Nhí",
    "role": "Sát thủ",
    "secondaryRoles": [
      "Pháp sư"
    ],
    "playstyles": [
      "Ám sát chủ lực",
      "Sát thương dồn",
      "Cơ động"
    ],
    "primaryLane": "Rừng",
    "secondaryLanes": [
      "Mid"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 10,
      "crowdControl": 6,
      "engage": 8,
      "peel": 2,
      "mobility": 10,
      "earlyGame": 8,
      "lateGame": 9
    },
    "signatureSkill": "Hắc Ma Xuyên Tường (Đi xuyên qua mọi bờ tường bản đồ và làm mới chiêu)",
    "counters": [
      "Aleister",
      "Arum",
      "Omen"
    ],
    "synergies": [
      "Helen",
      "Lumburr",
      "Baldum"
    ],
    "tags": [
      "Đi xuyên tường",
      "Sát thương phép khủng",
      "Sát thủ một chạm"
    ],
    "tacticalNotes": "Chiêu cuối cho phép đi xuyên qua mọi địa hình và miễn nhiễm sát thương đòn đánh thường, luồn lách bắt chủ lực cực hiểm.",
    "difficulty": "Khó",
    "isActive": true
  },
  {
    "id": "hero_dirak",
    "name": "Dirak",
    "title": "Pháp Vương Tinh Tú",
    "role": "Pháp sư",
    "secondaryRoles": [],
    "playstyles": [
      "Khống chế",
      "Cấu rỉa",
      "Bảo kê"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [
      "Support"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 7,
      "damage": 8,
      "crowdControl": 10,
      "engage": 7,
      "peel": 9,
      "mobility": 5,
      "earlyGame": 7,
      "lateGame": 9
    },
    "signatureSkill": "Khiên Năng Lượng Đẩy Lùi (Dựng lá chắn khổng lồ chặn toàn bộ đạn bắn của đối phương)",
    "counters": [
      "Kaine",
      "Nakroth",
      "Aoi"
    ],
    "synergies": [
      "Hayate",
      "Capheny",
      "Thane"
    ],
    "tags": [
      "Chặn toàn bộ đạn đạo",
      "Dùng năng lượng thay máu",
      "Đẩy lùi liên hoàn"
    ],
    "tacticalNotes": "Dựng khiên chặn đứng đạn của xạ thủ địch và tia chiêu cuối của các pháp sư. Khi hết máu sẽ tự động dùng mana để chịu đòn.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_ishar",
    "name": "Ishar",
    "title": "Triệu Hồi Sư Tí Hon",
    "role": "Pháp sư",
    "secondaryRoles": [
      "Trợ thủ"
    ],
    "playstyles": [
      "Khống chế",
      "Cấu rỉa",
      "Bảo kê",
      "Đa dụng"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [
      "Support"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 6,
      "damage": 7,
      "crowdControl": 9,
      "engage": 8,
      "peel": 8,
      "mobility": 6,
      "earlyGame": 8,
      "lateGame": 7
    },
    "signatureSkill": "Triệu Hồi Thú Tí Nị (Gọi pet Tí Nị càn quét và dựng lồng nhốt đối phương)",
    "counters": [
      "Chaugnar",
      "Hayate",
      "Florentino"
    ],
    "synergies": [
      "Natalya",
      "Yue",
      "Yorn"
    ],
    "tags": [
      "Pet Tí Nị gánh dame",
      "Lồng nhốt giam cầm",
      "Khắc chế tàng hình"
    ],
    "tacticalNotes": "Pet Tí Nị có thể chặn đạn móc của Grakk và phát hiện tướng tàng hình. Chiêu cuối nhốt kẻ địch trong lồng.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_volkath",
    "name": "Volkath",
    "title": "Chúa Tể Hắc Ám",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Chống chịu",
      "Mở giao tranh",
      "Sát thương dồn"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [
      "Rừng"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 8,
      "damage": 9,
      "crowdControl": 7,
      "engage": 10,
      "peel": 3,
      "mobility": 8,
      "earlyGame": 7,
      "lateGame": 9
    },
    "signatureSkill": "Kỵ Binh Bất Tử (Cưỡi ngựa đẩy lùi và bật trạng thái bất tử 3.5 giây)",
    "counters": [
      "Hayate",
      "Aleister",
      "Arum"
    ],
    "synergies": [
      "Helen",
      "Tulen",
      "Krixi"
    ],
    "tags": [
      "Bất tử 3.5 giây",
      "Cưỡi ngựa mở giao tranh",
      "Băng trụ tiêu diệt chủ lực"
    ],
    "tacticalNotes": "Cưỡi ngựa giải toàn bộ khống chế và lao thẳng vào trụ đối phương. Hết trạng thái bất tử sẽ hồi lại 25% máu.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_krizzix",
    "name": "Krizzix",
    "title": "Tắc Kè Biến Sắc",
    "role": "Trợ thủ",
    "secondaryRoles": [
      "Đỡ đòn"
    ],
    "playstyles": [
      "Mở giao tranh",
      "Khống chế",
      "Cơ động",
      "Đa dụng"
    ],
    "primaryLane": "Support",
    "secondaryLanes": [],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 7,
      "damage": 5,
      "crowdControl": 10,
      "engage": 10,
      "peel": 6,
      "mobility": 9,
      "earlyGame": 9,
      "lateGame": 7
    },
    "signatureSkill": "Ngụy Trang Toàn Đội & Hút Hồn (Cho cả đội tàng hình tăng tốc rồi hút cả 5 tướng địch lại một điểm)",
    "counters": [
      "Chaugnar",
      "Lumburr",
      "Thane"
    ],
    "synergies": [
      "Natalya",
      "Yue",
      "Maloch"
    ],
    "tags": [
      "Tàng hình toàn đội",
      "Gom cụm 5 người",
      "Wombo combo hủy diệt"
    ],
    "tacticalNotes": "Bật chiêu cuối tàng hình tăng tốc cùng đồng minh, lao vào hút toàn bộ đối phương tạo tiền đề cho đồng đội xả sát thương diện rộng.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_zip",
    "name": "Zip",
    "title": "Tiểu Quỷ Hút Hồn",
    "role": "Trợ thủ",
    "secondaryRoles": [
      "Đỡ đòn"
    ],
    "playstyles": [
      "Bảo kê",
      "Đa dụng",
      "Khống chế"
    ],
    "primaryLane": "Support",
    "secondaryLanes": [],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 8,
      "damage": 4,
      "crowdControl": 8,
      "engage": 8,
      "peel": 10,
      "mobility": 8,
      "earlyGame": 8,
      "lateGame": 9
    },
    "signatureSkill": "Nuốt Chửng Cả Thế Giới (Nuốt đồng đội, lính hoặc bùa rừng giải cứu hoặc cướp bùa)",
    "counters": [
      "Aleister",
      "Arum",
      "Hayate"
    ],
    "synergies": [
      "Allain",
      "Yan",
      "Violet"
    ],
    "tags": [
      "Nuốt đồng đội giải nguy",
      "Cướp bùa phá rừng",
      "Lăn cầu bất tử"
    ],
    "tacticalNotes": "Nuốt đồng đội bị dồn sát thương để giải nguy tức thì. Nuốt lính chặn đợt đẩy trụ của đối thủ.",
    "difficulty": "Khó",
    "isActive": true
  },
  {
    "id": "hero_enzo",
    "name": "Enzo",
    "title": "Kẻ Phán Quyết",
    "role": "Sát thủ",
    "secondaryRoles": [
      "Đấu sĩ"
    ],
    "playstyles": [
      "Ám sát chủ lực",
      "Khống chế",
      "Cơ động"
    ],
    "primaryLane": "Rừng",
    "secondaryLanes": [
      "Support"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 5,
      "damage": 9,
      "crowdControl": 9,
      "engage": 8,
      "peel": 5,
      "mobility": 9,
      "earlyGame": 8,
      "lateGame": 8
    },
    "signatureSkill": "Câu Hồn Quăng Quật (Móc xích trói chặt đối phương rồi hất ngược về sau)",
    "counters": [
      "Chaugnar",
      "Florentino",
      "Aleister"
    ],
    "synergies": [
      "Tulen",
      "Krixi",
      "Thane"
    ],
    "tags": [
      "Móc xích hất ngược",
      "Sát thủ kỹ năng cao",
      "Tăng tốc đánh điên cuồng"
    ],
    "tacticalNotes": "Móc trúng chiêu 2 là nắm giữ 90% cơ hội hạ gục đối thủ bằng cách quăng ngược về phía đồng đội.",
    "difficulty": "Rất khó",
    "isActive": true
  },
  {
    "id": "hero_yena",
    "name": "Yena",
    "title": "Vũ Nữ Bán Nguyệt",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Sát thương dồn",
      "Khống chế",
      "Cơ động",
      "Đẩy lẻ"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [
      "Rừng"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 7,
      "damage": 10,
      "crowdControl": 8,
      "engage": 9,
      "peel": 4,
      "mobility": 9,
      "earlyGame": 7,
      "lateGame": 9
    },
    "signatureSkill": "Hoán Chuyển Song Đoản & Đại Đao (Câm lặng đối thủ rồi đổi đại đao đẩy lùi miễn thương 50%)",
    "counters": [
      "Florentino",
      "Aleister",
      "Omen"
    ],
    "synergies": [
      "Tulen",
      "Helen",
      "Maloch"
    ],
    "tags": [
      "Đổi dạng song đao đại đao",
      "Câm lặng 1 giây",
      "Miễn thương 50%"
    ],
    "tacticalNotes": "Tích đủ 5 điểm nội tại gây câm lặng, sau đó lập tức chuyển đại đao dồn chuỗi sát thương không cho địch kịp phản ứng.",
    "difficulty": "Khó",
    "isActive": true
  },
  {
    "id": "hero_capheny",
    "name": "Capheny",
    "title": "Đại Pháo Thần Công",
    "role": "Xạ thủ",
    "secondaryRoles": [],
    "playstyles": [
      "Sát thương duy trì",
      "Cơ động",
      "Sát thương dồn"
    ],
    "primaryLane": "AD",
    "secondaryLanes": [
      "Rừng"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 3,
      "damage": 10,
      "crowdControl": 4,
      "engage": 5,
      "peel": 3,
      "mobility": 9,
      "earlyGame": 7,
      "lateGame": 10
    },
    "signatureSkill": "Đại Bác Năng Lượng & Mưa Đạn Liên Thanh (Vừa chạy vừa xả đại liên và bắn phá giao tranh)",
    "counters": [
      "Kaine",
      "Ngộ Không",
      "Aoi"
    ],
    "synergies": [
      "Helen",
      "TeeMee",
      "Thane"
    ],
    "tags": [
      "Vừa di chuyển vừa bắn",
      "Chuyển đổi đại liên và đại bác",
      "Xạ thủ siêu carry late"
    ],
    "tacticalNotes": "Khả năng vừa di chuyển vừa bắn giúp Capheny thả diều cực tốt. Dùng chiêu cuối để ép góc đối phương tại trụ.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_errol",
    "name": "Errol",
    "title": "Tay Ác Ma",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Sát thương dồn",
      "Mở giao tranh"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [
      "Rừng"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 7,
      "damage": 9,
      "crowdControl": 7,
      "engage": 9,
      "peel": 3,
      "mobility": 8,
      "earlyGame": 8,
      "lateGame": 7
    },
    "signatureSkill": "Đại Địa Nham Bổ & Mắt Quỷ (Bay lên trời không thể chọn làm mục tiêu rồi dậm xuống hất tung)",
    "counters": [
      "Hayate",
      "Florentino",
      "Aleister"
    ],
    "synergies": [
      "Krixi",
      "Lumburr",
      "Helen"
    ],
    "tags": [
      "Hút máu điên cuồng",
      "Bay lên trời bất tử",
      "Bổ rìu sốc sát thương"
    ],
    "tacticalNotes": "Tích đủ 5 quỷ trảo để bổ chiêu 2 hất tung và hồi lượng máu cực khủng. Chiêu cuối bay lên không để mở combat hoặc né sát thương.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_hayate",
    "name": "Hayate",
    "title": "Ninja Tà Khí",
    "role": "Xạ thủ",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Sát thương duy trì",
      "Cơ động",
      "Sát thương dồn"
    ],
    "primaryLane": "AD",
    "secondaryLanes": [],
    "damageType": "Chuẩn",
    "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 10,
      "crowdControl": 4,
      "engage": 8,
      "peel": 3,
      "mobility": 9,
      "earlyGame": 6,
      "lateGame": 10
    },
    "signatureSkill": "Bão Phi Tiêu Sát Thương Chuẩn (Phi tiêu liên hoàn gây sát thương chuẩn chí mạng xuyên mọi giáp)",
    "counters": [
      "Kaine",
      "Ngộ Không",
      "Aleister"
    ],
    "synergies": [
      "Baldum",
      "Helen",
      "Thane"
    ],
    "tags": [
      "Sát thương chuẩn chí mạng",
      "Khắc tinh mọi đỡ đòn",
      "Lướt cơ động cao"
    ],
    "tacticalNotes": "Vua diệt tanker số 1 Liên Quân Mobile. Bão phi tiêu chiêu cuối kết hợp phù hiệu và trang bị làm chậm có thể quét sạch cả đội hình.",
    "difficulty": "Khó",
    "isActive": true
  },
  {
    "id": "hero_darcy",
    "name": "D'Arcy",
    "title": "Pháp Sư Không Gian",
    "role": "Pháp sư",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Sát thương dồn",
      "Khống chế",
      "Cơ động"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [
      "Rừng"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 10,
      "crowdControl": 8,
      "engage": 8,
      "peel": 4,
      "mobility": 8,
      "earlyGame": 8,
      "lateGame": 9
    },
    "signatureSkill": "Ma Trận Chiêu Cực (Khóa mục tiêu vào ma trận không gian kéo giật ngược về)",
    "counters": [
      "Chaugnar",
      "Aleister",
      "Kaine"
    ],
    "synergies": [
      "Thane",
      "Baldum",
      "Hayate"
    ],
    "tags": [
      "Kéo giật đối phương",
      "Miễn nhiễm khống chế",
      "Sốc dame ma thuật"
    ],
    "tacticalNotes": "Chiêu 1 vừa tăng tốc vừa miễn nhiễm khống chế. Chiêu cuối trúng mục tiêu sẽ giật đối thủ về tâm sau 2 giây.",
    "difficulty": "Khó",
    "isActive": true
  },
  {
    "id": "hero_veres",
    "name": "Veres",
    "title": "Huyết Xích Nữ Thần",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Sát thủ",
      "Trợ thủ"
    ],
    "playstyles": [
      "Sát thương duy trì",
      "Chống chịu",
      "Khống chế"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [
      "Rừng",
      "Mid",
      "Support"
    ],
    "damageType": "Hỗn hợp",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 8,
      "damage": 9,
      "crowdControl": 8,
      "engage": 8,
      "peel": 6,
      "mobility": 7,
      "earlyGame": 9,
      "lateGame": 8
    },
    "signatureSkill": "Huyết Xích Xoay Tròn (Tích 4 điểm nội tại múa xích hồi máu cực mạnh và trừng phạt mục tiêu thấp máu)",
    "counters": [
      "Florentino",
      "Hayate",
      "Aleister"
    ],
    "synergies": [
      "Helen",
      "Tulen",
      "Krixi"
    ],
    "tags": [
      "Múa xích hồi phục",
      "Sát thương chuẩn kết liễu",
      "Đi được 4 đường"
    ],
    "tacticalNotes": "Vị tướng đa năng nhất Liên Quân: có thể đi Caesar, Rừng, Mid hoặc Trợ thủ. Căn rìa chiêu để làm choáng và kéo đối phương.",
    "difficulty": "Khó",
    "isActive": true
  },
  {
    "id": "hero_florentino",
    "name": "Florentino",
    "title": "Kiếm Khách Hào Hoa",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Sát thương dồn",
      "Sát thương duy trì",
      "Cơ động",
      "Đẩy lẻ"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [
      "Rừng"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 6,
      "damage": 10,
      "crowdControl": 6,
      "engage": 8,
      "peel": 3,
      "mobility": 9,
      "earlyGame": 8,
      "lateGame": 9
    },
    "signatureSkill": "Thưởng Hoa & Múa Kiếm (Nhặt hoa hồi năng lượng, sát thương chuẩn và miễn khống)",
    "counters": [
      "Aleister",
      "Arum",
      "Omen",
      "Valhein"
    ],
    "synergies": [
      "Helen",
      "Lumburr",
      "Tulen"
    ],
    "tags": [
      "Đấu sĩ gánh team",
      "Solo 1v1 đỉnh cao",
      "Miễn khống chế"
    ],
    "tacticalNotes": "Đỉnh cao solo đường Tà Thần Caesar. Nhặt hoa chuẩn xác để liên tục lướt chém sát thương chuẩn và hồi phục.",
    "difficulty": "Rất khó",
    "isActive": true
  },
  {
    "id": "hero_sephera",
    "name": "Sephera",
    "title": "Thiên Mệnh Thủy Cầm",
    "role": "Pháp sư",
    "secondaryRoles": [
      "Trợ thủ"
    ],
    "playstyles": [
      "Cấu rỉa",
      "Bảo kê"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [
      "Support"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 5,
      "damage": 7,
      "crowdControl": 7,
      "engage": 6,
      "peel": 9,
      "mobility": 8,
      "earlyGame": 7,
      "lateGame": 8
    },
    "signatureSkill": "Thủy Thần Trỗi Dậy (Bay lên trời không thể chọn làm mục tiêu, hồi máu đồng minh và gây dame địch)",
    "counters": [
      "Kaine",
      "Quillen",
      "Aoi"
    ],
    "synergies": [
      "Hayate",
      "Violet",
      "Thane"
    ],
    "tags": [
      "Bất tử chiêu cuối",
      "Hồi máu toàn đội",
      "Thả diều cấu rỉa liên tục"
    ],
    "tacticalNotes": "Cấu rỉa làm chậm đối thủ liên tục ở tầm xa. Khi bị áp sát chỉ cần bật chiêu cuối bay lên trời vừa hồi máu vừa né toàn bộ sốc dame.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_quillen",
    "name": "Quillen",
    "title": "Ám Đao Vô Ảnh",
    "role": "Sát thủ",
    "secondaryRoles": [],
    "playstyles": [
      "Ám sát chủ lực",
      "Sát thương dồn",
      "Cơ động"
    ],
    "primaryLane": "Rừng",
    "secondaryLanes": [],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 10,
      "crowdControl": 5,
      "engage": 7,
      "peel": 2,
      "mobility": 9,
      "earlyGame": 9,
      "lateGame": 7
    },
    "signatureSkill": "Chém Lén Chí Mạng 100% & Reset Chiêu (Chém từ sau lưng 100% chí mạng và hồi lại toàn bộ chiêu khi hạ gục)",
    "counters": [
      "Aleister",
      "Arum",
      "Elsu",
      "Max"
    ],
    "synergies": [
      "Baldum",
      "Helen",
      "Thane"
    ],
    "tags": [
      "Chí mạng 100% từ sau lưng",
      "Tàng hình tăng tốc",
      "Reset chiêu liên hoàn"
    ],
    "tacticalNotes": "Luôn tìm góc vòng sau lưng mục tiêu để kích hoạt 100% tỉ lệ chí mạng. Hạ gục 1 người là lập tức làm mới toàn bộ chiêu thức.",
    "difficulty": "Khó",
    "isActive": true
  },
  {
    "id": "hero_riktor",
    "name": "Riktor",
    "title": "Thợ Săn Bầu Trời (Riktor / Richter)",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Sát thủ",
      "Trợ thủ"
    ],
    "playstyles": [
      "Sát thương dồn",
      "Khống chế",
      "Cơ động",
      "Mở giao tranh"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [
      "Support",
      "Mid"
    ],
    "damageType": "Hỗn hợp",
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 7,
      "damage": 9,
      "crowdControl": 8,
      "engage": 9,
      "peel": 5,
      "mobility": 8,
      "earlyGame": 10,
      "lateGame": 7
    },
    "signatureSkill": "Biến Hóa Địa Hình & Kiếm Trận Hủy Diệt (Thay đổi chiêu thức theo sông, bụi cỏ và đường bộ)",
    "counters": [
      "Florentino",
      "Omen",
      "Aleister"
    ],
    "synergies": [
      "Krixi",
      "Tulen",
      "Helen"
    ],
    "tags": [
      "Núp bụi hất tung cực mạnh",
      "Miễn sát thương chiêu 2",
      "Bá chủ đảo gank đầu trận",
      "Richter",
      "Riktor"
    ],
    "tacticalNotes": "Nấp trong bụi cỏ để kích hoạt trạng thái kiếm cỏ chém hất tung đối thủ. Chiêu 2 miễn hoàn toàn mọi sát thương và hiệu ứng.",
    "difficulty": "Khó",
    "isActive": true
  },
  {
    "id": "hero_annette",
    "name": "Annette",
    "title": "Gió Ma Thuật",
    "role": "Trợ thủ",
    "secondaryRoles": [
      "Pháp sư"
    ],
    "playstyles": [
      "Bảo kê",
      "Khống chế",
      "Đa dụng"
    ],
    "primaryLane": "Support",
    "secondaryLanes": [
      "Mid"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 5,
      "damage": 6,
      "crowdControl": 9,
      "engage": 7,
      "peel": 10,
      "mobility": 7,
      "earlyGame": 7,
      "lateGame": 9
    },
    "signatureSkill": "Mắt Bão Hộ Thể (Tạo cơn bão hất văng mọi kẻ địch và chặn không cho đối thủ bước vào)",
    "counters": [
      "Chaugnar",
      "Kaine",
      "Aleister"
    ],
    "synergies": [
      "Yorn",
      "Tel'Annas",
      "Capheny"
    ],
    "tags": [
      "Bức tường gió bảo kê chủ lực",
      "Hất văng sát thủ",
      "Nạp gió hồi chiêu"
    ],
    "tacticalNotes": "Bảo mẫu hoàn hảo của xạ thủ. Bật chiêu cuối tạo mắt bão đẩy lùi mọi sát thủ lao vào, tạo không gian an toàn tuyệt đối cho AD.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_amily",
    "name": "Amily",
    "title": "Đao Phủ Cuồng Nộ",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Sát thương dồn",
      "Chống chịu",
      "Đẩy lẻ"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [
      "Rừng"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 8,
      "damage": 9,
      "crowdControl": 6,
      "engage": 8,
      "peel": 4,
      "mobility": 7,
      "earlyGame": 8,
      "lateGame": 8
    },
    "signatureSkill": "Cuồng Bạo Hóa (Tăng 50% sát thương khi đánh đơn mục tiêu và miễn thương lớn)",
    "counters": [
      "Florentino",
      "Hayate",
      "Aleister"
    ],
    "synergies": [
      "Helen",
      "Tulen",
      "Lumburr"
    ],
    "tags": [
      "Đấm đá đơn mục tiêu cực thốn",
      "Miễn thương chiêu cuối",
      "Solo đường tà thần mạnh"
    ],
    "tacticalNotes": "Nội tại tăng 50% sát thương khi chỉ trúng 1 mục tiêu duy nhất. Chiêu cuối tăng công và miễn thương, tự tin solo bất kỳ ai.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_roxie",
    "name": "Roxie",
    "title": "Nhà Thám Hiểm Lửa",
    "role": "Đỡ đòn",
    "secondaryRoles": [
      "Đấu sĩ"
    ],
    "playstyles": [
      "Chống chịu",
      "Khống chế",
      "Sát thương duy trì"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [
      "Support"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 9,
      "damage": 7,
      "crowdControl": 8,
      "engage": 7,
      "peel": 8,
      "mobility": 7,
      "earlyGame": 8,
      "lateGame": 8
    },
    "signatureSkill": "Keo Lửa Kéo Đi (Bật vệt lửa chạy quanh và tung dây kéo đối thủ theo mình)",
    "counters": [
      "Hayate",
      "Lauriel",
      "Florentino"
    ],
    "synergies": [
      "Natalya",
      "Yue",
      "Tulen"
    ],
    "tags": [
      "Kéo đối phương chạy theo",
      "Đốt máu theo thời gian",
      "Cực kỳ trâu bò"
    ],
    "tacticalNotes": "Bật chiêu 1 để đốt lửa gây sát thương phép liên tục và hồi máu. Chiêu cuối kéo đối thủ vào trụ hoặc giữa đội hình ta.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_baldum",
    "name": "Baldum",
    "title": "Nhân Mã Thần Lực",
    "role": "Đỡ đòn",
    "secondaryRoles": [
      "Trợ thủ"
    ],
    "playstyles": [
      "Chống chịu",
      "Mở giao tranh",
      "Khống chế"
    ],
    "primaryLane": "Support",
    "secondaryLanes": [
      "Caesar"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 10,
      "damage": 6,
      "crowdControl": 10,
      "engage": 10,
      "peel": 7,
      "mobility": 6,
      "earlyGame": 8,
      "lateGame": 9
    },
    "signatureSkill": "Địa Giam Chôn Vùi (Chôn sống toàn bộ mục tiêu xuống lòng đất trong 3 giây)",
    "counters": [
      "Chaugnar",
      "Hayate",
      "Lauriel"
    ],
    "synergies": [
      "Natalya",
      "Yue",
      "Krixi"
    ],
    "tags": [
      "Chôn sống cả đội đối phương",
      "Hất ngược về sau",
      "Giáp vật lý vô đối"
    ],
    "tacticalNotes": "Địa giam chôn sống đối thủ là công cụ chia cắt giao tranh mạnh nhất game. Hất ngược tướng địch về cho đồng đội tiêu diệt.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_marja",
    "name": "Marja",
    "title": "Nữ Hoàng Bóng Tối",
    "role": "Pháp sư",
    "secondaryRoles": [
      "Đấu sĩ"
    ],
    "playstyles": [
      "Sát thương duy trì",
      "Chống chịu"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [
      "Caesar"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 7,
      "damage": 7,
      "crowdControl": 6,
      "engage": 6,
      "peel": 6,
      "mobility": 7,
      "earlyGame": 7,
      "lateGame": 8
    },
    "signatureSkill": "Hóa Thân Bóng Tối (Biến thành bóng đêm bất tử tăng tốc và hồi phục toàn bộ)",
    "counters": [
      "Hayate",
      "Aleister",
      "Arum"
    ],
    "synergies": [
      "Helen",
      "Lumburr",
      "Thane"
    ],
    "tags": [
      "Không dùng mana",
      "Hồi máu liên tục",
      "Bất tử chiêu cuối"
    ],
    "tacticalNotes": "Không tốn năng lượng nên có thể bám đường vô hạn. Chiêu cuối biến thành bóng đêm né mọi chiêu thức sát thương lớn.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_rourke",
    "name": "Rourke",
    "title": "Lão Tướng Đại Bác",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Sát thương dồn",
      "Chống chịu",
      "Đẩy lẻ"
    ],
    "primaryLane": "Rừng",
    "secondaryLanes": [
      "Caesar"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 8,
      "damage": 10,
      "crowdControl": 6,
      "engage": 8,
      "peel": 4,
      "mobility": 7,
      "earlyGame": 10,
      "lateGame": 6
    },
    "signatureSkill": "Bắn Gần Nát Trụ & Miễn Khống (Bắn áp sát 4 viên đạn nổ và tạo khiên miễn nhiễm toàn bộ khống chế)",
    "counters": [
      "Hayate",
      "Lauriel",
      "Omen"
    ],
    "synergies": [
      "Helen",
      "Lumburr",
      "Alice"
    ],
    "tags": [
      "Áp sát một phát chết luôn",
      "Bật khiên miễn khống",
      "Bá vương ăn mục tiêu đầu game"
    ],
    "tacticalNotes": "Càng bắn gần sát thương càng tăng gấp 4 lần. Bật chiêu cuối để được miễn nhiễm khống chế và ăn mục tiêu siêu tốc.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_wisp",
    "name": "Wisp",
    "title": "Pháo Thủ Tí Hon",
    "role": "Xạ thủ",
    "secondaryRoles": [],
    "playstyles": [
      "Sát thương duy trì",
      "Sát thương dồn",
      "Khống chế"
    ],
    "primaryLane": "AD",
    "secondaryLanes": [
      "Rừng"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 9,
      "crowdControl": 7,
      "engage": 7,
      "peel": 4,
      "mobility": 7,
      "earlyGame": 7,
      "lateGame": 9
    },
    "signatureSkill": "Mưa Pháo Cao Xạ (Dội bão pháo liên tục từ xa vào vùng giao tranh hẹp)",
    "counters": [
      "Kaine",
      "Ngộ Không",
      "Aoi"
    ],
    "synergies": [
      "Baldum",
      "Helen",
      "Thane"
    ],
    "tags": [
      "Dội bão pháo diện rộng",
      "Đòn đánh lan nổ",
      "Bắn giao tranh tổng mạnh"
    ],
    "tacticalNotes": "Kích hoạt chiêu 1 để đòn đánh thường lan nổ nhiều mục tiêu. Dội chiêu cuối vào các hang bùa hoặc cổng trụ ép đối phương rút lui.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_arum",
    "name": "Arum",
    "title": "Nữ Thần Thú Tộc",
    "role": "Đỡ đòn",
    "secondaryRoles": [
      "Trợ thủ"
    ],
    "playstyles": [
      "Chống chịu",
      "Khống chế"
    ],
    "primaryLane": "Support",
    "secondaryLanes": [
      "Caesar"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 10,
      "damage": 6,
      "crowdControl": 10,
      "engage": 7,
      "peel": 9,
      "mobility": 4,
      "earlyGame": 9,
      "lateGame": 7
    },
    "signatureSkill": "Thú Xích Khóa Hồn (Trói cứng mục tiêu không thể giải khống chế, chuyển sát thương cùng chịu)",
    "counters": [
      "Hayate",
      "Lauriel",
      "Valhein"
    ],
    "synergies": [
      "Tulen",
      "Krixi",
      "Violet"
    ],
    "tags": [
      "Khống chế áp chế tuyệt đối",
      "Xoay 3 linh thú hồi máu",
      "Khắc tinh mọi sát thủ bay nhảy"
    ],
    "tacticalNotes": "Khắc tinh của Nakroth, Florentino, Aoi. Chiêu cuối áp chế tuyệt đối không thể giải được kể cả dùng thanh tẩy hay Chaugnar.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_max",
    "name": "Max",
    "title": "Cơ Giáp Tí Hon",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Đỡ đòn"
    ],
    "playstyles": [
      "Mở giao tranh",
      "Cơ động",
      "Chống chịu"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [
      "Support"
    ],
    "damageType": "Chuẩn",
    "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 8,
      "damage": 7,
      "crowdControl": 7,
      "engage": 10,
      "peel": 5,
      "mobility": 9,
      "earlyGame": 7,
      "lateGame": 8
    },
    "signatureSkill": "Ra-đa Toàn Cảnh & Bổ Nhào (Soi toàn bộ vị trí kẻ địch trên bản đồ và bay thẳng vào chủ lực)",
    "counters": [
      "Florentino",
      "Hayate",
      "Aleister"
    ],
    "synergies": [
      "Tulen",
      "Kaine",
      "Krixi"
    ],
    "tags": [
      "Soi toàn bản đồ",
      "Bay thẳng vào chủ lực",
      "Nội tại giảm hồi máu 50%"
    ],
    "tacticalNotes": "Chiêu cuối soi sạch tầm nhìn kẻ địch đang nấp bụi và bay thẳng vào người xạ thủ đối phương với tốc độ tên lửa.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_tulen",
    "name": "Tulen",
    "title": "Hoàng Tử Lôi Điện",
    "role": "Pháp sư",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Sát thương dồn",
      "Cơ động",
      "Sát thương duy trì"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [
      "Rừng"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 10,
      "crowdControl": 4,
      "engage": 7,
      "peel": 2,
      "mobility": 9,
      "earlyGame": 9,
      "lateGame": 8
    },
    "signatureSkill": "Lôi Điểu Hành Quyết (Bắn chim sét hành quyết mục tiêu thấp máu, hạ gục lập tức bắn tiếp)",
    "counters": [
      "Chaugnar",
      "Aleister",
      "Thane"
    ],
    "synergies": [
      "Baldum",
      "Helen",
      "Thane"
    ],
    "tags": [
      "Lăn cầu tuyết số 1 game",
      "Hành quyết hạ gục bắn tiếp",
      "Lướt 3 lần biến ảo"
    ],
    "tacticalNotes": "Tận dụng chim sét chiêu cuối để kết liễu tướng thấp máu nhằm hồi chiêu ngay lập tức và bắn quét sạch chuỗi combat.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_omen",
    "name": "Omen",
    "title": "Quỷ Kiếm Ám Đao",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Đỡ đòn"
    ],
    "playstyles": [
      "Đẩy lẻ",
      "Chống chịu",
      "Khống chế",
      "Sát thương duy trì"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [],
    "damageType": "Chuẩn",
    "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 9,
      "damage": 8,
      "crowdControl": 8,
      "engage": 8,
      "peel": 5,
      "mobility": 6,
      "earlyGame": 7,
      "lateGame": 10
    },
    "signatureSkill": "Sát Vực Giam Cầm (Khóa chặt mục tiêu trong lồng 5 giây không thể thoát)",
    "counters": [
      "Florentino",
      "Hayate",
      "Lauriel"
    ],
    "synergies": [
      "Tulen",
      "Krixi",
      "Violet"
    ],
    "tags": [
      "Vua đẩy lẻ công trình",
      "Khóa lồng 5 giây",
      "Sát thương chuẩn đánh tay"
    ],
    "tacticalNotes": "Vua đẩy trụ số 1 Liên Quân Mobile. Bắt trúng chủ lực đối phương trong Sát Vực là nắm chắc 100% chiến thắng.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_lindis",
    "name": "Lindis",
    "title": "Ẩn Sĩ Rừng Xanh",
    "role": "Xạ thủ",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Cơ động",
      "Sát thương duy trì",
      "Đa dụng"
    ],
    "primaryLane": "Rừng",
    "secondaryLanes": [
      "AD"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 3,
      "damage": 9,
      "crowdControl": 5,
      "engage": 6,
      "peel": 4,
      "mobility": 10,
      "earlyGame": 9,
      "lateGame": 7
    },
    "signatureSkill": "Nguyệt Ảnh Trảm Địch (Chạy qua bụi tăng tốc và bắn 2 tia sáng liên tục)",
    "counters": [
      "Kaine",
      "Ngộ Không",
      "Aoi"
    ],
    "synergies": [
      "Helen",
      "Thane",
      "Baldum"
    ],
    "tags": [
      "Tăng tốc trong bụi",
      "Đặt bẫy soi tầm nhìn",
      "Xạ thủ đi rừng tốc độ"
    ],
    "tacticalNotes": "Tận dụng bụi cỏ để kích hoạt nội tại tăng tốc độ di chuyển và bắn thêm tia nguyệt ảnh cực thốn.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_teemee",
    "name": "TeeMee",
    "title": "Thần Tài Tí Nị",
    "role": "Trợ thủ",
    "secondaryRoles": [
      "Đỡ đòn"
    ],
    "playstyles": [
      "Bảo kê",
      "Đa dụng",
      "Khống chế"
    ],
    "primaryLane": "Support",
    "secondaryLanes": [],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 8,
      "damage": 5,
      "crowdControl": 9,
      "engage": 8,
      "peel": 10,
      "mobility": 7,
      "earlyGame": 8,
      "lateGame": 10
    },
    "signatureSkill": "Phục Sinh Thần Kỳ & Rắm Vàng (Tăng 25% vàng cho đồng đội và hồi sinh 2 người tại chỗ)",
    "counters": [
      "Chaugnar",
      "Hayate",
      "Aleister"
    ],
    "synergies": [
      "Capheny",
      "Hayate",
      "Yorn"
    ],
    "tags": [
      "Hack vàng cho đồng đội",
      "Hồi sinh 2 người",
      "Trợ thủ nuôi xạ thủ số 1"
    ],
    "tacticalNotes": "Nội tại giúp xạ thủ đi cùng nhanh chóng vượt trội lượng trang bị. Chiêu cuối hồi sinh đồng đội ngay trong combat.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_moren",
    "name": "Moren",
    "title": "Pháo Thủ Lão Luyện",
    "role": "Xạ thủ",
    "secondaryRoles": [],
    "playstyles": [
      "Chống chịu",
      "Sát thương duy trì",
      "Sát thương dồn"
    ],
    "primaryLane": "AD",
    "secondaryLanes": [
      "Rừng"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 8,
      "damage": 9,
      "crowdControl": 6,
      "engage": 5,
      "peel": 4,
      "mobility": 6,
      "earlyGame": 5,
      "lateGame": 10
    },
    "signatureSkill": "Súng Cối Trọng Lực & Tinh Chuẩn (Càng bắn càng tích giáp và hút máu như đấu sĩ)",
    "counters": [
      "Hayate",
      "Lauriel",
      "Florentino"
    ],
    "synergies": [
      "Helen",
      "TeeMee",
      "Thane"
    ],
    "tags": [
      "Xạ thủ trâu như đấu sĩ",
      "Hút máu điên cuồng",
      "Quái vật late game"
    ],
    "tacticalNotes": "Xạ thủ duy nhất có thể solo tay đôi với đấu sĩ late game nhờ nội tại cộng hàng trăm giáp và giáp phép.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_kilgroth",
    "name": "Kil'Groth",
    "title": "Đồ Tể Đại Dương",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Sát thương duy trì",
      "Đẩy lẻ",
      "Chống chịu"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [
      "Rừng"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 7,
      "damage": 9,
      "crowdControl": 4,
      "engage": 8,
      "peel": 2,
      "mobility": 7,
      "earlyGame": 6,
      "lateGame": 10
    },
    "signatureSkill": "Ác Mộng Biển Sâu (Miễn nhiễm hoàn toàn mọi khống chế và tăng tốc đánh)",
    "counters": [
      "Hayate",
      "Florentino",
      "Lauriel"
    ],
    "synergies": [
      "Helen",
      "Zip",
      "Aya"
    ],
    "tags": [
      "Miễn khống chế tuyệt đối",
      "Tốc đánh điên rồ",
      "Chém nát công trình"
    ],
    "tacticalNotes": "Bật chiêu cuối miễn nhiễm mọi loại choáng, làm chậm, trói chân, lao thẳng vào xạ thủ hoặc chém trụ.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_xeniel",
    "name": "Xeniel",
    "title": "Sứ Giả Thần Thánh",
    "role": "Đỡ đòn",
    "secondaryRoles": [
      "Trợ thủ"
    ],
    "playstyles": [
      "Mở giao tranh",
      "Bảo kê",
      "Chống chịu",
      "Đa dụng"
    ],
    "primaryLane": "Support",
    "secondaryLanes": [
      "Caesar"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 10,
      "damage": 6,
      "crowdControl": 7,
      "engage": 9,
      "peel": 10,
      "mobility": 8,
      "earlyGame": 7,
      "lateGame": 9
    },
    "signatureSkill": "Sứ Mệnh Cứu Thế (Đáp cánh thiên thần xuống bất kỳ đồng đội nào trên toàn bản đồ)",
    "counters": [
      "Hayate",
      "Lauriel",
      "Florentino"
    ],
    "synergies": [
      "Valhein",
      "Tulen",
      "Yena"
    ],
    "tags": [
      "Đáp cánh toàn bản đồ",
      "Cấp lá chắn khủng cho đồng minh",
      "Chiến thuật 4-1"
    ],
    "tacticalNotes": "Đẩy lẻ một mình một cánh, khi giao tranh nổ ra lập tức dùng chiêu cuối bay xuống bảo vệ đồng đội tạo thế hơn người.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_telannas",
    "name": "Tel'Annas",
    "title": "Nữ Vương Tinh Linh",
    "role": "Xạ thủ",
    "secondaryRoles": [],
    "playstyles": [
      "Sát thương duy trì",
      "Cấu rỉa",
      "Khống chế"
    ],
    "primaryLane": "AD",
    "secondaryLanes": [],
    "damageType": "Hỗn hợp",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 2,
      "damage": 10,
      "crowdControl": 7,
      "engage": 6,
      "peel": 3,
      "mobility": 4,
      "earlyGame": 7,
      "lateGame": 10
    },
    "signatureSkill": "Ưng Nhãn Tầm Xa (Tăng tầm bắn cực xa và gây cả sát thương phép lẫn vật lý)",
    "counters": [
      "Kaine",
      "Ngộ Không",
      "Aoi"
    ],
    "synergies": [
      "Thane",
      "Helen",
      "Lumburr"
    ],
    "tags": [
      "Tầm bắn xa nhất game",
      "Sát thương hỗn hợp",
      "Bắn choáng chiêu cuối xuyên map"
    ],
    "tacticalNotes": "Bật chiêu 1 để bắn trụ ngoài tầm ngắm. Yêu cầu đồng đội bảo kê chặt chẽ trước các sát thủ cơ động.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_astrid",
    "name": "Astrid",
    "title": "Kiếm Vũ Hoàng Gia",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Chống chịu",
      "Sát thương dồn",
      "Đẩy lẻ"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [
      "Rừng"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 8,
      "damage": 8,
      "crowdControl": 6,
      "engage": 8,
      "peel": 4,
      "mobility": 8,
      "earlyGame": 7,
      "lateGame": 8
    },
    "signatureSkill": "Cự Kiếm Trảm Bất Tử (Tích tụ kiếm chém hình quạt, bất tử và làm choáng kẻ địch)",
    "counters": [
      "Florentino",
      "Hayate",
      "Aleister"
    ],
    "synergies": [
      "Helen",
      "Tulen",
      "Krixi"
    ],
    "tags": [
      "Bất tử lúc vung kiếm",
      "Lá chắn nội tại liên tục",
      "Đấu sĩ lướt chém"
    ],
    "tacticalNotes": "Trong lúc vận chiêu cuối Astrid hoàn toàn miễn nhiễm mọi sát thương. Nếu máu thấp hơn đối thủ sẽ làm choáng.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_ryoma",
    "name": "Ryoma",
    "title": "Kiếm Khách Cô Độc",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Cấu rỉa",
      "Sát thương dồn",
      "Cơ động"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [
      "Rừng"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 5,
      "damage": 9,
      "crowdControl": 7,
      "engage": 7,
      "peel": 5,
      "mobility": 8,
      "earlyGame": 10,
      "lateGame": 6
    },
    "signatureSkill": "Nhất Kích Tất Sát & Loạn Trảm (Căn rìa chiêu 2 làm choáng tầm xa và đâm loạn kiếm hồi máu)",
    "counters": [
      "Florentino",
      "Omen",
      "Aleister"
    ],
    "synergies": [
      "Krixi",
      "Tulen",
      "Thane"
    ],
    "tags": [
      "Cấu rỉa tầm xa đầu trận",
      "Đâm kiếm hồi máu",
      "Đè đường mạnh mẽ"
    ],
    "tacticalNotes": "Tầm kiếm cực dài giúp Ryoma đè bẹp đối thủ ở cấp 1-4. Căn rìa chiêu 2 để gây choáng rồi lao vào dồn sát thương.",
    "difficulty": "Khó",
    "isActive": true
  },
  {
    "id": "hero_zill",
    "name": "Zill",
    "title": "Ma Phong Cuồng Bạo",
    "role": "Sát thủ",
    "secondaryRoles": [
      "Pháp sư"
    ],
    "playstyles": [
      "Ám sát chủ lực",
      "Sát thương dồn",
      "Cơ động"
    ],
    "primaryLane": "Rừng",
    "secondaryLanes": [
      "Mid"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 10,
      "crowdControl": 5,
      "engage": 8,
      "peel": 2,
      "mobility": 9,
      "earlyGame": 8,
      "lateGame": 8
    },
    "signatureSkill": "Phong Ba Trảm Địch (Hóa thành bão tố chém liên tục 5 nhát không thể bị chọn làm mục tiêu)",
    "counters": [
      "Aleister",
      "Arum",
      "Thane"
    ],
    "synergies": [
      "Baldum",
      "Helen",
      "Krixi"
    ],
    "tags": [
      "Bất tử chiêu cuối",
      "Chém gió sốc dame",
      "Sát thủ phép biến ảo"
    ],
    "tacticalNotes": "Bật chiêu cuối hóa thành bão chém mục tiêu đơn độc, hoàn toàn không thể bị chọn làm mục tiêu trong 1.5 giây.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_airi",
    "name": "Airi",
    "title": "Ninja Rồng Thần",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Sát thương duy trì",
      "Cơ động",
      "Sát thương dồn",
      "Đẩy lẻ"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [
      "Rừng"
    ],
    "damageType": "Chuẩn",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 6,
      "damage": 10,
      "crowdControl": 7,
      "engage": 9,
      "peel": 4,
      "mobility": 10,
      "earlyGame": 5,
      "lateGame": 10
    },
    "signatureSkill": "Long Kiếm Sát Thương Chuẩn & Giới Hạn Sát Thương (Đòn đánh trúng gây sát thương chuẩn chí mạng và chặn sát thương nhận vào tối đa 8%)",
    "counters": [
      "Florentino",
      "Aleister",
      "Omen"
    ],
    "synergies": [
      "Helen",
      "Lumburr",
      "Tulen"
    ],
    "tags": [
      "Sát thương chuẩn chí mạng",
      "Lướt 3 lần",
      "Quái vật late game số 1"
    ],
    "tacticalNotes": "Late game khi đủ đồ Airi lướt chém sát thương chuẩn chí mạng quét sạch mọi tanker lẫn chủ lực trong vài giây.",
    "difficulty": "Khó",
    "isActive": true
  },
  {
    "id": "hero_ignis",
    "name": "Ignis",
    "title": "Bậc Thầy Lửa Thiêng",
    "role": "Pháp sư",
    "secondaryRoles": [],
    "playstyles": [
      "Sát thương duy trì",
      "Khống chế",
      "Cấu rỉa"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 5,
      "damage": 8,
      "crowdControl": 9,
      "engage": 7,
      "peel": 7,
      "mobility": 7,
      "earlyGame": 7,
      "lateGame": 9
    },
    "signatureSkill": "Hỏa Trận Sát Thương Chuẩn (Kích hoạt ấn hỏa liên tục làm choáng và gây sát thương chuẩn)",
    "counters": [
      "Kaine",
      "Nakroth",
      "Aoi"
    ],
    "synergies": [
      "Thane",
      "Baldum",
      "Hayate"
    ],
    "tags": [
      "Xả chiêu liên tục",
      "Khống chế liên hoàn",
      "Sát thương chuẩn diện rộng"
    ],
    "tacticalNotes": "Tích dấu ấn lửa để chiêu 1 được hồi lại gần như ngay lập tức, xả hỏa cầu liên tục khiến đối phương bị choáng liên hồi.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_murad",
    "name": "Murad",
    "title": "Lãng Khách Sa Mạc",
    "role": "Sát thủ",
    "secondaryRoles": [
      "Đấu sĩ"
    ],
    "playstyles": [
      "Ám sát chủ lực",
      "Sát thương dồn",
      "Cơ động"
    ],
    "primaryLane": "Rừng",
    "secondaryLanes": [
      "Caesar"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 3,
      "damage": 10,
      "crowdControl": 6,
      "engage": 8,
      "peel": 2,
      "mobility": 10,
      "earlyGame": 6,
      "lateGame": 10
    },
    "signatureSkill": "Ảo Ảnh Trảm Bất Tử (Chém 5 nhát bất tử không thể chọn làm mục tiêu rồi lướt về bóng)",
    "counters": [
      "Aleister",
      "Arum",
      "Elsu"
    ],
    "synergies": [
      "Helen",
      "Lumburr",
      "Baldum"
    ],
    "tags": [
      "Cấu rỉa không mất giọt máu",
      "Bất tử chiêu cuối",
      "Biến ảo tột cùng"
    ],
    "tacticalNotes": "Lướt 2 lần vào giao tranh, tung chiêu 2 hạ giáp và xả ảo ảnh trảm rồi giật về bóng ban đầu an toàn 100%.",
    "difficulty": "Rất khó",
    "isActive": true
  },
  {
    "id": "hero_superman",
    "name": "Superman",
    "title": "Siêu Nhân Krypton",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Đỡ đòn",
      "Trợ thủ"
    ],
    "playstyles": [
      "Khống chế",
      "Cơ động",
      "Khống chế",
      "Mở giao tranh"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [
      "Support"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 8,
      "damage": 8,
      "crowdControl": 10,
      "engage": 10,
      "peel": 7,
      "mobility": 10,
      "earlyGame": 9,
      "lateGame": 7
    },
    "signatureSkill": "Trạng Thái Bay Đẩy Lùi (Tích tốc độ bay ủi đối phương liên tục vào trụ hoặc đồng đội)",
    "counters": [
      "Aleister",
      "Arum",
      "Valhein",
      "Omen"
    ],
    "synergies": [
      "Tulen",
      "Natalya",
      "Krixi"
    ],
    "tags": [
      "Ủi đẩy lùi liên hoàn",
      "Đảo đường thần tốc",
      "Phá vỡ đội hình đối phương"
    ],
    "tacticalNotes": "Luôn giữ trạng thái phi hành để ủi đẩy lùi phá vỡ đội hình địch. Chiêu cuối giảm thời gian tích bay cho phép ủi liên tiếp.",
    "difficulty": "Khó",
    "isActive": true
  },
  {
    "id": "hero_wonder_woman",
    "name": "Wonder Woman",
    "title": "Chiến Binh Amazon",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Đỡ đòn"
    ],
    "playstyles": [
      "Chống chịu",
      "Khống chế",
      "Mở giao tranh",
      "Bảo kê"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [
      "Rừng",
      "Support"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 9,
      "damage": 8,
      "crowdControl": 9,
      "engage": 9,
      "peel": 8,
      "mobility": 7,
      "earlyGame": 9,
      "lateGame": 8
    },
    "signatureSkill": "Dây Thừng Sự Thật & Giáp Hộ Mệnh (Kéo đối thủ lại gần và đập vòng tay cấp lá chắn khủng cho toàn đội)",
    "counters": [
      "Hayate",
      "Lauriel",
      "Florentino"
    ],
    "synergies": [
      "Violet",
      "Tulen",
      "Helen"
    ],
    "tags": [
      "Kéo dây thừng chuẩn xác",
      "Cấp giáp cho toàn đội",
      "Đấu sĩ toàn năng"
    ],
    "tacticalNotes": "Vị tướng cực kỳ công thủ toàn diện. Chiêu cuối làm choáng diện rộng phía trước và tăng lượng giáp ảo cực lớn cho cả đội.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_maloch",
    "name": "Maloch",
    "title": "Chúa Tể Lãnh Địa",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Đỡ đòn"
    ],
    "playstyles": [
      "Sát thương duy trì",
      "Chống chịu",
      "Mở giao tranh"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [
      "Support",
      "Mid"
    ],
    "damageType": "Chuẩn",
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 9,
      "damage": 9,
      "crowdControl": 8,
      "engage": 10,
      "peel": 5,
      "mobility": 4,
      "earlyGame": 8,
      "lateGame": 9
    },
    "signatureSkill": "Luyện Ngục Sát Thương Chuẩn (Quỷ kiếm chém sát thương chuẩn và bay người dậm luyện ngục hất tung cả đội hình)",
    "counters": [
      "Hayate",
      "Florentino",
      "Lauriel"
    ],
    "synergies": [
      "Krixi",
      "Natalya",
      "Hayate"
    ],
    "tags": [
      "Sát thương chuẩn 100%",
      "Mở combat huỷ diệt",
      "Lá chắn hút linh hồn dày"
    ],
    "tacticalNotes": "Quỷ kiếm chém trúng tướng sẽ kích hoạt ma vương, toàn bộ sát thương sau đó biến thành sát thương chuẩn xuyên giáp.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_skud",
    "name": "Skud",
    "title": "Cỗ Máy Cuồng Nộ",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Đỡ đòn"
    ],
    "playstyles": [
      "Chống chịu",
      "Mở giao tranh",
      "Sát thương dồn"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [
      "Rừng",
      "Support"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 10,
      "damage": 8,
      "crowdControl": 8,
      "engage": 9,
      "peel": 5,
      "mobility": 7,
      "earlyGame": 7,
      "lateGame": 10
    },
    "signatureSkill": "Cú Đấm Ngàn Cân (Lượng máu tối đa khổng lồ chuyển hóa thành cú đấm sốc sát thương phép cực mạnh)",
    "counters": [
      "Hayate",
      "Lauriel",
      "Florentino"
    ],
    "synergies": [
      "Tulen",
      "Helen",
      "Krixi"
    ],
    "tags": [
      "Máu nhiều nhất game (20.000+ máu)",
      "Đấm một phát nửa cây",
      "Hất văng chia cắt giao tranh"
    ],
    "tacticalNotes": "Vị tướng sở hữu lượng máu cao nhất game. Càng lên đồ máu cú đấm nộ càng gây sát thương phép khủng khiếp.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_arthur",
    "name": "Arthur",
    "title": "Thanh Kiếm Chính Nghĩa",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Đỡ đòn"
    ],
    "playstyles": [
      "Chống chịu",
      "Sát thương duy trì",
      "Mở giao tranh"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [
      "Support"
    ],
    "damageType": "Hỗn hợp",
    "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 9,
      "damage": 7,
      "crowdControl": 7,
      "engage": 8,
      "peel": 6,
      "mobility": 6,
      "earlyGame": 8,
      "lateGame": 7
    },
    "signatureSkill": "Công Lý Phán Quyết (Bổ kiếm thần hất tung và bật kiếm hộ thể xoay quanh người)",
    "counters": [
      "Hayate",
      "Florentino",
      "Lauriel"
    ],
    "synergies": [
      "Aya",
      "Helen",
      "Violet"
    ],
    "tags": [
      "Tướng quốc dân dễ chơi",
      "Tự động hồi máu nội tại",
      "Càn lướt cày nát đội hình"
    ],
    "tacticalNotes": "Dễ chơi, dễ trúng thưởng, rất trâu bò nhờ nội tại hồi máu tự nhiên. Bổ chiêu cuối bắt chết chủ lực.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_taara",
    "name": "Taara",
    "title": "Búa Cuồng Nộ",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Đỡ đòn"
    ],
    "playstyles": [
      "Chống chịu",
      "Đẩy lẻ"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [
      "Support"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 10,
      "damage": 7,
      "crowdControl": 4,
      "engage": 7,
      "peel": 3,
      "mobility": 7,
      "earlyGame": 7,
      "lateGame": 9
    },
    "signatureSkill": "Thân Thể Thép (Bật chiêu cuối hồi máu liên tục 8% mỗi giây và tăng tốc chạy)",
    "counters": [
      "Hayate",
      "Lauriel",
      "Omen"
    ],
    "synergies": [
      "Aya",
      "Helen",
      "Tulen"
    ],
    "tags": [
      "Hồi máu vô địch",
      "Càng ít máu đập càng đau",
      "Đẩy lẻ bất tử"
    ],
    "tacticalNotes": "Càng mất máu công vật lý càng tăng cao. Chiêu cuối hồi phục thanh máu từ 10% lên đầy cây chỉ trong chớp mắt.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_arduin",
    "name": "Arduin",
    "title": "Hồn Tàn Giáp Sắt",
    "role": "Đỡ đòn",
    "secondaryRoles": [
      "Đấu sĩ",
      "Trợ thủ"
    ],
    "playstyles": [
      "Chống chịu",
      "Khống chế",
      "Mở giao tranh"
    ],
    "primaryLane": "Support",
    "secondaryLanes": [
      "Caesar"
    ],
    "damageType": "Hỗn hợp",
    "avatar": "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 9,
      "damage": 6,
      "crowdControl": 8,
      "engage": 9,
      "peel": 7,
      "mobility": 6,
      "earlyGame": 8,
      "lateGame": 7
    },
    "signatureSkill": "Câu Hồn Rìu Thần (Phóng rìu lao tới làm choáng và bổ rìu hất tung đối phương)",
    "counters": [
      "Hayate",
      "Lauriel",
      "Florentino"
    ],
    "synergies": [
      "Violet",
      "Krixi",
      "Natalya"
    ],
    "tags": [
      "Phóng rìu mở giao tranh",
      "Hút máu khi dưới 50%",
      "Đỡ đòn kiên cố"
    ],
    "tacticalNotes": "Khi máu dưới 50% nội tại kích hoạt giúp đòn đánh thường hồi máu cực nhanh. Chiêu cuối dùng để mở combat bất ngờ.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_lauriel",
    "name": "Lauriel",
    "title": "Đại Thiên Sứ",
    "role": "Pháp sư",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Sát thương duy trì",
      "Cơ động"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [],
    "damageType": "Chuẩn",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 7,
      "damage": 9,
      "crowdControl": 5,
      "engage": 7,
      "peel": 3,
      "mobility": 9,
      "earlyGame": 5,
      "lateGame": 10
    },
    "signatureSkill": "Đại Đao Pháp Trận (Đặt pháp trận giảm 90% hồi chiêu, lướt bất tử liên tục và nổ sát thương chuẩn)",
    "counters": [
      "Aleister",
      "Arum",
      "Omen",
      "Chaugnar"
    ],
    "synergies": [
      "Helen",
      "Thane",
      "Lumburr"
    ],
    "tags": [
      "Sát thương chuẩn liên hoàn",
      "Lướt né sát thương bất tử",
      "Bá chủ giao tranh dài hơi"
    ],
    "tacticalNotes": "Trong pháp trận chiêu 2 hồi chỉ còn 1 giây. Lướt múa né mọi chiêu thức đối thủ và nổ sát thương chuẩn hồi máu liên tục.",
    "difficulty": "Khó",
    "isActive": true
  },
  {
    "id": "hero_raz",
    "name": "Raz",
    "title": "Quyền Vương Thái Sơn",
    "role": "Pháp sư",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Sát thương dồn",
      "Khống chế",
      "Cơ động",
      "Cấu rỉa"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 10,
      "crowdControl": 9,
      "engage": 9,
      "peel": 5,
      "mobility": 9,
      "earlyGame": 8,
      "lateGame": 9
    },
    "signatureSkill": "Tả Hữu Xung Đột & Cú Đấm Thăng Long (Ném cầu lửa cấu rỉa và đẩy lùi liên hoàn kẻ địch vào trụ)",
    "counters": [
      "Chaugnar",
      "Kaine",
      "Aleister"
    ],
    "synergies": [
      "Thane",
      "Baldum",
      "Violet"
    ],
    "tags": [
      "Đẩy lùi liên hoàn",
      "Cầu lửa cấu rỉa cực thốn",
      "Pháp sư sốc dame tay ngắn"
    ],
    "tacticalNotes": "Combo cấu rỉa chiêu 2 giảm giáp phép, sau đó tốc biến đẩy lùi đối phương về hướng đồng đội hoặc trụ.",
    "difficulty": "Khó",
    "isActive": true
  },
  {
    "id": "hero_natalya",
    "name": "Natalya",
    "title": "Hiểm Họa Địa Ngục",
    "role": "Pháp sư",
    "secondaryRoles": [],
    "playstyles": [
      "Sát thương dồn",
      "Khống chế",
      "Cấu rỉa"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 10,
      "crowdControl": 7,
      "engage": 5,
      "peel": 5,
      "mobility": 4,
      "earlyGame": 10,
      "lateGame": 7
    },
    "signatureSkill": "Tia Sáng Tử Thần (Bắn laze khổng lồ tạo khiên miễn nhiễm khống chế thiêu rụi đối thủ)",
    "counters": [
      "Kaine",
      "Nakroth",
      "Aoi"
    ],
    "synergies": [
      "Grakk",
      "Thane",
      "Baldum"
    ],
    "tags": [
      "Sát thương sốc cấp 2 lớn nhất game",
      "Laze miễn khống",
      "Núp bụi bắt lẻ"
    ],
    "tacticalNotes": "Cấp 2 bắn trúng chiêu 1 và 2 là bốc hơi đối thủ ngay lập tức. Chiêu cuối tạo giáp miễn nhiễm mọi hiệu ứng khống chế.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_krixi",
    "name": "Krixi",
    "title": "Tinh Linh Bướm",
    "role": "Pháp sư",
    "secondaryRoles": [],
    "playstyles": [
      "Sát thương dồn",
      "Khống chế",
      "Cấu rỉa"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 3,
      "damage": 9,
      "crowdControl": 8,
      "engage": 6,
      "peel": 6,
      "mobility": 7,
      "earlyGame": 8,
      "lateGame": 9
    },
    "signatureSkill": "Bướm Ảo & Mưa Sao Băng (Hất tung diện rộng và triệu hồi bão sao băng rượt đuổi)",
    "counters": [
      "Kaine",
      "Ngộ Không",
      "Quillen"
    ],
    "synergies": [
      "Thane",
      "Lumburr",
      "Baldum"
    ],
    "tags": [
      "Pháp sư quốc dân",
      "Hất tung diện rộng",
      "Chiêu 1 cấu rỉa 2 lượt"
    ],
    "tacticalNotes": "Chiêu 1 bay đi và bay về gây 2 lần sát thương. Hất tung chiêu 2 chuẩn xác là kích hoạt chiêu cuối quét sạch giao tranh.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_veera",
    "name": "Veera",
    "title": "Nữ Hoàng Bóng Đêm",
    "role": "Pháp sư",
    "secondaryRoles": [],
    "playstyles": [
      "Sát thương dồn",
      "Khống chế",
      "Ám sát chủ lực"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 3,
      "damage": 10,
      "crowdControl": 9,
      "engage": 6,
      "peel": 5,
      "mobility": 6,
      "earlyGame": 8,
      "lateGame": 8
    },
    "signatureSkill": "Hôn Gió Khóa Chết & Tiểu Quỷ (Hôn gió định hướng làm choáng 1.5 giây và xả bầy dơi sốc chết)",
    "counters": [
      "Chaugnar",
      "Aleister",
      "Thane"
    ],
    "synergies": [
      "Kaine",
      "Ngộ Không",
      "Thane"
    ],
    "tags": [
      "Hôn gió khóa cứng",
      "Combo 2-3-1 bốc hơi",
      "Núp bụi sát thủ"
    ],
    "tacticalNotes": "Bà hoàng núp bụi. Hôn gió trúng là bất kỳ vị tướng máu giấy nào cũng phải nằm xuống trong 1 nốt nhạc.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_kahlii",
    "name": "Kahlii",
    "title": "Nữ Thần Báo Oán",
    "role": "Pháp sư",
    "secondaryRoles": [],
    "playstyles": [
      "Cấu rỉa",
      "Sát thương duy trì"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 3,
      "damage": 9,
      "crowdControl": 5,
      "engage": 4,
      "peel": 4,
      "mobility": 8,
      "earlyGame": 7,
      "lateGame": 9
    },
    "signatureSkill": "Quân Đoàn Ma Quái (Xả 55 đợt linh hồn tầm siêu xa thiêu rụi cả công trình)",
    "counters": [
      "Kaine",
      "Nakroth",
      "Aoi"
    ],
    "synergies": [
      "Baldum",
      "Thane",
      "Helen"
    ],
    "tags": [
      "Xả bão đạn ma thuật tầm xa",
      "Đánh thường xuyên mục tiêu",
      "Thủ trụ và ép trụ số 1"
    ],
    "tacticalNotes": "Bật chiêu cuối xả 55 đợt đạn ma pháp giải phóng đợt lính và đẩy lùi hoàn toàn ý định ép trụ của đối phương.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_aleister",
    "name": "Aleister",
    "title": "Ác Thần Xảo Quyệt",
    "role": "Pháp sư",
    "secondaryRoles": [
      "Trợ thủ"
    ],
    "playstyles": [
      "Khống chế",
      "Bảo kê",
      "Ám sát chủ lực"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [
      "Support"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 8,
      "crowdControl": 10,
      "engage": 7,
      "peel": 10,
      "mobility": 4,
      "earlyGame": 8,
      "lateGame": 8
    },
    "signatureSkill": "Nhà Tù Ma Thuật (Áp chế giữ cứng kẻ địch trong 2.5 giây không thể kháng)",
    "counters": [
      "Chaugnar",
      "Elsu",
      "Stuart"
    ],
    "synergies": [
      "Violet",
      "Tulen",
      "Valhein"
    ],
    "tags": [
      "Trói cứng áp chế tuyệt đối",
      "Khắc tinh mọi tướng bay nhảy",
      "Bảo kê chủ lực tuyệt đỉnh"
    ],
    "tacticalNotes": "Ác mộng của mọi sát thủ (Nakroth, Florentino, Aoi). Chỉ cần đứng cạnh xạ thủ và trói cứng bất kỳ ai dám lao vào.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_toro",
    "name": "Toro",
    "title": "Ngưu Ma Vương",
    "role": "Đỡ đòn",
    "secondaryRoles": [
      "Trợ thủ"
    ],
    "playstyles": [
      "Chống chịu",
      "Khống chế",
      "Mở giao tranh"
    ],
    "primaryLane": "Support",
    "secondaryLanes": [],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 10,
      "damage": 4,
      "crowdControl": 9,
      "engage": 9,
      "peel": 8,
      "mobility": 5,
      "earlyGame": 8,
      "lateGame": 9
    },
    "signatureSkill": "Đại Địa Chấn (Dậm đất 3 nhát liên tiếp miễn nhiễm mọi hiệu ứng khống chế)",
    "counters": [
      "Hayate",
      "Lauriel",
      "Florentino"
    ],
    "synergies": [
      "Krixi",
      "Yue",
      "Natalya"
    ],
    "tags": [
      "Miễn khống vĩnh viễn khi dùng chiêu",
      "Bao cát bất tử",
      "Dậm đất mở combat cực mạnh"
    ],
    "tacticalNotes": "Mỗi khi dùng chiêu thức Toro hoàn toàn miễn nhiễm mọi khống chế và giảm 20% sát thương nhận vào.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_mina",
    "name": "Mina",
    "title": "Nữ Thần Lưỡi Hái",
    "role": "Đỡ đòn",
    "secondaryRoles": [
      "Trợ thủ"
    ],
    "playstyles": [
      "Chống chịu",
      "Khống chế",
      "Mở giao tranh"
    ],
    "primaryLane": "Support",
    "secondaryLanes": [
      "Caesar"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 10,
      "damage": 6,
      "crowdControl": 10,
      "engage": 9,
      "peel": 9,
      "mobility": 6,
      "earlyGame": 9,
      "lateGame": 7
    },
    "signatureSkill": "Khiêu Khích Tử Thần (Buộc đối phương phải đánh thường vào Mina và xoay lưỡi hái hồi máu liên tục)",
    "counters": [
      "Hayate",
      "Lauriel",
      "Elsu"
    ],
    "synergies": [
      "Violet",
      "Tulen",
      "Valhein"
    ],
    "tags": [
      "Khiêu khích ép đánh thường",
      "Khắc chế tướng đánh tay",
      "Kéo gom kẻ địch lại"
    ],
    "tacticalNotes": "Cực mạnh khi đối đầu với các tướng đánh tay (Valhein, Omen, Kil'Groth). Càng bị đánh càng tích nội tại xoay lưỡi hái hồi máu.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_grakk",
    "name": "Grakk",
    "title": "Kẻ Nuốt Chửng",
    "role": "Trợ thủ",
    "secondaryRoles": [
      "Đỡ đòn"
    ],
    "playstyles": [
      "Khống chế",
      "Mở giao tranh",
      "Ám sát chủ lực"
    ],
    "primaryLane": "Support",
    "secondaryLanes": [
      "Mid"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 8,
      "damage": 6,
      "crowdControl": 10,
      "engage": 10,
      "peel": 7,
      "mobility": 4,
      "earlyGame": 9,
      "lateGame": 8
    },
    "signatureSkill": "Xích Ma Quái (Kéo đối phương từ khoảng cách cực xa về phía mình và hút nuốt)",
    "counters": [
      "Chaugnar",
      "Toro",
      "Maloch"
    ],
    "synergies": [
      "Natalya",
      "Yue",
      "Violet"
    ],
    "tags": [
      "Cú kéo định mệnh",
      "Hút nuốt cả đội hình",
      "Phá rừng cướp bùa"
    ],
    "tacticalNotes": "Vị tướng tạo áp lực tâm lý lớn nhất game. Một cú kéo chuẩn xác trúng xạ thủ hoặc pháp sư địch là định đoạt ván đấu.",
    "difficulty": "Khó",
    "isActive": true
  },
  {
    "id": "hero_chaugnar",
    "name": "Chaugnar",
    "title": "Sứ Giả Hư Vô",
    "role": "Trợ thủ",
    "secondaryRoles": [
      "Đỡ đòn",
      "Pháp sư"
    ],
    "playstyles": [
      "Bảo kê",
      "Đa dụng",
      "Chống chịu"
    ],
    "primaryLane": "Support",
    "secondaryLanes": [
      "Mid",
      "Caesar"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 9,
      "damage": 6,
      "crowdControl": 5,
      "engage": 7,
      "peel": 10,
      "mobility": 7,
      "earlyGame": 7,
      "lateGame": 9
    },
    "signatureSkill": "Hỗn Độn Khởi Nguyên (Hóa giải toàn bộ mọi hiệu ứng khống chế cho cả đội)",
    "counters": [
      "Hayate",
      "Lauriel",
      "Omen"
    ],
    "synergies": [
      "Capheny",
      "Yorn",
      "Tel'Annas"
    ],
    "tags": [
      "Giải khống chế toàn đội",
      "Khắc chế mọi đội hình khống chế cứng",
      "Càn quét giao tranh"
    ],
    "tacticalNotes": "Khắc tinh số 1 của các đội hình nhiều CC (Baldum, Grakk, Krizzix, Gildur). Bật chiêu cuối hóa giải khống chế cho toàn đội.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_lumburr",
    "name": "Lumburr",
    "title": "Khổng Lồ Nham Thạch",
    "role": "Trợ thủ",
    "secondaryRoles": [
      "Đỡ đòn"
    ],
    "playstyles": [
      "Chống chịu",
      "Mở giao tranh",
      "Bảo kê",
      "Khống chế"
    ],
    "primaryLane": "Support",
    "secondaryLanes": [],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 10,
      "damage": 5,
      "crowdControl": 10,
      "engage": 10,
      "peel": 9,
      "mobility": 6,
      "earlyGame": 8,
      "lateGame": 9
    },
    "signatureSkill": "Long Trời Lở Đất (Bổ rách mặt đất hất tung kẻ địch theo đường thẳng dài)",
    "counters": [
      "Chaugnar",
      "Hayate",
      "Lauriel"
    ],
    "synergies": [
      "Tulen",
      "Krixi",
      "Hayate"
    ],
    "tags": [
      "Tăng giáp khủng cho đồng minh",
      "Hất tung đường dài",
      "Mở giao tranh mẫu mực"
    ],
    "tacticalNotes": "Nội tại cộng lượng lớn giáp và kháng phép cho đồng đội máu thấp gần nhất. Chiêu cuối mở giao tranh góc hẹp cực mạnh.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_helen",
    "name": "Helen",
    "title": "Tiên Nữ Rừng Xanh",
    "role": "Trợ thủ",
    "secondaryRoles": [],
    "playstyles": [
      "Bảo kê",
      "Đa dụng"
    ],
    "primaryLane": "Support",
    "secondaryLanes": [],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 5,
      "damage": 3,
      "crowdControl": 6,
      "engage": 4,
      "peel": 10,
      "mobility": 6,
      "earlyGame": 8,
      "lateGame": 10
    },
    "signatureSkill": "Hào Quang Rừng Thần (Hồi máu liên tục cho toàn đội và tăng song giáp)",
    "counters": [
      "Hayate",
      "Kaine",
      "Aleister"
    ],
    "synergies": [
      "Capheny",
      "Valhein",
      "Taara"
    ],
    "tags": [
      "Bình máu di động",
      "Tăng giáp kháng phép cho đội",
      "Trợ thủ hồi máu số 1"
    ],
    "tacticalNotes": "Trợ thủ bảo bọc hoàn hảo nhất game. Bật chiêu cuối hồi máu liên tục và cấp lượng lớn song giáp cho mọi thành viên đứng cạnh.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_alice",
    "name": "Alice",
    "title": "Tiểu Thần Thiện Lương",
    "role": "Trợ thủ",
    "secondaryRoles": [
      "Pháp sư"
    ],
    "playstyles": [
      "Khống chế",
      "Bảo kê",
      "Đa dụng"
    ],
    "primaryLane": "Support",
    "secondaryLanes": [
      "Mid"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 7,
      "crowdControl": 9,
      "engage": 7,
      "peel": 9,
      "mobility": 8,
      "earlyGame": 6,
      "lateGame": 10
    },
    "signatureSkill": "Dòng Chảy Thời Gian (Tạo vùng đầm lầy làm chậm câm lặng và giảm giáp phép cực nặng)",
    "counters": [
      "Chaugnar",
      "Kaine",
      "Aoi"
    ],
    "synergies": [
      "Natalya",
      "Yue",
      "Tulen"
    ],
    "tags": [
      "Câm lặng và trừ giáp phép",
      "Cấp tốc độ chạy cho cả đội",
      "Quái vật late game"
    ],
    "tacticalNotes": "Về cuối trận vòng tròn chiêu cuối làm chậm và câm lặng liên tục khiến kẻ địch bước vào không thể tung chiêu thức.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_thane",
    "name": "Thane",
    "title": "Thanh Kiếm Hoàng Gia",
    "role": "Đỡ đòn",
    "secondaryRoles": [
      "Trợ thủ"
    ],
    "playstyles": [
      "Chống chịu",
      "Khống chế",
      "Bảo kê",
      "Mở giao tranh"
    ],
    "primaryLane": "Support",
    "secondaryLanes": [],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 10,
      "damage": 6,
      "crowdControl": 9,
      "engage": 9,
      "peel": 9,
      "mobility": 5,
      "earlyGame": 8,
      "lateGame": 9
    },
    "signatureSkill": "Gươm Thần Trảm & Đẩy Lùi (Ủi đối phương dồn lại một góc và trảm gươm thần sát thương chuẩn)",
    "counters": [
      "Hayate",
      "Lauriel",
      "Florentino"
    ],
    "synergies": [
      "Violet",
      "Tulen",
      "Valhein"
    ],
    "tags": [
      "Ủi đẩy lùi bảo kê cực đỉnh",
      "Hồi 24% máu nội tại",
      "Chém sát thương chuẩn kết liễu"
    ],
    "tacticalNotes": "Ủi chiêu 1 để hất văng mọi sát thủ ra xa khỏi xạ thủ. Gươm thần chiêu cuối gây sát thương chuẩn theo % máu đã mất.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_valhein",
    "name": "Valhein",
    "title": "Thợ Săn Ác Quỷ",
    "role": "Xạ thủ",
    "secondaryRoles": [
      "Pháp sư"
    ],
    "playstyles": [
      "Khống chế",
      "Sát thương dồn",
      "Sát thương duy trì",
      "Cơ động"
    ],
    "primaryLane": "AD",
    "secondaryLanes": [
      "Mid"
    ],
    "damageType": "Hỗn hợp",
    "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 9,
      "crowdControl": 9,
      "engage": 7,
      "peel": 5,
      "mobility": 8,
      "earlyGame": 10,
      "lateGame": 7
    },
    "signatureSkill": "Phi Tiêu Choáng & Bão Đạn Tầm Gần (Ném phi tiêu vàng làm choáng liên tục và áp sát bắn bão đạn)",
    "counters": [
      "Elsu",
      "Stuart",
      "Kaine"
    ],
    "synergies": [
      "Helen",
      "Thane",
      "Dyadia"
    ],
    "tags": [
      "Xạ thủ quốc dân",
      "Làm choáng liên hoàn",
      "Bá chủ đè đường cấp 1-4"
    ],
    "tacticalNotes": "Vua đè đường giai đoạn đầu trận. Tận dụng phi tiêu vàng làm choáng để cấu rỉa và bắn bão đạn ở cự ly gần.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_violet",
    "name": "Violet",
    "title": "Tay Súng Quả Cảm",
    "role": "Xạ thủ",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Sát thương dồn",
      "Cơ động",
      "Cấu rỉa"
    ],
    "primaryLane": "AD",
    "secondaryLanes": [
      "Rừng"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 3,
      "damage": 10,
      "crowdControl": 5,
      "engage": 6,
      "peel": 4,
      "mobility": 9,
      "earlyGame": 7,
      "lateGame": 10
    },
    "signatureSkill": "Đạn Xuyên Thấu Tầm Xa (Lộn bắn phát đạn cường hóa chí mạng tầm cực xa)",
    "counters": [
      "Kaine",
      "Ngộ Không",
      "Aoi"
    ],
    "synergies": [
      "Helen",
      "Thane",
      "Lumburr"
    ],
    "tags": [
      "Lộn bắn chí mạng một phát nửa cây",
      "Tầm bắn trụ an toàn",
      "Biểu tượng xạ thủ Liên Quân"
    ],
    "tacticalNotes": "Giữ vị trí lộn bắn cấu rỉa máu từ khoảng cách ngoài tầm với của đối phương. Rất mạnh về cuối trận khi đủ đồ chí mạng.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_yorn",
    "name": "Yorn",
    "title": "Mũi Tên Mặt Trời",
    "role": "Xạ thủ",
    "secondaryRoles": [],
    "playstyles": [
      "Sát thương duy trì",
      "Cấu rỉa",
      "Sát thương dồn"
    ],
    "primaryLane": "AD",
    "secondaryLanes": [],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 2,
      "damage": 10,
      "crowdControl": 4,
      "engage": 4,
      "peel": 2,
      "mobility": 3,
      "earlyGame": 5,
      "lateGame": 10
    },
    "signatureSkill": "Vô Tận Tên & Tên Thần (Bắn bão tiễn xuyên mục tiêu theo % máu tối đa và bắn tên toàn map)",
    "counters": [
      "Kaine",
      "Ngộ Không",
      "Nakroth",
      "Aoi"
    ],
    "synergies": [
      "Thane",
      "Helen",
      "Baldum",
      "Ming"
    ],
    "tags": [
      "DPS đứng yên bắn cháy máy",
      "Bắn theo % máu tối đa",
      "Xạ thủ late game hủy diệt"
    ],
    "tacticalNotes": "Cần sự bảo kê tuyệt đối của trợ thủ. Khi đủ 5-6 món trang bị, Yorn bắn bốc hơi bất kỳ tanker nào trong 2 giây.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_nakroth",
    "name": "Nakroth",
    "title": "Lưỡi Đao Phán Xét",
    "role": "Sát thủ",
    "secondaryRoles": [
      "Đấu sĩ"
    ],
    "playstyles": [
      "Cơ động",
      "Ám sát chủ lực",
      "Đẩy lẻ"
    ],
    "primaryLane": "Rừng",
    "secondaryLanes": [],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 9,
      "crowdControl": 7,
      "engage": 8,
      "peel": 2,
      "mobility": 10,
      "earlyGame": 9,
      "lateGame": 7
    },
    "signatureSkill": "Gươm Hành Quyết (Lướt 3 lần liên tục qua mọi địa hình và hất tung)",
    "counters": [
      "Aleister",
      "Arum",
      "Omen"
    ],
    "synergies": [
      "Tulen",
      "Krixi",
      "Helen"
    ],
    "tags": [
      "Biểu tượng sát thủ Liên Quân",
      "Độ cơ động đỉnh chóp",
      "Cướp rừng và đẩy lẻ trác tuyệt"
    ],
    "tacticalNotes": "Tận dụng 3 lần lướt để kiểm soát bản đồ, cướp bùa lợi của đối phương và bắt lẻ xạ thủ rồi thoát thân trong nháy mắt.",
    "difficulty": "Khó",
    "isActive": true
  },
  {
    "id": "hero_butterfly",
    "name": "Butterfly",
    "title": "Siêu Cấp Sát Thủ",
    "role": "Sát thủ",
    "secondaryRoles": [
      "Đấu sĩ"
    ],
    "playstyles": [
      "Sát thương dồn",
      "Ám sát chủ lực",
      "Cơ động"
    ],
    "primaryLane": "Rừng",
    "secondaryLanes": [],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 5,
      "damage": 10,
      "crowdControl": 5,
      "engage": 8,
      "peel": 2,
      "mobility": 8,
      "earlyGame": 8,
      "lateGame": 8
    },
    "signatureSkill": "Ám Sát & Làm Mới Toàn Bộ Chiêu (Nhảy vào ám sát và lập tức hồi chiêu khi hạ gục)",
    "counters": [
      "Aleister",
      "Arum",
      "Thane"
    ],
    "synergies": [
      "Helen",
      "Lumburr",
      "Tulen"
    ],
    "tags": [
      "Mega Kill liên hoàn",
      "Reset toàn bộ chiêu",
      "Sát thủ một thời huyền thoại"
    ],
    "tacticalNotes": "Chờ đối phương tiêu hao bớt máu và tung hết khống chế rồi lao vào chém kích hoạt chuỗi reset chiêu thức.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_wukong",
    "name": "Ngộ Không",
    "title": "Tề Thiên Đại Thánh",
    "role": "Sát thủ",
    "secondaryRoles": [
      "Đấu sĩ"
    ],
    "playstyles": [
      "Ám sát chủ lực",
      "Sát thương dồn",
      "Cơ động"
    ],
    "primaryLane": "Rừng",
    "secondaryLanes": [
      "Caesar"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 10,
      "crowdControl": 7,
      "engage": 8,
      "peel": 2,
      "mobility": 9,
      "earlyGame": 5,
      "lateGame": 10
    },
    "signatureSkill": "Cân Đẩu Vân Tàng Hình & Gậy Như Ý (Tàng hình áp sát gõ chí mạng bốc hơi mục tiêu trong 0.5 giây)",
    "counters": [
      "Max",
      "Elsu",
      "Aleister",
      "Arum"
    ],
    "synergies": [
      "Baldum",
      "Helen",
      "Thane"
    ],
    "tags": [
      "Tàng hình 2 lần",
      "Gõ 1 gậy bốc hơi",
      "Ác mộng của mọi xạ thủ pháp sư"
    ],
    "tacticalNotes": "Tàng hình áp sát, đập gậy chí mạng làm choáng và kết liễu chủ lực đối phương trong chưa đầy 1 giây.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_zhaoyun",
    "name": "Triệu Vân",
    "title": "Kỵ Sĩ Rồng Thần",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Sát thương dồn",
      "Chống chịu",
      "Sát thương duy trì"
    ],
    "primaryLane": "Rừng",
    "secondaryLanes": [
      "Caesar"
    ],
    "damageType": "Chuẩn",
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 7,
      "damage": 9,
      "crowdControl": 6,
      "engage": 8,
      "peel": 4,
      "mobility": 8,
      "earlyGame": 6,
      "lateGame": 10
    },
    "signatureSkill": "Long Kích Sát Thương Chuẩn & Lướt Sóng Mới (Bổ giáo sát thương chuẩn, giải khống chế và tăng tốc đánh)",
    "counters": [
      "Aleister",
      "Arum",
      "Hayate"
    ],
    "synergies": [
      "Helen",
      "Lumburr",
      "Tulen"
    ],
    "tags": [
      "Cơ chế lướt sóng mới remake",
      "Giải khống chế liên tục",
      "Sát thương chuẩn chí mạng"
    ],
    "tacticalNotes": "Bản làm lại mới bổ sung cơ chế lướt vượt địa hình. Chiêu cuối bổ sát thương chuẩn và giải sạch mọi khống chế.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_lubu",
    "name": "Lữ Bố",
    "title": "Vô Địch Chiến Thần",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Đỡ đòn"
    ],
    "playstyles": [
      "Sát thương duy trì",
      "Chống chịu",
      "Đẩy lẻ"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [
      "Rừng"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 8,
      "damage": 8,
      "crowdControl": 7,
      "engage": 8,
      "peel": 4,
      "mobility": 7,
      "earlyGame": 9,
      "lateGame": 7
    },
    "signatureSkill": "Chiến Thần Bất Tử (Bật chiêu cuối hút máu cực mạnh trên từng đòn đánh và kháng khống chế 20%)",
    "counters": [
      "Hayate",
      "Florentino",
      "Lauriel"
    ],
    "synergies": [
      "Helen",
      "Tulen",
      "Krixi"
    ],
    "tags": [
      "Hút máu hồi phục vô địch",
      "Không tốn mana",
      "Solo đường tà thần mạnh"
    ],
    "tacticalNotes": "Không dùng năng lượng, hồi chiêu nhanh. Bật chiêu cuối Chiến Thần lao vào chém tay đôi hút máu bất tử.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_diaochan",
    "name": "Điêu Thuyền",
    "title": "Tuyệt Sắc Giai Nhân",
    "role": "Pháp sư",
    "secondaryRoles": [
      "Trợ thủ"
    ],
    "playstyles": [
      "Khống chế",
      "Sát thương dồn",
      "Bảo kê"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [
      "Support"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 9,
      "crowdControl": 10,
      "engage": 7,
      "peel": 8,
      "mobility": 4,
      "earlyGame": 8,
      "lateGame": 8
    },
    "signatureSkill": "Độ Không Tuyệt Đối & Bão Tuyết (Đóng băng 2 lần liên tiếp và xả bão tuyết tạo giáp)",
    "counters": [
      "Chaugnar",
      "Kaine",
      "Aoi"
    ],
    "synergies": [
      "Grakk",
      "Thane",
      "Violet"
    ],
    "tags": [
      "Đóng băng 2.5 giây 2 lần",
      "Khiên chặn sát thương và khống chế",
      "Khống chế cứng diện rộng"
    ],
    "tacticalNotes": "Khiên nội tại giúp Điêu Thuyền chặn được 1 đòn sát thương kèm khống chế đầu tiên. Chiêu 2 đóng băng diện rộng tới 2 lần.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_azzenka",
    "name": "Azzen'Ka",
    "title": "U Hồn Sa Mạc",
    "role": "Pháp sư",
    "secondaryRoles": [
      "Trợ thủ"
    ],
    "playstyles": [
      "Khống chế",
      "Sát thương duy trì",
      "Cấu rỉa"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [
      "Support"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 8,
      "crowdControl": 10,
      "engage": 8,
      "peel": 8,
      "mobility": 4,
      "earlyGame": 7,
      "lateGame": 9
    },
    "signatureSkill": "Sa Mạc Hóa Thạch (Được làm lại bộ kỹ năng lướt và hóa đá kẻ địch liên tục)",
    "counters": [
      "Chaugnar",
      "Kaine",
      "Nakroth"
    ],
    "synergies": [
      "Thane",
      "Baldum",
      "Hayate"
    ],
    "tags": [
      "Làm lại kỹ năng (Remake)",
      "Hóa đá liên hoàn",
      "Vùng cát lún khống chế"
    ],
    "tacticalNotes": "Bản cập nhật làm lại giúp Azzen'Ka cơ động hơn và hóa đá đối phương cực kỳ khó chịu trong giao tranh địa hình hẹp.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_elsu",
    "name": "Elsu",
    "title": "Xạ Thủ Bắn Tỉa",
    "role": "Xạ thủ",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Cấu rỉa",
      "Sát thương dồn",
      "Đa dụng"
    ],
    "primaryLane": "AD",
    "secondaryLanes": [
      "Mid"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 10,
      "crowdControl": 5,
      "engage": 5,
      "peel": 5,
      "mobility": 7,
      "earlyGame": 9,
      "lateGame": 10
    },
    "signatureSkill": "Viễn Trình Kích & Ưng Trạm (Bắn tỉa tầm siêu xa xuyên giáp và đặt mắt soi sáng bản đồ)",
    "counters": [
      "Kaine",
      "Ngộ Không",
      "Aoi"
    ],
    "synergies": [
      "Helen",
      "Grakk",
      "Thane"
    ],
    "tags": [
      "Bắn tỉa xa nhất game",
      "Cung cấp tầm nhìn mắt soi",
      "Tàng hình bám tường"
    ],
    "tacticalNotes": "Cung cấp tầm nhìn vô giá cho toàn đội nhờ 3 con mắt. Viễn trình kích ngắm bắn tỉa nửa cây máu đối phương từ xa.",
    "difficulty": "Rất khó",
    "isActive": true
  },
  {
    "id": "hero_kriknak",
    "name": "Kriknak",
    "title": "Bọ Hung Tử Thần",
    "role": "Sát thủ",
    "secondaryRoles": [],
    "playstyles": [
      "Ám sát chủ lực",
      "Sát thương dồn",
      "Cơ động"
    ],
    "primaryLane": "Rừng",
    "secondaryLanes": [],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 10,
      "crowdControl": 5,
      "engage": 9,
      "peel": 2,
      "mobility": 9,
      "earlyGame": 10,
      "lateGame": 6
    },
    "signatureSkill": "Không Kích Bổ Nhào (Bay lên tăng tốc và đè bẹp đối phương sốc chết mục tiêu)",
    "counters": [
      "Aleister",
      "Arum",
      "Thane"
    ],
    "synergies": [
      "Baldum",
      "Helen",
      "Krixi"
    ],
    "tags": [
      "Tốc độ đập cánh siêu thanh",
      "Sát thương theo % máu",
      "Sát thủ sốc dame nhanh nhất game"
    ],
    "tacticalNotes": "Cấp 4 bật chiêu cuối bay tới bổ nhào kết hợp chiêu 1 và 2 là bốc hơi xạ thủ đối phương chỉ trong 0.3 giây.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_zephys",
    "name": "Zephys",
    "title": "Lãnh Chúa Tử Thần",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Chống chịu",
      "Sát thương dồn",
      "Cơ động"
    ],
    "primaryLane": "Rừng",
    "secondaryLanes": [
      "Caesar"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 8,
      "damage": 8,
      "crowdControl": 7,
      "engage": 9,
      "peel": 4,
      "mobility": 8,
      "earlyGame": 8,
      "lateGame": 8
    },
    "signatureSkill": "Không Kích Bổ Nhào & Bền Bỉ (Càng ít máu càng miễn thương lên đến 50%)",
    "counters": [
      "Hayate",
      "Lauriel",
      "Florentino"
    ],
    "synergies": [
      "Helen",
      "Tulen",
      "Krixi"
    ],
    "tags": [
      "Càng ít máu càng trâu",
      "Bổ nhào hất tung mở giao tranh",
      "Đấu sĩ đi rừng ổn định"
    ],
    "tacticalNotes": "Nhờ nội tại miễn sát thương khi thấp máu, Zephys có thể lật kèo ngoạn mục trong những pha solo tay đôi.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_slimz",
    "name": "Slimz",
    "title": "Thỏ Tài Phiệt",
    "role": "Xạ thủ",
    "secondaryRoles": [],
    "playstyles": [
      "Sát thương duy trì",
      "Khống chế",
      "Cơ động"
    ],
    "primaryLane": "AD",
    "secondaryLanes": [
      "Rừng"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 10,
      "crowdControl": 9,
      "engage": 8,
      "peel": 4,
      "mobility": 8,
      "earlyGame": 6,
      "lateGame": 10
    },
    "signatureSkill": "Lao Cơ Khí Bắt Choáng (Phóng lao tầm xa làm choáng tối đa 2.5 giây)",
    "counters": [
      "Kaine",
      "Ngộ Không",
      "Aoi"
    ],
    "synergies": [
      "Helen",
      "Thane",
      "Baldum"
    ],
    "tags": [
      "Lao choáng 2.5 giây",
      "Bắn theo % máu tối đa",
      "Xạ thủ gánh đội cuối trận"
    ],
    "tacticalNotes": "Càng phóng lao từ xa thời gian làm choáng càng dài (lên tới 2.5s). Bật chiêu cuối bắn xuyên theo % máu tối đa của tanker.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_fennik",
    "name": "Fennik",
    "title": "Cáo Siêu Thanh",
    "role": "Xạ thủ",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Sát thương dồn",
      "Cơ động",
      "Đẩy lẻ"
    ],
    "primaryLane": "Rừng",
    "secondaryLanes": [
      "AD"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 3,
      "damage": 10,
      "crowdControl": 6,
      "engage": 7,
      "peel": 4,
      "mobility": 9,
      "earlyGame": 9,
      "lateGame": 7
    },
    "signatureSkill": "Kíp Nổ Hủy Diệt & Lốc Sấm Sét (Đính kíp nổ tích 4 đòn đánh nổ tung và lăn vệt sấm sét bất tử)",
    "counters": [
      "Kaine",
      "Ngộ Không",
      "Aoi"
    ],
    "synergies": [
      "Baldum",
      "Helen",
      "Thane"
    ],
    "tags": [
      "Ăn Rồng/Caesar nhanh nhất",
      "Kíp nổ nổ trụ cực nhanh",
      "Lăn bất tử chiêu 2"
    ],
    "tacticalNotes": "Khả năng ăn mục tiêu lớn và bào trụ đầu game thuộc hàng số 1. Chiêu 2 lướt đi không thể bị chọn làm mục tiêu.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_mganga",
    "name": "Mganga",
    "title": "Tên Hề Ma Quái",
    "role": "Pháp sư",
    "secondaryRoles": [
      "Trợ thủ"
    ],
    "playstyles": [
      "Sát thương duy trì",
      "Cấu rỉa"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [
      "Support"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 6,
      "damage": 8,
      "crowdControl": 5,
      "engage": 5,
      "peel": 8,
      "mobility": 4,
      "earlyGame": 9,
      "lateGame": 8
    },
    "signatureSkill": "Độc Dược & Kích Nổ Độc (Tích 5 tầng độc rút máu đối phương và hồi máu cho toàn đội)",
    "counters": [
      "Hayate",
      "Lauriel",
      "Stuart"
    ],
    "synergies": [
      "Thane",
      "Helen",
      "Taara"
    ],
    "tags": [
      "Tích 5 dấu ấn độc",
      "Đè đường cấp 1 cực mạnh",
      "Vừa hồi máu vừa rút độc"
    ],
    "tacticalNotes": "Cấp 1 đánh tay tích độc là kẻ địch mất nửa cây máu. Tích đủ 5 tầng ấn trên cả đồng minh lẫn kẻ địch rồi kích nổ chiêu cuối.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_ormarr",
    "name": "Ormarr",
    "title": "Cuồng Chiến Binh",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Đỡ đòn",
      "Trợ thủ"
    ],
    "playstyles": [
      "Chống chịu",
      "Khống chế",
      "Mở giao tranh"
    ],
    "primaryLane": "Support",
    "secondaryLanes": [
      "Caesar"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 8,
      "damage": 7,
      "crowdControl": 9,
      "engage": 9,
      "peel": 7,
      "mobility": 6,
      "earlyGame": 9,
      "lateGame": 6
    },
    "signatureSkill": "Búa Tạ Choáng Ngẫu Nhiên (Mọi đòn đánh và kỹ năng đều có tỉ lệ gây choáng đối thủ)",
    "counters": [
      "Chaugnar",
      "Hayate",
      "Lauriel"
    ],
    "synergies": [
      "Violet",
      "Tulen",
      "Valhein"
    ],
    "tags": [
      "Đánh tay gây choáng",
      "Xoay rìu làm choáng liên tục",
      "Đấu sĩ trợ thủ càn lướt"
    ],
    "tacticalNotes": "Nội tại gây choáng ngẫu nhiên cực kỳ khó chịu. Lao vào xoay chiêu cuối giữa đội hình địch gây choáng liên tục.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_jinna",
    "name": "Jinna",
    "title": "Đại Sư Thiền Định",
    "role": "Pháp sư",
    "secondaryRoles": [],
    "playstyles": [
      "Mở giao tranh",
      "Sát thương dồn",
      "Chống chịu"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 7,
      "damage": 9,
      "crowdControl": 6,
      "engage": 9,
      "peel": 4,
      "mobility": 8,
      "earlyGame": 7,
      "lateGame": 8
    },
    "signatureSkill": "Kết Giới Hàng Ma (Tung chuỗi tràng hạt xung quanh, tăng tốc độ chạy và miễn thương cực lớn)",
    "counters": [
      "Hayate",
      "Aleister",
      "Lauriel"
    ],
    "synergies": [
      "Baldum",
      "Helen",
      "Thane"
    ],
    "tags": [
      "Lao vào giữa combat",
      "Miễn thương tăng theo số tướng địch",
      "Pháp sư cảm tử càn quét"
    ],
    "tacticalNotes": "Bật chiêu cuối tăng tốc chạy và lao thẳng vào giữa 5 người đối phương. Càng nhiều tướng địch xung quanh càng được miễn thương cao.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_ilumia",
    "name": "Ilumia",
    "title": "Nữ Thần Ánh Sáng",
    "role": "Pháp sư",
    "secondaryRoles": [
      "Trợ thủ"
    ],
    "playstyles": [
      "Khống chế",
      "Cấu rỉa",
      "Đa dụng"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [
      "Support"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 8,
      "crowdControl": 10,
      "engage": 8,
      "peel": 8,
      "mobility": 4,
      "earlyGame": 7,
      "lateGame": 9
    },
    "signatureSkill": "Thần Trận Toàn Bản Đồ (Giáng sấm sét hất tung toàn bộ 5 tướng địch trên toàn bản đồ)",
    "counters": [
      "Kaine",
      "Nakroth",
      "Aoi"
    ],
    "synergies": [
      "Thane",
      "Baldum",
      "Hayate"
    ],
    "tags": [
      "Chiêu cuối soi và hất tung toàn map",
      "Đẩy lùi sát thủ áp sát",
      "Khống chế diện rộng"
    ],
    "tacticalNotes": "Chiêu cuối giáng sét vào vị trí của cả 5 tướng địch dù ở bất cứ đâu trên bản đồ, soi sáng tầm nhìn và mở combat từ xa.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_preyta",
    "name": "Preyta",
    "title": "Kỵ Sĩ Dịch Bệnh",
    "role": "Pháp sư",
    "secondaryRoles": [],
    "playstyles": [
      "Cấu rỉa",
      "Sát thương duy trì",
      "Khống chế"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 9,
      "crowdControl": 7,
      "engage": 6,
      "peel": 5,
      "mobility": 7,
      "earlyGame": 7,
      "lateGame": 9
    },
    "signatureSkill": "Dịch Bệnh Cường Hóa (Cưỡi rồng tăng tầm đánh, bắn tia phép xuyên thấu và phun bão độc)",
    "counters": [
      "Kaine",
      "Nakroth",
      "Aoi"
    ],
    "synergies": [
      "Thane",
      "Baldum",
      "Lumburr"
    ],
    "tags": [
      "Phun độc một phát sạch lính",
      "Cường hóa đòn đánh thường thành phép",
      "Tốc độ chạy cao"
    ],
    "tacticalNotes": "Vận chiêu 1 tối đa để quét sạch toàn bộ đợt lính chỉ trong 1 chiêu. Bật chiêu cuối để bắn đòn đánh thường sát thương phép lan rộng.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_cresht",
    "name": "Cresht",
    "title": "Thủy Thần Chiến Binh",
    "role": "Đỡ đòn",
    "secondaryRoles": [
      "Trợ thủ"
    ],
    "playstyles": [
      "Chống chịu",
      "Mở giao tranh",
      "Khống chế"
    ],
    "primaryLane": "Support",
    "secondaryLanes": [
      "Caesar"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 10,
      "damage": 5,
      "crowdControl": 9,
      "engage": 10,
      "peel": 8,
      "mobility": 6,
      "earlyGame": 7,
      "lateGame": 9
    },
    "signatureSkill": "Thủy Thần Biến Thân (Tích đầy nộ hóa thành khổng lồ tạo lớp giáp bằng 50% máu và đẩy lùi)",
    "counters": [
      "Hayate",
      "Lauriel",
      "Florentino"
    ],
    "synergies": [
      "Violet",
      "Tulen",
      "Krixi"
    ],
    "tags": [
      "Lá chắn dày nhất game",
      "Hóa khổng lồ đẩy văng đối thủ",
      "Băng trụ mở combat hoàn hảo"
    ],
    "tacticalNotes": "Tích đầy nộ trước giao tranh, bật chiêu cuối hóa khổng lồ đẩy văng đối phương sang 2 bên và nhận lớp giáp ảo bằng nửa cây máu.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_zuka",
    "name": "Zuka",
    "title": "Đại Sư Gấu Trúc",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Sát thương dồn",
      "Cơ động",
      "Ám sát chủ lực"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [
      "Rừng"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 5,
      "damage": 10,
      "crowdControl": 7,
      "engage": 9,
      "peel": 3,
      "mobility": 10,
      "earlyGame": 8,
      "lateGame": 9
    },
    "signatureSkill": "Trầm Trọng Lực (Nhảy lên không trung dậm gậy hất tung và gõ nổ sát thương cực lớn)",
    "counters": [
      "Omen",
      "Aleister",
      "Arum",
      "Florentino"
    ],
    "synergies": [
      "Tulen",
      "Helen",
      "Krixi"
    ],
    "tags": [
      "Lướt 4 lần liên tiếp",
      "Nhảy gõ sốc bốc hơi",
      "Sát thủ núp bụi đường trên"
    ],
    "tacticalNotes": "Đại sư cơ động với 4 lần lướt. Nhảy chiêu cuối dậm vào đầu chủ lực đối phương rồi gõ bồi thêm các đòn đánh nộ.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_celica",
    "name": "Celica",
    "title": "Thiết Pháo Tiểu Thư",
    "role": "Xạ thủ",
    "secondaryRoles": [],
    "playstyles": [
      "Sát thương duy trì",
      "Cấu rỉa",
      "Sát thương dồn"
    ],
    "primaryLane": "AD",
    "secondaryLanes": [],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 10,
      "crowdControl": 5,
      "engage": 6,
      "peel": 4,
      "mobility": 5,
      "earlyGame": 6,
      "lateGame": 10
    },
    "signatureSkill": "Pháo Đài Công Kích (Đóng pháo đài tăng 100% tầm bắn và dội 7 phát pháo đại bác chí mạng)",
    "counters": [
      "Kaine",
      "Ngộ Không",
      "Aoi"
    ],
    "synergies": [
      "Helen",
      "Thane",
      "Baldum"
    ],
    "tags": [
      "Pháo đài tầm bắn bao trọn nửa màn hình",
      "Bắn nổ chí mạng 7 phát",
      "Bậc thầy công và thủ thành"
    ],
    "tacticalNotes": "Đóng pháo đài tại các vị trí hiểm hóc có đồng đội bảo kê để dội pháo đại bác chí mạng tiêu diệt toàn bộ đội hình đối phương.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_elandorr",
    "name": "Eland'orr",
    "title": "Du Hiệp Tinh Linh",
    "role": "Xạ thủ",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Cơ động",
      "Sát thương duy trì",
      "Sát thương dồn"
    ],
    "primaryLane": "Rừng",
    "secondaryLanes": [
      "AD"
    ],
    "damageType": "Hỗn hợp",
    "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 3,
      "damage": 10,
      "crowdControl": 6,
      "engage": 7,
      "peel": 3,
      "mobility": 10,
      "earlyGame": 9,
      "lateGame": 8
    },
    "signatureSkill": "Điệp Vũ Biến Ảo (Thả bướm và dịch chuyển tới vị trí cánh bướm liên tục)",
    "counters": [
      "Aleister",
      "Arum",
      "Elsu"
    ],
    "synergies": [
      "Rouie",
      "Helen",
      "Thane"
    ],
    "tags": [
      "Xạ thủ biến ảo nhất game",
      "Dịch chuyển bướm liên tục",
      "Đè đường thả diều tột đỉnh"
    ],
    "tacticalNotes": "Mỗi chiêu thức thả ra 1 con bướm và có thể kích hoạt lần 2 để đổi vị trí, khiến đối phương hoàn toàn bị chóng mặt.",
    "difficulty": "Rất khó",
    "isActive": true
  },
  {
    "id": "hero_lorion",
    "name": "Lorion",
    "title": "Hắc Ma Cầu",
    "role": "Pháp sư",
    "secondaryRoles": [],
    "playstyles": [
      "Khống chế",
      "Sát thương dồn",
      "Mở giao tranh"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 6,
      "damage": 9,
      "crowdControl": 10,
      "engage": 10,
      "peel": 6,
      "mobility": 8,
      "earlyGame": 7,
      "lateGame": 9
    },
    "signatureSkill": "Hắc Cầu Tẩy Não (Tung cầu lôi điện bay lơ lửng và nhấc bổng toàn bộ kẻ địch lên không trung)",
    "counters": [
      "Chaugnar",
      "Kaine",
      "Nakroth"
    ],
    "synergies": [
      "Hayate",
      "Violet",
      "Thane"
    ],
    "tags": [
      "Nhấc bổng kẻ địch lên không",
      "Dịch chuyển theo quả cầu",
      "Wombo combo kiểm soát giao tranh"
    ],
    "tacticalNotes": "Phóng hắc cầu vào lòng đối phương rồi kích hoạt chiêu cuối để nhấc bổng toàn bộ mục tiêu trong 1.5 giây.",
    "difficulty": "Khó",
    "isActive": true
  },
  {
    "id": "hero_zata",
    "name": "Zata",
    "title": "Đôi Cánh Tà Khí",
    "role": "Pháp sư",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Ám sát chủ lực",
      "Sát thương dồn",
      "Cơ động"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 10,
      "crowdControl": 5,
      "engage": 9,
      "peel": 2,
      "mobility": 10,
      "earlyGame": 9,
      "lateGame": 8
    },
    "signatureSkill": "Thiên Dực Bất Tử (Lướt 3-5 lần quẹt chiêu kích hoạt bay lên trời không thể bị chọn làm mục tiêu)",
    "counters": [
      "Aleister",
      "Arum",
      "Chaugnar"
    ],
    "synergies": [
      "Baldum",
      "Helen",
      "Thane"
    ],
    "tags": [
      "Bay lên trời bất tử",
      "Xả bão lông vũ phép",
      "Sát thủ đường giữa một thời"
    ],
    "tacticalNotes": "Quẹt chiêu 1 và 2 để lướt chiêu cuối tích lũy số lần bay. Khi cất cánh Zata hoàn toàn bất tử và xả bão lông vũ.",
    "difficulty": "Rất khó",
    "isActive": true
  },
  {
    "id": "hero_qi",
    "name": "Qi",
    "title": "Võ Sư Bánh Bao",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Sát thương dồn",
      "Khống chế",
      "Đẩy lẻ"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [
      "Rừng"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 7,
      "damage": 9,
      "crowdControl": 9,
      "engage": 9,
      "peel": 4,
      "mobility": 8,
      "earlyGame": 9,
      "lateGame": 7
    },
    "signatureSkill": "Hạo Nhiên Chưởng (Đẩy đối thủ đập vào tường làm choáng và mở khóa cú lướt đấm nộ)",
    "counters": [
      "Florentino",
      "Hayate",
      "Aleister"
    ],
    "synergies": [
      "Tulen",
      "Helen",
      "Krixi"
    ],
    "tags": [
      "Đẩy đập tường làm choáng",
      "Giảm giáp đối thủ",
      "Hồi phục máu mỗi đòn đánh"
    ],
    "tacticalNotes": "Tận dụng địa hình góc tường để tung chiêu cuối đẩy đối thủ đập vào tường, gây choáng cực lâu và mở khóa chiêu lướt đấm bốc hơi.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_liliana",
    "name": "Liliana",
    "title": "Cửu Vĩ Yêu Hồ",
    "role": "Pháp sư",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Cấu rỉa",
      "Sát thương dồn",
      "Cơ động",
      "Ám sát chủ lực"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [
      "Rừng"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 10,
      "crowdControl": 7,
      "engage": 8,
      "peel": 4,
      "mobility": 10,
      "earlyGame": 7,
      "lateGame": 10
    },
    "signatureSkill": "Biến Hình Cửu Vĩ Hồ & Đạn Linh Lực (Hoán đổi dạng người và cáo, tích tụ quả cầu linh lực khổng lồ)",
    "counters": [
      "Aleister",
      "Arum",
      "Kaine"
    ],
    "synergies": [
      "Thane",
      "Baldum",
      "Helen"
    ],
    "tags": [
      "Nữ hoàng đường giữa",
      "6 chiêu thức biến ảo",
      "Cấu rỉa và sốc dame hoàn hảo"
    ],
    "tacticalNotes": "Biểu tượng pháp sư đường giữa toàn năng nhất lịch sử Liên Quân. Dạng người cấu rỉa tầm xa cực đau, dạng cáo lướt cào sốc chết chủ lực trong chớp mắt.",
    "difficulty": "Khó",
    "isActive": true
  },
  {
    "id": "hero_gildur",
    "name": "Gildur",
    "title": "Vua Hoàng Kim",
    "role": "Pháp sư",
    "secondaryRoles": [
      "Đỡ đòn",
      "Trợ thủ"
    ],
    "playstyles": [
      "Khống chế",
      "Cấu rỉa",
      "Chống chịu",
      "Mở giao tranh"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [
      "Support",
      "Caesar"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 8,
      "damage": 8,
      "crowdControl": 10,
      "engage": 8,
      "peel": 8,
      "mobility": 6,
      "earlyGame": 7,
      "lateGame": 9
    },
    "signatureSkill": "Vương Triều Vàng Ròng (Bắn vàng làm choáng từ xa và dựng nhà tù hoàng kim làm choáng liên tục 3.5 giây)",
    "counters": [
      "Chaugnar",
      "Kaine",
      "Aleister"
    ],
    "synergies": [
      "Elsu",
      "Yue",
      "Violet"
    ],
    "tags": [
      "Vua vàng ròng",
      "Làm choáng tầm xa",
      "Nhà tù khống chế 3.5 giây"
    ],
    "tacticalNotes": "Vụ Nổ Vàng tầm xa làm choáng và cấu rỉa cực thốn. Chiêu cuối áp sát giữ chân cả đội hình đối phương.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_wiro",
    "name": "Wiro",
    "title": "Chiến Binh 212",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Đỡ đòn"
    ],
    "playstyles": [
      "Chống chịu",
      "Khống chế",
      "Mở giao tranh"
    ],
    "primaryLane": "Support",
    "secondaryLanes": [
      "Caesar"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 9,
      "damage": 7,
      "crowdControl": 9,
      "engage": 9,
      "peel": 7,
      "mobility": 5,
      "earlyGame": 8,
      "lateGame": 8
    },
    "signatureSkill": "Thần Lực 212 (Hồi sinh tại chỗ và gồng búa nện xuống hất tung toàn bộ giao tranh)",
    "counters": [
      "Hayate",
      "Lauriel",
      "Florentino"
    ],
    "synergies": [
      "Krixi",
      "Natalya",
      "Hayate"
    ],
    "tags": [
      "Nội tại hồi sinh đồng minh dẫm",
      "Hất tung diện rộng",
      "Đấu sĩ trâu bò"
    ],
    "tacticalNotes": "Khi cạn máu bước vào trạng thái hồi sinh, đồng đội giẫm lên 3 dấu ấn sẽ lập tức hồi đầy máu cho Wiro.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_evita",
    "name": "Evita",
    "title": "Phù Thủy Hỗn Mang",
    "role": "Pháp sư",
    "secondaryRoles": [
      "Đấu sĩ"
    ],
    "playstyles": [
      "Cấu rỉa",
      "Khống chế",
      "Sát thương duy trì"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [
      "Caesar"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 5,
      "damage": 9,
      "crowdControl": 8,
      "engage": 6,
      "peel": 6,
      "mobility": 7,
      "earlyGame": 7,
      "lateGame": 9
    },
    "signatureSkill": "Triệu Hồi Ma Vật Hỗn Mang (Tạo vùng cấm địa gây sát thương diện rộng và làm chậm)",
    "counters": [
      "Veera",
      "Natalya",
      "Kahlii",
      "Valhein"
    ],
    "synergies": [
      "Maloch",
      "Grakk",
      "Toro",
      "Dolia"
    ],
    "tags": [
      "Tướng thứ 130",
      "Pháp sư meta 2026",
      "Cấu rỉa diện rộng"
    ],
    "tacticalNotes": "Vị tướng thứ 130 của Liên Quân Mobile ra mắt tháng 10/2026. Sở hữu nội tại Ma lực hắc ám cực mạnh trong giao tranh tổng và ép góc đường giữa.",
    "difficulty": "Khó",
    "isActive": true
  },
  {
    "id": "hero_tamyn",
    "name": "Tamyn",
    "title": "Chiến Thần Quang Minh",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Sát thương dồn",
      "Cơ động",
      "Đẩy lẻ"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [
      "Rừng"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 7,
      "damage": 9,
      "crowdControl": 6,
      "engage": 8,
      "peel": 5,
      "mobility": 9,
      "earlyGame": 8,
      "lateGame": 8
    },
    "signatureSkill": "Phi Đoản Thương Tái Hồi (Ném đoản thương gây sát thương kép và lướt tiếp cận áp sát)",
    "counters": [
      "Omen",
      "Florentino",
      "Yena"
    ],
    "synergies": [
      "Dyadia",
      "Dolia",
      "Kaine"
    ],
    "tags": [
      "Tướng mới 2026",
      "Cơ động cao",
      "Solo Tà Thần Caesar"
    ],
    "tacticalNotes": "Đấu sĩ solo đường Caesar cực mạnh với cơ chế ném và thu hồi đoản thương, dễ dàng bắt bài đối thủ và đảo đường gank.",
    "difficulty": "Khó",
    "isActive": true
  },
  {
    "id": "hero_flowborn",
    "name": "Flowborn",
    "title": "Tinh Linh Thủy Lưu",
    "role": "Xạ thủ",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Sát thương duy trì",
      "Cơ động",
      "Cấu rỉa"
    ],
    "primaryLane": "AD",
    "secondaryLanes": [
      "Mid"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1563089145-599997674d42?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 10,
      "crowdControl": 5,
      "engage": 5,
      "peel": 6,
      "mobility": 8,
      "earlyGame": 7,
      "lateGame": 10
    },
    "signatureSkill": "Thủy Lưu Xuyên Phá (Đạn nước tầm xa dồn sát thương xuyên giáp liên tục)",
    "counters": [
      "Valhein",
      "Violet",
      "Tel'Annas"
    ],
    "synergies": [
      "Helen",
      "Teeri",
      "Dolia",
      "Aya"
    ],
    "tags": [
      "Xạ thủ meta 2026",
      "DPS cao",
      "Thủy lưu"
    ],
    "tacticalNotes": "Xạ thủ công kích tầm xa siêu mạnh cuối trận. Tận dụng lướt nước né kỹ năng khống chế của sát thủ đối phương.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_edras",
    "name": "Edras",
    "title": "Hiền Triết Khởi Nguyên",
    "role": "Pháp sư",
    "secondaryRoles": [
      "Trợ thủ"
    ],
    "playstyles": [
      "Cấu rỉa",
      "Khống chế",
      "Đa dụng"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [
      "Support"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 5,
      "damage": 8,
      "crowdControl": 9,
      "engage": 7,
      "peel": 8,
      "mobility": 6,
      "earlyGame": 6,
      "lateGame": 9
    },
    "signatureSkill": "Trận Đồ Thái Cổ (Khóa diện rộng và câm lặng nhiều kẻ địch cùng lúc)",
    "counters": [
      "Lauriel",
      "Raz",
      "Tulen"
    ],
    "synergies": [
      "Maloch",
      "Hayate",
      "Elsu"
    ],
    "tags": [
      "Cổ thuật Athanor",
      "Khống chế cứng",
      "Giao tranh tổng"
    ],
    "tacticalNotes": "Người sáng lập Tháp Quang Minh, sở hữu khả năng kiểm soát giao tranh cực mạnh và cản bước tiến các sát thủ băng vào.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_goverra",
    "name": "Goverra",
    "title": "Nữ Hoàng Tro Tàn",
    "role": "Pháp sư",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Sát thương dồn",
      "Cơ động",
      "Ám sát chủ lực"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [
      "Rừng"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 4,
      "damage": 10,
      "crowdControl": 6,
      "engage": 7,
      "peel": 4,
      "mobility": 8,
      "earlyGame": 8,
      "lateGame": 9
    },
    "signatureSkill": "Lửa Tro Tàn (Thiêu đốt mục tiêu và kích nổ dồn dame phép diện rộng)",
    "counters": [
      "Veera",
      "Krixi",
      "Yorn"
    ],
    "synergies": [
      "Nakroth",
      "Quillen",
      "Grakk"
    ],
    "tags": [
      "Phép dồn dame",
      "Sát thủ phép",
      "Meta 2026"
    ],
    "tacticalNotes": "Pháp sư sát thủ có khả năng sốc chết xạ thủ đối phương trong nửa giây bằng chuỗi chiêu hỏa thiêu liên hoàn.",
    "difficulty": "Khó",
    "isActive": true
  },
  {
    "id": "hero_heino",
    "name": "Heino",
    "title": "Định Mệnh Thời Không",
    "role": "Pháp sư",
    "secondaryRoles": [
      "Đấu sĩ"
    ],
    "playstyles": [
      "Cấu rỉa",
      "Sát thương duy trì",
      "Đa dụng"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [
      "Caesar"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 6,
      "damage": 9,
      "crowdControl": 6,
      "engage": 7,
      "peel": 6,
      "mobility": 7,
      "earlyGame": 7,
      "lateGame": 10
    },
    "signatureSkill": "Đảo Ngược Thời Gian (Hồi sinh vùng máu và quay ngược vị trí giao tranh)",
    "counters": [
      "Natalya",
      "Aleister",
      "Florentino"
    ],
    "synergies": [
      "Dolia",
      "Dyadia",
      "Arthur"
    ],
    "tags": [
      "Quay ngược thời gian",
      "Định mệnh",
      "Cặp đôi Dolia"
    ],
    "tacticalNotes": "Tướng chuyển giao mang cơ chế hồi máu và quay ngược thời không độc nhất, cực kỳ khó bị hạ gục.",
    "difficulty": "Khó",
    "isActive": true
  },
  {
    "id": "hero_billow",
    "name": "Billow",
    "title": "Kình Ngư Biển Sâu",
    "role": "Sát thủ",
    "secondaryRoles": [
      "Đấu sĩ"
    ],
    "playstyles": [
      "Sát thương dồn",
      "Cơ động",
      "Ám sát chủ lực"
    ],
    "primaryLane": "Rừng",
    "secondaryLanes": [
      "Caesar"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 5,
      "damage": 10,
      "crowdControl": 6,
      "engage": 8,
      "peel": 4,
      "mobility": 9,
      "earlyGame": 8,
      "lateGame": 8
    },
    "signatureSkill": "Sóng Thần Đột Kích (Lặn sâu và bộc phá nuốt trọn mục tiêu ít máu)",
    "counters": [
      "Tel'Annas",
      "Capheny",
      "Yorn"
    ],
    "synergies": [
      "Dolia",
      "Dyadia",
      "Krizzix"
    ],
    "tags": [
      "Sát thủ thủy tộc",
      "Lặn biển",
      "Sốc dame chủ lực"
    ],
    "tacticalNotes": "Sát thủ đi rừng độc đáo với khả năng lặn dưới lòng đất/nước tiếp cận không bị phát hiện và sốc dame dứt điểm.",
    "difficulty": "Khó",
    "isActive": true
  },
  {
    "id": "hero_bolt_baron",
    "name": "Bolt Baron",
    "title": "Bá Chủ Thiên Lôi",
    "role": "Đấu sĩ",
    "secondaryRoles": [
      "Đỡ đòn"
    ],
    "playstyles": [
      "Chống chịu",
      "Mở giao tranh",
      "Khống chế"
    ],
    "primaryLane": "Caesar",
    "secondaryLanes": [
      "Support"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 9,
      "damage": 7,
      "crowdControl": 8,
      "engage": 9,
      "peel": 7,
      "mobility": 6,
      "earlyGame": 7,
      "lateGame": 8
    },
    "signatureSkill": "Sấm Sét Hủy Diệt (Phóng tia sét liên hoàn gây choáng diện rộng và hút sát thương)",
    "counters": [
      "Maloch",
      "Arthur",
      "Taara"
    ],
    "synergies": [
      "Hayate",
      "Laville",
      "Tulen"
    ],
    "tags": [
      "Thiên lôi",
      "Mở combat mạnh",
      "Đường Tà Thần"
    ],
    "tacticalNotes": "Đấu sĩ tiên phong mở giao tranh xuất sắc với lượng giáp sấm sét khổng lồ cản phá hàng thủ đối phương.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_ybneth",
    "name": "Y'bneth",
    "title": "Đại Thụ Cổ Đại",
    "role": "Đỡ đòn",
    "secondaryRoles": [
      "Đấu sĩ"
    ],
    "playstyles": [
      "Chống chịu",
      "Mở giao tranh",
      "Khống chế",
      "Bảo kê"
    ],
    "primaryLane": "Support",
    "secondaryLanes": [
      "Caesar"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 10,
      "damage": 5,
      "crowdControl": 9,
      "engage": 8,
      "peel": 9,
      "mobility": 4,
      "earlyGame": 8,
      "lateGame": 8
    },
    "signatureSkill": "Cây Bách Vạn Năm (Hóa đại thụ xả hạt súng liên hoàn vừa hồi máu vừa gây choáng)",
    "counters": [
      "Arum",
      "Grakk",
      "Arthur"
    ],
    "synergies": [
      "Hayate",
      "Capheny",
      "Elsu"
    ],
    "tags": [
      "Hồi phục bụi cỏ",
      "Mở combat",
      "Chống chịu trâu bò"
    ],
    "tacticalNotes": "Tận dụng nội tại đứng trong bụi cỏ hồi phục lượng máu cực lớn để trao đổi chiêu thức thắng mọi kèo đầu trận.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_the_flash",
    "name": "The Flash",
    "title": "Tia Chớp Nhanh Nhất Thế Giới",
    "role": "Pháp sư",
    "secondaryRoles": [
      "Sát thủ"
    ],
    "playstyles": [
      "Sát thương dồn",
      "Cơ động",
      "Mở giao tranh"
    ],
    "primaryLane": "Mid",
    "secondaryLanes": [
      "Rừng"
    ],
    "damageType": "Phép",
    "avatar": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 5,
      "damage": 9,
      "crowdControl": 7,
      "engage": 9,
      "peel": 4,
      "mobility": 10,
      "earlyGame": 7,
      "lateGame": 8
    },
    "signatureSkill": "Lốc Xoáy Tia Chớp (Hóa vô địch hút toàn bộ kẻ địch xung quanh vào tâm bão)",
    "counters": [
      "Tel'Annas",
      "Yorn",
      "Veera"
    ],
    "synergies": [
      "Maloch",
      "Hayate",
      "Slimz"
    ],
    "tags": [
      "Tốc độ siêu phàm",
      "Vô địch lướt",
      "Đảo gank tốc độ"
    ],
    "tacticalNotes": "Tận dụng Hành Trình Siêu Tốc lao vào cấu rỉa rồi kích hoạt Lốc Xoáy vô địch né sát thương rút về an toàn.",
    "difficulty": "Trung bình",
    "isActive": true
  },
  {
    "id": "hero_omega",
    "name": "Omega",
    "title": "Cỗ Máy Chiến Tranh",
    "role": "Đỡ đòn",
    "secondaryRoles": [
      "Trợ thủ"
    ],
    "playstyles": [
      "Chống chịu",
      "Khống chế",
      "Bảo kê",
      "Mở giao tranh"
    ],
    "primaryLane": "Support",
    "secondaryLanes": [
      "Caesar"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 9,
      "damage": 5,
      "crowdControl": 9,
      "engage": 8,
      "peel": 9,
      "mobility": 7,
      "earlyGame": 7,
      "lateGame": 8
    },
    "signatureSkill": "Chế Độ Nghiền Nát (Tạo khiên lá chắn càn quét và khóa trụ công trình)",
    "counters": [
      "Valhein",
      "Violet",
      "Natalya"
    ],
    "synergies": [
      "Yorn",
      "Tel'Annas",
      "Slimz"
    ],
    "tags": [
      "Khóa trụ",
      "Bảo kê xạ thủ",
      "Khống chế liên tục"
    ],
    "tacticalNotes": "Bộ kỹ năng gây choáng công trình và bảo kê xạ thủ cực tốt, cản phá triệt để các sát thủ lao vào bắn phá.",
    "difficulty": "Dễ",
    "isActive": true
  },
  {
    "id": "hero_augur",
    "name": "Augur",
    "title": "Đại Ty Mệnh",
    "role": "Sát thủ",
    "secondaryRoles": [
      "Đấu sĩ"
    ],
    "playstyles": [
      "Sát thương dồn",
      "Cơ động",
      "Ám sát chủ lực"
    ],
    "primaryLane": "Rừng",
    "secondaryLanes": [
      "Caesar"
    ],
    "damageType": "Vật lý",
    "avatar": "https://images.unsplash.com/photo-1563089145-599997674d42?w=150&auto=format&fit=crop&q=80",
    "ratings": {
      "tankiness": 6,
      "damage": 10,
      "crowdControl": 6,
      "engage": 8,
      "peel": 4,
      "mobility": 10,
      "earlyGame": 8,
      "lateGame": 9
    },
    "signatureSkill": "Thần Đạo Sinh Tử (Tạo cầu nối linh hồn vượt địa hình xuyên tường và kết liễu mục tiêu)",
    "counters": [
      "Tel'Annas",
      "Yorn",
      "Valhein",
      "Veera",
      "Natalya"
    ],
    "synergies": [
      "Dolia",
      "Dyadia",
      "Teeri",
      "Yue"
    ],
    "tags": [
      "Vượt địa hình",
      "Kết liễu sinh mệnh",
      "Sát thủ đỉnh cao"
    ],
    "tacticalNotes": "Tướng sát thủ thượng đẳng với khả năng tạo lối đi trên không xuyên qua mọi địa hình vách tường và kết liễu nhanh.",
    "difficulty": "Khó",
    "isActive": true
  }
];
