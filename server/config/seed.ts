import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Account } from '../models/Account';
import { MysteryBox } from '../models/MysteryBox';
import { MysteryReward } from '../models/MysteryReward';
import { Setting } from '../models/Setting';

export async function seedDatabase() {
  try {
    // 1. Seed Admin & Seller Users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Seeding initial users...');
      const salt = await bcrypt.genSalt(10);
      const adminPassword = await bcrypt.hash('admin123', salt);
      const sellerPassword = await bcrypt.hash('seller123', salt);
      const buyerPassword = await bcrypt.hash('buyer123', salt);
      const defaultPassword = await bcrypt.hash('123456', salt);

      await User.create([
        {
          id: 'user_admin_001',
          name: 'Quản Trị Viên LQMarket',
          username: 'admin',
          email: 'admin@cholienquan.com',
          password: adminPassword,
          phone: '0988888888',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin_lqmarket',
          role: 'admin',
          balance: 10000000,
          pendingBalance: 0,
          rating: 5.0,
          completedSales: 999,
          isVerifiedSeller: true,
          sellerTier: 'VIP',
          bankName: 'MBBank',
          bankAccount: '9999999999',
          bankAccountName: 'LQMARKET ADMIN',
          bio: 'Hệ thống Quản trị viên sàn giao dịch Liên Quân Mobile số 1 Việt Nam.',
          status: 'active'
        },
        {
          id: 'user_admin_1',
          name: 'Trịnh Minh (Super Admin)',
          username: 'superadmin',
          email: 'admin@lqmarket.vn',
          password: adminPassword,
          phone: '0909999999',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&q=80',
          role: 'admin',
          balance: 50000000,
          pendingBalance: 0,
          rating: 5.0,
          completedSales: 1500,
          isVerifiedSeller: true,
          sellerTier: 'VIP',
          status: 'active'
        },
        {
          id: 'user_seller_001',
          name: 'Shop Liên Quân VIP Pro',
          username: 'seller_vip',
          email: 'seller@cholienquan.com',
          password: sellerPassword,
          phone: '0977777777',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=seller_vip',
          role: 'seller',
          balance: 2500000,
          pendingBalance: 500000,
          rating: 4.9,
          completedSales: 342,
          isVerifiedSeller: true,
          sellerTier: 'VIP',
          bankName: 'Techcombank',
          bankAccount: '19035678901234',
          bankAccountName: 'NGUYEN VAN SELLER',
          bio: 'Chuyên cung cấp acc Liên Quân full tướng, full ngọc, skin SSS hữu hạn uy tín 100%.',
          status: 'active'
        },
        {
          id: 'user_seller_1',
          name: 'Nguyễn Văn A (Shop LQ Sài Gòn)',
          username: 'shopvana',
          email: 'shop.lq.nguyenvana@gmail.com',
          password: defaultPassword,
          phone: '0912345678',
          avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=160&q=80',
          role: 'seller',
          balance: 1500000,
          pendingBalance: 200000,
          rating: 4.9,
          completedSales: 154,
          isVerifiedSeller: true,
          sellerTier: 'VIP',
          bankName: 'MB Bank',
          bankAccount: '0912345678',
          bankAccountName: 'NGUYEN VAN A',
          bio: 'Chuyên cung cấp acc Liên Quân VIP, acc Nakroth Thứ Nguyên, Florentino full skin.',
          status: 'active'
        },
        {
          id: 'user_buyer_001',
          name: 'Nguyễn Văn Minh',
          username: 'minh_gamer',
          email: 'buyer@cholienquan.com',
          password: buyerPassword,
          phone: '0966666666',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=minh_gamer',
          role: 'buyer',
          balance: 500000,
          pendingBalance: 0,
          rating: 5.0,
          completedSales: 0,
          isVerifiedSeller: false,
          sellerTier: 'FREE',
          status: 'active'
        },
        {
          id: 'user_buyer_1',
          name: 'Nguyễn Văn B (Người Mua)',
          username: 'vanb',
          email: 'vanb.gamer@gmail.com',
          password: defaultPassword,
          phone: '0987123456',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
          role: 'buyer',
          balance: 500000,
          pendingBalance: 0,
          rating: 5.0,
          completedSales: 0,
          isVerifiedSeller: false,
          sellerTier: 'FREE',
          status: 'active'
        }
      ]);
      console.log('✅ Seeded default users successfully.');
    }

    // 2. Seed Mystery Boxes
    const boxCount = await MysteryBox.countDocuments();
    if (boxCount === 0) {
      console.log('🌱 Seeding Mystery Boxes...');
      await MysteryBox.create([
        {
          id: 'box_bronze',
          name: 'Túi Đồng May Mắn',
          tier: 'bronze',
          price: 20000,
          originalPrice: 30000,
          description: 'Cơ hội nhận acc Rank Kim Cương, thẻ giảm giá 20k hoặc tiền mặt.',
          badge: 'TIẾT KIỆM',
          color: 'from-amber-700 to-yellow-600',
          accentColor: '#B45309',
          iconName: 'Gift',
          totalOpened: 1240,
          stockRemaining: 9999,
          jackpotPreview: 'Acc Kim Cương hoặc 50k tiền mặt',
          isActive: true
        },
        {
          id: 'box_silver',
          name: 'Túi Bạc Siêu Phẩm',
          tier: 'silver',
          price: 50000,
          originalPrice: 70000,
          description: 'Cơ hội nhận acc Rank Tinh Anh, skin S+ Hữu Hạn, tiền mặt 100k.',
          badge: 'PHỔ BIẾN',
          color: 'from-slate-400 to-slate-200',
          accentColor: '#94A3B8',
          iconName: 'Sparkles',
          totalOpened: 3120,
          stockRemaining: 9999,
          jackpotPreview: 'Acc Tinh Anh 80 tướng + skin S+ hoặc 100k tiền mặt',
          isActive: true
        },
        {
          id: 'box_gold',
          name: 'Túi Vàng Hoàng Gia',
          tier: 'gold',
          price: 100000,
          originalPrice: 150000,
          description: 'Cơ hội nhận acc Cao Thủ 100+ tướng, skin SS Tuyệt Sắc, tiền mặt 300k.',
          badge: 'HOT NHẤT',
          color: 'from-yellow-500 to-amber-400',
          accentColor: '#F59E0B',
          iconName: 'Crown',
          totalOpened: 5680,
          stockRemaining: 9999,
          jackpotPreview: '100% trúng quà giá trị cao. Cơ hội nhận acc Cao Thủ SS Tuyệt Sắc',
          isActive: true
        },
        {
          id: 'box_diamond',
          name: 'Túi Kim Cương Chí Tôn',
          tier: 'diamond',
          price: 200000,
          originalPrice: 300000,
          description: 'Cơ hội trúng siêu phẩm Thách Đấu, Full Tướng, Skin SSS Hữu Hạn, 1 Triệu VNĐ.',
          badge: 'CỰC PHẨM',
          color: 'from-cyan-500 to-blue-600',
          accentColor: '#06B6D4',
          iconName: 'Flame',
          totalOpened: 4210,
          stockRemaining: 9999,
          jackpotPreview: 'Tỉ lệ trúng acc SSS Hữu Hạn và tiền mặt lên đến 95%',
          isActive: true
        }
      ] as any);
      console.log('✅ Seeded Mystery Boxes successfully.');
    }

    // 3. Seed Mystery Rewards
    const rewardCount = await MysteryReward.countDocuments();
    if (rewardCount === 0) {
      console.log('🌱 Seeding Mystery Rewards...');
      await MysteryReward.create([
        // Bronze Tier Rewards
        {
          id: 'rew_bronze_cash_20k',
          boxTierId: 'bronze',
          type: 'cash',
          title: '20.000 VNĐ Tiền Mặt',
          subtitle: 'Hoàn vốn 100% tiền mở túi',
          value: 20000,
          rarity: 'common',
          dropWeight: 40
        },
        {
          id: 'rew_bronze_cash_50k',
          boxTierId: 'bronze',
          type: 'cash',
          title: '50.000 VNĐ Tiền Mặt',
          subtitle: 'Lãi gấp 2.5 lần',
          value: 50000,
          rarity: 'rare',
          dropWeight: 20
        },
        {
          id: 'rew_bronze_voucher_20k',
          boxTierId: 'bronze',
          type: 'voucher',
          title: 'Voucher Giảm 20.000 VNĐ',
          subtitle: 'Áp dụng cho mọi đơn hàng từ 100k',
          value: 20000,
          voucherCode: 'BRONZE20K',
          voucherDiscount: 20000,
          voucherMinOrder: 100000,
          rarity: 'common',
          dropWeight: 30
        },
        {
          id: 'rew_bronze_acc_kc',
          boxTierId: 'bronze',
          type: 'account',
          title: 'Acc Kim Cương 65 Tướng 40 Skin',
          subtitle: 'Trắng thông tin, đổi pass ngay',
          value: 80000,
          rarity: 'epic',
          dropWeight: 10,
          accountData: {
            rank: 'Kim Cương I',
            heroesCount: 65,
            skinsCount: 40,
            rareSkinName: 'Valhein Hoàng Tử Băng',
            credentials: {
              username: 'lq_box_bronze_01',
              password: 'Pass_' + Math.floor(100000 + Math.random() * 900000),
              securityType: 'Trắng Thông Tin'
            }
          }
        },

        // Silver Tier Rewards
        {
          id: 'rew_silver_cash_50k',
          boxTierId: 'silver',
          type: 'cash',
          title: '50.000 VNĐ Tiền Mặt',
          subtitle: 'Hoàn tiền trực tiếp vào ví',
          value: 50000,
          rarity: 'common',
          dropWeight: 35
        },
        {
          id: 'rew_silver_cash_100k',
          boxTierId: 'silver',
          type: 'cash',
          title: '100.000 VNĐ Tiền Mặt',
          subtitle: 'Gấp đôi giá trị mở túi',
          value: 100000,
          rarity: 'rare',
          dropWeight: 25
        },
        {
          id: 'rew_silver_voucher_50k',
          boxTierId: 'silver',
          type: 'voucher',
          title: 'Voucher Giảm 50.000 VNĐ',
          subtitle: 'Áp dụng cho đơn hàng từ 200k',
          value: 50000,
          voucherCode: 'SILVER50K',
          voucherDiscount: 50000,
          voucherMinOrder: 200000,
          rarity: 'common',
          dropWeight: 20
        },
        {
          id: 'rew_silver_acc_ta',
          boxTierId: 'silver',
          type: 'account',
          title: 'Acc Tinh Anh + Raz Muay Thái',
          subtitle: 'Full 3 bảng ngọc chuẩn',
          value: 200000,
          rarity: 'legendary',
          dropWeight: 20,
          accountData: {
            rank: 'Tinh Anh II',
            heroesCount: 85,
            skinsCount: 95,
            rareSkinName: 'Raz Muay Thái',
            credentials: {
              username: 'lq_box_silver_01',
              password: 'Pass_' + Math.floor(100000 + Math.random() * 900000),
              securityType: 'Trắng Thông Tin'
            }
          }
        },

        // Gold Tier Rewards
        {
          id: 'rew_gold_cash_100k',
          boxTierId: 'gold',
          type: 'cash',
          title: '100.000 VNĐ Tiền Mặt',
          subtitle: 'Bảo toàn số dư ví',
          value: 100000,
          rarity: 'common',
          dropWeight: 30
        },
        {
          id: 'rew_gold_cash_300k',
          boxTierId: 'gold',
          type: 'cash',
          title: '300.000 VNĐ Tiền Mặt',
          subtitle: 'X3 số tiền mở túi',
          value: 300000,
          rarity: 'epic',
          dropWeight: 25
        },
        {
          id: 'rew_gold_acc_ct',
          boxTierId: 'gold',
          type: 'account',
          title: 'Acc Cao Thủ + Nakroth Thứ Nguyên Vệ Thần',
          subtitle: '105 Tướng, 180 Skin, 5 Bảng Ngọc',
          value: 650000,
          rarity: 'legendary',
          isJackpot: true,
          dropWeight: 25,
          accountData: {
            rank: 'Cao Thủ 25 Sao',
            heroesCount: 105,
            skinsCount: 180,
            rareSkinName: 'Nakroth Thứ Nguyên Vệ Thần',
            credentials: {
              username: 'lq_box_gold_01',
              password: 'Pass_' + Math.floor(100000 + Math.random() * 900000),
              securityType: 'Trắng Thông Tin'
            }
          }
        },
        {
          id: 'rew_gold_voucher_100k',
          boxTierId: 'gold',
          type: 'voucher',
          title: 'Voucher Giảm 100.000 VNĐ',
          subtitle: 'Áp dụng cho mọi đơn hàng từ 300k',
          value: 100000,
          voucherCode: 'GOLD100K',
          voucherDiscount: 100000,
          voucherMinOrder: 300000,
          rarity: 'rare',
          dropWeight: 20
        },

        // Diamond Tier Rewards
        {
          id: 'rew_diamond_cash_500k',
          boxTierId: 'diamond',
          type: 'cash',
          title: '500.000 VNĐ Tiền Mặt',
          subtitle: 'Cộng trực tiếp vào ví',
          value: 500000,
          rarity: 'epic',
          dropWeight: 30
        },
        {
          id: 'rew_diamond_cash_1m',
          boxTierId: 'diamond',
          type: 'cash',
          title: '1.000.000 VNĐ Tiền Mặt (JACKPOT)',
          subtitle: 'Giải đặc biệt tiền mặt',
          value: 1000000,
          rarity: 'legendary',
          isJackpot: true,
          dropWeight: 15
        },
        {
          id: 'rew_diamond_acc_td',
          boxTierId: 'diamond',
          type: 'account',
          title: 'Acc Thách Đấu Full Tướng + Tulen Tân Thần Thiên Hà',
          subtitle: 'Full 118 Tướng, 320 Skin Cực Phẩm',
          value: 1800000,
          rarity: 'legendary',
          isJackpot: true,
          dropWeight: 35,
          accountData: {
            rank: 'Thách Đấu TOP 50',
            heroesCount: 118,
            skinsCount: 320,
            rareSkinName: 'Tulen Tân Thần Thiên Hà',
            credentials: {
              username: 'lq_box_diamond_01',
              password: 'Pass_' + Math.floor(100000 + Math.random() * 900000),
              securityType: 'Trắng Thông Tin'
            }
          }
        },
        {
          id: 'rew_diamond_acc_ct_sss',
          boxTierId: 'diamond',
          type: 'account',
          title: 'Acc Cao Thủ + Lauriel Thứ Nguyên Vệ Thần',
          subtitle: '112 Tướng, 240 Skin, 90/90 Ngọc',
          value: 950000,
          rarity: 'epic',
          dropWeight: 20,
          accountData: {
            rank: 'Cao Thủ 45 Sao',
            heroesCount: 112,
            skinsCount: 240,
            rareSkinName: 'Lauriel Thứ Nguyên Vệ Thần',
            credentials: {
              username: 'lq_box_diamond_02',
              password: 'Pass_' + Math.floor(100000 + Math.random() * 900000),
              securityType: 'Trắng Thông Tin'
            }
          }
        }
      ] as any);
      console.log('✅ Seeded Mystery Rewards successfully.');
    }

    // 4. Seed Initial Game Accounts for Marketplace
    const accountCount = await Account.countDocuments();
    if (accountCount === 0) {
      console.log('🌱 Seeding Marketplace Accounts...');
      const seller = await User.findOne({ role: 'seller' });
      const sellerId = seller ? seller.id : 'user_seller_001';
      const sellerName = seller ? seller.name : 'Shop Liên Quân VIP Pro';

      await Account.create([
        {
          id: 'acc_001',
          code: 'LQ10245',
          title: 'Acc Cao Thủ 35 Sao | Nakroth Thứ Nguyên + Raz Muay Thái | Full Tướng',
          price: 650000,
          originalPrice: 850000,
          rank: 'Cao Thủ',
          level: 30,
          heroesCount: 116,
          skinsCount: 215,
          runePages: '90/90 Full 10 Bảng Ngọc Chuẩn',
          server: 'Việt Nam',
          rareSkins: [
            { name: 'Nakroth Thứ Nguyên Vệ Thần', hero: 'Nakroth', tier: 'SSS', tagColor: 'bg-purple-600' },
            { name: 'Raz Muay Thái', hero: 'Raz', tier: 'SS', tagColor: 'bg-amber-500' },
            { name: 'Murad Siêu Việt 2.0', hero: 'Murad', tier: 'SS', tagColor: 'bg-blue-600' }
          ],
          notableHeroes: ['Nakroth', 'Raz', 'Murad', 'Florentino', 'Airi', 'Tulen'],
          badgeTag: 'HOT DEAL',
          images: [
            'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
            'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800'
          ],
          description: 'Acc tâm huyết từ mùa 1. Trắng thông tin 100%, hỗ trợ đổi thông tin ngay sau khi mua. Đầy đủ bảng ngọc công phép, tốc đánh, xuyên giáp.',
          sellerId,
          sellerName,
          sellerAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=seller_vip',
          sellerRating: 4.9,
          sellerCompletedSales: 342,
          sellerResponseTime: '< 5 phút',
          sellerVerified: true,
          status: 'approved',
          credentials: {
            username: 'lq_caothu_35s',
            password: 'LQPass' + Math.floor(10000 + Math.random() * 90000),
            securityType: 'Trắng Thông Tin'
          },
          views: 350,
          likes: 42,
          isFeatured: true
        },
        {
          id: 'acc_002',
          code: 'LQ10246',
          title: 'Acc Thách Đấu TOP 100 | Tulen Tân Thần Thiên Hà + Florentino Giám Sát',
          price: 1450000,
          originalPrice: 1800000,
          rank: 'Thách Đấu',
          level: 30,
          heroesCount: 118,
          skinsCount: 310,
          runePages: '90/90 Full Ngọc Max Level',
          server: 'Việt Nam',
          rareSkins: [
            { name: 'Tulen Tân Thần Thiên Hà', hero: 'Tulen', tier: 'SSS', tagColor: 'bg-purple-600' },
            { name: 'Florentino Giám Sát Tinh Vân', hero: 'Florentino', tier: 'SSS', tagColor: 'bg-purple-600' },
            { name: 'Airi Bích Hải Thánh Nữ', hero: 'Airi', tier: 'SS', tagColor: 'bg-emerald-600' }
          ],
          notableHeroes: ['Tulen', 'Florentino', 'Airi', 'Zata', 'Liliana', 'Keera'],
          badgeTag: 'VIP PRO',
          images: [
            'https://images.unsplash.com/photo-1563089145-599997674d42?w=800',
            'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800'
          ],
          description: 'Acc Thách Đấu rank cao, khung thách đấu mùa hiện tại. Full 118 tướng, 310 trang phục bao gồm 6 skin SSS Hữu Hạn.',
          sellerId,
          sellerName,
          sellerAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=seller_vip',
          sellerRating: 4.9,
          sellerCompletedSales: 342,
          sellerResponseTime: '< 5 phút',
          sellerVerified: true,
          status: 'approved',
          credentials: {
            username: 'lq_thachdau_top',
            password: 'LQPass' + Math.floor(10000 + Math.random() * 90000),
            securityType: 'Trắng Thông Tin'
          },
          views: 620,
          likes: 88,
          isFeatured: true
        },
        {
          id: 'acc_003',
          code: 'LQ10247',
          title: 'Acc Tinh Anh V | Giá Rẻ Cho Học Sinh Sinh Viên | 75 Tướng 60 Skin',
          price: 180000,
          originalPrice: 250000,
          rank: 'Tinh Anh',
          level: 30,
          heroesCount: 75,
          skinsCount: 60,
          runePages: '90/90 3 Bảng Ngọc AD/AP/Tank',
          server: 'Việt Nam',
          rareSkins: [
            { name: 'Valhein Hoàng Tử Băng', hero: 'Valhein', tier: 'S+', tagColor: 'bg-blue-500' },
            { name: 'Arthur Hoàng Kim Giáp', hero: 'Arthur', tier: 'S+', tagColor: 'bg-yellow-600' }
          ],
          notableHeroes: ['Valhein', 'Arthur', 'TelAnnas', 'Krixi', 'Yorn'],
          badgeTag: 'GIÁ RẺ',
          images: [
            'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800'
          ],
          description: 'Acc phụ leo rank, thích hợp cày cuốc. Thông tin sạch, giao ngay trong 1 giây.',
          sellerId,
          sellerName,
          sellerAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=seller_vip',
          sellerRating: 4.9,
          sellerCompletedSales: 342,
          sellerResponseTime: '< 5 phút',
          sellerVerified: true,
          status: 'approved',
          credentials: {
            username: 'lq_tinhanh_re',
            password: 'LQPass' + Math.floor(10000 + Math.random() * 90000),
            securityType: 'Trắng Thông Tin'
          },
          views: 180,
          likes: 15,
          isFeatured: false
        }
      ]);
      console.log('✅ Seeded Marketplace Accounts successfully.');
    }

    // 5. Seed Default Settings
    const settingCount = await Setting.countDocuments();
    if (settingCount === 0) {
      await Setting.create([
        {
          key: 'site_settings',
          value: {
            siteName: 'LQMarket - Chợ Liên Quân Mobile',
            siteDescription: 'Sàn giao dịch mua bán tài khoản Liên Quân Mobile uy tín số 1 Việt Nam với hệ thống bảo vệ Escrow và nạp tiền tự động 24/7.',
            escrowFeePercent: 5,
            minWithdrawAmount: 50000,
            hotline: '0988.888.888',
            zaloSupport: 'https://zalo.me/g/lqmarket',
            bannerText: 'Khuyến mãi nạp ví tặng 10% giá trị nạp qua PayOS VietQR hôm nay!'
          }
        }
      ]);
    }
  } catch (error: any) {
    console.warn('⚠️ Seeding note:', error.message || error);
  }
}
