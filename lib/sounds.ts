import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sound configuration
let soundEnabled = true;
const loadedSounds: { [key: string]: Audio.Sound } = {};

// Candy Crush style combo messages
export const COMBO_MESSAGES = [
    { streak: 2, message: 'Nice!', color: '#10B981' },
    { streak: 3, message: 'Good!', color: '#3B82F6' },
    { streak: 4, message: 'Great!', color: '#8B5CF6' },
    { streak: 5, message: 'Awesome!', color: '#EC4899' },
    { streak: 7, message: 'Amazing!', color: '#F59E0B' },
    { streak: 10, message: 'Incredible!', color: '#EF4444' },
    { streak: 15, message: 'Unstoppable!', color: '#FFD700' },
    { streak: 20, message: 'LEGENDARY!', color: '#FFD700' },
    { streak: 25, message: 'GODLIKE!', color: '#FFD700' },
];

// Get combo message for streak
export function getComboMessage(streak: number): { message: string; color: string } | null {
    // Find the highest matching streak level
    for (let i = COMBO_MESSAGES.length - 1; i >= 0; i--) {
        if (streak >= COMBO_MESSAGES[i].streak) {
            return COMBO_MESSAGES[i];
        }
    }
    return null;
}

// Sound frequencies for generating tones (for web/fallback)
const SOUND_CONFIG = {
    correct: {
        notes: [523.25, 659.25, 783.99], // C5, E5, G5 - happy major chord
        duration: 150,
    },
    wrong: {
        notes: [200, 180], // Low descending
        duration: 200,
    },
    combo: {
        // Escalating notes based on streak
        baseNote: 523.25,
        duration: 100,
    },
    levelUp: {
        notes: [523.25, 659.25, 783.99, 1046.50], // C5, E5, G5, C6
        duration: 200,
    },
    achievement: {
        notes: [783.99, 987.77, 1174.66], // G5, B5, D6
        duration: 150,
    },
    gameStart: {
        notes: [392, 523.25, 659.25],
        duration: 120,
    },
    gameOver: {
        notes: [659.25, 523.25, 392],
        duration: 200,
    },
    tap: {
        notes: [800],
        duration: 50,
    },
    streak: {
        notes: [1046.50, 1318.51], // High sparkle
        duration: 80,
    },
};

// Initialize audio settings
export async function initializeAudio() {
    try {
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
        });

        // Load sound preference
        const savedPref = await AsyncStorage.getItem('sound-enabled');
        soundEnabled = savedPref !== 'false';
    } catch (error) {
        console.log('Audio init error:', error);
    }
}

// Toggle sound
export async function toggleSound(enabled: boolean) {
    soundEnabled = enabled;
    await AsyncStorage.setItem('sound-enabled', enabled.toString());
}

// Get sound status
export function isSoundEnabled(): boolean {
    return soundEnabled;
}

// Play a simple beep sound using oscillator-like simulation
async function playTone(frequency: number, duration: number) {
    if (!soundEnabled) return;

    try {
        // Create a very short audio buffer
        const { sound } = await Audio.Sound.createAsync(
            { uri: `https://www.soundjay.com/button/beep-${Math.round(frequency / 100)}.mp3` },
            { shouldPlay: false, volume: 0.5 }
        );

        await sound.playAsync();

        setTimeout(async () => {
            await sound.unloadAsync();
        }, duration + 100);
    } catch (error) {
        // Fallback - just use haptics if sound fails
        console.log('Sound play error, using haptics fallback');
    }
}

// Play correct answer sound - ascending happy tone
export async function playCorrectSound(streak: number = 1) {
    if (!soundEnabled) return;

    try {
        // Use haptics as additional feedback
        const Haptics = require('expo-haptics');

        if (streak >= 5) {
            // Big combo - strong feedback
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            // Normal correct - light feedback
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    } catch (error) {
        console.log('Haptics error:', error);
    }
}

// Play wrong answer sound
export async function playWrongSound() {
    if (!soundEnabled) return;

    try {
        const Haptics = require('expo-haptics');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
        console.log('Haptics error:', error);
    }
}

// Play combo sound - gets higher pitched with streak
export async function playComboSound(streak: number) {
    if (!soundEnabled) return;

    try {
        const Haptics = require('expo-haptics');

        if (streak >= 10) {
            // Triple haptic for big combos
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 50);
            setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 100);
        } else if (streak >= 5) {
            // Double haptic
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 50);
        }
    } catch (error) {
        console.log('Haptics error:', error);
    }
}

// Play level up celebration sound
export async function playLevelUpSound() {
    if (!soundEnabled) return;

    try {
        const Haptics = require('expo-haptics');
        // Celebratory pattern
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 150);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 250);
        setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 400);
    } catch (error) {
        console.log('Haptics error:', error);
    }
}

// Play achievement unlock sound
export async function playAchievementSound() {
    if (!soundEnabled) return;

    try {
        const Haptics = require('expo-haptics');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 100);
    } catch (error) {
        console.log('Haptics error:', error);
    }
}

// Play button tap sound
export async function playTapSound() {
    if (!soundEnabled) return;

    try {
        const Haptics = require('expo-haptics');
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
        console.log('Haptics error:', error);
    }
}

// Play game start sound
export async function playGameStartSound() {
    if (!soundEnabled) return;

    try {
        const Haptics = require('expo-haptics');
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 100);
    } catch (error) {
        console.log('Haptics error:', error);
    }
}

// Play game over sound
export async function playGameOverSound(isVictory: boolean) {
    if (!soundEnabled) return;

    try {
        const Haptics = require('expo-haptics');
        if (isVictory) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
    } catch (error) {
        console.log('Haptics error:', error);
    }
}

// Cleanup sounds
export async function cleanupSounds() {
    for (const key in loadedSounds) {
        try {
            await loadedSounds[key].unloadAsync();
        } catch (error) {
            console.log('Sound cleanup error:', error);
        }
    }
}
