import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { fontFamily } from '@/src/theme/fontFamily';

interface LeaderboardUser {
  rank: number;
  name: string;
  initial: string;
  xp: number;
  progress: number;
  isTopUser?: boolean;
  avatarColor?: string;
}

const LEADERBOARD_DATA: LeaderboardUser[] = [
  { rank: 1, name: 'Sarah K.', initial: 'S', xp: 2850, progress: 85, isTopUser: true },
  { rank: 2, name: 'Mike T.', initial: 'M', xp: 2620, progress: 75, avatarColor: '#3B82F6' },
  { rank: 3, name: 'Jessie R.', initial: 'J', xp: 2410, progress: 70, avatarColor: '#EC4899' },
];

export default function Leaderboard() {
  return (
    <View className="px-6">
      <View className="flex-row items-center justify-between mb-4">
        <Text
          style={{ fontFamily: fontFamily.bold }}
          className="text-xl text-textPrimary-light dark:text-textPrimary-dark"
        >
          Leaderboard
        </Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text
            style={{ fontFamily: fontFamily.semiBold }}
            className="text-sm text-primary"
          >
            View Full
          </Text>
        </TouchableOpacity>
      </View>

      <View className="gap-3">
        {LEADERBOARD_DATA.map((user) => (
          <LeaderboardItem key={user.rank} user={user} />
        ))}
      </View>
    </View>
  );
}

function LeaderboardItem({ user }: { user: LeaderboardUser }) {
  return (
    <View className="flex-row items-center bg-white dark:bg-surface-dark rounded-2xl p-4">
      <Text
        style={{ fontFamily: fontFamily.bold }}
        className="text-lg text-textSecondary-light dark:text-textSecondary-dark w-8"
      >
        {user.rank}
      </Text>

      <View
        className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
          user.isTopUser ? 'bg-primary' : ''
        }`}
        style={{
          backgroundColor: user.isTopUser ? undefined : user.avatarColor,
        }}
      >
        <Text
          style={{ fontFamily: fontFamily.bold }}
          className={`text-base ${user.isTopUser ? 'text-black' : 'text-white'}`}
        >
          {user.initial}
        </Text>
      </View>

      <View className="flex-1">
        <Text
          style={{ fontFamily: fontFamily.semiBold }}
          className="text-base text-textPrimary-light dark:text-textPrimary-dark"
        >
          {user.name}
        </Text>
        <View className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 mt-2 overflow-hidden">
          <View
            className={user.isTopUser ? 'h-full bg-primary' : 'h-full bg-gray-400 dark:bg-gray-500'}
            style={{ width: `${user.progress}%` }}
          />
        </View>
      </View>

      <Text
        style={{ fontFamily: user.isTopUser ? fontFamily.bold : fontFamily.semiBold }}
        className={`text-base ml-3 ${
          user.isTopUser
            ? 'text-primary'
            : 'text-textSecondary-light dark:text-textSecondary-dark'
        }`}
      >
        {user.xp.toLocaleString()} XP
      </Text>
    </View>
  );
}