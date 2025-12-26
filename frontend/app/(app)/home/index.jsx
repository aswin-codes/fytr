import { TouchableOpacity,  Text, View,  } from 'react-native'
import React, { useEffect, } from 'react'
import { useAuth } from '@/src/auth/useAuth'
import { userStorage } from '@/src/store/userStorage';
import {syncExercises} from '@/src/controllers/exerciseSyncController'
import {Toast} from 'toastify-react-native'
import * as Haptics from 'expo-haptics';

const HomeScreen = () => {
  const {logout} = useAuth();
  const handleLogout = () => {
    
    userStorage.clearUser();
    logout();
  }
  
  useEffect(() => {
      // Sync in background without blocking UI
      silentSync();
    }, []);
  
    const silentSync = async () => {
      try {
        const result = await syncExercises();
        
        if (result.success && result.synced) {
          // Show subtle banner for 3 seconds
          Toast.success('Exercises Synced successfully');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          
        }
      } catch (error) {
        Toast.error('Exercises sync failed');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        console.warn('Background sync failed:', error);
        // Fail silently - user can still use cached data
      }
    };
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
