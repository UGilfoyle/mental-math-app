import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, BorderRadius, GameModes, Operations } from '@/constants/Theme';
import { useGameStore } from '@/stores/gameStore';
import { formatTime } from '@/lib/math';

export default function StatsScreen() {
    const { history } = useGameStore();

    // Calculate aggregated stats
    const totalGames = history.length;
    const totalCorrect = history.reduce((sum, g) => sum + g.correctCount, 0);
    const totalWrong = history.reduce((sum, g) => sum + (g.totalCount - g.correctCount), 0);
    const totalTime = history.reduce((sum, g) => sum + g.timeMs, 0);
    const bestScore = totalGames > 0 ? Math.max(...history.map(g => g.score)) : 0;
    const avgAccuracy = totalGames > 0
        ? Math.round(history.reduce((sum, g) => sum + g.accuracy, 0) / totalGames)
        : 0;

    // Get mode stats
    const modeStats = Object.entries(GameModes).map(([key, mode]) => {
        const modeGames = history.filter(g => g.mode === key);
        return {
            mode: key,
            ...mode,
            games: modeGames.length,
            bestScore: modeGames.length > 0 ? Math.max(...modeGames.map(g => g.score)) : 0,
        };
    });

    // Recent games
    const recentGames = [...history].reverse().slice(0, 5);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Your Stats</Text>

                {/* Overview Cards */}
                <View style={styles.overviewGrid}>
                    <View style={styles.overviewCard}>
                        <Ionicons name="game-controller" size={24} color={Colors.primary} />
                        <Text style={styles.overviewValue}>{totalGames}</Text>
                        <Text style={styles.overviewLabel}>Games Played</Text>
                    </View>
                    <View style={styles.overviewCard}>
                        <Ionicons name="checkmark-circle" size={24} color={Colors.correct} />
                        <Text style={styles.overviewValue}>{totalCorrect}</Text>
                        <Text style={styles.overviewLabel}>Problems Solved</Text>
                    </View>
                    <View style={styles.overviewCard}>
                        <Ionicons name="trophy" size={24} color={Colors.yellow} />
                        <Text style={styles.overviewValue}>{bestScore}</Text>
                        <Text style={styles.overviewLabel}>Best Score</Text>
                    </View>
                    <View style={styles.overviewCard}>
                        <Ionicons name="analytics" size={24} color={Colors.primary} />
                        <Text style={styles.overviewValue}>{avgAccuracy}%</Text>
                        <Text style={styles.overviewLabel}>Avg Accuracy</Text>
                    </View>
                </View>

                {/* Mode Breakdown */}
                <Text style={styles.sectionTitle}>By Game Mode</Text>
                <View style={styles.modeStats}>
                    {modeStats.map((stat) => (
                        <View key={stat.mode} style={styles.modeStatRow}>
                            <View style={styles.modeInfo}>
                                <View style={styles.modeIconBox}>
                                    <Ionicons name={stat.icon as any} size={18} color="#fff" />
                                </View>
                                <Text style={styles.modeName}>{stat.name}</Text>
                            </View>
                            <View style={styles.modeNumbers}>
                                <Text style={styles.modeGames}>{stat.games} games</Text>
                                {stat.bestScore > 0 && (
                                    <Text style={styles.modeBest}>Best: {stat.bestScore}</Text>
                                )}
                            </View>
                        </View>
                    ))}
                </View>

                {/* Recent Games */}
                {recentGames.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Recent Games</Text>
                        <View style={styles.recentGames}>
                            {recentGames.map((game) => (
                                <View key={game.id} style={styles.recentGameRow}>
                                    <View style={styles.recentGameInfo}>
                                        <View style={styles.recentModeIconBox}>
                                            <Ionicons
                                                name={GameModes[game.mode]?.icon as any || 'game-controller'}
                                                size={16}
                                                color="#fff"
                                            />
                                        </View>
                                        <View>
                                            <Text style={styles.recentModeName}>
                                                {GameModes[game.mode]?.name || game.mode}
                                            </Text>
                                            <Text style={styles.recentDate}>
                                                {new Date(game.date).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.recentGameStats}>
                                        <Text style={styles.recentScore}>{game.score}</Text>
                                        <Text style={styles.recentAccuracy}>{game.accuracy.toFixed(0)}%</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {totalGames === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="analytics-outline" size={48} color={Colors.textMuted} />
                        <Text style={styles.emptyTitle}>No games yet</Text>
                        <Text style={styles.emptyText}>
                            Play some games to see your stats here!
                        </Text>
                    </View>
                )}
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
        paddingTop: Spacing['2xl'],
    },
    title: {
        fontSize: Fonts['3xl'],
        fontWeight: Fonts.bold,
        color: Colors.text,
        marginBottom: Spacing['2xl'],
    },
    overviewGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: Spacing['2xl'],
    },
    overviewCard: {
        width: '48%',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    overviewValue: {
        fontSize: Fonts['2xl'],
        fontWeight: Fonts.bold,
        color: Colors.text,
        marginTop: Spacing.sm,
    },
    overviewLabel: {
        fontSize: Fonts.xs,
        color: Colors.textMuted,
        marginTop: Spacing.xs,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: Fonts.lg,
        fontWeight: Fonts.semibold,
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    modeStats: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.xl,
        padding: Spacing.md,
        marginBottom: Spacing['2xl'],
    },
    modeStatRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.surfaceLight,
    },
    modeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    modeIconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modeName: {
        fontSize: Fonts.base,
        fontWeight: Fonts.medium,
        color: Colors.text,
    },
    modeNumbers: {
        alignItems: 'flex-end',
    },
    modeGames: {
        fontSize: Fonts.sm,
        color: Colors.textMuted,
    },
    modeBest: {
        fontSize: Fonts.sm,
        fontWeight: Fonts.semibold,
        color: Colors.yellow,
    },
    recentGames: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.xl,
        padding: Spacing.md,
        marginBottom: Spacing['2xl'],
    },
    recentGameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.surfaceLight,
    },
    recentGameInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    recentModeIconBox: {
        width: 28,
        height: 28,
        borderRadius: 6,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recentModeName: {
        fontSize: Fonts.base,
        fontWeight: Fonts.medium,
        color: Colors.text,
    },
    recentDate: {
        fontSize: Fonts.xs,
        color: Colors.textMuted,
    },
    recentGameStats: {
        alignItems: 'flex-end',
    },
    recentScore: {
        fontSize: Fonts.lg,
        fontWeight: Fonts.bold,
        color: Colors.text,
    },
    recentAccuracy: {
        fontSize: Fonts.sm,
        color: Colors.correct,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: Spacing['3xl'],
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: Spacing.md,
    },
    emptyTitle: {
        fontSize: Fonts.xl,
        fontWeight: Fonts.semibold,
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    emptyText: {
        fontSize: Fonts.base,
        color: Colors.textMuted,
        textAlign: 'center',
    },
});
