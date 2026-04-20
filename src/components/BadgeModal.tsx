import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Modal,
} from 'react-native';
import { theme } from '../theme';
import { haptic } from '../utils/hapticUtils';
import { BADGE_DEFS, type BadgeDef } from '../hooks/useMissionState';
import type { MissionState } from '../hooks/useMissionState';
import { shareBadge } from '../utils/shareUtils';

interface BadgeModalProps {
  badgeIds: string[];
  state: MissionState;
  onDismiss: () => void;
}

const CONFETTI_EMOJIS = ['🎉', '✨', '🌟', '💫', '🎊', '⭐', '🔥', '💜', '🏆', '👏'];

export default function BadgeModal({ badgeIds, state, onDismiss }: BadgeModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(-0.2)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    Array.from({ length: 10 }, () => ({
      y: new Animated.Value(-10),
      x: new Animated.Value(0),
      opacity: new Animated.Value(1),
    })),
  ).current;

  const badges: BadgeDef[] = badgeIds
    .map((id) => BADGE_DEFS.find((b) => b.id === id))
    .filter((b): b is BadgeDef => b != null);

  const badge = badges[0];

  useEffect(() => {
    if (!badge) return;

    void haptic.badge();

    // Backdrop fade-in
    Animated.timing(bgOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Badge entrance
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.back(2)),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Confetti burst
    confettiAnims.forEach((anim, i) => {
      const delay = i * 60;
      const targetX = (Math.random() - 0.5) * 280;
      const targetY = Math.random() * 350 + 150;

      Animated.sequence([
        Animated.delay(delay + 300),
        Animated.parallel([
          Animated.timing(anim.y, {
            toValue: targetY,
            duration: 1000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(anim.x, {
            toValue: targetX,
            duration: 1000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(700),
            Animated.timing(anim.opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!badge) return null;

  const handleShare = async () => {
    try {
      await shareBadge(badge, state);
    } catch {
      // 공유 실패 무시
    }
  };

  return (
    <Modal transparent animationType="none" visible>
      <Animated.View style={[styles.backdrop, { opacity: bgOpacity }]}>
        {/* Confetti layer */}
        <View style={styles.confettiLayer} pointerEvents="none">
          {confettiAnims.map((anim, i) => (
            <Animated.Text
              key={i}
              style={[
                styles.confettiPiece,
                {
                  transform: [
                    { translateX: anim.x },
                    { translateY: anim.y },
                  ],
                  opacity: anim.opacity,
                  left: `${10 + i * 8}%`,
                },
              ]}
            >
              {CONFETTI_EMOJIS[i % CONFETTI_EMOJIS.length]}
            </Animated.Text>
          ))}
        </View>

        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { scale: scaleAnim },
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [-0.2, 0],
                    outputRange: ['-12deg', '0deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.emojiCircle}>
            <Text style={styles.emojiText}>{badge.emoji}</Text>
          </View>

          <Text style={styles.title}>뱃지 획득!</Text>
          <Text style={styles.badgeName}>{badge.name}</Text>
          <Text style={styles.badgeDesc}>{badge.description}</Text>

          {badges.length > 1 && (
            <Text style={styles.extraBadge}>
              +{badges.length - 1}개 뱃지 추가 획득!
            </Text>
          )}

          <View style={styles.buttonArea}>
            <TouchableOpacity
              style={styles.btnShare}
              onPress={handleShare}
              activeOpacity={0.85}
            >
              <Text style={styles.btnShareText}>공유하기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnConfirm}
              onPress={onDismiss}
              activeOpacity={0.85}
            >
              <Text style={styles.btnConfirmText}>확인</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },

  confettiLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  confettiPiece: {
    position: 'absolute',
    fontSize: 22,
    top: '30%',
  },

  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: theme.card,
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },

  emojiCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: theme.primary,
  },
  emojiText: { fontSize: 48 },

  title: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.text,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  badgeDesc: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSub,
    textAlign: 'center',
    marginBottom: 4,
  },
  extraBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.primary,
    marginTop: 8,
  },

  buttonArea: { width: '100%', marginTop: 24, gap: 10 },
  btnShare: {
    height: 52,
    borderRadius: 9999,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  btnShareText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  btnConfirm: {
    height: 48,
    borderRadius: 9999,
    backgroundColor: theme.pillBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnConfirmText: { color: theme.text, fontSize: 15, fontWeight: '700' },
});
