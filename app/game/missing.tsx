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
import { GameModes, Spacing } from '@/constants/Theme';
import { useSettingsStore } from '@/stores/gameStore';

const { width } = Dimensions.get('window');

// Generate missing number problem
function generateMissing() {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const position = Math.floor(Math.random() * 3); // 0=first, 1=second, 2=result

    let a = Math.floor(Math.random() * 12) + 1;
    let b = Math.floor(Math.random() * 12) + 1;
    let result = op === '+' ? a + b : op === '-' ? a - b : a * b;

    // Generate wrong options
    const correctAnswer = position === 0 ? a : position === 1 ? b : result;
    const options = [correctAnswer];
    while (options.length < 4) {
        const wrong = correctAnswer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
        if (wrong > 0 && !options.includes(wrong)) {
            options.push(wrong);
        }
    }
    // Shuffle
    options.sort(() => Math.random() - 0.5);

    let display = '';
    if (position === 0) display = `? ${op} ${b} = ${result}`;
    else if (position === 1) display = `${a} ${op} ? = ${result}`;
    else display = `${a} ${op} ${b} = ?`;

    return {
        display,
        answer: correctAnswer,
        options,
    };
}

export default function MissingGame() {
    const router = useRouter();
    const { hapticEnabled } = useSettingsStore();

    const [problem, setProblem] = useState(generateMissing());
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [feedback, setFeedback] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
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

    const handleAnswer = useCallback((choice: number) => {
        if (isGameOver || feedback !== null) return;

        const correct = choice === problem.answer;
        setFeedback(choice);
        setIsCorrect(correct);

        if (hapticEnabled) {
            Haptics.notificationAsync(correct
                ? Haptics.NotificationFeedbackType.Success
                : Haptics.NotificationFeedbackType.Error);
        }

        if (correct) {
            setScore(s => s + 10 + streak * 2);
            setStreak(s => s + 1);
            Animated.sequence([
                Animated.timing(scaleAnim, { toValue: 1.05, duration: 100, useNativeDriver: true }),
                Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
            ]).start();
        } else {
            setStreak(0);
        }

        setProblemCount(c => c + 1);
        setTimeout(() => {
            setFeedback(null);
            setIsCorrect(null);
            setProblem(generateMissing());
        }, 600);
    }, [problem, isGameOver, streak, hapticEnabled, feedback]);

    const modeInfo = GameModes.missing;

    if (isGameOver) {
        return (
            <View style={styles.container}>
                <LinearGradient colors={modeInfo.gradient as [string, string]} style={styles.background} />
                <SafeAreaView style={styles.resultContainer}>
                    <View style={styles.gameOverIcon}>
                        <Ionicons name="help-circle" size={48} color="#fff" />
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
                        setProblem(generateMissing());
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
                <Text style={styles.question}>Find the missing number</Text>

                {/* Problem Card */}
                <View style={styles.problemContainer}>
                    <Animated.View style={[
                        styles.problemCard,
                        { transform: [{ scale: scaleAnim }] },
                        isCorrect === true && styles.correctCard,
                        isCorrect === false && styles.wrongCard,
                    ]}>
                        <Text style={styles.problemText}>{problem.display}</Text>
                    </Animated.View>
                </View>

                {/* Options */}
                <View style={styles.optionsGrid}>
                    {problem.options.map((opt, i) => (
                        <TouchableOpacity
                            key={i}
                            style={[
                                styles.optionBtn,
                                feedback === opt && isCorrect && styles.correctOption,
                                feedback === opt && !isCorrect && styles.wrongOption,
                                feedback !== null && opt === problem.answer && styles.correctOption,
                            ]}
                            onPress={() => handleAnswer(opt)}
                            activeOpacity={0.8}
                            disabled={feedback !== null}
                        >
                            <Text style={styles.optionText}>{opt}</Text>
                        </TouchableOpacity>
                    ))}
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
        fontSize: 24, fontWeight: '800', color: '#fff',
        textAlign: 'center', marginBottom: 16,
    },
    problemContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    problemCard: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        paddingVertical: 36,
        paddingHorizontal: 24,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        width: '100%',
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
        fontSize: 38, fontWeight: '800', color: '#fff',
        textAlign: 'center',
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginTop: 20,
    },
    optionBtn: {
        width: (width - 72) / 2,
        paddingVertical: 20,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    correctOption: {
        backgroundColor: 'rgba(16,185,129,0.5)',
        borderColor: '#10B981',
    },
    wrongOption: {
        backgroundColor: 'rgba(239,68,68,0.5)',
        borderColor: '#EF4444',
    },
    optionText: {
        fontSize: 28, fontWeight: '700', color: '#fff',
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
    playAgainText: { fontSize: 18, fontWeight: '700', color: '#6366F1' },
    homeBtn: { padding: 12 },
    homeBtnText: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
});
