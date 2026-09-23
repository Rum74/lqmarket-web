import crypto from 'crypto';
import { MysteryBox } from '../models/MysteryBox';
import { MysteryReward, IMysteryReward } from '../models/MysteryReward';
import { BlindBagAccount, IBlindBagAccount } from '../models/BlindBagAccount';
import { BlindBagClaim } from '../models/BlindBagClaim';
import { Coupon } from '../models/Coupon';
import { UserInventory } from '../models/UserInventory';
import { MysteryHistory } from '../models/MysteryHistory';
import { User } from '../models/User';
import { Setting } from '../models/Setting';
import { WalletTransaction } from '../models/WalletTransaction';
import { Notification } from '../models/Notification';
import { DEFAULT_SERVER_REWARDS } from '../data/mysteryBoxDefaults';

/**
 * Standardize reward types for comparison
 */
export function normalizeRewardType(type: string): 'account' | 'free_turn' | 'voucher' | 'cash' | 'custom' | string {
  const t = String(type || '').trim().toLowerCase();
  if (t === 'account' || t === 'acc') return 'account';
  if (t === 'free_spin' || t === 'free_turn' || t === 'freespin' || t === 'spin') return 'free_turn';
  if (t === 'voucher' || t === 'coupon') return 'voucher';
  if (t === 'cash' || t === 'money') return 'cash';
  if (t === 'custom') return 'custom';
  return t;
}

/**
 * Ensures that a given box has its reward list in MysteryReward.
 * If empty, automatically seeds ACCOUNT, FREE_SPIN, and VOUCHER rewards for it.
 */
export async function ensureBoxRewards(boxId: string, boxTier: string, boxName: string, boxPrice: number): Promise<IMysteryReward[]> {
  const query = {
    boxTierId: { $in: [boxId, boxTier, 'all'] }
  };

  let rewards = await MysteryReward.find(query);

  if (rewards && rewards.length > 0) {
    return rewards;
  }

  // Check if predefined in DEFAULT_SERVER_REWARDS
  const matchedDefaults = DEFAULT_SERVER_REWARDS.filter(
    r => r.boxTierId === boxId || r.boxTierId === boxTier || r.boxTierId === 'all'
  );

  if (matchedDefaults.length > 0) {
    for (const r of matchedDefaults) {
      await MysteryReward.create(r);
    }
    rewards = await MysteryReward.find(query);
    if (rewards && rewards.length > 0) {
      return rewards;
    }
  }

  // Otherwise, create the standard reward pool: ACCOUNT, FREE_SPIN, VOUCHER
  const defaultRewardsToCreate: Partial<IMysteryReward>[] = [
    {
      id: `rew_${boxId}_acc_${Date.now()}`,
      boxTierId: boxId,
      type: 'account',
      title: `Tài khoản ${boxName}`,
      description: 'Nhận ngay tài khoản Liên Quân trắng thông tin từ Kho ACC Túi Mù',
      value: Math.max(20000, boxPrice * 2),
      rarity: boxPrice >= 90000 ? 'epic' : 'rare',
      dropWeight: 45,
      dropRate: 45
    },
    {
      id: `rew_${boxId}_spin_${Date.now()}`,
      boxTierId: boxId,
      type: 'free_turn',
      title: `Lượt xé miễn phí ${boxName}`,
      description: `Tặng 1 lượt mở tiếp ${boxName} hoàn toàn miễn phí`,
      value: boxPrice,
      rarity: 'rare',
      dropWeight: 25,
      dropRate: 25
    },
    {
      id: `rew_${boxId}_vch_${Date.now()}`,
      boxTierId: boxId,
      type: 'voucher',
      title: `Voucher giảm giá ${boxPrice >= 50000 ? '20K' : '10K'}`,
      description: 'Voucher áp dụng trực tiếp khi thanh toán đơn mua nick trên sàn',
      value: boxPrice >= 50000 ? 20000 : 10000,
      voucherCode: boxPrice >= 50000 ? 'VOUCHER20K' : 'VOUCHER10K',
      voucherDiscount: boxPrice >= 50000 ? 20000 : 10000,
      rarity: 'common',
      dropWeight: 30,
      dropRate: 30
    }
  ];

  for (const r of defaultRewardsToCreate) {
    await MysteryReward.create(r as any);
  }

  return await MysteryReward.find(query);
}

