import { View, Text, ScrollView, TouchableOpacity, Image, Alert, useColorScheme } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamily } from '@/src/theme/fontFamily';
import {
  Bell,
  Video,
  ChevronRight,
  Lightbulb,
  Camera, Scan, CheckCircle2
} from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import { Images } from '@/src/constants/assets';
import { getGreeting } from '@/src/controllers/greetingController';
import { useAuth } from '@/src/auth/useAuth';
import { useAnalysisStore } from '@/src/store/analysisStore'; // Import useAnalysisStore
import { AiAnalysis } from '@/src/types/aiAnalysisTypes'; // Import AiAnalysis type
import { formatRelativeTime } from '@/src/utils/date'; // Import the new utility

const CircularProgress = ({
  percentage,
  size = 140,
  strokeWidth = 12,
  isDark = true
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  isDark?: boolean;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const center = size / 2;
  
  // Theme-aware background color
  const backgroundColor = isDark ? '#2A2A2A' : '#E5E7EB';

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center mb-4">
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#F6F000"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      <Text
        className="text-textPrimary-light dark:text-textPrimary-dark text-5xl"
        style={{ fontFamily: fontFamily.bold }}
      >
        {percentage}%
      </Text>
    </View>
  );
};

const HomeScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();
  const { getRecentAnalyses } = useAnalysisStore(); // Get the selector for recent analyses

  const recentAnalyses = getRecentAnalyses(2); // Fetch the two most recent analyses

  // Get user's first name or display name
  const getUserName = () => {
    if (!user) return null;
    if (user.displayName) {
      // Get first name from display name
      return user.displayName.split(' ')[0];
    }
    // Fallback to email username
    if (user.email) {
      return user.email.split('@')[0];
    }
    return null;
  };

  const [greetingData, setGreetingData] = useState(getGreeting(getUserName()));

  // Update greeting every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setGreetingData(getGreeting(getUserName()));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [user]);

  const handleAIScan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/(app)/ai');
  };

  const handleExploreLibrary = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(app)/explore');
  };

  const handleViewAllActivity = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(app)/ai/AllAnalysesScreen');
  };

  const handleNotifications = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Notifications', 'No new notifications');
  };

  const handleProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(app)/profile');
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-2 pb-6">
        <View className="flex-row items-center gap-2">
          <Image source={Images.logo} className="w-12 h-12 rounded-lg" />
          <View>
            <Text className="text-textPrimary-light dark:text-textPrimary-dark text-xl tracking-wider" style={{ fontFamily: fontFamily.bold }}>
              GYMMIE
            </Text>
            <Text className="text-textSecondary-light dark:text-textSecondary-dark text-xs tracking-wider" style={{ fontFamily: fontFamily.regular }}>
              AI Form Scanner for Perfect Lifts
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Greeting Banner */}
        <View className="mx-6 mb-6">
          <View className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl p-5 border border-primary/20">
            <View className="flex-row items-center mb-2">
              <Text className="text-4xl mr-3">{greetingData.emoji}</Text>
              <Text 
                className="text-textPrimary-light dark:text-textPrimary-dark text-2xl flex-1" 
                style={{ fontFamily: fontFamily.bold }}
              >
                {greetingData.greeting}
              </Text>
            </View>
            <Text 
              className="text-textSecondary-light dark:text-textSecondary-dark text-base leading-6" 
              style={{ fontFamily: fontFamily.regular }}
            >
              {greetingData.message}
            </Text>
          </View>
        </View>

        {/* AI Scan Card */}
        <View className="mx-6 mb-6">
          <View className="bg-surface-light dark:bg-surface-dark rounded-[32px] p-6 border border-border-light dark:border-border-dark">
            <View className="bg-primary/20 self-start px-4 py-1.5 rounded-full mb-4">
              <Text
                className="text-primary text-xs tracking-widest"
                style={{ fontFamily: fontFamily.bold }}
              >
                AI ENGINE V1.0
              </Text>
            </View>

            <Text
              className="text-textPrimary-light dark:text-textPrimary-dark text-[32px] leading-tight mb-3"
              style={{ fontFamily: fontFamily.bold }}
            >
              Start AI Scan
            </Text>

            <Text
              className="text-textSecondary-light dark:text-textSecondary-dark text-base mb-6 leading-6"
              style={{ fontFamily: fontFamily.regular }}
            >
              Real-time biomechanics analysis for perfect lifting form.
            </Text>

            <TouchableOpacity
              onPress={handleAIScan}
              className="bg-primary rounded-2xl py-4 px-6 flex-row items-center justify-center"
              activeOpacity={0.8}
            >
              <Video size={20} color="#000000" strokeWidth={2.5} fill="#000000" />
              <Text
                className="text-black text-base ml-2 tracking-wider"
                style={{ fontFamily: fontFamily.bold }}
              >
                SCAN NOW
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Exercise Library Card */}
        <TouchableOpacity
          onPress={handleExploreLibrary}
          activeOpacity={0.9}
          className="mx-6 mb-6"
        >
          <View className="rounded-[32px] overflow-hidden h-48 bg-surface-light dark:bg-surface-dark">
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80' }}
              className="w-full h-full absolute opacity-50 dark:opacity-30"
              resizeMode="cover"
            />

            <View className="absolute inset-0 bg-black/30 dark:bg-black/50" />

            <View className="flex-1 p-6 justify-end">
              <Text
                className="text-white text-[28px] mb-1"
                style={{ fontFamily: fontFamily.bold }}
              >
                Exercise Library
              </Text>
              <View className="flex-row items-center justify-between">
                <Text
                  className="text-gray-200 dark:text-gray-300 text-base"
                  style={{ fontFamily: fontFamily.regular }}
                >
                  Browse 800+ curated movements
                </Text>
                <View className="w-12 h-12 rounded-full bg-white/10 dark:bg-white/20 items-center justify-center">
                  <ChevronRight size={24} color="#FFFFFF" strokeWidth={2.5} />
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Recent Activity Section */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-5">
            <Text
              className="text-textPrimary-light dark:text-textPrimary-dark text-2xl"
              style={{ fontFamily: fontFamily.bold }}
            >
              Recent Activity
            </Text>
            <TouchableOpacity onPress={handleViewAllActivity}>
              <Text
                className="text-primary text-sm tracking-wider"
                style={{ fontFamily: fontFamily.bold }}
              >
                VIEW ALL
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-4">
            {recentAnalyses.length === 0 ? (
              <View className="flex-1 items-center justify-center bg-surface-light dark:bg-surface-dark rounded-[32px] p-6 border border-border-light dark:border-border-dark ">
                <Text
                  className="text-textSecondary-light dark:text-textSecondary-dark text-base h-[250px]"
                  style={{ fontFamily: fontFamily.medium }}
                >
                  No recent analyses.
                </Text>
              </View>
            ) : (
              recentAnalyses.map((analysis, index) => (
                <TouchableOpacity
                  key={analysis.id}
                  activeOpacity={0.8}
                  className="flex-1"
                  onPress={() => router.push({
            pathname: '/(app)/ai/ResultsScreen',
            params: { 
                analysis: JSON.stringify(analysis)
            }
        })} // Navigate to individual analysis
                >
                  <View className="bg-surface-light dark:bg-surface-dark rounded-[32px] p-6 border border-border-light dark:border-border-dark items-center ">
                    <CircularProgress percentage={analysis.score} size={140} strokeWidth={12} isDark={isDark} />
                    <Text
                      className="text-textPrimary-light dark:text-textPrimary-dark text-xl mb-1 capitalize"
                      style={{ fontFamily: fontFamily.bold }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {analysis.exercise}
                    </Text>
                    <Text
                      className="text-textMuted-light dark:text-textMuted-dark text-xs tracking-wider"
                      style={{ fontFamily: fontFamily.medium }}
                    >
                      {formatRelativeTime(analysis.recordedAt).toUpperCase()}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* How We Scan Section */}
        <View className="mx-6 mb-6">
          <Text
            className="text-textPrimary-light dark:text-textPrimary-dark text-xl mb-4 px-1"
            style={{ fontFamily: fontFamily.bold }}
          >
            How We Scan
          </Text>

          <View className="bg-surface-light dark:bg-surface-dark rounded-[32px] p-6 border border-border-light dark:border-border-dark">
            {/* Step 1 - Position */}
            <View className="flex-row items-start">
              <View className="w-12 h-12 rounded-2xl bg-primary/20 items-center justify-center mr-4">
                <Camera size={24} color="#F6F000" strokeWidth={2} />
              </View>
              <View className="flex-1">
                <Text className="text-textPrimary-light dark:text-textPrimary-dark text-base mb-1" style={{ fontFamily: fontFamily.semiBold }}>
                  Position Your Camera
                </Text>
                <Text className="text-textSecondary-light dark:text-textSecondary-dark text-sm leading-5" style={{ fontFamily: fontFamily.regular }}>
                  Place your phone at a 45° angle, 6-8 feet away to capture your full body movement.
                </Text>
              </View>
            </View>

            {/* Divider */}
            <View className="h-px bg-border-light dark:bg-border-dark my-5" />

            {/* Step 2 - AI Detection */}
            <View className="flex-row items-start">
              <View className="w-12 h-12 rounded-2xl bg-primary/20 items-center justify-center mr-4">
                <Scan size={24} color="#F6F000" strokeWidth={2} />
              </View>
              <View className="flex-1">
                <Text className="text-textPrimary-light dark:text-textPrimary-dark text-base mb-1" style={{ fontFamily: fontFamily.semiBold }}>
                  AI Detection
                </Text>
                <Text className="text-textSecondary-light dark:text-textSecondary-dark text-sm leading-5" style={{ fontFamily: fontFamily.regular }}>
                  Our AI tracks 33+ body keypoints in real-time, analyzing joint angles and movement patterns.
                </Text>
              </View>
            </View>

            {/* Divider */}
            <View className="h-px bg-border-light dark:bg-border-dark my-5" />

            {/* Step 3 - Instant Feedback */}
            <View className="flex-row items-start">
              <View className="w-12 h-12 rounded-2xl bg-primary/20 items-center justify-center mr-4">
                <CheckCircle2 size={24} color="#F6F000" strokeWidth={2} />
              </View>
              <View className="flex-1">
                <Text className="text-textPrimary-light dark:text-textPrimary-dark text-base mb-1" style={{ fontFamily: fontFamily.semiBold }}>
                  Instant Feedback
                </Text>
                <Text className="text-textSecondary-light dark:text-textSecondary-dark text-sm leading-5" style={{ fontFamily: fontFamily.regular }}>
                  Get immediate form scores and personalized tips to improve your technique and prevent injury.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom spacing for tab bar */}
        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;