import { View, Text, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamily } from '@/src/theme/fontFamily';
import { useWorkoutPlanStore } from '@/src/store/workoutPlanStore';
import { syncWorkoutPlan } from '@/src/controllers/workoutPlanController';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Toast } from 'toastify-react-native';
import * as Haptics from 'expo-haptics';

const CompletionScreen = () => {
  const { saveEditingPlan, currentEditingPlan } = useWorkoutPlanStore();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Calculate total workout days
  const getTotalWorkoutDays = () => {
    if (!currentEditingPlan) return 0;
    return currentEditingPlan.schedule.filter(day => !day.isRestDay).length;
  };

  const handleFinish = async () => {
    try {
      setIsSaving(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      console.log('🔵 Step 1: Saving workout plan locally...');
      saveEditingPlan();
      console.log('✅ Step 1 Complete: Plan saved to local store');
      
      console.log('🔵 Step 2: Syncing workout plan to backend...');
      await syncWorkoutPlan();
      console.log('✅ Step 2 Complete: Plan synced to backend');
      
      Toast.success('Workout plan created successfully!');
      
      setIsSaving(false);
      
      // Navigate to home/dashboard
      router.replace('/(app)/home');
    } catch (error) {
      console.error('❌ Error saving workout plan:', error);
      setIsSaving(false);
      
      // Show error but still navigate - local save succeeded
      Toast.error('Plan saved locally. Will sync when online.');
      router.replace('/(app)/home');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light px-6 dark:bg-background-dark">
      <View className="flex-1 items-center justify-center">
        {/* Progress Bars */}
        <View className="mb-12 w-full flex-row gap-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <View key={idx} className="h-1 flex-1 rounded-full bg-primary" />
          ))}
        </View>

        {/* Success Image/Icon */}
        <View className="mb-8 h-64 w-64 items-center justify-center overflow-hidden rounded-3xl bg-card-light dark:bg-card-dark">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-primary">
            <Check size={48} color="#000" strokeWidth={3} />
          </View>
        </View>

        {/* Title */}
        <Text
          style={{ fontFamily: fontFamily.bold }}
          className="mb-4 text-center text-4xl text-textPrimary-light dark:text-textPrimary-dark">
          You're all set!
        </Text>

        {/* Description */}
        <Text
          style={{ fontFamily: fontFamily.regular }}
          className="mb-12 text-center text-base text-textSecondary-light dark:text-textSecondary-dark">
          Your workouts are scheduled. Let's start building consistency.
        </Text>

        {/* Stats */}
        <View className="mb-12 w-full rounded-2xl bg-card-light p-6 dark:bg-card-dark">
          <View className="flex-row items-center justify-between">
            <Text
              style={{ fontFamily: fontFamily.regular }}
              className="text-base text-textSecondary-light dark:text-textSecondary-dark">
              Weekly workout days
            </Text>
            <Text style={{ fontFamily: fontFamily.bold }} className="text-2xl text-primary">
              {getTotalWorkoutDays()}
            </Text>
          </View>
        </View>
      </View>

      {/* CTA Button */}
      <View className="pb-8">
        <TouchableOpacity
          onPress={handleFinish}
          disabled={isSaving}
          className={`h-16 items-center justify-center rounded-full ${
            isSaving ? 'bg-gray-400' : 'bg-primary'
          }`}
          activeOpacity={0.8}>
          <Text style={{ fontFamily: fontFamily.bold }} className="text-lg text-black">
            {isSaving ? 'Saving...' : 'Go to Dashboard →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CompletionScreen;