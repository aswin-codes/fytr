import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamily } from '@/src/theme/fontFamily';
import { useWorkoutPlanStore } from '@/src/store/workoutPlanStore';
import { Check } from 'lucide-react-native';

// Progress configuration
const TOTAL_STEPS = 5;
const CURRENT_STEP = 3;

// Muscle group options with icons
const MUSCLE_GROUPS = [
  { id: 'chest', label: 'Chest', icon: '💪', color: 'bg-primary' },
  { id: 'back', label: 'Back', icon: '🎒', color: 'bg-primary' },
  { id: 'shoulders', label: 'Shoulders', icon: '🏋️', color: 'bg-primary' },
  { id: 'biceps', label: 'Biceps', icon: '💪', color: 'bg-primary' },
  { id: 'triceps', label: 'Triceps', icon: '⬆️', color: 'bg-primary' },
  { id: 'legs', label: 'Legs', icon: '🏃', color: 'bg-primary' },
  { id: 'core', label: 'Core', icon: '⭕', color: 'bg-primary' },
  { id: 'full-body', label: 'Full Body', icon: '🏋️', color: 'bg-primary' },
];

export default function SelectMuscleGroupsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ day: string }>();
  const day = params.day as string;

  const { updateDay, getDayWorkout } = useWorkoutPlanStore();
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);

  const dayWorkout = getDayWorkout(day);
  const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);

  useEffect(() => {
    // Load existing muscle groups if any
    if (dayWorkout?.muscleGroups) {
      setSelectedMuscles(dayWorkout.muscleGroups.map(m => m.toLowerCase()));
    }
  }, [dayWorkout]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const toggleMuscle = (muscleId: string) => {
    Haptics.selectionAsync();

    setSelectedMuscles((prev) => {
      if (prev.includes(muscleId)) {
        return prev.filter((m) => m !== muscleId);
      } else {
        return [...prev, muscleId];
      }
    });
  };

  const handleNextStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    if (selectedMuscles.length === 0) {
      alert('Please select at least one muscle group');
      return;
    }

    // Update the day with selected muscle groups
    const muscleLabels = selectedMuscles.map((id) => {
      const muscle = MUSCLE_GROUPS.find((m) => m.id === id);
      return muscle ? muscle.label : id;
    });

    // Determine icon based on selection
    let icon = '💪';
    if (selectedMuscles.includes('legs')) icon = '🦵';
    else if (selectedMuscles.includes('back')) icon = '🎒';
    else if (selectedMuscles.includes('chest')) icon = '💪';
    else if (selectedMuscles.includes('core')) icon = '⭕';
    else if (selectedMuscles.includes('full-body')) icon = '🔥';

    // Create label
    const label = muscleLabels.length > 2
      ? `${muscleLabels.slice(0, 2).join(' + ')} +${muscleLabels.length - 2}`
      : muscleLabels.join(' + ');

    // Update store
    updateDay(day, label, icon, muscleLabels);

    // Navigate to exercise selection
    router.push({
      pathname: '/(plan)/ExerciseSelectionScreen',
      params: { day },
    });
  };

  const isMuscleSelected = (muscleId: string) => {
    return selectedMuscles.includes(muscleId);
  };

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
              Select body parts for{' '}
              <Text className="text-primary">{dayLabel}</Text>
            </Text>

            <Text
              style={{ fontFamily: fontFamily.regular }}
              className="text-base text-textSecondary-light dark:text-textSecondary-dark mb-1"
            >
              Mix and match muscle groups to build your perfect routine.
            </Text>

            <Text
              style={{ fontFamily: fontFamily.regular }}
              className="text-sm text-textSecondary-light dark:text-textSecondary-dark"
            >
              Eg: Chest + Triceps
            </Text>
          </View>
        </View>

        {/* Muscle Group Grid */}
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          <View className="flex-row flex-wrap gap-3">
            {MUSCLE_GROUPS.map((muscle) => {
              const isSelected = isMuscleSelected(muscle.id);

              return (
                <TouchableOpacity
                  key={muscle.id}
                  onPress={() => toggleMuscle(muscle.id)}
                  activeOpacity={0.7}
                  className={`rounded-3xl p-5 ${
                    isSelected
                      ? 'bg-primary border-2 border-primary'
                      : 'bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700'
                  }`}
                  style={{
                    width: '47%',
                    aspectRatio: 1.2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isSelected ? 0.15 : 0.03,
                    shadowRadius: 8,
                    elevation: isSelected ? 3 : 1,
                  }}
                >
                  {/* Checkmark */}
                  {isSelected && (
                    <View className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black items-center justify-center">
                      <Check size={16} color="#F6F000" strokeWidth={3} />
                    </View>
                  )}

                  {/* Icon */}
                  <View
                    className={`w-12 h-12 rounded-2xl items-center justify-center mb-3 ${
                      isSelected
                        ? 'bg-black/10'
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                  >
                    <Text className="text-2xl">{muscle.icon}</Text>
                  </View>

                  {/* Label */}
                  <Text
                    style={{ fontFamily: fontFamily.bold }}
                    className={`text-lg ${
                      isSelected
                        ? 'text-black'
                        : 'text-textPrimary-light dark:text-textPrimary-dark'
                    }`}
                  >
                    {muscle.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom Button */}
        <View className="absolute bottom-0 left-0 right-0 bg-background-light dark:bg-background-dark px-6 pb-8 pt-4 border-t border-gray-200 dark:border-gray-800">
          {/* Selected Count */}
          {selectedMuscles.length > 0 && (
            <View className="mb-4 flex-row items-center justify-center">
              <Text
                style={{ fontFamily: fontFamily.medium }}
                className="text-sm text-textSecondary-light dark:text-textSecondary-dark"
              >
                {selectedMuscles.length} muscle{' '}
                {selectedMuscles.length === 1 ? 'group' : 'groups'} selected
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleNextStep}
            activeOpacity={0.8}
            disabled={selectedMuscles.length === 0}
            className={`h-16 rounded-full items-center justify-center flex-row ${
              selectedMuscles.length === 0
                ? 'bg-gray-300 dark:bg-gray-700'
                : 'bg-primary'
            }`}
            style={{
              shadowColor: selectedMuscles.length > 0 ? '#F6F000' : '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: selectedMuscles.length > 0 ? 0.3 : 0,
              shadowRadius: 12,
              elevation: selectedMuscles.length > 0 ? 4 : 0,
            }}
          >
            <Text
              style={{ fontFamily: fontFamily.bold }}
              className={`text-lg mr-2 ${
                selectedMuscles.length === 0
                  ? 'text-gray-500 dark:text-gray-400'
                  : 'text-black'
              }`}
            >
              Next Step
            </Text>
            <Ionicons
              name="arrow-forward"
              size={24}
              color={selectedMuscles.length === 0 ? '#6B7280' : '#000000'}
            />
          </TouchableOpacity>

          {selectedMuscles.length === 0 && (
            <Text
              style={{ fontFamily: fontFamily.regular }}
              className="text-center text-sm text-textSecondary-light dark:text-textSecondary-dark mt-3"
            >
              Select at least one muscle group to continue
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}