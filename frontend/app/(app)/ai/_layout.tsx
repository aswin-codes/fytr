import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";

export default function AILayout() {
    const { colorScheme } = useColorScheme();

    return (<Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="AllAnalysesScreen" options={{ title: "Your Analyses", headerShown: true, headerTintColor: colorScheme === "dark" ? "#FFFFFF" : "#000000", headerStyle: { backgroundColor: colorScheme === "dark" ? "#1d1c1c" : "#FEFEFE" }, }} />
        <Stack.Screen name="ResultsScreen" options={{ title: "Results", headerShown: true, headerTintColor: colorScheme === "dark" ? "#FFFFFF" : "#000000", headerStyle: { backgroundColor: colorScheme === "dark" ? "#1d1c1c" : "#FEFEFE" }, }} />
    </Stack>)
}