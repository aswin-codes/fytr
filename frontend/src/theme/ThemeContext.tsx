import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextProps {
  mode: "light" | "dark" | undefined;
  themePreference: ThemeMode;
  setThemePreference: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  mode: "dark",
  themePreference: "system",
  setThemePreference: () => {},
  toggleTheme: () => {},
});

const THEME_STORAGE_KEY = "@app_theme_preference";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [themePreference, setThemePreferenceState] = useState<ThemeMode>("system");

  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      
      if (saved) {
        const preference = saved as ThemeMode;
        setThemePreferenceState(preference);
        
        if (preference === "system") {
          // Let NativeWind handle system theme automatically
          setColorScheme(undefined as any); // This tells NativeWind to use system theme
        } else {
          // Apply fixed theme
          setColorScheme(preference);
        }
      } else {
        // Default to system theme - let NativeWind handle it
        setThemePreferenceState("system");
        setColorScheme(undefined as any);
      }
    } catch (error) {
      console.error("Error loading theme preference:", error);
    }
  };

  const setThemePreference = async (theme: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
      setThemePreferenceState(theme);

      if (theme === "system") {
        // Let NativeWind automatically follow system theme
        setColorScheme(undefined as any);
      } else {
        // Set fixed theme
        setColorScheme(theme);
      }
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  const toggleTheme = () => {
    const newTheme = colorScheme === "dark" ? "light" : "dark";
    setThemePreference(newTheme);
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        mode: colorScheme, 
        themePreference,
        setThemePreference,
        toggleTheme 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);