export interface OpenBlindBagOptions {
  userId: string;
  bagId: string;
  useFreeTurn?: boolean;
}

export interface OpenBlindBagResult {
  success: boolean;
  code?: string;
  errorCode?: string;
  message: string;
  reward?: any;
  inventoryItem?: any;
  newBalance?: number;
  isFreeTurn?: boolean;
  requiredAmount?: number;
  currentBalance?: number;
}

/**
 * CORE ENGINE: XÉ TÚI MÙ THEO QUY TRÌNH CHUẨN
 *
 * MỞ TÚI
 * → RANDOM REWARD (theo probability trong pool reward của chính túi đó)
 * → Nếu ACCOUNT → RANDOM 1 ACCOUNT AVAILABLE TỪ KHO ACC TÚI MÙ → CLAIM → Trả TK/MK thật
 * → Nếu FREE_SPIN → Cộng lượt
 * → Nếu VOUCHER → Cấp voucher AVAILABLE từ kho
 *
 * Kiểm tra tài nguyên trước khi random:
 * - Nếu không còn account AVAILABLE thì loại reward ACCOUNT khỏi pool trước khi random.
 * - Nếu account hết nhưng FREE_SPIN/VOUCHER vẫn còn: Túi vẫn mở bình thường, chỉ loại ACCOUNT.
 * - Nếu tất cả reward đều hết: Không trừ tiền, trả OUT_OF_STOCK.
 */
