import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Linking, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamily } from '@/src/theme/fontFamily';
import { 
  TrendingUp, 
  Target, 
  Dumbbell, 
  Clock,
  Video,
  ChevronRight,
  Library,
  Shield,
  Lock,
  FileText,
  LogOut,
  KeyRound,
  Palette
} from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/src/auth/useAuth';
import { useIsPaid } from '@/src/store/quotaStore';
import { useAnalysisStore } from '@/src/store/analysisStore';
import { AiAnalysis } from '@/src/types/aiAnalysisTypes';

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const minutes = Math.floor(diffSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
};

const getInitials = (name: string | null | undefined): string => {
  if (!name) return '';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const ProfileScreen = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const isPaid = useIsPaid();
  const analysisStore = useAnalysisStore();
  const { analyses, getTotalAnalyses, getAverageScore } = analysisStore;

  const [uniqueExercises, setUniqueExercises] = useState(0);
  const [lastScanDisplay, setLastScanDisplay] = useState('N/A');
  const [isLoadingProfileData, setIsLoadingProfileData] = useState(true);

  useEffect(() => {
    setIsLoadingProfileData(authLoading); 
  }, [authLoading]);

  useEffect(() => {
    if (!analyses) return;
    const unique = new Set(analyses.map((a: AiAnalysis) => a.exercise));
    setUniqueExercises(unique.size);
    if (analyses.length > 0) {
      setLastScanDisplay(formatRelativeTime(analyses[0].recordedAt));
    }
    setIsLoadingProfileData(false);
  }, [analyses]);

  const handleExploreLibrary = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(app)/explore');
  };

  const handleAIFormAnalysis = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(app)/ai');
  };

  const handleThemeSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(app)/profile/ThemeSettingScreen');
  };

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  if (isLoadingProfileData || !user) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#F6F000" />
        <Text className="mt-4 text-textPrimary-light dark:text-textPrimary-dark text-lg" style={{ fontFamily: fontFamily.medium }}>
          Loading profile...
        </Text>
      </SafeAreaView>
    );
  }

  const userInitials = getInitials(user.displayName || user.email);

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-row items-center justify-center px-6 mb-6">
        <Text className="text-xl text-textPrimary-light dark:text-textPrimary-dark" style={{ fontFamily: fontFamily.bold }}>
          Profile
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="items-center mb-8">
          <View className="relative mb-4">
            <View className="w-32 h-32 rounded-full bg-surface-light dark:bg-surface-dark border-4 border-primary items-center justify-center overflow-hidden">
              {user.photoURL ? (
                <Image source={{ uri: user.photoURL }} className="w-full h-full" />
              ) : (
                <Text style={{ fontFamily: fontFamily.bold }} className="text-5xl text-textPrimary-light dark:text-textPrimary-dark">
                  {userInitials}
                </Text>
              )}
            </View>
            {isPaid && (
              <View className="absolute bottom-0 right-0 bg-primary px-3 py-1 rounded-full">
                <Text className="text-black text-xs" style={{ fontFamily: fontFamily.bold }}>PRO</Text>
              </View>
            )}
          </View>
          <Text className="text-2xl text-textPrimary-light dark:text-textPrimary-dark mb-1" style={{ fontFamily: fontFamily.bold }}>
            {user.displayName || 'Gymmie User'}
          </Text>
          <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark mb-4" style={{ fontFamily: fontFamily.regular }}>
            {user.email || 'N/A'}
          </Text>
        </View>

        <View className="flex-row flex-wrap mb-8 gap-3">
          <View className="flex-1 min-w-[47%] bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xs text-textMuted-light dark:text-textMuted-dark uppercase tracking-wide" style={{ fontFamily: fontFamily.semiBold }}>
                TOTAL SCANS
              </Text>
              <TrendingUp size={20} color="#6B7280" />
            </View>
            <Text className="text-3xl text-textPrimary-light dark:text-textPrimary-dark" style={{ fontFamily: fontFamily.bold }}>
              {getTotalAnalyses()}
            </Text>
          </View>

          <View className="flex-1 min-w-[47%] bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xs text-textMuted-light dark:text-textMuted-dark uppercase tracking-wide" style={{ fontFamily: fontFamily.semiBold }}>
                AVG ACCURACY
              </Text>
              <Target size={20} color="#6B7280" />
            </View>
            <Text className="text-3xl text-textPrimary-light dark:text-textPrimary-dark" style={{ fontFamily: fontFamily.bold }}>
              {getAverageScore()}%
            </Text>
          </View>

          <View className="flex-1 min-w-[47%] bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xs text-textMuted-light dark:text-textMuted-dark uppercase tracking-wide" style={{ fontFamily: fontFamily.semiBold }}>
                EXERCISES
              </Text>
              <Dumbbell size={20} color="#6B7280" />
            </View>
            <Text className="text-3xl text-textPrimary-light dark:text-textPrimary-dark" style={{ fontFamily: fontFamily.bold }}>
              {uniqueExercises}
            </Text>
          </View>

          <View className="flex-1 min-w-[47%] bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xs text-textMuted-light dark:text-textMuted-dark uppercase tracking-wide" style={{ fontFamily: fontFamily.semiBold }}>
                LAST SCAN
              </Text>
              <Clock size={20} color="#6B7280" />
            </View>
            <Text className="text-xl text-primary" style={{ fontFamily: fontFamily.bold }}>
              {lastScanDisplay}
            </Text>
          </View>
        </View>

        <View className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-4 mb-6">
          <TouchableOpacity onPress={handleExploreLibrary} className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                <Library size={20} color="#F6F000" />
              </View>
              <Text className="text-base text-textPrimary-light dark:text-textPrimary-dark" style={{ fontFamily: fontFamily.semiBold }}>
                Exercise Library
              </Text>
            </View>
            <ChevronRight size={20} color="#6B7280" />
          </TouchableOpacity>

          <View className="h-px bg-border-light dark:bg-border-dark my-2" />

          <TouchableOpacity onPress={handleAIFormAnalysis} className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                <Video size={20} color="#F6F000" />
              </View>
              <Text className="text-base text-textPrimary-light dark:text-textPrimary-dark" style={{ fontFamily: fontFamily.semiBold }}>
                AI Form Analysis
              </Text>
            </View>
            <ChevronRight size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View className="mb-8">
          <Text className="text-xs text-textMuted-light dark:text-textMuted-dark uppercase tracking-wider mb-3 px-2" style={{ fontFamily: fontFamily.semiBold }}>
            ACCOUNT
          </Text>

          <View className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-4">
            <TouchableOpacity onPress={handleThemeSettings} className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center flex-1 gap-2">
                <Palette size={20} color="#9CA3AF" />
                <Text className="text-base text-textPrimary-light dark:text-textPrimary-dark" style={{ fontFamily: fontFamily.medium }}>
                  Theme
                </Text>
              </View>
              <ChevronRight size={20} color="#6B7280" />
            </TouchableOpacity>

            <View className="h-px bg-border-light dark:bg-border-dark my-2" />

            <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(root)/ChangePasswordScreen'); }} className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center flex-1 gap-2">
                <Lock size={20} color="#9CA3AF" />
                <Text className="text-base text-textPrimary-light dark:text-textPrimary-dark" style={{ fontFamily: fontFamily.medium }}>
                  Change Password
                </Text>
              </View>
              <ChevronRight size={20} color="#6B7280" />
            </TouchableOpacity>

            <View className="h-px bg-border-light dark:bg-border-dark my-2" />

            <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(root)/ForgotPassword'); }} className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center flex-1 gap-2">
                <KeyRound size={20} color="#9CA3AF" />
                <Text className="text-base text-textPrimary-light dark:text-textPrimary-dark" style={{ fontFamily: fontFamily.medium }}>
                  Forgot Password
                </Text>
              </View>
              <ChevronRight size={20} color="#6B7280" />
            </TouchableOpacity>

            <View className="h-px bg-border-light dark:bg-border-dark my-2" />

            <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL('https://gymmieapp.vercel.app/privacy'); }} className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center flex-1 gap-2">
                <Shield size={20} color="#9CA3AF" />
                <Text className="text-base text-textPrimary-light dark:text-textPrimary-dark" style={{ fontFamily: fontFamily.medium }}>
                  Privacy
                </Text>
              </View>
              <ChevronRight size={20} color="#6B7280" />
            </TouchableOpacity>

            <View className="h-px bg-border-light dark:bg-border-dark my-2" />

            <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL('https://gymmieapp.vercel.app/terms'); }} className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center flex-1 gap-2">
                <FileText size={20} color="#9CA3AF" />
                <Text className="text-base text-textPrimary-light dark:text-textPrimary-dark" style={{ fontFamily: fontFamily.medium }}>
                  Terms & Conditions
                </Text>
              </View>
              <ChevronRight size={20} color="#6B7280" />
            </TouchableOpacity>

            <View className="h-px bg-border-light dark:bg-border-dark my-2" />

            <TouchableOpacity onPress={handleLogout} className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center flex-1 gap-2">
                <LogOut size={20} color="#EF4444" />
                <Text className="text-base text-red-500" style={{ fontFamily: fontFamily.semiBold }}>
                  Logout
                </Text>
              </View>
              <ChevronRight size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;