import { generateHapticFeedback } from '@apps-in-toss/framework';

/**
 * 햅틱 피드백 유틸리티
 * - 토스 SDK generateHapticFeedback 우선 사용
 * - SDK 미지원 시 navigator.vibrate fallback
 */
export const haptic = {
  /** 미션 완료 — 강한 진동 */
  missionComplete: async () => {
    try {
      await generateHapticFeedback({ type: 'heavy' });
    } catch {
      navigator.vibrate?.([80]);
    }
  },

  /** 스탬프 찍힐 때 — 중간 진동 */
  stamp: async () => {
    try {
      await generateHapticFeedback({ type: 'medium' });
    } catch {
      navigator.vibrate?.([50]);
    }
  },

  /** 뱃지 획득 — 성공 패턴 */
  badge: async () => {
    try {
      await generateHapticFeedback({ type: 'success' });
    } catch {
      navigator.vibrate?.([30, 50, 30]);
    }
  },

  /** 버튼 탭 — 가벼운 진동 */
  tap: async () => {
    try {
      await generateHapticFeedback({ type: 'light' });
    } catch {
      navigator.vibrate?.([20]);
    }
  },
};
