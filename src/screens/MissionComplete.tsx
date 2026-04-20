import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { theme } from '../theme';
import { haptic } from '../utils/hapticUtils';
import type { Mission } from '../data/missions';
import type { MissionState } from '../hooks/useMissionState';
import { shareMissionComplete } from '../utils/shareUtils';
import {
  requestNotificationPermission,
  scheduleDaily,
} from '../utils/notificationUtils';
import RewardedAd from '../components/RewardedAd';

interface MissionCompleteProps {
  mission: Mission;
  state: MissionState;
  isPremium: boolean;
  notificationEnabled: boolean;
  onGoHome: () => void;
  onGoStamps: () => void;
  onStreakShieldEarned: () => void;
  onPreviewEarned: () => void;
  onNotificationEnabled: () => void;
}

function getWeekDays(): string[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
    );
  }
  return days;
}

const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

export default function MissionComplete({ mission, state, isPremium, notificationEnabled, onGoHome, onGoStamps, onStreakShieldEarned, onPreviewEarned, onNotificationEnabled }: MissionCompleteProps) {
  const [showNotifConsent, setShowNotifConsent] = useState(false);
  const stampScale = useRef(new Animated.Value(0)).current;
  const stampRotate = useRef(new Animated.Value(-0.3)).current;
  const confettiAnims = useRef(
    Array.from({ length: 12 }, () => ({
      y: new Animated.Value(-20),
      x: new Animated.Value(0),
      opacity: new Animated.Value(1),
    })),
  ).current;

  const weekDays = getWeekDays();

  useEffect(() => {
    void haptic.missionComplete();

    // Stamp animation
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.spring(stampScale, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
        Animated.timing(stampRotate, { toValue: 0, duration: 400, easing: Easing.out(Easing.back(2)), useNativeDriver: true }),
      ]),
    ]).start();

    // Confetti
    confettiAnims.forEach((anim, i) => {
      const delay = i * 80;
      const targetX = (Math.random() - 0.5) * 300;
      const targetY = Math.random() * 400 + 200;

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(anim.y, { toValue: targetY, duration: 1200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(anim.x, { toValue: targetX, duration: 1200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.sequence([
            Animated.delay(800),
            Animated.timing(anim.opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
          ]),
        ]),
      ]).start();
    });
    // 최초 미션 완료 시 알림 동의 카드 표시 (컨페티 후)
    if (!notificationEnabled) {
      const timer = setTimeout(() => {
        setShowNotifConsent(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAcceptNotification = useCallback(async () => {
    setShowNotifConsent(false);
    const granted = await requestNotificationPermission();
    if (granted) {
      await scheduleDaily(8);
      onNotificationEnabled();
    }
  }, [onNotificationEnabled]);

  const handleDeclineNotification = useCallback(() => {
    setShowNotifConsent(false);
  }, []);

  const handleShare = useCallback(async () => {
    try {
      await shareMissionComplete(mission, state);
    } catch {
      // 공유 실패는 조용히 처리
    }
  }, [mission, state]);

  const confettiEmojis = ['🎉', '✨', '🌟', '💫', '🎊', '⭐', '🔥', '💜', '🎯', '👏', '🏆', '💪'];

  return (
    <View style={styles.container}>
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
                left: `${15 + (i * 6)}%`,
              },
            ]}
          >
            {confettiEmojis[i % confettiEmojis.length]}
          </Animated.Text>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        pinchGestureEnabled={false}
      >
        {/* Stamp */}
        <Animated.View
          style={[
            styles.stampWrap,
            {
              transform: [
                { scale: stampScale },
                { rotate: stampRotate.interpolate({
                  inputRange: [-0.3, 0],
                  outputRange: ['-15deg', '0deg'],
                }) },
              ],
            },
          ]}
        >
          <View style={styles.stamp}>
            <Text style={styles.stampEmoji}>{mission.emoji}</Text>
            <Text style={styles.stampCheck}>✓</Text>
          </View>
        </Animated.View>

        <Text style={styles.completeTitle}>오늘의 미션 완료!</Text>
        <Text style={styles.completeSubtitle}>
          {mission.title}을 해냈어요 🎉
        </Text>

        {state.streak > 1 && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakBadgeText}>
              🔥 {state.streak}일 연속!
            </Text>
          </View>
        )}

        {/* Stamp board */}
        <View style={styles.stampBoard}>
          <Text style={styles.stampBoardTitle}>이번 주 스탬프</Text>
          <View style={styles.stampGrid}>
            {weekDays.map((day, i) => {
              const done = state.stamps.includes(day);
              return (
                <View key={day} style={styles.stampCell}>
                  <View style={[styles.stampDot, done && styles.stampDotDone]}>
                    {done && <Text style={styles.stampDotText}>✓</Text>}
                  </View>
                  <Text style={[styles.stampDayLabel, done && styles.stampDayLabelDone]}>
                    {WEEKDAY_LABELS[i]}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 알림 동의 카드 — 권한 요청 전 사용자 동의 (체크리스트 준수) */}
        {showNotifConsent && (
          <View style={styles.notifConsentCard}>
            <Text style={styles.notifConsentTitle}>매일 미션 알림을 받을까요?</Text>
            <Text style={styles.notifConsentDesc}>
              매일 오전 8시에 오늘의 미션을 알려드려요. 설정에서 언제든 변경할 수 있어요.
            </Text>
            <View style={styles.notifConsentButtons}>
              <TouchableOpacity
                style={styles.notifConsentBtnDecline}
                onPress={handleDeclineNotification}
                activeOpacity={0.7}
              >
                <Text style={styles.notifConsentBtnDeclineText}>괜찮아요</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.notifConsentBtnAccept}
                onPress={handleAcceptNotification}
                activeOpacity={0.85}
              >
                <Text style={styles.notifConsentBtnAcceptText}>알림 받기</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 리워드 광고 — 비프리미엄 유저만 */}
        {!isPremium && (
          <RewardedAd
            onStreakShieldEarned={onStreakShieldEarned}
            onPreviewEarned={onPreviewEarned}
          />
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
            style={styles.btnStamps}
            onPress={onGoStamps}
            activeOpacity={0.85}
          >
            <Text style={styles.btnStampsText}>🌟 스탬프 보드</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scrollContent: { alignItems: 'center', padding: 24, paddingTop: 48, paddingBottom: 40 },

  confettiLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  confettiPiece: {
    position: 'absolute',
    fontSize: 24,
  },

  stampWrap: { marginBottom: 24 },
  stamp: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 6,
  },
  stampEmoji: { fontSize: 48 },
  stampCheck: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    fontSize: 28,
    color: theme.success,
    fontWeight: '900',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: 32,
    height: 32,
    textAlign: 'center',
    lineHeight: 32,
    overflow: 'hidden',
  },

  completeTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  completeSubtitle: {
    fontSize: 15,
    color: theme.textSub,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },

  streakBadge: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 9999,
    backgroundColor: '#FFF3E0',
    marginBottom: 24,
  },
  streakBadgeText: { fontSize: 16, fontWeight: '800', color: '#E17055' },

  stampBoard: {
    width: '100%',
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 28,
  },
  stampBoardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textSub,
    marginBottom: 16,
    textAlign: 'center',
  },
  stampGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stampCell: { alignItems: 'center', gap: 6 },
  stampDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.pillBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.border,
  },
  stampDotDone: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  stampDotText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  stampDayLabel: { fontSize: 11, fontWeight: '600', color: theme.textSub },
  stampDayLabelDone: { color: theme.primary, fontWeight: '800' },

  notifConsentCard: {
    width: '100%',
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.primary + '30',
    gap: 8,
  },
  notifConsentTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.text,
    textAlign: 'center',
  },
  notifConsentDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.textSub,
    textAlign: 'center',
    marginBottom: 8,
  },
  notifConsentButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  notifConsentBtnDecline: {
    flex: 1,
    height: 40,
    borderRadius: 9999,
    backgroundColor: theme.pillBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifConsentBtnDeclineText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textSub,
  },
  notifConsentBtnAccept: {
    flex: 1,
    height: 40,
    borderRadius: 9999,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifConsentBtnAcceptText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  buttonArea: { width: '100%', gap: 12 },
  btnShare: {
    height: 56,
    borderRadius: 9999,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
  btnShareText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  btnStamps: {
    height: 52,
    borderRadius: 9999,
    backgroundColor: theme.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.primary + '30',
  },
  btnStampsText: { color: theme.primary, fontSize: 15, fontWeight: '800' },
});
