import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamily } from '@/src/theme/fontFamily';
import { useWorkoutPlanStore } from '@/src/store/workoutPlanStore';
import { ChevronRight, Check } from 'lucide-react-native';

// Progress dots configuration
const TOTAL_STEPS = 4;
const CURRENT_STEP = 2;

// Days of the week
const DAYS_OF_WEEK = [
  { day: 'monday', label: 'Monday' },
  { day: 'tuesday', label: 'Tuesday' },
  { day: 'wednesday', label: 'Wednesday' },
  { day: 'thursday', label: 'Thursday' },
  { day: 'friday', label: 'Friday' },
  { day: 'saturday', label: 'Saturday' },
  { day: 'sunday', label: 'Sunday' },
];

export default function WeeklySplitScreen() {
  const router = useRouter();
  const { currentEditingPlan, getDayWorkout, startEditingPlan } = useWorkoutPlanStore();

  useEffect(() => {
    // Initialize editing plan if not already started
    if (!currentEditingPlan) {
      startEditingPlan();
    }
  }, []);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleDayPress = (day: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate directly to muscle group selection
    router.push({
      pathname: '/(plan)/MuscleGroupScreen',
      params: { day },
    });
  };

  const handleConfirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Check if at least 3 days are configured
    const workoutDaysCount = currentEditingPlan?.schedule.filter(d => !d.isRestDay).length || 0;
    
    if (workoutDaysCount < 3) {
      // Show alert or toast
      alert('Please configure at least 3 workout days to continue');
      return;
    }

    // Navigate to next step (to be created)
    // router.push('/(plan)/review-plan');
    
    // For now, just show confirmation
    alert('Plan configuration complete! (Next screen coming soon)');
  };

  const getDayIcon = (day: string) => {
    const dayWorkout = getDayWorkout(day);
    return dayWorkout?.icon || '🛌';
  };

  const getDayLabel = (day: string) => {
    const dayWorkout = getDayWorkout(day);
    return dayWorkout?.label || 'Rest Day';
  };

  const isDayConfigured = (day: string) => {
    const dayWorkout = getDayWorkout(day);
    return dayWorkout ? !dayWorkout.isRestDay : false;
  };

  const isRestDay = (day: string) => {
    const dayWorkout = getDayWorkout(day);
    return dayWorkout?.isRestDay !== false;
  };

  // Calculate configured days count
  const configuredDaysCount = currentEditingPlan?.schedule.filter(d => !d.isRestDay).length || 0;

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

            {/* Progress Dots */}
            <View className="flex-row gap-2">
              {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
                <View
                  key={index}
                  className={`h-1.5 rounded-full ${
                    index < CURRENT_STEP
                      ? 'bg-primary w-8'
                      : 'bg-gray-300 dark:bg-gray-700 w-2'
                  }`}
                />
              ))}
            </View>

            {/* Empty space for symmetry */}
            <View className="w-12" />
          </View>

          {/* Title and Description */}
          <View>
            <Text
              style={{ fontFamily: fontFamily.bold }}
              className="text-3xl text-textPrimary-light dark:text-textPrimary-dark mb-3"
            >
              Set your weekly workout split
            </Text>

            <Text
              style={{ fontFamily: fontFamily.regular }}
              className="text-base text-textSecondary-light dark:text-textSecondary-dark"
            >
              Build a routine that fits your life. Tap a day to assign a muscle group or activity.
            </Text>
          </View>
        </View>

        {/* Days List */}
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 200 }}
        >
          <View className="gap-3">
            {DAYS_OF_WEEK.map(({ day, label }) => {
              const configured = isDayConfigured(day);
              const restDay = isRestDay(day);
              const dayLabel = getDayLabel(day);
              const icon = getDayIcon(day);

              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => handleDayPress(day)}
                  activeOpacity={0.7}
                  className={`rounded-3xl p-5 flex-row items-center ${
                    configured
                      ? 'bg-white dark:bg-surface-dark border-2 border-primary'
                      : 'bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700'
                  }`}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: configured ? 0.1 : 0.03,
                    shadowRadius: 8,
                    elevation: configured ? 3 : 1,
                  }}
                >
                  {/* Icon */}
                  <View
                    className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 ${
                      restDay
                        ? 'bg-gray-100 dark:bg-gray-800'
                        : configured
                        ? 'bg-primary/10'
                        : 'bg-orange-100 dark:bg-orange-900/30'
                    }`}
                  >
                    <Text className="text-3xl">{icon}</Text>
                  </View>

                  {/* Day Info */}
                  <View className="flex-1">
                    <Text
                      style={{ fontFamily: fontFamily.bold }}
                      className="text-xl text-textPrimary-light dark:text-textPrimary-dark mb-1"
                    >
                      {label}
                    </Text>
                    <Text
                      style={{ fontFamily: fontFamily.regular }}
                      className={`text-sm ${
                        restDay
                          ? 'text-textSecondary-light dark:text-textSecondary-dark'
                          : 'text-primary'
                      }`}
                    >
                      {dayLabel}
                    </Text>
                  </View>

                  {/* Right Icon */}
                  {configured ? (
                    <View className="w-8 h-8 rounded-full bg-primary items-center justify-center">
                      <Check size={18} color="#000000" strokeWidth={3} />
                    </View>
                  ) : (
                    <ChevronRight size={24} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom Button */}
        <View className="absolute bottom-0 left-0 right-0 bg-background-light dark:bg-background-dark px-6 pb-8 pt-4 border-t border-gray-200 dark:border-gray-800">
          {/* Progress Info */}
          <View className="mb-4 flex-row items-center justify-center">
            <Text
              style={{ fontFamily: fontFamily.medium }}
              className="text-sm text-textSecondary-light dark:text-textSecondary-dark"
            >
              {configuredDaysCount} of 3 minimum days configured
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleConfirm}
            activeOpacity={0.8}
            disabled={configuredDaysCount < 3}
            className={`h-16 rounded-full items-center justify-center flex-row ${
              configuredDaysCount < 3
                ? 'bg-gray-300 dark:bg-gray-700'
                : 'bg-primary'
            }`}
            style={{
              shadowColor: configuredDaysCount >= 3 ? '#F6F000' : '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: configuredDaysCount >= 3 ? 0.3 : 0,
              shadowRadius: 12,
              elevation: configuredDaysCount >= 3 ? 4 : 0,
            }}
          >
            <Text
              style={{ fontFamily: fontFamily.bold }}
              className={`text-lg mr-2 ${
                configuredDaysCount < 3
                  ? 'text-gray-500 dark:text-gray-400'
                  : 'text-black'
              }`}
            >
              Confirm Schedule
            </Text>
            <Ionicons
              name="arrow-forward"
              size={24}
              color={configuredDaysCount < 3 ? '#6B7280' : '#000000'}
            />
          </TouchableOpacity>

          {configuredDaysCount < 3 && (
            <Text
              style={{ fontFamily: fontFamily.regular }}
              className="text-center text-sm text-textSecondary-light dark:text-textSecondary-dark mt-3"
            >
              Configure at least 3 workout days to continue
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}