// Math problem generator for Mental Math App
import { Operation, Difficulty, Difficulties, Operations } from '@/constants/Theme';

export interface MathProblem {
    id: string;
    num1: number;
    num2: number;
    operation: Operation;
    operationSymbol: string;
    answer: number;
    displayProblem: string;
}

// Generate a random integer in range [min, max]
function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a unique ID
function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Get a random operation from the difficulty's allowed operations
function getRandomOperation(difficulty: Difficulty, preferredOp?: Operation): Operation {
    if (preferredOp && preferredOp !== 'mixed') {
        return preferredOp;
    }

    const ops = Difficulties[difficulty].operations;
    return ops[randomInt(0, ops.length - 1)];
}

// Generate a math problem
export function generateProblem(
    difficulty: Difficulty = 'easy',
    operation: Operation = 'mixed'
): MathProblem {
    const [minRange, maxRange] = Difficulties[difficulty].range;
    const op = getRandomOperation(difficulty, operation);

    let num1: number;
    let num2: number;
    let answer: number;

    switch (op) {
        case 'add':
            num1 = randomInt(minRange, maxRange);
            num2 = randomInt(minRange, maxRange);
            answer = num1 + num2;
            break;

        case 'subtract':
            // Ensure num1 >= num2 for positive results
            num1 = randomInt(minRange, maxRange);
            num2 = randomInt(minRange, Math.min(num1, maxRange));
            // Swap to make sure larger number is first
            if (num2 > num1) [num1, num2] = [num2, num1];
            answer = num1 - num2;
            break;

        case 'multiply':
            // Use smaller numbers for multiplication
            const mulMax = Math.min(maxRange, difficulty === 'expert' ? 25 : 12);
            num1 = randomInt(minRange, mulMax);
            num2 = randomInt(minRange, mulMax);
            answer = num1 * num2;
            break;

        case 'divide':
            // Generate division that results in whole numbers
            num2 = randomInt(Math.max(1, minRange), Math.min(12, maxRange)); // Divisor
            answer = randomInt(1, Math.min(12, maxRange)); // Quotient
            num1 = num2 * answer; // Dividend
            break;

        default:
            // Default to addition
            num1 = randomInt(minRange, maxRange);
            num2 = randomInt(minRange, maxRange);
            answer = num1 + num2;
    }

    const opSymbol = Operations[op].symbol;

    return {
        id: generateId(),
        num1,
        num2,
        operation: op,
        operationSymbol: opSymbol,
        answer,
        displayProblem: `${num1} ${opSymbol} ${num2}`,
    };
}

// Generate multiple problems
export function generateProblems(
    count: number,
    difficulty: Difficulty = 'easy',
    operation: Operation = 'mixed'
): MathProblem[] {
    const problems: MathProblem[] = [];
    const usedProblems = new Set<string>();

    while (problems.length < count) {
        const problem = generateProblem(difficulty, operation);
        const key = `${problem.num1}${problem.operationSymbol}${problem.num2}`;

        // Avoid duplicate problems
        if (!usedProblems.has(key)) {
            usedProblems.add(key);
            problems.push(problem);
        }
    }

    return problems;
}

// Check if answer is correct
export function checkAnswer(problem: MathProblem, userAnswer: number): boolean {
    return problem.answer === userAnswer;
}

// Calculate score based on time and accuracy
export function calculateScore(
    correctCount: number,
    totalCount: number,
    timeMs: number,
    difficulty: Difficulty
): number {
    const accuracy = correctCount / totalCount;
    const timeBonus = Math.max(0, 1 - (timeMs / (totalCount * 10000))); // 10s per problem max

    const difficultyMultiplier = {
        easy: 1,
        medium: 1.5,
        hard: 2,
        expert: 3,
    }[difficulty];

    const baseScore = correctCount * 100 * difficultyMultiplier;
    const accuracyBonus = accuracy * 50 * difficultyMultiplier;
    const speedBonus = timeBonus * 100 * difficultyMultiplier;

    return Math.round(baseScore + accuracyBonus + speedBonus);
}

// Format time in mm:ss.ms
export function formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const remainingMs = Math.floor((ms % 1000) / 10);

    if (minutes > 0) {
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${remainingMs.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}.${remainingMs.toString().padStart(2, '0')}s`;
}

// Format large numbers with commas
export function formatNumber(num: number): string {
    return num.toLocaleString();
}
