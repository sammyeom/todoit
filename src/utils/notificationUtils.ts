/**
 * 알림 유틸리티
 * 토스 미니앱에서는 푸시 알림이 토스 앱 레벨에서 관리됩니다.
 * 앱 내에서는 사용자 동의 상태만 관리하고,
 * 실제 알림은 토스 플랫폼에서 처리합니다.
 */

/**
 * 알림 권한 요청 (사용자 동의)
 * 토스 미니앱에서는 별도 OS 권한 요청이 불필요하므로
 * 사용자 동의만 받고 true를 반환합니다.
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  return true;
};

/**
 * 매일 반복 알림 스케줄 등록
 * @param hour 0~23
 */
export const scheduleDaily = async (_hour: number): Promise<void> => {
  // 토스 미니앱에서는 플랫폼이 알림 스케줄을 관리합니다.
};

/**
 * 매일 반복 알림 취소
 */
export const cancelDailyNotification = async (): Promise<void> => {
  // 토스 미니앱에서는 플랫폼이 알림 스케줄을 관리합니다.
};
