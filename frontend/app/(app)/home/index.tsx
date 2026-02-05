import React, { useState, useEffect } from 'react';
import { ScrollView, StatusBar, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { userStorage } from '@/src/store/userStorage';
import { UserType } from '@/src/types/userType';
import HomeHeader from '@/components/Home/HomeHeader';

export default function HomeScreen() {
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await userStorage.getUser();
    setUser(userData);
  };

  const getFirstName = () => {
    if (!user?.full_name) return 'User';
    return user.full_name.split(' ')[0];
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <StatusBar barStyle="dark-content" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <HomeHeader firstName={getFirstName()} />

        {/* Greeting */}
        <View className="px-6 mb-6">
          <Text className="text-2xl font-bold text-text-light dark:text-text-dark">
            Hello, {getFirstName()}!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}