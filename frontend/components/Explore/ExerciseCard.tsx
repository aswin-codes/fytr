
import { TouchableOpacity, View, Text, Image } from 'react-native';
import { fontFamily } from '@/src/theme/fontFamily';
import { Exercise } from '@/src/types/exerciseTypes';
import { useRouter } from 'expo-router';
import DifficultyDots from './DifficultyDots';

export const ExerciseCard = ({ item }: { item: Exercise }) => {
  const router = useRouter();

  return <TouchableOpacity
    onPress={() => router.push(`/explore/${item.id}`)}
    className="mb-3 flex-1 overflow-hidden rounded-2xl bg-card-light dark:bg-card-dark"
    style={{ aspectRatio: 0.8 }}
  >
    {/* Exercise Image - Fixed 60% height */}
    <View className="h-[60%] w-full bg-gray-200 dark:bg-gray-800">
      {item.image_urls && item.image_urls.length > 0 ? (
        <Image
          source={{ uri: item.image_urls[0] }}
          className="h-full w-full"
          resizeMode="cover"
        />
      ) : (
        <View className="h-full w-full items-center justify-center">
          <Text className="text-gray-400 text-xs">No image</Text>
        </View>
      )}
    </View>

    {/* Exercise Info - Fixed 40% height */}
    <View className="h-[40%] p-2.5 justify-between">
      {/* Exercise Name - Takes available space */}
      <Text
        style={{ fontFamily: fontFamily.semiBold }}
        className="text-xs leading-tight text-textPrimary-light dark:text-textPrimary-dark"
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {item.name}
      </Text>

      {/* Primary Muscle - Single tag with ellipsis */}
      {item.primary_muscles && item.primary_muscles.length > 0 && (
        <View className="flex-row items-center mt-2">
          <View className="rounded-full bg-primary/20 px-2 py-0.5 max-w-[70%]">
            <Text
              style={{ fontFamily: fontFamily.medium }}
              className="text-[10px] capitalize text-textPrimary-light dark:text-textPrimary-dark"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.primary_muscles[0]}
            </Text>
          </View>
        </View>
      )}

      {/* Equipment and Difficulty */}
      <View className="flex-row items-center justify-between mt-2">
        {/* Equipment - With ellipsis */}
        <Text
          style={{ fontFamily: fontFamily.regular }}
          className="flex-1 text-[10px] capitalize text-gray-500 dark:text-gray-400 mr-2"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.equipment || 'bodyweight'}
        </Text>

        {/* Difficulty Dots */}
        <DifficultyDots level={item.level} />
      </View>
    </View>
  </TouchableOpacity>
}