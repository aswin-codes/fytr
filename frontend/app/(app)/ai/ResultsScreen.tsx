import { StyleSheet, Text, View, ScrollView, Pressable, Alert } from 'react-native'
import React, { useMemo, useState, useEffect } from 'react'
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

import { saveAnalysis, deleteAnalysis } from '@/src/controllers/analysisController';
import { uploadVideoToCloudinary } from '@/src/utils/cloudinaryUpload';
import UploadProgress from '@/components/AI/UploadProgress';


const ResultsScreen = () => {
    const { analysis } = useLocalSearchParams<{ analysis: string }>();
    const router = useRouter();
    
    const [uploadProgress, setUploadProgress] = useState(0);
       const [isUploading, setIsUploading] = useState(false);
       const [uploadMessage, setUploadMessage] = useState('Preparing...');
    
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

    const handleSave = async () => {
          try {
              if (!result) return;
  
              setIsUploading(true);
              setUploadMessage('Getting video duration...');
  
              // 1. Get video duration
              let videoDuration = result.durationSeconds;
             
  
              // 2. Upload video to Cloudinary
              setUploadMessage('Uploading video...');
              let cloudinaryUrl = result.videoUrl;
              
              if (result.videoUrl.startsWith('file://')) {
                  console.log('📤 Starting upload to Cloudinary...');
                  
                  const uploadResult = await uploadVideoToCloudinary(
                      result.videoUrl,
                      (progress) => {
                          setUploadProgress(progress.percentage);
                      }
                  );
                  
                  cloudinaryUrl = uploadResult.url;
                  
                  // Use Cloudinary's duration if available (more accurate)
                  if (uploadResult.duration > 0) {
                      videoDuration = uploadResult.duration;
                  }
                  
                  console.log('✅ Video uploaded to Cloudinary:', cloudinaryUrl);
                  console.log('⏱️  Duration from Cloudinary:', uploadResult.duration, 'seconds');
              }
  
              // 3. Save to backend with proper field names
              setUploadMessage('Saving analysis...');
              setUploadProgress(100);
              
              console.log('💾 Saving to backend...');
              const response = await saveAnalysis({
                  exercise: result.exercise,
                  duration_seconds: videoDuration, // Use actual duration
                  video_url: cloudinaryUrl, // Use Cloudinary URL
                  score: result.score,
                  verdict: result.verdict,
                  status: result.status,
                  positives: result.positives,
                  improvements: result.improvements,
                  ai_coach_tip: result.aiCoachTip,
                  recorded_at: result.recordedAt || new Date().toISOString(),
              });
  
              console.log('✅ Backend response:', response);
  
            
  
              setIsUploading(false);
              Alert.alert('Success', 'Analysis saved successfully!', [
                  {
                      text: 'OK',
                      onPress: () => router.back(),
                  },
              ]);
          } catch (error) {
              console.error('❌ Error saving analysis:', error);
              setIsUploading(false);
              Alert.alert('Error', 'Failed to save analysis. Please try again.');
          }
      };

    const handleDiscard = () => {
            Alert.alert(
                'Discard Analysis',
                'Are you sure you want to discard this analysis? This cannot be undone.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Discard',
                        style: 'destructive',
                        onPress: () => router.back(),
                    },
                ]
            );
        };

    const handleDelete = async () => {
            Alert.alert(
                'Delete Analysis',
                'Are you sure you want to delete this analysis?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                await deleteAnalysis(result.id);
                                Alert.alert('Success', 'Analysis deleted successfully', [
                                    {
                                        text: 'OK',
                                        onPress: () => router.back(),
                                    },
                                ]);
                            } catch (error) {
                                Alert.alert('Error', 'Failed to delete analysis');
                            }
                        },
                    },
                ]
            );
        };
    
    // Show upload progress
        if (isUploading) {
            return (
                <View className="flex-1 items-center justify-center bg-background-light p-6 dark:bg-background-dark">
                    <UploadProgress progress={uploadProgress} message={uploadMessage} />
                    <Text
                        style={{ fontFamily: fontFamily.regular }}
                        className="mt-4 text-center text-sm text-textSecondary-light dark:text-textSecondary-dark">
                        Please don't close the app
                    </Text>
                </View>
            );
        }

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