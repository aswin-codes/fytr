import React from 'react';
import { Text, View, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { fontFamily } from '@/src/theme/fontFamily';
import { useOnboardingStore } from '@/src/store/onboardingStore';

type ActivityOption = {
  id: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active' | 'athlete';
  title: string;
  description: string;
};

const activityOptions: ActivityOption[] = [
  {
    id: 'sedentary',
    title: 'Sedentary',
    description: 'Little or no exercise',
  },
  {
    id: 'light',
    title: 'Lightly Active',
    description: 'Exercise 1-3 days/week',
  },
  {
    id: 'moderate',
    title: 'Moderately Active',
    description: 'Exercise 3-5 days/week',
  },
  {
    id: 'active',
    title: 'Very Active',
    description: 'Exercise 6-7 days/week',
  },
  {
    id: 'very-active',
    title: 'Extremely Active',
    description: 'Physical job or 2x training',
  },
  {
    id: 'athlete',
    title: 'Athlete',
    description: 'Professional athlete or intensive training',
  },
];

const ActivityLevelCard = () => {
  const { width } = Dimensions.get('window');
  const { activityLevel, setActivityLevel } = useOnboardingStore();

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
            Activity level
          </Text>
          <Text
            style={{ fontFamily: fontFamily.regular }}
            className="mt-2 text-center text-base text-textSecondary-light dark:text-textSecondary-dark">
            How active are you currently?
          </Text>

          <View className="mt-6 w-full space-y-3 px-6 gap-3">
            {activityOptions.map((option) => {
              const isSelected = activityLevel === option.id;
              
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => setActivityLevel(option.id)}
                  activeOpacity={0.7}
                  className={`w-full rounded-3xl border-2 p-5 ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 bg-card-light dark:border-gray-700 dark:bg-card-dark'
                  }`}>
                  <View className="flex-row items-center justify-between">
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

export default ActivityLevelCard;