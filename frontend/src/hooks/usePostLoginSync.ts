import { useEffect, useState } from 'react';
import { syncExercises } from '../controllers/exerciseSyncController';

/**
 * Hook to sync exercises after user logs in
 * Call this in your home screen or main app layout after auth
 */
export const usePostLoginSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    performSync();
  }, []);

  const performSync = async () => {
    try {
      setIsSyncing(true);
      console.log('🔄 Starting post-login exercise sync...');

      const result = await syncExercises();

      if (result.success) {
        if (result.synced) {
          console.log(`✅ Synced ${result.count} exercises`);
        } else {
          console.log('✅ Exercises already up-to-date');
        }
        setSyncComplete(true);
      } else {
        console.warn('⚠️ Sync failed:', result.error);
        setSyncError(result.error || 'Sync failed');
        // Still mark as complete so user can use cached data
        setSyncComplete(true);
      }
    } catch (error) {
      console.error('❌ Post-login sync error:', error);
      setSyncError(error instanceof Error ? error.message : 'Unknown error');
      setSyncComplete(true);
    } finally {
      setIsSyncing(false);
    }
  };

  const retry = () => {
    setSyncError(null);
    setSyncComplete(false);
    performSync();
  };

  return {
    isSyncing,
    syncComplete,
    syncError,
    retry,
  };
};