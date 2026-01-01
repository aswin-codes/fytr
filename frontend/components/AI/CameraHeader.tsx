// components/AI/Camera/CameraHeader.tsx
import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { X } from 'lucide-react-native'
import { fontFamily } from '@/src/theme/fontFamily'

interface CameraHeaderProps {
  onClose: () => void
  isRecording: boolean
  currentTime: number
  maxTime: number
}

const CameraHeader: React.FC<CameraHeaderProps> = ({
  onClose,
  isRecording,
  currentTime,
  maxTime,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return (
    <View className="flex-row justify-between items-center px-5 pt-4">
      {/* Close Button */}
      <Pressable 
        onPress={onClose}
        className="w-12 h-12 rounded-full bg-black/50 items-center justify-center"
      >
        <X size={24} color="white" strokeWidth={2.5} />
      </Pressable>

      {/* Timer */}
      <View className="bg-black/70 rounded-full px-6 py-3 flex-row items-center">
        {isRecording && (
          <View className="w-2 h-2 rounded-full bg-red-500 mr-3" />
        )}
        <Text 
          style={{ fontFamily: fontFamily.bold }} 
          className="text-white text-base"
        >
          {formatTime(currentTime)} / {formatTime(maxTime)}
        </Text>
      </View>

      {/* Spacer for symmetry */}
      <View className="w-12" />
    </View>
  )
}

export default CameraHeader