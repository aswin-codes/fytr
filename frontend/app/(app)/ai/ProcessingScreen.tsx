// app/(app)/ai/ProcessingScreen.tsx
import { StyleSheet, Text, View, Animated, ScrollView, Alert } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { fontFamily } from '@/src/theme/fontFamily'
import AIVisionCard from '@/components/AI/AIVisonCard'
import { Sparkles, Check, Loader } from 'lucide-react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import * as FileSystem from 'expo-file-system'
import { Video } from 'react-native-compressor'
import { processVideoAnalysis, validateVideoFile } from '@/src/controllers/videoController'
import { AiAnalysis } from '@/src/types/aiAnalysisTypes'

interface ProcessingStep {
    id: string
    label: string
    subLabel?: string
    status: 'pending' | 'loading' | 'complete'
}

const ProcessingScreen = () => {
    const { videoUri, exercise } = useLocalSearchParams<{ videoUri?: string; exercise?: string }>()
    const router = useRouter()

    const videoURL = videoUri!

    const [progress, setProgress] = useState(0)
    const [compressedVideoUri, setCompressedVideoUri] = useState<string | null>(null)
    const [analysisResult, setAnalysisResult] = useState<AiAnalysis | null>(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [steps, setSteps] = useState<ProcessingStep[]>([
        { id: '1', label: 'Compressing video', subLabel: 'Optimizing file size...', status: 'pending' },
        { id: '2', label: 'Uploading video', subLabel: 'Sending to AI...', status: 'pending' },
        { id: '3', label: 'AI Processing', subLabel: 'Analyzing your form...', status: 'pending' },
        { id: '4', label: 'Generating feedback', subLabel: 'Creating insights...', status: 'pending' },
    ])

    const progressAnim = useRef(new Animated.Value(0)).current
    const sparkleRotate = useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.loop(
            Animated.timing(sparkleRotate, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
            })
        ).start()

        simulateProcessing()
    }, [])

    useEffect(() => {
        // Log initial video file info
        const checkFileInfo = async () => {
            try {
                const fileInfo = await FileSystem.getInfoAsync(videoURL)
                if (fileInfo.exists) {
                    console.log('Original video size:', (fileInfo.size / (1024 * 1024)).toFixed(2), 'MB')
                }
            } catch (error) {
                console.error('Error checking file info:', error)
            }
        }
        
        checkFileInfo()
    }, [videoURL])

    const compressVideo = async (): Promise<string> => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log('Starting video compression...')
                
                // Compress video with manual settings to target ~3MB max
                const compressedUri = await Video.compress(
                    videoURL,
                    {
                        compressionMethod: 'manual',
                        // Lower bitrate for smaller file size
                        bitrate: 250000, // 250 Kbps - adjust if needed
                        maxSize: 480, // Max dimension (width or height)
                        minimumFileSizeForCompress: 0, // Compress all files
                    },
                    (progressValue) => {
                        // Update compression progress (0-1 range)
                        const percentComplete = Math.round(progressValue * 100)
                        console.log('Compression progress:', percentComplete + '%')
                        
                        // Update substep for compression (0-25% of total progress)
                        const mappedProgress = Math.round(progressValue * 25)
                        setProgress(mappedProgress)
                    }
                )

                // Check compressed file size
                const compressedInfo = await FileSystem.getInfoAsync(compressedUri)
                if (compressedInfo.exists) {
                    const sizeInMB = compressedInfo.size / (1024 * 1024)
                    console.log('Compressed video size:', sizeInMB.toFixed(2), 'MB')
                    
                    // If still too large, warn but continue
                    if (sizeInMB > 3.5) {
                        console.warn('⚠️ Compressed video is still larger than 3.5MB. Consider adjusting compression settings.')
                    } else {
                        console.log('✅ Video compressed successfully within size limit')
                    }
                }

                console.log('Compression complete. Compressed URI:', compressedUri)
                resolve(compressedUri)
            } catch (error) {
                console.error('Error compressing video:', error)
                reject(error)
            }
        })
    }

    const simulateProcessing = async () => {
        await delay(500)

        // Step 1: Compress video
        let finalVideoUri = videoURL
        try {
            updateStep('1', 'loading')
            const compressed = await compressVideo()
            setCompressedVideoUri(compressed)
            finalVideoUri = compressed
            await animateProgress(0, 25, 500) // 0-25%
            updateStep('1', 'complete')
            await delay(500)

            // Validate compressed video size
            const validation = await validateVideoFile(compressed)
            if (!validation.valid) {
                Alert.alert('Error', validation.error || 'Video validation failed')
                router.back()
                return
            }
            console.log(`✅ Video validated: ${validation.sizeMB?.toFixed(2)} MB`)
        } catch (error) {
            console.error('Compression failed, using original video:', error)
            // Fallback to original video if compression fails
            setCompressedVideoUri(videoURL)
            finalVideoUri = videoURL
            updateStep('1', 'complete')
            await animateProgress(0, 25, 500)
            await delay(500)
        }

        // Step 2 & 3 & 4: Upload and AI Processing (combined in API call)
        try {
            updateStep('2', 'loading')
            
            console.log('🎬 Starting video analysis with API...')
            console.log('Video URI:', finalVideoUri)
            console.log('Exercise:', exercise || 'Auto-detect')

            // Call the real API
            const analysis = await processVideoAnalysis(
                finalVideoUri,
                exercise,
                (uploadProg) => {
                    // Map upload progress to 25-50% of total
                    const mappedProgress = 25 + (uploadProg * 25)
                    setProgress(Math.round(mappedProgress))
                    setUploadProgress(uploadProg)
                    
                    if (uploadProg >= 1) {
                        // Upload complete, move to AI processing
                        updateStep('2', 'complete')
                        updateStep('3', 'loading')
                    }
                }
            )

            // Upload complete (handled in callback)
            // AI Processing happens on server
            await animateProgress(50, 80, 1000) // Simulate AI processing time
            updateStep('3', 'complete')
            await delay(500)

            // Step 4: Feedback generated (from API response)
            updateStep('4', 'loading')
            await animateProgress(80, 100, 1000)
            updateStep('4', 'complete')
            
            setAnalysisResult(analysis)
            console.log('✅ Analysis complete:', analysis)
            
            await delay(1000)

            // Navigate to results with API response
            router.replace({
                pathname: '/(app)/ai/ResultsScreen',
                params: { 
                    analysis: JSON.stringify({
                        ...analysis,
                        videoUrl: finalVideoUri // Use local compressed video for playback
                    })
                }
            })
        } catch (error: any) {
            console.error('❌ API Processing failed:', error)
            
            // Show user-friendly error
            Alert.alert(
                'Processing Failed',
                error.message || 'Failed to analyze video. Please try again.',
                [
                    {
                        text: 'Try Again',
                        onPress: () => simulateProcessing()
                    },
                    {
                        text: 'Cancel',
                        onPress: () => router.back(),
                        style: 'cancel'
                    }
                ]
            )
        }
    }

    const updateStep = (id: string, status: 'pending' | 'loading' | 'complete', subLabel?: string) => {
        setSteps(prev => prev.map(step =>
            step.id === id
                ? { ...step, status, ...(subLabel && { subLabel }) }
                : step
        ))
    }

    const animateProgress = (from: number, to: number, duration: number) => {
        return new Promise<void>((resolve) => {
            const steps = 50
            const increment = (to - from) / steps
            const stepDuration = duration / steps

            let current = from
            const interval = setInterval(() => {
                current += increment
                if (current >= to) {
                    setProgress(to)
                    clearInterval(interval)
                    resolve()
                } else {
                    setProgress(Math.round(current))
                }
            }, stepDuration)

            Animated.timing(progressAnim, {
                toValue: to,
                duration,
                useNativeDriver: false,
            }).start()
        })
    }

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    const spinValue = sparkleRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    })

    return (
        <SafeAreaView className='flex-1 bg-background-light dark:bg-background-dark'>
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
            >
                {/* Header with Sparkle Icon */}
                <View className='flex-row items-center justify-center pt-3 pb-2'>
                    <View className='bg-black rounded-full p-3 mr-3'>
                        <Animated.View style={{ transform: [{ rotate: spinValue }] }}>
                            <Sparkles size={20} color="#F6F000" fill="#F6F000" />
                        </Animated.View>
                    </View>
                    <Text
                        style={{ fontFamily: fontFamily.bold }}
                        className='text-textPrimary-light dark:text-textPrimary-dark text-xl'
                    >
                        Processing...
                    </Text>
                </View>

                {/* AI Vision Card - Compact */}
                <View className='px-3'>
                    <View className="w-full h-96 rounded-3xl overflow-hidden bg-black relative">
                        <AIVisionCard videoUrl={videoURL} exercise="ANALYZING" compact />
                    </View>
                </View>

                {/* Analyzing Text */}
                <Text
                    style={{ fontFamily: fontFamily.bold }}
                    className='text-textPrimary-light dark:text-textPrimary-dark text-xl text-center mt-4 mb-3'
                >
                    Analyzing your form...
                </Text>

                {/* Progress Bar */}
                <View className='mb-2 px-6'>
                    <View className='flex-row justify-between items-center mb-1.5'>
                        <Text
                            style={{ fontFamily: fontFamily.bold }}
                            className='text-primary text-xs'
                        >
                            PROCESSING
                        </Text>
                        <Text
                            style={{ fontFamily: fontFamily.bold }}
                            className='text-textPrimary-light dark:text-textPrimary-dark text-sm'
                        >
                            {progress}%
                        </Text>
                    </View>
                    <View className='h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
                        <View
                            className='h-full bg-primary rounded-full'
                            style={{ width: `${progress}%` }}
                        />
                    </View>
                </View>

                <Text
                    style={{ fontFamily: fontFamily.regular }}
                    className='text-textSecondary-light dark:text-textSecondary-dark text-center text-xs mb-5 px-6'
                >
                    Please keep the app open
                </Text>

                {/* Processing Steps - Compact */}
                <View className='px-6 gap-3 pb-6'>
                    {steps.map((step, index) => (
                        <ProcessingStepItem
                            key={step.id}
                            step={step}
                            isLast={index === steps.length - 1}
                        />
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

// Processing Step Component - Compact
const ProcessingStepItem: React.FC<{ step: ProcessingStep; isLast: boolean }> = ({ step, isLast }) => {
    const rotateAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        if (step.status === 'loading') {
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                })
            ).start()
        }
    }, [step.status])

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    })

    const getIcon = () => {
        if (step.status === 'complete') {
            return (
                <View className='w-8 h-8 rounded-full bg-success/20 items-center justify-center'>
                    <Check size={16} color="#22C55E" strokeWidth={3} />
                </View>
            )
        }

        if (step.status === 'loading') {
            return (
                <Animated.View
                    style={{ transform: [{ rotate: spin }] }}
                    className='w-8 h-8 rounded-full bg-primary/20 items-center justify-center'
                >
                    <Loader size={16} color="#F6F000" strokeWidth={3} />
                </Animated.View>
            )
        }

        return (
            <View className='w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700' />
        )
    }

    const getTextColor = () => {
        if (step.status === 'complete') return 'text-textPrimary-light dark:text-textPrimary-dark'
        if (step.status === 'loading') return 'text-textPrimary-light dark:text-textPrimary-dark'
        return 'text-textMuted-light dark:text-textMuted-dark'
    }

    const getSubTextColor = () => {
        if (step.status === 'loading') return 'text-primary'
        return 'text-textMuted-light dark:text-textMuted-dark'
    }

    return (
        <View className='flex-row items-start'>
            {getIcon()}

            <View className='ml-3 flex-1'>
                <Text
                    style={{ fontFamily: fontFamily.bold }}
                    className={`text-sm ${getTextColor()}`}
                >
                    {step.label}
                </Text>
                {step.subLabel && (
                    <Text
                        style={{ fontFamily: fontFamily.regular }}
                        className={`text-xs mt-0.5 ${getSubTextColor()}`}
                    >
                        {step.subLabel}
                    </Text>
                )}
            </View>
        </View>
    )
}

export default ProcessingScreen

const styles = StyleSheet.create({})