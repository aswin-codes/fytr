import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AiAnalysis } from '../types/aiAnalysisTypes';

interface AnalysisStore {
  analyses: AiAnalysis[];
  isLoading: boolean;
  lastFetched: number | null;
  
  // Actions
  setAnalyses: (analyses: AiAnalysis[]) => void;
  addAnalysis: (analysis: AiAnalysis) => void;
  removeAnalysis: (analysisId: string) => void;
  updateAnalysis: (analysisId: string, updates: Partial<AiAnalysis>) => void;
  clearAnalyses: () => void;
  setLoading: (loading: boolean) => void;
  
  // Computed
  getAnalysisById: (id: string) => AiAnalysis | undefined;
  getRecentAnalyses: (count?: number) => AiAnalysis[];
  getTotalAnalyses: () => number;
  getAverageScore: () => number;
}

const initialState = {
  analyses: [],
  isLoading: false,
  lastFetched: null,
};

export const useAnalysisStore = create<AnalysisStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Setters
      setAnalyses: (analyses) =>
        set({
          analyses: analyses.sort(
            (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
          ),
          lastFetched: Date.now(),
        }),

      addAnalysis: (analysis) =>
        set((state) => ({
          analyses: [analysis, ...state.analyses],
        })),

      removeAnalysis: (analysisId) =>
        set((state) => ({
          analyses: state.analyses.filter((a) => a.id !== analysisId),
        })),

      updateAnalysis: (analysisId, updates) =>
        set((state) => ({
          analyses: state.analyses.map((a) =>
            a.id === analysisId ? { ...a, ...updates } : a
          ),
        })),

      clearAnalyses: () => set(initialState),

      setLoading: (loading) => set({ isLoading: loading }),

      // Computed
      getAnalysisById: (id) => {
        return get().analyses.find((a) => a.id === id);
      },

      getRecentAnalyses: (count = 3) => {
        return get().analyses.slice(0, count);
      },

      getTotalAnalyses: () => {
        return get().analyses.length;
      },

      getAverageScore: () => {
        const analyses = get().analyses;
        if (analyses.length === 0) return 0;
        const total = analyses.reduce((sum, a) => sum + a.score, 0);
        return Math.round(total / analyses.length);
      },
    }),
    {
      name: 'analysis-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Selectors
export const useAnalyses = () => useAnalysisStore((state) => state.analyses);
export const useIsLoadingAnalyses = () => useAnalysisStore((state) => state.isLoading);
export const useRecentAnalyses = (count?: number) =>
  useAnalysisStore((state) => state.getRecentAnalyses(count));