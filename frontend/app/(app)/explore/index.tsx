import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { getAllExercises, filterExercises, getFilterOptions } from '@/src/db/exerciseRepo';
import { forceSyncExercises } from '@/src/controllers/exerciseSyncController';
import { Exercise } from '@/src/types/exerciseTypes';

export default function ExploreScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  // Filter options
  const [filterOptions, setFilterOptions] = useState({
    categories: [] as string[],
    equipment: [] as string[],
    levels: [] as string[],
  });

  // Load exercises on mount
  useEffect(() => {
    loadExercises();
    loadFilterOptions();
  }, []);

  // Apply search and filters
  useEffect(() => {
    applyFiltersAndSearch();
  }, [searchQuery, selectedCategory, selectedEquipment, selectedLevel, exercises]);

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

      // Apply filters first
      if (selectedCategory || selectedEquipment || selectedLevel) {
        result = await filterExercises({
          category: selectedCategory || undefined,
          equipment: selectedEquipment || undefined,
          level: selectedLevel || undefined,
        });
      }

      // Then apply search
      if (searchQuery.trim()) {
        result = result.filter(ex =>
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
    setSelectedCategory(null);
    setSelectedEquipment(null);
    setSelectedLevel(null);
    setSearchQuery('');
  };

  const activeFilterCount = [selectedCategory, selectedEquipment, selectedLevel].filter(Boolean).length;

  const renderExerciseCard = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      onPress={() => router.push(`/explore/${item.id}`)}
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
    >
      <View className="flex-row">
        {/* Exercise Image */}
        <View className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden mr-4">
          {item.image_urls && item.image_urls.length > 0 ? (
            <Image
              source={{ uri: item.image_urls[0] }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Text className="text-gray-400 text-xs">No image</Text>
            </View>
          )}
        </View>

        {/* Exercise Info */}
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 mb-1">{item.name}</Text>
          
          <View className="flex-row flex-wrap gap-1 mb-2">
            {item.primary_muscles?.map((muscle, idx) => (
              <View key={idx} className="bg-yellow-50 px-2 py-0.5 rounded-full">
                <Text className="text-xs text-gray-700 capitalize">{muscle}</Text>
              </View>
            ))}
          </View>

          <View className="flex-row items-center gap-2">
            {item.equipment && (
              <Text className="text-xs text-gray-500 capitalize">{item.equipment}</Text>
            )}
            {item.level && (
              <>
                <Text className="text-gray-300">•</Text>
                <Text className="text-xs text-gray-500 capitalize">{item.level}</Text>
              </>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-[#F8F9FB] items-center justify-center">
        <ActivityIndicator size="large" color="#F6F000" />
        <Text className="mt-4 text-gray-600">Loading exercises...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8F9FB]">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-[#0F0F0F] mb-4">Explore Exercises</Text>

        {/* Search Bar */}
        <View className="flex-row items-center gap-2">
          <View className="flex-1 bg-gray-100 rounded-xl px-4 py-3 flex-row items-center">
            <Text className="text-gray-400 mr-2">🔍</Text>
            <TextInput
              placeholder="Search exercises..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 text-base text-gray-900"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Filter Button */}
          <TouchableOpacity
            onPress={() => setShowFilters(true)}
            className="bg-[#F6F000] rounded-xl px-4 py-3 flex-row items-center"
          >
            <Text className="text-base font-semibold mr-1">⚙️</Text>
            {activeFilterCount > 0 && (
              <View className="bg-gray-900 rounded-full w-5 h-5 items-center justify-center">
                <Text className="text-white text-xs font-bold">{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <View className="flex-row items-center gap-2 mt-3">
            <Text className="text-xs text-gray-500">Filters:</Text>
            {selectedCategory && (
              <View className="bg-yellow-100 px-2 py-1 rounded-full">
                <Text className="text-xs text-gray-700 capitalize">{selectedCategory}</Text>
              </View>
            )}
            {selectedEquipment && (
              <View className="bg-yellow-100 px-2 py-1 rounded-full">
                <Text className="text-xs text-gray-700 capitalize">{selectedEquipment}</Text>
              </View>
            )}
            {selectedLevel && (
              <View className="bg-yellow-100 px-2 py-1 rounded-full">
                <Text className="text-xs text-gray-700 capitalize">{selectedLevel}</Text>
              </View>
            )}
            <TouchableOpacity onPress={clearFilters}>
              <Text className="text-xs text-[#F6F000] font-semibold">Clear all</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Results Count */}
      <View className="px-4 py-3 bg-white border-b border-gray-100">
        <Text className="text-sm text-gray-600">
          {filteredExercises.length} {filteredExercises.length === 1 ? 'exercise' : 'exercises'} found
        </Text>
      </View>

      {/* Exercise List */}
      <FlatList
        data={filteredExercises}
        renderItem={renderExerciseCard}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#F6F000"
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Text className="text-6xl mb-4">🔍</Text>
            <Text className="text-lg font-semibold text-gray-900 mb-2">No exercises found</Text>
            <Text className="text-gray-500 text-center">
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
          <View className="bg-white rounded-t-3xl pt-6 pb-8 px-4 max-h-[80%]">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text className="text-2xl text-gray-400">✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={[
                { title: 'Category', options: filterOptions.categories, selected: selectedCategory, setter: setSelectedCategory },
                { title: 'Equipment', options: filterOptions.equipment, selected: selectedEquipment, setter: setSelectedEquipment },
                { title: 'Level', options: filterOptions.levels, selected: selectedLevel, setter: setSelectedLevel },
              ]}
              renderItem={({ item }) => (
                <View className="mb-6">
                  <Text className="text-sm font-semibold text-gray-700 mb-3">{item.title}</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {item.options.map(option => (
                      <TouchableOpacity
                        key={option}
                        onPress={() => item.setter(item.selected === option ? null : option)}
                        className={`px-4 py-2 rounded-full border ${
                          item.selected === option
                            ? 'bg-[#F6F000] border-[#F6F000]'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <Text
                          className={`text-sm capitalize ${
                            item.selected === option ? 'text-gray-900 font-semibold' : 'text-gray-600'
                          }`}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
              keyExtractor={item => item.title}
            />

            {/* Footer Buttons */}
            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                onPress={() => {
                  clearFilters();
                  setShowFilters(false);
                }}
                className="flex-1 bg-gray-100 rounded-xl py-4 items-center"
              >
                <Text className="text-base font-semibold text-gray-700">Clear All</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowFilters(false)}
                className="flex-1 bg-[#F6F000] rounded-xl py-4 items-center"
              >
                <Text className="text-base font-semibold text-gray-900">Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}