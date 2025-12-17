import { useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'react-native';
import { Images } from '@/constants/assets';
import { useRouter } from 'expo-router';
import { useAuth } from '@/auth/useAuth';

export default function Home() {
  const router = useRouter();
  const rootState = useRootNavigationState();
  const {user, loading} = useAuth();

  // Wait for navigation to be ready
  if (!rootState?.key) return null;

  useEffect(() => {
    if (loading) return;

    router.replace("/(root)/LoginScreen");

    // if (user) {
    //   router.replace("/(app)/homeScreen");
    // } else {
    //   router.replace("/(root)/introScreen1");
    // }
  }, [loading, user]);


  return (
    <SafeAreaView className='flex-1 bg-background-light dark:bg-background-dark justify-center items-center'>
      <Image source={Images.logo} style={{width : 150, height : 150, borderRadius: 20}}/>
    </SafeAreaView>
  );
}

const styles = {
  container: 'flex flex-1 bg-white',
};
