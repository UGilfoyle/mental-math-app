import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Animated,
    Dimensions,
    Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Fonts, Spacing, BorderRadius, GameModes, GameMode } from '@/constants/Theme';
import { useGameStore, useSettingsStore } from '@/stores/gameStore';
import { formatTime } from '@/lib/math';
import { AgeGroup } from '@/lib/problems';

const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700;
const BUTTON_SIZE = Math.floor((width - 60) / 3);

// Age group display info
const AGE_GROUP_INFO: Record<AgeGroup, { emoji: string; name: string }> = {
    kids: { emoji: '🌱', name: 'Kids' },
    junior: { emoji: '🌿', name: 'Junior' },
    teen: { emoji: '🌳', name: 'Teen' },
    adult: { emoji: '🎓', name: 'Adult' },
    expert: { emoji: '🏆', name: 'Expert' },
};

export default function GameScreen() {
    const { mode, ageGroup: ageGroupParam } = useLocalSearchParams<{ mode: GameMode; ageGroup?: string }>();
    const router = useRouter();
    const ageGroup = (ageGroupParam as AgeGroup) || 'kids';
    const ageInfo = AGE_GROUP_INFO[ageGroup];

    const {
        currentProblem,
        problemIndex,
        correctCount,
        wrongCount,
        lives,
        elapsedTime,
        isFinished,
        difficulty,
        startGame,
        submitAnswer,
        updateTime,
    } = useGameStore();

    const { hapticEnabled } = useSettingsStore();

    const [answer, setAnswer] = useState('');
    const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        startGame();
        const startTime = Date.now();
        timerRef.current = setInterval(() => {
            updateTime(Date.now() - startTime);
        }, 100);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    useEffect(() => {
        if (isFinished) {
            router.replace('/game/results');
        }
    }, [isFinished]);

    const handleNumberPress = useCallback((num: string) => {
        if (hapticEnabled && Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        if (num === 'backspace') {
            setAnswer(prev => prev.slice(0, -1));
        } else if (num === 'negative') {
            setAnswer(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev);
        } else {
            setAnswer(prev => prev.length < 6 ? prev + num : prev);
        }
    }, [hapticEnabled]);

    const handleSubmit = useCallback(() => {
        if (!answer || !currentProblem) return;

        const userAnswer = parseInt(answer, 10);
        if (isNaN(userAnswer)) return;

        const { correct } = submitAnswer(userAnswer);

        if (correct) {
            setShowFeedback('correct');
            if (hapticEnabled && Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            Animated.sequence([
                Animated.timing(scaleAnim, { toValue: 1.05, duration: 100, useNativeDriver: true }),
                Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
            ]).start();
        } else {
            setShowFeedback('wrong');
            if (hapticEnabled && Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
            ]).start();
        }

        setAnswer('');
        setTimeout(() => setShowFeedback(null), 400);
    }, [answer, currentProblem, submitAnswer, hapticEnabled]);

    const handleExit = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        router.back();
    };

    const modeInfo = GameModes[mode || 'practice'];
    const displayTime = mode === 'timeattack' ? Math.max(0, 60000 - elapsedTime) : elapsedTime;
    const isLowTime = mode === 'timeattack' && displayTime < 10000;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={modeInfo.gradient as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.background}
            />

            {/* Decorative circles */}
            <View style={[styles.bubble, { top: height * 0.15, left: -50 }]} />
            <View style={[styles.bubble, styles.bubbleSmall, { top: height * 0.4, right: -30 }]} />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleExit} style={styles.closeBtn}>
                        <Ionicons name="close" size={28} color="rgba(255,255,255,0.9)" />
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeIcon}>{modeInfo.icon}</Text>
                            <Text style={styles.badgeText}>{modeInfo.name}</Text>
                        </View>
                        <View style={styles.badge}>
                            <Text style={styles.badgeIcon}>{ageInfo.emoji}</Text>
                            <Text style={styles.badgeText}>{ageInfo.name}</Text>
                        </View>
                    </View>

                    {mode === 'survival' ? (
                        <View style={styles.lives}>
                            {[0, 1, 2].map(i => (
                                <Text key={i} style={styles.lifeIcon}>
                                    {i < lives ? '❤️' : '🖤'}
                                </Text>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.placeholder} />
                    )}
                </View>

                {/* Stats Bar */}
                <View style={styles.statsBar}>
                    <View style={styles.stat}>
                        <Text style={styles.statIcon}>✅</Text>
                        <Text style={styles.statText}>{correctCount}</Text>
                    </View>
                    {mode !== 'practice' && (
                        <View style={[styles.stat, isLowTime && styles.statWarning]}>
                            <Text style={styles.statIcon}>⏱️</Text>
                            <Text style={styles.statText}>{formatTime(displayTime)}</Text>
                        </View>
                    )}
                    {mode === 'speedrun' && (
                        <View style={styles.stat}>
                            <Text style={styles.statIcon}>📊</Text>
                            <Text style={styles.statText}>{problemIndex}/20</Text>
                        </View>
                    )}
                </View>

                {/* Problem Card */}
                <Animated.View
                    style={[
                        styles.problemCard,
                        { transform: [{ translateX: shakeAnim }, { scale: scaleAnim }] },
                        showFeedback === 'correct' && styles.cardCorrect,
                        showFeedback === 'wrong' && styles.cardWrong,
                    ]}
                >
                    <View style={styles.equation}>
                        <Text style={styles.problemText}>
                            {currentProblem?.displayProblem || '...'}
                        </Text>
                        <Text style={styles.equalsSign}>=</Text>
                        <View style={styles.answerBox}>
                            <Text style={[
                                styles.answerText,
                                !answer && styles.answerPlaceholder
                            ]}>
                                {answer || '?'}
                            </Text>
                        </View>
                    </View>
                    {showFeedback && (
                        <Text style={styles.feedbackEmoji}>
                            {showFeedback === 'correct' ? '🎉' : '😅'}
                        </Text>
                    )}
                </Animated.View>

                {/* Number Pad */}
                <View style={styles.numPad}>
                    {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['±', '0', '⌫']].map((row, ri) => (
                        <View key={ri} style={styles.numRow}>
                            {row.map((num) => (
                                <TouchableOpacity
                                    key={num}
                                    style={styles.numBtn}
                                    onPress={() => {
                                        if (num === '±') handleNumberPress('negative');
                                        else if (num === '⌫') handleNumberPress('backspace');
                                        else handleNumberPress(num);
                                    }}
                                    activeOpacity={0.7}
                                >
                                    {num === '⌫' ? (
                                        <Ionicons name="backspace-outline" size={28} color="#fff" />
                                    ) : (
                                        <Text style={styles.numText}>{num}</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    ))}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitBtn, !answer && styles.submitDisabled]}
                    onPress={handleSubmit}
                    disabled={!answer}
                    activeOpacity={0.9}
                >
                    <Text style={styles.submitText}>Check! ✓</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    background: { ...StyleSheet.absoluteFillObject },
    bubble: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    bubbleSmall: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 20,
    },
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    closeBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flexDirection: 'row',
        gap: 8,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    badgeIcon: { fontSize: 14 },
    badgeText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#fff',
    },
    lives: { flexDirection: 'row', gap: 2 },
    lifeIcon: { fontSize: 20 },
    placeholder: { width: 44 },
    // Stats
    statsBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 12,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.18)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    statWarning: { backgroundColor: 'rgba(239,68,68,0.4)' },
    statIcon: { fontSize: 16 },
    statText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    // Problem Card
    problemCard: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.25)',
        paddingVertical: isSmallScreen ? 16 : 24,
        paddingHorizontal: 16,
        marginBottom: 12,
        alignItems: 'center',
    },
    cardCorrect: {
        backgroundColor: 'rgba(16,185,129,0.3)',
        borderColor: 'rgba(16,185,129,0.5)',
    },
    cardWrong: {
        backgroundColor: 'rgba(239,68,68,0.3)',
        borderColor: 'rgba(239,68,68,0.5)',
    },
    equation: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    problemText: {
        fontSize: isSmallScreen ? 36 : 44,
        fontWeight: '800',
        color: '#fff',
    },
    equalsSign: {
        fontSize: 40,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.7)',
    },
    answerBox: {
        minWidth: 80,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.35)',
    },
    answerText: {
        fontSize: 44,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
    },
    answerPlaceholder: {
        color: 'rgba(255,255,255,0.4)',
    },
    feedbackEmoji: {
        fontSize: 36,
        marginTop: 12,
    },
    // Number Pad
    numPad: {
        gap: isSmallScreen ? 6 : 8,
        marginBottom: 8,
    },
    numRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: isSmallScreen ? 6 : 8,
    },
    numBtn: {
        width: BUTTON_SIZE,
        height: isSmallScreen ? BUTTON_SIZE * 0.6 : BUTTON_SIZE * 0.7,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    numText: {
        fontSize: isSmallScreen ? 26 : 30,
        fontWeight: '600',
        color: '#fff',
    },
    submitBtn: {
        backgroundColor: '#fff',
        paddingVertical: 14,
        borderRadius: 24,
        alignItems: 'center',
        marginBottom: 12,
    },
    submitDisabled: {
        backgroundColor: 'rgba(255,255,255,0.25)',
    },
    submitText: {
        fontSize: 22,
        fontWeight: '700',
        color: '#7C3AED',
    },
});
