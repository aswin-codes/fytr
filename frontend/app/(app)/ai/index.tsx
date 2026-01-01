import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import UnderDevelopmentScreen from '@/components/UnderDevelopmentScreen'
import { SafeAreaView } from 'react-native-safe-area-context'
import { fontFamily } from '@/src/theme/fontFamily'
import { Camera, Video } from 'lucide-react-native'
import { aiFormAnalyses } from '@/src/constants/MockData'
import AnalysisPreviewCard from '@/components/AI/AnalysisPreviewCard'
import { useRouter } from 'expo-router'


const FormScreen = () => {
  const router = useRouter();

  const navigateToCameraScreem = () => {
    router.push('/(app)/ai/CameraScreen');
  }

  const navigateToAllAnalysesScreen = () => {
    router.push('/(app)/ai/AllAnalysesScreen');
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark px-6 py-3">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{ fontFamily: fontFamily.bold }} className="text-primary-glow dark:text-primary text-sm">AI FORM ANALYSIS</Text>
        <Text style={{ fontFamily: fontFamily.bold }} className="text-textPrimary-light dark:text-textPrimary-dark text-3xl mt-2">Train Smarter.</Text>
        <Text style={{ fontFamily: fontFamily.bold }} className="text-textSecondary-light dark:text-textSecondary-dark text-3xl ">Fix your form.</Text>
        <View className="h-72  mt-5 flex items-center justify-center p-5">
          <TouchableOpacity onPress={navigateToCameraScreem}>
            <View className='bg-primary-glow dark:bg-primary rounded-full p-5'>
              <Video size={30} color="black" />
            </View>
          </TouchableOpacity>
          <Text style={{ fontFamily: fontFamily.bold }} className='mt-2 text-lg text-textPrimary-light dark:text-textPrimary-dark'>Analyze your form</Text>
          <View className='bg-card-light dark:bg-card-dark rounded-full px-2 py-1 mt-2'>
            <Text style={{ fontFamily: fontFamily.medium }} className='text-textSecondary-light dark:text-textSecondary-dark text-sm'>Tap to record</Text>
          </View>
        </View>
        <View className='flex-row w-full justify-between items-center my-5'>
          <Text style={{ fontFamily: fontFamily.bold }} className="text-textPrimary-light dark:text-textPrimary-dark text-xl">Previous Analyses</Text>
          <TouchableOpacity onPress={navigateToAllAnalysesScreen}>
            <Text style={{ fontFamily: fontFamily.regular }} className="text-textSecondary-light dark:text-textSecondary-dark text-xs">View all</Text>
          </TouchableOpacity>
        </View>
        {
          aiFormAnalyses.length == 0 ? <View className='h-48 justify-center items-center'>
            <Text style={{ fontFamily: fontFamily.regular }} className="text-textSecondary-light dark:text-textSecondary-dark text-base">No analysis found !</Text>
          </View> : <View  >
            {
              aiFormAnalyses.slice(0, 3).map((analysis) => (
                <AnalysisPreviewCard key={analysis.id} analysis={analysis} />
              ))
            }
          </View>
        }
      </ScrollView>
    </SafeAreaView>
  )
}

export default FormScreen
