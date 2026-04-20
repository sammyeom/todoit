import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { IAP } from '@apps-in-toss/framework';
import { theme } from '../theme';
import { MISSION_PACKS, PREMIUM_PLAN, type MissionPack } from '../data/missionPacks';
import BannerAd from './BannerAd';

interface MissionPacksProps {
  isPremium: boolean;
  purchasedPacks: string[];
  onPurchasePack: (packId: string) => void;
  onPurchasePremium: () => void;
  onPaymentError: (message: string) => void;
  onGoHome: () => void;
}

export default function MissionPacks({
  isPremium,
  purchasedPacks,
  onPurchasePack,
  onPurchasePremium,
  onPaymentError,
  onGoHome,
}: MissionPacksProps) {
  const handleBuyPack = useCallback(
    (pack: MissionPack) => {
      if (isPremium || purchasedPacks.includes(pack.id)) return;

      IAP.createOneTimePurchaseOrder({
        options: {
          productId: pack.id,
          processProductGrant: () => true,
        },
        onEvent: () => {
          onPurchasePack(pack.id);
        },
        onError: (e: unknown) => {
          const msg = e instanceof Error ? e.message : String(e);
          if (!msg.includes('USER_CANCELED')) {
            onPaymentError('결제에 실패했어요. 잔액을 확인하고 다시 시도해주세요.');
          }
        },
      });
    },
    [isPremium, purchasedPacks, onPurchasePack, onPaymentError],
  );

  const handleBuyPremium = useCallback(() => {
    if (isPremium) return;

    IAP.createOneTimePurchaseOrder({
      options: {
        productId: PREMIUM_PLAN.id,
        processProductGrant: () => true,
      },
      onEvent: () => {
        onPurchasePremium();
      },
      onError: (e: unknown) => {
        const msg = e instanceof Error ? e.message : String(e);
        if (!msg.includes('USER_CANCELED')) {
          onPaymentError('결제에 실패했어요. 잔액을 확인하고 다시 시도해주세요.');
        }
      },
    });
  }, [isPremium, onPurchasePremium, onPaymentError]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        pinchGestureEnabled={false}
      >
        <Text style={styles.headerTitle}>미션 팩 스토어</Text>
        <Text style={styles.headerSub}>특별한 미션으로 목표를 달성하세요</Text>

        {/* 프리미엄 배너 */}
        {!isPremium && (
          <TouchableOpacity
            style={styles.premiumCard}
            onPress={handleBuyPremium}
            activeOpacity={0.85}
          >
            <Text style={styles.premiumEmoji}>{PREMIUM_PLAN.emoji}</Text>
            <View style={styles.premiumInfo}>
              <Text style={styles.premiumName}>{PREMIUM_PLAN.name}</Text>
              <Text style={styles.premiumDesc}>{PREMIUM_PLAN.description}</Text>
              <View style={styles.premiumFeatures}>
                {PREMIUM_PLAN.features.map((f) => (
                  <Text key={f} style={styles.premiumFeature}>
                    ✓ {f}
                  </Text>
                ))}
              </View>
            </View>
            <View style={styles.premiumPriceBadge}>
              <Text style={styles.premiumPriceText}>{PREMIUM_PLAN.priceLabel}</Text>
            </View>
          </TouchableOpacity>
        )}

        {isPremium && (
          <View style={styles.premiumActiveBanner}>
            <Text style={styles.premiumActiveText}>
              👑 프리미엄 활성화됨 — 모든 팩 이용 가능
            </Text>
          </View>
        )}

        {/* 미션 팩 목록 */}
        {MISSION_PACKS.map((pack) => {
          const owned = isPremium || purchasedPacks.includes(pack.id);
          return (
            <TouchableOpacity
              key={pack.id}
              style={[styles.packCard, owned && styles.packCardOwned]}
              onPress={() => !owned && handleBuyPack(pack)}
              activeOpacity={owned ? 1 : 0.85}
              disabled={owned}
            >
              <View style={styles.packHeader}>
                <Text style={styles.packEmoji}>{pack.emoji}</Text>
                <View style={styles.packTitleArea}>
                  <Text style={styles.packName}>{pack.name}</Text>
                  <Text style={styles.packDesc}>{pack.description}</Text>
                </View>
              </View>

              <View style={styles.packMissions}>
                {pack.missions.slice(0, 3).map((m) => (
                  <Text key={m.id} style={styles.packMissionItem}>
                    {m.emoji} {m.title}
                  </Text>
                ))}
                {pack.missions.length > 3 && (
                  <Text style={styles.packMissionMore}>
                    +{pack.missions.length - 3}개 미션 더 보기
                  </Text>
                )}
              </View>

              <View style={styles.packFooter}>
                {owned ? (
                  <View style={styles.ownedBadge}>
                    <Text style={styles.ownedBadgeText}>보유 중</Text>
                  </View>
                ) : (
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceText}>{pack.priceLabel}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* 배너 광고 — 스크롤 가능 화면 */}
        <BannerAd isPremium={isPremium} />
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
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textSub,
    textAlign: 'center',
    marginBottom: 24,
  },

  // Premium card
  premiumCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'column',
    gap: 12,
  },
  premiumEmoji: { fontSize: 40, textAlign: 'center' },
  premiumInfo: { gap: 6 },
  premiumName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFD700',
    textAlign: 'center',
  },
  premiumDesc: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CCCCCC',
    textAlign: 'center',
  },
  premiumFeatures: { marginTop: 8, gap: 4 },
  premiumFeature: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E0E0E0',
    textAlign: 'center',
  },
  premiumPriceBadge: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 9999,
    backgroundColor: '#FFD700',
    marginTop: 8,
  },
  premiumPriceText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A1A2E',
  },

  premiumActiveBanner: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD54F',
  },
  premiumActiveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F9A825',
  },

  // Pack cards
  packCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 12,
  },
  packCardOwned: {
    borderColor: theme.primary + '40',
    backgroundColor: theme.primarySoft + '40',
  },
  packHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  packEmoji: { fontSize: 36 },
  packTitleArea: { flex: 1, gap: 2 },
  packName: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.text,
  },
  packDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.textSub,
  },

  packMissions: { gap: 4, paddingLeft: 4 },
  packMissionItem: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text,
  },
  packMissionMore: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.primary,
    marginTop: 2,
  },

  packFooter: { alignItems: 'flex-end' },
  priceBadge: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 9999,
    backgroundColor: theme.primary,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  ownedBadge: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 9999,
    backgroundColor: theme.success + '20',
  },
  ownedBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.success,
  },

});
