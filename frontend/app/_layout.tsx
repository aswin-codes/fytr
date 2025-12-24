import "../global.css";
import { AuthProvider } from "@/src/auth/authProvider";
import { SplashScreen, Stack } from "expo-router";
import { ThemeProvider } from "@/src/theme/ThemeContext";
import { fontFamily } from "@/src/theme/fontFamily";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import ToastManager from 'toastify-react-native';

export default function Layout() {
  const [loaded] = useFonts({
    [fontFamily.regular] : require("@/assets/fonts/Montserrat-Regular.ttf"),
    [fontFamily.medium] : require("@/assets/fonts/Montserrat-Medium.ttf"),
    [fontFamily.semiBold] : require("@/assets/fonts/Montserrat-SemiBold.ttf"),
    [fontFamily.bold] : require("@/assets/fonts/Montserrat-Bold.ttf"),
  })

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;
  return (
    <AuthProvider>
      <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
      <ToastManager />
      </ThemeProvider>
    </AuthProvider>
  );
}
