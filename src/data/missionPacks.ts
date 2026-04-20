import type { Mission } from './missions';

export interface MissionPack {
  id: string;
  name: string;
  emoji: string;
  price: number;
  priceLabel: string;
  description: string;
  missions: Mission[];
}

export const MISSION_PACKS: MissionPack[] = [
  {
    id: 'PACK_DIET',
    name: '다이어트 7일 팩',
    emoji: '🥗',
    price: 990,
    priceLabel: '₩990',
    description: '7일간 건강한 식습관을 만들어보세요',
    missions: [
      { id: 'diet-1', title: '아침 샐러드 먹기', emoji: '🥗', type: 'check', difficulty: 'easy', category: 'health', description: '신선한 채소로 하루를 시작하세요' },
      { id: 'diet-2', title: '물 2L 마시기', emoji: '💧', type: 'check', difficulty: 'medium', category: 'health', description: '충분한 수분 섭취로 대사를 높이세요' },
      { id: 'diet-3', title: '야식 참기', emoji: '🚫', type: 'check', difficulty: 'hard', category: 'health', description: '저녁 8시 이후 음식을 참아보세요' },
      { id: 'diet-4', title: '30분 유산소 운동', emoji: '🏃', type: 'timer', duration: 1800, difficulty: 'hard', category: 'health', description: '유산소 운동으로 칼로리를 태우세요' },
      { id: 'diet-5', title: '건강 간식 먹기', emoji: '🍎', type: 'check', difficulty: 'easy', category: 'health', description: '과자 대신 과일을 선택하세요' },
      { id: 'diet-6', title: '식단 기록하기', emoji: '📝', type: 'check', difficulty: 'easy', category: 'health', description: '오늘 먹은 것을 기록해보세요' },
      { id: 'diet-7', title: '15분 홈트레이닝', emoji: '💪', type: 'timer', duration: 900, difficulty: 'medium', category: 'health', description: '집에서 간단한 운동을 해보세요' },
    ],
  },
  {
    id: 'PACK_SAVE',
    name: '절약 챌린지 7일 팩',
    emoji: '💰',
    price: 990,
    priceLabel: '₩990',
    description: '7일간 절약 습관을 길러보세요',
    missions: [
      { id: 'save-1', title: '가계부 쓰기', emoji: '📒', type: 'check', difficulty: 'easy', category: 'money', description: '오늘의 수입과 지출을 기록하세요' },
      { id: 'save-2', title: '커피 대신 텀블러', emoji: '☕', type: 'check', difficulty: 'medium', category: 'money', description: '카페 대신 직접 만든 음료를 챙기세요' },
      { id: 'save-3', title: '무지출 데이', emoji: '🏆', type: 'check', difficulty: 'hard', category: 'money', description: '오늘 하루 아무것도 사지 않기' },
      { id: 'save-4', title: '구독 서비스 점검', emoji: '📱', type: 'check', difficulty: 'easy', category: 'money', description: '안 쓰는 구독이 있는지 확인하세요' },
      { id: 'save-5', title: '도시락 싸기', emoji: '🍱', type: 'check', difficulty: 'medium', category: 'money', description: '배달 대신 직접 만든 도시락을 챙기세요' },
      { id: 'save-6', title: '저축 목표 세우기', emoji: '🎯', type: 'check', difficulty: 'easy', category: 'money', description: '이번 달 저축 목표를 정해보세요' },
      { id: 'save-7', title: '충동구매 24시간 룰', emoji: '⏰', type: 'check', difficulty: 'hard', category: 'money', description: '사고 싶은 걸 24시간 참아보세요' },
    ],
  },
  {
    id: 'PACK_PRODUCT',
    name: '생산성 부스터 7일 팩',
    emoji: '🚀',
    price: 1490,
    priceLabel: '₩1,490',
    description: '7일간 생산성을 극대화하세요',
    missions: [
      { id: 'prod-1', title: '모닝 루틴 완수', emoji: '🌅', type: 'check', difficulty: 'medium', category: 'productivity', description: '아침 루틴을 정하고 실천하세요' },
      { id: 'prod-2', title: '딥워크 90분', emoji: '🧠', type: 'timer', duration: 5400, difficulty: 'hard', category: 'productivity', description: '90분간 깊이 집중해보세요' },
      { id: 'prod-3', title: '주간 목표 리뷰', emoji: '📊', type: 'check', difficulty: 'easy', category: 'productivity', description: '이번 주 목표를 점검해보세요' },
      { id: 'prod-4', title: 'SNS 1시간 제한', emoji: '📵', type: 'timer', duration: 3600, difficulty: 'medium', category: 'productivity', description: '1시간 동안 SNS 없이 지내보세요' },
      { id: 'prod-5', title: '이메일 제로 만들기', emoji: '📧', type: 'check', difficulty: 'medium', category: 'productivity', description: '받은 편지함을 비워보세요' },
      { id: 'prod-6', title: '내일 할 일 미리 정리', emoji: '📋', type: 'check', difficulty: 'easy', category: 'productivity', description: '내일 할 일을 미리 적어두세요' },
      { id: 'prod-7', title: '2시간 몰입 세션', emoji: '🔥', type: 'timer', duration: 7200, difficulty: 'hard', category: 'productivity', description: '2시간 완전 몰입에 도전하세요' },
    ],
  },
];

export interface PremiumPlan {
  id: string;
  name: string;
  emoji: string;
  price: number;
  priceLabel: string;
  description: string;
  features: string[];
}

export const PREMIUM_PLAN: PremiumPlan = {
  id: 'PREMIUM_MONTH',
  name: '프리미엄 월정액',
  emoji: '👑',
  price: 1990,
  priceLabel: '₩1,990/월',
  description: '광고 제거 + 미션 커스텀 + 전체 팩 포함',
  features: [
    '모든 광고 제거',
    '미션 카테고리 선호 설정',
    '전체 미션 팩 무제한 이용',
    '프리미엄 전용 뱃지',
  ],
};

/** 팩 미션 중 오늘의 미션을 반환 (팩 기간 내 날짜 기반) */
export function getPackMission(pack: MissionPack, dayIndex: number): Mission {
  const idx = dayIndex % pack.missions.length;
  return pack.missions[idx]!;
}
