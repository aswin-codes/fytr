import { StyleSheet, Text, View, Button } from 'react-native'
import React from 'react'
import UnderDevelopmentScreen from '@/components/UnderDevelopmentScreen'
import { useAuth } from '@/src/auth/useAuth'

const ProfileScreen = () => {
  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
  };

  return (
    <View className="flex-1 items-center justify-center">
      <Button title='Logout' onPress={handleLogout}/>
    </View>
  )
}

export default ProfileScreen
