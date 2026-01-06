import { TouchableOpacity, Text, View, ScrollView } from 'react-native';
import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/src/auth/useAuth';
import { userStorage } from '@/src/store/userStorage';
import { syncExercises } from '@/src/controllers/exerciseSyncController';
import { Toast } from 'toastify-react-native';
import * as Haptics from 'expo-haptics';
import { fontFamily } from '@/src/theme/fontFamily';
import WorkoutPlanPrompt from '@/components/Home/WorkoutPlanPrompt';
import ActivePlanSummary from '@/components/Home/ActivePlanSummary';
import { useWorkoutPlanStore } from '@/src/store/workoutPlanStore';
import { LogOut } from 'lucide-react-native';

const HomeScreen = () => {
  const { logout } = useAuth();
  const { currentPlan } = useWorkoutPlanStore();
  const user = userStorage.getUser();

  const handleLogout = () => {
    userStorage.clearUser();
    logout();
  };

  useEffect(() => {
    silentSync();
  }, []);

  const silentSync = async () => {
    try {
      const result = await syncExercises();

      if (result.success && result.synced) {
        Toast.success('Exercises synced successfully');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Toast.error('Exercises sync failed');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.warn('Background sync failed:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-6">
          <View>
            <Text
              style={{ fontFamily: fontFamily.regular }}
              className="text-sm text-textSecondary-light dark:text-textSecondary-dark">
              Welcome back,
            </Text>
            <Text
              style={{ fontFamily: fontFamily.bold }}
              className="text-2xl text-textPrimary-light dark:text-textPrimary-dark">
              {user?.full_name || 'User'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            className="h-10 w-10 items-center justify-center rounded-full bg-card-light dark:bg-card-dark">
            <LogOut size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Workout Plan Section */}
        {currentPlan ? <ActivePlanSummary /> : <WorkoutPlanPrompt />}

        {/* Rest of your home screen content */}
        <View className="px-6 py-4">
          <Text
            style={{ fontFamily: fontFamily.bold }}
            className="mb-4 text-xl text-textPrimary-light dark:text-textPrimary-dark">
            Quick Actions
          </Text>

          {/* Add your other home screen components here */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;