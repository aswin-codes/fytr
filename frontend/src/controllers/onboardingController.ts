import { updateOnboarding, getOnboardingData,  } from "@/src/api/onboardingClient";
import { userStorage } from "@/src/store/userStorage";
import { onboardingStorage } from "@/src/store/onboardingStorage";
import { OnboardingPayload } from "../types/onboardingTypes";

/**
 * Update user's complete onboarding data
 * This includes body metrics, activity level, goal, and nutrition targets
 */
export const updateUserOnboarding = async (payload: OnboardingPayload) => {
    try {
        console.log("🔵 Step 1: Updating onboarding data...");
        console.log("Payload:", payload);
        
        const response = await updateOnboarding(payload);
        
        console.log("✅ Step 1 Complete: Onboarding data updated");
        console.log("Response:", response);
        
        console.log("🔵 Step 2: Updating storage...");
        // Update user in storage with onboarding_completed flag
        if (response.user) {
            userStorage.saveUser(response.user);
        }
        
        // Fetch and save complete onboarding data
        const onboardingDataResponse = await getOnboardingData();
        if (onboardingDataResponse.data) {
            await onboardingStorage.saveOnboardingData(onboardingDataResponse.data);
        }
        console.log("✅ Step 2 Complete: Storage updated");
        
        return response;
    } catch (error) {
        console.error("❌ Error in updateUserOnboarding:", error);
        throw error;
    }
};

/**
 * Update only body metrics
 */
export const updateBodyMetrics = async (bodyMetrics: OnboardingPayload['body_metrics']) => {
    try {
        console.log("🔵 Updating body metrics...");
        
        const response = await updateOnboarding({ body_metrics: bodyMetrics });
        
        console.log("✅ Body metrics updated successfully");
        return response;
    } catch (error) {
        console.error("❌ Error in updateBodyMetrics:", error);
        throw error;
    }
};

/**
 * Update only activity level
 */
export const updateActivityLevel = async (activityLevel: OnboardingPayload['activity_level']) => {
    try {
        console.log("🔵 Updating activity level...");
        
        const response = await updateOnboarding({ activity_level: activityLevel });
        
        console.log("✅ Activity level updated successfully");
        return response;
    } catch (error) {
        console.error("❌ Error in updateActivityLevel:", error);
        throw error;
    }
};

/**
 * Update only goal type
 */
export const updateGoalType = async (goalType: OnboardingPayload['goal_type']) => {
    try {
        console.log("🔵 Updating goal type...");
        
        const response = await updateOnboarding({ goal_type: goalType });
        
        console.log("✅ Goal type updated successfully");
        return response;
    } catch (error) {
        console.error("❌ Error in updateGoalType:", error);
        throw error;
    }
};

/**
 * Update only nutrition targets
 */
export const updateNutritionTargets = async (nutritionTargets: OnboardingPayload['nutrition_targets']) => {
    try {
        console.log("🔵 Updating nutrition targets...");
        
        const response = await updateOnboarding({ nutrition_targets: nutritionTargets });
        
        console.log("✅ Nutrition targets updated successfully");
        return response;
    } catch (error) {
        console.error("❌ Error in updateNutritionTargets:", error);
        throw error;
    }
};

/**
 * Get user's complete onboarding data
 */
export const getUserOnboardingData = async () => {
    try {
        console.log("🔵 Step 1: Fetching onboarding data from backend...");
        
        const response = await getOnboardingData();
        
        console.log("✅ Step 1 Complete: Onboarding data fetched successfully");
        console.log("Data:", response.data);
        
        console.log("🔵 Step 2: Saving onboarding data to storage...");
        if (response.data) {
            await onboardingStorage.saveOnboardingData(response.data);
        }
        console.log("✅ Step 2 Complete: Onboarding data saved to storage");
        
        return response;
    } catch (error) {
        console.error("❌ Error in getUserOnboardingData:", error);
        throw error;
    }
};

/**
 * Complete onboarding flow - update all data at once
 * Typical usage in a multi-step onboarding form
 */
export const completeOnboarding = async (
    bodyMetrics: OnboardingPayload['body_metrics'],
    activityLevel: OnboardingPayload['activity_level'],
    goalType: OnboardingPayload['goal_type'],
    nutritionTargets: OnboardingPayload['nutrition_targets']
) => {
    try {
        console.log("🔵 Step 1: Starting complete onboarding process...");
        
        const payload: OnboardingPayload = {
            body_metrics: bodyMetrics,
            activity_level: activityLevel,
            goal_type: goalType,
            nutrition_targets: nutritionTargets
        };
        
        console.log("🔵 Step 2: Sending all onboarding data to backend...");
        const response = await updateOnboarding(payload);
        console.log("✅ Step 2 Complete: All onboarding data saved");
        
        console.log("🔵 Step 3: Updating storage with onboarding completion...");
        if (response.user) {
            userStorage.saveUser(response.user);
        }
        
        // Fetch and save complete onboarding data
        const onboardingDataResponse = await getOnboardingData();
        if (onboardingDataResponse.data) {
            await onboardingStorage.saveOnboardingData(onboardingDataResponse.data);
        }
        console.log("✅ Step 3 Complete: Storage updated");
        
        console.log("✅ Onboarding completed successfully!");
        return response;
    } catch (error) {
        console.error("❌ Error in completeOnboarding:", error);
        throw error;
    }
};