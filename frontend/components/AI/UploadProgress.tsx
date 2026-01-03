import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { fontFamily } from '@/src/theme/fontFamily';

interface UploadProgressProps {
  progress: number;
  message?: string;
}

const UploadProgress: React.FC<UploadProgressProps> = ({ progress, message }) => {
  return (
    <View className="items-center justify-center rounded-2xl bg-card-light p-6 dark:bg-card-dark">
      <ActivityIndicator size="large" color="#00FF87" />
      <Text
        style={{ fontFamily: fontFamily.bold }}
        className="mt-4 text-lg text-textPrimary-light dark:text-textPrimary-dark">
        {message || 'Uploading video...'}
      </Text>
      <View className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <View
          className="h-full rounded-full bg-primary-glow dark:bg-primary"
          style={{ width: `${progress}%` }}
        />
      </View>
      <Text
        style={{ fontFamily: fontFamily.medium }}
        className="mt-2 text-sm text-textSecondary-light dark:text-textSecondary-dark">
        {progress}%
      </Text>
    </View>
  );
};

export default UploadProgress;