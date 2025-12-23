import { TouchableOpacity, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useAuth } from '@/auth/useAuth'
import { userStorage } from '@/store/userStorage';

const HomeScreen = () => {
  const {logout} = useAuth();
  const handleLogout = () => {
    
    userStorage.clearUser();
    logout();
  }
  return (
    <View className='flex-1 justify-center items-center'>
      <Text>HomeScreen</Text>
      <TouchableOpacity onPress={handleLogout}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}

export default HomeScreen

const styles = StyleSheet.create({})