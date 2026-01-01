// components/AI/Camera/CameraControls.tsx
import React, { useRef } from 'react'
import { View, Pressable, Animated, StyleSheet } from 'react-native'
import { RefreshCw } from 'lucide-react-native'

interface CameraControlsProps {
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void
  onFlipCamera: () => void
  disabled?: boolean
}

const CameraControls: React.FC<CameraControlsProps> = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  onFlipCamera,
  disabled = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    if (disabled) return
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    if (disabled) return
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start()
  }

  return (
    <View className="absolute bottom-0 left-0 right-0 pb-12">
      <View className="flex-row items-center justify-center px-12">
        {/* Spacer for symmetry */}
        <View className="w-20" />

        {/* Record Button */}
        <View className="flex-1 items-center">
          <Pressable
            onPress={isRecording ? onStopRecording : onStartRecording}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
          >
            <Animated.View
              style={[
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: disabled ? 0.5 : 1,
                }
              ]}
            >
              {/* Outer Ring with Glow */}
              <View style={[
                styles.outerRing,
                isRecording && styles.recordingGlow
              ]}>
                {/* Inner Circle */}
                <View 
                  style={[
                    styles.innerCircle,
                    isRecording ? styles.recording : styles.ready
                  ]} 
                />
              </View>
            </Animated.View>
          </Pressable>
        </View>

        {/* Flip Camera Button */}
        <View className="w-20 items-center">
          <Pressable 
            onPress={onFlipCamera}
            className="w-14 h-14 rounded-full bg-gray-800/70 items-center justify-center"
            disabled={isRecording || disabled}
            style={{ opacity: (isRecording || disabled) ? 0.5 : 1 }}
          >
            <RefreshCw size={24} color="white" />
          </Pressable>
        </View>
      </View>
    </View>
  )
}

export default CameraControls

const styles = StyleSheet.create({
  outerRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#F6F000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingGlow: {
    borderColor: '#FF0000',
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  innerCircle: {
    borderRadius: 40,
  },
  ready: {
    width: 80,
    height: 80,
    backgroundColor: 'white',
  },
  recording: {
    width: 40,
    height: 40,
    backgroundColor: '#FF0000',
    borderRadius: 8,
  },
})