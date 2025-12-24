import React, { useEffect, useState } from 'react';
import { Text, View, Dimensions } from 'react-native';
import { fontFamily } from '@/src/theme/fontFamily';
import { useOnboardingStore } from '@/src/store/onboardingStore';
import { CheckCircle, Loader, Target, Sparkles } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
  SlideInDown,
  cancelAnimation,
} from 'react-native-reanimated';

type AnalysisStep = {
  id: number;
  text: string;
  completed: boolean;
};

const AnalyzingDataCard = ({ isActive }: { isActive: boolean }) => {
  const { width } = Dimensions.get('window');
  const { calculateAndSetMacros, completeOnboarding , resetStatus} = useOnboardingStore();

  const [steps, setSteps] = useState<AnalysisStep[]>([
    { id: 1, text: 'Calculating metabolic rate', completed: false },
    { id: 2, text: 'Optimizing workout schedule', completed: false },
    { id: 3, text: 'Finalizing nutrition targets...', completed: false },
  ]);

  const [allCompleted, setAllCompleted] = useState(false);

  // Animation values
  const rotation = useSharedValue(0);
  const scale1 = useSharedValue(1);
  const scale2 = useSharedValue(1);
  const scale3 = useSharedValue(1);

  useEffect(() => {
    if (!isActive) return;
    resetStatus();
    // reset first (so it restarts every time)
    rotation.value = 0;
    scale1.value = 1;
    scale2.value = 1;
    scale3.value = 1;
  
    // rotation
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 3000,
        easing: Easing.linear,
      }),
      -1
    );
  
    // pulsing
    scale1.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1
    );
  
    scale2.value = withRepeat(
      withSequence(
        withTiming(1.8, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1
    );
  
    scale3.value = withRepeat(
      withSequence(
        withTiming(2.2, { duration: 2500 }),
        withTiming(1, { duration: 2500 })
      ),
      -1
    );
  
    return () => {
      cancelAnimation(rotation);
      cancelAnimation(scale1);
      cancelAnimation(scale2);
      cancelAnimation(scale3);
    };
  }, [isActive]);


  // Simulate step completion
  useEffect(() => {
    if (!isActive) return;
  
    setSteps([
      { id: 1, text: 'Calculating metabolic rate', completed: false },
      { id: 2, text: 'Optimizing workout schedule', completed: false },
      { id: 3, text: 'Finalizing nutrition targets...', completed: false },
    ]);
  
    setAllCompleted(false);
  
    const t1 = setTimeout(() => {
      setSteps(s =>
        s.map(step => step.id === 1 ? { ...step, completed: true } : step)
      );
    }, 1500);
  
    const t2 = setTimeout(() => {
      setSteps(s =>
        s.map(step => step.id === 2 ? { ...step, completed: true } : step)
      );
    }, 3000);
  
    const t3 = setTimeout(() => {
      setSteps(s =>
        s.map(step => step.id === 3 ? { ...step, completed: true } : step)
      );
  
      calculateAndSetMacros();
      completeOnboarding();
      setAllCompleted(true);
    }, 4500);
  
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isActive]);


  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const circle1Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale1.value }],
    opacity: 1 - (scale1.value - 1) * 0.5,
  }));

  const circle2Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale2.value }],
    opacity: 1 - (scale2.value - 1) * 0.4,
  }));

  const circle3Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale3.value }],
    opacity: 1 - (scale3.value - 1) * 0.3,
  }));

  return (
    <View style={{ width: width, overflow: 'hidden' }} className="flex-1 bg-primary/5">
      <View className="flex-1 items-center justify-center px-6">
        {/* Animated Circles */}
        <View className="relative mb-12 h-64 w-64 items-center justify-center">
          {/* Outer circle 3 */}
          <Animated.View
            style={[circle3Style]}
            className="absolute h-64 w-64 rounded-full border-2 border-primary/20"
          />

          {/* Middle circle 2 */}
          <Animated.View
            style={[circle2Style]}
            className="absolute h-48 w-48 rounded-full border-2 border-primary/30"
          />

          {/* Inner circle 1 */}
          <Animated.View
            style={[circle1Style]}
            className="absolute h-32 w-32 rounded-full border-2 border-primary/40"
          />

          {/* Center icon */}
          <Animated.View
            style={[rotationStyle]}
            className="h-20 w-20 items-center justify-center rounded-full bg-primary">
            <Target size={40} color="#ffffff" strokeWidth={2.5} />
          </Animated.View>
        </View>

        {/* Title */}
        <Text
          style={{ fontFamily: fontFamily.bold }}
          className="mb-2 text-3xl text-textPrimary-light dark:text-textPrimary-dark">
          Analyzing your data
        </Text>
        <Text
          style={{ fontFamily: fontFamily.regular }}
          className="mb-8 text-center text-base text-textSecondary-light dark:text-textSecondary-dark">
          Building your personalized plan
        </Text>

        {/* Progress Steps */}
        <View className="w-full space-y-4">
          {steps.map((step) => (
            <View key={step.id} className="flex-row items-center">
              {step.completed ? (
                <CheckCircle size={24} color="#10b981" strokeWidth={2} />
              ) : (
                <Loader size={24} color="#6366f1" strokeWidth={2} className="animate-spin" />
              )}
              <Text
                style={{ fontFamily: fontFamily.medium }}
                className={`ml-3 text-base ${
                  step.completed
                    ? 'text-primary'
                    : 'text-textSecondary-light dark:text-textSecondary-dark'
                }`}>
                {step.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Success Message - Shows when all completed */}
        {allCompleted && (
          <Animated.View
            entering={FadeIn.delay(200).duration(600)}
            className="mt-8 w-full items-center">
            <View className="flex-row items-center rounded-3xl bg-primary/10 px-6 py-4">
              <View className="mr-3 rounded-full bg-primary p-2">
                <Sparkles size={20} color="#ffffff" strokeWidth={2} />
              </View>
              <View className="flex-1">
                <Text style={{ fontFamily: fontFamily.bold }} className="text-lg text-primary">
                  All Done! 🎉
                </Text>
                <Text
                  style={{ fontFamily: fontFamily.regular }}
                  className="mt-1 text-sm text-textSecondary-light dark:text-textSecondary-dark">
                  Your personalized plan is ready
                </Text>
              </View>
            </View>

            <Animated.View entering={SlideInDown.delay(400).duration(500)} className="mt-6 w-full">
              <Text
                style={{ fontFamily: fontFamily.medium }}
                className="text-center text-base text-textPrimary-light dark:text-textPrimary-dark">
                Hit <Text className="font-bold text-primary">Continue</Text> to start your journey!
                🚀
              </Text>
            </Animated.View>
          </Animated.View>
        )}

        {/* Bottom spacing */}
        <View className="h-20" />
      </View>
    </View>
  );
};

export default AnalyzingDataCard;
