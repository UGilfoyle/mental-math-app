// Game state store using Zustand
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameMode, Difficulty, Operation } from '@/constants/Theme';
import { MathProblem, generateProblem, checkAnswer, calculateScore } from '@/lib/math';

export interface GameResult {
    id: string;
    mode: GameMode;
    difficulty: Difficulty;
    operation: Operation;
    score: number;
    correctCount: number;
    totalCount: number;
    accuracy: number;
    timeMs: number;
    date: string;
}

// Game configuration from setup screen
export interface OperationConfig {
    enabled: boolean;
    maxNumber: number;
}

export interface GameConfig {
    problemCount: number;
    operations: Record<'add' | 'subtract' | 'multiply' | 'divide', OperationConfig>;
}

interface GameState {
    // Game setup
    mode: GameMode;
    difficulty: Difficulty;
    operation: Operation;
    gameConfig: GameConfig | null;

    // Game state
    isPlaying: boolean;
    isPaused: boolean;
    isFinished: boolean;

    // Current problem
    currentProblem: MathProblem | null;
    problemIndex: number;

    // Stats for current game
    correctCount: number;
    wrongCount: number;
    totalProblems: number;

    // Time tracking
    startTime: number;
    elapsedTime: number;
    timeLimit: number; // in ms, 0 = no limit

    // Survival mode
    lives: number;

    // Score
    score: number;

    // History
    history: GameResult[];

    // Actions
    setMode: (mode: GameMode) => void;
    setDifficulty: (difficulty: Difficulty) => void;
    setOperation: (operation: Operation) => void;
    setGameConfig: (config: GameConfig) => void;

    startGame: () => void;
    pauseGame: () => void;
    resumeGame: () => void;
    endGame: () => void;
    resetGame: () => void;

    nextProblem: () => void;
    submitAnswer: (answer: number) => { correct: boolean; correctAnswer: number };

    updateTime: (time: number) => void;

    addToHistory: (result: GameResult) => void;
    clearHistory: () => void;
}

