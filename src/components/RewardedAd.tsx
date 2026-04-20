import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { AD_GROUP_ID } from '../config/env';
import { safeShowRewardedAd } from '../utils/adUtils';

interface RewardedAdProps {
  onStreakShieldEarned: () => void;
  onPreviewEarned: () => void;
}

export default function RewardedAd({
  onStreakShieldEarned,
  onPreviewEarned,
}: RewardedAdProps) {
  const [shieldClaimed, setShieldClaimed] = useState(false);
  const [previewClaimed, setPreviewClaimed] = useState(false);

  const handleStreakShield = useCallback(async () => {
    if (shieldClaimed || !AD_GROUP_ID) return;
    await safeShowRewardedAd(
      AD_GROUP_ID,
      () => {
        setShieldClaimed(true);
        onStreakShieldEarned();
      },
    );
  }, [shieldClaimed, onStreakShieldEarned]);

  const handlePreview = useCallback(async () => {
    if (previewClaimed || !AD_GROUP_ID) return;
    await safeShowRewardedAd(
      AD_GROUP_ID,
      () => {
        setPreviewClaimed(true);
        onPreviewEarned();
      },
    );
  }, [previewClaimed, onPreviewEarned]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>보너스 받기</Text>

      <TouchableOpacity
        style={[styles.rewardRow, shieldClaimed && styles.rewardRowClaimed]}
        onPress={handleStreakShield}
        activeOpacity={shieldClaimed ? 1 : 0.7}
        disabled={shieldClaimed}
      >
        <Text style={styles.rewardEmoji}>🛡️</Text>
        <Text style={styles.rewardLabel}>스트릭 보호권 +1</Text>
        {shieldClaimed ? (
          <View style={styles.claimedBadge}>
            <Text style={styles.claimedBadgeText}>획득 완료</Text>
          </View>
        ) : (
          <View style={styles.watchBtn}>
            <Text style={styles.watchBtnText}>광고 보기</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.rewardRow, previewClaimed && styles.rewardRowClaimed]}
        onPress={handlePreview}
        activeOpacity={previewClaimed ? 1 : 0.7}
        disabled={previewClaimed}
      >
        <Text style={styles.rewardEmoji}>🎁</Text>
        <Text style={styles.rewardLabel}>내일 미션 미리보기</Text>
        {previewClaimed ? (
          <View style={styles.claimedBadge}>
            <Text style={styles.claimedBadgeText}>획득 완료</Text>
          </View>
        ) : (
          <View style={styles.watchBtn}>
            <Text style={styles.watchBtnText}>광고 보기</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textSub,
    marginBottom: 4,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: theme.pillBg,
    gap: 10,
  },
  rewardRowClaimed: {
    opacity: 0.6,
  },
  rewardEmoji: {
    fontSize: 20,
  },
  rewardLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: theme.text,
  },
  watchBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 9999,
    backgroundColor: theme.primary,
  },
  watchBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  claimedBadge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 9999,
    backgroundColor: theme.success + '20',
  },
  claimedBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.success,
  },
});
