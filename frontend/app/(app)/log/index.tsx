import {  Text, View } from 'react-native'
import React from 'react'
import UnderDevelopmentScreen from '@/components/UnderDevelopmentScreen'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useWorkoutPlanStore } from '@/src/store/workoutPlanStore'
import StartHeader from '@/components/Log/StartHeader'

const LogScreen = () => {
  const plans = useWorkoutPlanStore((state) => state.plans);

  const activePlan = useWorkoutPlanStore((state) => state.activePlan);

  return (
    <SafeAreaView className='flex-1 bg-background-light dark:bg-background-dark p-6'>
      <StartHeader/>
    </SafeAreaView>
  )
}

export default LogScreen
