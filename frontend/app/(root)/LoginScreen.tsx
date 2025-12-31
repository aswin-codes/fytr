import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Keyboard,
    TouchableWithoutFeedback,
    ActivityIndicator,
    Alert
} from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamily } from '@/src/theme/fontFamily';
import { Eye, EyeOff } from 'lucide-react-native'
import { useColorScheme } from 'nativewind';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/auth/useAuth';
import { handleFirebaseAuthError } from '@/src/utils/firebaseAuthError';
import { FirebaseError } from 'firebase/app';
import { loginUserWithEmailAndPassword } from '@/src/controllers/authController';
import { useOnboardingStore } from '@/src/store/onboardingStore';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const {  loginEmailPassword } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetOnboarding } = useOnboardingStore();

    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
    }>({});

    const validateForm = () => {
        const newErrors: typeof errors = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Enter a valid email';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Minimum 6 characters required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        // 🔐 Firebase login call here
        console.log("Login account with email and password started")
        setLoading(true);
        try {
            const response = await loginUserWithEmailAndPassword(email, password, loginEmailPassword)
            console.log("✅ Account creation complete, navigating...");
            
            router.dismissAll();
            if (response.user.onboarding_completed) {
                router.replace('/(app)/home')
            } else {
                resetOnboarding();
                router.replace('/(onboarding)/OnboardingScreen1')
            }
        } catch (error) {
            if (error instanceof FirebaseError) {
                const authError = handleFirebaseAuthError(error);
                Alert.alert(authError.title, authError.message)
            } else {
                Alert.alert("Error", error instanceof Error ? error.message : "An unexpected error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    const navigateToCreateAccountScreen = () => {
        router.replace('/(root)/CreateAccountScreen')
    }

    const navigateToForgotPasswordScreen = () => {
        router.push('/(root)/ForgotPassword')
    }

    return (
        <SafeAreaView
            className="flex-1 bg-background-light dark:bg-background-dark"
            edges={['top']}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        contentContainerStyle={{
                            paddingHorizontal: 24,
                            paddingBottom: 40,
                            flexGrow: 1,
                        }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        bounces={false}
                    >
                        <View className="flex-1 mt-10">
                            <Text
                                style={{ fontFamily: fontFamily.semiBold }}
                                className="text-3xl text-textPrimary-light dark:text-textPrimary-dark"
                            >
                                Welcome back
                            </Text>

                            <Text
                                style={{ fontFamily: fontFamily.medium }}
                                className="text-textSecondary-light dark:text-textSecondary-dark mt-3"
                            >
                                Log in to continue your training
                            </Text>

                            <View className="mt-10">
                                {/* Email */}
                                <TextInput
                                    underlineColorAndroid="transparent"
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Email"
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                                    style={{ fontFamily: fontFamily.medium }}
                                    className="p-4 rounded-full border border-gray-300 dark:border-gray-600 bg-surface-light dark:bg-surface-dark text-textPrimary-light dark:text-textPrimary-dark"
                                />
                                {errors.email && (
                                    <Text
                                        style={{ fontFamily: fontFamily.medium }}
                                        className="mt-1 ml-4 text-sm text-error"
                                    >
                                        {errors.email}
                                    </Text>
                                )}

                                {/* Password */}
                                <View className="mt-5">
                                    <TextInput
                                        underlineColorAndroid="transparent"
                                        value={password}
                                        onChangeText={setPassword}
                                        placeholder="Password"
                                        secureTextEntry={!showPassword}
                                        placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                                        style={{ fontFamily: fontFamily.medium }}
                                        className="p-4 pr-14 rounded-full border border-gray-300 dark:border-gray-600 bg-surface-light dark:bg-surface-dark text-textPrimary-light dark:text-textPrimary-dark"
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(prev => !prev)}
                                        className="absolute right-5 top-4"
                                        activeOpacity={0.7}
                                    >
                                        {showPassword ? (
                                            <Eye size={20} color="gray" />
                                        ) : (
                                            <EyeOff size={20} color="gray" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                                {errors.password && (
                                    <Text
                                        style={{ fontFamily: fontFamily.medium }}
                                        className="mt-1 ml-4 text-sm text-error"
                                    >
                                        {errors.password}
                                    </Text>
                                )}

                                {/* Forgot Password */}
                                <TouchableOpacity
                                    className="mt-4 self-end"
                                    activeOpacity={0.7}
                                    onPress={navigateToForgotPasswordScreen}
                                >
                                    <Text
                                        style={{ fontFamily: fontFamily.semiBold }}
                                        className="text-primary-glow dark:text-primary text-sm"
                                    >
                                        Forgot Password?
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Login Button */}
                            <TouchableOpacity
                                onPress={handleLogin}
                                className="mt-8 h-14 rounded-full bg-primary items-center justify-center"
                                activeOpacity={0.8}
                                disabled={loading}
                            >
                                {
                                    loading ? <ActivityIndicator color="black" size="small" /> : <Text
                                        style={{ fontFamily: fontFamily.semiBold }}
                                        className="text-black text-lg"
                                    >
                                        Log In
                                    </Text>
                                }
                            </TouchableOpacity>

                        </View>

                        {/* Footer */}
                        <View className="flex flex-row justify-center items-center mt-8">
                            <Text
                                style={{ fontFamily: fontFamily.medium }}
                                className="text-textSecondary-light dark:text-textSecondary-dark"
                            >
                                Don't have an account?
                            </Text>
                            <TouchableOpacity activeOpacity={0.7} onPress={navigateToCreateAccountScreen}>
                                <Text
                                    style={{ fontFamily: fontFamily.semiBold }}
                                    className="text-textPrimary-light dark:text-textPrimary-dark ml-1"
                                >
                                    Sign Up
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({});