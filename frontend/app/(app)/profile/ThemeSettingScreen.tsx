import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamily } from '@/src/theme/fontFamily';
import { ChevronLeft, Sun, Moon, Smartphone, Check } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/theme/ThemeContext';

const ThemeSettingsScreen = () => {
  const { mode, themePreference, setThemePreference } = useTheme();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleThemeChange = (selectedTheme: 'light' | 'dark' | 'system') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setThemePreference(selectedTheme);
  };

  const isDarkMode = mode === 'dark';

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row items-center px-6 mb-6">
        <TouchableOpacity 
          onPress={handleBack}
          className="w-10 h-10 items-center justify-center mr-4"
        >
          <ChevronLeft size={24} color={isDarkMode ? '#fff' : '#000'}/>
        </TouchableOpacity>
        
        <Text 
          className="text-xl text-textPrimary-light dark:text-textPrimary-dark flex-1"
          style={{ fontFamily: fontFamily.bold }}
        >
          Theme
        </Text>
      </View>

      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        <Text 
          className="text-sm text-textSecondary-light dark:text-textSecondary-dark mb-6 leading-relaxed"
          style={{ fontFamily: fontFamily.regular }}
        >
          Choose your preferred color theme for the app. This will change how the app looks and feels.
        </Text>

        {/* Theme Options */}
        <View className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-4 mb-6">
          {/* System Default */}
          <TouchableOpacity 
            onPress={() => handleThemeChange('system')}
            className="flex-row items-center justify-between py-4"
          >
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center mr-4">
                <Smartphone size={24} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text 
                  className="text-base text-textPrimary-light dark:text-textPrimary-dark mb-1"
                  style={{ fontFamily: fontFamily.semiBold }}
                >
                  System Default
                </Text>
                <Text 
                  className="text-xs text-textSecondary-light dark:text-textSecondary-dark"
                  style={{ fontFamily: fontFamily.regular }}
                >
                  Automatically match your device settings
                </Text>
              </View>
            </View>
            {themePreference === 'system' && (
              <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                <Check size={16} color="#000" strokeWidth={3} />
              </View>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="h-px bg-border-light dark:bg-border-dark my-2" />

          {/* Light Theme */}
          <TouchableOpacity 
            onPress={() => handleThemeChange('light')}
            className="flex-row items-center justify-between py-4"
          >
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 rounded-full bg-amber-100 items-center justify-center mr-4">
                <Sun size={24} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text 
                  className="text-base text-textPrimary-light dark:text-textPrimary-dark mb-1"
                  style={{ fontFamily: fontFamily.semiBold }}
                >
                  Light
                </Text>
                <Text 
                  className="text-xs text-textSecondary-light dark:text-textSecondary-dark"
                  style={{ fontFamily: fontFamily.regular }}
                >
                  Bright and clear for daytime use
                </Text>
              </View>
            </View>
            {themePreference === 'light' && (
              <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                <Check size={16} color="#000" strokeWidth={3} />
              </View>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="h-px bg-border-light dark:bg-border-dark my-2" />

          {/* Dark Theme */}
          <TouchableOpacity 
            onPress={() => handleThemeChange('dark')}
            className="flex-row items-center justify-between py-4"
          >
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 rounded-full bg-indigo-900 items-center justify-center mr-4">
                <Moon size={24} color="#818CF8" />
              </View>
              <View className="flex-1">
                <Text 
                  className="text-base text-textPrimary-light dark:text-textPrimary-dark mb-1"
                  style={{ fontFamily: fontFamily.semiBold }}
                >
                  Dark
                </Text>
                <Text 
                  className="text-xs text-textSecondary-light dark:text-textSecondary-dark"
                  style={{ fontFamily: fontFamily.regular }}
                >
                  Easy on the eyes in low light
                </Text>
              </View>
            </View>
            {themePreference === 'dark' && (
              <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                <Check size={16} color="#000" strokeWidth={3} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Current Theme Indicator */}
        {themePreference === 'system' && (
          <View className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 mb-6">
            <Text 
              className="text-xs text-blue-500 leading-relaxed"
              style={{ fontFamily: fontFamily.regular }}
            >
              📱 Currently using: <Text style={{ fontFamily: fontFamily.semiBold }}>{mode === 'dark' ? 'Dark' : 'Light'}</Text> mode (from system settings)
            </Text>
          </View>
        )}

        {/* Preview Section */}
        <View className="mb-8">
          <Text 
            className="text-xs text-textMuted-light dark:text-textMuted-dark uppercase tracking-wider mb-3 px-2"
            style={{ fontFamily: fontFamily.semiBold }}
          >
            PREVIEW
          </Text>

          <View className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-6">
            {/* Sample Card */}
            <View className="bg-background-light dark:bg-background-dark rounded-2xl p-4 mb-4">
              <Text 
                className="text-lg text-textPrimary-light dark:text-textPrimary-dark mb-2"
                style={{ fontFamily: fontFamily.bold }}
              >
                Sample Card
              </Text>
              <Text 
                className="text-sm text-textSecondary-light dark:text-textSecondary-dark mb-3"
                style={{ fontFamily: fontFamily.regular }}
              >
                This is how your content will look with the selected theme.
              </Text>
              <View className="bg-primary rounded-full h-10 items-center justify-center">
                <Text 
                  className="text-black text-sm"
                  style={{ fontFamily: fontFamily.bold }}
                >
                  ACTION BUTTON
                </Text>
              </View>
            </View>

            {/* Sample Stats */}
            <View className="flex-row gap-3">
              <View className="flex-1 bg-background-light dark:bg-background-dark rounded-2xl p-3">
                <Text 
                  className="text-xs text-textMuted-light dark:text-textMuted-dark mb-1"
                  style={{ fontFamily: fontFamily.medium }}
                >
                  STAT 1
                </Text>
                <Text 
                  className="text-2xl text-textPrimary-light dark:text-textPrimary-dark"
                  style={{ fontFamily: fontFamily.bold }}
                >
                  42
                </Text>
              </View>
              <View className="flex-1 bg-background-light dark:bg-background-dark rounded-2xl p-3">
                <Text 
                  className="text-xs text-textMuted-light dark:text-textMuted-dark mb-1"
                  style={{ fontFamily: fontFamily.medium }}
                >
                  STAT 2
                </Text>
                <Text 
                  className="text-2xl text-primary"
                  style={{ fontFamily: fontFamily.bold }}
                >
                  88%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Info Note */}
        <View className="bg-primary/15 dark:bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-8">
          <Text 
            className="text-xs text-primary-glow dark:text-primary leading-relaxed"
            style={{ fontFamily: fontFamily.regular }}
          >
            💡 Tip: The theme you select will be applied across the entire app immediately and saved for your next session.
          </Text>
        </View>

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ThemeSettingsScreen;