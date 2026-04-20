import { useEffect, useRef } from 'react';
import { loadInterstitialAd, showInterstitialAd } from '@apps-in-toss/framework';
import { AD_GROUP_ID } from '../config/env';

/**
 * 전면 광고 유틸리티 훅
 * - 프리미엄 유저는 스킵
 * - 광고 사전 로딩 (체크리스트: 실시간 로딩 금지)
 * - 모달/팝업 위에 표시하지 않음 (체크리스트 준수)
 */
export function useInterstitialAd(isPremium: boolean) {
  const preloaded = useRef(false);

  // 사전 로딩
  useEffect(() => {
    if (isPremium || !AD_GROUP_ID || preloaded.current) return;
    preloaded.current = true;
    void loadInterstitialAd({ adGroupId: AD_GROUP_ID }).catch(() => {});
  }, [isPremium]);

  /** 전면 광고 표시 — 완료 후 resolve */
  const showAd = async (): Promise<void> => {
    if (isPremium || !AD_GROUP_ID) return;

    try {
      await showInterstitialAd({ adGroupId: AD_GROUP_ID });
    } catch {
      // 광고 실패 시 무시
    }

    // 다음 표시를 위해 다시 사전 로딩
    void loadInterstitialAd({ adGroupId: AD_GROUP_ID }).catch(() => {});
  };

  return { showAd };
}
