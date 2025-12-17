import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

type PaginationDotProps = {
    activeDotIndex : number
}

const PaginationDot = ({activeDotIndex} : PaginationDotProps) => {
  return (
    <View className='flex-row justify-center items-center gap-2 mb-8'>      
      <View style={{width : 10, height : 10, borderRadius : 10, }} className={activeDotIndex === 0 ? 'bg-primary' : 'bg-gray-200'}></View>
      <View style={{width : 10, height : 10, borderRadius : 10, }} className={activeDotIndex === 1 ? 'bg-primary' : 'bg-gray-200'}></View>
      <View style={{width : 10, height : 10, borderRadius : 10, }} className={activeDotIndex === 2 ? 'bg-primary' : 'bg-gray-200'}></View>
    </View>
  )
}

export default PaginationDot