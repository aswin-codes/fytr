import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { fontFamily } from '@/src/theme/fontFamily'
import { aiFormAnalyses } from '@/src/constants/MockData'
import AnalysisPreviewCard from '@/components/Explore/AnalysisPreviewCard'

const AllAnalysesScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark px-6 py-3">
      <Text style={{ fontFamily: fontFamily.bold }} className="text-textPrimary-light dark:text-textPrimary-dark text-2xl">Your Analyses</Text>
      <View className="mt-5">
        {
            aiFormAnalyses.length == 0 ? <View className='h-48 justify-center items-center'>
            <Text style={{ fontFamily: fontFamily.regular }} className="text-textSecondary-light dark:text-textSecondary-dark text-base">No analysis found !</Text>
          </View> : <View  >
            {
              aiFormAnalyses.map((analysis) => (
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