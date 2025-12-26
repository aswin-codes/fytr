import { apiClient } from "./client";
export const fetchExerciseVersion = async () => {
  try {
    const response = await apiClient.get(`/exercises/version`);
    return response.data.version;
  } catch (error) {
    console.error('❌ Failed to fetch version:', error);
    throw new Error('Failed to fetch exercise version');
  }
};

/**
 * Fetches all exercises from backend
 */
export const fetchExercises = async () => {
  try {
    const response = await apiClient.get(`/exercises/sync`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch exercises:', error);
    throw new Error('Failed to fetch exercises');
  }
};