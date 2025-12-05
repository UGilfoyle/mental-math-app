// Daily Challenge Generator
// Uses date as seed to generate unique challenges that are the same for all users on a given day

import { Difficulty, Operation } from '@/constants/Theme';
import { Category, generateProblem, MathProblem } from '@/lib/problems';

export interface DailyChallenge {
    id: string;
    date: string;
    title: string;
    description: string;
    emoji: string;
    difficulty: Difficulty;
    category: Category;
    targetScore: number;
    timeLimit: number; // in seconds
    problemCount: number;
    problems: MathProblem[];
    rewards: {
        xp: number;
        badge?: string;
    };
}

// Seeded random number generator
function seededRandom(seed: number): () => number {
    return function () {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
}

// Get seed from date string
function getDateSeed(dateStr: string): number {
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
        const char = dateStr.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

// Challenge templates
const CHALLENGE_TEMPLATES = [
    {
        title: 'Speed Demon',
        description: 'Solve 10 problems in 30 seconds!',
        emoji: '⚡',
        difficulty: 'medium' as Difficulty,
        category: 'arithmetic' as Category,
        timeLimit: 30,
        problemCount: 10,
        targetScore: 500,
        rewards: { xp: 100, badge: '⚡' },
    },
    {
        title: 'Perfect Ten',
        description: 'Get 10 correct in a row!',
        emoji: '🎯',
        difficulty: 'easy' as Difficulty,
        category: 'arithmetic' as Category,
        timeLimit: 120,
        problemCount: 10,
        targetScore: 400,
        rewards: { xp: 80, badge: '🎯' },
    },
    {
        title: 'Fraction Master',
        description: 'Conquer 8 fraction problems!',
        emoji: '🧮',
        difficulty: 'medium' as Difficulty,
        category: 'fractions' as Category,
        timeLimit: 90,
        problemCount: 8,
        targetScore: 450,
        rewards: { xp: 120, badge: '🧮' },
    },
    {
        title: 'Percentage Pro',
        description: 'Master 8 percentage calculations!',
        emoji: '📊',
        difficulty: 'medium' as Difficulty,
        category: 'percentages' as Category,
        timeLimit: 90,
        problemCount: 8,
        targetScore: 450,
        rewards: { xp: 110, badge: '📊' },
    },
    {
        title: 'Algebra Adventure',
        description: 'Solve 6 algebra problems!',
        emoji: '🔢',
        difficulty: 'hard' as Difficulty,
        category: 'algebra' as Category,
        timeLimit: 120,
        problemCount: 6,
        targetScore: 500,
        rewards: { xp: 150, badge: '🔢' },
    },
    {
        title: 'Power Hour',
        description: 'Calculate 8 powers and squares!',
        emoji: '💪',
        difficulty: 'medium' as Difficulty,
        category: 'powers' as Category,
        timeLimit: 90,
        problemCount: 8,
        targetScore: 400,
        rewards: { xp: 100, badge: '💪' },
    },
    {
        title: 'Root Rush',
        description: 'Find 8 square roots!',
        emoji: '√',
        difficulty: 'medium' as Difficulty,
        category: 'roots' as Category,
        timeLimit: 60,
        problemCount: 8,
        targetScore: 350,
        rewards: { xp: 90, badge: '√' },
    },
    {
        title: 'Pattern Finder',
        description: 'Discover 5 sequences!',
        emoji: '🔍',
        difficulty: 'hard' as Difficulty,
        category: 'sequences' as Category,
        timeLimit: 120,
        problemCount: 5,
        targetScore: 400,
        rewards: { xp: 130, badge: '🔍' },
    },
    {
        title: 'Marathon Math',
        description: 'Solve 20 mixed problems!',
        emoji: '🏃',
        difficulty: 'easy' as Difficulty,
        category: 'arithmetic' as Category,
        timeLimit: 180,
        problemCount: 20,
        targetScore: 600,
        rewards: { xp: 150, badge: '🏃' },
    },
    {
        title: 'Expert Challenge',
        description: 'Take on 10 expert problems!',
        emoji: '🏆',
        difficulty: 'expert' as Difficulty,
        category: 'arithmetic' as Category,
        timeLimit: 120,
        problemCount: 10,
        targetScore: 700,
        rewards: { xp: 200, badge: '🏆' },
    },
];

// Get today's daily challenge
export function getDailyChallenge(date?: Date): DailyChallenge {
    const d = date || new Date();
    const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
    const seed = getDateSeed(dateStr);
    const random = seededRandom(seed);

    // Select template based on date
    const templateIndex = Math.floor(random() * CHALLENGE_TEMPLATES.length);
    const template = CHALLENGE_TEMPLATES[templateIndex];

    // Generate problems with seeded randomness
    const problems: MathProblem[] = [];
    for (let i = 0; i < template.problemCount; i++) {
        const problem = generateProblem(template.category, template.difficulty);
        problems.push(problem);
    }

    return {
        id: `daily-${dateStr}`,
        date: dateStr,
        ...template,
        problems,
    };
}

// Check if user has completed today's challenge
export function hasCompletedDailyChallenge(
    completedChallenges: string[],
    date?: Date
): boolean {
    const d = date || new Date();
    const dateStr = d.toISOString().split('T')[0];
    return completedChallenges.includes(`daily-${dateStr}`);
}

// Get time remaining until next challenge
export function getTimeUntilNextChallenge(): { hours: number; minutes: number } {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes };
}

// Streak bonus for consecutive daily challenges
export function getDailyStreakBonus(streakDays: number): number {
    if (streakDays >= 30) return 50; // 50% bonus
    if (streakDays >= 14) return 30; // 30% bonus
    if (streakDays >= 7) return 20;  // 20% bonus
    if (streakDays >= 3) return 10;  // 10% bonus
    return 0;
}
