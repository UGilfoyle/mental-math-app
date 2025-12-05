import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    Switch,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, BorderRadius, Difficulties, Difficulty, Operations } from '@/constants/Theme';
import { useSettingsStore, useGameStore } from '@/stores/gameStore';

// Operation settings type
type OperationKey = 'add' | 'subtract' | 'multiply' | 'divide';

interface OperationConfig {
    enabled: boolean;
    maxNumber: number;
}

export default function SettingsScreen() {
    const {
        soundEnabled,
        hapticEnabled,
        darkMode,
        defaultDifficulty,
        setSoundEnabled,
        setHapticEnabled,
        setDarkMode,
        setDefaultDifficulty,
    } = useSettingsStore();

    const { clearHistory, history } = useGameStore();

    // Operation-specific settings
    const [operationSettings, setOperationSettings] = useState<Record<OperationKey, OperationConfig>>({
        add: { enabled: true, maxNumber: 100 },
        subtract: { enabled: true, maxNumber: 100 },
        multiply: { enabled: true, maxNumber: 12 },
        divide: { enabled: true, maxNumber: 12 },
    });

    const operations: { key: OperationKey; icon: string; label: string; color: string; max: number }[] = [
        { key: 'add', icon: '+', label: 'Addition', color: '#10B981', max: 999 },
        { key: 'subtract', icon: '−', label: 'Subtraction', color: '#EF4444', max: 999 },
        { key: 'multiply', icon: '×', label: 'Multiplication', color: '#F59E0B', max: 99 },
        { key: 'divide', icon: '÷', label: 'Division', color: '#3B82F6', max: 99 },
    ];

    const toggleOperation = (key: OperationKey) => {
        setOperationSettings(prev => ({
            ...prev,
            [key]: { ...prev[key], enabled: !prev[key].enabled }
        }));
    };

    const updateMaxNumber = (key: OperationKey, value: number) => {
        setOperationSettings(prev => ({
            ...prev,
            [key]: { ...prev[key], maxNumber: Math.round(value) }
        }));
    };

    const handleClearData = () => {
        Alert.alert(
            'Clear All Data',
            'This will delete all your game history and statistics. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: () => clearHistory(),
                },
            ]
        );
    };

    // Calculate stats by operation
    const statsByOperation = history.reduce((acc, game) => {
        const op = game.operation || 'add';
        if (!acc[op]) acc[op] = { games: 0, correct: 0, total: 0 };
        acc[op].games++;
        acc[op].correct += game.correctCount;
        acc[op].total += game.totalCount;
        return acc;
    }, {} as Record<string, { games: number; correct: number; total: number }>);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>⚙️ Settings</Text>

                {/* Operations Section */}
                <Text style={styles.sectionTitle}>Operations & Limits</Text>
                <View style={styles.section}>
                    {operations.map((op, index) => {
                        const config = operationSettings[op.key];
                        const stats = statsByOperation[op.key];

                        return (
                            <React.Fragment key={op.key}>
                                <View style={styles.operationCard}>
                                    <View style={styles.operationHeader}>
                                        <View style={[styles.operationIcon, { backgroundColor: op.color + '20' }]}>
                                            <Text style={[styles.operationSymbol, { color: op.color }]}>
                                                {op.icon}
                                            </Text>
                                        </View>
                                        <View style={styles.operationInfo}>
                                            <Text style={styles.operationLabel}>{op.label}</Text>
                                            {stats && (
                                                <Text style={styles.operationStats}>
                                                    {stats.games} games • {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}% accuracy
                                                </Text>
                                            )}
                                        </View>
                                        <Switch
                                            value={config.enabled}
                                            onValueChange={() => toggleOperation(op.key)}
                                            trackColor={{ false: Colors.surfaceLight, true: op.color + '60' }}
                                            thumbColor={config.enabled ? op.color : Colors.textMuted}
                                        />
                                    </View>

                                    {config.enabled && (
                                        <View style={styles.sliderArea}>
                                            <View style={styles.sliderHeader}>
                                                <Text style={styles.sliderLabel}>Max number:</Text>
                                                <Text style={[styles.sliderValue, { color: op.color }]}>
                                                    {config.maxNumber}
                                                </Text>
                                            </View>
                                            <Slider
                                                style={styles.slider}
                                                minimumValue={op.key === 'multiply' || op.key === 'divide' ? 5 : 10}
                                                maximumValue={op.max}
                                                value={config.maxNumber}
                                                onValueChange={(val) => updateMaxNumber(op.key, val)}
                                                minimumTrackTintColor={op.color}
                                                maximumTrackTintColor={Colors.surfaceLight}
                                                thumbTintColor={op.color}
                                            />
                                            <View style={styles.sliderMarks}>
                                                <Text style={styles.markText}>{op.key === 'multiply' || op.key === 'divide' ? 5 : 10}</Text>
                                                <Text style={styles.markText}>{op.max}</Text>
                                            </View>
                                        </View>
                                    )}
                                </View>
                                {index < operations.length - 1 && <View style={styles.divider} />}
                            </React.Fragment>
                        );
                    })}
                </View>

                {/* Sound & Haptics Section */}
                <Text style={styles.sectionTitle}>Feedback</Text>
                <View style={styles.section}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Ionicons name="volume-high" size={22} color={Colors.primary} />
                            <View style={styles.settingText}>
                                <Text style={styles.settingLabel}>Sound Effects</Text>
                                <Text style={styles.settingDesc}>Play sounds for answers</Text>
                            </View>
                        </View>
                        <Switch
                            value={soundEnabled}
                            onValueChange={setSoundEnabled}
                            trackColor={{ false: Colors.surfaceLight, true: Colors.primary + '60' }}
                            thumbColor={soundEnabled ? Colors.primary : Colors.textMuted}
                        />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Ionicons name="phone-portrait" size={22} color={Colors.primary} />
                            <View style={styles.settingText}>
                                <Text style={styles.settingLabel}>Haptic Feedback</Text>
                                <Text style={styles.settingDesc}>Vibrate on button press</Text>
                            </View>
                        </View>
                        <Switch
                            value={hapticEnabled}
                            onValueChange={setHapticEnabled}
                            trackColor={{ false: Colors.surfaceLight, true: Colors.primary + '60' }}
                            thumbColor={hapticEnabled ? Colors.primary : Colors.textMuted}
                        />
                    </View>
                </View>

                {/* History Summary */}
                <Text style={styles.sectionTitle}>History Summary</Text>
                <View style={styles.section}>
                    <View style={styles.historyGrid}>
                        {operations.map(op => {
                            const stats = statsByOperation[op.key];
                            return (
                                <View key={op.key} style={styles.historyItem}>
                                    <View style={[styles.historyIcon, { backgroundColor: op.color + '20' }]}>
                                        <Text style={[styles.historySymbol, { color: op.color }]}>{op.icon}</Text>
                                    </View>
                                    <Text style={styles.historyGames}>{stats?.games || 0}</Text>
                                    <Text style={styles.historyLabel}>games</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Data Section */}
                <Text style={styles.sectionTitle}>Data</Text>
                <View style={styles.section}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Ionicons name="stats-chart" size={22} color={Colors.teal} />
                            <View style={styles.settingText}>
                                <Text style={styles.settingLabel}>Total Games</Text>
                                <Text style={styles.settingDesc}>{history.length} games recorded</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.dangerRow} onPress={handleClearData}>
                        <View style={styles.settingInfo}>
                            <Ionicons name="trash" size={22} color={Colors.wrong} />
                            <View style={styles.settingText}>
                                <Text style={[styles.settingLabel, styles.dangerText]}>Clear All Data</Text>
                                <Text style={styles.settingDesc}>Delete all game history</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>🧮 Mental Math Pro</Text>
                    <Text style={styles.footerSubtext}>Version 1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scroll: { flex: 1 },
    scrollContent: { padding: Spacing.lg, paddingTop: Spacing['2xl'] },
    title: {
        fontSize: Fonts['3xl'],
        fontWeight: Fonts.bold,
        color: Colors.text,
        marginBottom: Spacing['2xl'],
    },
    sectionTitle: {
        fontSize: Fonts.sm,
        fontWeight: Fonts.semibold,
        color: Colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: Spacing.md,
        marginTop: Spacing.lg,
    },
    section: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
    },
    // Operation cards
    operationCard: { padding: Spacing.lg },
    operationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    operationIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    operationSymbol: { fontSize: 24, fontWeight: '700' },
    operationInfo: { flex: 1, marginLeft: Spacing.md },
    operationLabel: {
        fontSize: Fonts.base,
        fontWeight: Fonts.medium,
        color: Colors.text,
    },
    operationStats: {
        fontSize: Fonts.xs,
        color: Colors.textMuted,
        marginTop: 2,
    },
    sliderArea: { marginTop: Spacing.md, paddingLeft: 56 },
    sliderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    sliderLabel: { fontSize: Fonts.sm, color: Colors.textMuted },
    sliderValue: { fontSize: Fonts.base, fontWeight: Fonts.bold },
    slider: { width: '100%', height: 32 },
    sliderMarks: { flexDirection: 'row', justifyContent: 'space-between' },
    markText: { fontSize: Fonts.xs, color: Colors.textDim },
    // Settings
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    settingInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    settingText: { marginLeft: Spacing.md, flex: 1 },
    settingLabel: { fontSize: Fonts.base, fontWeight: Fonts.medium, color: Colors.text },
    settingDesc: { fontSize: Fonts.sm, color: Colors.textMuted, marginTop: 2 },
    divider: { height: 1, backgroundColor: Colors.surfaceLight, marginHorizontal: Spacing.lg },
    dangerRow: { padding: Spacing.lg },
    dangerText: { color: Colors.wrong },
    // History grid
    historyGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: Spacing.md,
    },
    historyItem: {
        width: '25%',
        alignItems: 'center',
        paddingVertical: Spacing.md,
    },
    historyIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    historySymbol: { fontSize: 20, fontWeight: '700' },
    historyGames: { fontSize: Fonts.lg, fontWeight: Fonts.bold, color: Colors.text },
    historyLabel: { fontSize: Fonts.xs, color: Colors.textMuted },
    // Footer
    footer: { alignItems: 'center', marginTop: Spacing['3xl'], marginBottom: Spacing['2xl'] },
    footerText: { fontSize: Fonts.lg, fontWeight: Fonts.semibold, color: Colors.text },
    footerSubtext: { fontSize: Fonts.sm, color: Colors.textMuted, marginTop: Spacing.xs },
});
