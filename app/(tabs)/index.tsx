import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Fonts, Spacing, BorderRadius, GameModes, GameMode } from '@/constants/Theme';
import { useGameStore, useSettingsStore } from '@/stores/gameStore';
import { getDailyChallenge, getTimeUntilNextChallenge, DailyChallenge } from '@/lib/dailyChallenge';
import DrawerMenu from '@/components/DrawerMenu';

const { width } = Dimensions.get('window');

// Classic game modes
const CLASSIC_MODES: GameMode[] = ['practice', 'speedrun', 'timeattack', 'survival'];
// New game types
const PUZZLE_MODES: GameMode[] = ['compare', 'truefalse', 'missing', 'sequence'];

export default function HomeScreen() {
  const router = useRouter();
  const { history, setMode } = useGameStore();
  const { hapticEnabled } = useSettingsStore();

  const [showDrawer, setShowDrawer] = useState(false);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0 });

  useEffect(() => {
    setDailyChallenge(getDailyChallenge());
    setTimeRemaining(getTimeUntilNextChallenge());

    const interval = setInterval(() => {
      setTimeRemaining(getTimeUntilNextChallenge());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const totalGames = history.length;
  const totalCorrect = history.reduce((sum, g) => sum + g.correctCount, 0);
  const bestScore = history.length > 0 ? Math.max(...history.map(g => g.score)) : 0;

  const handleModePress = (mode: GameMode) => {
    if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMode(mode);

    // Puzzle games go directly to their game screen
    if (PUZZLE_MODES.includes(mode)) {
      router.push(`/game/${mode}`);
    } else {
      // Classic modes go through setup
      router.push(`/game/setup?mode=${mode}`);
    }
  };

  const handleDailyChallenge = () => {
    if (!dailyChallenge) return;
    if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/game/practice?daily=true`);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />

      <View style={[styles.bubble, styles.bubble1]} />
      <View style={[styles.bubble, styles.bubble2]} />
      <View style={[styles.bubble, styles.bubble3]} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header with Menu */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => setShowDrawer(true)}
          >
            <Ionicons name="menu" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Mental Math</Text>
          <TouchableOpacity
            style={styles.statsBtn}
            onPress={() => router.push('/(tabs)/insights')}
          >
            <Ionicons name="stats-chart" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Stats */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalGames}</Text>
              <Text style={styles.statLabel}>Games</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalCorrect}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{bestScore}</Text>
              <Text style={styles.statLabel}>Best</Text>
            </View>
          </View>

          {/* Daily Challenge */}
          {dailyChallenge && (
            <TouchableOpacity
              style={styles.dailyCard}
              onPress={handleDailyChallenge}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#f093fb', '#f5576c']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.dailyGradient}
              >
                <View style={styles.dailyHeader}>
                  <Text style={styles.dailyEmoji}>{dailyChallenge.emoji}</Text>
                  <View style={styles.dailyInfo}>
                    <Text style={styles.dailyTitle}>{dailyChallenge.title}</Text>
                    <Text style={styles.dailyDesc}>{dailyChallenge.description}</Text>
                  </View>
                  <View style={styles.dailyReward}>
                    <Text style={styles.rewardText}>+{dailyChallenge.rewards.xp} XP</Text>
                  </View>
                </View>
                <View style={styles.dailyFooter}>
                  <View style={styles.dailyTimeRow}>
                    <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.dailyTime}>
                      {Math.floor(dailyChallenge.timeLimit / 60)}:{String(dailyChallenge.timeLimit % 60).padStart(2, '0')}
                    </Text>
                  </View>
                  <Text style={styles.dailyRefresh}>
                    New in {timeRemaining.hours}h {timeRemaining.minutes}m
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Classic Modes */}
          <View style={styles.sectionHeader}>
            <Ionicons name="star" size={20} color="#FBBF24" />
            <Text style={styles.sectionTitle}>Classic Modes</Text>
          </View>
          <View style={styles.modesGrid}>
            {CLASSIC_MODES.map((mode) => {
              const info = GameModes[mode];
              return (
                <TouchableOpacity
                  key={mode}
                  style={styles.modeCard}
                  onPress={() => handleModePress(mode)}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={info.gradient as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.modeGradient}
                  >
                    <View style={styles.iconBox}>
                      <Ionicons name={info.icon as any} size={22} color="#fff" />
                    </View>
                    <Text style={styles.modeName}>{info.name}</Text>
                    <Text style={styles.modeDesc}>{info.description}</Text>
                    <View style={styles.playButton}>
                      <Ionicons name="play" size={14} color="#fff" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Puzzle Modes */}
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb" size={20} color="#FBBF24" />
            <Text style={styles.sectionTitle}>Puzzle Games</Text>
          </View>
          <View style={styles.modesGrid}>
            {PUZZLE_MODES.map((mode) => {
              const info = GameModes[mode];
              return (
                <TouchableOpacity
                  key={mode}
                  style={styles.modeCard}
                  onPress={() => handleModePress(mode)}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={info.gradient as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.modeGradient}
                  >
                    <View style={styles.iconBox}>
                      <Ionicons name={info.icon as any} size={22} color="#fff" />
                    </View>
                    <Text style={styles.modeName}>{info.name}</Text>
                    <Text style={styles.modeDesc}>{info.description}</Text>
                    <View style={styles.playButton}>
                      <Ionicons name="play" size={14} color="#fff" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>

        </ScrollView>
      </SafeAreaView>

      {/* Drawer Menu */}
      <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { ...StyleSheet.absoluteFillObject },
  bubble: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  bubble1: { width: 120, height: 120, top: 50, right: -30 },
  bubble2: { width: 80, height: 80, top: 200, left: -20 },
  bubble3: { width: 60, height: 60, bottom: 150, right: 30 },
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: Spacing['3xl'] },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: Fonts.xl,
    fontWeight: Fonts.bold,
    color: '#fff',
  },
  statsBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Stats
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: Fonts.xl, fontWeight: Fonts.bold, color: '#fff' },
  statLabel: { fontSize: Fonts.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },

  // Daily
  dailyCard: { borderRadius: BorderRadius.xl, overflow: 'hidden', marginBottom: Spacing.xl },
  dailyGradient: { padding: Spacing.lg },
  dailyHeader: { flexDirection: 'row', alignItems: 'center' },
  dailyEmoji: { fontSize: 36 },
  dailyInfo: { flex: 1, marginLeft: Spacing.md },
  dailyTitle: { fontSize: Fonts.lg, fontWeight: Fonts.bold, color: '#fff' },
  dailyDesc: { fontSize: Fonts.sm, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  dailyReward: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  rewardText: { fontSize: Fonts.sm, fontWeight: Fonts.bold, color: '#fff' },
  dailyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  dailyTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dailyTime: { fontSize: Fonts.sm, color: 'rgba(255,255,255,0.8)' },
  dailyRefresh: { fontSize: Fonts.sm, color: 'rgba(255,255,255,0.7)' },

  // Sections
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Fonts.lg,
    fontWeight: Fonts.bold,
    color: '#fff',
  },

  // Mode cards
  modesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.lg },
  modeCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  modeGradient: {
    padding: Spacing.md,
    paddingBottom: 44,
    minHeight: 130,
    position: 'relative',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  modeName: { fontSize: Fonts.base, fontWeight: Fonts.bold, color: '#fff' },
  modeDesc: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 3,
    lineHeight: 15,
  },
  playButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
