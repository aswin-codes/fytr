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
    Alert
} from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamily } from '@/src/theme/fontFamily';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/auth/useAuth';

const ForgotPasswordScreen = () => {
    const [email, setEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
  const { forgotPassword } = useAuth();
    
    const { colorScheme } = useColorScheme();
    const router = useRouter();

    const [errors, setErrors] = useState<{
        email?: string;
    }>({});

    const validateEmail = () => {
        const newErrors: typeof errors = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Enter a valid email';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSendResetLink = async () => {
        if (!validateEmail()) return;

        setIsLoading(true);

        // 🔐 Firebase password reset call here
        try {
            // Simulate API call
            await forgotPassword(email);

            console.log('Password reset email sent to:', email);
            setEmailSent(true);
            setErrors({});
        } catch (error) {
            Alert.alert('Error', 'Failed to send reset email. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        router.back();
    };

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
                        {/* Back Button */}
                        <TouchableOpacity
                            onPress={handleBackToLogin}
                            className="mt-4 w-10 h-10 rounded-full bg-surface-light dark:bg-surface-dark items-center justify-center"
                            activeOpacity={0.7}
                        >
                            <ArrowLeft 
                                size={24} 
                                color={colorScheme === 'dark' ? '#E5E7EB' : '#1F2937'} 
                            />
                        </TouchableOpacity>

                        <View className="flex-1 mt-5 ">
                            {!emailSent ? (
                                <>
                                    <Text
                                        style={{ fontFamily: fontFamily.semiBold }}
                                        className="text-3xl text-textPrimary-light dark:text-textPrimary-dark"
                                    >
                                        Forgot Password?
                                    </Text>

                                    <Text
                                        style={{ fontFamily: fontFamily.medium }}
                                        className="text-textSecondary-light dark:text-textSecondary-dark mt-3 leading-6"
                                    >
                                        No worries! Enter your registered email address and we'll send you a link to reset your password.
                                    </Text>

                                    <View className="mt-10">
                                        {/* Email Input */}
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
                                    </View>

                                    {/* Send Reset Link Button */}
                                    <TouchableOpacity
                                        onPress={handleSendResetLink}
                                        disabled={isLoading}
                                        className={`mt-8 h-14 rounded-full bg-primary items-center justify-center ${isLoading ? 'opacity-70' : ''}`}
                                        activeOpacity={0.8}
                                    >
                                        <Text
                                            style={{ fontFamily: fontFamily.semiBold }}
                                            className="text-black text-lg"
                                        >
                                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    {/* Success State */}
                                    <View className="items-center">
                                        <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center mb-6">
                                            <Mail 
                                                size={40} 
                                                color={colorScheme === 'dark' ? '#A3E635' : '#84CC16'} 
                                            />
                                        </View>

                                        <Text
                                            style={{ fontFamily: fontFamily.semiBold }}
                                            className="text-2xl text-textPrimary-light dark:text-textPrimary-dark text-center"
                                        >
                                            Check Your Email
                                        </Text>

                                        <Text
                                            style={{ fontFamily: fontFamily.medium }}
                                            className="text-textSecondary-light dark:text-textSecondary-dark mt-4 text-center leading-6"
                                        >
                                            We've sent a password reset link to
                                        </Text>

                                        <Text
                                            style={{ fontFamily: fontFamily.semiBold }}
                                            className="text-primary text-center mt-2"
                                        >
                                            {email}
                                        </Text>

                                        <Text
                                            style={{ fontFamily: fontFamily.medium }}
                                            className="text-textSecondary-light dark:text-textSecondary-dark mt-4 text-center leading-6"
                                        >
                                            Click the link in the email to reset your password. If you don't see it, check your spam folder.
                                        </Text>

                                        {/* Resend Email */}
                                        <TouchableOpacity
                                            onPress={() => {
                                                setEmailSent(false);
                                                handleSendResetLink();
                                            }}
                                            className="mt-8"
                                            activeOpacity={0.7}
                                        >
                                            <Text
                                                style={{ fontFamily: fontFamily.semiBold }}
                                                className="text-primary text-center"
                                            >
                                                Resend Email
                                            </Text>
                                        </TouchableOpacity>

                                        {/* Back to Login */}
                                        <TouchableOpacity
                                            onPress={handleBackToLogin}
                                            className="mt-8 h-14 w-full rounded-full border border-gray-300 dark:border-gray-600 items-center justify-center"
                                            activeOpacity={0.8}
                                        >
                                            <Text
                                                style={{ fontFamily: fontFamily.semiBold }}
                                                className="text-textPrimary-light dark:text-textPrimary-dark text-base"
                                            >
                                                Back
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({});