import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { fontFamily } from '@/src/theme/fontFamily';

interface CircularScoreProps {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

const CircularScore: React.FC<CircularScoreProps> = ({
  score,
  maxScore = 100,
  size = 150,
  strokeWidth = 12,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Prevent complete overlap at 100%
  const progress = score >= maxScore 
    ? circumference - 0.1 
    : (score / maxScore) * circumference;
  const center = size / 2;

  // Get color based on score
  const getColors = () => {
    if (score >= 75) {
      return {
        stroke: '#F6F000', // primary yellow
        background: '#FFF85A20', // primary-soft with opacity
        glow: '#E6E000',
        label: "Good Form"
      };
    }
    if (score >= 50) {
      return {
        stroke: '#F59E0B', // warning orange
        background: '#F59E0B20',
        glow: '#D97706',
        label: "Average Form"
      };
    }
    return {
      stroke: '#EF4444', // error red
      background: '#EF444420',
      glow: '#DC2626',
      label: "Poor Form"
    };
  };

  const colors = getColors();

  return (
    <View className="items-center justify-center">
      <View 
        style={{ width: size, height: size }} 
        className="relative items-center justify-center mb-3"
      >
        {/* Background circle with light color */}
        <View 
          style={[
            {
              width: size - strokeWidth,
              height: size - strokeWidth,
              borderRadius: (size - strokeWidth) / 2,
              backgroundColor: colors.background,
            }
          ]} 
          className="absolute"
        />
        
        {/* SVG Progress Circle */}
        <Svg width={size} height={size} style={styles.svg}>
          <G rotation="-90" origin={`${center}, ${center}`}>
            {/* Background track */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#E5E7EB"
              strokeWidth={strokeWidth}
              fill="none"
              opacity={0.3}
            />
            {/* Progress arc */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={colors.stroke}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${progress} ${circumference}`}
              strokeLinecap="round"
            />
          </G>
        </Svg>

        {/* Center content */}
        <View className="absolute items-center justify-center">
          <View className="flex-row items-baseline">
            <Text 
              style={{ fontFamily: fontFamily.bold }} 
              className="text-5xl text-textPrimary-light dark:text-textPrimary-dark"
            >
              {score}
            </Text>
            <Text 
              //style={{ fontFamily: fontFamily.semiBold }} 
              className="text-lg font-semibold text-textSecondary-light dark:text-textSecondary-dark ml-1"
            >
              /100
            </Text>
          </View>
          <Text 
            style={{ fontFamily: fontFamily.bold, letterSpacing: 0.5 }} 
            className="text-[11px] text-textSecondary-light dark:text-textSecondary-dark mt-1"
          >
            {colors.label}
          </Text>
        </View>
      </View>
      
      <Text 
        style={{ fontFamily: fontFamily.semiBold, letterSpacing: 1 }} 
        className="text-xs text-textMuted-light dark:text-textMuted-dark mt-2"
      >
        OVERALL FORM SCORE
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  svg: {
    position: 'absolute',
  },
});

export default CircularScore;