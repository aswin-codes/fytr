// src/store/analysisStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AiAnalysis } from '../types/aiAnalysisTypes';

interface AnalysisStore {
  analyses: AiAnalysis[];
  isLoading: boolean;
  isLoadingMore: boolean;
  lastFetched: number | null;
  currentPage: number;
  totalPages: number;
  totalAnalyses: number;
  hasMore: boolean;
  
  // Actions
  setAnalyses: (analyses: AiAnalysis[], pagination?: any) => void;
  appendAnalyses: (analyses: AiAnalysis[], pagination: any) => void;
  addAnalysis: (analysis: AiAnalysis) => void;
  removeAnalysis: (analysisId: string) => void;
  updateAnalysis: (analysisId: string, updates: Partial<AiAnalysis>) => void;
  clearAnalyses: () => void;
  setLoading: (loading: boolean) => void;
  setLoadingMore: (loading: boolean) => void;
  resetPagination: () => void;
  
  // Computed
  getAnalysisById: (id: string) => AiAnalysis | undefined;
  getRecentAnalyses: (count?: number) => AiAnalysis[];
  getTotalAnalyses: () => number;
  getAverageScore: () => number;
  getAllAnalyses: () => AiAnalysis[];
}

const initialState = {
  analyses: [],
  isLoading: false,
  isLoadingMore: false,
  lastFetched: null,
  currentPage: 1,
  totalPages: 1,
  totalAnalyses: 0,
  hasMore: false,
};

export const useAnalysisStore = create<AnalysisStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Setters
      setAnalyses: (analyses, pagination) => {
        const sorted = analyses.sort(
          (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
        );
        
        set({
          analyses: sorted,
          lastFetched: Date.now(),
          currentPage: pagination?.page || 1,
          totalPages: pagination?.totalPages || 1,
          totalAnalyses: pagination?.total || analyses.length,
          hasMore: pagination ? pagination.page < pagination.totalPages : false,
        });
      },

      appendAnalyses: (newAnalyses, pagination) => {
        const current = get().analyses;
        const combined = [...current, ...newAnalyses];
        
        // Remove duplicates by id
        const unique = combined.filter((item, index, self) =>
          index === self.findIndex((t) => t.id === item.id)
        );
        
        const sorted = unique.sort(
          (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
        );
        
        set({
          analyses: sorted,
          currentPage: pagination.page,
          totalPages: pagination.totalPages,
          totalAnalyses: pagination.total,
          hasMore: pagination.page < pagination.totalPages,
        });
      },

      addAnalysis: (analysis) => {
        set((state) => ({
          analyses: [analysis, ...state.analyses],
          totalAnalyses: state.totalAnalyses + 1,
        }));
      },

      removeAnalysis: (analysisId) =>
        set((state) => ({
          analyses: state.analyses.filter((a) => a.id !== analysisId),
          totalAnalyses: state.totalAnalyses - 1,
        })),

      updateAnalysis: (analysisId, updates) =>
        set((state) => ({
          analyses: state.analyses.map((a) =>
            a.id === analysisId ? { ...a, ...updates } : a
          ),
        })),

      clearAnalyses: () => set(initialState),

      setLoading: (loading) => set({ isLoading: loading }),
      
      setLoadingMore: (loading) => set({ isLoadingMore: loading }),

      resetPagination: () => set({
        currentPage: 1,
        totalPages: 1,
        hasMore: false,
      }),

      // Computed
      getAnalysisById: (id) => {
        return get().analyses.find((a) => a.id === id);
      },

      getRecentAnalyses: (count = 3) => {
        return get().analyses.slice(0, count);
      },

      getTotalAnalyses: () => {
        return get().totalAnalyses;
      },

      getAverageScore: () => {
        const analyses = get().analyses;
        if (analyses.length === 0) return 0;
        const total = analyses.reduce((sum, a) => sum + a.score, 0);
        return Math.round(total / analyses.length);
      },

      getAllAnalyses: () => {
        return get().analyses;
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
export const useIsLoadingMore = () => useAnalysisStore((state) => state.isLoadingMore);
export const useHasMore = () => useAnalysisStore((state) => state.hasMore);
export const useRecentAnalyses = (count?: number) =>
  useAnalysisStore((state) => state.getRecentAnalyses(count));