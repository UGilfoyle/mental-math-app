import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface Particle {
    x: Animated.Value;
    y: Animated.Value;
    scale: Animated.Value;
    opacity: Animated.Value;
    color: string;
    size: number;
}

interface CorrectAnswerBurstProps {
    visible: boolean;
    x?: number;
    y?: number;
    color?: string;
    onComplete?: () => void;
}

const PARTICLE_COUNT = 12;
const COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];

export default function CorrectAnswerBurst({
    visible,
    x = width / 2,
    y = height / 2,
    color,
    onComplete
}: CorrectAnswerBurstProps) {
    const particles = useRef<Particle[]>([]).current;

    // Initialize particles
    if (particles.length === 0) {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: new Animated.Value(0),
                y: new Animated.Value(0),
                scale: new Animated.Value(0),
                opacity: new Animated.Value(0),
                color: color || COLORS[i % COLORS.length],
                size: 8 + Math.random() * 8,
            });
        }
    }

    useEffect(() => {
        if (visible) {
            // Reset and animate each particle
            const animations = particles.map((particle, i) => {
                // Reset
                particle.x.setValue(0);
                particle.y.setValue(0);
                particle.scale.setValue(0);
                particle.opacity.setValue(1);

                // Random angle for explosion direction
                const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
                const distance = 80 + Math.random() * 60;
                const targetX = Math.cos(angle) * distance;
                const targetY = Math.sin(angle) * distance;

                return Animated.parallel([
                    // Move outward
                    Animated.timing(particle.x, {
                        toValue: targetX,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(particle.y, {
                        toValue: targetY,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    // Scale up then down
                    Animated.sequence([
                        Animated.timing(particle.scale, {
                            toValue: 1,
                            duration: 150,
                            useNativeDriver: true,
                        }),
                        Animated.timing(particle.scale, {
                            toValue: 0,
                            duration: 350,
                            useNativeDriver: true,
                        }),
                    ]),
                    // Fade out
                    Animated.timing(particle.opacity, {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ]);
            });

            Animated.stagger(30, animations).start(() => {
                onComplete?.();
            });
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <View style={[styles.container, { left: x, top: y }]} pointerEvents="none">
            {particles.map((particle, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.particle,
                        {
                            width: particle.size,
                            height: particle.size,
                            borderRadius: particle.size / 2,
                            backgroundColor: particle.color,
                            transform: [
                                { translateX: particle.x },
                                { translateY: particle.y },
                                { scale: particle.scale },
                            ],
                            opacity: particle.opacity,
                        },
                    ]}
                />
            ))}
        </View>
    );
}

// Confetti burst for level up / achievements
interface ConfettiBurstProps {
    visible: boolean;
    onComplete?: () => void;
}

const CONFETTI_COUNT = 30;

export function ConfettiBurst({ visible, onComplete }: ConfettiBurstProps) {
    const confetti = useRef<{
        x: Animated.Value;
        y: Animated.Value;
        rotate: Animated.Value;
        opacity: Animated.Value;
        color: string;
        width: number;
        height: number;
    }[]>([]).current;

    // Initialize confetti
    if (confetti.length === 0) {
        for (let i = 0; i < CONFETTI_COUNT; i++) {
            confetti.push({
                x: new Animated.Value(0),
                y: new Animated.Value(0),
                rotate: new Animated.Value(0),
                opacity: new Animated.Value(0),
                color: COLORS[i % COLORS.length],
                width: 6 + Math.random() * 6,
                height: 12 + Math.random() * 8,
            });
        }
    }

    useEffect(() => {
        if (visible) {
            const animations = confetti.map((piece, i) => {
                // Reset
                piece.x.setValue((Math.random() - 0.5) * width);
                piece.y.setValue(-50);
                piece.rotate.setValue(0);
                piece.opacity.setValue(1);

                const targetX = (Math.random() - 0.5) * width * 0.5;
                const targetY = height * 0.7 + Math.random() * 100;

                return Animated.parallel([
                    Animated.timing(piece.x, {
                        toValue: targetX,
                        duration: 1500 + Math.random() * 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(piece.y, {
                        toValue: targetY,
                        duration: 1500 + Math.random() * 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(piece.rotate, {
                        toValue: Math.random() * 10 - 5,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                    Animated.sequence([
                        Animated.delay(1000),
                        Animated.timing(piece.opacity, {
                            toValue: 0,
                            duration: 500,
                            useNativeDriver: true,
                        }),
                    ]),
                ]);
            });

            Animated.stagger(50, animations).start(() => {
                onComplete?.();
            });
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <View style={styles.confettiContainer} pointerEvents="none">
            {confetti.map((piece, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.confettiPiece,
                        {
                            width: piece.width,
                            height: piece.height,
                            backgroundColor: piece.color,
                            transform: [
                                { translateX: piece.x },
                                { translateY: piece.y },
                                {
                                    rotate: piece.rotate.interpolate({
                                        inputRange: [-5, 5],
                                        outputRange: ['-180deg', '180deg'],
                                    })
                                },
                            ],
                            opacity: piece.opacity,
                        },
                    ]}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: 0,
        height: 0,
        zIndex: 1000,
    },
    particle: {
        position: 'absolute',
    },
    confettiContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        zIndex: 1000,
    },
    confettiPiece: {
        position: 'absolute',
        borderRadius: 2,
    },
});
