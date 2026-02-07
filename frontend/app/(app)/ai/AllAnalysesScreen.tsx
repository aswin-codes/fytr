import { StyleSheet, Text, View, ActivityIndicator, RefreshControl } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamily } from '@/src/theme/fontFamily';
import AnalysisPreviewCard from '@/components/AI/AnalysisPreviewCard';
import { useAnalysisStore } from '@/src/store/analysisStore';
import { FlashList } from '@shopify/flash-list';
import { fetchAllAnalyses, loadMoreAnalyses } from '@/src/controllers/analysisController';

const AllAnalysesScreen = () => {
  const { 
    getAllAnalyses, 
    isLoading, 
    isLoadingMore, 
    hasMore,
    totalAnalyses 
  } = useAnalysisStore();
  
  const analyses = getAllAnalyses();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      await fetchAllAnalyses(1, 20);
    } catch (error) {
      console.error('Failed to load analyses:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchAllAnalyses(1, 20);
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadMoreAnalyses();
    }
  };

  const renderHeader = () => (
    <View className="mb-4">
     
      <Text
        style={{ fontFamily: fontFamily.regular }}
        className="mt-1 text-sm text-textSecondary-light dark:text-textSecondary-dark">
        {totalAnalyses} {totalAnalyses === 1 ? 'analysis' : 'analyses'} total
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#00FF87" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View className="h-96 items-center justify-center">
          <ActivityIndicator size="large" color="#00FF87" />
          <Text
            style={{ fontFamily: fontFamily.regular }}
            className="mt-4 text-base text-textSecondary-light dark:text-textSecondary-dark">
            Loading analyses...
          </Text>
        </View>
      );
    }

    return (
      <View className="h-96 items-center justify-center">
        <Text
          style={{ fontFamily: fontFamily.regular }}
          className="text-base text-textSecondary-light dark:text-textSecondary-dark">
          No analysis found!
        </Text>
        <Text
          style={{ fontFamily: fontFamily.regular }}
          className="mt-2 text-sm text-textSecondary-light dark:text-textSecondary-dark">
          Record your first analysis to get started
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-1 px-6">
        <FlashList
          data={analyses}
          renderItem={({ item }) => <AnalysisPreviewCard analysis={item} />}
          keyExtractor={(item) => item.id}
          //estimatedItemSize={120}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#00FF87"
              colors={['#00FF87']}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

export default AllAnalysesScreen;

const styles = StyleSheet.create({});