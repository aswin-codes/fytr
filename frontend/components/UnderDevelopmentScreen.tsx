import React from 'react';
import { View, Text } from 'react-native';

const UnderDevelopmentScreen = () => {
  return (
    <View className="flex-1 items-center justify-center bg-gray-100 p-4">
      <View className="items-center">
        <Text className="mb-4 text-4xl font-extrabold text-blue-600">🚧</Text>
        <Text className="mb-2 text-2xl font-bold text-gray-800">Under Development</Text>
        <Text className="text-center text-base text-gray-600">
          We're working hard to bring you this feature. Please check back soon!
        </Text>
      </View>
    </View>
  );
};

export default UnderDevelopmentScreen;
