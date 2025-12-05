import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Achievement, RARITY_COLORS } from '@/lib/achievements';

const { width } = Dimensions.get('window');

interface AchievementPopupProps {
    achievement: Achievement | null;
    visible: boolean;
    onDismiss: () => void;
}

export default function AchievementPopup({ achievement, visible, onDismiss }: AchievementPopupProps) {
    const translateY = useRef(new Animated.Value(-150)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        if (visible && achievement) {
            // Slide in from top
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    friction: 6,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(scale, {
                    toValue: 1,
                    friction: 4,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto dismiss after 3 seconds
            const timer = setTimeout(() => {
                dismissPopup();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [visible, achievement]);

    const dismissPopup = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -150,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onDismiss();
        });
    };

    if (!achievement) return null;

    const rarityColor = RARITY_COLORS[achievement.rarity];

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY }, { scale }],
                    opacity,
                },
            ]}
        >
            <View style={[styles.popup, { borderLeftColor: rarityColor }]}>
                <View style={[styles.iconContainer, { backgroundColor: rarityColor }]}>
                    <Ionicons name={achievement.icon as any} size={24} color="#fff" />
                </View>
                <View style={styles.content}>
                    <Text style={styles.label}>ACHIEVEMENT UNLOCKED!</Text>
                    <Text style={styles.name}>{achievement.name}</Text>
                    <Text style={styles.description}>{achievement.description}</Text>
                </View>
                <View style={styles.xpContainer}>
                    <Text style={styles.xpAmount}>+{achievement.xpReward}</Text>
                    <Text style={styles.xpLabel}>XP</Text>
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        left: 16,
        right: 16,
        zIndex: 1000,
    },
    popup: {
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFD700',
        letterSpacing: 1,
        marginBottom: 2,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    description: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 2,
    },
    xpContainer: {
        alignItems: 'center',
        backgroundColor: 'rgba(255,215,0,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    xpAmount: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFD700',
    },
    xpLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: '#FFD700',
    },
});
