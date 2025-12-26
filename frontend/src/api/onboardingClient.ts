import { apiClient } from "./client";
import { OnboardingPayload, OnboardingDataResponse } from "../types/onboardingTypes";



/**
 * Update all onboarding data (body metrics, activity level, goal, nutrition targets)
 * Supports partial updates - you can send only the fields you want to update
 */
export const updateOnboarding = async (payload: OnboardingPayload) => {
  try {
    const res = await apiClient.put('/onboarding', payload);
    return res.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user's complete onboarding data
 */
export const getOnboardingData = async (): Promise<OnboardingDataResponse> => {
  try {
    const res = await apiClient.get('/onboarding');
    return res.data;
  } catch (error) {
    throw error;
  }
};