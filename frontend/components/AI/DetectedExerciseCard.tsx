import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { BicepsFlexed } from 'lucide-react-native'
import { fontFamily } from '@/src/theme/fontFamily'

const DetectedExerciseCard = ({exerciseName}: {exerciseName: string}) => {
  return (
    <View className='bg-card-light dark:bg-card-dark rounded-2xl p-3 flex-row items-center justify-center'>
        <BicepsFlexed size={15} color={'#E6E000'}/>
      <Text style={{fontFamily : fontFamily.medium}} className='ml-2 text-textSecondary-light dark:text-textSecondary-dark text-sm'>Exercise : </Text>
      <Text style={{fontFamily : fontFamily.medium}} className='text-textPrimary-light dark:text-textPrimary-dark text-sm'>{exerciseName} </Text>
    </View>
  )
}

export default DetectedExerciseCard

const styles = StyleSheet.create({})