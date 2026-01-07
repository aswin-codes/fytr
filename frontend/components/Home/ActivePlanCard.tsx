import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { fontFamily } from '@/src/theme/fontFamily';
import { DayWorkout } from '@/src/store/workoutPlanStore';
import { Play, Dumbbell } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface ActivePlanCardProps {
  workout: DayWorkout;
  onStartWorkout: () => void;
  onViewFullPlan: () => void;
}

export default function ActivePlanCard({
  workout,
  onStartWorkout,
  onViewFullPlan,
}: ActivePlanCardProps) {
  const handleStartWorkout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStartWorkout();
  };

  const handleViewFullPlan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onViewFullPlan();
  };

  return (
    <View
      className="rounded-3xl border-3 border-primary bg-white dark:bg-surface-dark overflow-hidden"
      style={{
        shadowColor: '#F6F000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      {/* Active Plan Badge */}
      <View className="absolute top-4 left-4 z-10 bg-primary px-4 py-2 rounded-full">
        <Text
          style={{ fontFamily: fontFamily.bold }}
          className="text-xs text-black uppercase tracking-wider"
        >
          ACTIVE PLAN
        </Text>
      </View>

      {/* Hero Image */}
      <View className="h-48 bg-gray-200 dark:bg-gray-800 items-center justify-center">
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800' }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      {/* Workout Info */}
      <View className="p-6">
        <Text
          style={{ fontFamily: fontFamily.bold }}
          className="text-2xl text-textPrimary-light dark:text-textPrimary-dark mb-4"
        >
          {workout.label}
        </Text>

        <View className="flex-row items-center gap-6 mb-6">
        

          <View className="flex-row items-center">
            <Dumbbell size={20} color="gray" />
            <Text
              style={{ fontFamily: fontFamily.medium }}
              className="text-base text-textSecondary-light dark:text-textSecondary-dark ml-2"
            >
              {workout.exercises.length} Exercises
            </Text>
          </View>
        </View>

        {/* Start Workout Button */}
        <TouchableOpacity
          onPress={handleStartWorkout}
          activeOpacity={0.8}
          className="bg-primary h-16 rounded-full items-center justify-center flex-row mb-3"
          style={{
            shadowColor: '#F6F000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Play size={20} color="#000000" fill="#000000" />
          <Text
            style={{ fontFamily: fontFamily.bold }}
            className="text-lg text-black ml-2"
          >
            Start Workout
          </Text>
        </TouchableOpacity>

        {/* View Full Plan */}
        <TouchableOpacity
          onPress={handleViewFullPlan}
          activeOpacity={0.7}
          className="items-center py-3"
        >
          <Text
            style={{ fontFamily: fontFamily.semiBold }}
            className="text-base text-textSecondary-light dark:text-textSecondary-dark"
          >
            View Full Plan
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}