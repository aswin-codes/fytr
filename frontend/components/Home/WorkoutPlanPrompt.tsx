import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { fontFamily } from '@/src/theme/fontFamily';
import { useRouter } from 'expo-router';
import { Calendar, Trophy, Zap } from 'lucide-react-native';
import { useWorkoutPlanStore } from '@/src/store/workoutPlanStore';
import * as Haptics from 'expo-haptics';

const WorkoutPlanPrompt = () => {
  const { currentPlan, initializeWeeklySchedule } = useWorkoutPlanStore();
  const router = useRouter();

  // Don't show if user already has a plan
  if (currentPlan) {
    return null;
  }

  const handleCreatePlan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    initializeWeeklySchedule();
    router.push('/(plan)/PlanTypeScreen');
  };

  return (
    <View className="mx-6 my-4">
      {/* Main Card */}
      <View className="overflow-hidden rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
        {/* Header with XP Badge */}
        <View className="flex-row items-center justify-between border-b border-primary/20 bg-primary/10 px-5 py-3">
          <View className="flex-row items-center">
            <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-primary">
              <Zap size={16} color="#000" fill="#000" />
            </View>
            <Text
              style={{ fontFamily: fontFamily.bold }}
              className="text-sm text-textPrimary-light dark:text-textPrimary-dark">
              EARN 50 XP
            </Text>
          </View>
          <View className="rounded-full bg-primary px-3 py-1">
            <Text style={{ fontFamily: fontFamily.bold }} className="text-xs text-black">
              NEW
            </Text>
          </View>
        </View>

        {/* Content */}
        <View className="p-6">
          {/* Icon */}
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
            <Calendar size={32} color="#F6F000" strokeWidth={2} />
          </View>

          {/* Title */}
          <Text
            style={{ fontFamily: fontFamily.bold }}
            className="mb-2 text-2xl text-textPrimary-light dark:text-textPrimary-dark">
            Create Your Workout Plan
          </Text>

          {/* Description */}
          <Text
            style={{ fontFamily: fontFamily.regular }}
            className="mb-4 text-base leading-6 text-textSecondary-light dark:text-textSecondary-dark">
            Build a personalized training schedule and earn{' '}
            <Text style={{ fontFamily: fontFamily.bold }} className="text-primary">
              50 XP
            </Text>{' '}
            to climb the leaderboard.
          </Text>

          {/* Benefits */}
          <View className="mb-5 space-y-2">
            <View className="flex-row items-center">
              <View className="mr-3 h-2 w-2 rounded-full bg-primary" />
              <Text
                style={{ fontFamily: fontFamily.regular }}
                className="flex-1 text-sm text-textSecondary-light dark:text-textSecondary-dark">
                Get structured weekly workout schedule
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className="mr-3 h-2 w-2 rounded-full bg-primary" />
              <Text
                style={{ fontFamily: fontFamily.regular }}
                className="flex-1 text-sm text-textSecondary-light dark:text-textSecondary-dark">
                Track your progress consistently
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className="mr-3 h-2 w-2 rounded-full bg-primary" />
              <Text
                style={{ fontFamily: fontFamily.regular }}
                className="flex-1 text-sm text-textSecondary-light dark:text-textSecondary-dark">
                Compete on leaderboard with 50 XP bonus
              </Text>
            </View>
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            onPress={handleCreatePlan}
            className="h-14 flex-row items-center justify-center rounded-full bg-primary"
            activeOpacity={0.8}>
            <Trophy size={20} color="#000" />
            <Text
              style={{ fontFamily: fontFamily.bold }}
              className="ml-2 text-base text-black">
              Create Plan & Earn 50 XP
            </Text>
          </TouchableOpacity>

          {/* Time Estimate */}
          <Text
            style={{ fontFamily: fontFamily.regular }}
            className="mt-3 text-center text-xs text-textMuted-light dark:text-textMuted-dark">
            Takes only 3-5 minutes
          </Text>
        </View>
      </View>
    </View>
  );
};

export default WorkoutPlanPrompt;