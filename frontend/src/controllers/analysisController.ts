import {
  getAllAnalyses,
  createAnalysis as createAnalysisAPI,
  deleteAnalysis as deleteAnalysisAPI,
} from '@/src/api/analysisClient';
import { useAnalysisStore } from '@/src/store/analysisStore';
import { CreateAnalysisPayload } from '@/src/types/aiAnalysisTypes';

export const fetchAllAnalyses = async () => {
  try {
    console.log('🔵 Fetching all analyses...');
    useAnalysisStore.getState().setLoading(true);

    const response = await getAllAnalyses();
    console.log('✅ Analyses fetched:', response);

    if (response.success && response.analyses) {
      useAnalysisStore.getState().setAnalyses(response.analyses);
    }

    return response;
  } catch (error) {
    console.error('❌ Error fetching analyses:', error);
    throw error;
  } finally {
    useAnalysisStore.getState().setLoading(false);
  }
};

export const saveAnalysis = async (payload: CreateAnalysisPayload) => {
  try {
    console.log('🔵 ===== SAVING ANALYSIS =====');
    console.log('📤 Payload being sent to backend:');
    console.log(JSON.stringify(payload, null, 2));

    const response = await createAnalysisAPI(payload);
    
    console.log('📥 Response from backend:');
    console.log(JSON.stringify(response, null, 2));

    if (response.success && response.analysis) {
      console.log('✅ Analysis ID from backend:', response.analysis.id);
      console.log('✅ Video URL in response:', response.analysis.videoUrl);
      console.log('✅ Duration in response:', response.analysis.durationSeconds);
      
      useAnalysisStore.getState().addAnalysis(response.analysis);
    }
    
    console.log('🔵 ===== SAVE COMPLETE =====');

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
      // Remove from local store
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
    await fetchAllAnalyses();
  }
};