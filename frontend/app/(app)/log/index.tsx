import { Text, View, ScrollView } from 'react-native';
import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWorkoutPlanStore } from '@/src/store/workoutPlanStore';
import StartHeader from '@/components/Log/StartHeader';
import CreatePlanCard from '@/components/Log/CreatePlanCard';
import TodaysWorkoutCard from '@/components/Log/TodaysWorkoutCard';
import { DayWorkout } from '@/src/types/workoutPlanTypes';

const LogScreen = () => {
  const plans = useWorkoutPlanStore((state) => state.plans);

  // Get today's workout from the active plan
  const getTodaysWorkout = (): DayWorkout | null => {
    if (plans.length === 0) return null;
    
    const activePlan = plans[0]; // Assuming first plan is active
    const today = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayName = dayNames[today.getDay()];
    
    // Find today's workout in the schedule
    const todaysWorkout = activePlan.schedule.find(
      (day) => day.day.toLowerCase() === todayName
    );
    
    return todaysWorkout || null;
  };

  const todaysWorkout = getTodaysWorkout();

  useEffect(() => {
    console.log('Plans:', JSON.stringify(plans));
    console.log('Todays Workout:', todaysWorkout);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
      >
        <StartHeader />
        
        {plans.length > 0 && todaysWorkout ? (
          <TodaysWorkoutCard workout={todaysWorkout} />
        ) : (
          <CreatePlanCard />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default LogScreen;