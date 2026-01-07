import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { fontFamily } from '@/src/theme/fontFamily';
import { Video, Search, Edit } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface QuickActionsProps {
  onLogWorkout: () => void;
  onAIFormCheck: () => void;
  onExplore: () => void;
  onEditPlan: () => void;
}

export default function QuickActions({
  onLogWorkout,
  onAIFormCheck,
  onExplore,
  onEditPlan,
}: QuickActionsProps) {
  const handlePress = (action: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    action();
  };

  return (
    <View className="px-6 mb-6">
      <Text
        style={{ fontFamily: fontFamily.bold }}
        className="text-xl text-textPrimary-light dark:text-textPrimary-dark mb-4"
      >
        Quick Actions
      </Text>

      <View className="flex-row flex-wrap gap-3">
        {/* Log Workout */}
        <TouchableOpacity
          onPress={() => handlePress(onLogWorkout)}
          activeOpacity={0.7}
          className="w-[48%] rounded-2xl bg-white dark:bg-surface-dark p-4 items-center"
        >
          <View className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-3">
            <Ionicons name="create-outline" size={24} color="gray" />
          </View>
          <Text
            style={{ fontFamily: fontFamily.semiBold }}
            className="text-base text-textPrimary-light dark:text-textPrimary-dark"
          >
            Log Workout
          </Text>
        </TouchableOpacity>

        {/* AI Form Check */}
        <TouchableOpacity
          onPress={() => handlePress(onAIFormCheck)}
          activeOpacity={0.7}
          className="w-[48%] rounded-2xl bg-white dark:bg-surface-dark p-4 items-center"
        >
          <View className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-3">
            <Video size={24} color="gray" />
          </View>
          <Text
            style={{ fontFamily: fontFamily.semiBold }}
            className="text-base text-textPrimary-light dark:text-textPrimary-dark"
          >
            AI Form Check
          </Text>
        </TouchableOpacity>

        {/* Explore */}
        <TouchableOpacity
          onPress={() => handlePress(onExplore)}
          activeOpacity={0.7}
          className="w-[48%] rounded-2xl bg-white dark:bg-surface-dark p-4 items-center"
        >
          <View className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-3">
            <Search size={24} color="gray" />
          </View>
          <Text
            style={{ fontFamily: fontFamily.semiBold }}
            className="text-base text-textPrimary-light dark:text-textPrimary-dark"
          >
            Explore
          </Text>
        </TouchableOpacity>

        {/* Edit Plan */}
        <TouchableOpacity
          onPress={() => handlePress(onEditPlan)}
          activeOpacity={0.7}
          className="w-[48%] rounded-2xl bg-white dark:bg-surface-dark p-4 items-center"
        >
          <View className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-3">
            <Edit size={24} color="gray" />
          </View>
          <Text
            style={{ fontFamily: fontFamily.semiBold }}
            className="text-base text-textPrimary-light dark:text-textPrimary-dark"
          >
            Edit Plan
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}