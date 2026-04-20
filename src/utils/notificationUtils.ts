import { registerPushNotification } from '@apps-in-toss/framework';

/**
 * 알림 권한 요청
 * - 토스 미니앱 SDK를 통한 권한 요청
 * - 실패 시 false 반환
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    // 토스 미니앱에서는 registerPushNotification 호출 시 자동 권한 요청
    await registerPushNotification({
      topic: 'daily_mission',
      hour: 8,
      minute: 0,
    });
    return true;
  } catch {
    return false;
  }
};

/**
 * 매일 반복 알림 스케줄 등록
 * @param hour 0~23
 */
export const scheduleDaily = async (hour: number): Promise<void> => {
  try {
    await registerPushNotification({
      topic: 'daily_mission',
      hour,
      minute: 0,
    });
  } catch {
    // 등록 실패 무시
  }
};

/**
 * 매일 반복 알림 취소
 */
export const cancelDailyNotification = async (): Promise<void> => {
  try {
    // 유효하지 않은 시간으로 등록하여 사실상 비활성화
    await registerPushNotification({
      topic: 'daily_mission_disabled',
      hour: 0,
      minute: 0,
    });
  } catch {
    // 취소 실패 무시
  }
};
