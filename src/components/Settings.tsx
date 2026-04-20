import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';
import {
  requestPayment,
  restorePurchases,
} from '@apps-in-toss/framework';
import { theme } from '../theme';
import { PREMIUM_PLAN, MISSION_PACKS } from '../data/missionPacks';
import type { Mission } from '../data/missions';
import {
  requestNotificationPermission,
  scheduleDaily,
  cancelDailyNotification,
} from '../utils/notificationUtils';

type Category = Mission['category'];

const CATEGORIES: { key: Category; label: string; emoji: string }[] = [
  { key: 'health', label: '건강', emoji: '🏃' },
  { key: 'money', label: '절약', emoji: '💰' },
  { key: 'productivity', label: '생산성', emoji: '🚀' },
  { key: 'mindfulness', label: '마음챙김', emoji: '🧘' },
];

const NOTIFICATION_HOURS = [6, 7, 8, 9, 10, 12, 18, 20, 21];

interface SettingsProps {
  isPremium: boolean;
  purchasedPacks: string[];
  notificationHour: number;
  notificationEnabled: boolean;
  preferredCategories: Category[];
  onChangeNotificationHour: (hour: number) => void;
  onToggleCategory: (category: Category) => void;
  onToggleNotification: (enabled: boolean) => void;
  onRestorePremium: () => void;
  onRestorePack: (packId: string) => void;
  onPurchasePremium: () => void;
  onPaymentError: (message: string) => void;
  onGoHome: () => void;
}

