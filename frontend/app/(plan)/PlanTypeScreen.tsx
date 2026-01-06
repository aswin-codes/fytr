import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { fontFamily } from '@/src/theme/fontFamily';
import { SafeAreaView } from 'react-native-safe-area-context';
import {Toast} from 'toastify-react-native'

type PlanType = 'manual' | 'ai' | null;

export default function PlanTypeScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('manual');

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (selectedPlan === null) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.error('Please select a plan type');
      return;
    }
    
    if (selectedPlan === 'manual') {
      router.push('/(plan)/WeeklySplitScreen');
    } else {
      // Navigate to AI plan creation (coming soon)
      // router.push('/(plan)/create-ai');
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const selectPlanType = (type: PlanType) => {
    Haptics.selectionAsync();
    setSelectedPlan(type);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <StatusBar barStyle="dark-content" />
      
      <View className="flex-1 px-6 pt-4">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={handleBack}
            className="w-12 h-12 items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={28} color="gray" />
          </TouchableOpacity>
        </View>

        {/* Title and Description */}
        <View className="mb-8">
          <Text
            style={{ fontFamily: fontFamily.bold }}
            className="text-3xl text-textPrimary-light dark:text-textPrimary-dark mb-4"
          >
            How do you want to plan your workouts?
          </Text>
          
          <Text
            style={{ fontFamily: fontFamily.regular }}
            className="text-base text-textSecondary-light dark:text-textSecondary-dark"
          >
            You can build your own plan or let AI design one for you.
          </Text>
        </View>

        {/* Plan Options */}
        <View className="gap-6 flex mb-6">
          {/* Manual Schedule */}
          <View
            className="shadow-lg shadow-black "
          >
            <TouchableOpacity
              onPress={() => selectPlanType('manual')}
              activeOpacity={0.7}
              className={`rounded-3xl p-5 flex-row items-center ${
                selectedPlan === 'manual'
                  ? 'bg-white dark:bg-surface-dark border-2 border-primary'
                  : 'bg-white dark:bg-surface-dark'
              }`}
            >
            <View className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 items-center justify-center mr-4">
              <Text className="text-3xl">🏋️</Text>
            </View>
            
            <View className="flex-1">
              <Text
                style={{ fontFamily: fontFamily.bold }}
                className="text-xl text-textPrimary-light dark:text-textPrimary-dark mb-1"
              >
                Manual Schedule
              </Text>
              <Text
                style={{ fontFamily: fontFamily.regular }}
                className="text-sm text-textSecondary-light dark:text-textSecondary-dark"
              >
                I already have a routine. I'll input it myself.
              </Text>
            </View>
          </TouchableOpacity>
          </View>

          {/* AI Designed Plan */}
          <View className="relative">
            {selectedPlan === 'ai' && (
              <View className="absolute -top-3 left-6 z-10 bg-primary px-4 py-1 rounded-full flex-row items-center">
                <Text className="text-xl mr-1">✨</Text>
                <Text
                  style={{ fontFamily: fontFamily.bold }}
                  className="text-black text-sm"
                >
                  Coming Soon
                </Text>
              </View>
            )}

            <View
              className='shadow-lg shadow-black '
            >
              <TouchableOpacity
                
                onPress={() => selectPlanType('ai')}
                activeOpacity={0.7}
                className={`rounded-3xl p-5 flex-row items-center ${
                  selectedPlan === 'ai'
                    ? 'bg-white dark:bg-surface-dark border-2 border-primary'
                    : 'bg-white dark:bg-surface-dark'
                }`}
              >
              <View className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 items-center justify-center mr-4">
                <Text className="text-3xl">🤖</Text>
              </View>
              
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text
                    style={{ fontFamily: fontFamily.bold }}
                    className="text-xl text-textPrimary-light dark:text-textPrimary-dark"
                  >
                    AI Designed Plan
                  </Text>
                </View>
                <Text
                  style={{ fontFamily: fontFamily.regular }}
                  className="text-sm text-textSecondary-light dark:text-textSecondary-dark"
                >
                  Smart recommendations based on your goals.
                </Text>
              </View>
            </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Continue Button */}
      <View className="px-6 pb-8">
        <TouchableOpacity
          onPress={handleContinue}
          activeOpacity={0.8}
          disabled={selectedPlan === 'ai'} // Disable if AI is selected (coming soon)
          className={`h-16 rounded-full items-center justify-center flex-row ${
            selectedPlan === 'ai'
              ? 'bg-gray-300 dark:bg-gray-700'
              : 'bg-primary'
          }`}
          style={{
            shadowColor: selectedPlan === 'manual' ? '#F6F000' : '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: selectedPlan === 'manual' ? 0.3 : 0,
            shadowRadius: 12,
            elevation: selectedPlan === 'manual' ? 4 : 0,
          }}
        >
          <Text
            style={{ fontFamily: fontFamily.bold }}
            className={`text-lg mr-2 ${
              selectedPlan === 'ai'
                ? 'text-gray-500 dark:text-gray-400'
                : 'text-black'
            }`}
          >
            Continue
          </Text>
          <Ionicons
            name="arrow-forward"
            size={24}
            color={selectedPlan === 'ai' ? '#6B7280' : '#000000'}
          />
        </TouchableOpacity>
        
        {selectedPlan === 'ai' && (
          <Text
            style={{ fontFamily: fontFamily.regular }}
            className="text-center text-sm text-textSecondary-light dark:text-textSecondary-dark mt-3"
          >
            AI plan generation is coming soon! Try manual schedule instead.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}