import { fontFamily } from '@/src/theme/fontFamily';
import React from 'react';
import { View, Text, Dimensions } from 'react-native';

const IntroCard = () => {
  
  const { width } = Dimensions.get('window')
  return (
    <View style={{width:width}} className='flex-1   pt-14 items-center'>
      <Text style={{fontFamily: fontFamily.semiBold}} className='text-7xl text-primary-glow dark:text-primary'>FYTR</Text>
      <Text style={{fontFamily: fontFamily.semiBold}} className="text-2xl mt-5 text-textPrimary-light dark:text-textPrimary-dark">Train Smarter.</Text>
      <Text style={{fontFamily: fontFamily.semiBold}} className="text-2xl  text-textPrimary-light dark:text-textPrimary-dark">Get Stronger.</Text>
      <Text style={{fontFamily: fontFamily.medium}} className="mt-5 px-14 text-center text-md  text-textSecondary-light dark:text-textSecondary-dark">AI powered fitness coaching designed for your goals.</Text>
    </View>
  );
};

export default IntroCard;