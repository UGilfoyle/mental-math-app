// Achievement definitions and logic

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string; // Ionicons name
    category: 'progress' | 'speed' | 'accuracy' | 'streak' | 'consistency' | 'problems';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    xpReward: number;
    requirement: AchievementRequirement;
}

export interface AchievementRequirement {
    type: 'level' | 'games' | 'correct' | 'perfect' | 'streak' | 'dayStreak';
    value: number;
}

export interface PlayerStats {
    level: number;
    totalGamesPlayed: number;
    totalCorrectAnswers: number;
    totalPerfectGames: number;
    longestStreak: number;
    currentDayStreak: number;
}

// Rarity colors
export const RARITY_COLORS = {
    common: '#6B7280',
    rare: '#3B82F6',
    epic: '#9333EA',
    legendary: '#F59E0B',
};

export const ACHIEVEMENTS: Achievement[] = [
    // Progress Achievements
    {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Complete your first game',
        icon: 'footsteps',
        category: 'progress',
        rarity: 'common',
        xpReward: 25,
        requirement: { type: 'games', value: 1 },
    },
    {
        id: 'getting_started',
        name: 'Getting Started',
        description: 'Reach level 5',
        icon: 'trending-up',
        category: 'progress',
        rarity: 'common',
        xpReward: 50,
        requirement: { type: 'level', value: 5 },
    },
    {
        id: 'rising_star',
        name: 'Rising Star',
        description: 'Reach level 10',
        icon: 'star',
        category: 'progress',
        rarity: 'rare',
        xpReward: 100,
        requirement: { type: 'level', value: 10 },
    },
    {
        id: 'math_master',
        name: 'Math Master',
        description: 'Reach level 25',
        icon: 'school',
        category: 'progress',
        rarity: 'epic',
        xpReward: 250,
        requirement: { type: 'level', value: 25 },
    },
    {
        id: 'elite',
        name: 'Elite',
        description: 'Reach level 50',
        icon: 'diamond',
        category: 'progress',
        rarity: 'legendary',
        xpReward: 500,
        requirement: { type: 'level', value: 50 },
    },

    // Accuracy Achievements
    {
        id: 'sharp_mind',
        name: 'Sharp Mind',
        description: 'Get 100% accuracy in a game',
        icon: 'checkmark-circle',
        category: 'accuracy',
        rarity: 'common',
        xpReward: 30,
        requirement: { type: 'perfect', value: 1 },
    },
    {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Get 5 perfect games',
        icon: 'ribbon',
        category: 'accuracy',
        rarity: 'rare',
        xpReward: 100,
        requirement: { type: 'perfect', value: 5 },
    },
    {
        id: 'flawless',
        name: 'Flawless',
        description: 'Get 25 perfect games',
        icon: 'medal',
        category: 'accuracy',
        rarity: 'epic',
        xpReward: 300,
        requirement: { type: 'perfect', value: 25 },
    },

    // Streak Achievements
    {
        id: 'on_fire',
        name: 'On Fire',
        description: 'Get a 10 answer streak',
        icon: 'flame',
        category: 'streak',
        rarity: 'common',
        xpReward: 40,
        requirement: { type: 'streak', value: 10 },
    },
    {
        id: 'unstoppable',
        name: 'Unstoppable',
        description: 'Get a 25 answer streak',
        icon: 'flash',
        category: 'streak',
        rarity: 'rare',
        xpReward: 100,
        requirement: { type: 'streak', value: 25 },
    },
    {
        id: 'legendary_streak',
        name: 'Legendary',
        description: 'Get a 50 answer streak',
        icon: 'rocket',
        category: 'streak',
        rarity: 'legendary',
        xpReward: 500,
        requirement: { type: 'streak', value: 50 },
    },

    // Consistency Achievements
    {
        id: 'daily_player',
        name: 'Daily Player',
        description: 'Play 7 days in a row',
        icon: 'calendar',
        category: 'consistency',
        rarity: 'rare',
        xpReward: 150,
        requirement: { type: 'dayStreak', value: 7 },
    },
    {
        id: 'dedicated',
        name: 'Dedicated',
        description: 'Play 30 days in a row',
        icon: 'calendar-outline',
        category: 'consistency',
        rarity: 'epic',
        xpReward: 500,
        requirement: { type: 'dayStreak', value: 30 },
    },
    {
        id: 'committed',
        name: 'Committed',
        description: 'Play 100 days in a row',
        icon: 'trophy',
        category: 'consistency',
        rarity: 'legendary',
        xpReward: 1000,
        requirement: { type: 'dayStreak', value: 100 },
    },

    // Problem Achievements
    {
        id: 'century',
        name: 'Century',
        description: 'Solve 100 problems',
        icon: 'calculator',
        category: 'problems',
        rarity: 'common',
        xpReward: 50,
        requirement: { type: 'correct', value: 100 },
    },
    {
        id: 'thousand_club',
        name: 'Thousand Club',
        description: 'Solve 1,000 problems',
        icon: 'bar-chart',
        category: 'problems',
        rarity: 'rare',
        xpReward: 200,
        requirement: { type: 'correct', value: 1000 },
    },
    {
        id: 'problem_crusher',
        name: 'Problem Crusher',
        description: 'Solve 10,000 problems',
        icon: 'nuclear',
        category: 'problems',
        rarity: 'legendary',
        xpReward: 1000,
        requirement: { type: 'correct', value: 10000 },
    },

    // Games Played Achievements
    {
        id: 'getting_warmed_up',
        name: 'Getting Warmed Up',
        description: 'Play 10 games',
        icon: 'game-controller',
        category: 'progress',
        rarity: 'common',
        xpReward: 30,
        requirement: { type: 'games', value: 10 },
    },
    {
        id: 'regular',
        name: 'Regular',
        description: 'Play 50 games',
        icon: 'fitness',
        category: 'progress',
        rarity: 'rare',
        xpReward: 100,
        requirement: { type: 'games', value: 50 },
    },
    {
        id: 'veteran',
        name: 'Veteran',
        description: 'Play 200 games',
        icon: 'shield-checkmark',
        category: 'progress',
        rarity: 'epic',
        xpReward: 300,
        requirement: { type: 'games', value: 200 },
    },
];

/**
 * Check if an achievement should be unlocked based on player stats
 */
export function checkAchievements(achievement: Achievement, stats: PlayerStats): boolean {
    const { type, value } = achievement.requirement;

    switch (type) {
        case 'level':
            return stats.level >= value;
        case 'games':
            return stats.totalGamesPlayed >= value;
        case 'correct':
            return stats.totalCorrectAnswers >= value;
        case 'perfect':
            return stats.totalPerfectGames >= value;
        case 'streak':
            return stats.longestStreak >= value;
        case 'dayStreak':
            return stats.currentDayStreak >= value;
        default:
            return false;
    }
}

/**
 * Get achievement by ID
 */
export function getAchievementById(id: string): Achievement | undefined {
    return ACHIEVEMENTS.find(a => a.id === id);
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: Achievement['category']): Achievement[] {
    return ACHIEVEMENTS.filter(a => a.category === category);
}

/**
 * Get unlocked achievements
 */
export function getUnlockedAchievements(unlockedIds: string[]): Achievement[] {
    return ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id));
}

/**
 * Get locked achievements
 */
export function getLockedAchievements(unlockedIds: string[]): Achievement[] {
    return ACHIEVEMENTS.filter(a => !unlockedIds.includes(a.id));
}
