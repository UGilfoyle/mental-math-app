import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    ScrollView,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Colors, Fonts, Spacing, BorderRadius } from '@/constants/Theme';
import { useAuthStore } from '@/stores/authStore';

export default function LoginScreen() {
    const router = useRouter();
    const {
        signInWithGoogle,
        signInWithApple,
        signInWithEmail,
        isLoading,
        error,
        clearError,
        user,
    } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isAppleAvailable, setIsAppleAvailable] = useState(false);

    useEffect(() => {
        // Check Apple Sign In availability
        if (Platform.OS === 'ios') {
            AppleAuthentication.isAvailableAsync().then(setIsAppleAvailable);
        }
    }, []);

    useEffect(() => {
        // If user is logged in, redirect to home
        if (user) {
            router.replace('/(tabs)');
        }
    }, [user]);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        clearError();
        const result = await signInWithEmail(email, password);
        if (result.success) {
            router.replace('/(tabs)');
        } else if (result.error) {
            Alert.alert('Sign In Failed', result.error);
        }
    };

    const handleGoogleLogin = async () => {
        clearError();
        const result = await signInWithGoogle();
        if (result.success) {
            router.replace('/auth/onboarding');
        } else if (result.error && result.error !== 'Sign in cancelled') {
            Alert.alert('Google Sign In Failed', result.error);
        }
    };

    const handleAppleLogin = async () => {
        clearError();
        const result = await signInWithApple();
        if (result.success) {
            router.replace('/auth/onboarding');
        } else if (result.error && result.error !== 'Sign in cancelled') {
            Alert.alert('Apple Sign In Failed', result.error);
        }
    };

    const handleGuestMode = () => {
        router.replace('/(tabs)');
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.background}
            />

            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Logo */}
                    <View style={styles.logoSection}>
                        <View style={styles.logoCircle}>
                            <Ionicons name="calculator" size={48} color="#fff" />
                        </View>
                        <Text style={styles.title}>Mental Math Pro</Text>
                        <Text style={styles.subtitle}>Train your brain!</Text>
                    </View>

                    {/* Login Form */}
                    <View style={styles.formCard}>
                        {/* Social Logins First */}
                        <View style={styles.socialSection}>
                            {/* Google Button */}
                            <TouchableOpacity
                                style={styles.socialButtonGoogle}
                                onPress={handleGoogleLogin}
                                disabled={isLoading}
                            >
                                <Ionicons name="logo-google" size={20} color="#EA4335" />
                                <Text style={styles.socialTextGoogle}>Continue with Google</Text>
                            </TouchableOpacity>

                            {/* Apple Button (iOS only) */}
                            {Platform.OS === 'ios' && isAppleAvailable && (
                                <TouchableOpacity
                                    style={styles.socialButtonApple}
                                    onPress={handleAppleLogin}
                                    disabled={isLoading}
                                >
                                    <Ionicons name="logo-apple" size={20} color="#fff" />
                                    <Text style={styles.socialTextApple}>Continue with Apple</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or sign in with email</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Email Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Email</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="mail-outline" size={20} color={Colors.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email"
                                    placeholderTextColor={Colors.textDim}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Password</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter password"
                                    placeholderTextColor={Colors.textDim}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color={Colors.textMuted}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#7C3AED" />
                            ) : (
                                <Text style={styles.primaryButtonText}>Sign In</Text>
                            )}
                        </TouchableOpacity>

                        {/* Register Link */}
                        <View style={styles.registerRow}>
                            <Text style={styles.registerText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/auth/register')}>
                                <Text style={styles.registerLink}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Guest Mode */}
                    <TouchableOpacity style={styles.guestButton} onPress={handleGuestMode}>
                        <Text style={styles.guestText}>Continue as Guest</Text>
                        <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.7)" />
                    </TouchableOpacity>

                    {/* Footer */}
                    <Text style={styles.footerText}>
                        By continuing, you agree to our Terms of Service and Privacy Policy
                    </Text>
                </ScrollView>

                {/* Loading Overlay */}
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.loadingText}>Signing in...</Text>
                    </View>
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    safeArea: {
        flex: 1,
    },
    content: {
        padding: Spacing.xl,
        paddingTop: Spacing['3xl'],
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: Spacing['3xl'],
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: Fonts['3xl'],
        fontWeight: Fonts.extrabold,
        color: '#fff',
    },
    subtitle: {
        fontSize: Fonts.base,
        color: 'rgba(255,255,255,0.8)',
        marginTop: Spacing.xs,
    },
    formCard: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: BorderRadius['2xl'],
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        padding: Spacing.xl,
        marginBottom: Spacing.xl,
    },
    socialSection: {
        gap: Spacing.md,
        marginBottom: Spacing.lg,
    },
    socialButtonGoogle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.md,
        backgroundColor: '#fff',
        borderRadius: BorderRadius.xl,
        paddingVertical: 14,
    },
    socialTextGoogle: {
        fontSize: Fonts.base,
        fontWeight: Fonts.semibold,
        color: '#333',
    },
    socialButtonApple: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.md,
        backgroundColor: '#000',
        borderRadius: BorderRadius.xl,
        paddingVertical: 14,
    },
    socialTextApple: {
        fontSize: Fonts.base,
        fontWeight: Fonts.semibold,
        color: '#fff',
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    inputLabel: {
        fontSize: Fonts.sm,
        fontWeight: Fonts.medium,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: Spacing.sm,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: Spacing.md,
        gap: Spacing.sm,
    },
    input: {
        flex: 1,
        paddingVertical: Spacing.md,
        fontSize: Fonts.base,
        color: '#fff',
    },
    primaryButton: {
        backgroundColor: '#fff',
        paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    primaryButtonText: {
        fontSize: Fonts.lg,
        fontWeight: Fonts.bold,
        color: '#7C3AED',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    dividerText: {
        fontSize: Fonts.sm,
        color: 'rgba(255,255,255,0.6)',
        paddingHorizontal: Spacing.md,
    },
    registerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Spacing.xl,
    },
    registerText: {
        fontSize: Fonts.sm,
        color: 'rgba(255,255,255,0.7)',
    },
    registerLink: {
        fontSize: Fonts.sm,
        fontWeight: Fonts.bold,
        color: '#fff',
    },
    guestButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.lg,
    },
    guestText: {
        fontSize: Fonts.base,
        color: 'rgba(255,255,255,0.7)',
    },
    footerText: {
        fontSize: Fonts.xs,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        marginTop: Spacing.md,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Spacing.md,
        fontSize: Fonts.base,
        color: '#fff',
    },
});
