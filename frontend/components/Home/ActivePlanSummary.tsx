import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { fontFamily } from '@/src/theme/fontFamily';
import { useRouter } from 'expo-router';
import { Calendar, ChevronRight, Flame } from 'lucide-react-native';
import { useWorkoutPlanStore } from '@/src/store/workoutPlanStore';
import * as Haptics from 'expo-haptics';

const ActivePlanSummary = () => {
  const { currentPlan } = useWorkoutPlanStore();
  const router = useRouter();

  if (!currentPlan) {
    return null;
  }

  const activeDays = currentPlan.weeklySchedule.filter((day) => !day.isRestDay);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayPlan = currentPlan.weeklySchedule.find((day) => day.day === today);

  const handleViewPlan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to workout plan view/edit screen
    //router.push('/(app)/home/ViewWorkoutPlan');
  };

  return (
    <View className="mx-6 my-4">
      <TouchableOpacity
        onPress={handleViewPlan}
        className="overflow-hidden rounded-3xl bg-card-light dark:bg-card-dark"
        activeOpacity={0.8}>
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-border-light p-5 dark:border-border-dark">
          <View className="flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-primary/20">
              <Calendar size={20} color="#F6F000" />
            </View>
            <View>
              <Text
                style={{ fontFamily: fontFamily.bold }}
                className="text-base text-textPrimary-light dark:text-textPrimary-dark">
                Your Workout Plan
              </Text>
              <Text
                style={{ fontFamily: fontFamily.regular }}
                className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
                {activeDays.length} workouts per week
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color="#9CA3AF" />
        </View>

        {/* Today's Workout */}
        <View className="p-5">
          {todayPlan && !todayPlan.isRestDay ? (
            <View>
              <View className="mb-3 flex-row items-center">
                <Flame size={16} color="#F6F000" />
                <Text
                  style={{ fontFamily: fontFamily.semiBold }}
                  className="ml-1 text-sm text-primary">
                  TODAY'S WORKOUT
                </Text>
              </View>
              <Text
                style={{ fontFamily: fontFamily.bold }}
                className="mb-2 text-xl text-textPrimary-light dark:text-textPrimary-dark">
                {todayPlan.label}
              </Text>
              <Text
                style={{ fontFamily: fontFamily.regular }}
                className="text-sm text-textSecondary-light dark:text-textSecondary-dark">
                {todayPlan.exercises.length} exercises scheduled
              </Text>
            </View>
          ) : (
            <View>
              <Text
                style={{ fontFamily: fontFamily.semiBold }}
                className="mb-2 text-base text-textSecondary-light dark:text-textSecondary-dark">
                Rest Day Today 🧘
              </Text>
              <Text
                style={{ fontFamily: fontFamily.regular }}
                className="text-sm text-textMuted-light dark:text-textMuted-dark">
                Recovery is just as important as training
              </Text>
            </View>
          )}
        </View>

        {/* View Details Button */}
        <View className="border-t border-border-light px-5 py-4 dark:border-border-dark">
          <Text
            style={{ fontFamily: fontFamily.semiBold }}
            className="text-center text-sm text-primary">
            View Full Schedule →
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ActivePlanSummary;