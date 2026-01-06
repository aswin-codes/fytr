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

export interface WorkoutPlan {
  planType: 'manual' | 'ai';
  weeklySchedule: DayPlan[];
  createdAt: string;
  isCompleted: boolean;
}