import { useRootNavigationState, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'react-native';
import { Images } from '@/src/constants/assets';
import { useAuth } from '@/src/auth/useAuth';
import { userStorage } from '@/src/store/userStorage';
import { UserType } from '@/src/types/userType';

export default function Home() {
  const router = useRouter();
  const rootState = useRootNavigationState();
  const { user, loading } = useAuth();

  // Wait for navigation to be ready
  if (!rootState?.key) return null;

  useEffect(() => {
    if (loading) return;
    
    router.replace('/(plan)/PlanTypeScreen');
    const handleRouting = async () => {
      // Logged in → check onboarding
      const storedUser: UserType | null = await userStorage.getUser();
      console.log("🔵 user : ", user?.toJSON());
      console.log("🔵 storedUser : ", storedUser);
      if (!storedUser){
        router.replace('/(root)/introScreen1');
        return;
      }

      if (storedUser?.onboarding_completed) {
        router.replace('/(app)/home');
      } else {
        router.replace('/(onboarding)/OnboardingScreen1');
      }
    };

    //handleRouting();
  }, [loading, user]);

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark justify-center items-center">
      <Image
        source={Images.logo}
        style={{ width: 150, height: 150, borderRadius: 20 }}
      />
    </SafeAreaView>
  );
}
