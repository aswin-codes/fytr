import "../global.css";
import { AuthProvider } from "@/src/auth/authProvider";
import { SplashScreen, Stack } from "expo-router";
import { ThemeProvider } from "@/src/theme/ThemeContext";
import { fontFamily } from "@/src/theme/fontFamily";
import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { View, Text, ActivityIndicator } from "react-native";
import ToastManager from 'toastify-react-native';
import { useAppInitialization } from "@/src/hooks/useAppInitialization";
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // This kills that specific "Reading from value" warning
});

export default function Layout() {
  // Load fonts
  const [loaded] = useFonts({
    [fontFamily.regular]: require("@/assets/fonts/Montserrat-Regular.ttf"),
    [fontFamily.medium]: require("@/assets/fonts/Montserrat-Medium.ttf"),
    [fontFamily.semiBold]: require("@/assets/fonts/Montserrat-SemiBold.ttf"),
    [fontFamily.bold]: require("@/assets/fonts/Montserrat-Bold.ttf"),
  });

  // Initialize database
  const { isReady: dbReady, error: dbError } = useAppInitialization();

  // Hide splash screen when both fonts and database are ready
  useEffect(() => {
    if (loaded && dbReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, dbReady]);

  // Wait for fonts to load
  if (!loaded) return null;

  // Show database initialization screen
  if (!dbReady) {
    return (
      <View className="flex-1 bg-[#F8F9FB] items-center justify-center">
        <ActivityIndicator size="large" color="#F6F000" />
        <Text 
          className="mt-4 text-gray-600 text-base"
          style={{ fontFamily: fontFamily.medium }}
        >
          Starting Fytr...
        </Text>
      </View>
    );
  }

  // Show database error screen
  if (dbError) {
    return (
      <View className="flex-1 bg-[#F8F9FB] items-center justify-center px-4">
        <Text className="text-4xl mb-4">⚠️</Text>
        <Text 
          className="text-xl text-gray-900 mb-2 text-center"
          style={{ fontFamily: fontFamily.bold }}
        >
          Initialization Error
        </Text>
        <Text 
          className="text-gray-500 text-center"
          style={{ fontFamily: fontFamily.regular }}
        >
          {dbError}
        </Text>
      </View>
    );
  }

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