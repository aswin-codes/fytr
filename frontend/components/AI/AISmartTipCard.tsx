import React, { useEffect, useRef } from 'react';
import { View, Text, useColorScheme, Animated } from 'react-native';
import { Lightbulb } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fontFamily } from '@/src/theme/fontFamily';

interface AISmartTipProps {
  tip: string;
  title?: string;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const AISmartTip: React.FC<AISmartTipProps> = ({
  tip,
  title = 'AI Smart Tip',
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnimation, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: false,
      })
    ).start();
  }, []);

  // Animate gradient position for shimmer effect
  const startX = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-1, 1],
  });

  const endX = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 2],
  });

  const borderColor = isDark ? '#8B7355' : '#D4AF37';
  const iconBgColor = isDark ? '#8B7355' : '#D4AF37';
  const titleColor = isDark ? '#F6F000' : '#654321';
  const textColor = isDark ? '#D4C5B0' : '#6B5D4F';

  return (
    <View 
      className="rounded-2xl overflow-hidden" 
      style={{ borderWidth: 1.5, borderColor: borderColor }}
    >
      <AnimatedLinearGradient
        colors={
          isDark 
            ? ['#3A3420', '#4A4228', '#3A3420', '#2D2810'] 
            : ['#FEF7CD', '#FFE66D', '#FEF7CD', '#FFF9E0']
        }
        start={{ x: startX, y: 0 }}
        end={{ x: endX, y: 1 }}
        locations={[0, 0.3, 0.6, 1]}
        className="p-5"
      >
        {/* Header */}
        <View className="flex-row items-center mb-3">
          <View 
            className="w-8 h-8 rounded-full items-center justify-center" 
            style={{ backgroundColor: iconBgColor }}
          >
            <Lightbulb size={16} color="#FFFFFF" fill="#FFFFFF" />
          </View>
          <Text 
            style={{ fontFamily: fontFamily.bold, color: titleColor }} 
            className="text-base ml-2.5"
          >
            {title}
          </Text>
        </View>

        {/* Tip Content */}
        <Text 
          style={{ fontFamily: fontFamily.regular, color: textColor }} 
          className="text-sm leading-5"
        >
          {tip}
        </Text>
      </AnimatedLinearGradient>
    </View>
  );
};

export default AISmartTip;