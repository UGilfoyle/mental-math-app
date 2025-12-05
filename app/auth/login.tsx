import React, { useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, BorderRadius } from '@/constants/Theme';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        setLoading(true);
        // TODO: Integrate with Supabase
        // const { error } = await auth.signIn(email, password);
        setTimeout(() => {
            setLoading(false);
            router.replace('/(tabs)');
        }, 1000);
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        // TODO: Integrate with Supabase Google OAuth
        setTimeout(() => {
            setLoading(false);
            router.replace('/auth/onboarding');
        }, 1000);
    };

    const handleAppleLogin = async () => {
        setLoading(true);
        // TODO: Integrate with Supabase Apple OAuth
        setTimeout(() => {
            setLoading(false);
            router.replace('/auth/onboarding');
        }, 1000);
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
                        <Text style={styles.logoEmoji}>🧮</Text>
                        <Text style={styles.title}>Mental Math</Text>
                        <Text style={styles.subtitle}>Train your brain!</Text>
                    </View>

                    {/* Login Form */}
                    <View style={styles.formCard}>
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
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#7C3AED" />
                            ) : (
                                <Text style={styles.primaryButtonText}>Sign In</Text>
                            )}
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or continue with</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Logins */}
                        <View style={styles.socialRow}>
                            <TouchableOpacity
                                style={styles.socialButton}
                                onPress={handleGoogleLogin}
                            >
                                <Text style={styles.socialIcon}>G</Text>
                                <Text style={styles.socialText}>Google</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.socialButton}
                                onPress={handleAppleLogin}
                            >
                                <Ionicons name="logo-apple" size={20} color="#fff" />
                                <Text style={styles.socialText}>Apple</Text>
                            </TouchableOpacity>
                        </View>

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
                </ScrollView>
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
    logoEmoji: {
        fontSize: 64,
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
        marginVertical: Spacing.xl,
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
    socialRow: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        paddingVertical: Spacing.md,
    },
    socialIcon: {
        fontSize: Fonts.lg,
        fontWeight: Fonts.bold,
        color: '#fff',
    },
    socialText: {
        fontSize: Fonts.base,
        fontWeight: Fonts.medium,
        color: '#fff',
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
});
