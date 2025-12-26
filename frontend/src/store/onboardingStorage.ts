import { storage } from './asyncStorage';
import { STORAGE_KEYS } from './keys';
import { BodyMetrics, NutritionTargets, OnboardingDataResponse } from '@/src/types/onboardingTypes';

// Use the OnboardingDataType from the API response
export type OnboardingDataType = OnboardingDataResponse['data'];

export const onboardingStorage = {
  async saveOnboardingData(data: OnboardingDataType) {
    await storage.set(STORAGE_KEYS.ONBOARDING_DATA, data);
  },

  async getOnboardingData(): Promise<OnboardingDataType | null> {
    return await storage.get<OnboardingDataType>(STORAGE_KEYS.ONBOARDING_DATA);
  },

  async clearOnboardingData() {
    await storage.remove(STORAGE_KEYS.ONBOARDING_DATA);
  },

  // Save individual parts of onboarding data
  async saveBodyMetrics(bodyMetrics: BodyMetrics) {
    const existingData = await this.getOnboardingData();
    if (existingData) {
      existingData.body_metrics = bodyMetrics;
      await this.saveOnboardingData(existingData);
    }
  },

  async saveActivityLevel(activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active' | 'athlete') {
    const existingData = await this.getOnboardingData();
    if (existingData) {
      existingData.activity_level = activityLevel;
      await this.saveOnboardingData(existingData);
    }
  },

  async saveGoalType(goalType: 'lose-weight' | 'gain-muscle' | 'maintain') {
    const existingData = await this.getOnboardingData();
    if (existingData) {
      existingData.goal_type = goalType;
      await this.saveOnboardingData(existingData);
    }
  },

  async saveNutritionTargets(nutritionTargets: NutritionTargets) {
    const existingData = await this.getOnboardingData();
    if (existingData) {
      existingData.nutrition_targets = nutritionTargets;
      await this.saveOnboardingData(existingData);
    }
  },

  // Check if onboarding is completed
  async isOnboardingCompleted(): Promise<boolean> {
    const data = await this.getOnboardingData();
    return data?.onboarding_completed ?? false;
  },
};