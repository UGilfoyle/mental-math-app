// Supabase client setup
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Check if we're in a browser/client environment
const isBrowser = typeof window !== 'undefined';

// Storage adapter for Supabase auth - handles SSR safely
const storage = {
    getItem: async (key: string) => {
        if (!isBrowser) return null;
        return AsyncStorage.getItem(key);
    },
    setItem: async (key: string, value: string) => {
        if (!isBrowser) return;
        return AsyncStorage.setItem(key, value);
    },
    removeItem: async (key: string) => {
        if (!isBrowser) return;
        return AsyncStorage.removeItem(key);
    },
};

// Supabase configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: storage,
        autoRefreshToken: isBrowser,
        persistSession: isBrowser,
        detectSessionInUrl: false,
    },
});

// Types
export interface Profile {
    id: string;
    email: string;
    display_name: string;
    avatar_url?: string;
    age_group: 'kids' | 'junior' | 'teen' | 'adult' | 'expert';
    subscription_tier: 'free' | 'pro' | 'family';
    streak_days: number;
    total_games: number;
    total_correct: number;
}

export interface GameRecord {
    id?: string;
    mode: string;
    difficulty: string;
    category: string;
    score: number;
    correct_count: number;
    wrong_count: number;
    accuracy: number;
    time_ms: number;
    problems?: any[];
}

// Auth helpers
export const auth = {
    // Sign up with email
    async signUp(email: string, password: string, displayName?: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: displayName || email.split('@')[0] },
            },
        });
        return { data, error };
    },

    // Sign in with email
    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    },

    // Sign in with Google
    async signInWithGoogle() {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
        return { data, error };
    },

    // Sign in with Apple
    async signInWithApple() {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'apple',
        });
        return { data, error };
    },

    // Sign out
    async signOut() {
        const { error } = await supabase.auth.signOut();
        return { error };
    },

    // Get current session
    async getSession() {
        const { data, error } = await supabase.auth.getSession();
        return { session: data.session, error };
    },

    // Get current user
    async getUser() {
        const { data, error } = await supabase.auth.getUser();
        return { user: data.user, error };
    },
};

// Profile helpers
export const profiles = {
    // Get user profile
    async get(userId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        return { profile: data as Profile | null, error };
    },

    // Update profile
    async update(userId: string, updates: Partial<Profile>) {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();
        return { profile: data as Profile | null, error };
    },

    // Set age group
    async setAgeGroup(userId: string, ageGroup: Profile['age_group']) {
        return profiles.update(userId, { age_group: ageGroup });
    },
};

// Games helpers
export const games = {
    // Save game result
    async save(userId: string, game: GameRecord) {
        const { data, error } = await supabase
            .from('games')
            .insert({
                user_id: userId,
                ...game,
            })
            .select()
            .single();

        // Update profile stats via RPC or separate query
        if (!error) {
            await supabase.rpc('update_streak', { p_user_id: userId });
            // Increment counters - using RPC for atomic update
            await supabase.rpc('increment_game_stats', {
                p_user_id: userId,
                p_correct_count: game.correct_count,
            });
        }

        return { game: data, error };
    },

    // Get user's games
    async getHistory(userId: string, limit = 20) {
        const { data, error } = await supabase
            .from('games')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);
        return { games: data || [], error };
    },

    // Get best scores
    async getBestScores(userId: string, mode?: string) {
        let query = supabase
            .from('games')
            .select('*')
            .eq('user_id', userId)
            .order('score', { ascending: false })
            .limit(10);

        if (mode) {
            query = query.eq('mode', mode);
        }

        const { data, error } = await query;
        return { games: data || [], error };
    },
};

// Daily progress helpers
export const progress = {
    // Get today's progress
    async getToday(userId: string) {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
            .from('daily_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('date', today)
            .single();
        return { progress: data, error };
    },

    // Update today's progress
    async updateToday(userId: string, updates: {
        problems_solved?: number;
        correct_count?: number;
        time_spent_ms?: number;
        category?: string;
    }) {
        const today = new Date().toISOString().split('T')[0];

        // Upsert daily progress
        const { data, error } = await supabase
            .from('daily_progress')
            .upsert({
                user_id: userId,
                date: today,
                problems_solved: updates.problems_solved || 0,
                correct_count: updates.correct_count || 0,
                time_spent_ms: updates.time_spent_ms || 0,
                games_played: 1,
            }, {
                onConflict: 'user_id,date',
            })
            .select()
            .single();

        return { progress: data, error };
    },

    // Get weekly stats
    async getWeekly(userId: string) {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const { data, error } = await supabase
            .from('daily_progress')
            .select('*')
            .eq('user_id', userId)
            .gte('date', weekAgo.toISOString().split('T')[0])
            .order('date', { ascending: true });

        return { progress: data || [], error };
    },
};

// Leaderboard helpers
export const leaderboard = {
    // Get global leaderboard
    async getGlobal(limit = 50) {
        const { data, error } = await supabase
            .from('leaderboard')
            .select('*')
            .order('total_score', { ascending: false })
            .limit(limit);
        return { leaderboard: data || [], error };
    },

    // Get user's rank
    async getUserRank(userId: string) {
        const { data, error } = await supabase
            .from('leaderboard')
            .select('rank')
            .eq('id', userId)
            .single();
        return { rank: data?.rank || null, error };
    },
};
