export interface ServerMysteryBoxTier {
  id: string;
  name: string;
  tier: string;
  price: number;
  originalPrice?: number;
  description: string;
  badge: string;
  colorGradient: string;
  borderColor: string;
  iconBg: string;
  totalOpened: number;
  stockRemaining: number;
  highlightText: string;
  highlightRewards?: any[];
  isActive: boolean;
}

export interface ServerMysteryReward {
  id: string;
  boxTierId: string;
  type: 'account' | 'cash' | 'voucher' | 'free_turn';
  title: string;
  subtitle?: string;
  description?: string;
  value: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  dropWeight: number;
  dropRate?: number;
  imageUrl?: string;
  isJackpot?: boolean;
  voucherCode?: string;
  voucherDiscount?: number;
  voucherMinOrder?: number;
  accountData?: {
    rank: string;
    heroesCount: number;
    skinsCount: number;
    rareSkinName: string;
    credentials: {
      username: string;
      password: string;
      securityType: string;
      secretNotes?: string;
    };
  };
}

export const DEFAULT_SERVER_BOX_TIERS: ServerMysteryBoxTier[] = [
  {
    id: 'box_bronze',
    name: 'Túi 19K - Túi Đồng May Mắn',
    tier: 'bronze',
    price: 19000,
    originalPrice: 30000,
    description: 'Thích hợp tân thủ thử vận may, 100% trúng quà: Voucher 5K-10K, Lượt mở free & Acc game may mắn.',
    badge: 'TÂN THỦ (19K)',
    colorGradient: 'from-amber-700/80 via-amber-900/60 to-slate-950',
    borderColor: 'border-amber-700/50 hover:border-amber-500',
    iconBg: 'bg-amber-700/20 text-amber-300',
    totalOpened: 1420,
    stockRemaining: 150,
    highlightText: 'Voucher 5K-10K, Lượt mở free, Acc cơ bản, Acc có skin & Acc may mắn',
    isActive: true
  },
  {
    id: 'box_gold',
    name: 'Túi 49K - Túi Vàng Cao Cấp',
    tier: 'gold',
    price: 49000,
    originalPrice: 80000,
    description: 'Săn Acc Nhiều Tướng, Nhiều Skin & Acc VIP Cao Thủ cực hot, kèm Voucher 10K-20K và Lượt mở free.',
    badge: 'SIÊU HOT (49K)',
    colorGradient: 'from-yellow-600/80 via-amber-700/60 to-slate-950',
    borderColor: 'border-yellow-500/60 hover:border-yellow-400',
    iconBg: 'bg-yellow-500/20 text-yellow-300',
    totalOpened: 3280,
    stockRemaining: 80,
    highlightText: 'Voucher 10K-20K, Lượt mở free, Acc nhiều tướng, Acc nhiều skin, Acc VIP',
    isActive: true
  },
  {
    id: 'box_diamond',
    name: 'Túi 99K - Túi Kim Cương SSS',
    tier: 'diamond',
    price: 99000,
    originalPrice: 150000,
    description: 'Kho quà đẳng cấp! Nổ siêu phẩm Acc Nhiều Skin S/SS, Acc VIP, Acc Hiếm & Acc Đặc Biệt cực giá trị.',
    badge: 'TỶ LỆ CAO (99K)',
    colorGradient: 'from-cyan-600/80 via-blue-900/60 to-slate-950',
    borderColor: 'border-cyan-500/60 hover:border-cyan-400',
    iconBg: 'bg-cyan-500/20 text-cyan-300',
    totalOpened: 5120,
    stockRemaining: 45,
    highlightText: 'Voucher 20K-50K, Acc nhiều tướng, nhiều skin S/SS, Acc VIP, Acc hiếm, Acc đặc biệt',
    isActive: true
  },
  {
    id: 'box_special',
    name: 'Túi 199K - Túi Thần Tài Vô Cực',
    tier: 'special',
    price: 199000,
    originalPrice: 300000,
    description: 'Túi mù quyền lực nhất! Độc quyền Acc VIP, Nhiều Skin SSS Tuyệt Sắc, Acc Hiếm & Acc Cực Hiếm Đỉnh Phong.',
    badge: 'ĐẲNG CẤP (199K)',
    colorGradient: 'from-purple-600/80 via-rose-900/60 to-slate-950',
    borderColor: 'border-purple-500/60 hover:border-purple-400',
    iconBg: 'bg-purple-500/20 text-purple-300',
    totalOpened: 1890,
    stockRemaining: 25,
    highlightText: 'Voucher 50K-100K, Acc VIP, Acc nhiều skin SSS, Acc hiếm & Acc cực hiếm',
    isActive: true
  }
];

