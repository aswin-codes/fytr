import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getExerciseById } from '../../../src/db/exerciseRepo';
import { Exercise } from '../../../src/db/exerciseRepo';
import { Ionicons } from '@expo/vector-icons';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    loadExercise();
  }, [id]);

  // Auto-play image frames (alternating between 2 images every second)
  useEffect(() => {
    if (!exercise?.image_urls || exercise.image_urls.length < 2) return;

    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % exercise.image_urls.length);
    }, 1000); // Change image every 1 second

    return () => clearInterval(interval);
  }, [exercise]);

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
      <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#F6F000" />
      </View>
    );
  }

  if (!exercise) {
    return (
      <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center px-4">
        <Text className="text-6xl mb-4">😔</Text>
        <Text className="text-xl font-bold text-textPrimary-light dark:text-textPrimary-dark mb-2">
          Exercise not found
        </Text>
        <Text className="text-textSecondary-light dark:text-textSecondary-dark text-center mb-6">
          This exercise may have been removed or doesn't exist.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-primary rounded-xl px-6 py-3"
        >
          <Text className="text-base font-semibold text-textPrimary-light">
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      
        {/* Header with Back Button */}
        <View className="bg-surface-light flex-row gap-2 items-center dark:bg-surface-dark pt-12 pb-4 px-4 border-b border-border-light dark:border-border-dark">
          <View className="flex-row items-center justify-between ">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center bg-background-light dark:bg-background-dark rounded-full"
            >
              <Ionicons 
                name="arrow-back" 
                size={24} 
                color={isDark ? '#FFFFFF' : '#0F0F0F'} 
              />
            </TouchableOpacity>
          </View>
          <Text className="text-2xl font-bold text-textPrimary-light dark:text-textPrimary-dark">
            {exercise.name}
          </Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
        {/* Auto-playing Image Frames */}
        {exercise.image_urls && exercise.image_urls.length > 0 && (
          <View className="relative bg-surface-light dark:bg-surface-dark">
            <Image
              source={{ uri: exercise.image_urls[activeImageIndex] }}
              className="w-full h-80"
              resizeMode="cover"
            />
            
            {/* Frame Indicator */}
            {exercise.image_urls.length > 1 && (
              <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2">
                {exercise.image_urls.map((_, index) => (
                  <View
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === activeImageIndex 
                        ? 'bg-primary w-6' 
                        : 'bg-white/50 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </View>
            )}

            {/* Overlay badge showing animation */}
            {exercise.image_urls.length > 1 && (
              <View className="absolute top-4 right-4 bg-black/70 rounded-full px-3 py-1.5 flex-row items-center gap-1">
                <View className="w-2 h-2 bg-primary rounded-full" />
                <Text className="text-white text-xs font-semibold">LIVE</Text>
              </View>
            )}
          </View>
        )}

        {/* AI Form Analysis CTA - FEATURED */}
        <View className="mx-4 mt-4 mb-2">
          <TouchableOpacity
            onPress={() => router.push('/(app)/ai')}
            className="bg-primary rounded-2xl p-4 flex-row items-center justify-between shadow-lg"
            style={{
              shadowColor: '#F6F000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-1">
                <Ionicons name="sparkles" size={20} color="#0F0F0F" />
                <Text className="text-lg font-bold text-textPrimary-light">
                  AI Form Analysis
                </Text>
              </View>
              <Text className="text-sm text-textSecondary-light">
                Get real-time feedback on your technique
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#0F0F0F" />
          </TouchableOpacity>
        </View>

        {/* Details Section */}
        <View className="p-4">
          {/* Quick Info Cards */}
          <View className="flex-row flex-wrap gap-2 mb-6">
            {exercise.level && (
              <View className="bg-surface-light dark:bg-surface-dark rounded-xl px-4 py-2 border border-border-light dark:border-border-dark flex-row items-center gap-2">
                <Ionicons 
                  name="bar-chart" 
                  size={16} 
                  color={isDark ? '#C7C7CC' : '#6B7280'} 
                />
                <View>
                  <Text className="text-xs text-textMuted-light dark:text-textMuted-dark">
                    Level
                  </Text>
                  <Text className="text-sm font-semibold text-textPrimary-light dark:text-textPrimary-dark capitalize">
                    {exercise.level}
                  </Text>
                </View>
              </View>
            )}

            {exercise.equipment && (
              <View className="bg-surface-light dark:bg-surface-dark rounded-xl px-4 py-2 border border-border-light dark:border-border-dark flex-row items-center gap-2">
                <Ionicons 
                  name="barbell" 
                  size={16} 
                  color={isDark ? '#C7C7CC' : '#6B7280'} 
                />
                <View>
                  <Text className="text-xs text-textMuted-light dark:text-textMuted-dark">
                    Equipment
                  </Text>
                  <Text className="text-sm font-semibold text-textPrimary-light dark:text-textPrimary-dark capitalize">
                    {exercise.equipment}
                  </Text>
                </View>
              </View>
            )}

            {exercise.category && (
              <View className="bg-surface-light dark:bg-surface-dark rounded-xl px-4 py-2 border border-border-light dark:border-border-dark flex-row items-center gap-2">
                <Ionicons 
                  name="fitness" 
                  size={16} 
                  color={isDark ? '#C7C7CC' : '#6B7280'} 
                />
                <View>
                  <Text className="text-xs text-textMuted-light dark:text-textMuted-dark">
                    Category
                  </Text>
                  <Text className="text-sm font-semibold text-textPrimary-light dark:text-textPrimary-dark capitalize">
                    {exercise.category}
                  </Text>
                </View>
              </View>
            )}

            {exercise.force && (
              <View className="bg-surface-light dark:bg-surface-dark rounded-xl px-4 py-2 border border-border-light dark:border-border-dark flex-row items-center gap-2">
                <Ionicons 
                  name="arrow-forward" 
                  size={16} 
                  color={isDark ? '#C7C7CC' : '#6B7280'} 
                />
                <View>
                  <Text className="text-xs text-textMuted-light dark:text-textMuted-dark">
                    Force
                  </Text>
                  <Text className="text-sm font-semibold text-textPrimary-light dark:text-textPrimary-dark capitalize">
                    {exercise.force}
                  </Text>
                </View>
              </View>
            )}

            {exercise.mechanic && (
              <View className="bg-surface-light dark:bg-surface-dark rounded-xl px-4 py-2 border border-border-light dark:border-border-dark flex-row items-center gap-2">
                <Ionicons 
                  name="git-network" 
                  size={16} 
                  color={isDark ? '#C7C7CC' : '#6B7280'} 
                />
                <View>
                  <Text className="text-xs text-textMuted-light dark:text-textMuted-dark">
                    Mechanic
                  </Text>
                  <Text className="text-sm font-semibold text-textPrimary-light dark:text-textPrimary-dark capitalize">
                    {exercise.mechanic}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Muscles Worked Section */}
          {((exercise.primary_muscles && exercise.primary_muscles.length > 0) ||
            (exercise.secondary_muscles && exercise.secondary_muscles.length > 0)) && (
            <View className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 mb-4 border border-border-light dark:border-border-dark">
              <Text className="text-lg font-bold text-textPrimary-light dark:text-textPrimary-dark mb-4">
                Muscles Worked
              </Text>
              
              {/* Primary Muscles */}
              {exercise.primary_muscles && exercise.primary_muscles.length > 0 && (
                <View className="mb-3">
                  <Text className="text-xs font-semibold text-textMuted-light dark:text-textMuted-dark mb-2 uppercase tracking-wider">
                    Primary
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {exercise.primary_muscles.map((muscle, index) => (
                      <View key={index} className="bg-primary rounded-full px-4 py-2">
                        <Text className="text-sm font-semibold text-textPrimary-light capitalize">
                          {muscle}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Secondary Muscles */}
              {exercise.secondary_muscles && exercise.secondary_muscles.length > 0 && (
                <View>
                  <Text className="text-xs font-semibold text-textMuted-light dark:text-textMuted-dark mb-2 uppercase tracking-wider">
                    Secondary
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {exercise.secondary_muscles.map((muscle, index) => (
                      <View 
                        key={index} 
                        className="bg-background-light dark:bg-background-dark rounded-full px-4 py-2 border border-border-light dark:border-border-dark"
                      >
                        <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark capitalize">
                          {muscle}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Instructions */}
          {exercise.instructions && exercise.instructions.length > 0 && (
            <View className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 mb-4 border border-border-light dark:border-border-dark">
              <Text className="text-lg font-bold text-textPrimary-light dark:text-textPrimary-dark mb-4">
                How to Perform
              </Text>
              {exercise.instructions.map((instruction, index) => (
                <View key={index} className="flex-row mb-4 last:mb-0">
                  <View className="w-8 h-8 bg-primary rounded-full items-center justify-center mr-3 mt-0.5">
                    <Text className="text-sm font-bold text-textPrimary-light">
                      {index + 1}
                    </Text>
                  </View>
                  <Text className="flex-1 text-sm text-textSecondary-light dark:text-textSecondary-dark leading-6">
                    {instruction.trim()}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Tips Section (if available) 
          <View className="bg-info/10 dark:bg-info/20 rounded-2xl p-4 mb-4 border border-info/20">
            <View className="flex-row items-start gap-3">
              <View className="w-8 h-8 bg-info rounded-full items-center justify-center mt-0.5">
                <Ionicons name="bulb" size={18} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-textPrimary-light dark:text-textPrimary-dark mb-1">
                  Pro Tip
                </Text>
                <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark leading-6">
                  Focus on controlled movement and proper breathing. Keep your core engaged throughout the exercise for better stability and results.
                </Text>
              </View>
            </View>
          </View>*/}
        </View>

        {/* Bottom CTA 
        <View className="px-4 pb-8">
          <TouchableOpacity
            onPress={() => router.push(`/workout/add-exercise/${id}`)}
            className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 flex-row items-center justify-center gap-2 border-2 border-border-light dark:border-border-dark"
          >
            <Ionicons 
              name="add-circle" 
              size={24} 
              color={isDark ? '#FFFFFF' : '#0F0F0F'} 
            />
            <Text className="text-base font-bold text-textPrimary-light dark:text-textPrimary-dark">
              Add to Workout
            </Text>
          </TouchableOpacity>
        </View>*/}

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}