// src/controllers/analysisController.ts
import {
  getAllAnalyses as getAllAnalysesAPI,
  createAnalysis as createAnalysisAPI,
  deleteAnalysis as deleteAnalysisAPI,
} from '@/src/api/analysisClient';
import { useAnalysisStore } from '@/src/store/analysisStore';
import { CreateAnalysisPayload } from '@/src/types/aiAnalysisTypes';

export const fetchAllAnalyses = async (page: number = 1, limit: number = 20) => {
  try {
    console.log(`🔵 Fetching analyses - Page ${page}...`);
    
    if (page === 1) {
      useAnalysisStore.getState().setLoading(true);
    } else {
      useAnalysisStore.getState().setLoadingMore(true);
    }

    const response = await getAllAnalysesAPI(page, limit);
    console.log('✅ Analyses fetched:', response);

    if (response.success && response.analyses) {
      if (page === 1) {
        // First page - replace all
        useAnalysisStore.getState().setAnalyses(response.analyses, response.pagination);
      } else {
        // Additional pages - append
        useAnalysisStore.getState().appendAnalyses(response.analyses, response.pagination);
      }
    }

    return response;
  } catch (error) {
    console.error('❌ Error fetching analyses:', error);
    throw error;
  } finally {
    useAnalysisStore.getState().setLoading(false);
    useAnalysisStore.getState().setLoadingMore(false);
  }
};

export const loadMoreAnalyses = async () => {
  const { currentPage, hasMore, isLoadingMore } = useAnalysisStore.getState();
  
  if (!hasMore || isLoadingMore) {
    console.log('⏭️  No more analyses to load or already loading');
    return;
  }
  
  console.log(`🔵 Loading more analyses - Page ${currentPage + 1}...`);
  await fetchAllAnalyses(currentPage + 1, 20);
};

export const saveAnalysis = async (payload: CreateAnalysisPayload) => {
  try {
    console.log('🔵 Saving analysis to backend...');
    console.log('📤 Payload:', payload);

    const response = await createAnalysisAPI(payload);
    console.log('✅ Backend response:', response);

    if (response.success && response.analysis) {
      useAnalysisStore.getState().addAnalysis(response.analysis);
      console.log('✅ Analysis added to store with ID:', response.analysis.id);
    }

    return response;
  } catch (error) {
    console.error('❌ Error saving analysis:', error);
    throw error;
  }
};

export const deleteAnalysis = async (analysisId: string) => {
  try {
    console.log('🔵 Deleting analysis:', analysisId);

    const response = await deleteAnalysisAPI(analysisId);
    console.log('✅ Analysis deleted:', response);

    if (response.success) {
      useAnalysisStore.getState().removeAnalysis(analysisId);
    }

    return response;
  } catch (error) {
    console.error('❌ Error deleting analysis:', error);
    throw error;
  }
};

export const refreshAnalysesIfStale = async () => {
  const { lastFetched } = useAnalysisStore.getState();
  const FIVE_MINUTES = 5 * 60 * 1000;

  if (!lastFetched || Date.now() - lastFetched > FIVE_MINUTES) {
    console.log('🔄 Analysis data is stale, refreshing...');
    await fetchAllAnalyses(1, 20);
  }
};