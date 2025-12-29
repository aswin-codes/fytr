import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { getAllExercises, filterExercises, getFilterOptions } from '@/src/db/exerciseRepo';
import { forceSyncExercises } from '@/src/controllers/exerciseSyncController';
import { Exercise } from '@/src/types/exerciseTypes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamily } from '@/src/theme/fontFamily';
import { Search, SlidersHorizontal, X } from 'lucide-react-native';

// Muscle groups for filtering
const MUSCLE_GROUPS = [
  'All',
  'Chest',
  'Biceps',
  'Triceps',
  'Shoulders',
  'Core',
  'Back',
  'Legs',
];

// Map muscle groups to actual muscle values in DB
const MUSCLE_MAP: Record<string, string[] | null> = {
  chest: ['chest'],
  biceps: ['biceps'],
  triceps: ['triceps'],
  shoulders: ['shoulders'],
  core: ['abdominals', 'lower back'],
  back: ['lats', 'middle back', 'lower back'],
  legs: ['quadriceps', 'hamstrings', 'calves', 'glutes', 'adductors', 'abductors']

};

// Difficulty level dots component
const DifficultyDots = ({ level }: { level: string | null }) => {
  const levels = ['beginner', 'intermediate', 'expert'];
  const currentLevel = level?.toLowerCase() || 'beginner';
  const activeDots = levels.indexOf(currentLevel) + 1;

  return (
    <View className="flex-row items-center gap-1">
      {[1, 2, 3].map((dot) => (
        <View
          key={dot}
          className={`h-1.5 w-1.5 rounded-full ${
            dot <= activeDots ? 'bg-primary' : 'bg-gray-300'
          }`}
        />
      ))}
    </View>
  );
};

