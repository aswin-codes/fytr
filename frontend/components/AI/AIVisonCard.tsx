// components/AI/AIVisionCard.tsx
import React, { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, Easing } from 'react-native'
import { useVideoPlayer, VideoView } from 'expo-video'
import { fontFamily } from '@/src/theme/fontFamily'

interface AIVisionCardProps {
  videoUrl: string
  exercise?: string
  compact?: boolean  // Add this prop
}

const AIVisionCard: React.FC<AIVisionCardProps> = ({ 
  videoUrl, 
  compact = false  // Default false
}) => {
  const [isReady, setIsReady] = useState(false)

  // Animation values
  const scanLineAnim = useRef(new Animated.Value(0)).current
  const gridOpacityAnim = useRef(new Animated.Value(0)).current
  const cornerAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  // Video player
  const player = useVideoPlayer(videoUrl, player => {
    player.loop = true;
    player.play()
  })

  useEffect(() => {
    // Start animations after a brief delay
    const timer = setTimeout(() => {
      setIsReady(true)
      startAnimations()
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const startAnimations = () => {
    // Grid fade in
    Animated.timing(gridOpacityAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start()

    // Scanning line animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start()

    // Corner animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(cornerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(cornerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start()

    // Pulse animation for badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300],
  })

  const cornerOpacity = cornerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  })

   // Adjust sizes based on compact mode
   const cardHeight = compact ? 'h-full' : 'h-80'
   const badgeSize = compact ? 'text-[10px]' : 'text-xs'
   const exerciseLabelSize = compact ? 'text-xs' : 'text-sm'

  return (
    <View className="p-4">
      <View className={`w-full ${cardHeight} rounded-3xl overflow-hidden bg-black relative`}>
        {/* Video Background */}
        <VideoView 
          player={player}
          style={StyleSheet.absoluteFill}
          nativeControls={false}
          contentFit="cover"
        />

        {/* Dark Overlay */}
        <View className="absolute inset-0 bg-black/30" />

        {/* AI Vision Badge - Adjusted */}
        <Animated.View 
          style={{ transform: [{ scale: pulseAnim }] }}
          className={`absolute ${compact ? 'top-2 left-2' : 'top-4 left-4'} z-10`}
        >
          <View className={`flex-row items-center bg-black/70 ${compact ? 'px-2 py-1' : 'px-3 py-1.5'} rounded-full border border-primary`}>
            <View className={`${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full bg-success mr-2`} />
            <Text 
              style={{ fontFamily: fontFamily.bold, letterSpacing: 1 }}
              className={`text-primary ${badgeSize}`}
            >
              AI VISION
            </Text>
          </View>
        </Animated.View>

        {/* Grid Overlay */}
        <Animated.View 
          style={[
            StyleSheet.absoluteFill,
            { opacity: gridOpacityAnim }
          ]}
          pointerEvents="none"
        >
          {/* Horizontal lines */}
          <View className="absolute left-0 right-0 h-[1px] bg-primary opacity-30" style={{ top: '33%' }} />
          <View className="absolute left-0 right-0 h-[1px] bg-primary opacity-30" style={{ top: '50%' }} />
          <View className="absolute left-0 right-0 h-[1px] bg-primary opacity-30" style={{ top: '67%' }} />
          
          {/* Vertical lines */}
          <View className="absolute top-0 bottom-0 w-[1px] bg-primary opacity-30" style={{ left: '33%' }} />
          <View className="absolute top-0 bottom-0 w-[1px] bg-primary opacity-30" style={{ left: '50%' }} />
          <View className="absolute top-0 bottom-0 w-[1px] bg-primary opacity-30" style={{ left: '67%' }} />
        </Animated.View>

        {/* Scanning Line */}
        <Animated.View 
          style={[
            { 
              transform: [{ translateY: scanLineTranslateY }],
              opacity: gridOpacityAnim,
            }
          ]}
          className="absolute left-0 right-0 h-0.5 top-0 z-10"
          pointerEvents="none"
        >
          <View 
            className="w-full h-full bg-primary"
            style={{
              shadowColor: '#F6F000',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 1,
              shadowRadius: 10,
              elevation: 5,
            }}
          />
        </Animated.View>

        {/* Corner Brackets */}
        <Animated.View 
          style={[
            StyleSheet.absoluteFill,
            { opacity: cornerOpacity, margin: 40 }
          ]}
          pointerEvents="none"
        >
          {/* Top Left Corner */}
          <View className="absolute top-0 left-0 w-10 h-10">
            <View className="absolute top-0 left-0 w-10 h-[3px] bg-primary" />
            <View className="absolute top-0 left-0 w-[3px] h-10 bg-primary" />
          </View>

          {/* Top Right Corner */}
          <View className="absolute top-0 right-0 w-10 h-10">
            <View className="absolute top-0 right-0 w-10 h-[3px] bg-primary" />
            <View className="absolute top-0 right-0 w-[3px] h-10 bg-primary" />
          </View>

          {/* Bottom Left Corner */}
          <View className="absolute bottom-0 left-0 w-10 h-10">
            <View className="absolute bottom-0 left-0 w-10 h-[3px] bg-primary" />
            <View className="absolute bottom-0 left-0 w-[3px] h-10 bg-primary" />
          </View>

          {/* Bottom Right Corner */}
          <View className="absolute bottom-0 right-0 w-10 h-10">
            <View className="absolute bottom-0 right-0 w-10 h-[3px] bg-primary" />
            <View className="absolute bottom-0 right-0 w-[3px] h-10 bg-primary" />
          </View>
        </Animated.View>

       

        {/* Center Crosshair */}
        <View 
          className="absolute w-[60px] h-[60px] z-10" 
          style={{ bottom: 60, left: 40 }}
          pointerEvents="none"
        >
          {/* Horizontal line */}
          <View className="absolute left-0 right-0 h-[1px] bg-primary" style={{ top: '50%' }} />
          {/* Vertical line */}
          <View className="absolute top-0 bottom-0 w-[1px] bg-primary" style={{ left: '50%' }} />
          {/* Center dot */}
          <View 
            className="absolute w-2 h-2 rounded-full border-2 border-primary"
            style={{ 
              top: '50%', 
              left: '50%', 
              transform: [{ translateX: -4 }, { translateY: -4 }] 
            }} 
          />
        </View>
      </View>
    </View>
  )
}

export default AIVisionCard