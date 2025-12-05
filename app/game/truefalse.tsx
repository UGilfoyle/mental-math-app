import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { GameModes } from '@/constants/Theme';
import { useSettingsStore } from '@/stores/gameStore';

// Generate a true/false problem
function generateTrueFalse() {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const a = Math.floor(Math.random() * 12) + 1;
    const b = Math.floor(Math.random() * 12) + 1;

    const correctAnswer = op === '+' ? a + b : op === '-' ? a - b : a * b;

    // 50% chance of showing wrong answer
    const isCorrect = Math.random() > 0.5;
    const displayAnswer = isCorrect
        ? correctAnswer
        : correctAnswer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);

    return {
        display: `${a} ${op} ${b} = ${displayAnswer}`,
        isCorrect,
        correctAnswer,
    };
}

export default function TrueFalseGame() {
    const router = useRouter();
    const { hapticEnabled } = useSettingsStore();

    const [problem, setProblem] = useState(generateTrueFalse());
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [problemCount, setProblemCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isGameOver, setIsGameOver] = useState(false);

    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (timeLeft <= 0) {
            setIsGameOver(true);
            return;
        }
        const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleAnswer = useCallback((userChoice: boolean) => {
        if (isGameOver) return;

        const isCorrect = userChoice === problem.isCorrect;

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
        }

        setProblemCount(c => c + 1);
        setTimeout(() => {
            setFeedback(null);
            setProblem(generateTrueFalse());
        }, 500);
    }, [problem, isGameOver, streak, hapticEnabled]);

    const modeInfo = GameModes.truefalse;

    if (isGameOver) {
        return (
            <View style={styles.container}>
                <LinearGradient colors={modeInfo.gradient as [string, string]} style={styles.background} />
                <SafeAreaView style={styles.resultContainer}>
                    <View style={styles.gameOverIcon}>
                        <Ionicons name="checkmark-done" size={48} color="#fff" />
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
                    </View>
                    <TouchableOpacity style={styles.playAgainBtn} onPress={() => {
                        setScore(0);
                        setStreak(0);
                        setProblemCount(0);
                        setTimeLeft(60);
                        setIsGameOver(false);
                        setProblem(generateTrueFalse());
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
                <Text style={styles.question}>Is this correct?</Text>

                {/* Problem Card */}
                <View style={styles.problemContainer}>
                    <Animated.View style={[
                        styles.problemCard,
                        { transform: [{ scale: scaleAnim }] },
                        feedback === 'correct' && styles.correctCard,
                        feedback === 'wrong' && styles.wrongCard,
                    ]}>
                        <Text style={styles.problemText}>{problem.display}</Text>
                        {feedback && !problem.isCorrect && (
                            <Text style={styles.correction}>
                                Correct: {problem.correctAnswer}
                            </Text>
                        )}
                    </Animated.View>
                </View>

                {/* Answer Buttons */}
                <View style={styles.buttonsRow}>
                    <TouchableOpacity
                        style={[styles.answerBtn, styles.trueBtn]}
                        onPress={() => handleAnswer(true)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="checkmark" size={48} color="#fff" />
                        <Text style={styles.btnLabel}>TRUE</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.answerBtn, styles.falseBtn]}
                        onPress={() => handleAnswer(false)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="close" size={48} color="#fff" />
                        <Text style={styles.btnLabel}>FALSE</Text>
                    </TouchableOpacity>
                </View>
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
    problemContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    problemCard: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        paddingVertical: 40,
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
    problemText: {
        fontSize: 36, fontWeight: '800', color: '#fff',
    },
    correction: {
        fontSize: 18, color: 'rgba(255,255,255,0.8)', marginTop: 12,
    },
    buttonsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginTop: 24,
        paddingHorizontal: 8,
    },
    answerBtn: {
        width: 140,
        height: 120,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    trueBtn: {
        backgroundColor: '#10B981',
    },
    falseBtn: {
        backgroundColor: '#EF4444',
    },
    btnLabel: {
        fontSize: 16, fontWeight: '700', color: '#fff', marginTop: 8,
    },
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
        flexDirection: 'row', justifyContent: 'space-between',
        paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    resultLabel: { fontSize: 18, color: 'rgba(255,255,255,0.8)' },
    resultValue: { fontSize: 20, fontWeight: '700', color: '#fff' },
    playAgainBtn: {
        backgroundColor: '#fff', paddingHorizontal: 40, paddingVertical: 16,
        borderRadius: 30, marginBottom: 16,
    },
    playAgainText: { fontSize: 18, fontWeight: '700', color: '#EC4899' },
    homeBtn: { padding: 12 },
    homeBtnText: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
});
