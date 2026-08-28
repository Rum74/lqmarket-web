import { IAccount } from '../models/Account';
import { IUser } from '../models/User';
import { IOrder } from '../models/Order';
import bcrypt from 'bcryptjs';

export const DEFAULT_SERVER_USERS: Array<Partial<IUser>> = [
  {
    id: 'user_admin_super',
    name: 'Huỳnh Văn Phòng',
    username: 'admin',
    email: 'admin@lqmarket.vn',
    password: '', // will be hashed in seeder
    phone: '0966924316',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    role: 'admin',
    balance: 1000000,
    pendingBalance: 0,
    rating: 5.0,
    completedSales: 15,
    isVerifiedSeller: true,
    sellerTier: 'VIP',
    bio: 'Super Admin LQMarket - Hỗ trợ nạp rút, duyệt tin và giải quyết khiếu nại trung gian 24/7.',
    status: 'active'
  },
  {
    id: 'user_seller_shopacc',
    name: 'Shop Acc Liên Quân VIP',
    username: 'shopacc',
    email: 'shopacc@cholienquan.com',
    password: '',
    phone: '0932547709',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=shopacc',
    role: 'seller',
    balance: 850000,
    pendingBalance: 0,
    rating: 4.9,
    completedSales: 28,
    isVerifiedSeller: true,
    sellerTier: 'PRO',
    bio: 'Chuyên cung cấp Acc Liên Quân VIP, rank Cao Thủ / Chiến Tướng, cam kết 100% trắng thông tin bảo hiểm trọn đời.',
    status: 'active'
  },
  {
    id: 'user_buyer_haihuynh',
    name: 'Hải Huỳnh',
    username: 'haihuynh',
    email: 'vanhai@cholienquan.com',
    password: '',
    phone: '0987654321',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=haihuynh',
    role: 'buyer',
    balance: 1010000,
    pendingBalance: 0,
    rating: 5.0,
    completedSales: 0,
    isVerifiedSeller: false,
    sellerTier: 'FREE',
    bio: 'Game thủ Liên Quân tìm mua nick tướng tủ rank Cao Thủ.',
    status: 'active'
  },
  {
    id: 'user_buyer_caotlenduy',
    name: 'caotlenduy',
    username: 'caotlenduy',
    email: 'd4188890@cholienquan.com',
    password: '',
    phone: '0385442067',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=caotlenduy',
    role: 'buyer',
    balance: 0,
    pendingBalance: 0,
    rating: 5.0,
    completedSales: 0,
    isVerifiedSeller: false,
    sellerTier: 'FREE',
    bio: 'Thành viên sàn LQMarket.',
    status: 'active'
  }
];

