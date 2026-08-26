import bcrypt from 'bcryptjs';
import { getDBConnectionStatus } from './db';
import { Model } from 'mongoose';

// Helper matching logic for MongoDB queries
function matchesQuery(doc: any, query: any): boolean {
  if (!query || Object.keys(query).length === 0) return true;

  for (const key of Object.keys(query)) {
    if (key === '$or') {
      const orList = query['$or'];
      if (Array.isArray(orList)) {
        const matchesAny = orList.some((subQuery: any) => matchesQuery(doc, subQuery));
        if (!matchesAny) return false;
      }
      continue;
    }

    if (key === '$and') {
      const andList = query['$and'];
      if (Array.isArray(andList)) {
        const matchesAll = andList.every((subQuery: any) => matchesQuery(doc, subQuery));
        if (!matchesAll) return false;
      }
      continue;
    }

    const val = query[key];
    const docVal = doc[key];

    if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof RegExp)) {
      // Comparison operators
      if ('$in' in val) {
        if (!Array.isArray(val.$in) || !val.$in.includes(docVal)) return false;
      }
      if ('$nin' in val) {
        if (Array.isArray(val.$nin) && val.$nin.includes(docVal)) return false;
      }
      if ('$gte' in val) {
        if (typeof docVal !== 'number' || docVal < val.$gte) return false;
      }
      if ('$lte' in val) {
        if (typeof docVal !== 'number' || docVal > val.$lte) return false;
      }
      if ('$gt' in val) {
        if (typeof docVal !== 'number' || docVal <= val.$gt) return false;
      }
      if ('$lt' in val) {
        if (typeof docVal !== 'number' || docVal >= val.$lt) return false;
      }
      if ('$ne' in val) {
        if (docVal === val.$ne) return false;
      }
      if ('$exists' in val) {
        const exists = docVal !== undefined && docVal !== null;
        if (val.$exists !== exists) return false;
      }
      if ('$regex' in val) {
        const regex = new RegExp(val.$regex, val.$options || 'i');
        if (!regex.test(String(docVal || ''))) return false;
      }
    } else if (val instanceof RegExp) {
      if (!val.test(String(docVal || ''))) return false;
    } else if (Array.isArray(docVal)) {
      if (!docVal.includes(val)) return false;
    } else {
      if (docVal !== val) return false;
    }
  }

  return true;
}

export class MemoryCollection<T extends { id?: string; _id?: any }> {
  public name: string;
  public items: Map<string, any> = new Map();

  constructor(name: string) {
    this.name = name;
  }

