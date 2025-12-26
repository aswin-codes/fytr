import { openDatabase } from './index';

/**
 * Creates all required tables for the app
 * Run this once on app initialization
 */
export const initializeDatabase = async (): Promise<void> => {
  const db = await openDatabase();

  try {
    // Create exercises table
    // Arrays are stored as JSON strings (SQLite doesn't support arrays natively)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS exercises (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        force TEXT,
        level TEXT,
        mechanic TEXT,
        equipment TEXT,
        category TEXT,
        primary_muscles TEXT,
        secondary_muscles TEXT,
        instructions TEXT,
        image_urls TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      );
    `);

    // Create indexes for faster queries
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(name);
      CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
      CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON exercises(equipment);
      CREATE INDEX IF NOT EXISTS idx_exercises_level ON exercises(level);
    `);

    // Create metadata table for versioning
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL,
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      );
    `);

    console.log('✅ Database schema initialized');
  } catch (error) {
    console.error('❌ Failed to initialize schema:', error);
    throw error;
  }
};

/**
 * Drops all tables (use only for development/testing)
 */
export const resetDatabase = async (): Promise<void> => {
  const db = await openDatabase();
  
  try {
    await db.execAsync(`
      DROP TABLE IF EXISTS exercises;
      DROP TABLE IF EXISTS meta;
    `);
    
    console.log('✅ Database reset complete');
    await initializeDatabase();
  } catch (error) {
    console.error('❌ Failed to reset database:', error);
    throw error;
  }
};