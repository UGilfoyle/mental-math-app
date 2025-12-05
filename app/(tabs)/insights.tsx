import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, BorderRadius, GameModes, GameMode } from '@/constants/Theme';
import { useGameStore } from '@/stores/gameStore';
import { formatTime } from '@/lib/math';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 48;

type TimeRange = '7d' | '30d' | 'all';

export default function InsightsScreen() {
    const { history } = useGameStore();
    const [timeRange, setTimeRange] = useState<TimeRange>('7d');

    // Filter games by time range
    const filteredGames = useMemo(() => {
        if (timeRange === 'all') return history;
        const days = timeRange === '7d' ? 7 : 30;
        const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
        return history.filter(g => new Date(g.date).getTime() > cutoff);
    }, [history, timeRange]);

    // Calculate stats
    const stats = useMemo(() => {
        const totalGames = filteredGames.length;
        const totalProblems = filteredGames.reduce((sum, g) => sum + g.totalCount, 0);
        const totalCorrect = filteredGames.reduce((sum, g) => sum + g.correctCount, 0);
        const totalTime = filteredGames.reduce((sum, g) => sum + g.timeMs, 0);
        const accuracy = totalProblems > 0 ? Math.round((totalCorrect / totalProblems) * 100) : 0;
        const avgScore = totalGames > 0
            ? Math.round(filteredGames.reduce((sum, g) => sum + g.score, 0) / totalGames)
            : 0;

        return { totalGames, totalProblems, totalCorrect, totalTime, accuracy, avgScore };
    }, [filteredGames]);

    // Daily activity (last 7 days)
    const dailyActivity = useMemo(() => {
        const days: { date: string; count: number; correct: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayGames = history.filter(g =>
                new Date(g.date).toISOString().split('T')[0] === dateStr
            );
            days.push({
                date: d.toLocaleDateString('en', { weekday: 'short' }),
                count: dayGames.length,
                correct: dayGames.reduce((sum, g) => sum + g.correctCount, 0),
            });
        }
        return days;
    }, [history]);

    // Mode performance (only classic modes for now)
    const modeStats = useMemo(() => {
        const modes: Record<string, { games: number; avgAccuracy: number }> = {
            practice: { games: 0, avgAccuracy: 0 },
            speedrun: { games: 0, avgAccuracy: 0 },
            timeattack: { games: 0, avgAccuracy: 0 },
            survival: { games: 0, avgAccuracy: 0 },
        };

        Object.keys(modes).forEach(mode => {
            const modeGames = filteredGames.filter(g => g.mode === mode);
            modes[mode as GameMode].games = modeGames.length;
            if (modeGames.length > 0) {
                const total = modeGames.reduce((sum, g) => sum + g.totalCount, 0);
                const correct = modeGames.reduce((sum, g) => sum + g.correctCount, 0);
                modes[mode as GameMode].avgAccuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
            }
        });

        return modes;
    }, [filteredGames]);

    // Calculate streak
    const streak = useMemo(() => {
        let currentStreak = 0;
        let checkDate = new Date();

        for (let i = 0; i < 365; i++) {
            const dateStr = checkDate.toISOString().split('T')[0];
            const hasGame = history.some(g =>
                new Date(g.date).toISOString().split('T')[0] === dateStr
            );

            if (hasGame) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else if (i === 0) {
                // Allow today to be missing
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        return currentStreak;
    }, [history]);

    const maxActivity = Math.max(...dailyActivity.map(d => d.count), 1);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.background}
            />

            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <Ionicons name="analytics" size={28} color="#fff" />
                            <Text style={styles.title}>Insights</Text>
                        </View>
                        <View style={styles.streakBadge}>
                            <Ionicons name="flame" size={16} color="#F97316" />
                            <Text style={styles.streakText}>{streak} day streak</Text>
                        </View>
                    </View>

                    {/* Time Range Tabs */}
                    <View style={styles.tabs}>
                        {(['7d', '30d', 'all'] as TimeRange[]).map(range => (
                            <TouchableOpacity
                                key={range}
                                style={[styles.tab, timeRange === range && styles.tabActive]}
                                onPress={() => setTimeRange(range)}
                            >
                                <Text style={[styles.tabText, timeRange === range && styles.tabTextActive]}>
                                    {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'All Time'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Overview Stats */}
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <Ionicons name="game-controller" size={24} color="#A855F7" />
                            <Text style={styles.statValue}>{stats.totalGames}</Text>
                            <Text style={styles.statLabel}>Games</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                            <Text style={styles.statValue}>{stats.totalCorrect}</Text>
                            <Text style={styles.statLabel}>Correct</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Ionicons name="analytics" size={24} color="#3B82F6" />
                            <Text style={styles.statValue}>{stats.accuracy}%</Text>
                            <Text style={styles.statLabel}>Accuracy</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Ionicons name="time" size={24} color="#F59E0B" />
                            <Text style={styles.statValue}>{formatTime(stats.totalTime)}</Text>
                            <Text style={styles.statLabel}>Time</Text>
                        </View>
                    </View>

                    {/* Activity Chart */}
                    <View style={styles.chartCard}>
                        <View style={styles.chartHeader}>
                            <Ionicons name="trending-up" size={20} color="#fff" />
                            <Text style={styles.chartTitle}>Weekly Activity</Text>
                        </View>
                        <View style={styles.barChart}>
                            {dailyActivity.map((day, i) => (
                                <View key={i} style={styles.barContainer}>
                                    <View style={styles.barWrapper}>
                                        <View
                                            style={[
                                                styles.bar,
                                                { height: `${(day.count / maxActivity) * 100}%` }
                                            ]}
                                        />
                                    </View>
                                    <Text style={styles.barLabel}>{day.date}</Text>
                                    <Text style={styles.barValue}>{day.count}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Mode Performance */}
                    <View style={styles.chartCard}>
                        <View style={styles.chartHeader}>
                            <Ionicons name="podium" size={20} color="#fff" />
                            <Text style={styles.chartTitle}>Mode Performance</Text>
                        </View>
                        {Object.keys(modeStats).map(mode => {
                            const info = GameModes[mode as keyof typeof GameModes];
                            const stat = modeStats[mode];
                            if (!info) return null;
                            return (
                                <View key={mode} style={styles.modeRow}>
                                    <View style={styles.modeIconBox}>
                                        <Ionicons name={info.icon as any} size={18} color="#fff" />
                                    </View>
                                    <Text style={styles.modeName}>{info.name}</Text>
                                    <View style={styles.modeStats}>
                                        <Text style={styles.modeGames}>{stat.games} games</Text>
                                        <View style={styles.accuracyBar}>
                                            <View
                                                style={[
                                                    styles.accuracyFill,
                                                    { width: `${stat.avgAccuracy}%` }
                                                ]}
                                            />
                                        </View>
                                        <Text style={styles.modeAccuracy}>{stat.avgAccuracy}%</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    {/* Tips */}
                    <View style={styles.tipCard}>
                        <Ionicons name="bulb" size={24} color="#F59E0B" />
                        <Text style={styles.tipText}>
                            {stats.accuracy >= 90
                                ? "Amazing accuracy! Try harder difficulty levels."
                                : stats.accuracy >= 70
                                    ? "Good progress! Practice weak areas to improve."
                                    : "Keep practicing! Consistency is key to improvement."
                            }
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    background: { ...StyleSheet.absoluteFillObject },
    safeArea: { flex: 1 },
    scroll: { flex: 1 },
    content: { padding: Spacing.xl, paddingBottom: Spacing['3xl'] },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    title: {
        fontSize: Fonts['2xl'],
        fontWeight: Fonts.extrabold,
        color: '#fff',
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(251, 191, 36, 0.3)',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        gap: 4,
    },
    streakEmoji: { fontSize: 16 },
    streakText: { fontSize: Fonts.sm, fontWeight: Fonts.semibold, color: '#fff' },

    // Tabs
    tabs: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: BorderRadius.lg,
        padding: 4,
        marginBottom: Spacing.xl,
    },
    tab: {
        flex: 1,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    tabActive: { backgroundColor: '#fff' },
    tabText: { fontSize: Fonts.sm, fontWeight: Fonts.medium, color: 'rgba(255,255,255,0.7)' },
    tabTextActive: { color: '#7C3AED' },

    // Stats Grid
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    statCard: {
        width: '47%',
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        padding: Spacing.lg,
        alignItems: 'center',
    },
    statEmoji: { fontSize: 24, marginBottom: 4 },
    statValue: { fontSize: Fonts.xl, fontWeight: Fonts.bold, color: '#fff' },
    statLabel: { fontSize: Fonts.xs, color: 'rgba(255,255,255,0.7)' },

    // Chart Card
    chartCard: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        padding: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    chartHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    chartTitle: {
        fontSize: Fonts.lg,
        fontWeight: Fonts.bold,
        color: '#fff',
    },

    // Bar Chart
    barChart: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 120,
    },
    barContainer: { alignItems: 'center', flex: 1 },
    barWrapper: {
        width: 24,
        height: 80,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    bar: {
        width: '100%',
        backgroundColor: '#10B981',
        borderRadius: 12,
        minHeight: 4,
    },
    barLabel: { fontSize: Fonts.xs, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
    barValue: { fontSize: Fonts.xs, fontWeight: Fonts.bold, color: '#fff' },

    // Mode Performance
    modeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    modeIconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
    },
    modeName: { fontSize: Fonts.base, fontWeight: Fonts.medium, color: '#fff', width: 90 },
    modeStats: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    modeGames: { fontSize: Fonts.xs, color: 'rgba(255,255,255,0.6)', width: 55 },
    accuracyBar: {
        flex: 1,
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    accuracyFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 4 },
    modeAccuracy: { fontSize: Fonts.sm, fontWeight: Fonts.bold, color: '#fff', width: 40, textAlign: 'right' },

    // Tip
    tipCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    tipEmoji: { fontSize: 24 },
    tipText: { flex: 1, fontSize: Fonts.sm, color: 'rgba(255,255,255,0.8)', lineHeight: 20 },
});
