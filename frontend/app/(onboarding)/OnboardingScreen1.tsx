import { Text, View, Pressable, ScrollView, Dimensions } from 'react-native';
import React, { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamily } from '@/src/theme/fontFamily';
import { ArrowLeft } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import IntroCard from '@/components/Onboarding/IntroCard';
import StepCount from '@/components/Onboarding/StepCount';
import GenderSelectionCard from '@/components/Onboarding/GenderSelectionCard';
import BodyMetricsCard from '@/components/Onboarding/BodyMetricsCard';
import { useOnboardingStore } from '@/src/store/onboardingStore';
import { Toast } from 'toastify-react-native';
import * as Haptics from 'expo-haptics';
import ActivityLevelCard from '@/components/Onboarding/ActivityLevelCard';
import FitnessGoalCard from '@/components/Onboarding/FitnessGoalCard';
import AnalyzingDataCard from '@/components/Onboarding/AnalyzingDataCard';
import DailyTargetsCard from '@/components/Onboarding/DailyTargetCard';

const OnboardingScreen1 = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();
  const [step, setStep] = useState(0);
  const { colorScheme } = useColorScheme();
  const { width } = Dimensions.get('window');
  const { gender, weight, height, targetWeight, activityLevel, goalType, isCompleted } =
    useOnboardingStore();

  const moveNext = () => {
    const nextStep = step + 1;
    if (nextStep <= 6) {
      scrollViewRef.current?.scrollTo({ x: width * nextStep, animated: true });
      setStep(nextStep);
    }
  };

  const moveBack = () => {
    const prevStep = step - 1;
    if (prevStep >= 0) {
      scrollViewRef.current?.scrollTo({ x: width * prevStep, animated: true });
      setStep(prevStep);
    } else {
      router.back();
    }
  };

  const handleScroll = () => {
    const nextStep = step + 1;

    if (step === 0) {
      moveNext();
    }

    if (step === 1) {
      if (gender == null) {
        Toast.warn('Please select your gender!');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        moveNext();
      }
    }

    if (step === 2) {
      if (!weight || !height || !targetWeight) {
        Toast.warn('Please fill in all body metrics!');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else if (
        parseFloat(weight) <= 0 ||
        parseFloat(height) <= 0 ||
        parseFloat(targetWeight) <= 0
      ) {
        Toast.warn('Please enter valid values!');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        moveNext();
      }
    }

    if (step === 3) {
      if (activityLevel === null) {
        Toast.warn('Please select your activity level!');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      }
      moveNext();
      return;
    }
    if (step === 4) {
      if (goalType === null) {
        Toast.warn('Please select your fitness goal!');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      }
      moveNext();
      return;
    }

    if (step === 5) {
      if (isCompleted === false) {
        Toast.warn('Please complete the analysis!');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      }
      moveNext();
      return;
    }

    if (nextStep <= 6) {
      // Continue to next steps
    }
  };

  return (
    <SafeAreaView className="flex flex-1 items-center bg-background-light dark:bg-background-dark">
      <View className="flex w-full flex-row p-6">
        <Pressable onPress={moveBack}>
          <ArrowLeft size={24} color={colorScheme === 'light' ? '#000' : '#fff'} />
        </Pressable>
        <View className="flex-1"></View>
        <View className="-ml-5 w-fit rounded-full border border-gray-300 bg-surface-light px-2 py-1 dark:border-gray-700 dark:bg-surface-dark">
          <Text
            style={{ fontFamily: fontFamily.regular }}
            className="text-sm text-textPrimary-light dark:text-textPrimary-dark">
            Step {step} / 6
          </Text>
        </View>
        <View className="flex-1"></View>
      </View>

      <StepCount step={step} />

      <View className="w-full flex-1">
        <ScrollView
          ref={scrollViewRef}
          scrollEnabled={false}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}>
          <IntroCard />
          <GenderSelectionCard />
          <BodyMetricsCard />
          <ActivityLevelCard />
          <FitnessGoalCard />
          <AnalyzingDataCard isActive={step === 5} />
          <DailyTargetsCard/>
        </ScrollView>
      </View>

      <View className="w-full p-6">
        <Pressable onPress={handleScroll} className="w-full rounded-full bg-primary p-3">
          <Text
            style={{ fontFamily: fontFamily.bold }}
            className="text-center text-lg text-surface-dark">
            {step === 0 ? 'Get Started' : 'Continue'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen1;
