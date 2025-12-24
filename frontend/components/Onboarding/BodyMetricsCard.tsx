import React from 'react';
import {  Text, View, TextInput, Dimensions, ScrollView } from 'react-native';
import { fontFamily } from '@/src/theme/fontFamily';
import { useOnboardingStore } from '@/src/store/onboardingStore';

const BodyMetricsCard = () => {
  const { width } = Dimensions.get('window');
  const { weight, height, targetWeight,age, setAge, setWeight, setHeight, setTargetWeight } =
    useOnboardingStore();
  
  const toNumber = (value: string | null): number | null => {
    if (!value) return null;
    const n = parseFloat(value);
    return isNaN(n) ? null : n;
  };
  
  // Calculate current BMI
  const calculateBMI = (weightStr: string | null, heightStr: string | null): number | null => {
    const weight = toNumber(weightStr);
    const height = toNumber(heightStr);
  
    if (!weight || !height || height === 0) return null;
  
    const heightM = height / 100;
    return parseFloat((weight / (heightM * heightM)).toFixed(1));
  };


  // Calculate ideal weight range for normal BMI (18.5-24.9)
  const calculateIdealWeight = (heightCm: string | null) => {
    if (!heightCm) return null;
    const heightNum = toNumber(heightCm);
    const heightM = heightNum! / 100;
    const minWeight = 18.5 * heightM * heightM;
    const maxWeight = 24.9 * heightM * heightM;
    const midWeight = (minWeight + maxWeight) / 2;
    return Math.round(midWeight);
  };

  // Get BMI category and colors
  const getBMICategory = (bmi : number | null) => {
    if (!bmi) return { label: '', bgColor: '', textColor: '' };
    if (bmi < 18.5) return { label: 'Underweight', bgColor: '#DBEAFE', textColor: '#1D4ED8' };
    if (bmi < 25) return { label: 'Normal', bgColor: '#D1FAE5', textColor: '#047857' };
    if (bmi < 30) return { label: 'Overweight', bgColor: '#FEF3C7', textColor: '#B45309' };
    return { label: 'Obese', bgColor: '#FEE2E2', textColor: '#DC2626' };
  };

  const currentBMI = calculateBMI(weight, height);
  const targetBMI = calculateBMI(targetWeight, height);
  const idealWeight = calculateIdealWeight(height);
  const currentBMICategory = getBMICategory(currentBMI);
  const targetBMICategory = getBMICategory(targetBMI);
  
  


  return (
    <ScrollView style={{ width: width }} showsVerticalScrollIndicator={false}>
      <View className="flex-1 items-center pt-6">
        <Text
          style={{ fontFamily: fontFamily.semiBold }}
          className="text-3xl text-textPrimary-light dark:text-textPrimary-dark">
          Your body details
        </Text>

        <View className="mt-6 w-full px-6">
          {/* Age Input */}
          <View className="mb-6">
            <Text
              style={{ fontFamily: fontFamily.medium }}
              className="mb-2 text-sm text-textSecondary-light dark:text-textSecondary-dark">
              Age
            </Text>
            <View className="relative">
              <TextInput
                value={age?.toString() || ''}
                onChangeText={(text) => setAge(text ? text : null)}
                keyboardType="number-pad"
                placeholder="25"
                placeholderTextColor="#9CA3AF"
                style={{ fontFamily: fontFamily.semiBold }}
                className="w-full rounded-3xl bg-card-light px-4 py-4 pr-12 text-2xl text-textPrimary-light dark:bg-card-dark dark:text-textPrimary-dark"
              />
              <Text
                style={{ fontFamily: fontFamily.regular }}
                className="absolute right-4 top-5 text-lg text-textSecondary-light dark:text-textSecondary-dark">
                yrs
              </Text>
            </View>
          </View>

          {/* Weight Input */}
          <View className="mb-6">
            <Text
              style={{ fontFamily: fontFamily.medium }}
              className="mb-2 text-sm text-textSecondary-light dark:text-textSecondary-dark">
              Weight (kg)
            </Text>
            <View className="relative">
              <TextInput
                value={weight?.toString() || ''}
                onChangeText={(text) => setWeight(text ? text: null)}
                keyboardType="decimal-pad"
                placeholder="70"
                placeholderTextColor="#9CA3AF"
                style={{ fontFamily: fontFamily.semiBold }}
                className="w-full rounded-3xl bg-card-light px-4 py-4 pr-12 text-2xl text-textPrimary-light dark:bg-card-dark dark:text-textPrimary-dark"
              />
              <Text
                style={{ fontFamily: fontFamily.regular }}
                className="absolute right-4 top-5 text-lg text-textSecondary-light dark:text-textSecondary-dark">
                kg
              </Text>
            </View>
          </View>

          {/* Height Input */}
          <View className="mb-6">
            <Text
              style={{ fontFamily: fontFamily.medium }}
              className="mb-2 text-sm text-textSecondary-light dark:text-textSecondary-dark">
              Height (cm)
            </Text>
            <View className="relative">
              <TextInput
                value={height?.toString() || ''}
                onChangeText={(text) => setHeight(text ? text : null)}
                keyboardType="decimal-pad"
                placeholder="175"
                placeholderTextColor="#9CA3AF"
                style={{ fontFamily: fontFamily.semiBold }}
                className="w-full rounded-3xl bg-card-light px-4 py-4 pr-12 text-2xl text-textPrimary-light dark:bg-card-dark dark:text-textPrimary-dark"
              />
              <Text
                style={{ fontFamily: fontFamily.regular }}
                className="absolute right-4 top-5 text-lg text-textSecondary-light dark:text-textSecondary-dark">
                cm
              </Text>
            </View>
          </View>

          {/* Target Weight Input */}
          <View className="mb-6">
            <Text
              style={{ fontFamily: fontFamily.medium }}
              className="mb-2 text-sm text-textSecondary-light dark:text-textSecondary-dark">
              Target weight (kg)
            </Text>
            <View className="relative">
              <TextInput
                value={targetWeight?.toString() || ''}
                onChangeText={(text) => setTargetWeight(text ? text : null)}
                keyboardType="decimal-pad"
                placeholder={idealWeight?.toString() || '65'}
                placeholderTextColor="#9CA3AF"
                style={{ fontFamily: fontFamily.semiBold }}
                className="w-full rounded-3xl bg-card-light px-4 py-4 pr-12 text-2xl text-textPrimary-light dark:bg-card-dark dark:text-textPrimary-dark"
              />
              <Text
                style={{ fontFamily: fontFamily.regular }}
                className="absolute right-4 top-5 text-lg text-textSecondary-light dark:text-textSecondary-dark">
                kg
              </Text>
            </View>
            {idealWeight && !targetWeight && (
              <Text
                style={{ fontFamily: fontFamily.regular }}
                className="mt-2 text-xs text-textSecondary-light dark:text-textSecondary-dark">
                Suggested: {idealWeight} kg (normal BMI range)
              </Text>
            )}
          </View>

          {/* BMI Display Cards */}
          <View className="mt-8 flex-row gap-4">
            {/* Current BMI */}
            <View
              className="flex-1 rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-5"
              style={{ backgroundColor: '#D1FAE5' }}>
              <Text
                style={{ fontFamily: fontFamily.medium }}
                className="mb-1 text-xs text-green-500">
                YOUR BMI
              </Text>
              <Text
                style={{ fontFamily: fontFamily.bold }}
                className="mb-2 text-4xl text-textPrimary-light dark:text-textPrimary-dark">
                {currentBMI || '--'}
              </Text>
              {currentBMI && (
                <View
                  className="flex-row items-center self-start rounded-full px-3 py-1"
                  style={{ backgroundColor: currentBMICategory.bgColor }}>
                  <View
                    className="mr-2 h-2 w-2 rounded-full"
                    style={{ backgroundColor: currentBMICategory.textColor }}
                  />
                  <Text
                    style={{ fontFamily: fontFamily.semiBold, color: currentBMICategory.textColor }}
                    className="text-xs">
                    {currentBMICategory.label}
                  </Text>
                </View>
              )}
              <Text
                style={{ fontFamily: fontFamily.regular }}
                className="mt-2 text-xs text-textSecondary-light dark:text-textSecondary-dark">
                Based on your{'\n'}height & weight
              </Text>
            </View>

            {/* Target BMI */}
            <View className="flex-1 rounded-3xl p-5" style={{ backgroundColor: '#DBEAFE' }}>
              <Text
                style={{ fontFamily: fontFamily.medium, color: '#1D4ED8' }}
                className="mb-1 text-xs">
                TARGET BMI
              </Text>
              <Text
                style={{ fontFamily: fontFamily.bold }}
                className="mb-2 text-4xl text-textPrimary-light dark:text-textPrimary-dark">
                {targetBMI || '--'}
              </Text>
              {targetBMI && (
                <View
                  className="flex-row items-center self-start rounded-full px-3 py-1"
                  style={{ backgroundColor: targetBMICategory.bgColor }}>
                  <View
                    className="mr-2 h-2 w-2 rounded-full"
                    style={{ backgroundColor: targetBMICategory.textColor }}
                  />
                  <Text
                    style={{ fontFamily: fontFamily.semiBold, color: targetBMICategory.textColor }}
                    className="text-xs">
                    {targetBMICategory.label}
                  </Text>
                </View>
              )}
              <Text
                style={{ fontFamily: fontFamily.regular }}
                className="mt-2 text-xs text-textSecondary-light dark:text-textSecondary-dark">
                Based on{'\n'}target weight
              </Text>
            </View>
          </View>

          {/* BMI Reference Guide */}
          <View className="mt-6 rounded-3xl bg-card-light p-4 dark:bg-card-dark">
            <Text
              style={{ fontFamily: fontFamily.semiBold }}
              className="mb-3 text-sm text-textPrimary-light dark:text-textPrimary-dark">
              BMI Reference
            </Text>
            <View className="space-y-2">
              <View className="mb-2 flex-row items-center justify-between">
                <Text
                  style={{ fontFamily: fontFamily.regular }}
                  className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
                  Underweight
                </Text>
                <Text
                  style={{ fontFamily: fontFamily.medium, color: '#1D4ED8' }}
                  className="text-xs">
                  &lt; 18.5
                </Text>
              </View>
              <View className="mb-2 flex-row items-center justify-between">
                <Text
                  style={{ fontFamily: fontFamily.regular }}
                  className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
                  Normal
                </Text>
                <Text
                  style={{ fontFamily: fontFamily.medium, color: '#047857' }}
                  className="text-xs">
                  18.5 - 24.9
                </Text>
              </View>
              <View className="mb-2 flex-row items-center justify-between">
                <Text
                  style={{ fontFamily: fontFamily.regular }}
                  className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
                  Overweight
                </Text>
                <Text
                  style={{ fontFamily: fontFamily.medium, color: '#B45309' }}
                  className="text-xs">
                  25 - 29.9
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text
                  style={{ fontFamily: fontFamily.regular }}
                  className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
                  Obese
                </Text>
                <Text
                  style={{ fontFamily: fontFamily.medium, color: '#DC2626' }}
                  className="text-xs">
                  ≥ 30
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default BodyMetricsCard;