export const DEFAULT_SERVER_ACCOUNTS: Array<Partial<IAccount>> = [
  {
    id: 'acc_01_chientuong_sss',
    code: 'LQ-88291',
    title: 'Acc Chiến Tướng 55 Sao • Nakroth Thứ Nguyên SSS + Raz Muay Thái • Full Tướng',
    price: 1250000,
    originalPrice: 1550000,
    rank: 'Chiến Tướng',
    level: 30,
    heroesCount: 116,
    skinsCount: 220,
    runePages: '90/90 Full 30 Bảng Ngọc Chuẩn',
    server: 'Việt Nam',
    rareSkins: [
      { name: 'Thứ Nguyên Vệ Thần', hero: 'Nakroth', tier: 'SSS', tagColor: 'bg-red-500 text-white' },
      { name: 'Muay Thái', hero: 'Raz', tier: 'SS+', tagColor: 'bg-amber-500 text-slate-950' },
      { name: 'Thần Sứ Tuyệt Sắc', hero: 'Tulen', tier: 'SS', tagColor: 'bg-purple-500 text-white' }
    ],
    notableHeroes: ['Nakroth', 'Raz', 'Tulen', 'Florentino', 'Murad', 'Aoi'],
    badgeTag: 'VIP',
    images: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Acc tâm huyết từ mùa 1, Rank Chiến Tướng 55 Sao, winrate 65%, full tướng, 220 skin. Trắng thông tin 100%, đổi mật khẩu và liên kết ngay.',
    sellerId: 'user_seller_shopacc',
    sellerName: 'Shop Acc Liên Quân VIP',
    sellerAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=shopacc',
    sellerRating: 4.9,
    sellerCompletedSales: 28,
    sellerResponseTime: '< 5 phút',
    sellerVerified: true,
    status: 'approved',
    credentials: {
      username: 'nakroth_chientuong_vip',
      password: 'PassLQ_2026_Vip99',
      securityType: 'Trắng Thông Tin',
      secretNotes: 'Đăng nhập Garena đổi pass ngay sau khi mua.'
    },
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    views: 1420,
    likes: 85,
    isFeatured: true
  },
  {
    id: 'acc_02_caothu_tulen',
    code: 'LQ-77312',
    title: 'Acc Cao Thủ 28 Sao • 110 Tướng • 185 Trang Phục • Tulen Chí Tôn + Florentino Tinh Hệ',
    price: 480000,
    originalPrice: 650000,
    rank: 'Cao Thủ',
    level: 30,
    heroesCount: 110,
    skinsCount: 185,
    runePages: '90/90 Full Ngọc Phép & Sát Thủ',
    server: 'Việt Nam',
    rareSkins: [
      { name: 'Chí Tôn Kiếm Tiên', hero: 'Tulen', tier: 'SS', tagColor: 'bg-purple-500 text-white' },
      { name: 'Tinh Hệ', hero: 'Florentino', tier: 'S+ Hữu Hạn', tagColor: 'bg-cyan-500 text-slate-950' }
    ],
    notableHeroes: ['Tulen', 'Florentino', 'Liliana', 'Elsu', 'Hayate'],
    badgeTag: 'HOT',
    images: [
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Acc chuyên đi mid và rừng, rank Cao Thủ mượt mà, nhiều skin bậc S+ và SS. Trắng thông tin, bảo hành 100%.',
    sellerId: 'user_seller_shopacc',
    sellerName: 'Shop Acc Liên Quân VIP',
    sellerAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=shopacc',
    sellerRating: 4.9,
    sellerCompletedSales: 28,
    sellerResponseTime: '< 5 phút',
    sellerVerified: true,
    status: 'approved',
    credentials: {
      username: 'caothu_tulen_185',
      password: 'PassLQ_2026_Ct28',
      securityType: 'Trắng Thông Tin',
      secretNotes: 'Tài khoản sạch 100%.'
    },
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    views: 890,
    likes: 42,
    isFeatured: true
  },
  {
    id: 'acc_03_thachdau_florentino',
    code: 'LQ-99501',
    title: 'Acc Thách Đấu Top 50 • 116 Tướng • 260 Trang Phục • Florentino Ultraman SSS + Violet Thứ Nguyên',
    price: 2800000,
    originalPrice: 3500000,
    rank: 'Thách Đấu',
    level: 30,
    heroesCount: 116,
    skinsCount: 260,
    runePages: '90/90 Full Toàn Bộ Ngọc III',
    server: 'Việt Nam',
    rareSkins: [
      { name: 'Seven Ultraman SSS', hero: 'Florentino', tier: 'SSS', tagColor: 'bg-red-500 text-white' },
      { name: 'Thứ Nguyên Vệ Thần SSS', hero: 'Violet', tier: 'SSS', tagColor: 'bg-red-500 text-white' },
      { name: 'Muay Thái', hero: 'Raz', tier: 'SS+', tagColor: 'bg-amber-500 text-slate-950' }
    ],
    notableHeroes: ['Florentino', 'Violet', 'Raz', 'Nakroth', 'Keera', 'Zuka'],
    badgeTag: 'VIP',
    images: [
      'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Siêu phẩm tài khoản Thách Đấu rank cao, 2 Siêu Skin SSS, phù hợp cho streamer hoặc game thủ leo giải.',
    sellerId: 'user_admin_super',
    sellerName: 'Huỳnh Văn Phòng',
    sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    sellerRating: 5.0,
    sellerCompletedSales: 15,
    sellerResponseTime: '< 2 phút',
    sellerVerified: true,
    status: 'approved',
    credentials: {
      username: 'thachdau_lq_top50',
      password: 'PassLQ_2026_TdTop',
      securityType: 'Trắng Thông Tin',
      secretNotes: 'Acc bảo hành vĩnh viễn từ Super Admin.'
    },
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    views: 2450,
    likes: 190,
    isFeatured: true
  },
  {
    id: 'acc_04_tinhanh_murad',
    code: 'LQ-44210',
    title: 'Acc Tinh Anh I • 85 Tướng • 120 Trang Phục • Murad Siêu Việt V + Valhein Vũ Điệu Hoàng Gia',
    price: 180000,
    originalPrice: 250000,
    rank: 'Tinh Anh',
    level: 30,
    heroesCount: 85,
    skinsCount: 120,
    runePages: '90/90 Ngọc Sát Thủ & Xạ Thủ',
    server: 'Việt Nam',
    rareSkins: [
      { name: 'Siêu Việt V Bậc Cao', hero: 'Murad', tier: 'SS', tagColor: 'bg-purple-500 text-white' },
      { name: 'Vũ Điệu Hoàng Gia', hero: 'Valhein', tier: 'S+ Hữu Hạn', tagColor: 'bg-cyan-500 text-slate-950' }
    ],
    notableHeroes: ['Murad', 'Valhein', 'Arthur', 'Natalya', 'Triệu Vân'],
    badgeTag: 'GIÁ RẺ',
    images: [
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Acc sinh viên giá rẻ, đầy đủ tướng thông dụng leo rank, Murad Siêu Việt múa cực cháy.',
    sellerId: 'user_seller_shopacc',
    sellerName: 'Shop Acc Liên Quân VIP',
    sellerAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=shopacc',
    sellerRating: 4.9,
    sellerCompletedSales: 28,
    sellerResponseTime: '< 5 phút',
    sellerVerified: true,
    status: 'approved',
    credentials: {
      username: 'tinhanh_murad_120',
      password: 'PassLQ_2026_Ta85',
      securityType: 'Trắng Thông Tin',
      secretNotes: 'Đổi mật khẩu ngay sau mua.'
    },
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    views: 650,
    likes: 28,
    isFeatured: false
  },
  {
    id: 'acc_05_kimcuong_ngokhong',
    code: 'LQ-33109',
    title: 'Acc Kim Cương II • 72 Tướng • 95 Trang Phục • Ngộ Không Nhóc Tì Bá Đạo + Yorn Long Cung',
    price: 120000,
    originalPrice: 180000,
    rank: 'Kim Cương',
    level: 30,
    heroesCount: 72,
    skinsCount: 95,
    runePages: '90/90 Ngọc Trọng Kích Chí Mạng',
    server: 'Việt Nam',
    rareSkins: [
      { name: 'Nhóc Tì Bá Đạo', hero: 'Ngộ Không', tier: 'SS', tagColor: 'bg-purple-500 text-white' }
    ],
    notableHeroes: ['Ngộ Không', 'Yorn', 'Krixi', 'Gildur', 'Tel’Annas'],
    badgeTag: 'GIÁ RẺ',
    images: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Acc Ngộ Không gõ cực đã tay, full ngọc chí mạng, trắng thông tin 100%.',
    sellerId: 'user_seller_shopacc',
    sellerName: 'Shop Acc Liên Quân VIP',
    sellerAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=shopacc',
    sellerRating: 4.9,
    sellerCompletedSales: 28,
    sellerResponseTime: '< 5 phút',
    sellerVerified: true,
    status: 'approved',
    credentials: {
      username: 'kimcuong_ngokhong_95',
      password: 'PassLQ_2026_Kc72',
      securityType: 'Trắng Thông Tin',
      secretNotes: 'Tài khoản đổi mật khẩu thoải mái.'
    },
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    views: 430,
    likes: 19,
    isFeatured: false
  },
  {
    id: 'acc_06_chienthan_laville',
    code: 'LQ-88102',
    title: 'Acc Chiến Thần 38 Sao • 115 Tướng • 210 Trang Phục • Laville Xạ Thần Khởi Nguyên + Capheny Anime',
    price: 890000,
    originalPrice: 1100000,
    rank: 'Chiến Thần',
    level: 30,
    heroesCount: 115,
    skinsCount: 210,
    runePages: '90/90 Full Ngọc Xạ Thủ & Đấu Sĩ',
    server: 'Việt Nam',
    rareSkins: [
      { name: 'Xạ Thần Khởi Nguyên', hero: 'Laville', tier: 'SSS', tagColor: 'bg-red-500 text-white' },
      { name: 'Haruhi Suzumiya Anime', hero: 'Capheny', tier: 'SS Hữu Hạn', tagColor: 'bg-pink-500 text-white' }
    ],
    notableHeroes: ['Laville', 'Capheny', 'Hayate', 'Elsu', 'Thorne', 'Yorn'],
    badgeTag: 'HOT',
    images: [
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Acc chuyên Xạ Thủ gánh team, Skin SSS Laville và Capheny Anime siêu đẹp, rank Chiến Thần cao cấp.',
    sellerId: 'user_seller_shopacc',
    sellerName: 'Shop Acc Liên Quân VIP',
    sellerAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=shopacc',
    sellerRating: 4.9,
    sellerCompletedSales: 28,
    sellerResponseTime: '< 5 phút',
    sellerVerified: true,
    status: 'approved',
    credentials: {
      username: 'chienthan_laville_sss',
      password: 'PassLQ_2026_Ct38',
      securityType: 'Trắng Thông Tin',
      secretNotes: 'Tài khoản sạch, giao tự động.'
    },
    createdAt: new Date(Date.now() - 3600000 * 50).toISOString(),
    views: 1120,
    likes: 67,
    isFeatured: true
  },
  {
    id: 'acc_07_bachkim_dieuthuyen',
    code: 'LQ-22105',
    title: 'Acc Bạch Kim I • 58 Tướng • 65 Trang Phục • Điêu Thuyền Tiệc Bãi Biển + Veera Nàng Dơi',
    price: 65000,
    originalPrice: 95000,
    rank: 'Bạch Kim',
    level: 30,
    heroesCount: 58,
    skinsCount: 65,
    runePages: '90/90 Ngọc Phép Chuẩn',
    server: 'Việt Nam',
    rareSkins: [
      { name: 'Tiệc Bãi Biển', hero: 'Điêu Thuyền', tier: 'S+ Hữu Hạn', tagColor: 'bg-cyan-500 text-slate-950' }
    ],
    notableHeroes: ['Điêu Thuyền', 'Veera', 'Krixi', 'Natalya'],
    badgeTag: 'GIÁ RẺ',
    images: [
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Acc phụ leo rank nhanh cho bạn nữ, skin Điêu Thuyền bãi biển xinh xắn, trắng thông tin.',
    sellerId: 'user_seller_shopacc',
    sellerName: 'Shop Acc Liên Quân VIP',
    sellerAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=shopacc',
    sellerRating: 4.9,
    sellerCompletedSales: 28,
    sellerResponseTime: '< 5 phút',
    sellerVerified: true,
    status: 'approved',
    credentials: {
      username: 'bachkim_dieuthuyen_65',
      password: 'PassLQ_2026_Bk58',
      securityType: 'Trắng Thông Tin',
      secretNotes: 'Đổi thông tin lập tức.'
    },
    createdAt: new Date(Date.now() - 3600000 * 60).toISOString(),
    views: 310,
    likes: 12,
    isFeatured: false
  },
  {
    id: 'acc_08_sold_sample',
    code: 'LQ-11099',
    title: 'Acc Cao Thủ 15 Sao • 95 Tướng • 130 Trang Phục • Raz Siêu Cấp Tin Tặc',
    price: 200000,
    originalPrice: 280000,
    rank: 'Cao Thủ',
    level: 30,
    heroesCount: 95,
    skinsCount: 130,
    runePages: '90/90 Ngọc Chuẩn',
    server: 'Việt Nam',
    rareSkins: [
      { name: 'Siêu Cấp Tin Tặc', hero: 'Raz', tier: 'S+', tagColor: 'bg-cyan-500 text-slate-950' }
    ],
    notableHeroes: ['Raz', 'Zuka', 'Lauriel'],
    badgeTag: 'ĐÃ BÁN',
    images: [
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Acc đã được bàn giao trung gian Escrow thành công cho khách hàng.',
    sellerId: 'user_seller_shopacc',
    sellerName: 'Shop Acc Liên Quân VIP',
    sellerAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=shopacc',
    sellerRating: 4.9,
    sellerCompletedSales: 28,
    sellerResponseTime: '< 5 phút',
    sellerVerified: true,
    status: 'sold',
    credentials: {
      username: 'raz_tintac_sold',
      password: '••••••••',
      securityType: 'Trắng Thông Tin',
      secretNotes: ''
    },
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    views: 520,
    likes: 31,
    isFeatured: false
  }
];

export const DEFAULT_SERVER_ORDERS: Array<Partial<IOrder>> = [
  {
    id: 'order_completed_01',
    orderCode: '#ORD11099',
    accountId: 'acc_08_sold_sample',
    accountCode: 'LQ-11099',
    accountTitle: 'Acc Cao Thủ 15 Sao • 95 Tướng • 130 Trang Phục • Raz Siêu Cấp Tin Tặc',
    accountPrice: 200000,
    fee: 10000,
    totalAmount: 200000,
    buyerId: 'user_buyer_haihuynh',
    buyerName: 'Hải Huỳnh',
    sellerId: 'user_seller_shopacc',
    sellerName: 'Shop Acc Liên Quân VIP',
    status: 'completed',
    credentialsDelivered: {
      username: 'raz_tintac_sold',
      password: 'PassLQ_2026_Done99',
      securityType: 'Trắng Thông Tin',
      secretNotes: 'Đã hoàn tất bàn giao qua Escrow.'
    },
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 23).toISOString(),
    review: {
      rating: 5,
      comment: 'Giao acc tự động cực nhanh, thông tin đúng mô tả 100%!',
      createdAt: new Date(Date.now() - 3600000 * 23).toISOString()
    }
  }
];
