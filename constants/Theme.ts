// Theme constants for Mental Math App - Child-Friendly Glass Design
export const Colors = {
    // Fun gradient background colors
    gradientBg: ['#667eea', '#764ba2', '#f093fb'],

    // Primary colors - playful and bright
    primary: '#7C3AED',       // Vibrant purple
    primaryDark: '#6D28D9',
    primaryLight: '#A78BFA',

    // Accent colors - colorful for kids
    pink: '#EC4899',
    orange: '#F97316',
    teal: '#14B8A6',
    yellow: '#FBBF24',
    blue: '#3B82F6',

    // Feedback colors
    correct: '#10B981',
    correctLight: '#6EE7B7',
    wrong: '#EF4444',
    wrongLight: '#FCA5A5',

    // Glass effect colors
    glass: 'rgba(255, 255, 255, 0.15)',
    glassBorder: 'rgba(255, 255, 255, 0.3)',
    glassLight: 'rgba(255, 255, 255, 0.25)',

    // Background gradients
    background: '#1a1a2e',
    backgroundGradient: ['#1a1a2e', '#16213e', '#0f3460'],

    // Text
    text: '#FFFFFF',
    textMuted: 'rgba(255, 255, 255, 0.7)',
    textDim: 'rgba(255, 255, 255, 0.5)',

    // Card backgrounds
    card: 'rgba(255, 255, 255, 0.1)',
    cardBorder: 'rgba(255, 255, 255, 0.18)',

    // Fun emoji backgrounds
    emojiGreen: '#34D399',
    emojiBlue: '#60A5FA',
    emojiPurple: '#A78BFA',
    emojiPink: '#F472B6',

    // Surface colors for cards and tab bar
    surface: '#1E1E3F',
    surfaceLight: '#2D2D5A',
};

export const Fonts = {
    // Size scale - larger for kids
    xs: 12,
    sm: 14,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 36,
    '4xl': 44,
    '5xl': 56,
    '6xl': 72,
    '7xl': 96,

    // Weights
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
    '5xl': 56,
};

export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    full: 9999,
};

// Glass effect styles
export const GlassStyles = {
    card: {
        backgroundColor: Colors.glass,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        borderRadius: BorderRadius.xl,
    },
    cardStrong: {
        backgroundColor: Colors.glassLight,
        borderWidth: 1.5,
        borderColor: Colors.glassBorder,
        borderRadius: BorderRadius['2xl'],
    },
};

export const Shadows = {
    glow: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    soft: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 5,
    },
};

// Game Mode types
export type GameMode = 'practice' | 'speedrun' | 'timeattack' | 'survival' | 'compare' | 'truefalse' | 'missing' | 'sequence';
export type Operation = 'add' | 'subtract' | 'multiply' | 'divide' | 'mixed';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export const GameModes: Record<GameMode, {
    name: string;
    icon: string;
    description: string;
    color: string;
    gradient: string[];
}> = {
    practice: {
        name: 'Practice',
        icon: 'book-outline',
        description: 'Learn at your pace',
        color: '#10B981',
        gradient: ['#34D399', '#10B981'],
    },
    speedrun: {
        name: 'Speed Run',
        icon: 'flash',
        description: '20 problems, be fast!',
        color: '#F59E0B',
        gradient: ['#FBBF24', '#F59E0B'],
    },
    timeattack: {
        name: 'Time Attack',
        icon: 'timer-outline',
        description: '60 seconds challenge',
        color: '#EF4444',
        gradient: ['#F87171', '#EF4444'],
    },
    survival: {
        name: 'Survival',
        icon: 'heart',
        description: '3 lives, don\'t miss!',
        color: '#8B5CF6',
        gradient: ['#A78BFA', '#8B5CF6'],
    },
    compare: {
        name: 'Compare',
        icon: 'swap-horizontal',
        description: 'Which is bigger?',
        color: '#14B8A6',
        gradient: ['#2DD4BF', '#14B8A6'],
    },
    truefalse: {
        name: 'True/False',
        icon: 'checkmark-done',
        description: 'Is this correct?',
        color: '#EC4899',
        gradient: ['#F472B6', '#EC4899'],
    },
    missing: {
        name: 'Missing #',
        icon: 'help-circle',
        description: 'Find the missing number',
        color: '#6366F1',
        gradient: ['#818CF8', '#6366F1'],
    },
    sequence: {
        name: 'Sequence',
        icon: 'trending-up',
        description: 'What comes next?',
        color: '#0EA5E9',
        gradient: ['#38BDF8', '#0EA5E9'],
    },
};

export const Operations: Record<Operation, { name: string; symbol: string; emoji: string }> = {
    add: { name: 'Addition', symbol: '+', emoji: '➕' },
    subtract: { name: 'Subtraction', symbol: '−', emoji: '➖' },
    multiply: { name: 'Multiplication', symbol: '×', emoji: '✖️' },
    divide: { name: 'Division', symbol: '÷', emoji: '➗' },
    mixed: { name: 'Mixed', symbol: '?', emoji: '🎲' },
};

export const Difficulties: Record<Difficulty, {
    name: string;
    range: [number, number];
    operations: Operation[];
    emoji: string;
}> = {
    easy: {
        name: 'Easy',
        range: [1, 10],
        operations: ['add', 'subtract'],
        emoji: '🌱',
    },
    medium: {
        name: 'Medium',
        range: [1, 50],
        operations: ['add', 'subtract', 'multiply'],
        emoji: '🌿',
    },
    hard: {
        name: 'Hard',
        range: [1, 100],
        operations: ['add', 'subtract', 'multiply', 'divide'],
        emoji: '🌳',
    },
    expert: {
        name: 'Expert',
        range: [10, 999],
        operations: ['add', 'subtract', 'multiply', 'divide'],
        emoji: '🏆',
    },
};
