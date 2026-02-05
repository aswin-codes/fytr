import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { fontFamily } from '@/src/theme/fontFamily';
import { Ionicons } from '@expo/vector-icons';

interface HomeHeaderProps {
  firstName: string;
}

export default function HomeHeader({ firstName }: HomeHeaderProps) {
  const router = useRouter();

  return (
    <View className="px-6 pt-4 pb-6 flex-row items-center justify-between">
      <View>
        <Text
          style={{ fontFamily: fontFamily.bold }}
          className="text-2xl text-textPrimary-light dark:text-textPrimary-dark"
        >
          Good Morning, {firstName}
        </Text>
        <Text
          style={{ fontFamily: fontFamily.regular }}
          className="text-base text-textSecondary-light dark:text-textSecondary-dark mt-1"
        >
          Ready to get started?
        </Text>
      </View>

      <View className="flex-row items-center gap-3">
        {/* Notification Bell */}
        <TouchableOpacity
          className="w-12 h-12 rounded-full bg-card-light dark:bg-card-dark items-center justify-center"
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={24} color="gray" />
        </TouchableOpacity>

        {/* Profile Avatar */}
        <TouchableOpacity
          onPress={() => router.push('/(app)/profile')}
          className="w-12 h-12 rounded-full bg-primary items-center justify-center"
          activeOpacity={0.7}
        >
          <Text
            style={{ fontFamily: fontFamily.bold }}
            className="text-lg text-black"
          >
            {firstName.charAt(0).toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}