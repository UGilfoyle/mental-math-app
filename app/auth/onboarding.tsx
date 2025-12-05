import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, BorderRadius } from '@/constants/Theme';
import { AgeGroup } from '@/lib/problems';

const AGE_GROUPS: { key: AgeGroup; emoji: string; title: string; ages: string; topics: string }[] = [
    {
        key: 'kids',
        emoji: '🌱',
        title: 'Kids',
        ages: '5-10 years',
        topics: 'Basic +−×÷, Counting',
    },
    {
        key: 'junior',
        emoji: '🌿',
        title: 'Junior',
        ages: '10-14 years',
        topics: 'Fractions, Decimals, %',
    },
    {
        key: 'teen',
        emoji: '🌳',
        title: 'Teen',
        ages: '14-18 years',
        topics: 'Algebra, Powers, Roots',
    },
    {
        key: 'adult',
        emoji: '🎓',
        title: 'Adult',
        ages: '18+ years',
        topics: 'Mental tricks, Speed calc',
    },
    {
        key: 'expert',
        emoji: '🏆',
        title: 'Expert',
        ages: 'Any age',
        topics: 'All topics, Max difficulty',
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const [selected, setSelected] = useState<AgeGroup | null>(null);

    const handleContinue = () => {
        if (!selected) return;
        // TODO: Save to Supabase profile
        // await profiles.setAgeGroup(userId, selected);
        router.replace('/(tabs)');
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.background}
            />

            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.emoji}>👋</Text>
                        <Text style={styles.title}>Welcome!</Text>
                        <Text style={styles.subtitle}>
                            Choose your level to get personalized math challenges
                        </Text>
                    </View>

                    {/* Age Group Cards */}
                    <View style={styles.cards}>
                        {AGE_GROUPS.map((group) => (
                            <TouchableOpacity
                                key={group.key}
                                style={[
                                    styles.card,
                                    selected === group.key && styles.cardSelected,
                                ]}
                                onPress={() => setSelected(group.key)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.cardEmoji}>{group.emoji}</Text>
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle}>{group.title}</Text>
                                    <Text style={styles.cardAges}>{group.ages}</Text>
                                    <Text style={styles.cardTopics}>{group.topics}</Text>
                                </View>
                                {selected === group.key && (
                                    <View style={styles.checkCircle}>
                                        <Ionicons name="checkmark" size={18} color="#fff" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Continue Button */}
                    <TouchableOpacity
                        style={[styles.continueButton, !selected && styles.continueDisabled]}
                        onPress={handleContinue}
                        disabled={!selected}
                    >
                        <Text style={styles.continueText}>Continue</Text>
                        <Ionicons name="arrow-forward" size={20} color={selected ? '#7C3AED' : 'rgba(0,0,0,0.3)'} />
                    </TouchableOpacity>

                    <Text style={styles.note}>
                        💡 You can change this anytime in Settings
                    </Text>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    safeArea: {
        flex: 1,
    },
    content: {
        padding: Spacing.xl,
        paddingTop: Spacing['2xl'],
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing['2xl'],
    },
    emoji: {
        fontSize: 56,
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: Fonts['3xl'],
        fontWeight: Fonts.extrabold,
        color: '#fff',
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: Fonts.base,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        lineHeight: 22,
    },
    cards: {
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: BorderRadius.xl,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.15)',
        padding: Spacing.lg,
        gap: Spacing.lg,
    },
    cardSelected: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderColor: '#fff',
    },
    cardEmoji: {
        fontSize: 36,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: Fonts.lg,
        fontWeight: Fonts.bold,
        color: '#fff',
    },
    cardAges: {
        fontSize: Fonts.sm,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 2,
    },
    cardTopics: {
        fontSize: Fonts.xs,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 4,
    },
    checkCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
    },
    continueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        backgroundColor: '#fff',
        paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.xl,
        marginBottom: Spacing.lg,
    },
    continueDisabled: {
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    continueText: {
        fontSize: Fonts.lg,
        fontWeight: Fonts.bold,
        color: '#7C3AED',
    },
    note: {
        fontSize: Fonts.sm,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
    },
});