export async function executeOpenBlindBag({
  userId,
  bagId,
  useFreeTurn = false
}: OpenBlindBagOptions): Promise<OpenBlindBagResult> {
  const nowIso = new Date().toISOString();

  // 1. Kiểm tra trạng thái chương trình Túi Mù
  const setting = await Setting.findOne({
    key: { $in: ['mystery_box_active', 'mystery_box_event_active', 'mystery_box_enabled'] }
  }).sort({ updatedAt: -1 });

  if (setting && (setting.value === false || setting.value === 'false' || setting.value === 0)) {
    return {
      success: false,
      code: 'EVENT_PAUSED',
      message: 'Chương trình Xé Túi Mù hiện đang tạm đóng. Vui lòng quay lại sau!'
    };
  }

  // 2. Tìm thông tin Túi Mù (theo id hoặc tier)
  const targetId = String(bagId || '').trim();
  let box = await MysteryBox.findOne({
    $or: [{ id: targetId }, { tier: targetId }]
  });

  if (!box) {
    return {
      success: false,
      code: 'BOX_NOT_FOUND',
      message: 'Không tìm thấy thông tin túi mù này.'
    };
  }

  if (box.isActive === false) {
    return {
      success: false,
      code: 'BOX_INACTIVE',
      message: 'Hạng Túi Mù này đang tạm dừng hoạt động.'
    };
  }

  // 3. Tìm thông tin User
  let user = await User.findOne({ id: userId });
  if (!user) {
    user = await User.create({
      id: userId,
      name: 'Thành Viên',
      email: `user_${userId}@lqmarket.vn`,
      role: 'buyer',
      balance: 500000,
      createdAt: nowIso
    });
  }

  // 4. Kiểm tra lượt quay miễn phí (FREE_SPIN trong UserInventory)
  const unusedFreeTurn = await UserInventory.findOne({
    userId: user.id,
    rewardType: { $in: ['free_turn', 'free_spin'] },
    isUsed: false,
    $or: [
      { 'customData.boxTierId': box.id },
      { 'customData.boxTierId': box.tier },
      { 'customData.boxTierId': 'all' },
      { 'customData.boxTierId': { $exists: false } },
      { customData: null }
    ]
  }).sort({ receivedAt: 1 });

  const isUsingFreeTurn = Boolean(useFreeTurn || (unusedFreeTurn && (user.balance < box.price || useFreeTurn)));
  const cost = isUsingFreeTurn ? 0 : box.price;

  // 5. Kiểm tra số dư ví nếu không dùng lượt miễn phí
  if (!isUsingFreeTurn && user.balance < cost) {
    return {
      success: false,
      code: 'INSUFFICIENT_BALANCE',
      errorCode: 'INSUFFICIENT_BALANCE',
      message: `Số dư không đủ để mở túi này. Cần ${cost.toLocaleString('vi-VN')}đ, số dư hiện tại: ${user.balance.toLocaleString('vi-VN')}đ.`,
      requiredAmount: cost,
      currentBalance: user.balance
    };
  }

  // 6. Lấy danh sách phần thưởng của chính túi đó
  let allRewards = await ensureBoxRewards(box.id, box.tier, box.name, box.price);
  if (!allRewards || allRewards.length === 0) {
    return {
      success: false,
      code: 'OUT_OF_STOCK',
      errorCode: 'OUT_OF_STOCK',
      message: 'Túi mù hiện chưa có phần thưởng nào khả dụng.'
    };
  }

  // 7. Xác định danh sách candidateBagIds tương ứng với kho acc
  const candidateBagIds = [box.id, box.tier];
  if (box.price === 1000) candidateBagIds.push('blindbag_1000');
  if (box.price === 5000) candidateBagIds.push('blindbag_5000');
  if (box.price === 10000) candidateBagIds.push('blindbag_10000');
  if (box.price === 19000 || box.price === 20000) candidateBagIds.push('blindbag_20000', 'box_bronze');
  if (box.price === 49000 || box.price === 50000) candidateBagIds.push('box_gold');
  if (box.price === 99000 || box.price === 100000) candidateBagIds.push('box_diamond');
  if (box.price >= 199000) candidateBagIds.push('box_special');

  // Lấy danh sách account AVAILABLE từ KHO ACC TÚI MÙ (BlindBagAccount)
  const availableAccounts: IBlindBagAccount[] = await BlindBagAccount.find({
    blindBagId: { $in: [...candidateBagIds, 'all'] },
    status: 'available'
  }).lean();

  const hasAvailableAccounts = availableAccounts && availableAccounts.length > 0;

  // 8. LỌC REWARD POOL THEO QUY TẮC:
  // - Nếu không còn account AVAILABLE thì loại reward ACCOUNT khỏi pool trước khi random.
  // - Nếu account hết nhưng FREE_SPIN/VOUCHER vẫn còn: Túi vẫn mở bình thường, chỉ loại ACCOUNT khỏi pool.
  // - Loại bỏ các reward có stock tracked mà stock <= 0.
  let eligibleRewards = allRewards.filter(r => {
    const normType = normalizeRewardType(r.type);

    // Nếu là ACCOUNT mà kho không còn acc available -> loại khỏi pool
    if (normType === 'account' && !hasAvailableAccounts) {
      return false;
    }

    // Nếu có giới hạn stock và stock <= 0 -> loại khỏi pool
    if (typeof r.stock === 'number' && r.stock <= 0) {
      return false;
    }

    return true;
  });

  // 9. NẾU TẤT CẢ REWARD ĐỀU HẾT -> KHÔNG TRỪ TIỀN, TRẢ OUT_OF_STOCK
  if (!eligibleRewards || eligibleRewards.length === 0) {
    return {
      success: false,
      code: 'OUT_OF_STOCK',
      errorCode: 'OUT_OF_STOCK',
      message: 'Túi mù hiện đã hết quà phần thưởng khả dụng. Vui lòng quay lại sau!'
    };
  }

  // 10. BACKEND RANDOM 1 REWARD THEO PROBABILITY (dropWeight / dropRate)
  const totalWeight = eligibleRewards.reduce((sum, r) => sum + Math.max(1, Number(r.dropWeight || r.dropRate || 10)), 0);
  const randomBuffer = crypto.randomBytes(4);
  const randomUint32 = randomBuffer.readUInt32BE(0);
  let randomVal = (randomUint32 / 0xffffffff) * totalWeight;

  let chosenReward: any = eligibleRewards[0];
  for (const r of eligibleRewards) {
    const w = Math.max(1, Number(r.dropWeight || r.dropRate || 10));
    if (randomVal <= w) {
      chosenReward = r;
      break;
    }
    randomVal -= w;
  }

  const chosenRewardType = normalizeRewardType(chosenReward.type);

  // 11. XỬ LÝ THEO TỪNG LOẠI REWARD:
  let claimedAccount: IBlindBagAccount | null = null;
  let grantedVoucherCode: string | null = null;
  let grantedVoucherDiscount: number = 0;
  let grantedVoucherId: string | null = null;

  // ==========================================
  // CASE A: REWARD = ACCOUNT
  // ==========================================
  if (chosenRewardType === 'account') {
    // Chọn NGẪU NHIÊN 1 account trong các account AVAILABLE (không lấy account đầu tiên)
    // Và chống race condition bằng retry nếu 2 người đồng thời claim đúng 1 account
    let remainingAccounts = [...availableAccounts];
    let claimSuccess = false;

    while (remainingAccounts.length > 0 && !claimSuccess) {
      // Pick random index using crypto
      const randomIndex = crypto.randomInt(0, remainingAccounts.length);
      const targetCandidate = remainingAccounts[randomIndex];

      // Remove from candidate list in case of retry
      remainingAccounts.splice(randomIndex, 1);

      // Atomically claim this specific account
      const updated = await BlindBagAccount.findOneAndUpdate(
        {
          id: targetCandidate.id,
          status: 'available'
        },
        {
          $set: {
            status: 'claimed',
            claimedBy: user.id,
            claimedByName: user.name || user.email,
            claimedAt: nowIso,
            updatedAt: nowIso
          }
        },
        { new: true }
      );

      if (updated) {
        claimedAccount = updated;
        claimSuccess = true;
        break;
      }
    }

    // Nếu tất cả candidate đều vừa bị claim bởi request khác cùng lúc
    if (!claimSuccess || !claimedAccount) {
      // Thử lại chọn reward khác ngoài ACCOUNT trong pool
      const nonAccountRewards = eligibleRewards.filter(r => normalizeRewardType(r.type) !== 'account');
      if (nonAccountRewards.length === 0) {
        return {
          success: false,
          code: 'OUT_OF_STOCK',
          errorCode: 'OUT_OF_STOCK',
          message: 'Kho tài khoản phần thưởng vừa hết. Vui lòng thử lại sau!'
        };
      }

      // Re-roll to non-account reward
      const subWeight = nonAccountRewards.reduce((sum, r) => sum + Math.max(1, Number(r.dropWeight || 10)), 0);
      const subVal = (crypto.randomBytes(4).readUInt32BE(0) / 0xffffffff) * subWeight;
      let accum = 0;
      for (const r of nonAccountRewards) {
        accum += Math.max(1, Number(r.dropWeight || 10));
        if (subVal <= accum) {
          chosenReward = r;
          break;
        }
      }
    }
  }

  // Cập nhật lại chosenRewardType nếu re-roll
  const finalRewardType = normalizeRewardType(chosenReward.type);

  // ==========================================
  // CASE B: REWARD = FREE_SPIN (free_turn)
  // ==========================================
  if (finalRewardType === 'free_turn') {
    // Không lấy account, chỉ ghi nhận lượt quay miễn phí
  }

  // ==========================================
  // CASE C: REWARD = VOUCHER
  // ==========================================
  if (finalRewardType === 'voucher') {
    // Không lấy account. Cấp voucher AVAILABLE từ kho voucher hiện tại của hệ thống.
    const nowTime = new Date().toISOString();
    const availableCoupons = await Coupon.find({
      isActive: true,
      $or: [
        { maxUses: { $exists: false } },
        { $expr: { $lt: ['$usedCount', '$maxUses'] } }
      ]
    });

    if (availableCoupons && availableCoupons.length > 0) {
      // Chọn 1 voucher từ kho voucher
      const randomCouponIndex = crypto.randomInt(0, availableCoupons.length);
      const chosenCoupon = availableCoupons[randomCouponIndex];

      grantedVoucherCode = chosenCoupon.code;
      grantedVoucherDiscount = chosenCoupon.discountAmount || chosenCoupon.discountPercent || chosenReward.value || 10000;
      grantedVoucherId = chosenCoupon.id;

      // Cập nhật usedCount của Coupon
      await Coupon.findOneAndUpdate(
        { id: chosenCoupon.id },
        { $inc: { usedCount: 1 } }
      );
    } else {
      // Nếu kho Coupon chưa có bản ghi, sử dụng voucherCode từ template của Reward
      grantedVoucherCode = chosenReward.voucherCode || `LQM${box.price >= 50000 ? '20K' : '10K'}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      grantedVoucherDiscount = chosenReward.voucherDiscount || chosenReward.value || (box.price >= 50000 ? 20000 : 10000);
      grantedVoucherId = `vch_${Date.now()}`;

      // Tạo luôn bản ghi Coupon trong DB để người dùng dùng được ngay khi mua nick
      try {
        const finalVoucherCode: string = grantedVoucherCode || `VCH_${Date.now()}`;
        await Coupon.create({
          id: grantedVoucherId,
          code: finalVoucherCode,
          discountAmount: grantedVoucherDiscount,
          minOrder: box.price,
          maxUses: 100,
          usedCount: 1,
          isActive: true,
          description: `Voucher trúng từ ${box.name}`
        });
      } catch (err) {
        console.warn('Coupon create notice:', err);
      }
    }
  }

  // ==========================================
  // TRỪ TIỀN HOẶC TRỪ LƯỢT MIỄN PHÍ
  // ==========================================
  if (isUsingFreeTurn && unusedFreeTurn) {
    unusedFreeTurn.isUsed = true;
    unusedFreeTurn.usedAt = nowIso;
    await unusedFreeTurn.save();
  } else if (cost > 0) {
    user.balance -= cost;

    // Ghi lịch sử giao dịch ví
    const tx = new WalletTransaction({
      id: `tx_mb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      type: 'purchase',
      amount: -cost,
      status: 'success',
      note: `Mở Túi Mù: ${box.name} (${chosenReward.title})`,
      createdAt: nowIso
    });
    await tx.save();
  }

  // Nếu là tiền mặt (cash) hoàn ví
  if (finalRewardType === 'cash' && chosenReward.value > 0) {
    user.balance += chosenReward.value;
    const cashTx = new WalletTransaction({
      id: `tx_mb_cash_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      type: 'refund',
      amount: chosenReward.value,
      status: 'success',
      note: `Trúng tiền mặt từ ${box.name}: ${chosenReward.title}`,
      createdAt: nowIso
    });
    await cashTx.save();
  }

  await user.save();

  // ==========================================
  // LƯU KHO ĐỒ NGƯỜI DÙNG (UserInventory)
  // ==========================================
  const inventoryId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  let inventoryData: any = {
    id: inventoryId,
    userId: user.id,
    source: 'mystery_box',
    rewardType: finalRewardType,
    title: chosenReward.title,
    value: chosenReward.value || box.price,
    rarity: chosenReward.rarity || 'common',
    isUsed: false,
    receivedAt: nowIso
  };

  if (finalRewardType === 'account' && claimedAccount) {
    inventoryData.title = `Tài Khoản: ${claimedAccount.username}`;
    inventoryData.accountData = {
      rank: chosenReward.accountData?.rank || 'Tinh Anh',
      server: 'Việt Nam',
      heroesCount: chosenReward.accountData?.heroesCount || 45,
      skinsCount: chosenReward.accountData?.skinsCount || 30,
      rareSkinName: chosenReward.accountData?.rareSkinName || '',
      credentials: {
        username: claimedAccount.username,
        password: claimedAccount.password,
        securityType: 'Trắng Thông Tin',
        secretNotes: claimedAccount.notes || 'Tài khoản nhận từ kho Túi Mù'
      }
    };
  } else if (finalRewardType === 'voucher') {
    inventoryData.voucherCode = grantedVoucherCode;
    inventoryData.voucherDiscount = grantedVoucherDiscount;
  } else if (finalRewardType === 'free_turn') {
    inventoryData.customData = {
      boxTierId: box.id,
      boxName: box.name
    };
  }

  const inventoryItem = new UserInventory(inventoryData);
  await inventoryItem.save();

  // ==========================================
  // LƯU LỊCH SỬ NHẬN ACC (BlindBagClaim) - Nếu là Account
  // ==========================================
  if (finalRewardType === 'account' && claimedAccount) {
    const claimRecord = new BlindBagClaim({
      id: `bbc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: user.id,
      userName: user.name || user.email,
      blindBagId: box.id,
      blindBagAccountId: claimedAccount.id,
      username: claimedAccount.username,
      claimedAt: nowIso,
      status: 'success'
    });
    await claimRecord.save();
  }

  // ==========================================
  // LƯU LỊCH SỬ MỞ TÚI (MysteryHistory) (Yêu cầu 10)
  // userId, bagId, rewardId, rewardType, rewardName, accountId/voucherId nếu có, createdAt
  // ==========================================
  const historyItem = new MysteryHistory({
    id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId: user.id,
    userName: user.name || user.email,
    userAvatar: user.avatar || '',
    boxTierId: box.id,
    boxName: box.name,
    rewardId: chosenReward.id,
    rewardType: finalRewardType,
    rewardTitle: chosenReward.title,
    rewardValue: chosenReward.value || box.price,
    rewardRarity: chosenReward.rarity || 'common',
    accountDelivered: (finalRewardType === 'account' && claimedAccount) ? {
      username: claimedAccount.username,
      password: claimedAccount.password,
      securityType: 'Trắng Thông Tin',
      secretNotes: claimedAccount.notes || ''
    } : undefined,
    voucherCodeDelivered: grantedVoucherCode || undefined,
    openedAt: nowIso
  });
  await historyItem.save();

  // Cập nhật số lượt mở của Túi Mù
  box.totalOpened = (box.totalOpened || 0) + 1;
  if (box.stockRemaining && box.stockRemaining > 0) {
    box.stockRemaining -= 1;
  }
  await box.save();

  // Giảm stock của reward nếu reward được quản lý stock riêng
  if (typeof chosenReward.stock === 'number' && chosenReward.stock > 0) {
    chosenReward.stock -= 1;
    await chosenReward.save();
  }

  // Gửi thông báo
  const notif = new Notification({
    id: `notif_${Date.now()}`,
    userId: user.id,
    title: 'Chúc mừng mở Túi Mù thành công!',
    message: finalRewardType === 'account' && claimedAccount
      ? `Bạn vừa mở ${box.name} và nhận được tài khoản Liên Quân: ${claimedAccount.username}. Xem thông tin đăng nhập trong Kho Đồ!`
      : `Bạn vừa mở ${box.name} và nhận được: ${chosenReward.title}.`,
    type: 'system',
    createdAt: nowIso
  });
  await notif.save();

  // ==========================================
  // ĐÓNG GÓI KẾT QUẢ TRẢ VỀ (Yêu cầu 8, 9)
  // Khi trúng ACCOUNT: trả về username/password thật của account vừa claim
  // Khi trúng FREE_SPIN / VOUCHER: chỉ trả đúng loại reward đó, KHÔNG có account giả
  // ==========================================
  let responseReward: any = {
    id: chosenReward.id,
    type: finalRewardType,
    title: chosenReward.title,
    subtitle: chosenReward.description || chosenReward.subtitle,
    value: chosenReward.value || box.price,
    rarity: chosenReward.rarity || 'common'
  };

  if (finalRewardType === 'account' && claimedAccount) {
    responseReward.accountId = claimedAccount.id;
    responseReward.username = claimedAccount.username;
    responseReward.password = claimedAccount.password;
    responseReward.accountData = {
      rank: chosenReward.accountData?.rank || 'Tinh Anh',
      heroesCount: chosenReward.accountData?.heroesCount || 45,
      skinsCount: chosenReward.accountData?.skinsCount || 30,
      credentials: {
        username: claimedAccount.username,
        password: claimedAccount.password,
        securityType: 'Trắng Thông Tin',
        secretNotes: claimedAccount.notes || ''
      }
    };
  } else if (finalRewardType === 'voucher') {
    responseReward.voucherCode = grantedVoucherCode;
    responseReward.voucherDiscount = grantedVoucherDiscount;
    responseReward.voucherId = grantedVoucherId;
  } else if (finalRewardType === 'free_turn') {
    responseReward.isFreeTurn = true;
  }

  return {
    success: true,
    message: finalRewardType === 'account' && claimedAccount
      ? `🎉 CHÚC MỪNG! Bạn đã nhận được tài khoản Liên Quân: ${claimedAccount.username}!`
      : `🎉 CHÚC MỪNG! Bạn đã nhận được: ${chosenReward.title}!`,
    reward: responseReward,
    inventoryItem: inventoryItem.toJSON ? inventoryItem.toJSON() : inventoryItem,
    newBalance: user.balance,
    isFreeTurn: finalRewardType === 'free_turn'
  };
}
