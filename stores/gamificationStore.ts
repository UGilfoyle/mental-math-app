import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Achievement, ACHIEVEMENTS, checkAchievements } from '@/lib/achievements';
import { calculateLevel, getLevelTitle, getXPForNextLevel } from '@/lib/levels';

export interface GamificationState {
    // XP & Leveling
    totalXP: number;
    level: number;
    levelTitle: string;
    xpForNextLevel: number;
    xpProgress: number; // XP earned towards next level

    // Achievements
    unlockedAchievements: string[]; // Achievement IDs
    newAchievements: string[]; // Recently unlocked, not yet seen

    // Stats for achievements
    totalGamesPlayed: number;
    totalCorrectAnswers: number;
    totalPerfectGames: number;
    longestStreak: number;
    currentDayStreak: number;
    lastPlayDate: string | null;

    // Actions
    addXP: (amount: number, source: string) => { leveledUp: boolean; newLevel?: number };
    unlockAchievement: (achievementId: string) => void;
    markAchievementSeen: (achievementId: string) => void;
    updateStats: (stats: Partial<GamificationStats>) => void;
    checkAndUnlockAchievements: () => string[];
    resetProgress: () => void;
}

interface GamificationStats {
    gamesPlayed?: number;
    correctAnswers?: number;
    isPerfectGame?: boolean;
    streak?: number;
}

const initialState = {
    totalXP: 0,
    level: 1,
    levelTitle: 'Math Beginner',
    xpForNextLevel: 100,
    xpProgress: 0,
    unlockedAchievements: [],
    newAchievements: [],
    totalGamesPlayed: 0,
    totalCorrectAnswers: 0,
    totalPerfectGames: 0,
    longestStreak: 0,
    currentDayStreak: 0,
    lastPlayDate: null,
};

export const useGamificationStore = create<GamificationState>()(
    persist(
        (set, get) => ({
            ...initialState,

            addXP: (amount: number, source: string) => {
                const state = get();
                const newTotalXP = state.totalXP + amount;
                const newLevel = calculateLevel(newTotalXP);
                const leveledUp = newLevel > state.level;

                set({
                    totalXP: newTotalXP,
                    level: newLevel,
                    levelTitle: getLevelTitle(newLevel),
                    xpForNextLevel: getXPForNextLevel(newLevel),
                    xpProgress: newTotalXP - (newLevel * newLevel * 100),
                });

                return { leveledUp, newLevel: leveledUp ? newLevel : undefined };
            },

            unlockAchievement: (achievementId: string) => {
                const state = get();
                if (!state.unlockedAchievements.includes(achievementId)) {
                    set({
                        unlockedAchievements: [...state.unlockedAchievements, achievementId],
                        newAchievements: [...state.newAchievements, achievementId],
                    });
                }
            },

            markAchievementSeen: (achievementId: string) => {
                set((state) => ({
                    newAchievements: state.newAchievements.filter(id => id !== achievementId),
                }));
            },

            updateStats: (stats: Partial<GamificationStats>) => {
                const state = get();
                const today = new Date().toDateString();
                const lastPlay = state.lastPlayDate;

                // Calculate day streak
                let newDayStreak = state.currentDayStreak;
                if (lastPlay !== today) {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    if (lastPlay === yesterday.toDateString()) {
                        newDayStreak += 1;
                    } else if (lastPlay !== today) {
                        newDayStreak = 1;
                    }
                }

                set({
                    totalGamesPlayed: state.totalGamesPlayed + (stats.gamesPlayed || 0),
                    totalCorrectAnswers: state.totalCorrectAnswers + (stats.correctAnswers || 0),
                    totalPerfectGames: state.totalPerfectGames + (stats.isPerfectGame ? 1 : 0),
                    longestStreak: Math.max(state.longestStreak, stats.streak || 0),
                    currentDayStreak: newDayStreak,
                    lastPlayDate: today,
                });

                // Check for new achievements
                get().checkAndUnlockAchievements();
            },

            checkAndUnlockAchievements: () => {
                const state = get();
                const newlyUnlocked: string[] = [];

                ACHIEVEMENTS.forEach(achievement => {
                    if (!state.unlockedAchievements.includes(achievement.id)) {
                        const isUnlocked = checkAchievements(achievement, {
                            level: state.level,
                            totalGamesPlayed: state.totalGamesPlayed,
                            totalCorrectAnswers: state.totalCorrectAnswers,
                            totalPerfectGames: state.totalPerfectGames,
                            longestStreak: state.longestStreak,
                            currentDayStreak: state.currentDayStreak,
                        });

                        if (isUnlocked) {
                            get().unlockAchievement(achievement.id);
                            newlyUnlocked.push(achievement.id);
                        }
                    }
                });

                return newlyUnlocked;
            },

            resetProgress: () => {
                set(initialState);
            },
        }),
        {
            name: 'gamification-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
