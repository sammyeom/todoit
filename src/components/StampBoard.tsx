import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { InlineAd } from '@apps-in-toss/framework';
import { theme } from '../theme';
import { BADGE_DEFS } from '../hooks/useMissionState';
import type { MissionState } from '../hooks/useMissionState';
import { BANNER_AD_GROUP_ID } from '../config/env';
import { shareStampBoard } from '../utils/shareUtils';

interface StampBoardProps {
  state: MissionState;
  earnedBadges: Set<string>;
  onGoHome: () => void;
}

const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

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

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function StampBoard({ state, earnedBadges, onGoHome }: StampBoardProps) {
  const weekDays = getWeekDays();
  const todayKey = getTodayKey();

  const handleShare = useCallback(async () => {
    try {
      await shareStampBoard(state);
    } catch {
      // 공유 실패 무시
    }
  }, [state]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        pinchGestureEnabled={false}
      >
        {/* Header */}
        <Text style={styles.headerTitle}>스탬프 보드</Text>
        <Text style={styles.headerSub}>이번 주 미션 기록</Text>

        {/* Stats summary */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{state.streak}</Text>
            <Text style={styles.statLabel}>연속일</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{state.totalCompleted}</Text>
            <Text style={styles.statLabel}>총 완료</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{state.badges.length}</Text>
            <Text style={styles.statLabel}>뱃지</Text>
          </View>
        </View>

        {/* Weekly stamp grid */}
        <View style={styles.stampCard}>
          <Text style={styles.sectionTitle}>이번 주 스탬프</Text>
          <View style={styles.stampGrid}>
            {weekDays.map((day, i) => {
              const done = state.stamps.includes(day);
              const isToday = day === todayKey;
              return (
                <View key={day} style={styles.stampCell}>
                  <View
                    style={[
                      styles.stampCircle,
                      done && styles.stampCircleDone,
                      isToday && !done && styles.stampCircleToday,
                    ]}
                  >
                    {done ? (
                      <Text style={styles.stampEmoji}>🌟</Text>
                    ) : (
                      <View style={styles.emptyDot} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.dayLabel,
                      done && styles.dayLabelDone,
                      isToday && styles.dayLabelToday,
                    ]}
                  >
                    {WEEKDAY_LABELS[i]}
                  </Text>
                  <Text
                    style={[
                      styles.dateLabel,
                      done && styles.dateLabelDone,
                    ]}
                  >
                    {parseInt(day.split('-')[2]!, 10)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Badge collection */}
        <View style={styles.badgeCard}>
          <Text style={styles.sectionTitle}>뱃지 컬렉션</Text>
          <Text style={styles.badgeCountText}>
            {state.badges.length} / {BADGE_DEFS.length} 획득
          </Text>
          <View style={styles.badgeGrid}>
            {BADGE_DEFS.map((badge) => {
              const earned = earnedBadges.has(badge.id);
              return (
                <View key={badge.id} style={styles.badgeItem}>
                  <View
                    style={[
                      styles.badgeCircle,
                      earned ? styles.badgeCircleEarned : styles.badgeCircleLocked,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeEmoji,
                        !earned && styles.badgeEmojiLocked,
                      ]}
                    >
                      {badge.emoji}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.badgeName,
                      !earned && styles.badgeNameLocked,
                    ]}
                    numberOfLines={1}
                  >
                    {badge.name}
                  </Text>
                  <Text
                    style={[
                      styles.badgeDesc,
                      !earned && styles.badgeDescLocked,
                    ]}
                    numberOfLines={2}
                  >
                    {badge.description}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.buttonArea}>
          <TouchableOpacity
            style={styles.btnShare}
            onPress={handleShare}
            activeOpacity={0.85}
          >
            <Text style={styles.btnShareText}>스탬프 보드 공유하기</Text>
          </TouchableOpacity>

        </View>

        {/* Banner ad — scrollable 화면이므로 체크리스트 준수 */}
        {BANNER_AD_GROUP_ID ? (
          <View style={styles.adWrap}>
            <InlineAd adGroupId={BANNER_AD_GROUP_ID} theme="light" variant="card" />
          </View>
        ) : (
          <View style={styles.adPlaceholder}>
            <Text style={styles.adPlaceholderText}>광고 영역</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scrollContent: { padding: 20, paddingBottom: 32, alignItems: 'center' },

  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.text,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textSub,
    marginBottom: 20,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    width: '100%',
    marginBottom: 20,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 22, fontWeight: '900', color: theme.primary },
  statLabel: { fontSize: 11, fontWeight: '600', color: theme.textSub },
  statDivider: { width: 1, backgroundColor: theme.border },

  // Stamp grid
  stampCard: {
    width: '100%',
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  stampGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stampCell: { alignItems: 'center', gap: 4 },
  stampCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.pillBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.border,
  },
  stampCircleDone: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFD54F',
  },
  stampCircleToday: {
    borderColor: theme.primary,
    borderWidth: 2.5,
  },
  stampEmoji: { fontSize: 20 },
  emptyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.border,
  },
  dayLabel: { fontSize: 11, fontWeight: '600', color: theme.textSub },
  dayLabelDone: { color: '#F9A825', fontWeight: '800' },
  dayLabelToday: { color: theme.primary, fontWeight: '800' },
  dateLabel: { fontSize: 10, fontWeight: '500', color: theme.ghost },
  dateLabelDone: { color: '#F9A825' },

  // Badge collection
  badgeCard: {
    width: '100%',
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 24,
  },
  badgeCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSub,
    textAlign: 'center',
    marginTop: -8,
    marginBottom: 16,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  badgeItem: {
    width: 88,
    alignItems: 'center',
    gap: 4,
  },
  badgeCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  badgeCircleEarned: {
    backgroundColor: theme.primarySoft,
    borderColor: theme.primary,
  },
  badgeCircleLocked: {
    backgroundColor: '#F0F0F0',
    borderColor: '#E0E0E0',
  },
  badgeEmoji: { fontSize: 28 },
  badgeEmojiLocked: { opacity: 0.3 },
  badgeName: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.text,
    textAlign: 'center',
  },
  badgeNameLocked: { color: theme.ghost },
  badgeDesc: {
    fontSize: 9,
    fontWeight: '500',
    color: theme.textSub,
    textAlign: 'center',
  },
  badgeDescLocked: { color: theme.ghost },

  // Buttons
  buttonArea: { width: '100%', gap: 10, marginBottom: 4 },
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
  // Ad
  adWrap: { width: '100%', marginTop: 16, borderRadius: 12, overflow: 'hidden' },
  adPlaceholder: {
    width: '100%',
    height: 60,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adPlaceholderText: { color: theme.textSub, fontSize: 12, fontWeight: '500' },
});
