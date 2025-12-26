import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getExerciseById } from '../../../src/db/exerciseRepo';
import { Exercise } from '../../../src/db/exerciseRepo';

const { width } = Dimensions.get('window');

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    loadExercise();
  }, [id]);

  const loadExercise = async () => {
    try {
      setLoading(true);
      const data = await getExerciseById(id);
      setExercise(data);
    } catch (error) {
      console.error('Failed to load exercise:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#F8F9FB] items-center justify-center">
        <ActivityIndicator size="large" color="#F6F000" />
      </View>
    );
  }

  if (!exercise) {
    return (
      <View className="flex-1 bg-[#F8F9FB] items-center justify-center px-4">
        <Text className="text-6xl mb-4">😔</Text>
        <Text className="text-xl font-bold text-gray-900 mb-2">Exercise not found</Text>
        <Text className="text-gray-500 text-center mb-6">
          This exercise may have been removed or doesn't exist.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-[#F6F000] rounded-xl px-6 py-3"
        >
          <Text className="text-base font-semibold text-gray-900">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8F9FB]">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Back Button */}
        <View className="bg-white pt-12 pb-4 px-4 border-b border-gray-100">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center bg-gray-100 rounded-full mb-4"
          >
            <Text className="text-xl">←</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-[#0F0F0F]">{exercise.name}</Text>
        </View>

        {/* Image Carousel */}
        {exercise.image_urls && exercise.image_urls.length > 0 && (
          <View>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(event) => {
                const slideIndex = Math.round(
                  event.nativeEvent.contentOffset.x / width
                );
                setActiveImageIndex(slideIndex);
              }}
              scrollEventThrottle={16}
            >
              {exercise.image_urls.map((url, index) => (
                <View key={index} style={{ width }}>
                  <Image
                    source={{ uri: url }}
                    className="w-full h-80"
                    resizeMode="cover"
                  />
                </View>
              ))}
            </ScrollView>

            {/* Image Pagination Dots */}
            {exercise.image_urls.length > 1 && (
              <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2">
                {exercise.image_urls.map((_, index) => (
                  <View
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === activeImageIndex ? 'bg-[#F6F000]' : 'bg-white/50'
                    }`}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Details Section */}
        <View className="p-4">
          {/* Quick Info Cards */}
          <View className="flex-row flex-wrap gap-2 mb-6">
            {exercise.category && (
              <View className="bg-white rounded-xl px-4 py-2 border border-gray-100">
                <Text className="text-xs text-gray-500 mb-0.5">Category</Text>
                <Text className="text-sm font-semibold text-gray-900 capitalize">
                  {exercise.category}
                </Text>
              </View>
            )}

            {exercise.equipment && (
              <View className="bg-white rounded-xl px-4 py-2 border border-gray-100">
                <Text className="text-xs text-gray-500 mb-0.5">Equipment</Text>
                <Text className="text-sm font-semibold text-gray-900 capitalize">
                  {exercise.equipment}
                </Text>
              </View>
            )}

            {exercise.level && (
              <View className="bg-white rounded-xl px-4 py-2 border border-gray-100">
                <Text className="text-xs text-gray-500 mb-0.5">Level</Text>
                <Text className="text-sm font-semibold text-gray-900 capitalize">
                  {exercise.level}
                </Text>
              </View>
            )}

            {exercise.force && (
              <View className="bg-white rounded-xl px-4 py-2 border border-gray-100">
                <Text className="text-xs text-gray-500 mb-0.5">Force</Text>
                <Text className="text-sm font-semibold text-gray-900 capitalize">
                  {exercise.force}
                </Text>
              </View>
            )}

            {exercise.mechanic && (
              <View className="bg-white rounded-xl px-4 py-2 border border-gray-100">
                <Text className="text-xs text-gray-500 mb-0.5">Mechanic</Text>
                <Text className="text-sm font-semibold text-gray-900 capitalize">
                  {exercise.mechanic}
                </Text>
              </View>
            )}
          </View>

          {/* Primary Muscles */}
          {exercise.primary_muscles && exercise.primary_muscles.length > 0 && (
            <View className="bg-white rounded-2xl p-4 mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-3">Primary Muscles</Text>
              <View className="flex-row flex-wrap gap-2">
                {exercise.primary_muscles.map((muscle, index) => (
                  <View key={index} className="bg-[#F6F000] rounded-full px-4 py-2">
                    <Text className="text-sm font-semibold text-gray-900 capitalize">
                      {muscle}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Secondary Muscles */}
          {exercise.secondary_muscles && exercise.secondary_muscles.length > 0 && (
            <View className="bg-white rounded-2xl p-4 mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-3">Secondary Muscles</Text>
              <View className="flex-row flex-wrap gap-2">
                {exercise.secondary_muscles.map((muscle, index) => (
                  <View key={index} className="bg-yellow-50 rounded-full px-4 py-2 border border-gray-200">
                    <Text className="text-sm text-gray-700 capitalize">{muscle}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Instructions */}
          {exercise.instructions && exercise.instructions.length > 0 && (
            <View className="bg-white rounded-2xl p-4 mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-4">
                How to perform
              </Text>
              {exercise.instructions.map((instruction, index) => (
                <View key={index} className="flex-row mb-4">
                  <View className="w-8 h-8 bg-[#F6F000] rounded-full items-center justify-center mr-3 mt-0.5">
                    <Text className="text-sm font-bold text-gray-900">{index + 1}</Text>
                  </View>
                  <Text className="flex-1 text-sm text-gray-700 leading-6">
                    {instruction.trim()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}