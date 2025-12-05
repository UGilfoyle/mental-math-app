// Cloud sync service for Mental Math Pro
// Handles syncing local data with Supabase

import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SYNC_KEY = 'last_sync_timestamp';
const PENDING_SYNC_KEY = 'pending_sync_data';

export interface SyncableGameResult {
    id: string;
    mode: string;
    difficulty: string;
    operation: string;
    score: number;
    correctCount: number;
    totalCount: number;
    accuracy: number;
    timeMs: number;
    date: string;
    synced?: boolean;
}

export interface SyncableStats {
    totalXP: number;
    level: number;
    totalGamesPlayed: number;
    totalCorrectAnswers: number;
    totalPerfectGames: number;
    longestStreak: number;
    currentDayStreak: number;
    lastPlayDate: string | null;
}

export interface SyncableAchievement {
    id: string;
    unlockedAt: string;
}

class CloudSyncService {
    private userId: string | null = null;

    // Set the current user ID
    setUserId(userId: string | null) {
        this.userId = userId;
    }

    // Get last sync timestamp
    async getLastSyncTime(): Promise<number | null> {
        try {
            const timestamp = await AsyncStorage.getItem(SYNC_KEY);
            return timestamp ? parseInt(timestamp, 10) : null;
        } catch {
            return null;
        }
    }

    // Update last sync timestamp
    async updateLastSyncTime(): Promise<void> {
        await AsyncStorage.setItem(SYNC_KEY, Date.now().toString());
    }

    // ============================================
    // GAME HISTORY SYNC
    // ============================================

    // Sync local game history to cloud
    async syncGameHistory(games: SyncableGameResult[]): Promise<{ success: boolean; synced: number }> {
        if (!this.userId) return { success: false, synced: 0 };

        try {
            // Filter unsynced games
            const unsyncedGames = games.filter(g => !g.synced);
            if (unsyncedGames.length === 0) return { success: true, synced: 0 };

            // Map to Supabase format
            const records = unsyncedGames.map(game => ({
                user_id: this.userId,
                mode: game.mode,
                difficulty: game.difficulty,
                operation: game.operation,
                score: game.score,
                correct_count: game.correctCount,
                total_count: game.totalCount,
                accuracy: game.accuracy,
                time_ms: game.timeMs,
                played_at: game.date,
            }));

            const { error } = await supabase
                .from('games')
                .insert(records);

            if (error) throw error;

            return { success: true, synced: unsyncedGames.length };
        } catch (error) {
            console.error('Game history sync error:', error);
            return { success: false, synced: 0 };
        }
    }

    // Fetch game history from cloud
    async fetchGameHistory(limit = 50): Promise<SyncableGameResult[]> {
        if (!this.userId) return [];

        try {
            const { data, error } = await supabase
                .from('games')
                .select('*')
                .eq('user_id', this.userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return (data || []).map(game => ({
                id: game.id,
                mode: game.mode,
                difficulty: game.difficulty,
                operation: game.category || 'mixed',
                score: game.score,
                correctCount: game.correct_count,
                totalCount: game.correct_count + game.wrong_count,
                accuracy: game.accuracy,
                timeMs: game.time_ms,
                date: game.created_at,
                synced: true,
            }));
        } catch (error) {
            console.error('Fetch game history error:', error);
            return [];
        }
    }

    // ============================================
    // STATS SYNC
    // ============================================

    // Sync local stats to cloud
    async syncStats(stats: SyncableStats): Promise<boolean> {
        if (!this.userId) return false;

        try {
            // Update profile stats
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    xp: stats.totalXP,
                    total_games: stats.totalGamesPlayed,
                    total_correct: stats.totalCorrectAnswers,
                    streak_days: stats.currentDayStreak,
                    last_played_at: stats.lastPlayDate,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', this.userId);

            if (profileError) throw profileError;

            return true;
        } catch (error) {
            console.error('Stats sync error:', error);
            return false;
        }
    }

    // Fetch stats from cloud
    async fetchStats(): Promise<SyncableStats | null> {
        if (!this.userId) return null;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', this.userId)
                .single();

            if (error) throw error;
            if (!data) return null;

            return {
                totalXP: data.xp || 0,
                level: Math.floor((data.xp || 0) / 1000) + 1, // Calculate level from XP
                totalGamesPlayed: data.total_games || 0,
                totalCorrectAnswers: data.total_correct || 0,
                totalPerfectGames: 0, // Not tracked in current schema
                longestStreak: data.streak_days || 0,
                currentDayStreak: data.streak_days || 0,
                lastPlayDate: data.last_played_at,
            };
        } catch (error) {
            console.error('Fetch stats error:', error);
            return null;
        }
    }

