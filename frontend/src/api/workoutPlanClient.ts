import { apiClient } from "./client";

export interface WorkoutPlanPayload {
  plans: any[];
  activePlan: any | null;
  currentEditingPlan: any | null;
}

export interface WorkoutPlanResponse {
  success: boolean;
  message?: string;
  plan: WorkoutPlanPayload | null;
  id?: string;
}

/**
 * Save or update workout plan
 */
export const saveWorkoutPlan = async (payload: WorkoutPlanPayload): Promise<WorkoutPlanResponse> => {
  try {
    const res = await apiClient.post('/workout-plan', payload);
    return res.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user's workout plan
 */
export const getWorkoutPlan = async (): Promise<WorkoutPlanResponse> => {
  try {
    const res = await apiClient.get('/workout-plan');
    return res.data;
  } catch (error) {
    throw error;
  }
};