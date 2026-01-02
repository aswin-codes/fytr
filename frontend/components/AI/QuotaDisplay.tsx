import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Sparkles, Zap, Lock } from 'lucide-react-native';
import { fontFamily } from '@/src/theme/fontFamily';
import { useQuotaStore } from '@/src/store/quotaStore';

interface QuotaDisplayProps {
  onUpgradePress?: () => void;
}

const QuotaDisplay: React.FC<QuotaDisplayProps> = ({ onUpgradePress }) => {
  const { limit, used, remaining, isPaid, isLoading, getQuotaMessage } = useQuotaStore();
  
  if (isLoading) {
    return (
      <View className="bg-card-light dark:bg-card-dark rounded-2xl p-4 mt-4">
        <ActivityIndicator size="small" color="#00FF87" />
      </View>
    );
  }

  const isUnlimited = isPaid || limit === -1;
  const percentage = isUnlimited ? 100 : (used / limit) * 100;
  const canAnalyze = isUnlimited || remaining > 0;

  return (
    <View className="bg-card-light dark:bg-card-dark rounded-2xl p-4 mt-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          {isUnlimited ? (
            <>
              <Sparkles size={20} color="#00FF87" />
              <Text
                style={{ fontFamily: fontFamily.bold }}
                className="text-primary-glow dark:text-primary text-sm ml-2"
              >
                PRO PLAN
              </Text>
            </>
          ) : (
            <>
              <Zap size={20} color="#00FF87" />
              <Text
                style={{ fontFamily: fontFamily.bold }}
                className="text-textPrimary-light dark:text-textPrimary-dark text-sm ml-2"
              >
                FREE PLAN
              </Text>
            </>
          )}
        </View>
        
        {isUnlimited && (
          <View className="bg-primary-glow/20 dark:bg-primary/20 rounded-full px-3 py-1">
            <Text
              style={{ fontFamily: fontFamily.medium }}
              className="text-primary-glow dark:text-primary text-xs"
            >
              Unlimited
            </Text>
          </View>
        )}
      </View>

      {/* Progress Bar (only for free users) */}
      {!isUnlimited && (
        <View className="mb-3">
          <View className="bg-background-light dark:bg-background-dark rounded-full h-2 overflow-hidden">
            <View
              className={`h-full rounded-full ${
                percentage >= 80
                  ? 'bg-red-500'
                  : percentage >= 60
                  ? 'bg-yellow-500'
                  : 'bg-primary-glow dark:bg-primary'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </View>
        </View>
      )}

      {/* Quota Message */}
      <Text
        style={{ fontFamily: fontFamily.medium }}
        className="text-textSecondary-light dark:text-textSecondary-dark text-sm mb-2"
      >
        {getQuotaMessage()}
      </Text>

      {/* Usage Stats */}
      <View className="flex-row items-center justify-between">
        <Text
          style={{ fontFamily: fontFamily.regular }}
          className="text-textSecondary-light dark:text-textSecondary-dark text-xs"
        >
          {isUnlimited ? `${used} analyses today` : `${used} / ${limit} used`}
        </Text>
        
        {!canAnalyze && (
          <View className="flex-row items-center">
            <Lock size={12} color="#EF4444" />
            <Text
              style={{ fontFamily: fontFamily.medium }}
              className="text-red-500 text-xs ml-1"
            >
              Limit Reached
            </Text>
          </View>
        )}
      </View>

      {/* Upgrade Button (only for free users with no remaining quota) */}
      {!isUnlimited && remaining === 0 && onUpgradePress && (
        <TouchableOpacity
          onPress={onUpgradePress}
          className="bg-primary-glow dark:bg-primary rounded-xl py-3 mt-4"
        >
          <Text
            style={{ fontFamily: fontFamily.bold }}
            className="text-black text-center text-sm"
          >
            Upgrade to Pro for Unlimited
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default QuotaDisplay;