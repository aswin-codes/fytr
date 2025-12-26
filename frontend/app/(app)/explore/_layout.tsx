import { Stack } from "expo-router";

export const ExploreLayout = () => {
    return (
        <Stack>
          <Stack.Screen name="index" options={{ title: "Explore" }} />
          <Stack.Screen name='[id]' options={{ title: "Explore" }} />
        </Stack>
    );
};
