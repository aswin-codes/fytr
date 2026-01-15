import { Text, View, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { Images } from '@/src/constants/assets';
import { fontFamily } from '@/src/theme/fontFamily';
import { Sparkles, ChevronRight, Lightbulb } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

const CreatePlanCard = () => {
  const handleGenerateAIPlan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to AI plan generation
    router.push('/(plan)/PlanTypeScreen');
  };


  return (
    <View className="relative bg-surface-light dark:bg-surface-dark rounded-[32px] p-6 border border-border-light dark:border-border-dark overflow-hidden">
      {/* Content */}
      <View className="relative z-10">
        {/* Badge */}
        <View className="mb-4">
          <View className="self-start px-3 py-1.5 rounded-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark">
            <Text 
              className="text-[10px] text-textMuted-light dark:text-textMuted-dark uppercase tracking-wider"
              style={{ fontFamily: fontFamily.semiBold }}
            >
              NO ACTIVE PLAN
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text 
          className="text-3xl text-textPrimary-light dark:text-textPrimary-dark mb-3 leading-tight uppercase"
          style={{ fontFamily: fontFamily.semiBold }}
        >
          READY TO{'\n'}LEVEL UP?
        </Text>

        {/* Description */}
        <Text 
          className="text-sm text-textSecondary-light dark:text-textSecondary-dark mb-6 leading-relaxed"
          style={{ fontFamily: fontFamily.regular }}
        >
          Create your first workout plan to start tracking streaks and earning XP.
        </Text>

        {/* Generate AI Plan Button */}
        <TouchableOpacity
          onPress={handleGenerateAIPlan}
          className="bg-primary rounded-full h-14 flex-row items-center justify-center mb-3"
          style={{
            shadowColor: '#F6F000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
        >
          <Sparkles size={20} color="#000" strokeWidth={2.5} />
          <Text 
            className="text-black text-sm ml-2 uppercase tracking-wide"
            style={{ fontFamily: fontFamily.bold }}
          >
            Create Plan Now
          </Text>
          <ChevronRight size={20} color="#000" strokeWidth={2.5} className="ml-1" />
        </TouchableOpacity>

        

        {/* Why Start Now Section */}
        <View className="mt-6 flex-row items-start">
          <View className="mr-2 mt-0.5">
            <Lightbulb size={16} color="#9CA3AF" />
          </View>
          <View className="flex-1">
            <Text 
              className="text-xs text-textMuted-light dark:text-textMuted-dark mb-1 uppercase tracking-wider"
              style={{ fontFamily: fontFamily.semiBold }}
            >
              WHY START NOW?
            </Text>
            <Text 
              className="text-xs text-textSecondary-light dark:text-textSecondary-dark leading-relaxed"
              style={{ fontFamily: fontFamily.regular }}
            >
              Consistency is key. Users with an active plan are 3x more likely to reach their fitness goals in the first 90 days.
            </Text>
          </View>
        </View>
      </View>

      {/* Background Image */}
      <Image 
        className="absolute bottom-0 right-0 opacity-20"
        source={Images.exercisecard}
        resizeMode="contain"
      />
    </View>
  );
};

export default CreatePlanCard;