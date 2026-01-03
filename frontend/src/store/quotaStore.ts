import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface QuotaData {
  limit: number; // -1 for unlimited
  used: number;
  remaining: number; // -1 for unlimited
  isPaid: boolean;
  resetTime: string | null;
  lastFetched: number | null; // timestamp
}

interface QuotaStore extends QuotaData {
  // Actions
  setQuotaData: (data: Partial<QuotaData>) => void;
  incrementUsed: () => void;
  resetQuota: () => void;
  
  // Computed
  canAnalyze: () => boolean;
  isUnlimited: () => boolean;
  getQuotaMessage: () => string;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

const initialState: QuotaData = {
  limit: 5,
  used: 0,
  remaining: 5,
  isPaid: false,
  resetTime: null,
  lastFetched: null,
};

export const useQuotaStore = create<QuotaStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      isLoading: false,

      // Setters
      setQuotaData: (data) => 
        set((state) => ({ 
          ...data,
          lastFetched: Date.now()
        })),

      incrementUsed: () =>
        set((state) => ({
          used: state.used + 1,
          remaining: state.isPaid ? -1 : Math.max(0, state.remaining - 1),
        })),

      resetQuota: () => set(initialState),

      setLoading: (loading) => set({ isLoading: loading }),

      // Computed
      canAnalyze: () => {
        const { isPaid, remaining } = get();
        return isPaid || remaining > 0;
       
      },

      isUnlimited: () => {
        const { isPaid, limit } = get();
        return isPaid || limit === -1;
      },

      getQuotaMessage: () => {
        const { isPaid, used, remaining, limit } = get();
        
        if (isPaid || limit === -1) {
          return `Unlimited analyses (${used} used today)`;
        }
        
        if (remaining === 0) {
          
          return 'Daily limit reached';
        }
        
        return `${remaining} of ${limit} analyses remaining today`;
      },
    }),
    {
      name: 'quota-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Selectors
export const useQuotaLimit = () => useQuotaStore((state) => state.limit);
export const useQuotaUsed = () => useQuotaStore((state) => state.used);
export const useQuotaRemaining = () => useQuotaStore((state) => state.remaining);
export const useIsPaid = () => useQuotaStore((state) => state.isPaid);
export const useCanAnalyze = () => useQuotaStore((state) => state.canAnalyze());
export const useIsUnlimited = () => useQuotaStore((state) => state.isUnlimited());
export const useQuotaMessage = () => useQuotaStore((state) => state.getQuotaMessage());