import { checkQuota, getQuotaStatus, incrementQuota } from '@/src/api/quotaClient';
import { useQuotaStore } from '@/src/store/quotaStore';

export const fetchQuotaStatus = async () => {
  try {
    console.log('🔵 Fetching quota status...');
    useQuotaStore.getState().setLoading(true);
    
    const response = await getQuotaStatus();
    console.log('✅ Quota status fetched:', response);
    
    useQuotaStore.getState().setQuotaData({
      limit: response.limit,
      used: response.used,
      remaining: response.remaining,
      isPaid: response.isPaid,
      resetTime: response.resetTime,
    });
    
    return response;
  } catch (error) {
    console.error('❌ Error fetching quota status:', error);
    throw error;
  } finally {
    useQuotaStore.getState().setLoading(false);
  }
};

export const checkUserQuota = async (): Promise<boolean> => {
  try {
    console.log('🔵 Checking user quota...');
    
    const response = await checkQuota();
    console.log('✅ Quota check result:', response);
    
    useQuotaStore.getState().setQuotaData({
      limit: response.limit,
      used: response.used,
      remaining: response.remaining,
      isPaid: response.isPaid,
      resetTime: response.resetTime,
    });
    
    return response.allowed;
  } catch (error) {
    console.error('❌ Error checking quota:', error);
    throw error;
  }
};

export const incrementUserQuota = async () => {
  try {
    console.log('🔵 Incrementing user quota...');
    
    const response = await incrementQuota();
    console.log('✅ Quota incremented:', response);
    
    useQuotaStore.getState().setQuotaData({
      limit: response.limit,
      used: response.used,
      remaining: response.remaining,
      isPaid: response.isPaid,
    });
    
    return response;
  } catch (error) {
    console.error('❌ Error incrementing quota:', error);
    throw error;
  }
};

// Helper to refresh quota if stale (older than 5 minutes)
export const refreshQuotaIfStale = async () => {
  const { lastFetched } = useQuotaStore.getState();
  const FIVE_MINUTES = 5 * 60 * 1000;
  
  if (!lastFetched || Date.now() - lastFetched > FIVE_MINUTES) {
    console.log('🔄 Quota data is stale, refreshing...');
    await fetchQuotaStatus();
  }
};