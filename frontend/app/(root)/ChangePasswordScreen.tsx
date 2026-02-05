import {
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
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/auth/useAuth';
import * as Haptics from 'expo-haptics';

const ChangePasswordScreen = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordChanged, setPasswordChanged] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const { changePassword } = useAuth();
    
    const { colorScheme } = useColorScheme();
    const router = useRouter();

    const [errors, setErrors] = useState<{
        currentPassword?: string;
        newPassword?: string;
        confirmPassword?: string;
    }>({});

    const validatePasswords = () => {
        const newErrors: typeof errors = {};

        if (!currentPassword.trim()) {
            newErrors.currentPassword = 'Current password is required';
        }

        if (!newPassword.trim()) {
            newErrors.newPassword = 'New password is required';
        } else if (newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters';
        }

        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (currentPassword === newPassword) {
            newErrors.newPassword = 'New password must be different';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChangePassword = async () => {
        if (!validatePasswords()) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsLoading(true);

        try {
            await changePassword(currentPassword, newPassword);
            console.log('Password changed successfully');
            setPasswordChanged(true);
            setErrors({});
            
            // Clear password fields
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Error changing password:', error);
            
            // Handle specific Firebase errors
            if (error.code === 'auth/wrong-password') {
                setErrors({ currentPassword: 'Current password is incorrect' });
            } else if (error.code === 'auth/weak-password') {
                setErrors({ newPassword: 'Password is too weak' });
            } else if (error.code === 'auth/requires-recent-login') {
                Alert.alert(
                    'Re-authentication Required',
                    'For security reasons, please log out and log back in before changing your password.',
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert('Error', 'Failed to change password. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
                            onPress={handleBack}
                            className="mt-4 w-10 h-10 rounded-full bg-surface-light dark:bg-surface-dark items-center justify-center"
                            activeOpacity={0.7}
                        >
                            <ArrowLeft 
                                size={24} 
                                color={colorScheme === 'dark' ? '#E5E7EB' : '#1F2937'} 
                            />
                        </TouchableOpacity>

                        <View className="flex-1 mt-5">
                            {!passwordChanged ? (
                                <>
                                    <Text
                                        style={{ fontFamily: fontFamily.semiBold }}
                                        className="text-3xl text-textPrimary-light dark:text-textPrimary-dark"
                                    >
                                        Change Password
                                    </Text>

                                    <Text
                                        style={{ fontFamily: fontFamily.medium }}
                                        className="text-textSecondary-light dark:text-textSecondary-dark mt-3 leading-6"
                                    >
                                        Your new password must be different from previously used passwords.
                                    </Text>

                                    <View className="mt-10 gap-5">
                                        {/* Current Password Input */}
                                        <View>
                                            <View className="relative">
                                                <TextInput
                                                    underlineColorAndroid="transparent"
                                                    value={currentPassword}
                                                    onChangeText={setCurrentPassword}
                                                    placeholder="Current Password"
                                                    secureTextEntry={!showCurrentPassword}
                                                    autoCapitalize="none"
                                                    placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                                                    style={{ fontFamily: fontFamily.medium }}
                                                    className="p-4 pr-12 rounded-full border border-gray-300 dark:border-gray-600 bg-surface-light dark:bg-surface-dark text-textPrimary-light dark:text-textPrimary-dark"
                                                />
                                                <TouchableOpacity
                                                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    className="absolute right-4 top-4"
                                                    activeOpacity={0.7}
                                                >
                                                    {showCurrentPassword ? (
                                                        <EyeOff size={20} color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                                                    ) : (
                                                        <Eye size={20} color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                                                    )}
                                                </TouchableOpacity>
                                            </View>
                                            {errors.currentPassword && (
                                                <Text 
                                                    style={{ fontFamily: fontFamily.medium }}
                                                    className="mt-1 ml-4 text-sm text-error"
                                                >
                                                    {errors.currentPassword}
                                                </Text>
                                            )}
                                        </View>

                                        {/* New Password Input */}
                                        <View>
                                            <View className="relative">
                                                <TextInput
                                                    underlineColorAndroid="transparent"
                                                    value={newPassword}
                                                    onChangeText={setNewPassword}
                                                    placeholder="New Password"
                                                    secureTextEntry={!showNewPassword}
                                                    autoCapitalize="none"
                                                    placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                                                    style={{ fontFamily: fontFamily.medium }}
                                                    className="p-4 pr-12 rounded-full border border-gray-300 dark:border-gray-600 bg-surface-light dark:bg-surface-dark text-textPrimary-light dark:text-textPrimary-dark"
                                                />
                                                <TouchableOpacity
                                                    onPress={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-4 top-4"
                                                    activeOpacity={0.7}
                                                >
                                                    {showNewPassword ? (
                                                        <EyeOff size={20} color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                                                    ) : (
                                                        <Eye size={20} color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                                                    )}
                                                </TouchableOpacity>
                                            </View>
                                            {errors.newPassword && (
                                                <Text 
                                                    style={{ fontFamily: fontFamily.medium }}
                                                    className="mt-1 ml-4 text-sm text-error"
                                                >
                                                    {errors.newPassword}
                                                </Text>
                                            )}
                                        </View>

                                        {/* Confirm Password Input */}
                                        <View>
                                            <View className="relative">
                                                <TextInput
                                                    underlineColorAndroid="transparent"
                                                    value={confirmPassword}
                                                    onChangeText={setConfirmPassword}
                                                    placeholder="Confirm New Password"
                                                    secureTextEntry={!showConfirmPassword}
                                                    autoCapitalize="none"
                                                    placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                                                    style={{ fontFamily: fontFamily.medium }}
                                                    className="p-4 pr-12 rounded-full border border-gray-300 dark:border-gray-600 bg-surface-light dark:bg-surface-dark text-textPrimary-light dark:text-textPrimary-dark"
                                                />
                                                <TouchableOpacity
                                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-4 top-4"
                                                    activeOpacity={0.7}
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff size={20} color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                                                    ) : (
                                                        <Eye size={20} color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} />
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
                                    </View>

                                    {/* Password Requirements */}
                                    <View className="mt-6 bg-surface-light dark:bg-surface-dark rounded-2xl p-4 border border-border-light dark:border-border-dark">
                                        <Text
                                            style={{ fontFamily: fontFamily.semiBold }}
                                            className="text-sm text-textPrimary-light dark:text-textPrimary-dark mb-2"
                                        >
                                            Password Requirements:
                                        </Text>
                                        <Text
                                            style={{ fontFamily: fontFamily.regular }}
                                            className="text-xs text-textSecondary-light dark:text-textSecondary-dark leading-5"
                                        >
                                            • At least 6 characters long{'\n'}
                                            • Different from current password{'\n'}
                                            • Must match confirmation password
                                        </Text>
                                    </View>

                                    {/* Change Password Button */}
                                    <TouchableOpacity
                                        onPress={handleChangePassword}
                                        disabled={isLoading}
                                        className={`mt-8 h-14 rounded-full bg-primary items-center justify-center ${isLoading ? 'opacity-70' : ''}`}
                                        activeOpacity={0.8}
                                    >
                                        <Text
                                            style={{ fontFamily: fontFamily.semiBold }}
                                            className="text-black text-lg"
                                        >
                                            {isLoading ? 'Changing...' : 'Change Password'}
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    {/* Success State */}
                                    <View className="items-center">
                                        <View className="w-20 h-20 rounded-full bg-green-500/20 items-center justify-center mb-6">
                                            <CheckCircle2 
                                                size={40} 
                                                color="#10B981" 
                                            />
                                        </View>

                                        <Text
                                            style={{ fontFamily: fontFamily.semiBold }}
                                            className="text-2xl text-textPrimary-light dark:text-textPrimary-dark text-center"
                                        >
                                            Password Changed!
                                        </Text>

                                        <Text
                                            style={{ fontFamily: fontFamily.medium }}
                                            className="text-textSecondary-light dark:text-textSecondary-dark mt-4 text-center leading-6"
                                        >
                                            Your password has been successfully updated. You can now use your new password to log in.
                                        </Text>

                                        {/* Back to Profile */}
                                        <TouchableOpacity
                                            onPress={handleBack}
                                            className="mt-8 h-14 w-full rounded-full bg-primary items-center justify-center"
                                            activeOpacity={0.8}
                                        >
                                            <Text
                                                style={{ fontFamily: fontFamily.semiBold }}
                                                className="text-black text-base"
                                            >
                                                Back to Profile
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

export default ChangePasswordScreen;