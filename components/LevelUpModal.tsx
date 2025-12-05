import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Animated,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { getLevelTitle, getLevelColor } from '@/lib/levels';

const { width } = Dimensions.get('window');

interface LevelUpModalProps {
    visible: boolean;
    newLevel: number;
    onClose: () => void;
}

export default function LevelUpModal({ visible, newLevel, onClose }: LevelUpModalProps) {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const starScale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Reset animations
            scaleAnim.setValue(0);
            rotateAnim.setValue(0);
            starScale.setValue(0);

            // Play entrance animation
            Animated.sequence([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 4,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.parallel([
                    Animated.timing(rotateAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.spring(starScale, {
                        toValue: 1,
                        friction: 3,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start();
        }
    }, [visible]);

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const levelColor = getLevelColor(newLevel);
    const levelTitle = getLevelTitle(newLevel);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <BlurView intensity={80} style={styles.overlay}>
                <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
                    <LinearGradient
                        colors={[levelColor, '#1a1a2e']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.card}
                    >
                        {/* Stars decoration */}
                        <Animated.View style={[styles.starsContainer, { transform: [{ scale: starScale }] }]}>
                            <Ionicons name="star" size={24} color="#FFD700" style={styles.star1} />
                            <Ionicons name="star" size={16} color="#FFD700" style={styles.star2} />
                            <Ionicons name="star" size={20} color="#FFD700" style={styles.star3} />
                        </Animated.View>

                        {/* Level badge */}
                        <Animated.View style={[styles.levelBadge, { transform: [{ rotate }] }]}>
                            <LinearGradient
                                colors={['#FFD700', '#FFA500']}
                                style={styles.badgeGradient}
                            >
                                <Text style={styles.levelNumber}>{newLevel}</Text>
                            </LinearGradient>
                        </Animated.View>

                        <Text style={styles.levelUpText}>LEVEL UP!</Text>
                        <Text style={styles.titleText}>{levelTitle}</Text>

                        <View style={styles.divider} />

                        <Text style={styles.messageText}>
                            Congratulations! You've reached level {newLevel}!
                        </Text>
                        <Text style={styles.rewardText}>
                            Keep solving problems to level up further!
                        </Text>

                        <TouchableOpacity style={styles.continueBtn} onPress={onClose}>
                            <Text style={styles.continueBtnText}>Continue</Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </TouchableOpacity>
                    </LinearGradient>
                </Animated.View>
            </BlurView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    container: {
        width: width - 48,
        borderRadius: 24,
        overflow: 'hidden',
    },
    card: {
        padding: 32,
        alignItems: 'center',
    },
    starsContainer: {
        position: 'absolute',
        top: 16,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    star1: { position: 'absolute', top: 0, left: 40 },
    star2: { position: 'absolute', top: 20, right: 50 },
    star3: { position: 'absolute', top: 10, right: 80 },
    levelBadge: {
        marginBottom: 16,
    },
    badgeGradient: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 10,
    },
    levelNumber: {
        fontSize: 48,
        fontWeight: '900',
        color: '#1a1a2e',
    },
    levelUpText: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFD700',
        letterSpacing: 4,
        marginBottom: 8,
    },
    titleText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
        opacity: 0.9,
    },
    divider: {
        width: 60,
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 2,
        marginVertical: 20,
    },
    messageText: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    rewardText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        marginBottom: 24,
    },
    continueBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 30,
    },
    continueBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});
