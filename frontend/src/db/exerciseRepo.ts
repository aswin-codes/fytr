import { getDatabase } from './index';
import { Exercise } from '../types/exerciseTypes';


/**
 * Serializes array fields to JSON for SQLite storage
 */
const serializeExercise = (exercise: Exercise) => ({
  ...exercise,
  primary_muscles: JSON.stringify(exercise.primary_muscles),
  secondary_muscles: exercise.secondary_muscles ? JSON.stringify(exercise.secondary_muscles) : null,
  instructions: JSON.stringify(exercise.instructions),
  image_urls: JSON.stringify(exercise.image_urls),
});

/**
 * Deserializes JSON fields back to arrays
 */
const deserializeExercise = (row: any): Exercise => ({
  ...row,
  primary_muscles: JSON.parse(row.primary_muscles),
  secondary_muscles: row.secondary_muscles ? JSON.parse(row.secondary_muscles) : null,
  instructions: JSON.parse(row.instructions),
  image_urls: JSON.parse(row.image_urls),
});

/**
 * Inserts exercises in bulk (optimized for 800+ records)
 * Uses transaction for atomicity and speed
 */
export const bulkInsertExercises = async (exercises: Exercise[]): Promise<void> => {
  const db = getDatabase();

  try {
    // Clear existing exercises
    await db.runAsync('DELETE FROM exercises');

    // Use transaction for bulk insert (much faster)
    await db.withTransactionAsync(async () => {
      const insertStmt = await db.prepareAsync(`
        INSERT OR REPLACE INTO exercises 
        (id, name, force, level, mechanic, equipment, category, primary_muscles, secondary_muscles, instructions, image_urls)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const exercise of exercises) {
        const serialized = serializeExercise(exercise);
        await insertStmt.executeAsync([
          serialized.id,
          serialized.name,
          serialized.force,
          serialized.level,
          serialized.mechanic,
          serialized.equipment,
          serialized.category,
          serialized.primary_muscles,
          serialized.secondary_muscles,
          serialized.instructions,
          serialized.image_urls,
        ]);
      }

      await insertStmt.finalizeAsync();
    });

    console.log(`✅ Inserted ${exercises.length} exercises`);
  } catch (error) {
    console.error('❌ Bulk insert failed:', error);
    throw error;
  }
};

/**
 * Gets all exercises (used for explore screen)
 */
export const getAllExercises = async (): Promise<Exercise[]> => {
  const db = getDatabase();

  try {
    const rows = await db.getAllAsync('SELECT * FROM exercises ORDER BY name ASC');
    return rows.map(deserializeExercise);
  } catch (error) {
    console.error('❌ Failed to get exercises:', error);
    throw error;
  }
};

/**
 * Gets a single exercise by ID
 */
export const getExerciseById = async (id: string): Promise<Exercise | null> => {
  const db = getDatabase();

  try {
    const row = await db.getFirstAsync('SELECT * FROM exercises WHERE id = ?', [id]);
    return row ? deserializeExercise(row) : null;
  } catch (error) {
    console.error('❌ Failed to get exercise:', error);
    throw error;
  }
};

/**
 * Searches exercises by name (case-insensitive)
 */
export const searchExercises = async (query: string): Promise<Exercise[]> => {
  const db = getDatabase();

  try {
    const rows = await db.getAllAsync(
      'SELECT * FROM exercises WHERE name LIKE ? ORDER BY name ASC',
      [`%${query}%`]
    );
    return rows.map(deserializeExercise);
  } catch (error) {
    console.error('❌ Search failed:', error);
    throw error;
  }
};

/**
 * Filters exercises by multiple criteria
 */
export const filterExercises = async (filters: {
  category?: string;
  equipment?: string;
  level?: string;
  primaryMuscle?: string;
}): Promise<Exercise[]> => {
  const db = getDatabase();

  try {
    let query = 'SELECT * FROM exercises WHERE 1=1';
    const params: any[] = [];

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.equipment) {
      query += ' AND equipment = ?';
      params.push(filters.equipment);
    }

    if (filters.level) {
      query += ' AND level = ?';
      params.push(filters.level);
    }

    // Search within JSON array (SQLite JSON functions)
    if (filters.primaryMuscle) {
      query += ' AND primary_muscles LIKE ?';
      params.push(`%"${filters.primaryMuscle}"%`);
    }

    query += ' ORDER BY name ASC';

    const rows = await db.getAllAsync(query, params);
    return rows.map(deserializeExercise);
  } catch (error) {
    console.error('❌ Filter failed:', error);
    throw error;
  }
};

/**
 * Gets the count of exercises in the database
 */
export const getExerciseCount = async (): Promise<number> => {
  const db = getDatabase();

  try {
    const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM exercises');
    return result?.count || 0;
  } catch (error) {
    console.error('❌ Failed to get count:', error);
    return 0;
  }
};

/**
 * Gets unique filter options for UI (muscles, equipment, etc.)
 */
export const getFilterOptions = async () => {
  const db = getDatabase();

  try {
    const categories = await db.getAllAsync<{ category: string }>(
      'SELECT DISTINCT category FROM exercises WHERE category IS NOT NULL ORDER BY category'
    );

    const equipment = await db.getAllAsync<{ equipment: string }>(
      'SELECT DISTINCT equipment FROM exercises WHERE equipment IS NOT NULL ORDER BY equipment'
    );

    const levels = await db.getAllAsync<{ level: string }>(
      'SELECT DISTINCT level FROM exercises WHERE level IS NOT NULL ORDER BY level'
    );

    return {
      categories: categories.map(r => r.category),
      equipment: equipment.map(r => r.equipment),
      levels: levels.map(r => r.level),
    };
  } catch (error) {
    console.error('❌ Failed to get filter options:', error);
    return { categories: [], equipment: [], levels: [] };
  }
};

// ==================== META OPERATIONS ====================

/**
 * Gets metadata value (e.g., version)
 */
export const getMeta = async (key: string): Promise<string | null> => {
  const db = getDatabase();

  try {
    const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM meta WHERE key = ?', [key]);
    return row?.value || null;
  } catch (error) {
    console.error('❌ Failed to get meta:', error);
    return null;
  }
};

/**
 * Sets metadata value
 */
export const setMeta = async (key: string, value: string): Promise<void> => {
  const db = getDatabase();

  try {
    await db.runAsync(
      'INSERT OR REPLACE INTO meta (key, value, updated_at) VALUES (?, ?, ?)',
      [key, value, Math.floor(Date.now() / 1000)]
    );
  } catch (error) {
    console.error('❌ Failed to set meta:', error);
    throw error;
  }
};