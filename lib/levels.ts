// XP & Level calculation utilities

/**
 * Calculate level from total XP
 * Formula: Level = floor(sqrt(totalXP / 100))
 * This means: Level 1 = 100 XP, Level 2 = 400 XP, Level 3 = 900 XP, etc.
 */
export function calculateLevel(totalXP: number): number {
    return Math.max(1, Math.floor(Math.sqrt(totalXP / 100)));
}

/**
 * Get XP required to reach a specific level
 */
export function getXPForLevel(level: number): number {
    return level * level * 100;
}

/**
 * Get XP required for the next level
 */
export function getXPForNextLevel(currentLevel: number): number {
    return getXPForLevel(currentLevel + 1);
}

/**
 * Get progress percentage towards next level
 */
export function getLevelProgress(totalXP: number): number {
    const currentLevel = calculateLevel(totalXP);
    const currentLevelXP = getXPForLevel(currentLevel);
    const nextLevelXP = getXPForLevel(currentLevel + 1);
    const xpInCurrentLevel = totalXP - currentLevelXP;
    const xpNeededForNextLevel = nextLevelXP - currentLevelXP;
    return Math.min(100, (xpInCurrentLevel / xpNeededForNextLevel) * 100);
}

/**
 * Get level title based on level number
 */
export function getLevelTitle(level: number): string {
    if (level >= 100) return 'Math God';
    if (level >= 76) return 'Math Legend';
    if (level >= 51) return 'Math Wizard';
    if (level >= 36) return 'Math Master';
    if (level >= 21) return 'Math Expert';
    if (level >= 11) return 'Math Enthusiast';
    if (level >= 6) return 'Math Student';
    return 'Math Beginner';
}

/**
 * Get color for level title
 */
export function getLevelColor(level: number): string {
    if (level >= 100) return '#FFD700'; // Gold
    if (level >= 76) return '#9333EA';  // Purple
    if (level >= 51) return '#3B82F6';  // Blue
    if (level >= 36) return '#10B981';  // Emerald
    if (level >= 21) return '#F59E0B';  // Amber
    if (level >= 11) return '#EF4444';  // Red
    if (level >= 6) return '#8B5CF6';   // Violet
    return '#6B7280'; // Gray
}

/**
 * Calculate XP earned from a game
 */
export function calculateGameXP(
    correctAnswers: number,
    accuracy: number,
    streak: number,
    isFirstGameOfDay: boolean,
    isDailyChallenge: boolean
): { total: number; breakdown: { source: string; amount: number }[] } {
    const breakdown: { source: string; amount: number }[] = [];

    // Base XP: 10 per correct answer
    const baseXP = correctAnswers * 10;
    breakdown.push({ source: 'Correct Answers', amount: baseXP });

    // Perfect game bonus
    if (accuracy >= 100) {
        breakdown.push({ source: 'Perfect Game!', amount: 50 });
    }

    // Streak bonus (5+ XP per answer if streak > 5)
    if (streak >= 5) {
        const streakBonus = Math.min(streak, 25) * 5;
        breakdown.push({ source: `${streak} Streak Bonus`, amount: streakBonus });
    }

    // First game of day bonus
    if (isFirstGameOfDay) {
        breakdown.push({ source: 'First Game Today', amount: 25 });
    }

    // Daily challenge bonus
    if (isDailyChallenge) {
        breakdown.push({ source: 'Daily Challenge', amount: 100 });
    }

    const total = breakdown.reduce((sum, item) => sum + item.amount, 0);
    return { total, breakdown };
}

/**
 * Format XP number with suffix (1.2K, 5.5M, etc.)
 */
export function formatXP(xp: number): string {
    if (xp >= 1000000) {
        return (xp / 1000000).toFixed(1) + 'M';
    }
    if (xp >= 1000) {
        return (xp / 1000).toFixed(1) + 'K';
    }
    return xp.toString();
}
