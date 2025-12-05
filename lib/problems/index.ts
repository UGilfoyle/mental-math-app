// Expanded Math Problem Generator for all age groups
import { Operation, Difficulty } from '@/constants/Theme';

// Problem categories
export type Category =
    | 'arithmetic'
    | 'fractions'
    | 'decimals'
    | 'percentages'
    | 'algebra'
    | 'powers'
    | 'roots'
    | 'sequences'
    | 'equations';

export type AgeGroup = 'kids' | 'junior' | 'teen' | 'adult' | 'expert';

export interface MathProblem {
    id: string;
    category: Category;
    difficulty: Difficulty;
    displayProblem: string;
    answer: number;
    options?: number[]; // For multiple choice
    hint?: string;
    explanation?: string;
}

// Helper functions
function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Generate wrong answers close to correct
function generateOptions(correct: number, count = 4): number[] {
    const options = new Set<number>([correct]);
    const range = Math.max(5, Math.abs(correct) * 0.3);

    while (options.size < count) {
        const offset = randomInt(-Math.floor(range), Math.floor(range));
        if (offset !== 0) {
            options.add(correct + offset);
        }
    }

    return shuffle([...options]);
}

// =====================
// ARITHMETIC (Basic +−×÷)
// =====================
export function generateArithmetic(difficulty: Difficulty): MathProblem {
    const ranges: Record<Difficulty, [number, number]> = {
        easy: [1, 10],
        medium: [1, 50],
        hard: [1, 100],
        expert: [10, 999],
    };

    const [min, max] = ranges[difficulty];
    const ops = difficulty === 'easy' ? ['+', '-'] : ['+', '-', '×', '÷'];
    const op = ops[randomInt(0, ops.length - 1)];

    let num1: number, num2: number, answer: number;

    switch (op) {
        case '+':
            num1 = randomInt(min, max);
            num2 = randomInt(min, max);
            answer = num1 + num2;
            break;
        case '-':
            num1 = randomInt(min, max);
            num2 = randomInt(min, Math.min(num1, max));
            answer = num1 - num2;
            break;
        case '×':
            const mulMax = difficulty === 'expert' ? 25 : 12;
            num1 = randomInt(min, mulMax);
            num2 = randomInt(min, mulMax);
            answer = num1 * num2;
            break;
        case '÷':
            num2 = randomInt(Math.max(1, min), 12);
            answer = randomInt(1, 12);
            num1 = num2 * answer;
            break;
        default:
            num1 = randomInt(min, max);
            num2 = randomInt(min, max);
            answer = num1 + num2;
    }

    return {
        id: generateId(),
        category: 'arithmetic',
        difficulty,
        displayProblem: `${num1} ${op} ${num2}`,
        answer,
        options: generateOptions(answer),
    };
}

// =====================
// FRACTIONS
// =====================
export function generateFractions(difficulty: Difficulty): MathProblem {
    // Common denominators for easier mental math
    const denominators = difficulty === 'easy'
        ? [2, 4]
        : difficulty === 'medium'
            ? [2, 3, 4, 5]
            : [2, 3, 4, 5, 6, 8, 10];

    const d1 = denominators[randomInt(0, denominators.length - 1)];
    const d2 = d1; // Same denominator for easier problems
    let n1 = randomInt(1, d1 - 1);
    let n2 = randomInt(1, d2 - 1);

    const op = randomInt(0, 1) === 0 ? '+' : '-';
    let answerNum: number;

    if (op === '+') {
        answerNum = n1 + n2;
    } else {
        // Ensure n1 >= n2 for subtraction
        if (n1 < n2) {
            [n1, n2] = [n2, n1];
        }
        answerNum = n1 - n2;
    }

    // Convert to decimal for answer
    const answer = Math.round((answerNum / d1) * 100) / 100;

    return {
        id: generateId(),
        category: 'fractions',
        difficulty,
        displayProblem: `${n1}/${d1} ${op} ${n2}/${d2}`,
        answer: answerNum, // Answer as numerator (same denominator)
        hint: `Same denominator: ${d1}`,
        explanation: `${n1}/${d1} ${op} ${n2}/${d2} = ${answerNum}/${d1}`,
    };
}

// =====================
// PERCENTAGES
// =====================
export function generatePercentages(difficulty: Difficulty): MathProblem {
    const percentages = difficulty === 'easy'
        ? [10, 20, 25, 50]
        : difficulty === 'medium'
            ? [5, 10, 15, 20, 25, 30, 50, 75]
            : [5, 10, 12, 15, 20, 25, 30, 33, 40, 50, 60, 75, 80];

    const bases = difficulty === 'easy'
        ? [10, 20, 50, 100]
        : difficulty === 'medium'
            ? [20, 40, 50, 80, 100, 200]
            : [24, 36, 48, 60, 80, 120, 150, 200, 250];

    const percent = percentages[randomInt(0, percentages.length - 1)];
    const base = bases[randomInt(0, bases.length - 1)];
    const answer = (percent / 100) * base;

    return {
        id: generateId(),
        category: 'percentages',
        difficulty,
        displayProblem: `${percent}% of ${base}`,
        answer,
        options: generateOptions(answer),
        hint: `${percent}% = ${percent}/100`,
    };
}

