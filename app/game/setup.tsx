import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Colors, Fonts, Spacing, BorderRadius, GameModes, GameMode } from '@/constants/Theme';
import { useGameStore } from '@/stores/gameStore';

const { width } = Dimensions.get('window');

// Operation config
interface OperationConfig {
    enabled: boolean;
    maxNumber: number;
}

type OperationType = 'add' | 'subtract' | 'multiply' | 'divide';

const OPERATIONS: { key: OperationType; symbol: string; label: string; color: string; defaultMax: number; maxLimit: number }[] = [
    { key: 'add', symbol: '+', label: 'Addition', color: '#10B981', defaultMax: 100, maxLimit: 999 },
    { key: 'subtract', symbol: '−', label: 'Subtraction', color: '#EF4444', defaultMax: 100, maxLimit: 999 },
    { key: 'multiply', symbol: '×', label: 'Multiplication', color: '#F59E0B', defaultMax: 12, maxLimit: 20 },
    { key: 'divide', symbol: '÷', label: 'Division', color: '#3B82F6', defaultMax: 12, maxLimit: 20 },
];

export default function PlaySetupScreen() {
    const { mode } = useLocalSearchParams<{ mode: GameMode }>();
    const router = useRouter();
    const { setGameConfig } = useGameStore();

    const modeInfo = GameModes[mode || 'practice'];

    // Problem count (5-50)
    const [problemCount, setProblemCount] = useState(20);

    // Operation settings
    const [operations, setOperations] = useState<Record<OperationType, OperationConfig>>({
        add: { enabled: true, maxNumber: 100 },
        subtract: { enabled: true, maxNumber: 100 },
        multiply: { enabled: true, maxNumber: 12 },
        divide: { enabled: false, maxNumber: 12 },
    });

    const toggleOperation = (key: OperationType) => {
        // Ensure at least one operation is enabled
        const enabledCount = Object.values(operations).filter(o => o.enabled).length;
        if (enabledCount === 1 && operations[key].enabled) return;

        setOperations(prev => ({
            ...prev,
            [key]: { ...prev[key], enabled: !prev[key].enabled }
        }));
    };

    const updateMaxNumber = (key: OperationType, value: number) => {
        setOperations(prev => ({
            ...prev,
            [key]: { ...prev[key], maxNumber: Math.round(value) }
        }));
    };

    const handleStart = () => {
        // Save config and start game
        setGameConfig({
            problemCount,
            operations,
        });
        router.push(`/game/${mode}`);
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={modeInfo.gradient as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.background}
            />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.titleArea}>
                        <Text style={styles.title}>{modeInfo.icon} {modeInfo.name}</Text>
                        <Text style={styles.subtitle}>Configure your game</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Problem Count */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIcon}>
                                <Text style={styles.iconText}>#</Text>
                            </View>
                            <Text style={styles.sectionTitle}>Number of Problems</Text>
                            <Text style={styles.countValue}>{problemCount}</Text>
                        </View>
                        <Slider
                            style={styles.slider}
                            minimumValue={12}
                            maximumValue={20}
                            step={1}
                            value={problemCount}
                            onValueChange={setProblemCount}
                            minimumTrackTintColor="#fff"
                            maximumTrackTintColor="rgba(255,255,255,0.3)"
                            thumbTintColor="#fff"
                        />
                        <View style={styles.sliderLabels}>
                            <Text style={styles.sliderLabel}>12</Text>
                            <Text style={styles.sliderLabel}>20</Text>
                        </View>
                    </View>

                    {/* Operations */}
                    <Text style={styles.operationsTitle}>Select Operations & Difficulty</Text>

                    {OPERATIONS.map((op) => {
                        const config = operations[op.key];
                        return (
                            <View key={op.key} style={styles.operationCard}>
                                <TouchableOpacity
                                    style={styles.operationHeader}
                                    onPress={() => toggleOperation(op.key)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[
                                        styles.operationSymbol,
                                        { backgroundColor: config.enabled ? op.color : 'rgba(255,255,255,0.2)' }
                                    ]}>
                                        <Text style={styles.symbolText}>{op.symbol}</Text>
                                    </View>
                                    <Text style={[
                                        styles.operationLabel,
                                        !config.enabled && styles.disabledLabel
                                    ]}>
                                        {op.label}
                                    </Text>
                                    <View style={[
                                        styles.checkbox,
                                        config.enabled && { backgroundColor: op.color, borderColor: op.color }
                                    ]}>
                                        {config.enabled && (
                                            <Ionicons name="checkmark" size={16} color="#fff" />
                                        )}
                                    </View>
                                </TouchableOpacity>

                                {config.enabled && (
                                    <View style={styles.difficultyArea}>
                                        <View style={styles.difficultyHeader}>
                                            <Text style={styles.difficultyLabel}>Max number:</Text>
                                            <Text style={[styles.difficultyValue, { color: op.color }]}>
                                                {config.maxNumber}
                                            </Text>
                                        </View>
                                        <Slider
                                            style={styles.diffSlider}
                                            minimumValue={op.key === 'multiply' || op.key === 'divide' ? 5 : 10}
                                            maximumValue={op.maxLimit}
                                            value={config.maxNumber}
                                            onValueChange={(val) => updateMaxNumber(op.key, val)}
                                            minimumTrackTintColor={op.color}
                                            maximumTrackTintColor="rgba(255,255,255,0.2)"
                                            thumbTintColor={op.color}
                                        />
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </ScrollView>

                {/* Start Button */}
                <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.9}>
                    <Ionicons name="play" size={24} color={modeInfo.gradient[0]} />
                    <Text style={[styles.startText, { color: modeInfo.gradient[0] }]}>Start</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    background: { ...StyleSheet.absoluteFillObject },
    safeArea: { flex: 1 },
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleArea: { alignItems: 'center' },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 2,
    },
    placeholder: { width: 44 },
    // Scroll
    scroll: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 32 },
    // Problem Count Section
    section: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    sectionTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginLeft: 12,
    },
    countValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
    },
    slider: { width: '100%', height: 40 },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    sliderLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
    },
    // Operations
    operationsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 12,
    },
    operationCard: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
    },
    operationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
    },
    operationSymbol: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    symbolText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
    },
    operationLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginLeft: 12,
    },
    disabledLabel: {
        color: 'rgba(255,255,255,0.5)',
    },
    checkbox: {
        width: 28,
        height: 28,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    difficultyArea: {
        paddingHorizontal: 14,
        paddingBottom: 14,
        paddingLeft: 70,
    },
    difficultyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    difficultyLabel: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
    },
    difficultyValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    diffSlider: { width: '100%', height: 32 },
    // Start Button
    startBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 16,
        paddingVertical: 16,
        borderRadius: 28,
        gap: 8,
    },
    startText: {
        fontSize: 20,
        fontWeight: '700',
    },
});