export default function Settings({
  isPremium,
  purchasedPacks,
  notificationHour,
  notificationEnabled,
  preferredCategories,
  onChangeNotificationHour,
  onToggleNotification,
  onToggleCategory,
  onRestorePremium,
  onRestorePack,
  onPurchasePremium,
  onPaymentError,
  onGoHome,
}: SettingsProps) {
  const [restoring, setRestoring] = useState(false);

  const handleChangeHour = useCallback(
    async (hour: number) => {
      onChangeNotificationHour(hour);
      if (notificationEnabled) {
        await scheduleDaily(hour);
      }
    },
    [onChangeNotificationHour, notificationEnabled],
  );

  const handleToggleNotification = useCallback(async () => {
    if (!notificationEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        await scheduleDaily(notificationHour);
        onToggleNotification(true);
      }
    } else {
      await cancelDailyNotification();
      onToggleNotification(false);
    }
  }, [notificationEnabled, notificationHour, onToggleNotification]);

  const handleRestore = useCallback(async () => {
    setRestoring(true);
    try {
      const result = await restorePurchases();
      const items = result.items as { productId: string }[];
      let restored = false;

      // 프리미엄 복원
      if (items.some((item) => item.productId === PREMIUM_PLAN.id)) {
        onRestorePremium();
        restored = true;
      }

      // 팩 구매 복원
      const packIds = MISSION_PACKS.map((p) => p.id);
      for (const item of items) {
        if (packIds.includes(item.productId)) {
          onRestorePack(item.productId);
          restored = true;
        }
      }

      if (!restored) {
        onPaymentError('복원할 구매 내역이 없습니다.');
      }
    } catch {
      onPaymentError('구매 복원에 실패했어요. 다시 시도해주세요.');
    } finally {
      setRestoring(false);
    }
  }, [onRestorePremium, onRestorePack, onPaymentError]);

  const handleBuyPremium = useCallback(async () => {
    try {
      await requestPayment({
        productId: PREMIUM_PLAN.id,
        productName: `${PREMIUM_PLAN.emoji} ${PREMIUM_PLAN.name}`,
        amount: PREMIUM_PLAN.price,
      });
      onPurchasePremium();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      if (!msg.includes('cancel')) {
        onPaymentError('결제에 실패했어요. 잔액을 확인하고 다시 시도해주세요.');
      }
    }
  }, [onPurchasePremium, onPaymentError]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        pinchGestureEnabled={false}
      >
        <Text style={styles.headerTitle}>설정</Text>

        {/* 프리미엄 배너 (비프리미엄) */}
        {!isPremium && (
          <TouchableOpacity
            style={styles.premiumBanner}
            onPress={handleBuyPremium}
            activeOpacity={0.85}
          >
            <Text style={styles.premiumBannerEmoji}>👑</Text>
            <View style={styles.premiumBannerInfo}>
              <Text style={styles.premiumBannerTitle}>프리미엄으로 업그레이드</Text>
              <Text style={styles.premiumBannerDesc}>
                광고 제거 · 미션 커스텀 · 전체 팩 포함
              </Text>
            </View>
            <Text style={styles.premiumBannerPrice}>{PREMIUM_PLAN.priceLabel}</Text>
          </TouchableOpacity>
        )}

        {isPremium && (
          <View style={styles.premiumActiveBanner}>
            <Text style={styles.premiumActiveText}>👑 프리미엄 활성화됨</Text>
          </View>
        )}

        {/* 알림 설정 */}
        <View style={styles.section}>
          <View style={styles.notificationToggleRow}>
            <View style={styles.notificationToggleInfo}>
              <Text style={styles.sectionTitle}>미션 알림</Text>
              <Text style={styles.sectionDesc}>매일 이 시간에 오늘의 미션을 알려드려요</Text>
            </View>
            <Switch
              value={notificationEnabled}
              onValueChange={handleToggleNotification}
              trackColor={{ false: theme.border, true: theme.primary + '80' }}
              thumbColor={notificationEnabled ? theme.primary : '#F4F3F4'}
            />
          </View>
          <View style={styles.hourGrid}>
            {NOTIFICATION_HOURS.map((h) => {
              const selected = h === notificationHour;
              const label = h < 12 ? `오전 ${h}시` : h === 12 ? '낮 12시' : `오후 ${h - 12}시`;
              return (
                <TouchableOpacity
                  key={h}
                  style={[styles.hourChip, selected && styles.hourChipSelected]}
                  onPress={() => handleChangeHour(h)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.hourChipText,
                      selected && styles.hourChipTextSelected,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 카테고리 선호 (프리미엄 전용) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>미션 카테고리 선호</Text>
            {!isPremium && (
              <View style={styles.premiumOnlyBadge}>
                <Text style={styles.premiumOnlyText}>프리미엄</Text>
              </View>
            )}
          </View>
          <Text style={styles.sectionDesc}>
            선호하는 카테고리의 미션이 더 자주 나와요
          </Text>
          {CATEGORIES.map((cat) => {
            const enabled = preferredCategories.includes(cat.key);
            return (
              <View key={cat.key} style={styles.categoryRow}>
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
                <Switch
                  value={enabled}
                  onValueChange={() => onToggleCategory(cat.key)}
                  disabled={!isPremium}
                  trackColor={{ false: theme.border, true: theme.primary + '80' }}
                  thumbColor={enabled ? theme.primary : '#F4F3F4'}
                />
              </View>
            );
          })}
        </View>

        {/* 구매 내역 (인앱 결제 체크리스트 #8) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>구매 내역</Text>
          {isPremium && (
            <View style={styles.purchaseRow}>
              <Text style={styles.purchaseEmoji}>👑</Text>
              <View style={styles.purchaseInfo}>
                <Text style={styles.purchaseName}>{PREMIUM_PLAN.name}</Text>
                <Text style={styles.purchaseStatus}>이용 중</Text>
              </View>
            </View>
          )}
          {purchasedPacks.map((packId) => {
            const pack = MISSION_PACKS.find((p) => p.id === packId);
            if (!pack) return null;
            return (
              <View key={packId} style={styles.purchaseRow}>
                <Text style={styles.purchaseEmoji}>{pack.emoji}</Text>
                <View style={styles.purchaseInfo}>
                  <Text style={styles.purchaseName}>{pack.name}</Text>
                  <Text style={styles.purchaseStatus}>보유 중</Text>
                </View>
              </View>
            );
          })}
          {!isPremium && purchasedPacks.length === 0 && (
            <Text style={styles.noPurchaseText}>구매 내역이 없습니다.</Text>
          )}
          <TouchableOpacity
            style={styles.restoreBtn}
            onPress={handleRestore}
            activeOpacity={0.7}
            disabled={restoring}
          >
            <Text style={styles.restoreBtnText}>
              {restoring ? '복원 중...' : '구매 복원'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scrollContent: { padding: 20, paddingBottom: 32 },

  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.text,
    letterSpacing: -0.3,
    marginBottom: 20,
  },

  // Premium banner
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  premiumBannerEmoji: { fontSize: 28 },
  premiumBannerInfo: { flex: 1, gap: 2 },
  premiumBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFD700',
  },
  premiumBannerDesc: {
    fontSize: 11,
    fontWeight: '500',
    color: '#CCCCCC',
  },
  premiumBannerPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFD700',
  },

  premiumActiveBanner: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD54F',
  },
  premiumActiveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F9A825',
  },

  // Sections
  section: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  notificationToggleInfo: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.textSub,
    marginBottom: 16,
  },

  premiumOnlyBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 9999,
    backgroundColor: '#FFD700' + '30',
    marginBottom: 4,
  },
  premiumOnlyText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F9A825',
  },

  // Hour grid
  hourGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hourChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 9999,
    backgroundColor: theme.pillBg,
    borderWidth: 1,
    borderColor: theme.border,
  },
  hourChipSelected: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  hourChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textSub,
  },
  hourChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // Category rows
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    gap: 10,
  },
  categoryEmoji: { fontSize: 20 },
  categoryLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: theme.text,
  },

  // Purchase history
  purchaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    gap: 10,
  },
  purchaseEmoji: { fontSize: 20 },
  purchaseInfo: { flex: 1, gap: 2 },
  purchaseName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.text,
  },
  purchaseStatus: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.success,
  },
  noPurchaseText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.textSub,
    textAlign: 'center',
    paddingVertical: 12,
  },

  // Restore
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  restoreBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.primary,
  },
});
