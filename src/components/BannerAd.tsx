import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { InlineAd } from '@apps-in-toss/framework';
import { theme } from '../theme';
import { BANNER_AD_GROUP_ID } from '../config/env';

interface BannerAdProps {
  isPremium: boolean;
}

/**
 * 배너 광고 컴포넌트
 * - 프리미엄 유저에게는 렌더링하지 않음
 * - 스크롤 가능한 화면에만 배치 (체크리스트 준수)
 */
export default function BannerAd({ isPremium }: BannerAdProps) {
  if (isPremium) return null;

  if (BANNER_AD_GROUP_ID) {
    return (
      <View style={styles.adWrap}>
        <InlineAd adGroupId={BANNER_AD_GROUP_ID} theme="light" variant="card" />
      </View>
    );
  }

  return (
    <View style={styles.adPlaceholder}>
      <Text style={styles.adPlaceholderText}>광고 영역</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  adWrap: {
    width: '100%',
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
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
  adPlaceholderText: {
    color: theme.textSub,
    fontSize: 12,
    fontWeight: '500',
  },
});
