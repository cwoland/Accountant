import type { TxBody } from '../api/endpoints';

const DB_NAME = 'accountant-offline';
const DB_VERSION = 2;
const STORE = 'pending-transactions';

export interface QueuedTransaction extends TxBody {
  id?: number;
  queuedAt: string;
  attempts: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  dbPromise ??= new Promise((resolve, reject) => {
    if (!('indexedDB' in globalThis)) {
      reject(new Error('IndexedDB недоступна'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('Не удалось открыть IndexedDB'));
    req.onblocked = () => reject(new Error('IndexedDB заблокирована другой вкладкой'));
  });
  return dbPromise;
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>) {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = run(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error ?? new Error('Ошибка IndexedDB'));
      }),
  );
}

export async function enqueue(data: TxBody): Promise<number | null> {
  try {
    return await tx<IDBValidKey>('readwrite', (s) =>
      s.add({ ...data, queuedAt: new Date().toISOString(), attempts: 0 }),
    ).then(Number);
  } catch {
    return null;
  }
}

export async function listQueue(): Promise<QueuedTransaction[]> {
  try {
    return await tx<QueuedTransaction[]>('readonly', (s) => s.getAll());
  } catch {
    return [];
  }
}

export async function dequeue(id: number): Promise<void> {
  try {
    await tx<undefined>('readwrite', (s) => s.delete(id));
  } catch {
    //
  }
}

export async function markAttempt(item: QueuedTransaction): Promise<void> {
  if (item.id === undefined) return;
  try {
    await tx<IDBValidKey>('readwrite', (s) =>
      s.put({ ...item, attempts: item.attempts + 1 }),
    );
  } catch {
    /* ignore */
  }
}

export async function queueSize(): Promise<number> {
  try {
    return await tx<number>('readonly', (s) => s.count());
  } catch {
    return 0;
  }
}