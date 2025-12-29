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
import { updateUserOnboarding } from '@/src/controllers/onboardingController';

const OnboardingScreen1 = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { colorScheme } = useColorScheme();
  const { width } = Dimensions.get('window');
  const { 
    gender, 
    age, 
    weight, 
    height, 
    targetWeight, 
    activityLevel, 
    goalType, 
    isCompleted,
    macroTargets 
  } = useOnboardingStore();

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
      
    }
  };

  const submitOnboarding = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate all required data
      if (!gender || !age || !height || !weight || !targetWeight || !activityLevel || !goalType) {
        Toast.error('Please complete all onboarding steps!');
        return;
      }

      if (!macroTargets) {
        Toast.error('Nutrition targets not calculated!');
        return;
      }

      // Prepare payload
      const payload = {
        body_metrics: {
          gender: gender,
          age: parseInt(age),
          height_cm: parseFloat(height),
          weight_kg: parseFloat(weight),
          target_weight_kg: parseFloat(targetWeight),
        },
        activity_level: activityLevel,
        goal_type: goalType,
        nutrition_targets: {
          calories: macroTargets.calories,
          protein_g: macroTargets.protein,
          carbs_g: macroTargets.carbs,
          fat_g: macroTargets.fat,
          fiber_g: macroTargets.fiber,
        },
      };

      // Call the API
      await updateUserOnboarding(payload);

      // Success feedback
      Toast.success('Onboarding completed successfully!');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate to home screen
      router.replace('/(app)/home');
      
    } catch (error) {
      console.error('Error submitting onboarding:', error);
      Toast.error('Failed to complete onboarding. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
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
      
      if (goalType === 'lose-weight' && parseFloat(targetWeight!) >= parseFloat(weight!)) {
        Toast.warn('Target weight must be less than current weight for weight loss!');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      }
      
      if (goalType === 'gain-muscle' && parseFloat(targetWeight!) <= parseFloat(weight!)) {
        Toast.warn('Target weight must be greater than current weight for muscle gain!');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      }
      
      if (goalType === 'maintain' && Math.abs(parseFloat(targetWeight!) - parseFloat(weight!)) > 5) {
        Toast.warn('Target weight must be almost equal to current weight!');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      }
      
      moveNext();
      return;
    }

    if (step === 5) {
      if (isCompleted === false) {
        Toast.warn('Please wait till we process your information!');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      }
      moveNext();
      return;
    }

    if (step === 6) {
      // Final step - submit onboarding
      submitOnboarding();
      return;
    }

    if (nextStep <= 6) {
      // Continue to next steps
    }
  };

  return (
    <SafeAreaView className="flex flex-1 items-center bg-background-light dark:bg-background-dark">
      <View className="flex w-full flex-row p-6">
        <Pressable onPress={moveBack} disabled={isSubmitting}>
          { (step !== 0) && <ArrowLeft size={24} color={colorScheme === 'light' ? '#000' : '#fff'} />}
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
        <Pressable 
          onPress={handleScroll} 
          className="w-full rounded-full bg-primary p-3"
          disabled={isSubmitting}>
          <Text            
            style={{ fontFamily: fontFamily.bold }}
            className="text-center text-lg text-surface-dark">
            {isSubmitting ? 'Completing...' : step === 0 ? 'Get Started' : step === 6 ? 'Complete' : 'Continue'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen1;