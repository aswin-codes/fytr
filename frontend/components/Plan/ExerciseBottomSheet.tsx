import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Image,
  PanResponder,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { fontFamily } from '@/src/theme/fontFamily';
import { useWorkoutPlanStore, WorkoutExercise } from '@/src/store/workoutPlanStore';
import { filterExercises, searchExercises, getFilterOptions } from '@/src/db/exerciseRepo';
import { Exercise } from '@/src/types/exerciseTypes';
import { X, Search, Check } from 'lucide-react-native';

interface ExerciseBottomSheetProps {
  muscleGroup: string;
  day: string;
  visible: boolean;
  onClose: () => void;
}

// Muscle mapping for filtering
const MUSCLE_MAP: Record<string, string> = {
  'chest': 'chest',
  'back': 'lats',
  'shoulders': 'shoulders',
  'biceps': 'biceps',
  'triceps': 'triceps',
  'legs': 'quadriceps',
  'core': 'abdominals',
  'full body': 'chest',
};

export default function ExerciseBottomSheet({
  muscleGroup,
  day,
  visible,
  onClose,
}: ExerciseBottomSheetProps) {
  const router = useRouter();
  const { addExercisesToDay, getDayWorkout } = useWorkoutPlanStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('All Equipment');
  const [equipmentOptions, setEquipmentOptions] = useState<string[]>(['All Equipment']);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]); // Cache all exercises
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sheetHeight] = useState(new Animated.Value(0.75)); // 75% initial height

  const dayWorkout = getDayWorkout(day);

  // Pan responder for dragging
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      // Calculate new height percentage (inverted because dragging down should decrease height)
      const newHeight = Math.max(0.4, Math.min(0.95, 0.75 - gestureState.dy / 1000));
      sheetHeight.setValue(newHeight);
    },
    onPanResponderRelease: () => {
      // Snap to nearest preset
      const currentHeight = (sheetHeight as any)._value;
      let snapHeight = 0.75;
      
      if (currentHeight < 0.55) snapHeight = 0.4;
      else if (currentHeight < 0.8) snapHeight = 0.75;
      else snapHeight = 0.95;

      Animated.spring(sheetHeight, {
        toValue: snapHeight,
        useNativeDriver: false,
      }).start();
    },
  });

  useEffect(() => {
    if (visible) {
      loadEquipmentOptions();
      loadExercises();
      
      // Pre-select already added exercises for this muscle group
      if (dayWorkout) {
        const existingExercises = dayWorkout.exercises
          .filter(ex => ex.muscleGroup?.toLowerCase() === muscleGroup.toLowerCase())
          .map(ex => ex.exerciseId);
        
        setSelectedExercises(new Set(existingExercises));
      }
    } else {
      // Clear selection when closing
      setSelectedExercises(new Set());
    }
  }, [visible, selectedEquipment, muscleGroup]);

  useEffect(() => {
    if (searchQuery.length > 0) {
      performSearch();
    } else {
      loadExercises();
    }
  }, [searchQuery]);

  const loadEquipmentOptions = async () => {
    try {
      const options = await getFilterOptions();
      const allEquipment = ['All Equipment', ...options.equipment];
      setEquipmentOptions(allEquipment);
    } catch (error) {
      console.error('Failed to load equipment options:', error);
    }
  };

  const loadExercises = async () => {
    try {
      setLoading(true);
      
      // Map muscle group to database muscle name
      const muscleKey = muscleGroup.toLowerCase();
      const targetMuscle = MUSCLE_MAP[muscleKey] || muscleKey;

      const filters: any = {
        primaryMuscle: targetMuscle,
      };

      if (selectedEquipment !== 'All Equipment') {
        filters.equipment = selectedEquipment.toLowerCase();
      }

      const data = await filterExercises(filters);
      setExercises(data);
      
      // Cache all exercises for this muscle group (without equipment filter)
      if (allExercises.length === 0) {
        const allData = await filterExercises({ primaryMuscle: targetMuscle });
        setAllExercises(allData);
      }
    } catch (error) {
      console.error('Failed to load exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    try {
      setLoading(true);
      const data = await searchExercises(searchQuery);
      
      // Filter by muscle group
      const muscleKey = muscleGroup.toLowerCase();
      const targetMuscle = MUSCLE_MAP[muscleKey] || muscleKey;
      
      const filtered = data.filter((ex) =>
        ex.primary_muscles?.some((m) =>
          m.toLowerCase().includes(targetMuscle.toLowerCase())
        )
      );

      setExercises(filtered);
      
      // Update allExercises cache with search results
      if (allExercises.length === 0 || filtered.length > allExercises.length) {
        setAllExercises((prev) => {
          const combined = [...prev, ...filtered];
          // Remove duplicates
          const unique = combined.filter((ex, index, self) => 
            self.findIndex(e => e.id === ex.id) === index
          );
          return unique;
        });
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExercise = (exerciseId: string) => {
    Haptics.selectionAsync();
    
    setSelectedExercises((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId);
      } else {
        newSet.add(exerciseId);
      }
      return newSet;
    });
  };

  const handleExercisePress = (exerciseId: string) => {
    Haptics.selectionAsync();
    // Directly toggle selection instead of navigating
    toggleExercise(exerciseId);
  };

  const handleConfirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    if (selectedExercises.size === 0) {
      return;
    }

    console.log('Selected exercise IDs:', Array.from(selectedExercises));

    // Get current day workout
    const currentDayWorkout = useWorkoutPlanStore.getState().getDayWorkout(day);
    
    // Remove all existing exercises for this muscle group
    if (currentDayWorkout) {
      const exercisesToRemove = currentDayWorkout.exercises.filter(
        ex => ex.muscleGroup?.toLowerCase() === muscleGroup.toLowerCase()
      );
      
      console.log('Removing exercises:', exercisesToRemove.length);
      
      // Remove all at once
      exercisesToRemove.forEach(ex => {
        useWorkoutPlanStore.getState().removeExerciseFromDay(day, ex.exerciseId);
      });
    }

    // Convert selected exercises to WorkoutExercise format
    // Use allExercises cache instead of filtered exercises array
    const workoutExercises: WorkoutExercise[] = Array.from(selectedExercises)
      .map((exerciseId) => {
        const exercise = allExercises.find(ex => ex.id === exerciseId);
        if (!exercise) {
          console.warn('Exercise not found in cache:', exerciseId);
          return null;
        }
        return {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          sets: 3, // Default
          reps: 10, // Default
          restSeconds: 60, // Default
          muscleGroup: muscleGroup, // Add muscle group identifier
        };
      })
      .filter((ex): ex is WorkoutExercise => ex !== null);

    console.log('Adding exercises to day:', workoutExercises.length, workoutExercises);

    // Add all exercises to store in one call
    addExercisesToDay(day, workoutExercises);

    // Close modal (selection will be cleared by useEffect)
    onClose();
  };

  const isOptimalRange = () => {
    const count = selectedExercises.size;
    return count >= 4 && count <= 6;
  };

  // Interpolate height for animation
  const animatedHeight = sheetHeight.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <TouchableOpacity 
          className="flex-1" 
          activeOpacity={1} 
          onPress={onClose}
        />
        <Animated.View 
          style={{ height: animatedHeight }}
          className="bg-white dark:bg-surface-dark rounded-t-3xl"
        >
          {/* Drag Handle */}
          <View 
            {...panResponder.panHandlers}
            className="items-center py-3"
          >
            <View className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
          </View>

          {/* Header */}
          <View className="px-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-1">
                <Text
                  style={{ fontFamily: fontFamily.bold }}
                  className="text-2xl text-textPrimary-light dark:text-textPrimary-dark mb-2"
                >
                  {muscleGroup} Exercises
                </Text>
                <Text
                  style={{ fontFamily: fontFamily.regular }}
                  className="text-sm text-textSecondary-light dark:text-textSecondary-dark"
                >
                  Select <Text className="text-primary font-bold">4-6 exercises</Text> for optimal results.
                </Text>
              </View>

              <TouchableOpacity
                onPress={onClose}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center"
                activeOpacity={0.7}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="relative mb-4">
              <TextInput
                placeholder="Search (bench press, cable...)"
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{ fontFamily: fontFamily.regular }}
                className="rounded-full border border-gray-300 bg-gray-50 py-3 pl-12 pr-4 text-base text-textPrimary-light dark:border-gray-700 dark:bg-gray-800 dark:text-textPrimary-dark"
              />
              <View className="absolute left-4 top-3.5">
                <Search size={20} color="#9CA3AF" />
              </View>
            </View>

            {/* Equipment Filters */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {equipmentOptions.map((equipment) => (
                <TouchableOpacity
                  key={equipment}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedEquipment(equipment);
                  }}
                  className={`rounded-full px-4 py-2 ${
                    selectedEquipment === equipment
                      ? 'bg-black dark:bg-white'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <Text
                    style={{ fontFamily: fontFamily.medium }}
                    className={`text-sm capitalize ${
                      selectedEquipment === equipment
                        ? 'text-white dark:text-black'
                        : 'text-textPrimary-light dark:text-textPrimary-dark'
                    }`}
                  >
                    {equipment}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Exercise List */}
          <ScrollView
            className="flex-1 px-6 pt-4"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 140 }}
          >
            {loading ? (
              <View className="py-20 items-center">
                <Text
                  style={{ fontFamily: fontFamily.regular }}
                  className="text-textSecondary-light dark:text-textSecondary-dark"
                >
                  Loading exercises...
                </Text>
              </View>
            ) : exercises.length === 0 ? (
              <View className="py-20 items-center">
                <Text className="text-5xl mb-4">🔍</Text>
                <Text
                  style={{ fontFamily: fontFamily.semiBold }}
                  className="text-lg text-textPrimary-light dark:text-textPrimary-dark mb-2"
                >
                  No exercises found
                </Text>
                <Text
                  style={{ fontFamily: fontFamily.regular }}
                  className="text-sm text-textSecondary-light dark:text-textSecondary-dark text-center"
                >
                  Try adjusting your filters or search
                </Text>
              </View>
            ) : (
              exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  isSelected={selectedExercises.has(exercise.id)}
                  onToggle={() => toggleExercise(exercise.id)}
                  onPress={() => handleExercisePress(exercise.id)}
                />
              ))
            )}
          </ScrollView>

          {/* Bottom Action */}
          <View className="px-6 pb-8 pt-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-surface-dark">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-2">
                  <Text
                    style={{ fontFamily: fontFamily.bold }}
                    className="text-black text-sm"
                  >
                    {selectedExercises.size}
                  </Text>
                </View>
                <Text
                  style={{ fontFamily: fontFamily.semiBold }}
                  className="text-sm text-textPrimary-light dark:text-textPrimary-dark"
                >
                  exercises selected
                </Text>
              </View>

              {isOptimalRange() && (
                <View className="bg-primary/10 px-3 py-1 rounded-full flex-row items-center">
                  <Text className="text-lg mr-1">👍</Text>
                  <Text
                    style={{ fontFamily: fontFamily.semiBold }}
                    className="text-xs text-primary"
                  >
                    Optimal Range
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={handleConfirm}
              activeOpacity={0.8}
              disabled={selectedExercises.size === 0}
              className={`h-16 rounded-full items-center justify-center ${
                selectedExercises.size === 0
                  ? 'bg-gray-300 dark:bg-gray-700'
                  : 'bg-primary'
              }`}
            >
              <Text
                style={{ fontFamily: fontFamily.bold }}
                className={`text-lg ${
                  selectedExercises.size === 0
                    ? 'text-gray-500 dark:text-gray-400'
                    : 'text-black'
                }`}
              >
                Confirm {muscleGroup} Exercises ✓
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// Exercise Card Component
function ExerciseCard({
  exercise,
  isSelected,
  onToggle,
  onPress,
}: {
  exercise: Exercise;
  isSelected: boolean;
  onToggle: () => void;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`mb-3 rounded-3xl p-4 flex-row items-center ${
        isSelected
          ? 'border-2 border-primary bg-white dark:bg-surface-dark'
          : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark'
      }`}
    >
      {/* Exercise Image */}
      <View className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden mr-4">
        {exercise.image_urls && exercise.image_urls.length > 0 ? (
          <Image
            source={{ uri: exercise.image_urls[0] }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Text className="text-2xl">💪</Text>
          </View>
        )}
      </View>

      {/* Exercise Info */}
      <View className="flex-1">
        <Text
          style={{ fontFamily: fontFamily.bold }}
          className="text-base text-textPrimary-light dark:text-textPrimary-dark mb-1"
        >
          {exercise.name}
        </Text>
        <Text
          style={{ fontFamily: fontFamily.regular }}
          className="text-sm text-textSecondary-light dark:text-textSecondary-dark capitalize"
        >
          {exercise.equipment ? `${exercise.equipment} • ` : ''}{exercise.mechanic || 'Compound'}
        </Text>
      </View>

      {/* Selection Checkbox */}
      <View
        className={`w-8 h-8 rounded-full items-center justify-center ${
          isSelected ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        {isSelected && <Check size={18} color="#000000" strokeWidth={3} />}
      </View>
    </TouchableOpacity>
  );
}