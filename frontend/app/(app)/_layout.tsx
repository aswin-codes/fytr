import { Tabs } from 'expo-router';
import { View, Image } from 'react-native';
import { useColorScheme } from 'nativewind';
import {
  Home,
  ClipboardList,
  User,
  QrCode,
  Dumbbell,
} from 'lucide-react-native';
import ProtectedRoute from '@/src/auth/protectedRoutes';
import { useEffect } from 'react';
import { fetchQuotaStatus } from '@/src/controllers/quotaController';
import { fetchAllAnalyses } from '@/src/controllers/analysisController';
import { Images } from '@/src/constants/assets';

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();

  const activeColor = colorScheme === 'dark' ? '#F6F000' : '#E6E000';
  const inactiveColor = '#9CA3AF';
  
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      await Promise.all([fetchQuotaStatus(), fetchAllAnalyses(1,20)]);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  return (
    <ProtectedRoute>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          
          backgroundColor: colorScheme === 'dark' ? '#1d1c1c' : '#FFFFFF',
          borderTopWidth: 0,
          elevation: 0,
        },
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <Home color={focused ? activeColor : inactiveColor} />
          ),
        }}
      />

      {/* LOG */}
      <Tabs.Screen
        name="log"
        options={{
          tabBarIcon: ({ focused }) => (
            <ClipboardList color={focused ? activeColor : inactiveColor} />
          ),
        }}
      />

      {/* AI FORM (CENTER) */}
      <Tabs.Screen
        name="ai"
        options={{
          tabBarIcon: () => (
            <View className="h-16 w-16 -mt-8 items-center justify-center rounded-full bg-primary shadow-lg">
              <Image source={Images.lens}  className='h-8 w-8'/>
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
