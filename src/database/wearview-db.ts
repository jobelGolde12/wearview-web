import * as SQLite from 'expo-sqlite';

import type { SavedFittingSession } from '@/types/wearview';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync('wearview.db');
  }

  return databasePromise;
}

export async function initializeDatabase() {
  const db = await getDatabase();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS fitting_sessions (
      id TEXT PRIMARY KEY NOT NULL,
      capturedAt TEXT NOT NULL,
      imageUri TEXT NOT NULL,
      payload TEXT NOT NULL
    );
  `);
}

export async function saveSession(session: SavedFittingSession) {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO fitting_sessions (id, capturedAt, imageUri, payload) VALUES (?, ?, ?, ?)',
    session.id,
    session.capturedAt,
    session.imageUri,
    JSON.stringify(session)
  );
}

type SessionRow = {
  capturedAt: string;
  id: string;
  imageUri: string;
  payload: string;
};

export async function readSessions() {
  const db = await getDatabase();
  const rows = await db.getAllAsync<SessionRow>(
    'SELECT id, capturedAt, imageUri, payload FROM fitting_sessions ORDER BY capturedAt DESC'
  );

  return rows.map((row) => JSON.parse(row.payload) as SavedFittingSession);
}
