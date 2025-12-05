import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    SafeAreaView,
    ScrollView,
    Switch,
    Share,
    Linking,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Fonts, Spacing, BorderRadius } from '@/constants/Theme';
import { useSettingsStore, useGameStore } from '@/stores/gameStore';

interface DrawerMenuProps {
    visible: boolean;
    onClose: () => void;
}

interface MenuItem {
    icon: string;
    label: string;
    onPress: () => void;
    color?: string;
    rightElement?: React.ReactNode;
}

export default function DrawerMenu({ visible, onClose }: DrawerMenuProps) {
    const router = useRouter();
    const { darkMode, setDarkMode, soundEnabled, setSoundEnabled } = useSettingsStore();
    const { clearHistory, history } = useGameStore();

    const handleShare = async () => {
        try {
            await Share.share({
                message: '🧮 Check out Mental Math Pro! Train your brain with fun math challenges. Download now!',
                title: 'Mental Math Pro',
            });
        } catch (error) {
            console.log(error);
        }
        onClose();
    };

    const handleRandomGame = () => {
        onClose();
        // Random mode selection
        const modes = ['practice', 'speedrun', 'timeattack', 'survival'];
        const randomMode = modes[Math.floor(Math.random() * modes.length)];
        router.push(`/game/setup?mode=${randomMode}`);
    };

    const handleHistory = () => {
        onClose();
        router.push('/(tabs)/insights');
    };

    const handleFeedback = () => {
        Linking.openURL('mailto:feedback@mentalmathpro.com?subject=Mental Math Pro Feedback');
        onClose();
    };

    const handleRate = () => {
        Alert.alert('Rate Us', 'Thank you for your support! Rating will be available once the app is on the App Store.');
        onClose();
    };

    const handleResetApp = () => {
        Alert.alert(
            'Reset App',
            'This will clear all your game history and settings. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {
                        clearHistory();
                        onClose();
                    }
                }
            ]
        );
    };

    const menuItems: MenuItem[] = [
        { icon: 'share-social', label: 'Share App', onPress: handleShare, color: '#10B981' },
        { icon: 'shuffle', label: 'Random Game', onPress: handleRandomGame, color: '#8B5CF6' },
        { icon: 'time', label: 'History', onPress: handleHistory, color: '#3B82F6' },
    ];

    const settingsItems: MenuItem[] = [
        {
            icon: 'moon',
            label: 'Dark Mode',
            onPress: () => setDarkMode(!darkMode),
            color: '#6366F1',
            rightElement: (
                <Switch
                    value={darkMode}
                    onValueChange={setDarkMode}
                    trackColor={{ false: '#ddd', true: '#6366F1' }}
                    thumbColor="#fff"
                />
            )
        },
        {
            icon: 'volume-high',
            label: 'Sound Effects',
            onPress: () => setSoundEnabled(!soundEnabled),
            color: '#F59E0B',
            rightElement: (
                <Switch
                    value={soundEnabled}
                    onValueChange={setSoundEnabled}
                    trackColor={{ false: '#ddd', true: '#F59E0B' }}
                    thumbColor="#fff"
                />
            )
        },
    ];

    const moreItems: MenuItem[] = [
        { icon: 'information-circle', label: 'About', onPress: () => { onClose(); router.push('/(tabs)/settings'); }, color: '#6B7280' },
        { icon: 'chatbubble-ellipses', label: 'Feedback', onPress: handleFeedback, color: '#EC4899' },
        { icon: 'star', label: 'Rate Us', onPress: handleRate, color: '#FBBF24' },
    ];

    const renderMenuItem = (item: MenuItem, index: number) => (
        <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.iconBox, { backgroundColor: (item.color || '#666') + '20' }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color || '#666'} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            {item.rightElement || <Ionicons name="chevron-forward" size={20} color="#ccc" />}
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

                <View style={styles.drawer}>
                    <SafeAreaView style={styles.drawerContent}>
                        {/* Logo Header */}
                        <View style={styles.header}>
                            <View style={styles.logo}>
                                <Text style={[styles.logoSymbol, { color: '#10B981' }]}>+</Text>
                                <Text style={[styles.logoSymbol, { color: '#EF4444' }]}>−</Text>
                                <Text style={[styles.logoSymbol, { color: '#F59E0B' }]}>×</Text>
                                <Text style={[styles.logoSymbol, { color: '#3B82F6' }]}>÷</Text>
                            </View>
                            <Text style={styles.appName}>Mental Math Pro</Text>
                            <Text style={styles.tagline}>Train your brain daily</Text>
                        </View>

                        <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
                            {/* Main Menu */}
                            <View style={styles.section}>
                                {menuItems.map(renderMenuItem)}
                            </View>

                            {/* Settings */}
                            <Text style={styles.sectionTitle}>Settings</Text>
                            <View style={styles.section}>
                                {settingsItems.map(renderMenuItem)}
                            </View>

                            {/* More */}
                            <Text style={styles.sectionTitle}>More</Text>
                            <View style={styles.section}>
                                {moreItems.map(renderMenuItem)}
                            </View>
                        </ScrollView>

                        {/* Reset Button */}
                        <TouchableOpacity style={styles.resetBtn} onPress={handleResetApp}>
                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                            <Text style={styles.resetText}>Reset App</Text>
                        </TouchableOpacity>

                        {/* Stats Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                {history.length} games played
                            </Text>
                        </View>
                    </SafeAreaView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        flexDirection: 'row',
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    drawer: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 280,
        backgroundColor: '#fff',
    },
    drawerContent: {
        flex: 1,
    },
    header: {
        padding: Spacing.xl,
        paddingTop: Spacing['2xl'],
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        alignItems: 'center',
    },
    logo: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: Spacing.md,
    },
    logoSymbol: {
        fontSize: 32,
        fontWeight: '800',
    },
    appName: {
        fontSize: Fonts.xl,
        fontWeight: Fonts.bold,
        color: '#1a1a2e',
    },
    tagline: {
        fontSize: Fonts.sm,
        color: '#666',
        marginTop: 4,
    },
    menuList: {
        flex: 1,
        padding: Spacing.md,
    },
    section: {
        backgroundColor: '#f8f8f8',
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: Fonts.xs,
        fontWeight: Fonts.semibold,
        color: '#999',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginLeft: Spacing.sm,
        marginBottom: Spacing.xs,
        marginTop: Spacing.md,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuLabel: {
        flex: 1,
        fontSize: Fonts.base,
        fontWeight: '500',
        color: '#333',
        marginLeft: Spacing.md,
    },
    resetBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.md,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
        gap: 6,
    },
    resetText: {
        fontSize: Fonts.sm,
        color: '#EF4444',
        fontWeight: '500',
    },
    footer: {
        padding: Spacing.md,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    footerText: {
        fontSize: Fonts.xs,
        color: '#999',
    },
});
