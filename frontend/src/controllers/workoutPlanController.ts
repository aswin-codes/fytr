import { saveWorkoutPlan, getWorkoutPlan } from "@/src/api/workoutPlanClient";
import { useWorkoutPlanStore } from "@/src/store/workoutPlanStore";

/**
 * Fetch workout plan from backend and load into store
 */
export const fetchWorkoutPlan = async () => {
  try {
    console.log("🔵 Fetching workout plan from backend...");
    const response = await getWorkoutPlan();
    
    if (response.success && response.plan) {
      console.log("✅ Workout plan fetched successfully");
      
      // Load into Zustand store
      const store = useWorkoutPlanStore.getState();
      store.plans = response.plan.plans || [];
      store.activePlan = response.plan.activePlan || null;
      store.currentEditingPlan = response.plan.currentEditingPlan || null;
      
      console.log("✅ Workout plan loaded into store");
    } else {
      console.log("ℹ️ No workout plan found on backend");
    }
    
    return response;
  } catch (error) {
    console.error("❌ Error fetching workout plan:", error);
    throw error;
  }
};

/**
 * Save current workout plan from store to backend
 */
export const syncWorkoutPlan = async () => {
  try {
    console.log("🔵 Syncing workout plan to backend...");
    
    const store = useWorkoutPlanStore.getState();
    const payload = {
      plans: store.plans,
      activePlan: store.activePlan,
      currentEditingPlan: store.currentEditingPlan,
    };
    
    const response = await saveWorkoutPlan(payload);
    
    if (response.success) {
      console.log("✅ Workout plan synced successfully");
    }
    
    return response;
  } catch (error) {
    console.error("❌ Error syncing workout plan:", error);
    throw error;
  }
};