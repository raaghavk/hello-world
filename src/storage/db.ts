import { openDB, IDBPDatabase, DBSchema } from 'idb';
import { Recording } from '../types';

interface DesiAIDB extends DBSchema {
  recordings: {
    key: string;
    value: Recording;
    indexes: {
      'by-created': number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<DesiAIDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<DesiAIDB>> {
  if (!dbPromise) {
    dbPromise = openDB<DesiAIDB>('desi-ai-notetaker', 1, {
      upgrade(db) {
        const store = db.createObjectStore('recordings', { keyPath: 'id' });
        store.createIndex('by-created', 'createdAt');
      },
    });
  }
  return dbPromise;
}
