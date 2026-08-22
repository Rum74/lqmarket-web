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
import { AccountItem, OrderItem, UserProfile, ChatMessage, WalletTransaction, ReviewItem } from '../types';

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

// -------------------------------------------------------------
// USERS COLLECTION
// -------------------------------------------------------------
export async function syncUserToDb(user: UserProfile): Promise<void> {
  try {
    await setDoc(doc(db, 'users', user.id), user, { merge: true });
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

// -------------------------------------------------------------
// ACCOUNTS COLLECTION
// -------------------------------------------------------------
export async function syncAccountToDb(account: AccountItem): Promise<void> {
  try {
    await setDoc(doc(db, 'accounts', account.id), account, { merge: true });
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
// ORDERS COLLECTION
// -------------------------------------------------------------
export async function syncOrderToDb(order: OrderItem): Promise<void> {
  try {
    await setDoc(doc(db, 'orders', order.id), order, { merge: true });
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
// REVIEWS COLLECTION
// -------------------------------------------------------------
export async function syncReviewToDb(review: ReviewItem): Promise<void> {
  try {
    await setDoc(doc(db, 'reviews', review.id), review, { merge: true });
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
// MESSAGES COLLECTION
// -------------------------------------------------------------
export async function syncMessageToDb(msg: ChatMessage): Promise<void> {
  try {
    await setDoc(doc(db, 'messages', msg.id), msg, { merge: true });
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
// BATCH INITIAL SEEDING HELPER
// -------------------------------------------------------------
export async function seedInitialDatabaseIfEmpty(
  users: UserProfile[],
  accounts: AccountItem[],
  orders: OrderItem[]
): Promise<void> {
  try {
    const accountsSnap = await getDocs(collection(db, 'accounts'));
    if (accountsSnap.empty) {
      console.log('Seeding initial data to Firestore database...');
      const batch = writeBatch(db);

      // Seed Users
      for (const u of users) {
        batch.set(doc(db, 'users', u.id), u);
      }

      // Seed Accounts
      for (const a of accounts) {
        batch.set(doc(db, 'accounts', a.id), a);
      }

      // Seed Orders
      for (const o of orders) {
        batch.set(doc(db, 'orders', o.id), o);
      }

      await batch.commit();
      console.log('Database initialized successfully with relational records!');
    }
  } catch (err) {
    console.warn('Initial seed skipped or completed:', err);
  }
}
