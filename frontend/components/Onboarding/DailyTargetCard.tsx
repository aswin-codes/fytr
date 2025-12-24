import React, { useEffect } from 'react';
import { Text, View, Dimensions, ScrollView } from 'react-native';
import { fontFamily } from '@/src/theme/fontFamily';
import { useOnboardingStore } from '@/src/store/onboardingStore';
import { Flame, Droplet, Wheat, Apple } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useColorScheme } from 'nativewind';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/* ------------------ Circular Progress ------------------ */
const CircularProgress = ({
  size = 200,
  strokeWidth = 20,
  progress = 0.75,
  calories = 2450,
  color,
}: {
  size?: number;
  strokeWidth?: number;
  progress?: number;
  calories?: number;
  color: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressValue = useSharedValue(0);

  useEffect(() => {
    progressValue.value = withDelay(
      300,
      withTiming(progress, {
        duration: 1500,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progressValue.value),
  }));

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#374151"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
        />
      </Svg>

      <View className="absolute items-center">
        <Flame size={32} color={color} strokeWidth={2} />
        <Text
          style={{ fontFamily: fontFamily.bold }}
          className="mt-2 text-4xl text-textPrimary-light dark:text-textPrimary-dark">
          {calories.toLocaleString()}
        </Text>
        <Text
          style={{ fontFamily: fontFamily.regular }}
          className="text-base text-textSecondary-light dark:text-textSecondary-dark">
          kcal
        </Text>
      </View>
    </View>
  );
};

/* ------------------ Macro Card ------------------ */
const MacroCard = ({
  icon,
  label,
  value,
  unit,
  progress = 0.75,
  delay = 0,
  color,
}: any) => {
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withDelay(
      delay,
      withTiming(progress, {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [progress, delay]);

  return (
    <View className="mb-4 w-[48%] rounded-3xl bg-card-light p-4 dark:bg-card-dark">
      <View className="mb-3 flex-row items-center justify-between">
        <Text
          style={{ fontFamily: fontFamily.medium }}
          className="text-sm text-textSecondary-light dark:text-textSecondary-dark">
          {label}
        </Text>
        <View className="rounded-full bg-primary-glow/20 p-1.5 dark:bg-primary/20">
          {icon}
        </View>
      </View>

      <Text
        style={{ fontFamily: fontFamily.bold }}
        className="mb-2 text-2xl text-textPrimary-light dark:text-textPrimary-dark">
        {value}
        <Text
          style={{ fontFamily: fontFamily.regular }}
          className="text-base text-textSecondary-light dark:text-textSecondary-dark">
          {' '}
          {unit}
        </Text>
      </Text>

      <View className="h-2 overflow-hidden rounded-full bg-gray-700/40">
        <Animated.View
          style={{
            width: `${progress * 100}%`,
            backgroundColor: color,
          }}
          className="h-full rounded-full"
        />
      </View>
    </View>
  );
};

/* ------------------ Daily Targets ------------------ */
const DailyTargetsCard = () => {
  const { width } = Dimensions.get('window');
  const { macroTargets } = useOnboardingStore();
  const { colorScheme } = useColorScheme();

  const primaryColor =
    colorScheme === 'dark' ? '#F6F000' /* bg-primary */ : '#E6E000'; /* primary-glow */

  const dailyCalories = macroTargets?.calories || 2450;
  const protein = macroTargets?.protein || 180;
  const carbs = macroTargets?.carbs || 220;
  const fats = macroTargets?.fats || 85;
  const fiber = macroTargets?.fiber || 35;

  return (
    <ScrollView
      style={{ width }}
      className="flex-1 bg-background-light px-6 pt-6 dark:bg-background-dark">
      {/* Header */}
      <View className="mb-8 items-center">
        <Text
          style={{ fontFamily: fontFamily.bold }}
          className="text-3xl text-textPrimary-light dark:text-textPrimary-dark">
          Your daily targets
        </Text>
        <Text
          style={{ fontFamily: fontFamily.regular }}
          className="mt-2 text-center text-base text-textSecondary-light dark:text-textSecondary-dark">
          Personalized nutrition plan for your goals
        </Text>
      </View>

      {/* Circular Progress */}
      <View className="mb-8 items-center">
        <CircularProgress
          calories={dailyCalories}
          progress={0.75}
          color={primaryColor}
        />
      </View>

      {/* Macro Grid */}
      <View className="flex-row flex-wrap justify-between">
        <MacroCard
          label="Protein"
          value={protein}
          unit="g"
          progress={0.75}
          delay={400}
          color={primaryColor}
          icon={<Droplet size={18} color={primaryColor} strokeWidth={2.5} />}
        />
        <MacroCard
          label="Carbs"
          value={carbs}
          unit="g"
          progress={0.85}
          delay={500}
          color={primaryColor}
          icon={<Wheat size={18} color={primaryColor} strokeWidth={2.5} />}
        />
        <MacroCard
          label="Fats"
          value={fats}
          unit="g"
          progress={0.65}
          delay={600}
          color={primaryColor}
          icon={<Droplet size={18} color={primaryColor} strokeWidth={2.5} />}
        />
        <MacroCard
          label="Fibre"
          value={fiber}
          unit="g"
          progress={0.55}
          delay={700}
          color={primaryColor}
          icon={<Apple size={18} color={primaryColor} strokeWidth={2.5} />}
        />
      </View>

      {/* Footer */}
      <View className=" items-center">
        <Text
          style={{ fontFamily: fontFamily.regular }}
          className="text-center text-sm text-textSecondary-light dark:text-textSecondary-dark">
          These targets are calculated based on your
          goals, activity level, and body metrics
        </Text>
      </View>
    </ScrollView>
  );
};

export default DailyTargetsCard;
