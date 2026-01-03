import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Sparkles, Zap, Lock, Infinity } from 'lucide-react-native';
import { fontFamily } from '@/src/theme/fontFamily';
import { useQuotaStore } from '@/src/store/quotaStore';

interface QuotaDisplayProps {
  onUpgradePress?: () => void;
}

const QuotaDisplay: React.FC<QuotaDisplayProps> = ({ onUpgradePress }) => {
  const { limit, used, remaining, isPaid, isLoading, getQuotaMessage } = useQuotaStore();
  
  if (isLoading) {
    return (
      <></>
    );
  }

  const isUnlimited = isPaid || limit === -1;
  const percentage = isUnlimited ? 100 : (used / limit) * 100;
  const canAnalyze = isUnlimited || remaining > 0;

  return (
    <View className="mt-2">
      {/* Header */}
      {
        isUnlimited && (<View className="flex-row gap-2 items-center">
          <Infinity color={'#e17100'} size={16} />
          <Text style={{fontFamily: fontFamily.medium}} className="text-sm text-textSecondary-light dark:text-textSecondary-dark">Unlimited AI analysis</Text>
        </View>) 
      }
      
      {
        !isUnlimited && (remaining !== 0 ) && (<View className="flex-row gap-2 items-center">
          <Zap color={'gray'} size={16} />
          <Text style={{ fontFamily: fontFamily.medium }} className="text-sm text-textSecondary-light dark:text-textSecondary-dark">{remaining} requests remaining today</Text>
        </View>) 
      }
      
      {
        !isUnlimited && remaining === 0 && (<View className="flex-row gap-2 items-center">
          <Lock color={'gray'} size={16} />
          <Text style={{ fontFamily: fontFamily.medium }} className="text-sm text-textSecondary-light dark:text-textSecondary-dark">No requests remaining today</Text>
        </View>) 
      }
      
   
    </View>
  );
};

export default QuotaDisplay;