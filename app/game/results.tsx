import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Animated,
    Share,
    Dimensions,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Fonts, Spacing, BorderRadius, GameModes, Difficulties } from '@/constants/Theme';
import { useGameStore, useSettingsStore } from '@/stores/gameStore';
import { formatTime, formatNumber } from '@/lib/math';

const { width } = Dimensions.get('window');

export default function ResultsScreen() {
    const router = useRouter();
    const {
        mode,
        difficulty,
        correctCount,
        wrongCount,
        score,
        elapsedTime,
        resetGame,
    } = useGameStore();

    const { hapticEnabled } = useSettingsStore();

    const scaleAnim = useRef(new Animated.Value(0)).current;

    const totalCount = correctCount + wrongCount;
    const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    const modeInfo = GameModes[mode];
    const difficultyInfo = Difficulties[difficulty];

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 40,
            friction: 6,
            useNativeDriver: true,
        }).start();

        if (hapticEnabled && accuracy >= 70) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    }, []);

    const handlePlayAgain = () => {
        resetGame();
        router.replace(`/game/${mode}`);
    };

    const handleGoHome = () => {
        resetGame();
        router.replace('/');
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `🧮 Mental Math!\n\n🏆 Score: ${formatNumber(score)}\n✅ ${correctCount} correct\n⏱️ ${formatTime(elapsedTime)}\n📊 ${accuracy}%`,
            });
        } catch (error) {
            console.log('Share error:', error);
        }
    };

    const getPerformance = () => {
        if (accuracy >= 100) return { emoji: '🏆', text: 'PERFECT!', color: '#FFD700' };
        if (accuracy >= 90) return { emoji: '🌟', text: 'Amazing!', color: '#F59E0B' };
        if (accuracy >= 80) return { emoji: '🎉', text: 'Great!', color: '#10B981' };
        if (accuracy >= 70) return { emoji: '💪', text: 'Good!', color: '#3B82F6' };
        if (accuracy >= 50) return { emoji: '👍', text: 'Nice Try!', color: '#8B5CF6' };
        return { emoji: '💡', text: 'Keep Going!', color: '#EC4899' };
    };

    const perf = getPerformance();

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.background}
            />

            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    bounces={true}
                >
                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        {/* Trophy */}
                        <View style={styles.trophyWrap}>
                            <Text style={styles.trophyEmoji}>{perf.emoji}</Text>
                        </View>

                        <Text style={[styles.perfText, { color: perf.color }]}>
                            {perf.text}
                        </Text>

                        {/* Score Card */}
                        <View style={styles.scoreCard}>
                            <Text style={styles.scoreLabel}>SCORE</Text>
                            <Text style={styles.scoreValue}>{formatNumber(score)}</Text>
                            <View style={styles.modeBadge}>
                                <Text style={styles.badgeText}>{modeInfo.icon} {modeInfo.name}</Text>
                            </View>
                        </View>

                        {/* Stats */}
                        <View style={styles.statsRow}>
                            <View style={styles.statBox}>
                                <Text style={styles.statEmoji}>✅</Text>
                                <Text style={styles.statNum}>{correctCount}</Text>
                                <Text style={styles.statLabel}>Correct</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statEmoji}>❌</Text>
                                <Text style={styles.statNum}>{wrongCount}</Text>
                                <Text style={styles.statLabel}>Wrong</Text>
                            </View>
                        </View>

                        <View style={styles.statsRow}>
                            <View style={styles.statBox}>
                                <Text style={styles.statEmoji}>⏱️</Text>
                                <Text style={styles.statNum}>{formatTime(elapsedTime)}</Text>
                                <Text style={styles.statLabel}>Time</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statEmoji}>📊</Text>
                                <Text style={styles.statNum}>{accuracy}%</Text>
                                <Text style={styles.statLabel}>Accuracy</Text>
                            </View>
                        </View>

                        {/* Buttons */}
                        <TouchableOpacity style={styles.primaryBtn} onPress={handlePlayAgain}>
                            <Text style={styles.primaryBtnText}>🔄 Play Again</Text>
                        </TouchableOpacity>

                        <View style={styles.secondaryRow}>
                            <TouchableOpacity style={styles.secondaryBtn} onPress={handleShare}>
                                <Ionicons name="share-social" size={20} color="#fff" />
                                <Text style={styles.secondaryBtnText}>Share</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.secondaryBtn} onPress={handleGoHome}>
                                <Ionicons name="home" size={20} color="#fff" />
                                <Text style={styles.secondaryBtnText}>Home</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    safeArea: {
        flex: 1,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.xl,
        paddingTop: Spacing['2xl'],
        paddingBottom: Spacing['3xl'],
    },
    // Trophy
    trophyWrap: {
        alignSelf: 'center',
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    trophyEmoji: {
        fontSize: 48,
    },
    perfText: {
        fontSize: Fonts['2xl'],
        fontWeight: Fonts.extrabold,
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    // Score
    scoreCard: {
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
        padding: Spacing.xl,
        marginBottom: Spacing.xl,
    },
    scoreLabel: {
        fontSize: Fonts.xs,
        fontWeight: Fonts.semibold,
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: 2,
    },
    scoreValue: {
        fontSize: Fonts['6xl'],
        fontWeight: Fonts.extrabold,
        color: '#fff',
    },
    modeBadge: {
        marginTop: Spacing.sm,
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: Fonts.sm,
        fontWeight: Fonts.semibold,
        color: '#fff',
    },
    // Stats
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.md,
    },
    statBox: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        padding: Spacing.lg,
        alignItems: 'center',
    },
    statEmoji: {
        fontSize: 22,
        marginBottom: 4,
    },
    statNum: {
        fontSize: Fonts.xl,
        fontWeight: Fonts.bold,
        color: '#fff',
    },
    statLabel: {
        fontSize: Fonts.xs,
        color: 'rgba(255,255,255,0.7)',
    },
    // Buttons
    primaryBtn: {
        backgroundColor: '#fff',
        paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        marginTop: Spacing.lg,
        marginBottom: Spacing.md,
    },
    primaryBtnText: {
        fontSize: Fonts.lg,
        fontWeight: Fonts.bold,
        color: '#7C3AED',
    },
    secondaryRow: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    secondaryBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
    },
    secondaryBtnText: {
        fontSize: Fonts.base,
        fontWeight: Fonts.semibold,
        color: '#fff',
    },
});
