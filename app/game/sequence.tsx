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
import { GameModes } from '@/constants/Theme';
import { useSettingsStore } from '@/stores/gameStore';

const { width } = Dimensions.get('window');

// Sequence Types
type SequenceType = 'add' | 'multiply' | 'subtract' | 'power' | 'fibonacci';

// Generate sequence problem
function generateSequence() {
    const types: SequenceType[] = ['add', 'multiply', 'subtract', 'power'];
    const type = types[Math.floor(Math.random() * types.length)];

    let sequence: number[] = [];
    let answer = 0;
    let step = 0;

    switch (type) {
        case 'add':
            step = Math.floor(Math.random() * 7) + 2; // Add 2-8
            const startAdd = Math.floor(Math.random() * 10) + 1;
            sequence = [startAdd, startAdd + step, startAdd + step * 2, startAdd + step * 3];
            answer = startAdd + step * 4;
            break;
        case 'subtract':
            step = Math.floor(Math.random() * 5) + 2; // Subtract 2-6
            const startSub = Math.floor(Math.random() * 20) + 30;
            sequence = [startSub, startSub - step, startSub - step * 2, startSub - step * 3];
            answer = startSub - step * 4;
            break;
        case 'multiply':
            step = Math.floor(Math.random() * 2) + 2; // Multiply by 2-3
            const startMul = Math.floor(Math.random() * 3) + 2;
            sequence = [startMul, startMul * step, startMul * step * step, startMul * step * step * step];
            answer = startMul * Math.pow(step, 4);
            break;
        case 'power':
            const base = Math.floor(Math.random() * 3) + 2; // 2, 3, or 4
            sequence = [Math.pow(base, 1), Math.pow(base, 2), Math.pow(base, 3), Math.pow(base, 4)];
            answer = Math.pow(base, 5);
            break;
    }

    // Generate wrong options
    const options = [answer];
    while (options.length < 4) {
        const wrong = answer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 10) + 1);
        if (wrong > 0 && !options.includes(wrong)) {
            options.push(wrong);
        }
    }
    options.sort(() => Math.random() - 0.5);

    return {
        sequence,
        answer,
        options,
    };
}

export default function SequenceGame() {
    const router = useRouter();
    const { hapticEnabled } = useSettingsStore();

    const [problem, setProblem] = useState(generateSequence());
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
            setScore(s => s + 15 + streak * 3);
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
            setProblem(generateSequence());
        }, 700);
    }, [problem, isGameOver, streak, hapticEnabled, feedback]);

    const modeInfo = GameModes.sequence;

    if (isGameOver) {
        return (
            <View style={styles.container}>
                <LinearGradient colors={modeInfo.gradient as [string, string]} style={styles.background} />
                <SafeAreaView style={styles.resultContainer}>
                    <View style={styles.gameOverIcon}>
                        <Ionicons name="trending-up" size={48} color="#fff" />
                    </View>
                    <Text style={styles.gameOverTitle}>Time's Up!</Text>
                    <View style={styles.resultCard}>
                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Score</Text>
                            <Text style={styles.resultValue}>{score}</Text>
                        </View>
                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Sequences</Text>
                            <Text style={styles.resultValue}>{problemCount}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.playAgainBtn} onPress={() => {
                        setScore(0);
                        setStreak(0);
                        setProblemCount(0);
                        setTimeLeft(60);
                        setIsGameOver(false);
                        setProblem(generateSequence());
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
                <Text style={styles.question}>What comes next?</Text>

                {/* Sequence Display */}
                <View style={styles.sequenceContainer}>
                    <Animated.View style={[
                        styles.sequenceCard,
                        { transform: [{ scale: scaleAnim }] },
                        isCorrect === true && styles.correctCard,
                        isCorrect === false && styles.wrongCard,
                    ]}>
                        <View style={styles.numbersRow}>
                            {problem.sequence.map((num, i) => (
                                <View key={i} style={styles.numberBox}>
                                    <Text style={styles.numberText}>{num}</Text>
                                </View>
                            ))}
                            <View style={[styles.numberBox, styles.questionBox]}>
                                <Text style={styles.questionMark}>?</Text>
                            </View>
                        </View>
                        {feedback !== null && (
                            <Text style={styles.answerReveal}>
                                Answer: {problem.answer}
                            </Text>
                        )}
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
    sequenceContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    sequenceCard: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 20,
        padding: 20,
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
    numbersRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    numberBox: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 14,
        borderRadius: 10,
        minWidth: 48,
        alignItems: 'center',
    },
    questionBox: {
        backgroundColor: 'rgba(255,200,0,0.3)',
        borderWidth: 2,
        borderColor: '#FBBF24',
        borderStyle: 'dashed',
    },
    numberText: {
        fontSize: 20, fontWeight: '700', color: '#fff',
    },
    questionMark: {
        fontSize: 22, fontWeight: '800', color: '#FBBF24',
    },
    answerReveal: {
        fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 14,
        textAlign: 'center',
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginTop: 24,
    },
    optionBtn: {
        width: (width - 72) / 2,
        paddingVertical: 18,
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
        fontSize: 24, fontWeight: '700', color: '#fff',
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
    playAgainText: { fontSize: 18, fontWeight: '700', color: '#0EA5E9' },
    homeBtn: { padding: 12 },
    homeBtnText: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
});
