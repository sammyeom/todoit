import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { InlineAd } from '@apps-in-toss/framework';
import { theme } from '../theme';
import { getDifficultyLabel, getDifficultyColor, type Mission } from '../data/missions';
import { BANNER_AD_GROUP_ID } from '../config/env';
import type { MissionState } from '../hooks/useMissionState';

interface MissionCardProps {
  mission: Mission;
  state: MissionState;
  completedToday: boolean;
  onStart: () => void;
  onPass: () => void;
  onGoStamps: () => void;
  onGoStore: () => void;
  onGoSettings: () => void;
}

export default function MissionCard({
  mission,
  state,
  completedToday,
  onStart,
  onPass,
  onGoStamps,
  onGoStore,
  onGoSettings,
}: MissionCardProps) {
  const diffColor = getDifficultyColor(mission.difficulty);
  const diffLabel = getDifficultyLabel(mission.difficulty);

  return (
    <View style={styles.container}>
      {/* 우상단 아이콘 버튼 */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.topNavBtn}
          onPress={onGoStore}
          activeOpacity={0.7}
        >
          <Text style={styles.topNavIcon}>🛒</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topNavBtn}
          onPress={onGoSettings}
          activeOpacity={0.7}
        >
          <Text style={styles.topNavIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        pinchGestureEnabled={false}
      >
        {state.streak > 0 && (
          <View style={styles.streakBanner}>
            <Text style={styles.streakText}>
              🔥 {state.streak}일 연속 달성 중!
            </Text>
            {state.streakShield > 0 && (
              <View style={styles.shieldBadge}>
                <Text style={styles.shieldBadgeText}>🛡️ x{state.streakShield}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.emoji}>{mission.emoji}</Text>
          <Text style={styles.title}>{mission.title}</Text>
          <Text style={styles.description}>{mission.description}</Text>

          <View style={[styles.badge, { backgroundColor: diffColor + '20' }]}>
            <Text style={[styles.badgeText, { color: diffColor }]}>
              {diffLabel}
            </Text>
          </View>

          {mission.type === 'timer' && mission.duration != null && (
            <Text style={styles.durationHint}>
              ⏱️ {Math.floor(mission.duration / 60)}분 소요
            </Text>
          )}
        </View>

        {completedToday ? (
          <View style={styles.completedBanner}>
            <Text style={styles.completedText}>✅ 오늘 미션을 완료했어요!</Text>
          </View>
        ) : (
          <View style={styles.buttonArea}>
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={onStart}
              activeOpacity={0.85}
            >
              <Text style={styles.btnPrimaryText}>미션 시작하기</Text>
            </TouchableOpacity>

            {!state.passedToday && (
              <TouchableOpacity
                style={styles.btnGhost}
                onPress={onPass}
                activeOpacity={0.7}
              >
                <Text style={styles.btnGhostText}>오늘 패스</Text>
              </TouchableOpacity>
            )}

            {state.passedToday && (
              <Text style={styles.passedText}>오늘 패스를 사용했어요</Text>
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.stampBoardBtn}
          onPress={onGoStamps}
          activeOpacity={0.8}
        >
          <Text style={styles.stampBoardBtnText}>🌟 스탬프 보드 보기</Text>
        </TouchableOpacity>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{state.totalCompleted}</Text>
            <Text style={styles.statLabel}>총 완료</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{state.streak}</Text>
            <Text style={styles.statLabel}>연속일</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{state.badges.length}</Text>
            <Text style={styles.statLabel}>뱃지</Text>
          </View>
        </View>

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
  scrollContent: { alignItems: 'center', padding: 20, paddingTop: 8, paddingBottom: 32 },

  topNav: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  topNavBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.pillBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topNavIcon: {
    fontSize: 24,
  },

  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 9999,
    backgroundColor: '#FFF3E0',
    marginBottom: 20,
    gap: 8,
  },
  streakText: { fontSize: 14, fontWeight: '800', color: '#E17055' },
  shieldBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#F0F4FF',
  },
  shieldBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A6CF7',
  },

  card: {
    width: '100%',
    backgroundColor: theme.card,
    borderRadius: 28,
    padding: 32,
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
  emoji: { fontSize: 64, lineHeight: 72 },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.text,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14,
    color: theme.textSub,
    fontWeight: '500',
    textAlign: 'center',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 9999,
    marginTop: 4,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  durationHint: {
    fontSize: 12,
    color: theme.textSub,
    fontWeight: '600',
    marginTop: 4,
  },

  buttonArea: { width: '100%', marginTop: 24, gap: 12 },
  btnPrimary: {
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
  btnPrimaryText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  btnGhost: {
    height: 48,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGhostText: { color: theme.ghost, fontSize: 14, fontWeight: '700' },
  passedText: {
    textAlign: 'center',
    color: theme.textSub,
    fontSize: 13,
    fontWeight: '600',
  },

  completedBanner: {
    width: '100%',
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#E8F8F5',
    alignItems: 'center',
  },
  completedText: { fontSize: 15, fontWeight: '800', color: theme.success },

  statsRow: {
    flexDirection: 'row',
    marginTop: 24,
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    width: '100%',
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 22, fontWeight: '900', color: theme.primary },
  statLabel: { fontSize: 11, fontWeight: '600', color: theme.textSub },
  statDivider: { width: 1, backgroundColor: theme.border },

  adWrap: { width: '100%', marginTop: 20, borderRadius: 12, overflow: 'hidden' },
  adPlaceholder: {
    width: '100%',
    height: 60,
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adPlaceholderText: { color: theme.textSub, fontSize: 12, fontWeight: '500' },

  stampBoardBtn: {
    width: '100%',
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: theme.primarySoft,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.primary + '30',
  },
  stampBoardBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.primary,
  },
});
