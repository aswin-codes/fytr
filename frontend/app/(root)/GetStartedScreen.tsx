import { ActivityIndicator, Pressable, StyleSheet, Text, View, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { fontFamily } from '@/src/theme/fontFamily'
import { Images } from '@/src/constants/assets'
import {useRouter} from 'expo-router'
import { useAuth } from '@/src/auth/useAuth'
import { FirebaseError } from 'firebase/app'
import { handleFirebaseAuthError } from '@/src/utils/firebaseAuthError'
import { loginWithGoogle } from '@/src/controllers/authController'
import { useOnboardingStore } from '@/src/store/onboardingStore'

const GetStartedScreen = () => {
  const router = useRouter();
  const {  googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const { resetOnboarding } = useOnboardingStore();

  const handleCreateAccountScreen = () => {
    router.push('/(root)/CreateAccountScreen');
  };

  const handleLoginScreen = () => {
    router.push('/(root)/LoginScreen');
  };

  const handleLoginWithGoogle = async () => {
    setLoading(true);
    try {
      const response = await loginWithGoogle( googleLogin);
      router.dismissAll();
      if (response.user.onboarding_completed) {
        router.replace('/(app)/home');
      } else {
        resetOnboarding();
        router.replace('/(onboarding)/OnboardingScreen1');
      }
    } catch (error) {
      console.error("❌ Error in handleCreateAccount:", error);
      if (error instanceof FirebaseError) {
          const authError = handleFirebaseAuthError(error);
          Alert.alert(authError.title, authError.message);
      } else {
          // Handle non-Firebase errors (like API errors)
          Alert.alert("Error", error instanceof Error ? error.message : "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <SafeAreaView className='flex-1 bg-background-light dark:bg-background-dark justify-center items-center p-6'>
      <Text style={{ fontFamily: fontFamily.semiBold }} className='text-4xl text-textPrimary-light dark:text-textPrimary-dark'>Join Gymmie</Text>
      <Text style={{ fontFamily: fontFamily.medium }} className='text-textSecondary-light dark:text-textSecondary-dark mt-3 px-12  text-center'>Create an account or log in to continue</Text>
      <View className="mt-5 w-full">
        <Pressable onPress={handleCreateAccountScreen} className='bg-primary p-3 rounded-full w-full mt-12'>
          <Text style={{ fontFamily: fontFamily.bold }} className='text-surface-dark text-center text-lg'>Create Account</Text>
        </Pressable>
        <Pressable onPress={handleLoginScreen} className=' p-3 rounded-full w-full mt-3'>
          <Text style={{ fontFamily: fontFamily.bold }} className='text-textPrimary-light dark:text-textPrimary-dark text-center text-lg'>Log In</Text>
        </Pressable>
        <View style={styles.orContainer}>
          <View
            style={{
              borderBottomWidth: StyleSheet.hairlineWidth,
              flex: 1
            }}
            className="border-textSecondary-light dark:border-textSecondary-dark"
          />
          <Text style={{ fontFamily: fontFamily.medium }} className='text-textSecondary-light dark:text-textSecondary-dark'>or</Text>
          <View
            style={{
              borderBottomWidth: StyleSheet.hairlineWidth,
              flex: 1
            }}
            className="border-textSecondary-light dark:border-textSecondary-dark"
          />
        </View>
        <View style={styles.googleButtonContainer}>
          <Pressable disabled={loading} onPress={handleLoginWithGoogle} style={[styles.googleButton,]} className='bg-white border border-gray-400 dark:border-gray-200'>
            {
              loading ? (
                <ActivityIndicator size="small" color={"black"} />
              ) : (
                <>
                  <Image style={{ width: 24, height: 24 }} source={Images.googleIcon} />
                  <Text style={[styles.buttonText]}>Continue with Google</Text>
                </>
              )
            }
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default GetStartedScreen

const styles = StyleSheet.create({
  orContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: "100%",
    marginVertical: 20
  },
  googleButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'center',
    width: "95%",
    paddingVertical: 10,
    borderRadius: 25,
  },
  googleButtonContainer: {
    width: "100%",
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: fontFamily.bold
  }
})
