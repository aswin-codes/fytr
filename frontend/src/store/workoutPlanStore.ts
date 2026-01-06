import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
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

interface WorkoutPlanStore {
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

// Default empty schedule for a new plan
const createDefaultSchedule = (): DayWorkout[] => [
  {
    day: 'monday',
    label: 'Rest Day',
    icon: '🛌',
    exercises: [],
    isRestDay: true,
    muscleGroups: [],
  },
  {
    day: 'tuesday',
    label: 'Rest Day',
    icon: '🛌',
    exercises: [],
    isRestDay: true,
    muscleGroups: [],
  },
  {
    day: 'wednesday',
    label: 'Rest Day',
    icon: '🛌',
    exercises: [],
    isRestDay: true,
    muscleGroups: [],
  },
  {
    day: 'thursday',
    label: 'Rest Day',
    icon: '🛌',
    exercises: [],
    isRestDay: true,
    muscleGroups: [],
  },
  {
    day: 'friday',
    label: 'Rest Day',
    icon: '🛌',
    exercises: [],
    isRestDay: true,
    muscleGroups: [],
  },
  {
    day: 'saturday',
    label: 'Rest Day',
    icon: '🛌',
    exercises: [],
    isRestDay: true,
    muscleGroups: [],
  },
  {
    day: 'sunday',
    label: 'Rest Day',
    icon: '🛌',
    exercises: [],
    isRestDay: true,
    muscleGroups: [],
  },
];

// Generate unique ID
const generateId = () => `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useWorkoutPlanStore = create<WorkoutPlanStore>()(
  persist(
    (set, get) => ({
      // Initial State
      plans: [],
      activePlan: null,
      currentEditingPlan: null,
      isLoading: false,

      // Create Plan
      createPlan: (name: string, description?: string) => {
        const newPlan: WorkoutPlan = {
          id: generateId(),
          name,
          description,
          schedule: createDefaultSchedule(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isActive: false,
        };

        set((state) => ({
          plans: [...state.plans, newPlan],
        }));

        return newPlan.id;
      },

      // Delete Plan
      deletePlan: (planId: string) => {
        set((state) => {
          const updatedPlans = state.plans.filter((p) => p.id !== planId);
          const updatedActivePlan = state.activePlan?.id === planId ? null : state.activePlan;
          
          return {
            plans: updatedPlans,
            activePlan: updatedActivePlan,
          };
        });
      },

      // Set Active Plan
      setActivePlan: (planId: string) => {
        set((state) => {
          const plan = state.plans.find((p) => p.id === planId);
          
          if (!plan) return state;

          // Deactivate all other plans
          const updatedPlans = state.plans.map((p) => ({
            ...p,
            isActive: p.id === planId,
          }));

          return {
            plans: updatedPlans,
            activePlan: plan,
          };
        });
      },

      // Update Plan Name
      updatePlanName: (planId: string, name: string) => {
        set((state) => {
          const updatedPlans = state.plans.map((p) =>
            p.id === planId ? { ...p, name, updatedAt: Date.now() } : p
          );

          return { plans: updatedPlans };
        });
      },

      // Start Editing Plan
      startEditingPlan: (planId?: string) => {
        if (planId) {
          // Edit existing plan
          const plan = get().plans.find((p) => p.id === planId);
          if (plan) {
            set({ currentEditingPlan: { ...plan } });
          }
        } else {
          // Create new plan (temp)
          const tempPlan: WorkoutPlan = {
            id: 'temp_' + Date.now(),
            name: 'New Workout Plan',
            schedule: createDefaultSchedule(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isActive: false,
          };
          set({ currentEditingPlan: tempPlan });
        }
      },

      // Cancel Editing
      cancelEditingPlan: () => {
        set({ currentEditingPlan: null });
      },

      // Save Editing Plan
      saveEditingPlan: () => {
        const editingPlan = get().currentEditingPlan;
        if (!editingPlan) return;

        set((state) => {
          let updatedPlans: WorkoutPlan[];

          if (editingPlan.id.startsWith('temp_')) {
            // New plan - generate real ID and add to plans
            const newPlan = {
              ...editingPlan,
              id: generateId(),
              updatedAt: Date.now(),
            };
            updatedPlans = [...state.plans, newPlan];
          } else {
            // Existing plan - update
            updatedPlans = state.plans.map((p) =>
              p.id === editingPlan.id
                ? { ...editingPlan, updatedAt: Date.now() }
                : p
            );
          }

          return {
            plans: updatedPlans,
            currentEditingPlan: null,
          };
        });
      },

      // Update Day
      updateDay: (day: string, label: string, icon: string, muscleGroups: string[]) => {
        set((state) => {
          if (!state.currentEditingPlan) return state;

          const updatedSchedule = state.currentEditingPlan.schedule.map((d) =>
            d.day === day
              ? { ...d, label, icon, muscleGroups, isRestDay: false }
              : d
          );

          return {
            currentEditingPlan: {
              ...state.currentEditingPlan,
              schedule: updatedSchedule,
            },
          };
        });
      },

      // Toggle Rest Day
      toggleRestDay: (day: string) => {
        set((state) => {
          if (!state.currentEditingPlan) return state;

          const updatedSchedule = state.currentEditingPlan.schedule.map((d) =>
            d.day === day
              ? {
                  ...d,
                  isRestDay: !d.isRestDay,
                  label: !d.isRestDay ? 'Rest Day' : d.label,
                  icon: !d.isRestDay ? '🛌' : d.icon,
                  exercises: !d.isRestDay ? [] : d.exercises,
                  muscleGroups: !d.isRestDay ? [] : d.muscleGroups,
                }
              : d
          );

          return {
            currentEditingPlan: {
              ...state.currentEditingPlan,
              schedule: updatedSchedule,
            },
          };
        });
      },

      // Add Exercises to Day
      addExercisesToDay: (day: string, exercises: WorkoutExercise[]) => {
        set((state) => {
          if (!state.currentEditingPlan) return state;

          const updatedSchedule = state.currentEditingPlan.schedule.map((d) =>
            d.day === day
              ? { ...d, exercises: [...d.exercises, ...exercises] }
              : d
          );

          return {
            currentEditingPlan: {
              ...state.currentEditingPlan,
              schedule: updatedSchedule,
            },
          };
        });
      },

      // Remove Exercise from Day
      removeExerciseFromDay: (day: string, exerciseId: string) => {
        set((state) => {
          if (!state.currentEditingPlan) return state;

          const updatedSchedule = state.currentEditingPlan.schedule.map((d) =>
            d.day === day
              ? { ...d, exercises: d.exercises.filter((e) => e.exerciseId !== exerciseId) }
              : d
          );

          return {
            currentEditingPlan: {
              ...state.currentEditingPlan,
              schedule: updatedSchedule,
            },
          };
        });
      },

      // Update Exercise in Day
      updateExerciseInDay: (day: string, exerciseId: string, updates: Partial<WorkoutExercise>) => {
        set((state) => {
          if (!state.currentEditingPlan) return state;

          const updatedSchedule = state.currentEditingPlan.schedule.map((d) =>
            d.day === day
              ? {
                  ...d,
                  exercises: d.exercises.map((e) =>
                    e.exerciseId === exerciseId ? { ...e, ...updates } : e
                  ),
                }
              : d
          );

          return {
            currentEditingPlan: {
              ...state.currentEditingPlan,
              schedule: updatedSchedule,
            },
          };
        });
      },

      // Reorder Exercises in Day
      reorderExercisesInDay: (day: string, exercises: WorkoutExercise[]) => {
        set((state) => {
          if (!state.currentEditingPlan) return state;

          const updatedSchedule = state.currentEditingPlan.schedule.map((d) =>
            d.day === day ? { ...d, exercises } : d
          );

          return {
            currentEditingPlan: {
              ...state.currentEditingPlan,
              schedule: updatedSchedule,
            },
          };
        });
      },

      // Get Plan by ID
      getPlanById: (planId: string) => {
        return get().plans.find((p) => p.id === planId);
      },

      // Get Day Workout
      getDayWorkout: (day: string) => {
        const editingPlan = get().currentEditingPlan;
        if (!editingPlan) return undefined;
        
        return editingPlan.schedule.find((d) => d.day === day);
      },

      // Get All Plans
      getAllPlans: () => {
        return get().plans;
      },
    }),
    {
      name: 'workout-plan-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);