const INITIAL_LIVES = 3;
const SPEEDRUN_PROBLEMS = 20;
const TIMEATTACK_DURATION = 60000; // 60 seconds
const SURVIVAL_TIME_PER_PROBLEM = 10000; // 10 seconds

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            // Initial state
            mode: 'practice',
            difficulty: 'easy',
            operation: 'mixed',
            gameConfig: null,

            isPlaying: false,
            isPaused: false,
            isFinished: false,

            currentProblem: null,
            problemIndex: 0,

            correctCount: 0,
            wrongCount: 0,
            totalProblems: 0,

            startTime: 0,
            elapsedTime: 0,
            timeLimit: 0,

            lives: INITIAL_LIVES,
            score: 0,

            history: [],

            // Actions
            setMode: (mode) => set({ mode }),
            setDifficulty: (difficulty) => set({ difficulty }),
            setOperation: (operation) => set({ operation }),
            setGameConfig: (config) => set({ gameConfig: config }),

            startGame: () => {
                const { mode, difficulty, operation } = get();

                let timeLimit = 0;
                let totalProblems = 0;

                switch (mode) {
                    case 'speedrun':
                        totalProblems = SPEEDRUN_PROBLEMS;
                        break;
                    case 'timeattack':
                        timeLimit = TIMEATTACK_DURATION;
                        break;
                    case 'survival':
                        timeLimit = SURVIVAL_TIME_PER_PROBLEM;
                        break;
                }

                const problem = generateProblem(difficulty, operation);

                set({
                    isPlaying: true,
                    isPaused: false,
                    isFinished: false,
                    currentProblem: problem,
                    problemIndex: 1,
                    correctCount: 0,
                    wrongCount: 0,
                    totalProblems,
                    startTime: Date.now(),
                    elapsedTime: 0,
                    timeLimit,
                    lives: INITIAL_LIVES,
                    score: 0,
                });
            },

            pauseGame: () => set({ isPaused: true }),
            resumeGame: () => set({ isPaused: false }),

            endGame: () => {
                const state = get();
                const { mode, difficulty, operation, correctCount, wrongCount, elapsedTime } = state;

                const totalCount = correctCount + wrongCount;
                const accuracy = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;
                const score = calculateScore(correctCount, Math.max(totalCount, 1), elapsedTime, difficulty);

                const result: GameResult = {
                    id: Date.now().toString(36),
                    mode,
                    difficulty,
                    operation,
                    score,
                    correctCount,
                    totalCount,
                    accuracy,
                    timeMs: elapsedTime,
                    date: new Date().toISOString(),
                };

                set({
                    isPlaying: false,
                    isFinished: true,
                    score,
                });

                get().addToHistory(result);
            },

            resetGame: () => set({
                isPlaying: false,
                isPaused: false,
                isFinished: false,
                currentProblem: null,
                problemIndex: 0,
                correctCount: 0,
                wrongCount: 0,
                elapsedTime: 0,
                lives: INITIAL_LIVES,
                score: 0,
            }),

            nextProblem: () => {
                const { difficulty, operation, problemIndex, mode } = get();
                const problem = generateProblem(difficulty, operation);

                // Reset timer for survival mode
                let timeLimit = get().timeLimit;
                if (mode === 'survival') {
                    timeLimit = SURVIVAL_TIME_PER_PROBLEM;
                }

                set({
                    currentProblem: problem,
                    problemIndex: problemIndex + 1,
                    timeLimit,
                });
            },

            submitAnswer: (answer: number) => {
                const { currentProblem, mode, lives, correctCount, wrongCount, totalProblems, problemIndex } = get();

                if (!currentProblem) {
                    return { correct: false, correctAnswer: 0 };
                }

                const correct = checkAnswer(currentProblem, answer);

                if (correct) {
                    set({ correctCount: correctCount + 1 });
                } else {
                    set({ wrongCount: wrongCount + 1 });

                    // Handle survival mode
                    if (mode === 'survival') {
                        const newLives = lives - 1;
                        set({ lives: newLives });

                        if (newLives <= 0) {
                            get().endGame();
                            return { correct, correctAnswer: currentProblem.answer };
                        }
                    }
                }

                // Check if game should end
                if (mode === 'speedrun' && problemIndex >= totalProblems) {
                    get().endGame();
                } else {
                    get().nextProblem();
                }

                return { correct, correctAnswer: currentProblem.answer };
            },

            updateTime: (time: number) => {
                const { mode, timeLimit, isPlaying, isPaused } = get();

                if (!isPlaying || isPaused) return;

                set({ elapsedTime: time });

                // Check time limit for timeattack
                if (mode === 'timeattack' && time >= TIMEATTACK_DURATION) {
                    get().endGame();
                }

                // Check time limit for survival
                if (mode === 'survival' && time >= timeLimit) {
                    const newLives = get().lives - 1;
                    set({ lives: newLives, wrongCount: get().wrongCount + 1 });

                    if (newLives <= 0) {
                        get().endGame();
                    } else {
                        get().nextProblem();
                    }
                }
            },

            addToHistory: (result) => {
                const history = [...get().history, result].slice(-50); // Keep last 50 games
                set({ history });
            },

            clearHistory: () => set({ history: [] }),
        }),
        {
            name: 'game-history-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state: GameState) => ({ history: state.history }), // Only persist history
        }
    )
);

// Settings store
interface SettingsState {
    soundEnabled: boolean;
    hapticEnabled: boolean;
    darkMode: boolean;
    defaultDifficulty: Difficulty;

    setSoundEnabled: (enabled: boolean) => void;
    setHapticEnabled: (enabled: boolean) => void;
    setDarkMode: (enabled: boolean) => void;
    setDefaultDifficulty: (difficulty: Difficulty) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            soundEnabled: true,
            hapticEnabled: true,
            darkMode: true,
            defaultDifficulty: 'easy',

            setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
            setHapticEnabled: (enabled) => set({ hapticEnabled: enabled }),
            setDarkMode: (enabled) => set({ darkMode: enabled }),
            setDefaultDifficulty: (difficulty) => set({ defaultDifficulty: difficulty }),
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
