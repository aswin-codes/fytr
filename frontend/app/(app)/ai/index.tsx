import { ScrollView, Text, TouchableOpacity, View, Alert, RefreshControl } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamily } from '@/src/theme/fontFamily';
import { Lock, Sparkle, Video } from 'lucide-react-native';
import AnalysisPreviewCard from '@/components/AI/AnalysisPreviewCard';
import { useRouter } from 'expo-router';
import QuotaDisplay from '@/components/AI/QuotaDisplay';
import { fetchQuotaStatus, refreshQuotaIfStale } from '@/src/controllers/quotaController';
import { useQuotaStore } from '@/src/store/quotaStore';
import { fetchAllAnalyses, refreshAnalysesIfStale } from '@/src/controllers/analysisController';
import { useAnalysisStore, useRecentAnalyses } from '@/src/store/analysisStore';

const FormScreen = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { limit, used, remaining, isPaid, isLoading, canAnalyze } = useQuotaStore();
  const { isLoading: isLoadingAnalyses } = useAnalysisStore();
  const recentAnalyses = useRecentAnalyses(3);

 

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchQuotaStatus(), fetchAllAnalyses()]);
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const navigateToCameraScreen = async () => {
    try {
      await refreshQuotaIfStale();

      if (!canAnalyze()) {
        Alert.alert(
          'Daily Limit Reached',
          'You have used all your daily analyses. Upgrade to Pro for unlimited analyses!',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade to Pro', onPress: handleUpgrade },
          ]
        );
        return;
      }

      router.push('/(app)/ai/CameraScreen');
    } catch (error) {
      console.error('Error navigating to camera:', error);
      Alert.alert('Error', 'Failed to check quota. Please try again.');
    }
  };

  const navigateToAllAnalysesScreen = () => {
    router.push('/(app)/ai/AllAnalysesScreen');
  };

  const handleUpgrade = () => {
    Alert.alert('Coming Soon', 'Pro plan will be available soon!');
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light px-6 py-3 dark:bg-background-dark">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className="flex-row gap-2">
          <Text
            style={{ fontFamily: fontFamily.bold }}
            className="text-sm text-primary-glow dark:text-primary">
            AI FORM ANALYSIS
          </Text>
          {isPaid === true && isLoading === false && (
            <View className="flex-row items-center gap-1 rounded-full border border-amber-500 bg-amber-500/10 px-2 py-1">
              <Sparkle size={10} color={'#e17100'} />
              <Text style={{ fontFamily: fontFamily.semiBold }} className="text-xs text-amber-500">
                Premium
              </Text>
            </View>
          )}
        </View>
        <Text
          style={{ fontFamily: fontFamily.bold }}
          className="mt-2 text-3xl text-textPrimary-light dark:text-textPrimary-dark">
          Train Smarter.
        </Text>
        <Text
          style={{ fontFamily: fontFamily.bold }}
          className="text-3xl text-textSecondary-light dark:text-textSecondary-dark">
          Fix your form.
        </Text>

        <QuotaDisplay onUpgradePress={handleUpgrade} />

        <View className="mt-5 flex h-72 items-center justify-center p-5">
          <TouchableOpacity onPress={navigateToCameraScreen}>
            <View
              className={`rounded-full p-5 ${
                canAnalyze() ? 'bg-primary-glow dark:bg-primary' : 'bg-gray-200 dark:bg-gray-600'
              }`}>
              {canAnalyze() ? <Video size={30} color="black" /> : <Lock size={30} color={'black'} />}
            </View>
          </TouchableOpacity>
          <Text
            style={{ fontFamily: fontFamily.bold }}
            className="mt-2 text-lg text-textPrimary-light dark:text-textPrimary-dark">
            {canAnalyze() ? 'Analyze your form' : 'Analysis Limit Reached'}
          </Text>
          <View className="mt-2 rounded-full bg-card-light px-2 py-1 dark:bg-card-dark">
            <Text
              style={{ fontFamily: fontFamily.medium }}
              className="text-sm text-textSecondary-light dark:text-textSecondary-dark">
              {canAnalyze() ? 'Tap to record' : 'Refreshes tomorrow'}
            </Text>
          </View>
        </View>

        <View className="my-5 w-full flex-row items-center justify-between">
          <Text
            style={{ fontFamily: fontFamily.bold }}
            className="text-xl text-textPrimary-light dark:text-textPrimary-dark">
            Previous Analyses
          </Text>
          <TouchableOpacity onPress={navigateToAllAnalysesScreen}>
            <Text
              style={{ fontFamily: fontFamily.regular }}
              className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
              View all
            </Text>
          </TouchableOpacity>
        </View>

        {isLoadingAnalyses ? (
          <View className="h-48 items-center justify-center">
            <Text
              style={{ fontFamily: fontFamily.regular }}
              className="text-base text-textSecondary-light dark:text-textSecondary-dark">
              Loading analyses...
            </Text>
          </View>
        ) : recentAnalyses.length === 0 ? (
          <View className="h-48 items-center justify-center">
            <Text
              style={{ fontFamily: fontFamily.regular }}
              className="text-base text-textSecondary-light dark:text-textSecondary-dark">
              No analysis found!
            </Text>
          </View>
        ) : (
          <View>
            {recentAnalyses.map((analysis) => (
              <AnalysisPreviewCard key={analysis.id} analysis={analysis} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default FormScreen;