    // ============================================
    // ACHIEVEMENTS SYNC
    // ============================================

    // Sync achievements to cloud
    async syncAchievements(achievements: SyncableAchievement[]): Promise<boolean> {
        if (!this.userId || achievements.length === 0) return true;

        try {
            const records = achievements.map(a => ({
                user_id: this.userId,
                achievement_key: a.id,
                unlocked_at: a.unlockedAt,
            }));

            // Use upsert to handle duplicates
            const { error } = await supabase
                .from('achievements')
                .upsert(records, {
                    onConflict: 'user_id,achievement_key',
                    ignoreDuplicates: true,
                });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Achievements sync error:', error);
            return false;
        }
    }

    // Fetch achievements from cloud
    async fetchAchievements(): Promise<SyncableAchievement[]> {
        if (!this.userId) return [];

        try {
            const { data, error } = await supabase
                .from('achievements')
                .select('*')
                .eq('user_id', this.userId);

            if (error) throw error;

            return (data || []).map(a => ({
                id: a.achievement_key,
                unlockedAt: a.unlocked_at,
            }));
        } catch (error) {
            console.error('Fetch achievements error:', error);
            return [];
        }
    }

    // ============================================
    // FULL SYNC
    // ============================================

    // Perform full sync (upload local, download cloud, merge)
    async fullSync(
        localGames: SyncableGameResult[],
        localStats: SyncableStats,
        localAchievements: string[]
    ): Promise<{
        success: boolean;
        gamesSynced: number;
        cloudStats: SyncableStats | null;
        cloudAchievements: string[];
    }> {
        if (!this.userId) {
            return {
                success: false,
                gamesSynced: 0,
                cloudStats: null,
                cloudAchievements: [],
            };
        }

        try {
            // 1. Upload unsynced games
            const gameResult = await this.syncGameHistory(localGames);

            // 2. Sync stats (local takes priority for now)
            await this.syncStats(localStats);

            // 3. Sync achievements
            const achievementRecords = localAchievements.map(id => ({
                id,
                unlockedAt: new Date().toISOString(),
            }));
            await this.syncAchievements(achievementRecords);

            // 4. Fetch cloud data
            const cloudStats = await this.fetchStats();
            const cloudAchievements = await this.fetchAchievements();

            // 5. Update last sync time
            await this.updateLastSyncTime();

            return {
                success: true,
                gamesSynced: gameResult.synced,
                cloudStats,
                cloudAchievements: cloudAchievements.map(a => a.id),
            };
        } catch (error) {
            console.error('Full sync error:', error);
            return {
                success: false,
                gamesSynced: 0,
                cloudStats: null,
                cloudAchievements: [],
            };
        }
    }

    // Quick save a single game
    async saveGame(game: SyncableGameResult): Promise<boolean> {
        if (!this.userId) {
            // Queue for later sync
            await this.queuePendingSync('game', game);
            return false;
        }

        try {
            const { error } = await supabase
                .from('games')
                .insert({
                    user_id: this.userId,
                    mode: game.mode,
                    difficulty: game.difficulty,
                    operation: game.operation,
                    score: game.score,
                    correct_count: game.correctCount,
                    total_count: game.totalCount,
                    accuracy: game.accuracy,
                    time_ms: game.timeMs,
                    played_at: game.date,
                });

            if (error) throw error;

            // Update streak
            await supabase.rpc('update_streak', { p_user_id: this.userId });

            return true;
        } catch (error) {
            console.error('Save game error:', error);
            await this.queuePendingSync('game', game);
            return false;
        }
    }

    // Queue data for pending sync (when offline or not logged in)
    private async queuePendingSync(type: string, data: any): Promise<void> {
        try {
            const pending = await AsyncStorage.getItem(PENDING_SYNC_KEY);
            const queue = pending ? JSON.parse(pending) : [];
            queue.push({ type, data, timestamp: Date.now() });
            await AsyncStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(queue));
        } catch (error) {
            console.error('Queue pending sync error:', error);
        }
    }

    // Process pending sync queue
    async processPendingSync(): Promise<number> {
        if (!this.userId) return 0;

        try {
            const pending = await AsyncStorage.getItem(PENDING_SYNC_KEY);
            if (!pending) return 0;

            const queue = JSON.parse(pending);
            let processed = 0;

            for (const item of queue) {
                try {
                    if (item.type === 'game') {
                        await this.saveGame(item.data);
                        processed++;
                    }
                } catch {
                    // Continue with next item
                }
            }

            // Clear processed items
            await AsyncStorage.removeItem(PENDING_SYNC_KEY);
            return processed;
        } catch (error) {
            console.error('Process pending sync error:', error);
            return 0;
        }
    }
}

// Export singleton instance
export const cloudSync = new CloudSyncService();
