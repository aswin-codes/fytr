import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native'
import React, { useMemo } from 'react'
import { useVideoPlayer, VideoView } from 'expo-video'
import { useEvent } from 'expo'
import CircularScore from '@/components/AI/ScoreCard'
import PositiveFeedbackList from '@/components/AI/PositiveFeedBackList'
import ImprovementFeedbackList from '@/components/AI/ImproveFeedback'
import AISmartTip from '@/components/AI/AISmartTipCard'
import { fontFamily } from '@/src/theme/fontFamily'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { AiAnalysis } from '@/src/types/aiAnalysisTypes'
import DetectedExerciseCard from '@/components/AI/DetectedExerciseCard'
import { fetchQuotaStatus } from '@/src/controllers/quotaController';
import { useEffect } from 'react'
const ResultsScreen = () => {
    const { analysis } = useLocalSearchParams<{ analysis: string }>();
    const router = useRouter();
    
    useEffect(()=>{
      loadQuotaData();
    },[])
    
    const loadQuotaData = async () => {
      try {
        await fetchQuotaStatus();
      } catch (error) {
        console.error('Failed to load quota:', error);
      }
    }
    
    // Parse the analysis object from JSON string
    const result: AiAnalysis | null = useMemo(() => {
        try {
            return analysis ? JSON.parse(analysis as string) : null;
        } catch (error) {
            console.error('Error parsing analysis:', error);
            return null;
        }
    }, [analysis]);
    
    // Fallback if analysis not found or parsing failed
    if (!result) {
        return (
            <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center px-6">
                <Text 
                    style={{ fontFamily: fontFamily.bold }} 
                    className="text-textPrimary-light dark:text-textPrimary-dark text-lg mb-2"
                >
                    Analysis not found
                </Text>
                <Text 
                    style={{ fontFamily: fontFamily.regular }} 
                    className="text-textSecondary-light dark:text-textSecondary-dark text-center"
                >
                    Unable to load analysis data
                </Text>
                <Pressable 
                    onPress={() => router.back()}
                    className="mt-8 h-12 rounded-full bg-primary-glow dark:bg-primary items-center justify-center px-8"
                >
                    <Text style={{ fontFamily: fontFamily.bold }} className="text-black">
                        Go Back
                    </Text>
                </Pressable>
            </View>
        );
    }

    const videoSource = result.videoUrl;
    const player = useVideoPlayer(videoSource, player => {
        player.loop = true;
    });
    const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

    const handleSave = () => {
        // Handle save logic
        console.log('Saving analysis:', result.id);
        // Add your save logic here
        router.back();
    };

    const handleDiscard = () => {
        // Handle discard logic
        console.log('Discarding analysis:', result.id);
        // Add your discard logic here
        router.back();
    };

    const handleDelete = () => {
        // Handle delete logic
        console.log('Deleting analysis:', result.id);
        // Add your delete logic here
        router.back();
    };

    return (
        <View className="flex-1 bg-background-light dark:bg-background-dark ">
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.contentContainer}>
                    <VideoView style={styles.video} player={player} allowsPictureInPicture />
                </View>
                <View className="mt-5 mx-5">
                    <DetectedExerciseCard exerciseName={result.exercise} />
                </View>
                <View className="mt-5 ">
                    <CircularScore score={result.score} maxScore={100} label={result.verdict} />
                </View>
                <View className="mx-5 mt-5">
                    <PositiveFeedbackList items={result.positives} />
                </View>
                <View className="mx-5 mt-5">
                    <ImprovementFeedbackList items={result.improvements} />
                </View>
                <View className="m-5">
                    <AISmartTip tip={result.aiCoachTip} />
                </View>
                <View className='p-5'>
                    {
                        result.actions.isCurrent && result.actions.canSave && (
                            <View>
                                <Pressable 
                                    onPress={handleSave}
                                    className="mt-5 h-14 rounded-full bg-primary-glow dark:bg-primary items-center justify-center"
                                >
                                    <Text style={{ fontFamily: fontFamily.bold }} className="text-black text-center font-medium">
                                        Save Result
                                    </Text>
                                </Pressable>
                                <Pressable 
                                    onPress={handleDiscard}
                                    className="mt-3 h-14 items-center justify-center"
                                >
                                    <Text style={{ fontFamily: fontFamily.bold }} className="text-textPrimary-light dark:text-textPrimary-dark text-center font-medium">
                                        Discard Analysis
                                    </Text>
                                </Pressable>
                            </View>
                        )
                    }
                    {
                        !result.actions.isCurrent && result.actions.canDelete && (
                            <Pressable 
                                onPress={handleDelete}
                                className="mt5 mb-2 h-14 rounded-full bg-red-500 items-center justify-center"
                            >
                                <Text style={{ fontFamily: fontFamily.bold }} className="text-white text-center font-medium">
                                    Delete Result
                                </Text>
                            </Pressable>
                        )
                    }
                </View>
            </ScrollView>
        </View>
    )
}

export default ResultsScreen

const styles = StyleSheet.create({
    contentContainer: {
        backgroundColor: "gray",
        borderRadius: 10,
        overflow: "hidden",
        margin: 15
    },
    video: {
        width: "100%",
        height: 200,
    },
});