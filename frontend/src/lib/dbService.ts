import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from './firebase';
import {
  AccountItem,
  OrderItem,
  UserProfile,
  ChatMessage,
  WalletTransaction,
  ReviewItem,
  AppNotification,
  MysteryBoxTierConfig,
  MysteryBoxRewardItem,
  MysteryBoxHistoryItem,
  UserInventoryItem
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
}

// Clean object recursively to eliminate undefined values for Firestore compatibility
export function cleanForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as unknown as T;
  }
  return JSON.parse(
    JSON.stringify(data, (_, value) => (value === undefined ? null : value))
  );
}

// -------------------------------------------------------------
// 1. USERS COLLECTION
// -------------------------------------------------------------
export async function syncUserToDb(user: UserProfile): Promise<void> {
  try {
    await setDoc(doc(db, 'users', user.id), cleanForFirestore(user), { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.id}`);
  }
}

export async function fetchUsersFromDb(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const list: UserProfile[] = [];
    snap.forEach(d => {
      list.push(d.data() as UserProfile);
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'users');
    return [];
  }
}

export async function deleteUserFromDb(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `users/${userId}`);
  }
}

// -------------------------------------------------------------
// 2. ACCOUNTS / PRODUCTS COLLECTION
// -------------------------------------------------------------
export async function syncAccountToDb(account: AccountItem): Promise<void> {
  try {
    await setDoc(doc(db, 'accounts', account.id), cleanForFirestore(account), { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `accounts/${account.id}`);
  }
}

export async function deleteAccountFromDb(accountId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'accounts', accountId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `accounts/${accountId}`);
  }
}

export async function fetchAccountsFromDb(): Promise<AccountItem[]> {
  try {
    const snap = await getDocs(collection(db, 'accounts'));
    const list: AccountItem[] = [];
    snap.forEach(d => {
      list.push(d.data() as AccountItem);
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'accounts');
    return [];
  }
}

// -------------------------------------------------------------
// 3. ORDERS COLLECTION
// -------------------------------------------------------------
export async function syncOrderToDb(order: OrderItem): Promise<void> {
  try {
    await setDoc(doc(db, 'orders', order.id), cleanForFirestore(order), { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `orders/${order.id}`);
  }
}

export async function fetchOrdersFromDb(): Promise<OrderItem[]> {
  try {
    const snap = await getDocs(collection(db, 'orders'));
    const list: OrderItem[] = [];
    snap.forEach(d => {
      list.push(d.data() as OrderItem);
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'orders');
    return [];
  }
}

// -------------------------------------------------------------
// 4. TRANSACTIONS / WALLET TRANSACTIONS COLLECTION
// -------------------------------------------------------------
export async function syncTransactionToDb(tx: WalletTransaction): Promise<void> {
  try {
    await setDoc(doc(db, 'transactions', tx.id), cleanForFirestore(tx), { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `transactions/${tx.id}`);
  }
}

export async function fetchTransactionsFromDb(): Promise<WalletTransaction[]> {
  try {
    const snap = await getDocs(collection(db, 'transactions'));
    const list: WalletTransaction[] = [];
    snap.forEach(d => {
      list.push(d.data() as WalletTransaction);
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'transactions');
    return [];
  }
}

// -------------------------------------------------------------
// 5. REVIEWS COLLECTION
// -------------------------------------------------------------
export async function syncReviewToDb(review: ReviewItem): Promise<void> {
  try {
    await setDoc(doc(db, 'reviews', review.id), cleanForFirestore(review), { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `reviews/${review.id}`);
  }
}

export async function fetchReviewsFromDb(): Promise<ReviewItem[]> {
  try {
    const snap = await getDocs(collection(db, 'reviews'));
    const list: ReviewItem[] = [];
    snap.forEach(d => {
      list.push(d.data() as ReviewItem);
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'reviews');
    return [];
  }
}

// -------------------------------------------------------------
// 6. MESSAGES COLLECTION
// -------------------------------------------------------------
export async function syncMessageToDb(msg: ChatMessage): Promise<void> {
  try {
    await setDoc(doc(db, 'messages', msg.id), cleanForFirestore(msg), { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `messages/${msg.id}`);
  }
}

export async function fetchMessagesFromDb(): Promise<ChatMessage[]> {
  try {
    const snap = await getDocs(collection(db, 'messages'));
    const list: ChatMessage[] = [];
    snap.forEach(d => {
      list.push(d.data() as ChatMessage);
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'messages');
    return [];
  }
}

// -------------------------------------------------------------
// 7. NOTIFICATIONS COLLECTION
// -------------------------------------------------------------
export async function syncNotificationToDb(notif: AppNotification): Promise<void> {
  try {
    await setDoc(doc(db, 'notifications', notif.id), cleanForFirestore(notif), { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `notifications/${notif.id}`);
  }
}

// -------------------------------------------------------------
// 8. MYSTERY BOXES & REWARDS & INVENTORY
// -------------------------------------------------------------
export async function syncMysteryBoxTierToDb(box: MysteryBoxTierConfig): Promise<void> {
  try {
    await setDoc(doc(db, 'mystery_boxes', box.id), cleanForFirestore(box), { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `mystery_boxes/${box.id}`);
  }
}

export async function syncMysteryRewardToDb(reward: MysteryBoxRewardItem): Promise<void> {
  try {
    await setDoc(doc(db, 'mystery_rewards', reward.id), cleanForFirestore(reward), { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `mystery_rewards/${reward.id}`);
  }
}

export async function deleteMysteryRewardFromDb(rewardId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'mystery_rewards', rewardId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `mystery_rewards/${rewardId}`);
  }
}

export async function syncMysteryHistoryToDb(hist: MysteryBoxHistoryItem): Promise<void> {
  try {
    await setDoc(doc(db, 'mystery_history', hist.id), cleanForFirestore(hist), { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `mystery_history/${hist.id}`);
  }
}

export async function syncUserInventoryItemToDb(item: UserInventoryItem): Promise<void> {
  try {
    await setDoc(doc(db, 'user_inventory', item.id), cleanForFirestore(item), { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `user_inventory/${item.id}`);
  }
}
