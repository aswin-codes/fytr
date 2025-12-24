import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface OnboardingData {
  gender: 'male' | 'female' | null;
  age: string | null;
  height: string | null;
  weight: string | null;
  targetWeight: string | null;

  goalType: 'lose-weight' | 'maintain' | 'gain-muscle' | null;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active' | 'athlete' | null;

  dietaryPreferences: string[];
  mealsPerDay: number | null;

  // Calculated nutrition targets
  macroTargets: MacroTargets | null;

  isCompleted: boolean;
  currentStep: number;
}

interface OnboardingStore extends OnboardingData {
  // Actions
  setGender: (gender: OnboardingData['gender']) => void;
  setAge: (age: string | null) => void;
  setHeight: (height: string | null) => void;
  setWeight: (weight: string | null) => void;
  setGoalType: (goalType: OnboardingData['goalType']) => void;
  setTargetWeight: (targetWeight: string | null) => void;
  setActivityLevel: (activityLevel: OnboardingData['activityLevel']) => void;
  setDietaryPreferences: (preferences: string[]) => void;
  setMealsPerDay: (meals: number) => void;

  // Navigation
  nextStep: () => void;
  previousStep: () => void;
  setCurrentStep: (step: number) => void;

  // Utility
  completeOnboarding: () => void;
  resetOnboarding: () => void;

  // Computed
  getDailyCalories: () => number | null;
  calculateAndSetMacros: () => void;
}

const initialState: OnboardingData = {
  gender: null,
  age: null,
  height: null,
  weight: null,
  goalType: null,
  targetWeight: null,
  activityLevel: null,
  dietaryPreferences: [],
  mealsPerDay: 3,
  macroTargets: null,
  isCompleted: false,
  currentStep: 0,
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Setters
      setGender: (gender) => set({ gender }),
      setAge: (age) => set({ age }),
      setHeight: (height: string | null) => set({ height }),
      setWeight: (weight: string | null) => set({ weight }),
      setTargetWeight: (targetWeight: string | null) => set({ targetWeight }),
      setGoalType: (goalType) => set({ goalType }),
      setActivityLevel: (activityLevel) => set({ activityLevel }),
      setDietaryPreferences: (preferences) => set({ dietaryPreferences: preferences }),
      setMealsPerDay: (meals) => set({ mealsPerDay: meals }),

      // Navigation
      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      previousStep: () =>
        set((state) => ({
          currentStep: Math.max(0, state.currentStep - 1),
        })),
      setCurrentStep: (step) => set({ currentStep: step }),

      // Utility
      completeOnboarding: () => set({ isCompleted: true }),
      resetStatus: () => set({ isCompleted: false }),
      resetOnboarding: () => set(initialState),

      // Calculate daily calories using Mifflin-St Jeor Equation
      getDailyCalories: () => {
        const { gender, age, height, weight, activityLevel, goalType } = get();

        if (!gender || !age || !height || !weight || !activityLevel) {
          return null;
        }

        const ageNum = parseFloat(age);
        const heightNum = parseFloat(height);
        const weightNum = parseFloat(weight);

        if (isNaN(ageNum) || isNaN(heightNum) || isNaN(weightNum)) {
          return null;
        }

        // BMR calculation
        let bmr: number;
        if (gender === 'male') {
          bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
        } else if (gender === 'female') {
          bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
        } else {
          // Use average for prefer-not-to-say
          bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 78;
        }

        // Activity multiplier
        const activityMultipliers = {
          sedentary: 1.2,
          light: 1.375,
          moderate: 1.55,
          active: 1.725,
          'very-active': 1.9,
          athlete: 1.9,
        };

        let tdee = bmr * activityMultipliers[activityLevel];

        // Adjust based on goal
        if (goalType === 'lose-weight') {
          tdee -= 500; // 500 calorie deficit
        } else if (goalType === 'gain-muscle') {
          tdee += 300; // 300 calorie surplus
        }

        return Math.round(tdee);
      },

      // Calculate and set macro targets
      calculateAndSetMacros: () => {
        const dailyCalories = get().getDailyCalories();
        const { goalType } = get();

        if (!dailyCalories || !goalType) {
          return;
        }

        // Define macro ratios based on goal
        const macroRatios = {
          'lose-weight': { protein: 0.4, carbs: 0.3, fat: 0.3 },
          'gain-muscle': { protein: 0.3, carbs: 0.4, fat: 0.3 },
          maintain: { protein: 0.3, carbs: 0.35, fat: 0.35 },
        };

        const ratio = macroRatios[goalType];

        // Calculate calories per macro
        const proteinCalories = dailyCalories * ratio.protein;
        const carbsCalories = dailyCalories * ratio.carbs;
        const fatCalories = dailyCalories * ratio.fat;

        // Convert to grams (protein: 4 cal/g, carbs: 4 cal/g, fat: 9 cal/g)
        const protein = Math.round(proteinCalories / 4);
        const carbs = Math.round(carbsCalories / 4);
        const fat = Math.round(fatCalories / 9);

        // Calculate fiber (14g per 1000 kcal)
        const fiber = Math.round((14 * dailyCalories) / 1000);

        set({
          macroTargets: {
            calories: dailyCalories,
            protein,
            carbs,
            fat,
            fiber,
          },
        });
      },
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Selectors for better performance
export const useGender = () => useOnboardingStore((state) => state.gender);
export const useAge = () => useOnboardingStore((state) => state.age);
export const useHeight = () => useOnboardingStore((state) => state.height);
export const useWeight = () => useOnboardingStore((state) => state.weight);
export const useGoalType = () => useOnboardingStore((state) => state.goalType);
export const useCurrentStep = () => useOnboardingStore((state) => state.currentStep);
export const useIsCompleted = () => useOnboardingStore((state) => state.isCompleted);
export const useMacroTargets = () => useOnboardingStore((state) => state.macroTargets);

