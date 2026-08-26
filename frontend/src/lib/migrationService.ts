import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { supabase, isSupabaseConfigured } from './supabase';

export interface MigrationSummary {
  collection: string;
  totalSource: number;
  migrated: number;
  failed: number;
  errors: string[];
}

/**
 * Executes one-click automated migration from Cloud Firestore to Supabase PostgreSQL
 */
export async function migrateFirestoreToSupabase(): Promise<{
  success: boolean;
  summaries: MigrationSummary[];
  message: string;
}> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      summaries: [],
      message: 'Vui lòng cung cấp VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY trước khi chạy di chuyển dữ liệu.'
    };
  }

  const summaries: MigrationSummary[] = [];

  // 1. Migrate Users / Profiles
  try {
    const userSummary: MigrationSummary = { collection: 'users -> profiles', totalSource: 0, migrated: 0, failed: 0, errors: [] };
    const usersSnap = await getDocs(collection(db, 'users'));
    userSummary.totalSource = usersSnap.docs.length;

    for (const docSnap of usersSnap.docs) {
      const u = docSnap.data();
      const { error } = await supabase.from('profiles').upsert({
        id: docSnap.id,
        name: u.name || 'Người dùng',
        username: u.username || u.email?.split('@')[0] || `user_${docSnap.id.substring(0, 5)}`,
        email: u.email || `${docSnap.id}@cholienquan.com`,
        phone: u.phone || '',
        avatar: u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${docSnap.id}`,
        role: u.role || 'buyer',
        balance: Number(u.balance || 0),
        pending_balance: Number(u.pendingBalance || 0),
        rating: Number(u.rating || 5.0),
        completed_sales: Number(u.completedSales || 0),
        is_verified_seller: Boolean(u.isVerifiedSeller),
        seller_tier: u.sellerTier || 'FREE',
        bank_name: u.bankName || null,
        bank_account: u.bankAccount || null,
        bank_account_name: u.bankAccountName || null,
        wishlist_ids: u.wishlistIds || []
      });

      if (error) {
        userSummary.failed++;
        userSummary.errors.push(`User ${docSnap.id}: ${error.message}`);
      } else {
        userSummary.migrated++;
      }
    }
    summaries.push(userSummary);
  } catch (err: any) {
    console.error('Error migrating users:', err);
  }

  // 2. Migrate Accounts
  try {
    const accSummary: MigrationSummary = { collection: 'accounts -> accounts', totalSource: 0, migrated: 0, failed: 0, errors: [] };
    const accSnap = await getDocs(collection(db, 'accounts'));
    accSummary.totalSource = accSnap.docs.length;

    for (const docSnap of accSnap.docs) {
      const a = docSnap.data();
      const { error } = await supabase.from('accounts').upsert({
        id: docSnap.id,
        seller_id: a.sellerId,
        title: a.title,
        description: a.description || '',
        price: Number(a.price || 0),
        original_price: a.originalPrice ? Number(a.originalPrice) : null,
        rank: a.rank || 'Kim Cương',
        heroes_count: Number(a.heroesCount || 0),
        skins_count: Number(a.skinsCount || 0),
        server: a.server || 'Mặt Trời (VN)',
        login_type: a.loginType || 'Garena Trắng TT',
        images: a.images || [],
        rare_skins: a.rareSkins || [],
        badges: a.badges || [],
        status: a.status || 'approved',
        security_info: a.securityInfo || null,
        views: Number(a.views || 0),
        is_featured: Boolean(a.isFeatured),
        is_hot_deal: Boolean(a.isHotDeal)
      });

      if (error) {
        accSummary.failed++;
        accSummary.errors.push(`Account ${docSnap.id}: ${error.message}`);
      } else {
        accSummary.migrated++;
      }
    }
    summaries.push(accSummary);
  } catch (err: any) {
    console.error('Error migrating accounts:', err);
  }

  // 3. Migrate Orders
  try {
    const ordSummary: MigrationSummary = { collection: 'orders -> orders', totalSource: 0, migrated: 0, failed: 0, errors: [] };
    const ordSnap = await getDocs(collection(db, 'orders'));
    ordSummary.totalSource = ordSnap.docs.length;

    for (const docSnap of ordSnap.docs) {
      const o = docSnap.data();
      const { error } = await supabase.from('orders').upsert({
        id: docSnap.id,
        order_code: o.orderCode || docSnap.id,
        buyer_id: o.buyerId,
        seller_id: o.sellerId,
        account_id: o.accountId,
        account_title: o.accountTitle,
        account_price: Number(o.accountPrice || 0),
        status: o.status || 'completed',
        payment_method: o.paymentMethod || 'WALLET',
        delivered_account: o.deliveredAccount || null,
        escrow_release_at: o.escrowReleaseAt || null,
        dispute_reason: o.disputeReason || null,
        buyer_feedback: o.buyerFeedback || null
      });

      if (error) {
        ordSummary.failed++;
        ordSummary.errors.push(`Order ${docSnap.id}: ${error.message}`);
      } else {
        ordSummary.migrated++;
      }
    }
    summaries.push(ordSummary);
  } catch (err: any) {
    console.error('Error migrating orders:', err);
  }

  // 4. Migrate Mystery Boxes & Rewards
  try {
    const boxSummary: MigrationSummary = { collection: 'mystery_boxes -> mystery_boxes', totalSource: 0, migrated: 0, failed: 0, errors: [] };
    const boxSnap = await getDocs(collection(db, 'mystery_boxes'));
    boxSummary.totalSource = boxSnap.docs.length;

    for (const docSnap of boxSnap.docs) {
      const b = docSnap.data();
      const { error } = await supabase.from('mystery_boxes').upsert({
        id: docSnap.id,
        tier: b.tier,
        name: b.name,
        price: Number(b.price || 0),
        original_price: b.originalPrice ? Number(b.originalPrice) : null,
        image: b.image,
        description: b.description || '',
        is_active: Boolean(b.isActive)
      });

      if (error) {
        boxSummary.failed++;
      } else {
        boxSummary.migrated++;
      }
    }
    summaries.push(boxSummary);
  } catch (err: any) {
    console.error('Error migrating mystery boxes:', err);
  }

  return {
    success: summaries.every(s => s.failed === 0),
    summaries,
    message: 'Hoàn tất quá trình chuyển đổi dữ liệu sang Supabase PostgreSQL!'
  };
}
