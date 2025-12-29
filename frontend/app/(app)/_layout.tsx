import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useColorScheme } from 'nativewind';
import {
  Home,
  ClipboardList,
  User,
  QrCode,
  Dumbbell,
} from 'lucide-react-native';
import ProtectedRoute from '@/src/auth/protectedRoutes';

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();

  const activeColor = colorScheme === 'dark' ? '#F6F000' : '#E6E000';
  const inactiveColor = '#9CA3AF';

  return (
    <ProtectedRoute>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 70,
          backgroundColor: colorScheme === 'dark' ? '#1d1c1c' : '#FFFFFF',
          borderTopWidth: 0,
          elevation: 0,
        },
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="home/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <Home color={focused ? activeColor : inactiveColor} />
          ),
        }}
      />

      {/* LOG */}
      <Tabs.Screen
        name="log/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <ClipboardList color={focused ? activeColor : inactiveColor} />
          ),
        }}
      />

      {/* AI FORM (CENTER) */}
      <Tabs.Screen
        name="ai/index"
        options={{
          tabBarIcon: () => (
            <View className="h-16 w-16 -mt-5 items-center justify-center rounded-full bg-primary shadow-lg">
              <QrCode color="#0F0F0F" />
            </View>
          ),
        }}
      />

      {/* EXPLORE */}
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ focused }) => (
            <Dumbbell color={focused ? activeColor : inactiveColor} />
          ),
        }}
      />

      {/* PROFILE */}
      <Tabs.Screen
        name="profile/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <User color={focused ? activeColor : inactiveColor} />
          ),
        }}
      />
    </Tabs>
    </ProtectedRoute>
  );
}
