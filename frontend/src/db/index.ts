import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Opens the SQLite database connection
 * Uses singleton pattern to avoid multiple connections
 * Safe for Expo Go, emulators, and physical devices
 */
export const openDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) {
    return db;
  }

  try {
    db = await SQLite.openDatabaseAsync('fytr.db');
    console.log('✅ Database opened successfully');
    return db;
  } catch (error) {
    console.error('❌ Failed to open database:', error);
    throw error;
  }
};

/**
 * Closes the database connection
 * Call this only when app is terminating (rarely needed)
 */
export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.closeAsync();
    db = null;
    console.log('✅ Database closed');
  }
};

export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    throw new Error('Database not initialized. Call openDatabase() first.');
  }
  return db;
};