import { CouponItem } from '../types';

export const INITIAL_COUPONS: CouponItem[] = [
  {
    id: 'cpn_10',
    code: 'LQMARKET10',
    discountPercent: 10,
    minOrder: 500000,
    maxDiscount: 200000,
    maxUses: 500,
    usedCount: 84,
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    isActive: true,
    description: 'Giảm 10% tối đa 200.000đ cho đơn hàng từ 500.000đ'
  },
  {
    id: 'cpn_vip50',
    code: 'VIP50K',
    discountAmount: 50000,
    minOrder: 300000,
    maxUses: 1000,
    usedCount: 231,
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    isActive: true,
    description: 'Giảm trực tiếp 50.000đ cho đơn từ 300.000đ'
  },
  {
    id: 'cpn_newbie',
    code: 'NEWBIE20K',
    discountAmount: 20000,
    minOrder: 100000,
    maxUses: 2000,
    usedCount: 512,
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    isActive: true,
    description: 'Tặng tân thủ 20.000đ khi mua acc lần đầu tiên từ 100.000đ'
  },
  {
    id: 'cpn_sss',
    code: 'SIEKIN15',
    discountPercent: 15,
    minOrder: 1500000,
    maxDiscount: 400000,
    maxUses: 200,
    usedCount: 42,
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    isActive: true,
    description: 'Giảm 15% tối đa 400.000đ cho dàn acc siêu skin SSS từ 1.500.000đ'
  }
];