  private wrapDoc(raw: any) {
    if (!raw) return null;
    const self = this;
    const doc = { ...raw };
    const docId = doc.id || doc._id || `id_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    doc.id = docId;

    Object.defineProperty(doc, 'save', {
      value: async function () {
        self.items.set(doc.id, { ...this });
        return this;
      },
      enumerable: false,
      writable: true
    });

    Object.defineProperty(doc, 'toJSON', {
      value: function () {
        const copy = { ...this };
        delete copy._id;
        delete copy.__v;
        return copy;
      },
      enumerable: false,
      writable: true
    });

    return doc;
  }

  async find(query: any = {}): Promise<any> {
    const list: any[] = [];
    for (const item of this.items.values()) {
      if (matchesQuery(item, query)) {
        list.push(this.wrapDoc(item));
      }
    }

    const queryPromise: any = Promise.resolve(list);

    queryPromise.sort = (sortObj: any) => {
      const keys = Object.keys(sortObj || {});
      if (keys.length > 0) {
        const sortKey = keys[0];
        const sortDir = sortObj[sortKey] === -1 || sortObj[sortKey] === 'desc' ? -1 : 1;
        list.sort((a, b) => {
          const valA = a[sortKey];
          const valB = b[sortKey];
          if (valA < valB) return -1 * sortDir;
          if (valA > valB) return 1 * sortDir;
          return 0;
        });
      }
      return queryPromise;
    };

    queryPromise.skip = (skipCount: number) => {
      list.splice(0, skipCount);
      return queryPromise;
    };

    queryPromise.limit = (limitCount: number) => {
      list.splice(limitCount);
      return queryPromise;
    };

    queryPromise.select = () => queryPromise;
    queryPromise.lean = () => Promise.resolve(list.map(d => (d.toJSON ? d.toJSON() : d)));

    return queryPromise;
  }

  async findOne(query: any = {}): Promise<any> {
    for (const item of this.items.values()) {
      if (matchesQuery(item, query)) {
        return this.wrapDoc(item);
      }
    }
    return null;
  }

  async findById(id: string): Promise<any> {
    return this.findOne({ id });
  }

  async create(data: any | any[]): Promise<any> {
    if (Array.isArray(data)) {
      const createdList = [];
      for (const item of data) {
        const id = item.id || `id_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const doc = { ...item, id, createdAt: item.createdAt || new Date().toISOString() };
        this.items.set(id, doc);
        createdList.push(this.wrapDoc(doc));
      }
      return createdList;
    } else {
      const id = data.id || `id_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const doc = { ...data, id, createdAt: data.createdAt || new Date().toISOString() };
      this.items.set(id, doc);
      return this.wrapDoc(doc);
    }
  }

  async insertMany(docs: any[]): Promise<any> {
    return this.create(docs);
  }

  async findOneAndUpdate(query: any, update: any, options: any = {}): Promise<any> {
    let existing = await this.findOne(query);
    if (!existing) {
      if (options.upsert) {
        const newDoc = {
          ...query,
          ...(update.$set || update),
          id: query.id || query.key || `id_${Date.now()}`
        };
        return this.create(newDoc);
      }
      return null;
    }

    const updated = { ...existing };
    if (update.$set) {
      Object.assign(updated, update.$set);
    } else if (update.$inc) {
      for (const k of Object.keys(update.$inc)) {
        updated[k] = (updated[k] || 0) + update.$inc[k];
      }
    } else {
      Object.assign(updated, update);
    }

    if (update.$push) {
      for (const k of Object.keys(update.$push)) {
        if (!Array.isArray(updated[k])) updated[k] = [];
        updated[k].push(update.$push[k]);
      }
    }

    this.items.set(updated.id, updated);
    return options.new ? this.wrapDoc(updated) : existing;
  }

  async updateMany(query: any, update: any): Promise<any> {
    let modifiedCount = 0;
    for (const [id, item] of this.items.entries()) {
      if (matchesQuery(item, query)) {
        const updated = { ...item };
        if (update.$set) {
          Object.assign(updated, update.$set);
        } else {
          Object.assign(updated, update);
        }
        this.items.set(id, updated);
        modifiedCount++;
      }
    }
    return { modifiedCount, acknowledged: true };
  }

  async findOneAndDelete(query: any): Promise<any> {
    const existing = await this.findOne(query);
    if (existing) {
      this.items.delete(existing.id);
      return existing;
    }
    return null;
  }

  async countDocuments(query: any = {}): Promise<number> {
    let count = 0;
    for (const item of this.items.values()) {
      if (matchesQuery(item, query)) {
        count++;
      }
    }
    return count;
  }

  newInstance(data: any) {
    const id = data.id || `id_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const doc = { ...data, id, createdAt: data.createdAt || new Date().toISOString() };
    return this.wrapDoc(doc);
  }
}

// Global Memory Collections
export const memoryStore = {
  users: new MemoryCollection<any>('users'),
  accounts: new MemoryCollection<any>('accounts'),
  orders: new MemoryCollection<any>('orders'),
  walletTransactions: new MemoryCollection<any>('walletTransactions'),
  withdrawalRequests: new MemoryCollection<any>('withdrawalRequests'),
  mysteryBoxes: new MemoryCollection<any>('mysteryBoxes'),
  mysteryRewards: new MemoryCollection<any>('mysteryRewards'),
  mysteryHistories: new MemoryCollection<any>('mysteryHistories'),
  userInventories: new MemoryCollection<any>('userInventories'),
  conversations: new MemoryCollection<any>('conversations'),
  notifications: new MemoryCollection<any>('notifications'),
  reviews: new MemoryCollection<any>('reviews'),
  settings: new MemoryCollection<any>('settings'),
};

/**
 * Creates a smart model that delegates to Mongoose when connected to MongoDB Atlas,
 * or safely falls back to the in-memory collection when in standby/offline mode.
 */
export function createHybridModel<T>(mongooseModel: Model<any>, memoryCollection: MemoryCollection<any>): any {
  const handler: ProxyHandler<any> = {
    get(target, prop, receiver) {
      if (getDBConnectionStatus()) {
        const val = Reflect.get(mongooseModel, prop, mongooseModel);
        if (typeof val === 'function') {
          return val.bind(mongooseModel);
        }
        return val;
      }
      const memVal = (memoryCollection as any)[prop];
      if (typeof memVal === 'function') {
        return memVal.bind(memoryCollection);
      }
      return memVal;
    },
    construct(target, args) {
      if (getDBConnectionStatus()) {
        return new (mongooseModel as any)(...args);
      }
      return memoryCollection.newInstance(args[0]);
    },
    apply(target, thisArg, args) {
      if (getDBConnectionStatus()) {
        return (mongooseModel as any).apply(thisArg, args);
      }
      return memoryCollection.newInstance(args[0]);
    }
  };

  return new Proxy(mongooseModel, handler);
}

