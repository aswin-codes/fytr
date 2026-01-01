import { StyleSheet, View, Pressable, Text, Alert } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CameraView, CameraType, useCameraPermissions, useMicrophonePermissions } from 'expo-camera'
import { useRouter } from 'expo-router'
import { fontFamily } from '@/src/theme/fontFamily'
import CameraHeader from '@/components/AI/CameraHeader'
import BodyFrameOverlay from '@/components/AI/BodyFrameOverlay'
import CameraControls from '@/components/AI/CameraControls'
import InstructionBanner from '@/components/AI/InstructionBanner'

const MAX_RECORDING_DURATION = 30 // 30 seconds

const CameraScreen = () => {
  const [facing, setFacing] = useState<CameraType>('back')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [videoUri, setVideoUri] = useState<string | null>(null)
  const [cameraPermission, requestCameraPermission] = useCameraPermissions()
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions()
  
  const cameraRef = useRef<CameraView>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isStoppingRef = useRef(false)
  const recordingPromiseRef = useRef<Promise<any> | null>(null)
  const router = useRouter()

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const handleClose = () => {
    if (isRecording) {
      stopRecording()
    }
    router.back()
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'))
  }

  const startRecording = async () => {
    if (!cameraRef.current || isRecording || isStoppingRef.current) {
      console.log('Cannot start recording:', { hasCameraRef: !!cameraRef.current, isRecording, isStopping: isStoppingRef.current })
      return
    }

    console.log('Starting recording...')

    // Check microphone permission before recording
    if (!microphonePermission?.granted) {
      const result = await requestMicrophonePermission()
      if (!result.granted) {
        Alert.alert(
          'Microphone Permission Required',
          'We need access to your microphone to record audio with the video.'
        )
        return
      }
    }

    try {
      setIsRecording(true)
      setRecordingDuration(0)
      isStoppingRef.current = false

      // Start timer to update UI
      let duration = 0
      timerRef.current = setInterval(() => {
        duration += 1
        setRecordingDuration(duration)
        console.log('Recording duration:', duration, 'seconds')
        
        // maxDuration will auto-stop, so we don't need to manually stop here
        // Just update the UI timer
      }, 1000)

      console.log('Calling recordAsync with maxDuration:', MAX_RECORDING_DURATION)

      // Start recording - it will automatically stop at maxDuration (30 seconds)
      const recordingPromise = cameraRef.current.recordAsync({
        maxDuration: MAX_RECORDING_DURATION,
      })
      
      recordingPromiseRef.current = recordingPromise
      
      const video = await recordingPromise
      
      recordingPromiseRef.current = null
      
      console.log('Recording finished. Video object:', video)

      // Clean up timer when recording finishes
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      setIsRecording(false)
      isStoppingRef.current = false

      if (video?.uri) {
        console.log('✅ Video recorded successfully!')
        console.log('Video URI:', video.uri)
        setVideoUri(video.uri)
        
        router.push({
          pathname: '/(app)/ai/ProcessingScreen',
          params: { 
            videoUri: video.uri
          }
        })

        
      } else {
        console.warn('⚠️ Video recorded but URI is missing:', video)
      }
    } catch (error: any) {
      console.error('❌ Error recording video:', error)
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        stack: error?.stack
      })
      
      // Clean up on error
      setIsRecording(false)
      isStoppingRef.current = false
      recordingPromiseRef.current = null
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      // Don't show alert for manual stops or early stops
      const errorMessage = error?.message || ''
      if (
        !errorMessage.includes('stopped before any data') &&
        !errorMessage.includes('stopped')
      ) {
        Alert.alert('Error', 'Failed to record video. Please try again.')
      } else {
        console.log('Recording was stopped (manual or auto-stop)')
      }
    }
  }

  const stopRecording = async () => {
    if (!cameraRef.current || !isRecording || isStoppingRef.current) {
      console.log('Cannot stop recording:', { hasCameraRef: !!cameraRef.current, isRecording, isStopping: isStoppingRef.current })
      return
    }

    // Check if we've recorded for at least 1 second to avoid "stopped before any data" error
    if (recordingDuration < 1) {
      console.log('Recording too short, waiting...')
      return
    }

    console.log('Stopping recording manually...')

    // Prevent multiple stop calls
    isStoppingRef.current = true

    try {
      // Stop the recording - this will cause the recordAsync promise to resolve or reject
      // The promise handler in startRecording will handle the result
      cameraRef.current.stopRecording()
      console.log('Stop recording called - waiting for promise to resolve')
      
      // Note: The cleanup and video handling will happen in startRecording's promise handler
      // The timer cleanup happens there too
    } catch (error) {
      console.error('Error calling stopRecording:', error)
      
      // Reset state if stopRecording itself fails
      setIsRecording(false)
      isStoppingRef.current = false
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  // Permission handling
  if (!cameraPermission || !microphonePermission) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white">Loading camera...</Text>
      </View>
    )
  }

  if (!cameraPermission.granted || !microphonePermission.granted) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-8">
        <Text 
          style={{ fontFamily: fontFamily.bold }} 
          className="text-white text-xl mb-4 text-center"
        >
          Permissions Required
        </Text>
        <Text 
          style={{ fontFamily: fontFamily.regular }} 
          className="text-gray-400 text-center mb-2"
        >
          {!cameraPermission.granted && '• Camera: To record your exercise form'}
        </Text>
        <Text 
          style={{ fontFamily: fontFamily.regular }} 
          className="text-gray-400 text-center mb-8"
        >
          {!microphonePermission.granted && '• Microphone: To record audio with video'}
        </Text>
        <Pressable 
          onPress={async () => {
            if (!cameraPermission.granted) await requestCameraPermission()
            if (!microphonePermission.granted) await requestMicrophonePermission()
          }}
          className="bg-primary rounded-full px-8 py-4"
        >
          <Text style={{ fontFamily: fontFamily.bold }} className="text-black">
            Grant Permissions
          </Text>
        </Pressable>
        <Pressable 
          onPress={handleClose}
          className="mt-4"
        >
          <Text style={{ fontFamily: fontFamily.regular }} className="text-gray-400">
            Go Back
          </Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView 
        mode="video"
        ref={cameraRef}
        style={styles.camera} 
        facing={facing}
      >
        <SafeAreaView style={styles.container}>
          <CameraHeader
            onClose={handleClose}
            isRecording={isRecording}
            currentTime={recordingDuration}
            maxTime={MAX_RECORDING_DURATION}
          />

          <InstructionBanner 
            instruction="Keep your full body in frame"
            isRecording={isRecording}
          />

          <BodyFrameOverlay />

          <CameraControls
            isRecording={isRecording}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onFlipCamera={toggleCameraFacing}
            disabled={isStoppingRef.current}
          />
        </SafeAreaView>
      </CameraView>
    </View>
  )
}

export default CameraScreen

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
})