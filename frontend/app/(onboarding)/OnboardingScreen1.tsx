import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'

const OnboardingScreen1 = () => {
    const router = useRouter();
  return (
    <View className="flex-1 justify-center items-center">
      <Text>OnboardingScreen1</Text>
      <TouchableOpacity onPress={() => router.push('/(app)/homeScreen')}><Text>HomeScreen</Text></TouchableOpacity>
    </View>
  )
}

export default OnboardingScreen1

const styles = StyleSheet.create({})