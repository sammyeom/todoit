import { getTossShareLink, share } from '@apps-in-toss/framework';
import type { Mission } from '../data/missions';
import type { MissionState } from '../hooks/useMissionState';
import { BADGE_DEFS, type BadgeDef } from '../hooks/useMissionState';

/** 미션 완료 공유 */
export async function shareMissionComplete(
  mission: Mission,
  state: MissionState,
): Promise<void> {
  const shareLink = await getTossShareLink(
    `intoss://dailydo?streak=${state.streak}`,
  );

  const msg = [
    `오늘의 미션 완료! 🎉`,
    `${mission.emoji} ${mission.title}`,
    `🔥 ${state.streak}일 연속 달성 중`,
    `#오늘의미션 #DailyDo`,
    shareLink,
  ].join('\n');

  await share({ message: msg });
}

/** 뱃지 획득 공유 */
export async function shareBadge(
  badge: BadgeDef,
  state: MissionState,
): Promise<void> {
  const shareLink = await getTossShareLink(
    `intoss://dailydo?badge=${badge.id}`,
  );

  const msg = [
    `${badge.emoji} 뱃지 획득! — ${badge.name}`,
    `${badge.description}`,
    `🔥 ${state.streak}일 연속 | 총 ${state.totalCompleted}회 완료`,
    `#DailyDo`,
    shareLink,
  ].join('\n');

  await share({ message: msg });
}

/** 스탬프 보드 공유 */
export async function shareStampBoard(state: MissionState): Promise<void> {
  const badgeEmojis = BADGE_DEFS
    .filter((b) => state.badges.includes(b.id))
    .map((b) => b.emoji)
    .join('');

  const shareLink = await getTossShareLink(
    `intoss://dailydo?streak=${state.streak}&badges=${state.badges.length}`,
  );

  const lines: string[] = [
    `🌟 DailyDo 스탬프 보드`,
    `🔥 ${state.streak}일 연속 | 총 ${state.totalCompleted}회 완료`,
  ];

  if (badgeEmojis) {
    lines.push(`뱃지: ${badgeEmojis}`);
  }

  lines.push(`#DailyDo`);
  lines.push(shareLink);

  await share({ message: lines.join('\n') });
}
