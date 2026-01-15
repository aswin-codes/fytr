import React from 'react';
import { View, Text } from 'react-native';
import {  X } from 'lucide-react-native';
import { fontFamily } from '@/src/theme/fontFamily';

interface ImprovementFeedbackListProps {
  title?: string;
  items: string[];
}

const ImprovementFeedbackList: React.FC<ImprovementFeedbackListProps> = ({
  title = 'Areas for Improvement',
  items,
}) => {
  const iconColor = 'red'; // warning orange
  const iconBgColor = '#FEF3C7'; // yellow-100

  return (
    <View className="bg-surface-light dark:bg-surface-dark rounded-2xl p-5">
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <X size={20} color={iconColor} strokeWidth={2.5} />
        <Text 
          style={{ fontFamily: fontFamily.semiBold }} 
          className="text-textPrimary-light dark:text-textPrimary-dark text-base ml-2"
        >
          {title}
        </Text>
      </View>

      {/* List Items */}
      <View className="gap-3">
        {items.map((item, index) => (
          <View key={index} className="flex-row items-start">
            {/* Warning Icon */}
            <View 
              style={{ backgroundColor: iconBgColor }}
              className="w-5 h-5 rounded-full items-center justify-center mt-0.5"
            >
              <X size={12} color={iconColor} strokeWidth={3} />
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

export default ImprovementFeedbackList;