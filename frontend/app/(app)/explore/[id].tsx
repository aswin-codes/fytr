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
      <View className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color="#F6F000" />
      </View>
    );
  }

  if (!exercise) {
    return (
      <View className="flex-1 items-center justify-center bg-background-light px-4 dark:bg-background-dark">
        <Text className="mb-4 text-6xl">😔</Text>
        <Text className="mb-2 text-xl font-bold text-textPrimary-light dark:text-textPrimary-dark">
          Exercise not found
        </Text>
        <Text className="mb-6 text-center text-textSecondary-light dark:text-textSecondary-dark">
          This exercise may have been removed or doesn't exist.
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="rounded-xl bg-primary px-6 py-3">
          <Text className="text-base font-semibold text-textPrimary-light">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header with Back Button */}
      <View className="flex-row items-center border-b border-border-light bg-surface-light px-4 pb-4 pt-12 dark:border-border-dark dark:bg-surface-dark">
        <View className=" items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-background-light dark:bg-background-dark">
            <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#0F0F0F'} />
          </TouchableOpacity>
        </View>
        <Text className="text-2xl font-bold text-textPrimary-light dark:text-textPrimary-dark">
          {exercise.name}
        </Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Auto-playing Image Frames */}
        {exercise.image_urls && exercise.image_urls.length > 0 && (
          <View className="relative h-[245px] overflow-hidden bg-surface-light dark:bg-surface-dark">
            {/* Blurred Background */}
            <Image
              source={{ uri: exercise.image_urls[activeImageIndex] }}
              className="absolute h-full w-full"
              resizeMode="cover"
              blurRadius={20}
            />

            {/* Main Image (contains properly) */}
            <Image
              source={{ uri: exercise.image_urls[activeImageIndex] }}
              className="h-full w-full"
              resizeMode="contain"
            />

            {/* Frame Indicator */}
            {exercise.image_urls.length > 1 && (
              <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2">
                {exercise.image_urls.map((_, index) => (
                  <View
                    key={index}
                    className={`h-2 w-2 rounded-full transition-all ${
                      index === activeImageIndex ? 'w-6 bg-primary' : 'bg-white/50 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </View>
            )}

            {/* Overlay badge showing animation */}
            {exercise.image_urls.length > 1 && (
              <View className="absolute right-4 top-4 flex-row items-center gap-1 rounded-full bg-black/70 px-3 py-1.5">
                <View className="h-2 w-2 rounded-full bg-primary" />
                <Text className="text-xs font-semibold text-white">LIVE</Text>
              </View>
            )}
          </View>
        )}

        {/* AI Form Analysis CTA - FEATURED */}
        <View className="mx-4 mb-2 mt-4">
          <TouchableOpacity
            onPress={() => router.push(`/(app)/ai`)}
            className="flex-row items-center justify-between rounded-2xl bg-primary p-4 shadow-lg"
            style={{
              shadowColor: '#F6F000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}>
            <View className="flex-1">
              <View className="mb-1 flex-row items-center gap-2">
                <Ionicons name="sparkles" size={20} color="#0F0F0F" />
                <Text className="text-lg font-bold text-textPrimary-light">AI Form Analysis</Text>
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
          <View className="mb-6 flex-row flex-wrap gap-2">
            {exercise.level && (
              <View className="flex-row items-center gap-2 rounded-xl border border-border-light bg-surface-light px-4 py-2 dark:border-border-dark dark:bg-surface-dark">
                <Ionicons name="bar-chart" size={16} color={isDark ? '#C7C7CC' : '#6B7280'} />
                <View>
                  <Text className="text-xs text-textMuted-light dark:text-textMuted-dark">
                    Level
                  </Text>
                  <Text className="text-sm font-semibold capitalize text-textPrimary-light dark:text-textPrimary-dark">
                    {exercise.level}
                  </Text>
                </View>
              </View>
            )}

            {exercise.equipment && (
              <View className="flex-row items-center gap-2 rounded-xl border border-border-light bg-surface-light px-4 py-2 dark:border-border-dark dark:bg-surface-dark">
                <Ionicons name="barbell" size={16} color={isDark ? '#C7C7CC' : '#6B7280'} />
                <View>
                  <Text className="text-xs text-textMuted-light dark:text-textMuted-dark">
                    Equipment
                  </Text>
                  <Text className="text-sm font-semibold capitalize text-textPrimary-light dark:text-textPrimary-dark">
                    {exercise.equipment}
                  </Text>
                </View>
              </View>
            )}

            {exercise.category && (
              <View className="flex-row items-center gap-2 rounded-xl border border-border-light bg-surface-light px-4 py-2 dark:border-border-dark dark:bg-surface-dark">
                <Ionicons name="fitness" size={16} color={isDark ? '#C7C7CC' : '#6B7280'} />
                <View>
                  <Text className="text-xs text-textMuted-light dark:text-textMuted-dark">
                    Category
                  </Text>
                  <Text className="text-sm font-semibold capitalize text-textPrimary-light dark:text-textPrimary-dark">
                    {exercise.category}
                  </Text>
                </View>
              </View>
            )}

            {exercise.force && (
              <View className="flex-row items-center gap-2 rounded-xl border border-border-light bg-surface-light px-4 py-2 dark:border-border-dark dark:bg-surface-dark">
                <Ionicons name="arrow-forward" size={16} color={isDark ? '#C7C7CC' : '#6B7280'} />
                <View>
                  <Text className="text-xs text-textMuted-light dark:text-textMuted-dark">
                    Force
                  </Text>
                  <Text className="text-sm font-semibold capitalize text-textPrimary-light dark:text-textPrimary-dark">
                    {exercise.force}
                  </Text>
                </View>
              </View>
            )}

            {exercise.mechanic && (
              <View className="flex-row items-center gap-2 rounded-xl border border-border-light bg-surface-light px-4 py-2 dark:border-border-dark dark:bg-surface-dark">
                <Ionicons name="git-network" size={16} color={isDark ? '#C7C7CC' : '#6B7280'} />
                <View>
                  <Text className="text-xs text-textMuted-light dark:text-textMuted-dark">
                    Mechanic
                  </Text>
                  <Text className="text-sm font-semibold capitalize text-textPrimary-light dark:text-textPrimary-dark">
                    {exercise.mechanic}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Muscles Worked Section */}
          {((exercise.primary_muscles && exercise.primary_muscles.length > 0) ||
            (exercise.secondary_muscles && exercise.secondary_muscles.length > 0)) && (
            <View className="mb-4 rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border-dark dark:bg-surface-dark">
              <Text className="mb-4 text-lg font-bold text-textPrimary-light dark:text-textPrimary-dark">
                Muscles Worked
              </Text>

              {/* Primary Muscles */}
              {exercise.primary_muscles && exercise.primary_muscles.length > 0 && (
                <View className="mb-3">
                  <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-textMuted-light dark:text-textMuted-dark">
                    Primary
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {exercise.primary_muscles.map((muscle, index) => (
                      <View key={index} className="rounded-full bg-primary px-4 py-2">
                        <Text className="text-sm font-semibold capitalize text-textPrimary-light">
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
                  <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-textMuted-light dark:text-textMuted-dark">
                    Secondary
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {exercise.secondary_muscles.map((muscle, index) => (
                      <View
                        key={index}
                        className="rounded-full border border-border-light bg-background-light px-4 py-2 dark:border-border-dark dark:bg-background-dark">
                        <Text className="text-sm capitalize text-textSecondary-light dark:text-textSecondary-dark">
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
            <View className="mb-4 rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border-dark dark:bg-surface-dark">
              <Text className="mb-4 text-lg font-bold text-textPrimary-light dark:text-textPrimary-dark">
                How to Perform
              </Text>
              <View className="flex gap-2">
              {exercise.instructions.map((instruction, index) => (
                <View key={index} className="  flex-row last:mb-0">
                  <View className="mr-3 mt-0.5 h-8 w-8 items-center justify-center rounded-full bg-primary">
                    <Text className="text-sm font-bold text-textPrimary-light">{index + 1}</Text>
                  </View>
                  <Text className="flex-1 text-sm leading-6 text-textSecondary-light dark:text-textSecondary-dark">
                    {instruction.trim()}
                  </Text>
                </View>
                
              ))}
              </View>
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



        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
