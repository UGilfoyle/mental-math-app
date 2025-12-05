import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Animated,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Fonts, Spacing, BorderRadius, GameModes } from '@/constants/Theme';
import { useSettingsStore } from '@/stores/gameStore';

const { width } = Dimensions.get('window');

// Generate a comparison problem
function generateComparison() {
    const ops = ['+', '-', '×'];
    const op1 = ops[Math.floor(Math.random() * ops.length)];
    const op2 = ops[Math.floor(Math.random() * ops.length)];

    const a1 = Math.floor(Math.random() * 12) + 1;
    const b1 = Math.floor(Math.random() * 12) + 1;
    const a2 = Math.floor(Math.random() * 12) + 1;
    const b2 = Math.floor(Math.random() * 12) + 1;

    const calc = (a: number, b: number, op: string) => {
        if (op === '+') return a + b;
        if (op === '-') return a - b;
        return a * b;
    };

    const left = calc(a1, b1, op1);
    const right = calc(a2, b2, op2);

    return {
        leftDisplay: `${a1} ${op1} ${b1}`,
        rightDisplay: `${a2} ${op2} ${b2}`,
        leftValue: left,
        rightValue: right,
        answer: left > right ? 'left' : left < right ? 'right' : 'equal',
    };
}

export default function CompareGame() {
    const router = useRouter();
    const { hapticEnabled } = useSettingsStore();

    const [problem, setProblem] = useState(generateComparison());
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [problemCount, setProblemCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isGameOver, setIsGameOver] = useState(false);

    const scaleAnim = useRef(new Animated.Value(1)).current;
    const leftShake = useRef(new Animated.Value(0)).current;
    const rightShake = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (timeLeft <= 0) {
            setIsGameOver(true);
            return;
        }
        const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleAnswer = useCallback((choice: 'left' | 'right' | 'equal') => {
        if (isGameOver) return;

        const isCorrect = choice === problem.answer;

        if (hapticEnabled) {
            Haptics.notificationAsync(isCorrect
                ? Haptics.NotificationFeedbackType.Success
                : Haptics.NotificationFeedbackType.Error);
        }

        if (isCorrect) {
            setFeedback('correct');
            setScore(s => s + 10 + streak * 2);
            setStreak(s => s + 1);
            Animated.sequence([
                Animated.timing(scaleAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
                Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
            ]).start();
        } else {
            setFeedback('wrong');
            setStreak(0);
            const shakeAnim = choice === 'left' ? leftShake : rightShake;
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
            ]).start();
        }

        setProblemCount(c => c + 1);
        setTimeout(() => {
            setFeedback(null);
            setProblem(generateComparison());
        }, 400);
    }, [problem, isGameOver, streak, hapticEnabled]);

    const modeInfo = GameModes.compare;

    if (isGameOver) {
        return (
            <View style={styles.container}>
                <LinearGradient colors={modeInfo.gradient as [string, string]} style={styles.background} />
                <SafeAreaView style={styles.resultContainer}>
                    <View style={styles.gameOverIcon}>
                        <Ionicons name="swap-horizontal" size={48} color="#fff" />
                    </View>
                    <Text style={styles.gameOverTitle}>Time's Up!</Text>
                    <View style={styles.resultCard}>
                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Score</Text>
                            <Text style={styles.resultValue}>{score}</Text>
                        </View>
                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Problems</Text>
                            <Text style={styles.resultValue}>{problemCount}</Text>
                        </View>
                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Best Streak</Text>
                            <View style={styles.streakValue}>
                                <Text style={styles.resultValue}>{streak}</Text>
                                <Ionicons name="flame" size={18} color="#F97316" />
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.playAgainBtn} onPress={() => {
                        setScore(0);
                        setStreak(0);
                        setProblemCount(0);
                        setTimeLeft(60);
                        setIsGameOver(false);
                        setProblem(generateComparison());
                    }}>
                        <Text style={styles.playAgainText}>Play Again</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.homeBtn} onPress={() => router.back()}>
                        <Text style={styles.homeBtnText}>← Home</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={modeInfo.gradient as [string, string]} style={styles.background} />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.timerBox}>
                        <Text style={styles.timer}>{timeLeft}s</Text>
                    </View>
                    <View style={styles.scoreBox}>
                        <Text style={styles.score}>{score}</Text>
                    </View>
                </View>

                {/* Streak */}
                {streak > 1 && (
                    <View style={styles.streakBar}>
                        <Ionicons name="flame" size={16} color="#F97316" />
                        <Text style={styles.streakText}>{streak} streak!</Text>
                    </View>
                )}

                {/* Question */}
                <Text style={styles.question}>Which is bigger?</Text>

                {/* Comparison Cards */}
                <View style={styles.compareContainer}>
                    <TouchableOpacity
                        onPress={() => handleAnswer('left')}
                        activeOpacity={0.8}
                    >
                        <Animated.View style={[
                            styles.compareCard,
                            { transform: [{ translateX: leftShake }, { scale: scaleAnim }] },
                            feedback === 'correct' && problem.answer === 'left' && styles.correctCard,
                            feedback === 'wrong' && problem.answer !== 'left' && styles.wrongCard,
                        ]}>
                            <Text style={styles.expressionText}>{problem.leftDisplay}</Text>
                            {feedback && problem.answer === 'left' && (
                                <Text style={styles.answerReveal}>= {problem.leftValue}</Text>
                            )}
                        </Animated.View>
                    </TouchableOpacity>

                    <Text style={styles.vsText}>VS</Text>

                    <TouchableOpacity
                        onPress={() => handleAnswer('right')}
                        activeOpacity={0.8}
                    >
                        <Animated.View style={[
                            styles.compareCard,
                            { transform: [{ translateX: rightShake }, { scale: scaleAnim }] },
                            feedback === 'correct' && problem.answer === 'right' && styles.correctCard,
                            feedback === 'wrong' && problem.answer !== 'right' && styles.wrongCard,
                        ]}>
                            <Text style={styles.expressionText}>{problem.rightDisplay}</Text>
                            {feedback && problem.answer === 'right' && (
                                <Text style={styles.answerReveal}>= {problem.rightValue}</Text>
                            )}
                        </Animated.View>
                    </TouchableOpacity>
                </View>

                {/* Equal Button */}
                <TouchableOpacity
                    style={styles.equalBtn}
                    onPress={() => handleAnswer('equal')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.equalText}>=</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    background: { ...StyleSheet.absoluteFillObject },
    safeArea: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    closeBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center',
    },
    timerBox: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 20, paddingVertical: 10,
        borderRadius: 20,
    },
    timer: { fontSize: 20, fontWeight: '700', color: '#fff' },
    scoreBox: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 20, paddingVertical: 10,
        borderRadius: 20,
    },
    score: { fontSize: 20, fontWeight: '700', color: '#fff' },
    streakBar: {
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,200,0,0.3)',
        paddingHorizontal: 16, paddingVertical: 6,
        borderRadius: 20, marginBottom: 16,
    },
    streakText: { fontSize: 16, fontWeight: '600', color: '#fff' },
    question: {
        fontSize: 26, fontWeight: '800', color: '#fff',
        textAlign: 'center', marginBottom: 20,
    },
    compareContainer: {
        flex: 1,
        justifyContent: 'center',
        gap: 16,
        paddingHorizontal: 4,
    },
    compareCard: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        paddingVertical: 36,
        paddingHorizontal: 24,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    correctCard: {
        backgroundColor: 'rgba(16,185,129,0.4)',
        borderColor: '#10B981',
    },
    wrongCard: {
        backgroundColor: 'rgba(239,68,68,0.4)',
        borderColor: '#EF4444',
    },
    expressionText: {
        fontSize: 40, fontWeight: '800', color: '#fff',
    },
    answerReveal: {
        fontSize: 18, color: 'rgba(255,255,255,0.8)', marginTop: 10,
    },
    vsText: {
        fontSize: 22, fontWeight: '800', color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
    },
    equalBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        width: 60,
        height: 60,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: 16,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    equalText: { fontSize: 32, fontWeight: '800', color: '#fff' },
    // Results
    resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    gameOverIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    gameOverTitle: { fontSize: 32, fontWeight: '800', color: '#fff', marginBottom: 24 },
    resultCard: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 24, padding: 24, width: '100%', marginBottom: 24,
    },
    resultRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    resultLabel: { fontSize: 18, color: 'rgba(255,255,255,0.8)' },
    resultValue: { fontSize: 20, fontWeight: '700', color: '#fff' },
    streakValue: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    playAgainBtn: {
        backgroundColor: '#fff', paddingHorizontal: 40, paddingVertical: 16,
        borderRadius: 30, marginBottom: 16,
    },
    playAgainText: { fontSize: 18, fontWeight: '700', color: '#14B8A6' },
    homeBtn: { padding: 12 },
    homeBtnText: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
});
