import { ScrollView, Text, TouchableOpacity, View, Alert, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { fontFamily } from '@/src/theme/fontFamily'
import { Video } from 'lucide-react-native'
import { aiFormAnalyses } from '@/src/constants/MockData'
import AnalysisPreviewCard from '@/components/AI/AnalysisPreviewCard'
import { useRouter } from 'expo-router'
import QuotaDisplay from '@/components/AI/QuotaDisplay'
import { fetchQuotaStatus, refreshQuotaIfStale } from '@/src/controllers/quotaController'
import { useQuotaStore } from '@/src/store/quotaStore'

const FormScreen = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { canAnalyze, getQuotaMessage } = useQuotaStore();

  // Fetch quota on mount
  useEffect(() => {
    loadQuotaData();
  }, []);

  const loadQuotaData = async () => {
    try {
      await fetchQuotaStatus();
    } catch (error) {
      console.error('Failed to load quota:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchQuotaStatus();
    } catch (error) {
      console.error('Failed to refresh quota:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const navigateToCameraScreen = async () => {
    try {
      // Refresh quota if stale
      await refreshQuotaIfStale();
      
      // Check if user can analyze
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
    // TODO: Navigate to upgrade/payment screen
    Alert.alert('Coming Soon', 'Pro plan will be available soon!');
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark px-6 py-3">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={{ fontFamily: fontFamily.bold }} className="text-primary-glow dark:text-primary text-sm">
          AI FORM ANALYSIS
        </Text>
        <Text style={{ fontFamily: fontFamily.bold }} className="text-textPrimary-light dark:text-textPrimary-dark text-3xl mt-2">
          Train Smarter.
        </Text>
        <Text style={{ fontFamily: fontFamily.bold }} className="text-textSecondary-light dark:text-textSecondary-dark text-3xl">
          Fix your form.
        </Text>

        {/* Quota Display */}
        <QuotaDisplay onUpgradePress={handleUpgrade} />

        <View className="h-72 mt-5 flex items-center justify-center p-5">
          <TouchableOpacity onPress={navigateToCameraScreen}>
            <View className={`rounded-full p-5 ${
              canAnalyze() 
                ? 'bg-primary-glow dark:bg-primary' 
                : 'bg-gray-400 dark:bg-gray-600'
            }`}>
              <Video size={30} color="black" />
            </View>
          </TouchableOpacity>
          <Text style={{ fontFamily: fontFamily.bold }} className='mt-2 text-lg text-textPrimary-light dark:text-textPrimary-dark'>
            Analyze your form
          </Text>
          <View className='bg-card-light dark:bg-card-dark rounded-full px-2 py-1 mt-2'>
            <Text style={{ fontFamily: fontFamily.medium }} className='text-textSecondary-light dark:text-textSecondary-dark text-sm'>
              {canAnalyze() ? 'Tap to record' : 'Limit reached'}
            </Text>
          </View>
        </View>

        <View className='flex-row w-full justify-between items-center my-5'>
          <Text style={{ fontFamily: fontFamily.bold }} className="text-textPrimary-light dark:text-textPrimary-dark text-xl">
            Previous Analyses
          </Text>
          <TouchableOpacity onPress={navigateToAllAnalysesScreen}>
            <Text style={{ fontFamily: fontFamily.regular }} className="text-textSecondary-light dark:text-textSecondary-dark text-xs">
              View all
            </Text>
          </TouchableOpacity>
        </View>

        {aiFormAnalyses.length === 0 ? (
          <View className='h-48 justify-center items-center'>
            <Text style={{ fontFamily: fontFamily.regular }} className="text-textSecondary-light dark:text-textSecondary-dark text-base">
              No analysis found!
            </Text>
          </View>
        ) : (
          <View>
            {aiFormAnalyses.slice(0, 3).map((analysis) => (
              <AnalysisPreviewCard key={analysis.id} analysis={analysis} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default FormScreen