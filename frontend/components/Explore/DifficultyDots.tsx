// Difficulty level dots component
import { View } from "react-native";

const DifficultyDots = ({ level }: { level: string | null }) => {
  const levels = ['beginner', 'intermediate', 'expert'];
  const currentLevel = level?.toLowerCase() || 'beginner';
  const activeDots = levels.indexOf(currentLevel) + 1;

  return (
    <View className="flex-row items-center gap-1">
      {[1, 2, 3].map((dot) => (
        <View
          key={dot}
          className={`h-1.5 w-1.5 rounded-full ${
            dot <= activeDots ? 'bg-primary' : 'bg-gray-300'
          }`}
        />
      ))}
    </View>
  );
};

export default DifficultyDots;