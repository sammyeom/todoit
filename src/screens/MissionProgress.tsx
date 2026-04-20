import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { generateHapticFeedback } from '@apps-in-toss/framework';
import { theme } from '../theme';
import type { Mission } from '../data/missions';

interface MissionProgressProps {
  mission: Mission;
  onComplete: () => void;
  onGiveUp: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const RING_SIZE = 220;
const STROKE_WIDTH = 12;

export default function MissionProgress({
  mission,
  onComplete,
  onGiveUp,
}: MissionProgressProps) {
  if (mission.type === 'timer' && mission.duration != null) {
    return (
      <TimerMission
        mission={mission}
        duration={mission.duration}
        onComplete={onComplete}
        onGiveUp={onGiveUp}
      />
    );
  }

  return (
    <CheckMission
      mission={mission}
      onComplete={onComplete}
      onGiveUp={onGiveUp}
    />
  );
}

// ─── Timer Mission ──────────────────────────────────────────

interface TimerMissionProps {
  mission: Mission;
  duration: number;
  onComplete: () => void;
  onGiveUp: () => void;
}

function TimerMission({ mission, duration, onComplete, onGiveUp }: TimerMissionProps) {
  const [remaining, setRemaining] = useState(duration);
  const progress = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: duration * 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 800, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (remaining <= 0) {
      void (async () => {
        try { await generateHapticFeedback({ type: 'success' }); } catch {}
      })();
      onComplete();
      return;
    }
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining, onComplete]);

  const fraction = (duration - remaining) / duration;

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.emojiLarge, { transform: [{ scale: pulseAnim }] }]}>
        {mission.emoji}
      </Animated.Text>
      <Text style={styles.missionTitle}>{mission.title}</Text>

      <View style={styles.ringContainer}>
        <View style={styles.ringBg} />
        <View style={[styles.ringFill, { transform: [{ rotate: `${fraction * 360}deg` }] }]} />
        <View style={styles.ringCenter}>
          <Text style={styles.timerText}>{formatTime(remaining)}</Text>
          <Text style={styles.timerLabel}>남은 시간</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      <TouchableOpacity style={styles.btnGhost} onPress={onGiveUp} activeOpacity={0.7}>
        <Text style={styles.btnGhostText}>포기하기</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Check Mission ──────────────────────────────────────────

interface CheckMissionProps {
  mission: Mission;
  onComplete: () => void;
  onGiveUp: () => void;
}

function CheckMission({ mission, onComplete, onGiveUp }: CheckMissionProps) {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleComplete = useCallback(async () => {
    try { await generateHapticFeedback({ type: 'success' }); } catch {}
    onComplete();
  }, [onComplete]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.checkCard, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.emojiHuge}>{mission.emoji}</Text>
        <Text style={styles.checkTitle}>{mission.title}</Text>
        <Text style={styles.checkDesc}>{mission.description}</Text>
      </Animated.View>

      <View style={styles.buttonArea}>
        <TouchableOpacity
          style={styles.btnComplete}
          onPress={handleComplete}
          activeOpacity={0.85}
        >
          <Text style={styles.btnCompleteText}>완료했어요 ✅</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnGhost} onPress={onGiveUp} activeOpacity={0.7}>
          <Text style={styles.btnGhostText}>포기하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  emojiLarge: { fontSize: 56, marginBottom: 8 },
  missionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.text,
    marginBottom: 32,
    textAlign: 'center',
  },

  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  ringBg: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: STROKE_WIDTH,
    borderColor: theme.border,
  },
  ringFill: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: STROKE_WIDTH,
    borderColor: theme.primary,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  ringCenter: { alignItems: 'center', gap: 4 },
  timerText: {
    fontSize: 40,
    fontWeight: '900',
    color: theme.text,
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  timerLabel: { fontSize: 12, fontWeight: '600', color: theme.textSub },

  progressBar: {
    width: '80%',
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.border,
    overflow: 'hidden',
    marginBottom: 32,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: theme.primary,
  },

  btnGhost: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 9999,
  },
  btnGhostText: { color: theme.ghost, fontSize: 14, fontWeight: '700' },

  // Check mission
  checkCard: {
    width: '100%',
    backgroundColor: theme.card,
    borderRadius: 28,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
    gap: 12,
  },
  emojiHuge: { fontSize: 80, lineHeight: 90 },
  checkTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.text,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  checkDesc: {
    fontSize: 15,
    color: theme.textSub,
    fontWeight: '500',
    textAlign: 'center',
  },

  buttonArea: { width: '100%', marginTop: 32, gap: 12 },
  btnComplete: {
    height: 56,
    borderRadius: 9999,
    backgroundColor: theme.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
  btnCompleteText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
});
