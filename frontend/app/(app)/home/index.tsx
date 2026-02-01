import React, { useState, useEffect } from 'react';
import { ScrollView, StatusBar, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWorkoutPlanStore } from '@/src/store/workoutPlanStore';
import { userStorage } from '@/src/store/userStorage';
import { UserType } from '@/src/types/userType';
import HomeHeader from '@/components/Home/HomeHeader';
import ActivePlanCard from '@/components/Home/ActivePlanCard';
import NoPlanCard from '@/components/Home/NoPlanCard';
import ProgressSnapshot from '@/components/Home/ProgressSnapshot';
import QuickActions from '@/components/Home/QuickActions';
import Leaderboard from '@/components/Home/Leaderboard';

const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export default function HomeScreen() {
  const router = useRouter();
  
  // Zustand store selectors
  const plans = useWorkoutPlanStore((state) => state.plans);
  const activePlan = useWorkoutPlanStore((state) => state.activePlan);
  
  const [user, setUser] = useState<UserType | null>(null);
  const [currentDay, setCurrentDay] = useState('');

  useEffect(() => {
    loadUser();
    setCurrentDay(DAYS_OF_WEEK[new Date().getDay()]);
  }, []);

  const loadUser = async () => {
    const userData = await userStorage.getUser();
    setUser(userData);
  };

  const getFirstName = () => {
    if (!user?.full_name) return 'User';
    return user.full_name.split(' ')[0];
  };

  const getTodaysWorkout = () => {
    if (!plans.length || !currentDay) return null;
    
    // Get the first plan (since you only have one)
    const plan = plans[0];
    if (!plan) return null;
    
    return plan.schedule.find((d) => d.day === currentDay);
  };

  const todaysWorkout = getTodaysWorkout();
  const hasActivePlan = plans.length > 0;
  const hasTodaysWorkout = todaysWorkout && !todaysWorkout.isRestDay;
  console.log(todaysWorkout);
  console.log(plans);
  // Navigation handlers
  const handleStartWorkout = () => {
    router.push(`/(app)/workout/session?day=${currentDay}`);
  };

  const handleViewFullPlan = () => {
    router.push('/(app)/plan/overview');
  };

  const handleCreatePlan = () => {
    router.push('/(plan)/PlanTypeScreen');
  };

  const handleLogWorkout = () => {
    router.push('/(app)/log');
  };

  const handleAIFormCheck = () => {
    router.push('/(app)/ai');
  };

  const handleExplore = () => {
    router.push('/(app)/explore');
  };

  const handleEditPlan = () => {
    router.push('/(plan)/weekly-split');
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <StatusBar barStyle="dark-content" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <HomeHeader firstName={getFirstName()} />

        {/* Active Plan or No Plan State */}
        <View className="px-6 mb-6">
          {hasActivePlan ? (
            <ActivePlanCard
              workout={todaysWorkout}
              onStartWorkout={handleStartWorkout}
              onViewFullPlan={handleViewFullPlan}
            />
          ) : (
            <NoPlanCard onCreatePlan={handleCreatePlan} />
          )}
        </View>

        {/* Progress Snapshot */}
        <ProgressSnapshot />

        {/* Quick Actions */}
        <QuickActions
          onLogWorkout={handleLogWorkout}
          onAIFormCheck={handleAIFormCheck}
          onExplore={handleExplore}
          onEditPlan={handleEditPlan}
        />

        {/* Leaderboard */}
        <Leaderboard />
      </ScrollView>
    </SafeAreaView>
  );
}