// Authentication store using Zustand
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import { supabase, auth, profiles, Profile } from '@/lib/supabase';
import { cloudSync } from '@/lib/cloudSync';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';

// Complete any auth session
WebBrowser.maybeCompleteAuthSession();

interface AuthState {
    // State
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;

    // Actions
    initialize: () => Promise<void>;
    signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
    signInWithApple: () => Promise<{ success: boolean; error?: string }>;
    signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signUpWithEmail: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    // Initial state
    user: null,
    session: null,
    profile: null,
    isLoading: false,
    isInitialized: false,
    error: null,

    // Initialize auth state
    initialize: async () => {
        try {
            set({ isLoading: true });

            // Get current session
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                // Set cloud sync user ID
                cloudSync.setUserId(session.user.id);

                // Fetch profile
                const { profile } = await profiles.get(session.user.id);

                set({
                    user: session.user,
                    session,
                    profile,
                    isInitialized: true,
                    isLoading: false,
                });
            } else {
                cloudSync.setUserId(null);
                set({
                    user: null,
                    session: null,
                    profile: null,
                    isInitialized: true,
                    isLoading: false,
                });
            }

            // Listen for auth changes
            supabase.auth.onAuthStateChange(async (event, session) => {
                console.log('Auth state changed:', event);

                if (session?.user) {
                    // Set cloud sync user ID
                    cloudSync.setUserId(session.user.id);

                    // Process any pending sync items
                    cloudSync.processPendingSync();

                    const { profile } = await profiles.get(session.user.id);
                    set({
                        user: session.user,
                        session,
                        profile,
                    });
                } else {
                    // Clear cloud sync user ID
                    cloudSync.setUserId(null);

                    set({
                        user: null,
                        session: null,
                        profile: null,
                    });
                }
            });
        } catch (error) {
            console.error('Auth initialization error:', error);
            set({
                isInitialized: true,
                isLoading: false,
                error: 'Failed to initialize auth',
            });
        }
    },

    // Google Sign In
    signInWithGoogle: async () => {
        try {
            set({ isLoading: true, error: null });

            // For Expo Go, we need to use the exp:// scheme
            const redirectUrl = AuthSession.makeRedirectUri();

            console.log('Redirect URL:', redirectUrl);

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true,
                },
            });

            if (error) throw error;

            if (data?.url) {
                // Open browser for OAuth
                const result = await WebBrowser.openAuthSessionAsync(
                    data.url,
                    redirectUrl,
                    { showInRecents: true }
                );

                if (result.type === 'success' && result.url) {
                    // Extract tokens from URL
                    const url = new URL(result.url);
                    const params = new URLSearchParams(url.hash.slice(1));
                    const accessToken = params.get('access_token');
                    const refreshToken = params.get('refresh_token');

                    if (accessToken) {
                        // Set the session
                        const { error: sessionError } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken || '',
                        });

                        if (sessionError) throw sessionError;

                        set({ isLoading: false });
                        return { success: true };
                    }
                }

                throw new Error('Authentication cancelled');
            }

            throw new Error('Failed to initiate OAuth');
        } catch (error: any) {
            console.error('Google sign in error:', error);
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
        }
    },

    // Apple Sign In
    signInWithApple: async () => {
        try {
            set({ isLoading: true, error: null });

            if (Platform.OS !== 'ios') {
                throw new Error('Apple Sign In is only available on iOS');
            }

            // Check if Apple Auth is available
            const isAvailable = await AppleAuthentication.isAvailableAsync();
            if (!isAvailable) {
                throw new Error('Apple Sign In is not available on this device');
            }

            // Request Apple credential
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            if (!credential.identityToken) {
                throw new Error('No identity token received');
            }

            // Sign in with Supabase using Apple token
            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'apple',
                token: credential.identityToken,
            });

            if (error) throw error;

            // Update profile with Apple name if available
            if (data.user && credential.fullName) {
                const fullName = [
                    credential.fullName.givenName,
                    credential.fullName.familyName,
                ].filter(Boolean).join(' ');

                if (fullName) {
                    await profiles.update(data.user.id, {
                        display_name: fullName,
                    });
                }
            }

            set({ isLoading: false });
            return { success: true };
        } catch (error: any) {
            console.error('Apple sign in error:', error);

            // Handle user cancellation
            if (error.code === 'ERR_REQUEST_CANCELED') {
                set({ isLoading: false });
                return { success: false, error: 'Sign in cancelled' };
            }

            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
        }
    },

    // Email Sign In
    signInWithEmail: async (email: string, password: string) => {
        try {
            set({ isLoading: true, error: null });

            const { data, error } = await auth.signIn(email, password);

            if (error) throw error;

            set({ isLoading: false });
            return { success: true };
        } catch (error: any) {
            console.error('Email sign in error:', error);
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
        }
    },

    // Email Sign Up
    signUpWithEmail: async (email: string, password: string, name?: string) => {
        try {
            set({ isLoading: true, error: null });

            const { data, error } = await auth.signUp(email, password, name);

            if (error) throw error;

            set({ isLoading: false });
            return { success: true };
        } catch (error: any) {
            console.error('Email sign up error:', error);
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
        }
    },

    // Sign Out
    signOut: async () => {
        try {
            set({ isLoading: true });
            await auth.signOut();
            set({
                user: null,
                session: null,
                profile: null,
                isLoading: false,
            });
        } catch (error) {
            console.error('Sign out error:', error);
            set({ isLoading: false });
        }
    },

    // Refresh profile
    refreshProfile: async () => {
        const { user } = get();
        if (!user) return;

        try {
            const { profile } = await profiles.get(user.id);
            set({ profile });
        } catch (error) {
            console.error('Refresh profile error:', error);
        }
    },

    // Clear error
    clearError: () => set({ error: null }),
}));
