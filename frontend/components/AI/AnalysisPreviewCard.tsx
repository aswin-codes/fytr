import { StyleSheet, Text, View, Image, ActivityIndicator, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AiAnalysis } from '@/src/types/aiAnalysisTypes'
import { generateThumbnail } from '@/src/utils/extractThumbnail';
import { CircleAlert, CircleCheck, Play, Trash2, TriangleAlert } from 'lucide-react-native';
import { fontFamily } from '@/src/theme/fontFamily';
import { useRouter } from 'expo-router';
import { deleteAnalysis } from '@/src/controllers/analysisController';

const AnalysisPreviewCard = ({ analysis }: { analysis: AiAnalysis }) => {
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    
    const handleDeletePress = async (e: any) => {
        e.stopPropagation();
        
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
                            await deleteAnalysis(analysis.id);
                            Alert.alert('Success', 'Analysis deleted successfully');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete analysis');
                        }
                    }
                }
            ]
        );
    }

    const getThumbnail = async () => {
        try {
            setLoading(true);
            const thumbnail = await generateThumbnail(analysis.videoUrl);
            console.log('Thumbnail generated:', thumbnail);
            setImage(thumbnail || null);
        } catch (error) {
            console.error('Error generating thumbnail:', error);
        } finally {
            setLoading(false);
        }
    }

    const getScoreConfig = () => {
        if (analysis.score >= 75) {
            return { 
                color: '#16a34a', // green-600
                bg: '#dcfce7', // green-100
                icon: <CircleCheck color={'#16a34a'} size={12}/>
            }
        } else if (analysis.score >= 50) {
            return { 
                color: '#ea580c', // orange-600
                bg: '#ffedd5', // orange-100
                icon: <TriangleAlert color={'#ea580c'} size={12}/>
            }
        } else {
            return { 
                color: '#dc2626', // red-600
                bg: '#fee2e2', // red-100
                icon: <CircleAlert color={'#dc2626'} size={12}/>
            }
        }
    }

    const formatTime = (date: Date) => {
        const hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes} ${ampm}`;
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[date.getMonth()]} ${date.getDate()} • ${formatTime(date)}`;
    }

    const handlePlayPress = (e: any) => {
        e.stopPropagation();
        // Navigate to results screen with entire analysis object
        router.push({
            pathname: '/(app)/ai/ResultsScreen',
            params: { 
                analysis: JSON.stringify(analysis)
            }
        });
    }

    const handleCardPress = () => {
        // Navigate when user taps anywhere on the card
        router.push({
            pathname: '/(app)/ai/ResultsScreen',
            params: { 
                analysis: JSON.stringify(analysis)
            }
        });
    }

    

    useEffect(() => {
        getThumbnail();
    }, [analysis.videoUrl])

    const scoreConfig = getScoreConfig();

    return (
        <TouchableOpacity 
            onPress={handleCardPress}
            activeOpacity={0.7}
            className='w-full bg-white dark:bg-card-dark rounded-2xl p-4 mb-4 shadow-sm'
        >
            <View className='flex-row '>
                {/* Thumbnail with Play Overlay */}
                <View className='w-20 h-20 rounded-2xl overflow-hidden bg-gray-200 relative'>
                    {loading ? (
                        <View className='w-full h-full items-center justify-center bg-gray-100'>
                            <ActivityIndicator size="small" color="#9ca3af" />
                        </View>
                    ) : image ? (
                        <Image 
                            source={{ uri: image }} 
                            className='w-full h-full'
                            resizeMode="cover"
                        />
                    ) : (
                        <View className='w-full h-full items-center justify-center bg-gray-100'>
                            <Text className='text-xs text-gray-400'>No image</Text>
                        </View>
                    )}
                    {/* Play Button Overlay */}
                    <View className='absolute inset-0 items-center justify-center'>
                        <View className='bg-white/90 rounded-full w-10 h-10 items-center justify-center'>
                            <Play size={16} color="#000" fill="#000" />
                        </View>
                    </View>
                </View>

                {/* Middle Section - Exercise Info */}
                <View className='flex-1 ml-3'>
                    <Text 
                        style={{ fontFamily: fontFamily.bold }} 
                        className="text-gray-900 dark:text-white text-base mb-1"
                        numberOfLines={1}
                    >
                        {analysis.exercise}
                    </Text>
                    <Text 
                        style={{ fontFamily: fontFamily.regular }} 
                        className="text-gray-500 dark:text-gray-400 text-xs mb-3"
                    >
                        {formatDate(analysis.recordedAt)}
                    </Text>

                    {/* Action Buttons */}
                    <View className="flex-row gap-2 items-center">
                        <TouchableOpacity 
                            onPress={handlePlayPress}
                            className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5"
                        >
                            <Play size={10} color="#000" fill="#000" />
                            <Text 
                                style={{ fontFamily: fontFamily.medium }} 
                                className="text-gray-900 dark:text-white text-xs ml-1"
                            >
                                Play
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            onPress={handleDeletePress}
                            className="items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg w-7 h-7"
                        >
                            <Trash2 size={12} color="#6b7280" strokeWidth={2} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Score Badge */}
                <View 
                    style={[styles.scoreBadge, { backgroundColor: scoreConfig.bg }]}
                    className='ml-2 '
                >
                    <Text style={{ color: scoreConfig.color, fontSize: 10, marginRight: 2 }}>
                        {scoreConfig.icon}
                    </Text>
                    <Text 
                        style={{ fontFamily: fontFamily.bold, color: scoreConfig.color }} 
                        className="text-sm"
                    >
                        {analysis.score}%
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default AnalysisPreviewCard;

const styles = StyleSheet.create({
    scoreBadge: {
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 30
    }
});