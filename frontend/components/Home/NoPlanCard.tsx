import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { fontFamily } from '@/src/theme/fontFamily';
import { Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface NoPlanCardProps {
  onCreatePlan: () => void;
}

export default function NoPlanCard({ onCreatePlan }: NoPlanCardProps) {
  const handleCreatePlan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCreatePlan();
  };

  return (
    <View
      className="rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 p-8 items-center"
      style={{
        backgroundColor: '#F6F00020',
      }}
    >
      <View className="w-20 h-20 rounded-full bg-primary items-center justify-center mb-4">
        <Sparkles size={40} color="#000000" />
      </View>

      <Text
        style={{ fontFamily: fontFamily.bold }}
        className="text-xl text-textPrimary-light dark:text-textPrimary-dark mb-2 text-center"
      >
        No Workout Plan Yet
      </Text>

      <Text
        style={{ fontFamily: fontFamily.regular }}
        className="text-base text-textSecondary-light dark:text-textSecondary-dark mb-6 text-center"
      >
        Create a plan to track workouts, earn XP, and build streaks.
      </Text>

      <TouchableOpacity
        onPress={handleCreatePlan}
        activeOpacity={0.8}
        className="bg-primary h-14 px-8 rounded-full items-center justify-center"
      >
        <Text
          style={{ fontFamily: fontFamily.bold }}
          className="text-lg text-black"
        >
          Create Plan Manually
        </Text>
      </TouchableOpacity>
    </View>
  );
}