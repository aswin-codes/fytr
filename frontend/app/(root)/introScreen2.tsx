import { StyleSheet, Text, View, Image, Pressable, ScrollView, Dimensions } from 'react-native'
import React, { useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Images } from '@/src/constants/assets'
import { fontFamily } from '@/src/theme/fontFamily'
import PaginationDot from '@/components/PaginationDot'
import { useRouter } from 'expo-router'

const { width } = Dimensions.get('window')

const slides = [
  {
    id: 1,
    image: Images.exercise,
    title: 'Perfect every ',
    highlightText: 'rep',
    titleEnd: ' with AI',
    description: 'Upload workout videos and get instant form correction feedback'
  },
  {
    id: 2,
    image: Images.tracking,
    title: 'Train smarter, ',
    highlightText: 'track everything',
    titleEnd: '',
    description: 'Log workouts, meals, and build powerful streaks with AI precision'
  },
  {
    id: 3,
    image: Images.gymfreak,
    title: 'See real ',
    highlightText: 'progress',
    titleEnd: '',
    description: 'Data-driven insights to help you reach your goals'
  }
]

const IntroScreen2 = () => {
  const scrollViewRef = useRef<ScrollView>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const router = useRouter();

  const handleContinue = () => {
    if (currentIndex < slides.length - 1) {
      // Scroll to next slide
      const nextIndex = currentIndex + 1
      scrollViewRef.current?.scrollTo({
        x: width * nextIndex,
        animated: true

      })
      setCurrentIndex(nextIndex)
    } else {

      router.push('/(root)/GetStartedScreen')
    }
  }

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x
    const index = Math.round(scrollPosition / width)
    setCurrentIndex(index)
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark p-6">
      <View className="flex-1 justify-center items-center">
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          className='-mx-6'
          onMomentumScrollEnd={handleScroll}
        >
          {slides.map((slide) => (
            <View
              key={slide.id}
              style={{ width }}
              className="items-center p-6"
            >
              <Image
                source={slide.image}
                style={{
                  width: '100%',
                  height: '75%',
                  borderRadius: 20,
                }}
                resizeMode="cover"
              />
              <Text style={{ fontFamily: fontFamily.semiBold }} className='text-textPrimary-light dark:text-textPrimary-dark text-center text-2xl mt-5'>
                {slide.title}
                <Text style={{ fontFamily: fontFamily.bold }} className='text-primary-glow'>
                  {slide.highlightText}
                </Text>
                {slide.titleEnd}
              </Text>
              <Text style={{ fontFamily: fontFamily.regular }} className='text-textSecondary-light dark:text-textSecondary-dark text-center text-md mt-4 mx-3'>
                {slide.description}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View>
        <PaginationDot activeDotIndex={currentIndex} />
        <Pressable
          className="bg-primary p-4 rounded-full w-full flex-row justify-center items-center"
          onPress={handleContinue}
        >
          <Text
            style={{ fontFamily: fontFamily.bold }}
            className="text-surface-dark text-center text-lg"
          >
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Continue'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

export default IntroScreen2