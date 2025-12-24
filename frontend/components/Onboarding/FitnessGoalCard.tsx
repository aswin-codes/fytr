import React from 'react';
import { Text, View, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { fontFamily } from '@/src/theme/fontFamily';
import { useOnboardingStore } from '@/src/store/onboardingStore';
import { Flame, Dumbbell, Heart } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

type GoalOption = {
  id: 'lose-weight' | 'maintain' | 'gain-muscle';
  title: string;
  description: string;
  icon: React.ComponentType<any>;
};

const goalOptions: GoalOption[] = [
  {
    id: 'lose-weight',
    title: 'Lose fat',
    description: 'Burn calories & shed weight',
    icon: Flame,
  },
  {
    id: 'gain-muscle',
    title: 'Build muscle',
    description: 'Gain strength & size',
    icon: Dumbbell,
  },
  {
    id: 'maintain',
    title: 'Maintain fitness',
    description: 'Stay healthy & active',
    icon: Heart,
  },
];

const FitnessGoalCard = () => {
  const { width } = Dimensions.get('window');
  const { goalType, setGoalType } = useOnboardingStore();
  const { colorScheme } = useColorScheme();

  return (
    <View style={{ width: width }} className="flex-1">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="flex-1 items-center pt-6">
          <Text
            style={{ fontFamily: fontFamily.semiBold }}
            className="text-3xl text-textPrimary-light dark:text-textPrimary-dark">
            Your fitness goal
          </Text>
          <Text
            style={{ fontFamily: fontFamily.regular }}
            className="mt-2 text-center text-base text-textSecondary-light dark:text-textSecondary-dark">
            Select the primary goal you want to achieve with FYTR
          </Text>

          <View className="mt-6 w-full space-y-3 px-6 gap-3">
            {goalOptions.map((option) => {
              const isSelected = goalType === option.id;
              const IconComponent = option.icon;
              
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => setGoalType(option.id)}
                  activeOpacity={0.7}
                  className={`w-full rounded-3xl border-2 p-5 ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 bg-card-light dark:border-gray-700 dark:bg-card-dark'
                  }`}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View 
                        className={`mr-4 rounded-2xl p-3 ${
                          isSelected
                            ? 'bg-primary'
                            : 'bg-surface-light dark:bg-surface-dark'
                        }`}>
                        <IconComponent
                          size={24}
                          color={isSelected ? '#ffffff' : (colorScheme === 'light' ? '#000000' : '#ffffff')}
                          strokeWidth={2}
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          style={{ fontFamily: fontFamily.semiBold }}
                          className={`text-lg ${
                            isSelected
                              ? 'text-primary-glow dark:text-primary'
                              : 'text-textPrimary-light dark:text-textPrimary-dark'
                          }`}>
                          {option.title}
                        </Text>
                        <Text
                          style={{ fontFamily: fontFamily.regular }}
                          className="mt-1 text-sm text-textSecondary-light dark:text-textSecondary-dark">
                          {option.description}
                        </Text>
                      </View>
                    </View>
                    
                    <View
                      className={`h-6 w-6 rounded-full border-2 ${
                        isSelected
                          ? 'border-primary bg-primary'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                      {isSelected && (
                        <View className="h-full w-full items-center justify-center">
                          <View className="h-2 w-2 rounded-full bg-white" />
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default FitnessGoalCard;