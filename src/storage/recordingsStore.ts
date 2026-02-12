import { getDB } from './db';
import { Recording } from '../types';

export async function getAllRecordings(): Promise<Recording[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('recordings', 'by-created');
  return all.reverse(); // newest first
}

export async function getRecording(id: string): Promise<Recording | undefined> {
  const db = await getDB();
  return db.get('recordings', id);
}

export async function saveRecording(recording: Recording): Promise<void> {
  const db = await getDB();
  await db.put('recordings', recording);
}

export async function updateRecording(
  id: string,
  updates: Partial<Recording>
): Promise<void> {
  const db = await getDB();
  const existing = await db.get('recordings', id);
  if (!existing) return;
  await db.put('recordings', { ...existing, ...updates });
}

export async function deleteRecording(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('recordings', id);
}
