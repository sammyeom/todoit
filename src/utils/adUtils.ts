import {
  showRewardedAd,
  showInterstitialAd,
  loadInterstitialAd,
} from '@apps-in-toss/framework';

/** 네트워크 상태 감지 */
const isOnline = (): boolean =>
  typeof navigator !== 'undefined' ? (navigator.onLine ?? true) : true;

/**
 * 리워드 광고 안전 래퍼
 * - 오프라인: 광고 없이 보상 지급 (UX 우선)
 * - 광고 실패(네트워크): 보상 지급
 * - 유저 취소: 보상 없음
 */
export const safeShowRewardedAd = async (
  adGroupId: string,
  onSuccess: () => void,
  onFail?: () => void,
): Promise<void> => {
  if (!isOnline()) {
    onSuccess();
    return;
  }

  try {
    await showRewardedAd({ adGroupId });
    onSuccess();
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '';
    const isCancelled = message.includes('cancel');
    if (!isCancelled) {
      onSuccess(); // 광고 실패지만 보상 지급
    } else {
      onFail?.(); // 유저가 직접 닫음
    }
  }
};

/**
 * 전면 광고 안전 래퍼
 * - 오프라인: 조용히 스킵
 * - 실패: 조용히 스킵
 */
export const safeShowInterstitialAd = async (
  adGroupId: string,
): Promise<void> => {
  if (!isOnline()) return;

  try {
    await showInterstitialAd({ adGroupId });
  } catch {
    // 실패 시 조용히 스킵
  }

  // 다음을 위해 사전 로딩
  void loadInterstitialAd({ adGroupId }).catch(() => {});
};
