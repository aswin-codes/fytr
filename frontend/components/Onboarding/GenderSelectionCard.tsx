import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { fontFamily } from '@/src/theme/fontFamily';
import { Mars, Venus } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useOnboardingStore } from '@/src/store/onboardingStore';

const GenderOption = ({ icon, label, selected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`mb-4 flex-row items-center gap-3 rounded-3xl px-5 py-8 ${
      selected ? 'border-2 border-primary-glow dark:border-primary  bg-card-light dark:bg-card-dark' : 'border-2 border-transparent  bg-card-light dark:bg-card-dark '
    }`}
    activeOpacity={0.7}>
    {icon}
    <Text className="text-lg font-medium text-textPrimary-light dark:text-textPrimary-dark">{label}</Text>
  </TouchableOpacity>
);

const GenderSelectionCard = () => {
  const { width } = Dimensions.get('window');
  const [selectedGender, setSelectedGender] = useState('male');
  const { colorScheme } = useColorScheme();
  const {gender, setGender} = useOnboardingStore();
  return (
    <View style={{ width: width }} className="flex-1 items-center  pt-6">
      <Text
        style={{ fontFamily: fontFamily.semiBold }}
        className="text-3xl text-textPrimary-light dark:text-textPrimary-dark">
        Select your gender
      </Text>
      <Text
        style={{ fontFamily: fontFamily.regular }}
        className="mb-8 mt-2 text-base text-textSecondary-dark">
        To calculate your daily calorie needs.
      </Text>
      <View className="mt-4 w-full px-6">
        <GenderOption
          icon={<Mars color={colorScheme === 'dark' ? 'white' : 'black'} />}
          label="Male"
          selected={gender === 'male'}
          onPress={() => setGender('male')}
        />

        <GenderOption
          icon={<Venus color={colorScheme === 'dark' ? 'white' : 'black'} />}
          label="Female"
          selected={gender === 'female'}
          onPress={() => setGender('female')}
        />
      </View>
    </View>
  );
};

export default GenderSelectionCard;

const styles = StyleSheet.create({});
