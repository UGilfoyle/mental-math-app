import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface ComboPopupProps {
    streak: number;
    message: string;
    color: string;
    visible: boolean;
    onComplete?: () => void;
}

export default function ComboPopup({ streak, message, color, visible, onComplete }: ComboPopupProps) {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const starScale1 = useRef(new Animated.Value(0)).current;
    const starScale2 = useRef(new Animated.Value(0)).current;
    const starScale3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Reset
            scaleAnim.setValue(0);
            opacityAnim.setValue(1);
            rotateAnim.setValue(0);
            starScale1.setValue(0);
            starScale2.setValue(0);
            starScale3.setValue(0);

            // Bounce in animation
            Animated.sequence([
                Animated.spring(scaleAnim, {
                    toValue: 1.2,
                    friction: 3,
                    tension: 100,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 4,
                    useNativeDriver: true,
                }),
            ]).start();

            // Stars stagger animation
            Animated.stagger(100, [
                Animated.spring(starScale1, {
                    toValue: 1,
                    friction: 3,
                    useNativeDriver: true,
                }),
                Animated.spring(starScale2, {
                    toValue: 1,
                    friction: 3,
                    useNativeDriver: true,
                }),
                Animated.spring(starScale3, {
                    toValue: 1,
                    friction: 3,
                    useNativeDriver: true,
                }),
            ]).start();

            // Slight rotation wiggle
            Animated.sequence([
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(rotateAnim, {
                    toValue: -1,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(rotateAnim, {
                    toValue: 0,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]).start();

            // Fade out after delay
            setTimeout(() => {
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }).start(() => {
                    onComplete?.();
                });
            }, 800);
        }
    }, [visible]);

    const rotate = rotateAnim.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: ['-5deg', '0deg', '5deg'],
    });

    if (!visible) return null;

    // Show more stars for higher streaks
    const showThreeStars = streak >= 10;
    const showTwoStars = streak >= 5;

    return (
        <View style={styles.container} pointerEvents="none">
            <Animated.View
                style={[
                    styles.popup,
                    {
                        opacity: opacityAnim,
                        transform: [{ scale: scaleAnim }, { rotate }],
                    },
                ]}
            >
                {/* Stars */}
                <View style={styles.starsRow}>
                    {showThreeStars && (
                        <Animated.View style={{ transform: [{ scale: starScale1 }] }}>
                            <Ionicons name="star" size={28} color="#FFD700" />
                        </Animated.View>
                    )}
                    {showTwoStars && (
                        <Animated.View style={{ transform: [{ scale: starScale2 }] }}>
                            <Ionicons name="star" size={36} color="#FFD700" />
                        </Animated.View>
                    )}
                    {showThreeStars && (
                        <Animated.View style={{ transform: [{ scale: starScale3 }] }}>
                            <Ionicons name="star" size={28} color="#FFD700" />
                        </Animated.View>
                    )}
                </View>

                {/* Message */}
                <Text style={[styles.message, { color }]}>{message}</Text>

                {/* Streak counter */}
                <View style={[styles.streakBadge, { backgroundColor: color }]}>
                    <Ionicons name="flame" size={16} color="#fff" />
                    <Text style={styles.streakText}>{streak}x</Text>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    popup: {
        alignItems: 'center',
        padding: 20,
    },
    starsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
    },
    message: {
        fontSize: 42,
        fontWeight: '900',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
        letterSpacing: 2,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 12,
    },
    streakText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#fff',
    },
});
