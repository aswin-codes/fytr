// components/AI/Camera/BodyFrameOverlay.tsx
import React from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import Svg, { Path, Rect } from 'react-native-svg'

const { width, height } = Dimensions.get('window')

const BodyFrameOverlay: React.FC = () => {
  const frameWidth = width * 0.7
  const frameHeight = height * 0.65
  const frameX = (width - frameWidth) / 2
  const frameY = (height - frameHeight) / 2
  const cornerSize = 40
  const strokeWidth = 3

  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width={width} height={height}>
        {/* Top-left corner */}
        <Path
          d={`M ${frameX + cornerSize} ${frameY} L ${frameX} ${frameY} L ${frameX} ${frameY + cornerSize}`}
          stroke="white"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />

        {/* Top-right corner */}
        <Path
          d={`M ${frameX + frameWidth - cornerSize} ${frameY} L ${frameX + frameWidth} ${frameY} L ${frameX + frameWidth} ${frameY + cornerSize}`}
          stroke="white"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />

        {/* Bottom-left corner */}
        <Path
          d={`M ${frameX} ${frameY + frameHeight - cornerSize} L ${frameX} ${frameY + frameHeight} L ${frameX + cornerSize} ${frameY + frameHeight}`}
          stroke="white"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />

        {/* Bottom-right corner */}
        <Path
          d={`M ${frameX + frameWidth} ${frameY + frameHeight - cornerSize} L ${frameX + frameWidth} ${frameY + frameHeight} L ${frameX + frameWidth - cornerSize} ${frameY + frameHeight}`}
          stroke="white"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  )
}

export default BodyFrameOverlay

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
})