import { fetchExerciseVersion, fetchExercises } from '../api/exerciseClient';
import { getMeta, setMeta, bulkInsertExercises, getExerciseCount } from '../db/exerciseRepo';
import { Exercise } from '../types/exerciseTypes';

const VERSION_KEY = 'exercise_version';

/**
 * Checks if local database is up-to-date with backend
 */
export const checkSyncRequired = async (): Promise<boolean> => {
  try {
    const localVersion = await getMeta(VERSION_KEY);
    const remoteVersion = await fetchExerciseVersion();

    console.log(`📊 Local version: ${localVersion || 'none'}, Remote version: ${remoteVersion}`);

    return localVersion !== remoteVersion;
  } catch (error) {
    console.error('❌ Failed to check sync:', error);
    // If check fails, assume sync is needed to be safe
    return true;
  }
};

/**
 * Syncs exercises from backend to local SQLite
 * Only syncs if version mismatch detected
 */
export const syncExercises = async (): Promise<{
  success: boolean;
  synced: boolean;
  count?: number;
  error?: string;
}> => {
  try {
    // Check if sync is needed
    const syncRequired = await checkSyncRequired();

    if (!syncRequired) {
      const count = await getExerciseCount();
      console.log('✅ Already up-to-date, skipping sync');
      return { success: true, synced: false, count };
    }

    console.log('🔄 Starting exercise sync...');

    // Fetch exercises from backend
    const response = await fetchExercises();

    if (!response.success || !response.data) {
      throw new Error('Invalid response from server');
    }

    // Transform API data to match our Exercise interface
    const exercises: Exercise[] = response.data.map((item: any) => ({
      id: item.id,
      name: item.name,
      force: item.force,
      level: item.level,
      mechanic: item.mechanic,
      equipment: item.equipment,
      category: item.category,
      primary_muscles: item.primary_muscles || [],
      secondary_muscles: item.secondary_muscles || null,
      instructions: item.instructions || [],
      image_urls: item.image_urls || [],
    }));

    // Bulk insert into SQLite
    await bulkInsertExercises(exercises);

    // Update local version
    await setMeta(VERSION_KEY, response.version);

    console.log(`✅ Sync complete: ${exercises.length} exercises`);

    return {
      success: true,
      synced: true,
      count: exercises.length,
    };
  } catch (error) {
    console.error('❌ Sync failed:', error);
    return {
      success: false,
      synced: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Forces a sync regardless of version
 * Useful for manual refresh
 */
export const forceSyncExercises = async (): Promise<{
  success: boolean;
  count?: number;
  error?: string;
}> => {
  try {
    console.log('🔄 Force syncing exercises...');

    const response = await fetchExercises();

    if (!response.success || !response.data) {
      throw new Error('Invalid response from server');
    }

    const exercises: Exercise[] = response.data.map((item: any) => ({
      id: item.id,
      name: item.name,
      force: item.force,
      level: item.level,
      mechanic: item.mechanic,
      equipment: item.equipment,
      category: item.category,
      primary_muscles: item.primary_muscles || [],
      secondary_muscles: item.secondary_muscles || null,
      instructions: item.instructions || [],
      image_urls: item.image_urls || [],
    }));

    await bulkInsertExercises(exercises);
    await setMeta(VERSION_KEY, response.version);

    console.log(`✅ Force sync complete: ${exercises.length} exercises`);

    return {
      success: true,
      count: exercises.length,
    };
  } catch (error) {
    console.error('❌ Force sync failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};