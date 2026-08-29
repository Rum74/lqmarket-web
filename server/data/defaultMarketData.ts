import { IAccount } from '../models/Account';
import { IUser } from '../models/User';
import { IOrder } from '../models/Order';

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
    balance: 10000000,
    pendingBalance: 0,
    rating: 5.0,
    completedSales: 0,
    isVerifiedSeller: true,
    sellerTier: 'VIP',
    bio: 'Super Admin LQMarket - Quản trị viên hệ thống.',
    status: 'active'
  }
];

export const DEFAULT_SERVER_ACCOUNTS: Array<Partial<IAccount>> = [];
export const DEFAULT_SERVER_ORDERS: Array<Partial<IOrder>> = [];
