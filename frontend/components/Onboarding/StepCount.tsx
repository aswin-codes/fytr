import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

const StepCount = ({ step }) => {
  return (
    <View className="flex w-full flex-row gap-2 px-6 pb-5">
      <View
        className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-primary-glow dark:bg-primary' : 'bg-gray-300'}`}></View>
      <View
        className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-primary-glow dark:bg-primary' : 'bg-gray-300'}`}></View>
      <View
        className={`h-1 flex-1 rounded-full ${step >= 3 ? 'bg-primary-glow dark:bg-primary' : 'bg-gray-300'}`}></View>
      <View
        className={`h-1 flex-1 rounded-full ${step >= 4 ? 'bg-primary-glow dark:bg-primary' : 'bg-gray-300'}`}></View>
      <View
        className={`h-1 flex-1 rounded-full ${step >= 5 ? 'bg-primary-glow dark:bg-primary' : 'bg-gray-300'}`}></View>
      <View
        className={`h-1 flex-1 rounded-full ${step >= 6 ? 'bg-primary-glow dark:bg-primary' : 'bg-gray-300'}`}></View>
    </View>
  );
};

export default StepCount;

const styles = StyleSheet.create({});
