import { Stack } from "expo-router";

export default function PlanLayout() {
    return <Stack screenOptions={{headerShown:false}}>
      <Stack.Screen name="PlanTypeScreen" />
      <Stack.Screen name="WeeklySplitScreen" />
      <Stack.Screen name="MuscleGroupScreen" />
      <Stack.Screen name="ExerciseSelectionScreen" />
    </Stack>
}