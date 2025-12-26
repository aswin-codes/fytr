import { useEffect, useState } from 'react';
import { initializeDatabase } from '@/src/db/schema';

/**
 * Hook to initialize database schema ONLY (no sync)
 * Sync will happen after login
 */
export const useAppInitialization = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('🚀 Initializing database schema...');

        // Only initialize database tables
        await initializeDatabase();

        setIsReady(true);
        console.log('✅ Database schema ready');
      } catch (err) {
        console.error('❌ Database initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Database initialization failed');
        setIsReady(true); // Still mark as ready to show error screen
      }
    };

    initialize();
  }, []);

  return { isReady, error };
};