export const DEFAULT_SERVER_REWARDS: ServerMysteryReward[] = [
  // ==========================================
  // 1. TÚI 19K (TÚI ĐỒNG MAY MẮN)
  // ==========================================
  {
    id: 'rew_b_v5k',
    boxTierId: 'box_bronze',
    type: 'voucher',
    title: 'Voucher 5K',
    subtitle: 'Giảm ngay 5.000đ khi thanh toán đơn hàng bất kỳ',
    value: 5000,
    rarity: 'common',
    dropWeight: 28,
    voucherCode: 'VOUCHER5K',
    voucherDiscount: 5000,
    voucherMinOrder: 20000
  },
  {
    id: 'rew_b_v10k',
    boxTierId: 'box_bronze',
    type: 'voucher',
    title: 'Voucher 10K',
    subtitle: 'Giảm ngay 10.000đ khi mua tài khoản trên sàn',
    value: 10000,
    rarity: 'common',
    dropWeight: 22,
    voucherCode: 'VOUCHER10K',
    voucherDiscount: 10000,
    voucherMinOrder: 30000
  },
  {
    id: 'rew_b_free',
    boxTierId: 'box_bronze',
    type: 'free_turn',
    title: 'Lượt mở túi miễn phí',
    subtitle: 'Tặng 1 vé mở tiếp Túi 19K hoàn toàn miễn phí',
    value: 19000,
    rarity: 'rare',
    dropWeight: 18
  },
  {
    id: 'rew_b_acc_base',
    boxTierId: 'box_bronze',
    type: 'account',
    title: 'Tài khoản cơ bản',
    subtitle: 'Rank Bạch Kim, 35+ Tướng, 20 Trang Phục, Trắng TT',
    value: 45000,
    rarity: 'common',
    dropWeight: 16,
    accountData: {
      rank: 'Bạch Kim',
      heroesCount: 38,
      skinsCount: 22,
      rareSkinName: 'Valhein Hoàng Tử Quạ',
      credentials: {
        username: 'lq_basic_' + Math.floor(1000 + Math.random() * 9000),
        password: 'Pass_' + Math.random().toString(36).substring(2, 8) + '@2026',
        securityType: 'Trắng Thông Tin',
        secretNotes: 'Tài khoản cơ bản trắng thông tin 100%, đổi mật khẩu và liên kết SĐT cá nhân ngay.'
      }
    }
  },
  {
    id: 'rew_b_acc_skin',
    boxTierId: 'box_bronze',
    type: 'account',
    title: 'Tài khoản có skin',
    subtitle: 'Rank Tinh Anh, 45+ Tướng, Có Skin Florentino Tinh Hệ / Nakroth BBoy',
    value: 85000,
    rarity: 'rare',
    dropWeight: 11,
    accountData: {
      rank: 'Tinh Anh',
      heroesCount: 48,
      skinsCount: 32,
      rareSkinName: 'Florentino Tinh Hệ',
      credentials: {
        username: 'lq_skin_' + Math.floor(1000 + Math.random() * 9000),
        password: 'PassSkin_' + Math.random().toString(36).substring(2, 8) + '@',
        securityType: 'Trắng Thông Tin',
        secretNotes: 'Tài khoản có skin đẹp, trắng thông tin 100% bảo hành trọn đời.'
      }
    }
  },
  {
    id: 'rew_b_acc_lucky',
    boxTierId: 'box_bronze',
    type: 'account',
    title: 'Tài khoản may mắn',
    subtitle: 'Rank Cao Thủ, 60+ Tướng, 45 Trang Phục, Bảng Ngọc Chuẩn',
    value: 150000,
    rarity: 'epic',
    dropWeight: 5,
    isJackpot: true,
    accountData: {
      rank: 'Cao Thủ',
      heroesCount: 62,
      skinsCount: 48,
      rareSkinName: 'Nakroth BBoy Công Nghệ + Raz Đại Sứ Cực Quang',
      credentials: {
        username: 'lq_lucky_' + Math.floor(1000 + Math.random() * 9000),
        password: 'LuckyVip_' + Math.random().toString(36).substring(2, 8) + '!',
        securityType: 'Trắng Thông Tin',
        secretNotes: 'Giải thưởng may mắn Túi 19K, tài khoản Cao Thủ cực xịn trắng thông tin.'
      }
    }
  },

  // ==========================================
  // 2. TÚI 49K (TÚI VÀNG CAO CẤP)
  // ==========================================
  {
    id: 'rew_g_v10k',
    boxTierId: 'box_gold',
    type: 'voucher',
    title: 'Voucher 10K',
    subtitle: 'Giảm 10.000đ trực tiếp khi mua tài khoản',
    value: 10000,
    rarity: 'common',
    dropWeight: 25,
    voucherCode: 'VOUCHER10K',
    voucherDiscount: 10000,
    voucherMinOrder: 30000
  },
  {
    id: 'rew_g_v20k',
    boxTierId: 'box_gold',
    type: 'voucher',
    title: 'Voucher 20K',
    subtitle: 'Giảm 20.000đ trực tiếp khi mua tài khoản',
    value: 20000,
    rarity: 'common',
    dropWeight: 22,
    voucherCode: 'VOUCHER20K',
    voucherDiscount: 20000,
    voucherMinOrder: 50000
  },
  {
    id: 'rew_g_free',
    boxTierId: 'box_gold',
    type: 'free_turn',
    title: 'Lượt mở túi miễn phí',
    subtitle: 'Tặng ngay 1 vé mở tiếp Túi Vàng 49K miễn phí',
    value: 49000,
    rarity: 'rare',
    dropWeight: 16
  },
  {
    id: 'rew_g_acc_heroes',
    boxTierId: 'box_gold',
    type: 'account',
    title: 'Tài khoản nhiều tướng',
    subtitle: 'Rank Tinh Anh / Cao Thủ, 75+ Tướng, Full Bảng Ngọc 90',
    value: 160000,
    rarity: 'rare',
    dropWeight: 15,
    accountData: {
      rank: 'Cao Thủ',
      heroesCount: 78,
      skinsCount: 55,
      rareSkinName: 'Triệu Vân Đoạt Mệnh Thương',
      credentials: {
        username: 'lq_hero_' + Math.floor(1000 + Math.random() * 9000),
        password: 'HeroAcc_' + Math.random().toString(36).substring(2, 8) + '@',
        securityType: 'Trắng Thông Tin',
        secretNotes: 'Tài khoản nhiều tướng phục vụ leo rank đa dạng, trắng thông tin.'
      }
    }
  },
  {
    id: 'rew_g_acc_skins',
    boxTierId: 'box_gold',
    type: 'account',
    title: 'Tài khoản nhiều skin',
    subtitle: 'Rank Cao Thủ, 80+ Trang Phục S/S+, Hiệu Ứng Đẹp Mắt',
    value: 220000,
    rarity: 'epic',
    dropWeight: 14,
    accountData: {
      rank: 'Cao Thủ',
      heroesCount: 82,
      skinsCount: 85,
      rareSkinName: 'Laville Kim Đồng Ngọc Nữ + Murad MTP',
      credentials: {
        username: 'lq_skinpro_' + Math.floor(1000 + Math.random() * 9000),
        password: 'SkinPro_' + Math.random().toString(36).substring(2, 8) + '!',
        securityType: 'Trắng Thông Tin',
        secretNotes: 'Tài khoản sở hữu nhiều skin đẹp, trắng thông tin 100%.'
      }
    }
  },
  {
    id: 'rew_g_acc_vip',
    boxTierId: 'box_gold',
    type: 'account',
    title: 'Tài khoản VIP',
    subtitle: 'Rank Cao Thủ 25 Sao, 90 Tướng, 95 Skin, Nakroth Quán Quân + Valhein Băng',
    value: 350000,
    rarity: 'legendary',
    dropWeight: 8,
    isJackpot: true,
    accountData: {
      rank: 'Cao Thủ',
      heroesCount: 90,
      skinsCount: 95,
      rareSkinName: 'Nakroth Quán Quân + Valhein Hoàng Tử Băng',
      credentials: {
        username: 'lq_vipgold_' + Math.floor(1000 + Math.random() * 9000),
        password: 'VipGold_' + Math.random().toString(36).substring(2, 8) + '#',
        securityType: 'Trắng Thông Tin',
        secretNotes: 'Tài khoản VIP Cao Thủ giá trị cao, trắng thông tin bảo hành trọn đời.'
      }
    }
  },

  // ==========================================
  // 3. TÚI 99K (TÚI KIM CƯƠNG SSS)
  // ==========================================
  {
    id: 'rew_d_v20k',
    boxTierId: 'box_diamond',
    type: 'voucher',
    title: 'Voucher 20K',
    subtitle: 'Giảm ngay 20.000đ khi thanh toán mua acc',
    value: 20000,
    rarity: 'common',
    dropWeight: 20,
    voucherCode: 'VOUCHER20K',
    voucherDiscount: 20000,
    voucherMinOrder: 60000
  },
  {
    id: 'rew_d_v50k',
    boxTierId: 'box_diamond',
    type: 'voucher',
    title: 'Voucher 50K',
    subtitle: 'Giảm 50.000đ trực tiếp khi mua tài khoản',
    value: 50000,
    rarity: 'rare',
    dropWeight: 18,
    voucherCode: 'VOUCHER50K',
    voucherDiscount: 50000,
    voucherMinOrder: 150000
  },
  {
    id: 'rew_d_acc_heroes',
    boxTierId: 'box_diamond',
    type: 'account',
    title: 'Tài khoản nhiều tướng',
    subtitle: 'Rank Cao Thủ, 95+ Tướng, Gần Full Tướng, 3 Bảng Ngọc 90',
    value: 280000,
    rarity: 'rare',
    dropWeight: 18,
    accountData: {
      rank: 'Cao Thủ',
      heroesCount: 96,
      skinsCount: 80,
      rareSkinName: 'Ryoma Thanh Long Bang Chủ',
      credentials: {
        username: 'lq_dia_heroes_' + Math.floor(1000 + Math.random() * 9000),
        password: 'HeroDia_' + Math.random().toString(36).substring(2, 8) + '@',
        securityType: 'Trắng Thông Tin',
        secretNotes: 'Tài khoản gần full tướng, trắng thông tin.'
      }
    }
  },
  {
    id: 'rew_d_acc_skins_sss',
    boxTierId: 'box_diamond',
    type: 'account',
    title: 'Tài khoản nhiều skin S/SS',
    subtitle: 'Rank Cao Thủ, 120+ Skin S/SS, Lauriel Tinh Vân Sứ + Raz Băng Quyền SS',
    value: 420000,
    rarity: 'epic',
    dropWeight: 16,
    accountData: {
      rank: 'Cao Thủ',
      heroesCount: 102,
      skinsCount: 125,
      rareSkinName: 'Lauriel Tinh Vân Sứ + Raz Băng Quyền Quán Quân SS',
      credentials: {
        username: 'lq_dia_sss_' + Math.floor(1000 + Math.random() * 9000),
        password: 'SkinSSS_' + Math.random().toString(36).substring(2, 8) + '!',
        securityType: 'Trắng Thông Tin',
        secretNotes: 'Tài khoản nhiều skin S/SS cao cấp, trắng thông tin 100%.'
      }
    }
  },
  {
    id: 'rew_d_acc_vip',
    boxTierId: 'box_diamond',
    type: 'account',
    title: 'Tài khoản VIP',
    subtitle: 'Rank Cao Thủ 35 Sao, 105 Tướng, 140 Skin, Raz Muay Thái + Murad Siêu Việt',
    value: 600000,
    rarity: 'epic',
    dropWeight: 14,
    accountData: {
      rank: 'Cao Thủ',
      heroesCount: 105,
      skinsCount: 142,
      rareSkinName: 'Raz Muay Thái + Murad Siêu Việt',
      credentials: {
        username: 'lq_dia_vip_' + Math.floor(1000 + Math.random() * 9000),
        password: 'VipDia_' + Math.random().toString(36).substring(2, 8) + '#',
        securityType: 'Trắng Thông Tin',
        secretNotes: 'Tài khoản VIP Cao Thủ 35 Sao, trắng thông tin an toàn tuyệt đối.'
      }
    }
  },
  {
    id: 'rew_d_acc_rare',
    boxTierId: 'box_diamond',
    type: 'account',
    title: 'Tài khoản hiếm',
    subtitle: 'Nakroth Quán Quân + Raz Muay Thái + Lauriel Thứ Nguyên, 110 Tướng 180 Skin',
    value: 850000,
    rarity: 'legendary',
    dropWeight: 9,
    accountData: {
      rank: 'Cao Thủ',
      heroesCount: 110,
      skinsCount: 180,
      rareSkinName: 'Nakroth Quán Quân + Raz Muay Thái + Lauriel Thứ Nguyên Vệ Thần',
      credentials: {
        username: 'lq_dia_rare_' + Math.floor(1000 + Math.random() * 9000),
        password: 'RareDia_' + Math.random().toString(36).substring(2, 8) + '$',
        securityType: 'Trắng Thông Tin',
        secretNotes: 'Tài khoản hiếm nhiều siêu phẩm skin, trắng thông tin 100%.'
      }
    }
  },
  {
    id: 'rew_d_acc_special',
    boxTierId: 'box_diamond',
    type: 'account',
    title: 'Tài khoản đặc biệt',
    subtitle: 'Rank Chiến Tướng, Nakroth Thứ Nguyên Vệ Thần SSS + Raz Muay Thái + Full Tướng',
    value: 1200000,
    rarity: 'legendary',
    dropWeight: 5,
    isJackpot: true,
    accountData: {
      rank: 'Chiến Tướng',
      heroesCount: 118,
      skinsCount: 220,
      rareSkinName: 'Nakroth Thứ Nguyên Vệ Thần SSS + Raz Muay Thái + Tulen Thần Sứ',
      credentials: {
        username: 'lq_dia_special_' + Math.floor(1000 + Math.random() * 9000),
        password: 'SpecialDia_' + Math.random().toString(36).substring(2, 8) + '*99',
        securityType: 'Trắng Thông Tin',
        secretNotes: 'JackPot đặc biệt Túi Kim Cương 99K, siêu phẩm Chiến Tướng SSS.'
      }
    }
  },

  // ==========================================
  // 4. TÚI 199K (TÚI THẦN TÀI VÔ CỰC)
  // ==========================================
  {
    id: 'rew_s_v50k',
    boxTierId: 'box_special',
    type: 'voucher',
    title: 'Voucher 50K',
    subtitle: 'Giảm ngay 50.000đ khi thanh toán đơn hàng bất kỳ',
    value: 50000,
    rarity: 'common',
    dropWeight: 22,
    voucherCode: 'VOUCHER50K',
    voucherDiscount: 50000,
    voucherMinOrder: 150000
  },
  {
    id: 'rew_s_v100k',
    boxTierId: 'box_special',
    type: 'voucher',
    title: 'Voucher 100K',
    subtitle: 'Giảm khủng 100.000đ trực tiếp khi mua acc',
    value: 100000,
    rarity: 'rare',
    dropWeight: 20,
    voucherCode: 'VOUCHER100K',
    voucherDiscount: 100000,
    voucherMinOrder: 300000
  },
  {
    id: 'rew_s_acc_vip',
    boxTierId: 'box_special',
    type: 'account',
    title: 'Tài khoản VIP',
    subtitle: 'Rank Chiến Tướng 50+ Sao, 115 Tướng, 200 Skin, Tulen Thần Sứ + Raz Muay Thái',
    value: 800000,
    rarity: 'epic',
    dropWeight: 20,
    accountData: {
      rank: 'Chiến Tướng',
      heroesCount: 115,
      skinsCount: 200,
      rareSkinName: 'Tulen Thần Sứ + Raz Muay Thái + Airi Kiem Khi',
      credentials: {
        username: 'lq_special_vip_' + Math.floor(1000 + Math.random() * 9000),
        password: 'SpecialVip_' + Math.random().toString(36).substring(2, 8) + '@',
        securityType: 'Trắng Thông Tin',
        secretNotes: 'Tài khoản VIP Chiến Tướng bậc cao, trắng thông tin.'
      }
    }
  },
  {
    id: 'rew_s_acc_sss',
    boxTierId: 'box_special',
    type: 'account',
    title: 'Tài khoản nhiều skin SSS',
    subtitle: 'Sở hữu 3-5 Skin SSS: Nakroth Vệ Thần, Tulen Chí Tôn, TelAnnas Thứ Nguyên',
    value: 1600000,
    rarity: 'legendary',
    dropWeight: 18,
    accountData: {
      rank: 'Chiến Tướng',
      heroesCount: 120,
      skinsCount: 270,
      rareSkinName: '3 Skin SSS: Nakroth Thứ Nguyên + Tulen Chí Tôn + TelAnnas Thứ Nguyên',
      credentials: {
        username: 'lq_special_sss_' + Math.floor(1000 + Math.random() * 9000),
        password: 'SuperSSS_' + Math.random().toString(36).substring(2, 8) + '#!',
        securityType: 'Trắng Thông Tin',
        secretNotes: 'Tài khoản đẳng cấp 3 Skin SSS hiếm có, trắng thông tin 100%.'
      }
    }
  },
  {
    id: 'rew_s_acc_rare',
    boxTierId: 'box_special',
    type: 'account',
    title: 'Tài khoản hiếm',
    subtitle: 'Rank Thách Đấu, Top Tướng Server, Full Tướng 290 Trang Phục Đỉnh Cao',
    value: 2200000,
    rarity: 'legendary',
    dropWeight: 13,
    accountData: {
      rank: 'Thách Đấu',
      heroesCount: 121,
      skinsCount: 290,
      rareSkinName: 'Top 50 Server, 4 Skin SSS, Full Hiệu Ứng Đấu Giải',
      credentials: {
        username: 'lq_special_rare_' + Math.floor(1000 + Math.random() * 9000),
        password: 'RareGod_' + Math.random().toString(36).substring(2, 8) + '$99',
        securityType: 'Trắng Thông Tin',
        secretNotes: 'Tài khoản Thách Đấu Top Server, trắng thông tin bảo hành vĩnh viễn.'
      }
    }
  },
  {
    id: 'rew_s_acc_ultra_rare',
    boxTierId: 'box_special',
    type: 'account',
    title: 'Tài khoản cực hiếm',
    subtitle: 'Top 10 Server Đỉnh Phong, Full 121 Tướng, 330 Trang Phục, 6 Skin SSS Vô Cực',
    value: 3500000,
    rarity: 'legendary',
    dropWeight: 7,
    isJackpot: true,
    accountData: {
      rank: 'Thách Đấu',
      heroesCount: 121,
      skinsCount: 330,
      rareSkinName: '6 Skin SSS: Nakroth, Raz, Tulen, TelAnnas, Lauriel, Airi Miko',
      credentials: {
        username: 'lq_ultra_god_' + Math.floor(1000 + Math.random() * 9000),
        password: 'UltraGod_' + Math.random().toString(36).substring(2, 8) + '$$$2026',
        securityType: 'Trắng Thông Tin',
        secretNotes: 'Tài khoản Thách Đấu Tối Cao Full 121 Tướng 330 Skin, bảo hành trọn đời từ Admin LQMarket.'
      }
    }
  }
];
