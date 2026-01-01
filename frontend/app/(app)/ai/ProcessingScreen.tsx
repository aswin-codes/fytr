// app/(app)/ai/ProcessingScreen.tsx
import { StyleSheet, Text, View, Animated, ScrollView } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { fontFamily } from '@/src/theme/fontFamily'
import { aiFormAnalyses } from '@/src/constants/MockData'
import AIVisionCard from '@/components/AI/AIVisonCard'
import { Sparkles, Check, Loader } from 'lucide-react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'

interface ProcessingStep {
    id: string
    label: string
    subLabel?: string
    status: 'pending' | 'loading' | 'complete'
}

const ProcessingScreen = () => {
    const { videoUri } = useLocalSearchParams<{ videoUri?: string }>()
    const router = useRouter()

    const result = aiFormAnalyses[0]
    const videoURL = videoUri! 

    const [progress, setProgress] = useState(0)
    const [steps, setSteps] = useState<ProcessingStep[]>([
        { id: '1', label: 'Upload complete', status: 'complete' },
        { id: '2', label: 'Detecting posture', subLabel: 'Scanning skeletal points...', status: 'pending' },
        { id: '3', label: 'Evaluating movement', status: 'pending' },
        { id: '4', label: 'Generating feedback', status: 'pending' },
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

    const simulateProcessing = async () => {
        await delay(1000)

        updateStep('2', 'loading')
        await animateProgress(0, 30, 3000)
        updateStep('2', 'complete')
        await delay(500)

        updateStep('3', 'loading', 'Analyzing motion patterns...')
        await animateProgress(30, 70, 3500)
        updateStep('3', 'complete')
        await delay(500)

        updateStep('4', 'loading', 'Creating personalized insights...')
        await animateProgress(70, 100, 3000)
        updateStep('4', 'complete')
        await delay(1000)

        router.replace({
          pathname: '/(app)/ai/ResultsScreen',
          params: { 
            analysis: JSON.stringify({
              ...result,
              videoUrl: videoURL
            })
          }
        });
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