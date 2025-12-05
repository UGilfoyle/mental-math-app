import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, BorderRadius } from '@/constants/Theme';
import { useGamificationStore } from '@/stores/gamificationStore';
import {
    ACHIEVEMENTS,
    RARITY_COLORS,
    getAchievementsByCategory,
    Achievement
} from '@/lib/achievements';
import { getLevelColor, getLevelProgress, formatXP, getXPForNextLevel } from '@/lib/levels';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
    const {
        level,
        levelTitle,
        totalXP,
        unlockedAchievements,
        totalGamesPlayed,
        totalCorrectAnswers,
        totalPerfectGames,
        longestStreak,
        currentDayStreak,
    } = useGamificationStore();

    const levelColor = getLevelColor(level);
    const levelProgress = getLevelProgress(totalXP);
    const xpForNext = getXPForNextLevel(level);

    const categories = ['progress', 'accuracy', 'streak', 'consistency', 'problems'] as const;
    const categoryIcons: Record<string, string> = {
        progress: 'trending-up',
        accuracy: 'checkmark-circle',
        streak: 'flame',
        consistency: 'calendar',
        problems: 'calculator',
    };
    const categoryNames: Record<string, string> = {
        progress: 'Progress',
        accuracy: 'Accuracy',
        streak: 'Streaks',
        consistency: 'Consistency',
        problems: 'Problems',
    };

    const renderAchievement = (achievement: Achievement) => {
        const isUnlocked = unlockedAchievements.includes(achievement.id);
        const rarityColor = RARITY_COLORS[achievement.rarity];

        return (
            <View key={achievement.id} style={[styles.achievementCard, !isUnlocked && styles.lockedCard]}>
                <View style={[styles.achievementIcon, { backgroundColor: isUnlocked ? rarityColor : '#333' }]}>
                    <Ionicons
                        name={achievement.icon as any}
                        size={24}
                        color={isUnlocked ? '#fff' : '#666'}
                    />
                </View>
                <View style={styles.achievementInfo}>
                    <Text style={[styles.achievementName, !isUnlocked && styles.lockedText]}>
                        {achievement.name}
                    </Text>
                    <Text style={styles.achievementDesc}>{achievement.description}</Text>
                </View>
                {isUnlocked ? (
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                ) : (
                    <Text style={styles.xpReward}>+{achievement.xpReward} XP</Text>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Level Card */}
                <LinearGradient
                    colors={[levelColor, Colors.background]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.levelCard}
                >
                    <View style={styles.levelBadge}>
                        <Text style={styles.levelNumber}>{level}</Text>
                    </View>
                    <View style={styles.levelInfo}>
                        <Text style={styles.levelTitle}>{levelTitle}</Text>
                        <Text style={styles.xpText}>{formatXP(totalXP)} XP Total</Text>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${levelProgress}%` }]} />
                        </View>
                        <Text style={styles.nextLevelText}>
                            {formatXP(xpForNext - totalXP)} XP to Level {level + 1}
                        </Text>
                    </View>
                </LinearGradient>

                {/* Stats Grid */}
                <Text style={styles.sectionTitle}>Your Stats</Text>
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Ionicons name="game-controller" size={24} color={Colors.primary} />
                        <Text style={styles.statValue}>{totalGamesPlayed}</Text>
                        <Text style={styles.statLabel}>Games</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="checkmark-done" size={24} color={Colors.correct} />
                        <Text style={styles.statValue}>{totalCorrectAnswers}</Text>
                        <Text style={styles.statLabel}>Correct</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="ribbon" size={24} color="#F59E0B" />
                        <Text style={styles.statValue}>{totalPerfectGames}</Text>
                        <Text style={styles.statLabel}>Perfect</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="flame" size={24} color="#EF4444" />
                        <Text style={styles.statValue}>{longestStreak}</Text>
                        <Text style={styles.statLabel}>Best Streak</Text>
                    </View>
                </View>

                {/* Day Streak */}
                {currentDayStreak > 0 && (
                    <View style={styles.dayStreakCard}>
                        <Ionicons name="flame" size={32} color="#F97316" />
                        <View style={styles.dayStreakInfo}>
                            <Text style={styles.dayStreakValue}>{currentDayStreak} Day Streak!</Text>
                            <Text style={styles.dayStreakText}>Keep playing daily!</Text>
                        </View>
                    </View>
                )}

                {/* Achievements */}
                <View style={styles.achievementsHeader}>
                    <Text style={styles.sectionTitle}>Achievements</Text>
                    <Text style={styles.achievementCount}>
                        {unlockedAchievements.length}/{ACHIEVEMENTS.length}
                    </Text>
                </View>

                {categories.map(category => {
                    const categoryAchievements = getAchievementsByCategory(category);
                    const unlockedCount = categoryAchievements.filter(a =>
                        unlockedAchievements.includes(a.id)
                    ).length;

                    return (
                        <View key={category} style={styles.categorySection}>
                            <View style={styles.categoryHeader}>
                                <Ionicons
                                    name={categoryIcons[category] as any}
                                    size={20}
                                    color={Colors.primary}
                                />
                                <Text style={styles.categoryTitle}>
                                    {categoryNames[category]}
                                </Text>
                                <Text style={styles.categoryCount}>
                                    {unlockedCount}/{categoryAchievements.length}
                                </Text>
                            </View>
                            {categoryAchievements.map(renderAchievement)}
                        </View>
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: 100,
    },
    levelCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.xl,
        borderRadius: BorderRadius.xl,
        marginBottom: Spacing.xl,
    },
    levelBadge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.lg,
    },
    levelNumber: {
        fontSize: 36,
        fontWeight: '900',
        color: '#fff',
    },
    levelInfo: {
        flex: 1,
    },
    levelTitle: {
        fontSize: Fonts.xl,
        fontWeight: Fonts.bold,
        color: '#fff',
    },
    xpText: {
        fontSize: Fonts.sm,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    progressBar: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 4,
        marginTop: Spacing.sm,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 4,
    },
    nextLevelText: {
        fontSize: Fonts.xs,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: Fonts.lg,
        fontWeight: Fonts.bold,
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    statCard: {
        width: (width - Spacing.lg * 2 - Spacing.md) / 2,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        alignItems: 'center',
    },
    statValue: {
        fontSize: Fonts['2xl'],
        fontWeight: Fonts.bold,
        color: Colors.text,
        marginTop: Spacing.sm,
    },
    statLabel: {
        fontSize: Fonts.xs,
        color: Colors.textMuted,
        marginTop: 2,
    },
    dayStreakCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(249,115,22,0.15)',
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: 'rgba(249,115,22,0.3)',
    },
    dayStreakInfo: {
        marginLeft: Spacing.md,
    },
    dayStreakValue: {
        fontSize: Fonts.lg,
        fontWeight: Fonts.bold,
        color: '#F97316',
    },
    dayStreakText: {
        fontSize: Fonts.sm,
        color: Colors.textMuted,
    },
    achievementsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    achievementCount: {
        fontSize: Fonts.base,
        fontWeight: Fonts.semibold,
        color: Colors.primary,
    },
    categorySection: {
        marginBottom: Spacing.xl,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
        backgroundColor: Colors.surface,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    categoryTitle: {
        flex: 1,
        fontSize: Fonts.base,
        fontWeight: Fonts.semibold,
        color: Colors.text,
    },
    categoryCount: {
        fontSize: Fonts.sm,
        color: Colors.textMuted,
    },
    achievementCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
    },
    lockedCard: {
        opacity: 0.6,
    },
    achievementIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    achievementInfo: {
        flex: 1,
    },
    achievementName: {
        fontSize: Fonts.base,
        fontWeight: Fonts.semibold,
        color: Colors.text,
    },
    lockedText: {
        color: Colors.textMuted,
    },
    achievementDesc: {
        fontSize: Fonts.xs,
        color: Colors.textMuted,
        marginTop: 2,
    },
    xpReward: {
        fontSize: Fonts.sm,
        fontWeight: Fonts.semibold,
        color: '#FFD700',
    },
});
