// components/AI/Camera/InstructionBanner.tsx
import React, { useRef, useEffect} from 'react'
import { View, Text, Animated,  } from 'react-native'
import { fontFamily } from '@/src/theme/fontFamily'

interface InstructionBannerProps {
  instruction: string
  isRecording: boolean
}

const InstructionBanner: React.FC<InstructionBannerProps> = ({
  instruction,
  isRecording,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start()
    }
  }, [isRecording])

  return (
    <View className="absolute top-32 left-0 right-0 items-center px-8">
      <Animated.View 
        style={{ transform: [{ scale: pulseAnim }] }}
        className="bg-black/70 rounded-full px-6 py-4 flex-row items-center"
      >
        <Text className="text-primary text-2xl mr-3">🧍</Text>
        <Text 
          style={{ fontFamily: fontFamily.bold }} 
          className="text-white text-base"
        >
          {instruction}
        </Text>
      </Animated.View>
    </View>
  )
}

export default InstructionBanner