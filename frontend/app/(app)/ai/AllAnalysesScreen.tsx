import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { fontFamily } from '@/src/theme/fontFamily'
import { aiFormAnalyses } from '@/src/constants/MockData'
import AnalysisPreviewCard from '@/components/AI/AnalysisPreviewCard'
import { useAnalysisStore } from '@/src/store/analysisStore'

const AllAnalysesScreen = () => {
  const {getAllAnalyses} = useAnalysisStore()
  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark px-6 ">
      <View className="">
        {
          getAllAnalyses().length == 0 ? <View className='h-48 justify-center items-center'>
            <Text style={{ fontFamily: fontFamily.regular }} className="text-textSecondary-light dark:text-textSecondary-dark text-base">No analysis found !</Text>
          </View> : <View  >
            {
              getAllAnalyses().map((analysis) => (
                <AnalysisPreviewCard key={analysis.id} analysis={analysis} />
              ))
            }
          </View>
        }
      </View>
    </SafeAreaView>
  )
}

export default AllAnalysesScreen

const styles = StyleSheet.create({})