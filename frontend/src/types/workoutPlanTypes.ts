export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type MuscleGroup = 
  | 'Chest' 
  | 'Back' 
  | 'Shoulders' 
  | 'Biceps' 
  | 'Triceps' 
  | 'Legs' 
  | 'Core' 
  | 'Full Body'
  | 'Cardio & Core';

export interface DayPlan {
  day: DayOfWeek;
  isRestDay: boolean;
  muscleGroups: MuscleGroup[];
  exercises: string[]; // Exercise IDs
  label?: string; // e.g., "Upper Body Power"
}



export interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number;
  restSeconds: number;
  notes?: string;
  muscleGroup?: string; // Optional muscle group identifier
}

export interface DayWorkout {
  day: string; // 'monday', 'tuesday', etc.
  label: string; // Display name like "Upper Body Power"
  icon: string; // Emoji icon
  exercises: WorkoutExercise[];
  isRestDay: boolean;
  muscleGroups: string[]; // e.g., ['Chest', 'Triceps']
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  schedule: DayWorkout[];
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
}

export interface WorkoutPlanStore {
  // State
  plans: WorkoutPlan[];
  activePlan: WorkoutPlan | null;
  currentEditingPlan: WorkoutPlan | null;
  isLoading: boolean;

  // Actions - Plan Management
  createPlan: (name: string, description?: string) => string; // Returns plan ID
  deletePlan: (planId: string) => void;
  setActivePlan: (planId: string) => void;
  updatePlanName: (planId: string, name: string) => void;
  
  // Actions - Editing Plan
  startEditingPlan: (planId?: string) => void; // Create new or edit existing
  cancelEditingPlan: () => void;
  saveEditingPlan: () => void;
  
  // Actions - Day Management
  updateDay: (day: string, label: string, icon: string, muscleGroups: string[]) => void;
  toggleRestDay: (day: string) => void;
  
  // Actions - Exercise Management
  addExercisesToDay: (day: string, exercises: WorkoutExercise[]) => void;
  removeExerciseFromDay: (day: string, exerciseId: string) => void;
  updateExerciseInDay: (day: string, exerciseId: string, updates: Partial<WorkoutExercise>) => void;
  reorderExercisesInDay: (day: string, exercises: WorkoutExercise[]) => void;
  
  // Getters
  getPlanById: (planId: string) => WorkoutPlan | undefined;
  getDayWorkout: (day: string) => DayWorkout | undefined;
  getAllPlans: () => WorkoutPlan[];
}
