import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { fontFamily } from '@/src/theme/fontFamily';

interface PositiveFeedbackListProps {
  title?: string;
  items: string[];
  iconColor?: string;
  iconBgColor?: string;
}

const PositiveFeedbackList: React.FC<PositiveFeedbackListProps> = ({
  title = 'What You Did Right',
  items,
  iconColor = '#10b981', // green-500
  iconBgColor = '#d1fae5', // green-100
}) => {
  return (
    <View className="bg-surface-light dark:bg-surface-dark rounded-2xl p-5">
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <Check size={20} color={iconColor} strokeWidth={3} />
        <Text 
          style={{ fontFamily: fontFamily.bold }} 
          className="text-textPrimary-light dark:text-textPrimary-dark text-base ml-2"
        >
          {title}
        </Text>
      </View>

      {/* List Items */}
      <View className="gap-3">
        {items.map((item, index) => (
          <View key={index} className="flex-row items-start">
            {/* Check Icon */}
            <View 
              style={{ backgroundColor: iconBgColor }}
              className="w-5 h-5 rounded-full items-center justify-center mt-0.5"
            >
              <Check size={12} color={iconColor} strokeWidth={3} />
            </View>
            
            {/* Text */}
            <Text 
              style={{ fontFamily: fontFamily.regular }} 
              className="text-textSecondary-light dark:text-textSecondary-dark text-sm ml-3 flex-1 leading-5"
            >
              {item}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default PositiveFeedbackList;