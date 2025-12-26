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
import { FirebaseError } from 'firebase/app';
import { handleFirebaseAuthError } from '@/src/utils/firebaseAuthError';
import { registerEmailAndPassword } from '@/src/controllers/authController';

const CreateAccountScreen = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const {  createAccountEmailPassword } = useAuth();

    const { colorScheme } = useColorScheme();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [errors, setErrors] = useState<{
        fullName?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

    const validateForm = () => {
        const newErrors: typeof errors = {};

        if (!fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Enter a valid email.';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Minimum 6 characters required';
        }

        if (confirmPassword !== password) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreateAccount = async () => {
        if (!validateForm()) return;
        console.log("🚀 Creating account started")
        setLoading(true);
        try {
            const response = await registerEmailAndPassword(email, password, fullName, createAccountEmailPassword);
            console.log("✅ Account creation complete, navigating...");
            router.dismissAll();
            if (response.user.onboarding_completed) {
                router.replace('/(app)/home')
            } else {
                router.replace('/(onboarding)/OnboardingScreen1')
            }
        } catch (error) {
            console.error("❌ Error in handleCreateAccount:", error);
            if (error instanceof FirebaseError) {
                const authError = handleFirebaseAuthError(error);
                Alert.alert(authError.title, authError.message);
            } else {
                // Handle non-Firebase errors (like API errors)
                Alert.alert("Error", error instanceof Error ? error.message : "An unexpected error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    const navigateToLoginScreen = () => {
        router.replace('/(root)/LoginScreen')
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
                        <View className="flex-1">
                            <Text
                                style={{ fontFamily: fontFamily.semiBold }}
                                className="text-3xl text-textPrimary-light dark:text-textPrimary-dark mt-10"
                            >
                                Create your Gymmie account
                            </Text>

                            <Text
                                style={{ fontFamily: fontFamily.medium }}
                                className="text-textSecondary-light dark:text-textSecondary-dark mt-3"
                            >
                                Start training smarter today
                            </Text>

                            <View className="mt-5">
                                {/* Full Name */}
                                <TextInput
                                    underlineColorAndroid="transparent"
                                    value={fullName}
                                    onChangeText={setFullName}
                                    placeholder="Full Name"
                                    placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                                    style={{ fontFamily: fontFamily.medium }}
                                    className="mt-5 p-4 rounded-full border border-gray-300 dark:border-gray-600 bg-surface-light dark:bg-surface-dark text-textPrimary-light dark:text-textPrimary-dark"
                                />
                                {errors.fullName && (
                                    <Text
                                        style={{ fontFamily: fontFamily.medium }}
                                        className="mt-1 ml-4 text-sm text-error"
                                    >
                                        {errors.fullName}
                                    </Text>
                                )}

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
                                    className="mt-5 p-4 rounded-full border border-gray-300 dark:border-gray-600 bg-surface-light dark:bg-surface-dark text-textPrimary-light dark:text-textPrimary-dark"
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

                                {/* Confirm Password */}
                                <View className="mt-5">
                                    <TextInput
                                        underlineColorAndroid="transparent"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        placeholder="Confirm Password"
                                        secureTextEntry={!showConfirmPassword}
                                        placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                                        style={{ fontFamily: fontFamily.medium }}
                                        className="p-4 pr-14 rounded-full border border-gray-300 dark:border-gray-600 bg-surface-light dark:bg-surface-dark text-textPrimary-light dark:text-textPrimary-dark"
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowConfirmPassword(prev => !prev)}
                                        className="absolute right-5 top-4"
                                        activeOpacity={0.7}
                                    >
                                        {showConfirmPassword ? (
                                            <Eye size={20} color="gray" />
                                        ) : (
                                            <EyeOff size={20} color="gray" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                                {errors.confirmPassword && (
                                    <Text
                                        style={{ fontFamily: fontFamily.medium }}
                                        className="mt-1 ml-4 text-sm text-error"
                                    >
                                        {errors.confirmPassword}
                                    </Text>
                                )}
                            </View>

                            {/* Terms and Conditions */}
                            <View className="mt-6">
                                <Text
                                    style={{ fontFamily: fontFamily.regular }}
                                    className="text-xs text-textSecondary-light dark:text-textSecondary-dark text-center leading-5"
                                >
                                    By creating an account, you agree to our{' '}
                                    <Text
                                        style={{ fontFamily: fontFamily.semiBold }}
                                        className="text-primary underline"
                                    >
                                        Terms of Service
                                    </Text>
                                    {' '}and{' '}
                                    <Text
                                        style={{ fontFamily: fontFamily.semiBold }}
                                        className="text-primary underline"
                                    >
                                        Privacy Policy
                                    </Text>
                                </Text>
                            </View>

                            {/* Submit */}
                            <TouchableOpacity
                                onPress={handleCreateAccount}
                                className="mt-6 h-14 rounded-full bg-primary items-center justify-center"
                                activeOpacity={0.8}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="black" size="small" />
                                ) : (
                                    <Text
                                        style={{ fontFamily: fontFamily.semiBold }}
                                        className="text-black text-lg"
                                    >
                                        Create Account
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Footer */}
                        <View className="flex flex-row justify-center items-center mt-8">
                            <Text
                                style={{ fontFamily: fontFamily.medium }}
                                className="text-textSecondary-light dark:text-textSecondary-dark"
                            >
                                Already have an account?
                            </Text>
                            <TouchableOpacity onPress={navigateToLoginScreen} activeOpacity={0.7}>
                                <Text
                                    style={{ fontFamily: fontFamily.semiBold }}
                                    className="text-textPrimary-light dark:text-textPrimary-dark ml-1"
                                >
                                    Log In
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default CreateAccountScreen;

const styles = StyleSheet.create({});