export default function ExploreScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  // Filter options from DB
  const [filterOptions, setFilterOptions] = useState({
    categories: [] as string[],
    equipment: [] as string[],
    levels: [] as string[],
  });

  useEffect(() => {
    loadExercises();
    loadFilterOptions();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [searchQuery, selectedMuscle, selectedEquipment, selectedLevel, exercises]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const data = await getAllExercises();
      setExercises(data);
      setFilteredExercises(data);
    } catch (error) {
      console.error('Failed to load exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const options = await getFilterOptions();
      setFilterOptions(options);
    } catch (error) {
      console.error('Failed to load filter options:', error);
    }
  };

  const applyFiltersAndSearch = async () => {
    try {
      let result = exercises;

      // Apply muscle filter
      if (selectedMuscle !== 'All') {
        const muscleKey = selectedMuscle.toLowerCase();
        const targetMuscles = MUSCLE_MAP[muscleKey];

        if (targetMuscles) {
          result = result.filter((ex) => {
            return ex.primary_muscles?.some((muscle) =>
              targetMuscles.some((target) => muscle.toLowerCase().includes(target.toLowerCase()))
            );
          });
        }
      }

      // Apply equipment and level filters
      if (selectedEquipment || selectedLevel) {
        result = result.filter((ex) => {
          const matchesEquipment = selectedEquipment
            ? ex.equipment?.toLowerCase() === selectedEquipment.toLowerCase()
            : true;
          const matchesLevel = selectedLevel
            ? ex.level?.toLowerCase() === selectedLevel.toLowerCase()
            : true;
          return matchesEquipment && matchesLevel;
        });
      }

      // Apply search
      if (searchQuery.trim()) {
        result = result.filter((ex) =>
          ex.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setFilteredExercises(result);
    } catch (error) {
      console.error('Failed to apply filters:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await forceSyncExercises();
    await loadExercises();
    setRefreshing(false);
  };

  const clearFilters = () => {
    setSelectedMuscle('All');
    setSelectedEquipment(null);
    setSelectedLevel(null);
    setSearchQuery('');
  };

  const activeFilterCount =
    (selectedMuscle !== 'All' ? 1 : 0) +
    (selectedEquipment ? 1 : 0) +
    (selectedLevel ? 1 : 0);

  const renderExerciseCard = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      onPress={() => router.push(`/explore/${item.id}`)}
      className="mb-3 flex-1 overflow-hidden rounded-2xl bg-card-light dark:bg-card-dark"
      style={{ aspectRatio: 0.8 }}
    >
      {/* Exercise Image - Fixed 60% height */}
      <View className="h-[60%] w-full bg-gray-200 dark:bg-gray-800">
        {item.image_urls && item.image_urls.length > 0 ? (
          <Image
            source={{ uri: item.image_urls[0] }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <Text className="text-gray-400 text-xs">No image</Text>
          </View>
        )}
      </View>

      {/* Exercise Info - Fixed 40% height */}
      <View className="h-[40%] p-2.5 justify-between">
        {/* Exercise Name - Takes available space */}
        <Text
          style={{ fontFamily: fontFamily.semiBold }}
          className="text-xs leading-tight text-textPrimary-light dark:text-textPrimary-dark"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>

        {/* Primary Muscle - Single tag with ellipsis */}
        {item.primary_muscles && item.primary_muscles.length > 0 && (
          <View className="flex-row items-center mt-2">
            <View className="rounded-full bg-primary/20 px-2 py-0.5 max-w-[70%]">
              <Text
                style={{ fontFamily: fontFamily.medium }}
                className="text-[10px] capitalize text-textPrimary-light dark:text-textPrimary-dark"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.primary_muscles[0]}
              </Text>
            </View>
          </View>
        )}

        {/* Equipment and Difficulty */}
        <View className="flex-row items-center justify-between mt-2">
          {/* Equipment - With ellipsis */}
          <Text
            style={{ fontFamily: fontFamily.regular }}
            className="flex-1 text-[10px] capitalize text-gray-500 dark:text-gray-400 mr-2"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.equipment || 'bodyweight'}
          </Text>

          {/* Difficulty Dots */}
          <DifficultyDots level={item.level} />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color="#F6F000" />
        <Text
          style={{ fontFamily: fontFamily.medium }}
          className="mt-4 text-gray-600 dark:text-gray-400"
        >
          Loading exercises...
        </Text>
      </View>
    );
  }

  // Handle empty state
  if (exercises.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
        <View className="p-6">
          <Text
            style={{ fontFamily: fontFamily.semiBold }}
            className="mb-4 text-2xl text-textPrimary-light dark:text-textPrimary-dark"
          >
            Exercise Library
          </Text>
        </View>

        <View className="flex-1 items-center justify-center px-4">
          <Text className="mb-4 text-6xl">💪</Text>
          <Text
            style={{ fontFamily: fontFamily.bold }}
            className="mb-2 text-xl text-gray-900 dark:text-white"
          >
            No Exercises Yet
          </Text>
          <Text
            style={{ fontFamily: fontFamily.regular }}
            className="mb-6 text-center text-gray-500 dark:text-gray-400"
          >
            Exercise library is syncing in the background.{'\n'}
            Pull down to refresh once sync is complete.
          </Text>
          <TouchableOpacity
            onPress={handleRefresh}
            className="rounded-xl bg-primary px-6 py-3"
          >
            <Text
              style={{ fontFamily: fontFamily.semiBold }}
              className="text-base text-gray-900"
            >
              Refresh Now
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View className="px-6 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text
            style={{ fontFamily: fontFamily.semiBold }}
            className="text-2xl text-textPrimary-light dark:text-textPrimary-dark"
          >
            Exercise Library
          </Text>
          
          {/* Results Count in corner */}
          <View className="rounded-full bg-card-light dark:bg-card-dark px-3 py-1 border border-border-light dark:border-border-dark">
            <Text
              style={{ fontFamily: fontFamily.semiBold }}
              className="text-xs text-gray-600 dark:text-gray-400"
            >
              {filteredExercises.length}
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="relative mb-4 flex justify-center">
          <TextInput
            placeholder="Search exercises..."
            placeholderTextColor="gray"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ fontFamily: fontFamily.regular }}
            className="rounded-full border-[0.5px] border-gray-300 bg-card-light py-3 pl-12 pr-4 text-base text-textPrimary-light dark:border-gray-700 dark:bg-card-dark dark:text-textPrimary-dark"
          />
          <View className="absolute left-4">
            <Search size={20} color="gray" />
          </View>
        </View>

        {/* Muscle Group Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Filter Button */}
          <TouchableOpacity
            onPress={() => setShowFilters(true)}
            className="mr-2 flex-row items-center rounded-full border-[0.5px] border-gray-300 bg-card-light px-4 py-2 dark:border-gray-700 dark:bg-card-dark"
          >
            <Text
              style={{ fontFamily: fontFamily.medium }}
              className="mr-2 text-sm text-textPrimary-light dark:text-textPrimary-dark"
            >
              Filters
            </Text>
            <SlidersHorizontal size={14} color="gray" />
            {activeFilterCount > 0 && (
              <View className="ml-2 h-5 w-5 items-center justify-center rounded-full bg-primary">
                <Text style={{ fontFamily: fontFamily.bold }} className="text-xs text-black">
                  {activeFilterCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Muscle Group Pills */}
          {MUSCLE_GROUPS.map((muscle) => (
            <TouchableOpacity
              key={muscle}
              onPress={() => setSelectedMuscle(muscle)}
              className={`mr-2 flex-row items-center rounded-full px-4 py-2 ${
                selectedMuscle === muscle
                  ? 'bg-primary'
                  : 'border-[0.5px] border-gray-300 bg-card-light dark:border-gray-700 dark:bg-card-dark'
              }`}
            >
              <Text
                style={{ fontFamily: fontFamily.medium }}
                className={`text-sm ${
                  selectedMuscle === muscle
                    ? 'text-black'
                    : 'text-textPrimary-light dark:text-textPrimary-dark'
                }`}
              >
                {muscle}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Exercise Grid */}
      <FlatList
        data={filteredExercises}
        renderItem={renderExerciseCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: 16, gap: 12 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#F6F000" />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Text className="mb-4 text-6xl">🔍</Text>
            <Text
              style={{ fontFamily: fontFamily.bold }}
              className="mb-2 text-lg text-gray-900 dark:text-white"
            >
              No exercises found
            </Text>
            <Text
              style={{ fontFamily: fontFamily.regular }}
              className="text-center text-gray-500 dark:text-gray-400"
            >
              Try adjusting your filters or search query
            </Text>
          </View>
        }
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="max-h-[70%] rounded-t-3xl bg-white px-6 pb-8 pt-6 dark:bg-surface-dark">
            {/* Modal Header */}
            <View className="mb-6 flex-row items-center justify-between">
              <Text
                style={{ fontFamily: fontFamily.bold }}
                className="text-xl text-gray-900 dark:text-white"
              >
                Filters
              </Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X size={24} color="gray" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Equipment Filter */}
              <View className="mb-6">
                <Text
                  style={{ fontFamily: fontFamily.semiBold }}
                  className="mb-3 text-sm text-gray-700 dark:text-gray-300"
                >
                  Equipment
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {filterOptions.equipment.map((equipment) => (
                    <TouchableOpacity
                      key={equipment}
                      onPress={() =>
                        setSelectedEquipment(selectedEquipment === equipment ? null : equipment)
                      }
                      className={`rounded-full border px-4 py-2 ${
                        selectedEquipment === equipment
                          ? 'border-primary bg-primary'
                          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-surface-dark'
                      }`}
                    >
                      <Text
                        style={{ fontFamily: fontFamily.medium }}
                        className={`text-sm capitalize ${
                          selectedEquipment === equipment
                            ? 'text-gray-900'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {equipment}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Level Filter */}
              <View className="mb-6">
                <Text
                  style={{ fontFamily: fontFamily.semiBold }}
                  className="mb-3 text-sm text-gray-700 dark:text-gray-300"
                >
                  Difficulty Level
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {filterOptions.levels.map((level) => (
                    <TouchableOpacity
                      key={level}
                      onPress={() => setSelectedLevel(selectedLevel === level ? null : level)}
                      className={`rounded-full border px-4 py-2 ${
                        selectedLevel === level
                          ? 'border-primary bg-primary'
                          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-surface-dark'
                      }`}
                    >
                      <Text
                        style={{ fontFamily: fontFamily.medium }}
                        className={`text-sm capitalize ${
                          selectedLevel === level
                            ? 'text-gray-900'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View className="mt-4 flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  clearFilters();
                  setShowFilters(false);
                }}
                className="flex-1 items-center rounded-xl bg-gray-100 py-4 dark:bg-gray-800"
              >
                <Text
                  style={{ fontFamily: fontFamily.semiBold }}
                  className="text-base text-gray-700 dark:text-gray-300"
                >
                  Clear All
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowFilters(false)}
                className="flex-1 items-center rounded-xl bg-primary py-4"
              >
                <Text style={{ fontFamily: fontFamily.semiBold }} className="text-base text-gray-900">
                  Apply Filters
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}