export interface Mission {
  id: string;
  title: string;
  emoji: string;
  type: 'timer' | 'check';
  duration?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'health' | 'money' | 'productivity' | 'mindfulness';
  description: string;
}

export const MISSIONS: Mission[] = [
  // easy / health
  { id: 'e-h-1', title: '물 한 컵 마시기', emoji: '💧', type: 'check', difficulty: 'easy', category: 'health', description: '지금 바로 물 한 컵을 마셔보세요' },
  { id: 'e-h-2', title: '1분 스트레칭', emoji: '🤸', type: 'timer', duration: 60, difficulty: 'easy', category: 'health', description: '자리에서 간단히 몸을 풀어보세요' },
  { id: 'e-h-3', title: '심호흡 5회', emoji: '🌬️', type: 'check', difficulty: 'easy', category: 'health', description: '깊게 숨을 들이쉬고 내쉬세요' },

  // easy / money
  { id: 'e-m-1', title: '오늘 지출 기록하기', emoji: '📝', type: 'check', difficulty: 'easy', category: 'money', description: '오늘 쓴 돈을 한 번 떠올려보세요' },
  { id: 'e-m-2', title: '영수증 사진 찍기', emoji: '📸', type: 'check', difficulty: 'easy', category: 'money', description: '영수증을 사진으로 기록해두세요' },
  { id: 'e-m-3', title: '통장 잔고 확인하기', emoji: '🏦', type: 'check', difficulty: 'easy', category: 'money', description: '내 잔고를 한 번 확인해보세요' },

  // easy / productivity
  { id: 'e-p-1', title: '책상 정리하기', emoji: '🗂️', type: 'check', difficulty: 'easy', category: 'productivity', description: '깨끗한 책상에서 시작해요' },
  { id: 'e-p-2', title: '오늘 할 일 3개 적기', emoji: '✅', type: 'check', difficulty: 'easy', category: 'productivity', description: '오늘 꼭 해야 할 일을 정해보세요' },
  { id: 'e-p-3', title: '이메일 정리하기', emoji: '📧', type: 'check', difficulty: 'easy', category: 'productivity', description: '읽지 않은 메일을 정리해보세요' },

  // easy / mindfulness
  { id: 'e-mi-1', title: '하늘 바라보기', emoji: '🌤️', type: 'timer', duration: 60, difficulty: 'easy', category: 'mindfulness', description: '잠시 하늘을 올려다보세요' },

  // medium / health
  { id: 'm-h-1', title: '10분 산책', emoji: '🚶', type: 'timer', duration: 600, difficulty: 'medium', category: 'health', description: '바깥 공기를 마시며 걸어보세요' },
  { id: 'm-h-2', title: '계단 이용하기', emoji: '🪜', type: 'check', difficulty: 'medium', category: 'health', description: '엘리베이터 대신 계단을 선택하세요' },
  { id: 'm-h-3', title: '물 8잔 마시기', emoji: '💧', type: 'check', difficulty: 'medium', category: 'health', description: '하루 권장 수분 섭취량을 채워보세요' },
  { id: 'm-h-4', title: '5분 플랭크', emoji: '💪', type: 'timer', duration: 300, difficulty: 'medium', category: 'health', description: '코어를 단련해보세요' },

  // medium / money
  { id: 'm-m-1', title: '커피 한 잔 참기', emoji: '☕', type: 'check', difficulty: 'medium', category: 'money', description: '오늘 하루 카페 지출을 아껴보세요' },
  { id: 'm-m-2', title: '배달 대신 도시락', emoji: '🍱', type: 'check', difficulty: 'medium', category: 'money', description: '직접 준비한 식사로 건강도 챙기세요' },
  { id: 'm-m-3', title: '위시리스트 정리', emoji: '🛒', type: 'check', difficulty: 'medium', category: 'money', description: '정말 필요한 것만 남겨보세요' },

  // medium / productivity
  { id: 'm-p-1', title: 'SNS 30분 끊기', emoji: '📵', type: 'timer', duration: 1800, difficulty: 'medium', category: 'productivity', description: 'SNS 없이 집중 시간을 가져보세요' },
  { id: 'm-p-2', title: '뽀모도로 1세션', emoji: '🍅', type: 'timer', duration: 1500, difficulty: 'medium', category: 'productivity', description: '25분 집중, 5분 휴식!' },
  { id: 'm-p-3', title: '알림 끄고 집중', emoji: '🔕', type: 'timer', duration: 1200, difficulty: 'medium', category: 'productivity', description: '20분간 방해 없이 몰입해보세요' },

  // medium / mindfulness
  { id: 'm-mi-1', title: '5분 명상', emoji: '🧘', type: 'timer', duration: 300, difficulty: 'medium', category: 'mindfulness', description: '조용히 마음을 가라앉혀보세요' },

  // hard / health
  { id: 'h-h-1', title: '30분 운동', emoji: '🏃', type: 'timer', duration: 1800, difficulty: 'hard', category: 'health', description: '땀 흘리며 운동해보세요' },
  { id: 'h-h-2', title: '하루 설탕 0', emoji: '🚫', type: 'check', difficulty: 'hard', category: 'health', description: '오늘 하루 설탕을 멀리해보세요' },
  { id: 'h-h-3', title: '7시간 수면 달성', emoji: '😴', type: 'check', difficulty: 'hard', category: 'health', description: '충분한 수면으로 내일을 준비하세요' },

  // hard / money
  { id: 'h-m-1', title: '불필요한 지출 0원', emoji: '💰', type: 'check', difficulty: 'hard', category: 'money', description: '오늘 하루 꼭 필요한 것만 사세요' },
  { id: 'h-m-2', title: '무지출 챌린지', emoji: '🏆', type: 'check', difficulty: 'hard', category: 'money', description: '오늘 하루 아무것도 사지 않기!' },

  // hard / productivity
  { id: 'h-p-1', title: '딥워크 1시간', emoji: '🧠', type: 'timer', duration: 3600, difficulty: 'hard', category: 'productivity', description: '1시간 동안 깊이 집중해보세요' },

  // hard / mindfulness
  { id: 'h-mi-1', title: '10분 명상', emoji: '🧘', type: 'timer', duration: 600, difficulty: 'hard', category: 'mindfulness', description: '10분간 마음의 평화를 찾아보세요' },
  { id: 'h-mi-2', title: '감사일기 쓰기', emoji: '📖', type: 'check', difficulty: 'hard', category: 'mindfulness', description: '오늘 감사한 일 3가지를 적어보세요' },
  { id: 'h-mi-3', title: '디지털 디톡스 1시간', emoji: '🌿', type: 'timer', duration: 3600, difficulty: 'hard', category: 'mindfulness', description: '1시간 동안 전자기기 없이 보내세요' },
];

export function getTodayMission(seed: string): Mission {
  const hash = seed.split('').reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 0);
  const idx = Math.abs(hash) % MISSIONS.length;
  return MISSIONS[idx]!;
}

export function getTomorrowMission(): Mission {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const seed = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return getTodayMission(seed);
}

export function getDifficultyLabel(d: Mission['difficulty']): string {
  switch (d) {
    case 'easy': return '쉬움';
    case 'medium': return '보통';
    case 'hard': return '어려움';
  }
}

export function getDifficultyColor(d: Mission['difficulty']): string {
  switch (d) {
    case 'easy': return '#00B894';
    case 'medium': return '#FDCB6E';
    case 'hard': return '#E17055';
  }
}