// =====================
// ALGEBRA (Solve for x)
// =====================
export function generateAlgebra(difficulty: Difficulty): MathProblem {
    const x = randomInt(1, difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 50);
    const a = randomInt(2, difficulty === 'easy' ? 5 : 10);
    const b = randomInt(1, difficulty === 'easy' ? 20 : 50);

    // ax + b = c  →  x = (c - b) / a
    const c = a * x + b;

    const problemTypes = difficulty === 'easy'
        ? [`x + ${b} = ${x + b}`, `x - ${b} = ${x - b}`, `${a}x = ${a * x}`]
        : [`${a}x + ${b} = ${c}`, `${a}x - ${b} = ${a * x - b}`];

    const problem = problemTypes[randomInt(0, problemTypes.length - 1)];

    return {
        id: generateId(),
        category: 'algebra',
        difficulty,
        displayProblem: problem + ', x = ?',
        answer: x,
        options: generateOptions(x),
        hint: 'Isolate x on one side',
    };
}

// =====================
// POWERS
// =====================
export function generatePowers(difficulty: Difficulty): MathProblem {
    const maxBase = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 12;
    const maxExp = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;

    const base = randomInt(2, maxBase);
    const exp = randomInt(2, maxExp);
    const answer = Math.pow(base, exp);

    // Use superscript for display
    const superscripts: Record<number, string> = {
        2: '²', 3: '³', 4: '⁴', 5: '⁵'
    };

    return {
        id: generateId(),
        category: 'powers',
        difficulty,
        displayProblem: `${base}${superscripts[exp] || `^${exp}`}`,
        answer,
        options: generateOptions(answer),
        hint: `${base} × ${base}${exp > 2 ? ` × ${base}`.repeat(exp - 2) : ''}`,
    };
}

// =====================
// SQUARE ROOTS
// =====================
export function generateRoots(difficulty: Difficulty): MathProblem {
    const perfectSquares = difficulty === 'easy'
        ? [4, 9, 16, 25, 36]
        : difficulty === 'medium'
            ? [4, 9, 16, 25, 36, 49, 64, 81, 100]
            : [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225];

    const num = perfectSquares[randomInt(0, perfectSquares.length - 1)];
    const answer = Math.sqrt(num);

    return {
        id: generateId(),
        category: 'roots',
        difficulty,
        displayProblem: `√${num}`,
        answer,
        options: generateOptions(answer),
    };
}

// =====================
// SEQUENCES (Pattern Recognition)
// =====================
export function generateSequences(difficulty: Difficulty): MathProblem {
    const types = ['arithmetic', 'geometric', 'squares', 'fibonacci'];
    const type = types[randomInt(0, difficulty === 'easy' ? 1 : types.length - 1)];

    let sequence: number[];
    let answer: number;

    switch (type) {
        case 'arithmetic': {
            const start = randomInt(1, 10);
            const diff = randomInt(2, difficulty === 'easy' ? 5 : 10);
            sequence = [start, start + diff, start + 2 * diff, start + 3 * diff];
            answer = start + 4 * diff;
            break;
        }
        case 'geometric': {
            const start = randomInt(1, 5);
            const ratio = randomInt(2, 3);
            sequence = [start, start * ratio, start * ratio ** 2, start * ratio ** 3];
            answer = start * ratio ** 4;
            break;
        }
        case 'squares': {
            const start = randomInt(1, 5);
            sequence = [start ** 2, (start + 1) ** 2, (start + 2) ** 2, (start + 3) ** 2];
            answer = (start + 4) ** 2;
            break;
        }
        case 'fibonacci': {
            const a = randomInt(1, 5);
            const b = randomInt(1, 5);
            sequence = [a, b, a + b, a + 2 * b];
            answer = 2 * a + 3 * b;
            break;
        }
        default:
            sequence = [2, 4, 6, 8];
            answer = 10;
    }

    return {
        id: generateId(),
        category: 'sequences',
        difficulty,
        displayProblem: `${sequence.join(', ')}, ?`,
        answer,
        options: generateOptions(answer),
        hint: 'Find the pattern',
    };
}

// =====================
// MASTER GENERATOR
// =====================
export function generateProblem(
    category: Category = 'arithmetic',
    difficulty: Difficulty = 'easy'
): MathProblem {
    switch (category) {
        case 'fractions':
            return generateFractions(difficulty);
        case 'percentages':
            return generatePercentages(difficulty);
        case 'algebra':
            return generateAlgebra(difficulty);
        case 'powers':
            return generatePowers(difficulty);
        case 'roots':
            return generateRoots(difficulty);
        case 'sequences':
            return generateSequences(difficulty);
        default:
            return generateArithmetic(difficulty);
    }
}

// Get categories available for age group
export function getCategoriesForAge(ageGroup: AgeGroup): Category[] {
    switch (ageGroup) {
        case 'kids':
            return ['arithmetic'];
        case 'junior':
            return ['arithmetic', 'fractions', 'decimals', 'percentages'];
        case 'teen':
            return ['arithmetic', 'fractions', 'percentages', 'algebra', 'powers', 'roots'];
        case 'adult':
            return ['arithmetic', 'percentages', 'algebra', 'powers', 'roots', 'sequences'];
        case 'expert':
            return ['arithmetic', 'fractions', 'percentages', 'algebra', 'powers', 'roots', 'sequences', 'equations'];
        default:
            return ['arithmetic'];
    }
}

// Get difficulty for age group
export function getDefaultDifficulty(ageGroup: AgeGroup): Difficulty {
    switch (ageGroup) {
        case 'kids':
            return 'easy';
        case 'junior':
            return 'medium';
        case 'teen':
            return 'medium';
        case 'adult':
            return 'hard';
        case 'expert':
            return 'expert';
        default:
            return 'easy';
    }
}
