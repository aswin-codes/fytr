
// Types for onboarding data
export interface BodyMetrics {
  gender: 'male' | 'female';
  age: number;
  height_cm: number;
  weight_kg: number;
  target_weight_kg: number;
}

export interface NutritionTargets {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
}

export interface OnboardingPayload {
  body_metrics?: BodyMetrics;
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active' | 'athlete';
  goal_type?: 'lose-weight' | 'gain-muscle' | 'maintain';
  nutrition_targets?: NutritionTargets;
}

export interface OnboardingDataResponse {
  message: string;
  data: {
    id: string;
    firebase_uid: string;
    email: string;
    full_name: string;
    onboarding_completed: boolean;
    body_metrics: BodyMetrics;
    activity_level: string;
    goal_type: string;
    nutrition_targets: NutritionTargets;
  };
}