import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { fontFamily } from '@/src/theme/fontFamily'
import LottieView from 'lottie-react-native'
import { LottieFiles } from '@/src/constants/assets'
import { useRouter } from 'expo-router'

const IntroScreen1 = () => {
  const router = useRouter(); 

  const handleGetStartedScreen = () => {
    router.push('/introScreen2');
  };

  const handleLogin = () => {
    router.push('/(root)/GetStartedScreen')
  }

  return (
    <SafeAreaView className='flex-1 bg-background-light dark:bg-background-dark p-6'>
      <View className='flex-1 justify-center items-center'>
        <LottieView
          source={LottieFiles.jumpingJack}
          autoPlay
          loop
          style={{ width: 300, height: 300, backgroundColor: "transparent" }}
          
        />
      </View>
      <View className='flex flex-col items-center  pb-5'>
        <Text style={{ fontFamily: fontFamily.semiBold }} className='text-textPrimary-light dark:text-textPrimary-dark text-center text-3xl  '>Get Better, Live Better</Text>
        <Text style={{ fontFamily: fontFamily.regular }} className='text-textSecondary-light dark:text-textSecondary-dark text-center text-md mt-4 mx-3'>Personalized gym exercises plan powered by AI</Text>
        <Pressable onPress={handleGetStartedScreen} className='bg-primary p-3 rounded-full w-full mt-12'>
          <Text style={{ fontFamily: fontFamily.bold }} className='text-surface-dark text-center text-lg'>Get Started</Text>
        </Pressable>
        <Pressable   onPress={handleLogin} className=' p-3 rounded-full w-full mt-8'>
          <Text style={{ fontFamily: fontFamily.bold }} className='text-textPrimary-light dark:text-textPrimary-dark text-center text-lg'>Log In</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

export default IntroScreen1

const styles = StyleSheet.create({})