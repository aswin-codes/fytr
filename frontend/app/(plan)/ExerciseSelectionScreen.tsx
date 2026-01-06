import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamily } from '@/src/theme/fontFamily';
import { useWorkoutPlanStore, WorkoutExercise } from '@/src/store/workoutPlanStore';
import { Plus, X } from 'lucide-react-native';
import ExerciseBottomSheet from '@/components/Plan/ExerciseBottomSheet';
import { getExerciseById } from '@/src/db/exerciseRepo';
// Progress configuration
const TOTAL_STEPS = 5;
const CURRENT_STEP = 4;

export default function SelectExercisesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ day: string }>();
  const day = params.day as string;

  const { getDayWorkout, saveEditingPlan } = useWorkoutPlanStore();
  const [dayWorkout, setDayWorkout] = useState(getDayWorkout(day));
  const [exerciseImages, setExerciseImages] = useState<Record<string, string>>({});
  const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);

  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  // Refresh dayWorkout when modal closes
  useEffect(() => {
    if (!selectedMuscle) {
      const updatedDayWorkout = getDayWorkout(day);
      setDayWorkout(updatedDayWorkout);
      loadExerciseImages(updatedDayWorkout);
    }
  }, [selectedMuscle, day]);

  // Load exercise images
  const loadExerciseImages = async (workout: typeof dayWorkout) => {
    if (!workout) return;
    
    const images: Record<string, string> = {};
    
    // Import getExerciseById at the top of the file
    
    
    for (const exercise of workout.exercises) {
      try {
        const fullExercise = await getExerciseById(exercise.exerciseId);
        if (fullExercise?.image_urls && fullExercise.image_urls.length > 0) {
          images[exercise.exerciseId] = fullExercise.image_urls[0];
        }
      } catch (error) {
        console.error('Failed to load image for:', exercise.exerciseName);
      }
    }
    
    setExerciseImages(images);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleAddExercise = (muscleGroup: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedMuscle(muscleGroup);
  };

  const handleRemoveExercise = (muscleGroup: string, exerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Remove from store
    const { removeExerciseFromDay } = useWorkoutPlanStore.getState();
    removeExerciseFromDay(day, exerciseId);
    
    // Update local state to trigger re-render
    setDayWorkout(getDayWorkout(day));
    
    // Reload images for remaining exercises
    const updatedWorkout = getDayWorkout(day);
    if (updatedWorkout) {
      loadExerciseImages(updatedWorkout);
    }
  };

  const handleSaveDayPlan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Check if all muscle groups have at least one exercise
    const missingMuscles: string[] = [];
    
    dayWorkout?.muscleGroups.forEach((muscle) => {
      const exercises = getExercisesForMuscle(muscle);
      if (exercises.length === 0) {
        missingMuscles.push(muscle);
      }
    });

    if (missingMuscles.length > 0) {
      alert(`Please add at least one exercise for: ${missingMuscles.join(', ')}`);
      return;
    }

    // Navigate back to weekly split
    router.replace('/(plan)/WeeklySplitScreen');
  };

  const getExercisesForMuscle = (muscleGroup: string): WorkoutExercise[] => {
    if (!dayWorkout) return [];
    
    // Filter exercises by their muscleGroup property
    return dayWorkout.exercises.filter((ex) =>
      ex.muscleGroup?.toLowerCase() === muscleGroup.toLowerCase()
    );
  };

  const canSavePlan = () => {
    if (!dayWorkout) return false;
    
    // Check if all muscle groups have at least one exercise
    return dayWorkout.muscleGroups.every((muscle) => {
      const exercises = getExercisesForMuscle(muscle);
      return exercises.length > 0;
    });
  };

  const getTotalExercises = () => {
    return dayWorkout?.exercises.length || 0;
  };

  if (!dayWorkout) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
        <View className="flex-1 items-center justify-center px-6">
          <Text
            style={{ fontFamily: fontFamily.bold }}
            className="text-xl text-textPrimary-light dark:text-textPrimary-dark"
          >
            Day not configured
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <StatusBar barStyle="dark-content" />

      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity
              onPress={handleBack}
              className="w-12 h-12 items-center justify-center"
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={28} color="gray" />
            </TouchableOpacity>

            {/* Progress Indicator */}
            <View className="flex-1 items-center">
              <Text
                style={{ fontFamily: fontFamily.medium }}
                className="text-base text-textSecondary-light dark:text-textSecondary-dark mb-2"
              >
                Step {CURRENT_STEP} of {TOTAL_STEPS}
              </Text>
            </View>

            {/* Empty space for symmetry */}
            <View className="w-12" />
          </View>

          {/* Progress Dots */}
          <View className="flex-row gap-2 mb-6 justify-center">
            {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
              <View
                key={index}
                className={`h-1.5 rounded-full ${
                  index < CURRENT_STEP
                    ? 'bg-primary w-12'
                    : 'bg-gray-300 dark:bg-gray-700 w-12'
                }`}
              />
            ))}
          </View>

          {/* Title */}
          <View>
            <Text
              style={{ fontFamily: fontFamily.bold }}
              className="text-3xl text-textPrimary-light dark:text-textPrimary-dark mb-2"
            >
              Choose exercises
            </Text>

            <Text
              style={{ fontFamily: fontFamily.regular }}
              className="text-base text-textSecondary-light dark:text-textSecondary-dark"
            >
              {dayLabel} - {dayWorkout.muscleGroups.join(' & ')}
            </Text>
          </View>
        </View>

        {/* Muscle Group Sections */}
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 180 }}
        >
          {dayWorkout.muscleGroups.map((muscleGroup, index) => {
            const exercises = getExercisesForMuscle(muscleGroup);

            return (
              <View key={index} className="mb-6">
                {/* Section Header */}
                <View className="flex-row items-center justify-between mb-3">
                  <Text
                    style={{ fontFamily: fontFamily.bold }}
                    className="text-xl text-textPrimary-light dark:text-textPrimary-dark"
                  >
                    {muscleGroup}
                  </Text>
                  <View className="bg-primary/10 px-3 py-1 rounded-full">
                    <Text
                      style={{ fontFamily: fontFamily.semiBold }}
                      className="text-sm text-primary"
                    >
                      {exercises.length} Selected
                    </Text>
                  </View>
                </View>

                {/* Selected Exercises */}
                {exercises.map((exercise) => (
                  <View
                    key={exercise.exerciseId}
                    className="mb-3 rounded-3xl border-2 border-primary bg-white dark:bg-surface-dark p-4 flex-row items-center"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                  >
                    {/* Exercise Image */}
                    <View className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 items-center justify-center mr-4 overflow-hidden">
                      {exerciseImages[exercise.exerciseId] ? (
                        <Image
                          source={{ uri: exerciseImages[exercise.exerciseId] }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <Text className="text-2xl">💪</Text>
                      )}
                    </View>

                    {/* Exercise Info */}
                    <View className="flex-1">
                      <Text
                        style={{ fontFamily: fontFamily.bold }}
                        className="text-base text-textPrimary-light dark:text-textPrimary-dark"
                      >
                        {exercise.exerciseName}
                      </Text>
                    </View>

                    {/* Remove Button */}
                    <TouchableOpacity
                      onPress={() => handleRemoveExercise(muscleGroup, exercise.exerciseId)}
                      className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center"
                      activeOpacity={0.7}
                    >
                      <X size={20} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Add Exercise Button */}
                <TouchableOpacity
                  onPress={() => handleAddExercise(muscleGroup)}
                  activeOpacity={0.7}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl p-4 flex-row items-center justify-center"
                >
                  <Plus size={20} color="#9CA3AF" />
                  <Text
                    style={{ fontFamily: fontFamily.semiBold }}
                    className="text-base text-textSecondary-light dark:text-textSecondary-dark ml-2"
                  >
                    Add exercise
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>

        {/* Bottom Button */}
        <View className="absolute bottom-0 left-0 right-0 bg-background-light dark:bg-background-dark px-6 pb-8 pt-4 border-t border-gray-200 dark:border-gray-800">
          <TouchableOpacity
            onPress={handleSaveDayPlan}
            activeOpacity={0.8}
            disabled={!canSavePlan()}
            className={`h-16 rounded-full items-center justify-center flex-row ${
              !canSavePlan()
                ? 'bg-gray-300 dark:bg-gray-700'
                : 'bg-primary'
            }`}
            style={{
              shadowColor: canSavePlan() ? '#F6F000' : '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: canSavePlan() ? 0.3 : 0,
              shadowRadius: 12,
              elevation: canSavePlan() ? 4 : 0,
            }}
          >
            <Text
              style={{ fontFamily: fontFamily.bold }}
              className={`text-lg mr-2 ${
                !canSavePlan()
                  ? 'text-gray-500 dark:text-gray-400'
                  : 'text-black'
              }`}
            >
              Save Day Plan
            </Text>
            <Ionicons
              name="checkmark"
              size={24}
              color={!canSavePlan() ? '#6B7280' : '#000000'}
            />
          </TouchableOpacity>
          
          {!canSavePlan() && dayWorkout && (
            <Text
              style={{ fontFamily: fontFamily.regular }}
              className="text-center text-sm text-textSecondary-light dark:text-textSecondary-dark mt-3"
            >
              Add at least 1 exercise for each muscle group
            </Text>
          )}
        </View>
      </View>

      {/* Exercise Selection Bottom Sheet Modal */}
      {selectedMuscle && (
        <ExerciseBottomSheet
          muscleGroup={selectedMuscle}
          day={day}
          visible={!!selectedMuscle}
          onClose={() => setSelectedMuscle(null)}
        />
      )}
    </SafeAreaView>
  );
}