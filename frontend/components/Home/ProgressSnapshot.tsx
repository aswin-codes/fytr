import React from 'react';
import { View, Text } from 'react-native';
import { fontFamily } from '@/src/theme/fontFamily';
import { Flame, Zap, Trophy } from 'lucide-react-native';

export default function ProgressSnapshot() {
  return (
    <View className="px-6 mb-6">
      <Text
        style={{ fontFamily: fontFamily.bold }}
        className="text-xl text-textPrimary-light dark:text-textPrimary-dark mb-4"
      >
        Progress Snapshot
      </Text>

      <View className="flex-row gap-3">
        {/* Week Streak */}
        <View className="flex-1 rounded-2xl bg-white dark:bg-surface-dark p-4 items-center">
          <View className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center mb-2">
            <Flame size={24} color="#F97316" />
          </View>
          <Text
            style={{ fontFamily: fontFamily.bold }}
            className="text-2xl text-textPrimary-light dark:text-textPrimary-dark"
          >
            5
          </Text>
          <Text
            style={{ fontFamily: fontFamily.regular }}
            className="text-xs text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-wider"
          >
            WEEK STREAK
          </Text>
        </View>

        {/* XP Earned */}
        <View className="flex-1 rounded-2xl bg-white dark:bg-surface-dark p-4 items-center">
          <View className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 items-center justify-center mb-2">
            <Zap size={24} color="#EAB308" />
          </View>
          <Text
            style={{ fontFamily: fontFamily.bold }}
            className="text-2xl text-textPrimary-light dark:text-textPrimary-dark"
          >
            2.3k
          </Text>
          <Text
            style={{ fontFamily: fontFamily.regular }}
            className="text-xs text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-wider"
          >
            XP EARNED
          </Text>
        </View>

        {/* Global Rank */}
        <View className="flex-1 rounded-2xl bg-white dark:bg-surface-dark p-4 items-center">
          <View className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mb-2">
            <Trophy size={24} color="#3B82F6" />
          </View>
          <Text
            style={{ fontFamily: fontFamily.bold }}
            className="text-2xl text-textPrimary-light dark:text-textPrimary-dark"
          >
            #12
          </Text>
          <Text
            style={{ fontFamily: fontFamily.regular }}
            className="text-xs text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-wider"
          >
            GLOBAL
          </Text>
        </View>
      </View>
    </View>
  );
}