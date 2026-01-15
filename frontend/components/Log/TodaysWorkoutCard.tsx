import { Text, View, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { fontFamily } from '@/src/theme/fontFamily';
import { Play, Dumbbell as DumbbellIcon, Clock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Images } from '@/src/constants/assets';
import { DayWorkout } from '@/src/types/workoutPlanTypes';

interface TodaysWorkoutCardProps {
  workout: DayWorkout;
}

const TodaysWorkoutCard = ({ workout }: TodaysWorkoutCardProps) => {
  const handleStartWorkout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to workout session
    //router.push('/(app)/workout/session');
  };

  // Calculate estimated time (assuming 3 mins per exercise on average)
  const estimatedTime = workout.exercises.length * 8;

  if (workout.isRestDay) {
    return (
      <View className="mb-6">
        <Text 
          className="text-2xl text-textPrimary-light dark:text-textPrimary-dark mb-4 uppercase"
          style={{ fontFamily: fontFamily.semiBold }}
        >
          Today's Workout
        </Text>
        
        <View className="relative bg-surface-light dark:bg-surface-dark rounded-[32px] p-6 border border-border-light dark:border-border-dark overflow-hidden">
          <View className="relative z-10">
            {/* Badge */}
            <View className="self-start px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
              <Text 
                className="text-[10px] text-blue-500 uppercase tracking-wider"
                style={{ fontFamily: fontFamily.semiBold }}
              >
                REST & RECOVERY
              </Text>
            </View>

            {/* Title */}
            <Text 
              className="text-3xl text-textPrimary-light dark:text-textPrimary-dark mb-3 leading-tight uppercase"
              style={{ fontFamily: fontFamily.semiBold }}
            >
              REST DAY {workout.icon}
            </Text>

            {/* Description */}
            <Text 
              className="text-sm text-textSecondary-light dark:text-textSecondary-dark mb-6 leading-relaxed"
              style={{ fontFamily: fontFamily.regular }}
            >
              Your muscles need time to recover and grow. Use today to stretch, hydrate, and prepare for tomorrow's session.
            </Text>

            {/* Stats */}
            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center">
                <Clock size={16} color="#9CA3AF" />
                <Text 
                  className="text-xs text-textMuted-light dark:text-textMuted-dark ml-1.5"
                  style={{ fontFamily: fontFamily.medium }}
                >
                  Recovery Day
                </Text>
              </View>
            </View>
          </View>

          {/* Background Image */}
          <Image 
            className="absolute bottom-0 right-0 opacity-10"
            source={Images.exercisecard}
            style={{ width: 140, height: 140 }}
            resizeMode="contain"
          />
        </View>
      </View>
    );
  }

  return (
    <View className="mb-6">
      <Text 
        className="text-2xl text-textPrimary-light dark:text-textPrimary-dark mb-4 uppercase"
        style={{ fontFamily: fontFamily.semiBold }}
      >
        Today's Workout
      </Text>
      
      <View className="relative bg-surface-light dark:bg-surface-dark rounded-[32px] p-6 border border-border-light dark:border-border-dark overflow-hidden">
        <View className="relative z-10">
          {/* Badge */}
          <View className="self-start px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Text 
              className="text-[10px] text-primary uppercase tracking-wider"
              style={{ fontFamily: fontFamily.semiBold }}
            >
              STRENGTH & CONDITIONING
            </Text>
          </View>

          {/* Title */}
          <Text 
            className="text-3xl text-textPrimary-light dark:text-textPrimary-dark mb-4 leading-tight uppercase"
            style={{ fontFamily: fontFamily.semiBold }}
          >
            {workout.label}
          </Text>

          {/* Stats */}
          <View className="flex-row items-center gap-4 mb-6">
            <View className="flex-row items-center">
              <DumbbellIcon size={16} color="#9CA3AF" />
              <Text 
                className="text-xs text-textMuted-light dark:text-textMuted-dark ml-1.5"
                style={{ fontFamily: fontFamily.medium }}
              >
                {workout.exercises.length} Exercises
              </Text>
            </View>
            <View className="flex-row items-center">
              <Clock size={16} color="#9CA3AF" />
              <Text 
                className="text-xs text-textMuted-light dark:text-textMuted-dark ml-1.5"
                style={{ fontFamily: fontFamily.medium }}
              >
                {estimatedTime} mins
              </Text>
            </View>
          </View>

          {/* Targeting Info */}
          <Text 
            className="text-sm text-textSecondary-light dark:text-textSecondary-dark mb-6"
            style={{ fontFamily: fontFamily.regular }}
          >
            Targeting: {workout.muscleGroups.join(', ')}
          </Text>

          {/* Start Workout Button */}
          <TouchableOpacity
            onPress={handleStartWorkout}
            className="bg-primary rounded-full h-14 flex-row items-center justify-center"
            style={{
              shadowColor: '#F6F000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }}
          >
            <Text 
              className="text-black text-sm uppercase tracking-wide mr-2"
              style={{ fontFamily: fontFamily.bold }}
            >
              START WORKOUT
            </Text>
            <Play size={20} color="#000" fill="#000" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Background Image */}
        <Image 
          className="absolute bottom-0 right-0 opacity-10"
          source={Images.exercisecard}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

export default TodaysWorkoutCard;