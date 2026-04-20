import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Storage } from '@apps-in-toss/framework';
import { getTodayMission, type Mission } from '../data/missions';
import { MISSION_PACKS, getPackMission } from '../data/missionPacks';

const STORAGE_KEY = 'dailydo_state';

// ─── Badge definitions ─────────────────────────────────────
export interface BadgeDef {
  id: string;
  emoji: string;
  name: string;
  description: string;
}

export const BADGE_DEFS: BadgeDef[] = [
  { id: 'first_clear',    emoji: '🔥', name: '불꽃 스타터',    description: '첫 미션 완료' },
  { id: 'streak_3',       emoji: '⚡', name: '3일 챔피언',     description: '3일 연속 달성' },
  { id: 'streak_7',       emoji: '🌟', name: '7일 전사',       description: '7일 연속 달성' },
  { id: 'streak_30',      emoji: '💎', name: '30일 레전드',    description: '30일 연속 달성' },
  { id: 'health_10',      emoji: '🏃', name: '건강 마스터',    description: '건강 미션 10회 완료' },
  { id: 'money_10',       emoji: '💰', name: '절약 고수',      description: '절약 미션 10회 완료' },
  { id: 'mindfulness_5',  emoji: '🧘', name: '마인드풀 루키',  description: '마음챙김 미션 5회 완료' },
];

// ─── State types ───────────────────────────────────────────
export interface CategoryCompletions {
  health: number;
  money: number;
  productivity: number;
  mindfulness: number;
}

const ALL_CATEGORIES: Mission['category'][] = ['health', 'money', 'productivity', 'mindfulness'];

export interface MissionState {
  lastCompletedDate: string;
  streak: number;
  totalCompleted: number;
  badges: string[];
  stamps: string[]; // ISO date strings of completed days
  passedToday: boolean;
  categoryCompletions: CategoryCompletions;
  isPremium: boolean;
  purchasedPacks: string[];
  notificationHour: number;
  preferredCategories: string[];
  streakShield: number;
  notificationEnabled: boolean;
}

const DEFAULT_CATEGORY: CategoryCompletions = {
  health: 0,
  money: 0,
  productivity: 0,
  mindfulness: 0,
};

const DEFAULT_STATE: MissionState = {
  lastCompletedDate: '',
  streak: 0,
  totalCompleted: 0,
  badges: [],
  stamps: [],
  passedToday: false,
  categoryCompletions: { ...DEFAULT_CATEGORY },
  isPremium: false,
  purchasedPacks: [],
  notificationHour: 8,
  preferredCategories: [...ALL_CATEGORIES],
  streakShield: 0,
  notificationEnabled: false,
};

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getYesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Check which badges should be unlocked given current state */
function computeNewBadges(s: MissionState): string[] {
  const earned = new Set(s.badges);
  const pending: string[] = [];

  if (s.totalCompleted >= 1 && !earned.has('first_clear'))    pending.push('first_clear');
  if (s.streak >= 3  && !earned.has('streak_3'))              pending.push('streak_3');
  if (s.streak >= 7  && !earned.has('streak_7'))              pending.push('streak_7');
  if (s.streak >= 30 && !earned.has('streak_30'))             pending.push('streak_30');
  if (s.categoryCompletions.health >= 10 && !earned.has('health_10'))
    pending.push('health_10');
  if (s.categoryCompletions.money >= 10 && !earned.has('money_10'))
    pending.push('money_10');
  if (s.categoryCompletions.mindfulness >= 5 && !earned.has('mindfulness_5'))
    pending.push('mindfulness_5');

  return pending;
}

/** 구매한 팩 미션 우선 → 소진되면 일반 미션 fallback */
function resolvePackMission(s: MissionState, todayKey: string): Mission {
  if (s.purchasedPacks.length > 0) {
    // 날짜 기반 seed로 팩 + 미션 인덱스 결정
    const seed = Array.from(todayKey).reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const packs = MISSION_PACKS.filter((p) => s.purchasedPacks.includes(p.id));
    if (packs.length > 0) {
      const pack = packs[seed % packs.length]!;
      const dayIndex = Math.floor(seed / packs.length);
      return getPackMission(pack, dayIndex);
    }
  }
  return getTodayMission(todayKey);
}

export type Screen = 'home' | 'progress' | 'complete' | 'stamps' | 'packs' | 'settings';

export function useMissionState() {
  const [state, setState] = useState<MissionState>(DEFAULT_STATE);
  const [screen, setScreen] = useState<Screen>('home');
  const [todayMission, setTodayMission] = useState<Mission | null>(null);
  const [newBadgeIds, setNewBadgeIds] = useState<string[]>([]);
  const hydrated = useRef(false);

  const today = getTodayKey();
  const completedToday = state.lastCompletedDate === today;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const raw = await Storage.getItem(STORAGE_KEY).catch(() => null);
      if (cancelled) return;

      let loaded: MissionState = DEFAULT_STATE;
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Partial<MissionState>;
          loaded = {
            ...DEFAULT_STATE,
            ...parsed,
            categoryCompletions: {
              ...DEFAULT_CATEGORY,
              ...parsed.categoryCompletions,
            },
            isPremium: parsed.isPremium ?? false,
            purchasedPacks: parsed.purchasedPacks ?? [],
            notificationHour: parsed.notificationHour ?? 8,
            preferredCategories: parsed.preferredCategories ?? [...ALL_CATEGORIES],
            streakShield: parsed.streakShield ?? 0,
            notificationEnabled: parsed.notificationEnabled ?? false,
          };
        } catch {
          loaded = DEFAULT_STATE;
        }
      }

      // Reset passedToday if it's a new day
      if (loaded.lastCompletedDate !== today && loaded.passedToday) {
        loaded = { ...loaded, passedToday: false };
      }

      // Check streak continuity — streakShield 소비로 보호 가능
      const yesterday = getYesterdayKey();
      if (loaded.lastCompletedDate !== today && loaded.lastCompletedDate !== yesterday) {
        if (loaded.streakShield > 0) {
          loaded = { ...loaded, streakShield: loaded.streakShield - 1 };
        } else {
          loaded = { ...loaded, streak: 0 };
        }
      }

      setState(loaded);
      setTodayMission(resolvePackMission(loaded, today));
      hydrated.current = true;
    })();
    return () => { cancelled = true; };
  }, [today]);

  useEffect(() => {
    if (!hydrated.current) return;
    void Storage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const completeMission = useCallback(() => {
    const mission = getTodayMission(getTodayKey());

    setState((prev) => {
      const newStreak = prev.lastCompletedDate === getYesterdayKey() ? prev.streak + 1 : 1;
      const newStamps = [...prev.stamps, today].slice(-30);
      const newCat = { ...prev.categoryCompletions };
      newCat[mission.category] = (newCat[mission.category] ?? 0) + 1;

      const next: MissionState = {
        ...prev,
        lastCompletedDate: today,
        streak: newStreak,
        totalCompleted: prev.totalCompleted + 1,
        stamps: newStamps,
        passedToday: false,
        categoryCompletions: newCat,
      };

      // Compute newly earned badges
      const earned = computeNewBadges(next);
      if (earned.length > 0) {
        next.badges = [...prev.badges, ...earned];
        // Schedule new-badge notification (runs after render)
        setTimeout(() => setNewBadgeIds(earned), 0);
      }

      return next;
    });
    setScreen('complete');
  }, [today]);

  const dismissNewBadges = useCallback(() => {
    setNewBadgeIds([]);
  }, []);

  const passToday = useCallback(() => {
    setState((prev) => ({ ...prev, passedToday: true }));
  }, []);

  const startMission = useCallback(() => {
    setScreen('progress');
  }, []);

  const goHome = useCallback(() => {
    setScreen('home');
  }, []);

  const goStamps = useCallback(() => {
    setScreen('stamps');
  }, []);

  const goPacks = useCallback(() => {
    setScreen('packs');
  }, []);

  const goSettings = useCallback(() => {
    setScreen('settings');
  }, []);

  const setPremium = useCallback((v: boolean) => {
    setState((prev) => ({ ...prev, isPremium: v }));
  }, []);

  const addPurchasedPack = useCallback((packId: string) => {
    setState((prev) => {
      if (prev.purchasedPacks.includes(packId)) return prev;
      const next = { ...prev, purchasedPacks: [...prev.purchasedPacks, packId] };
      // 팩 구매 후 todayMission 업데이트
      setTodayMission(resolvePackMission(next, getTodayKey()));
      return next;
    });
  }, []);

  const setNotificationHour = useCallback((hour: number) => {
    setState((prev) => ({ ...prev, notificationHour: hour }));
  }, []);

  const addStreakShield = useCallback(() => {
    setState((prev) => ({ ...prev, streakShield: prev.streakShield + 1 }));
  }, []);

  const setNotificationEnabled = useCallback((v: boolean) => {
    setState((prev) => ({ ...prev, notificationEnabled: v }));
  }, []);

  const togglePreferredCategory = useCallback((category: string) => {
    setState((prev) => {
      const cats = prev.preferredCategories.includes(category)
        ? prev.preferredCategories.filter((c) => c !== category)
        : [...prev.preferredCategories, category];
      return { ...prev, preferredCategories: cats };
    });
  }, []);

  const earnedBadges = useMemo(
    () => new Set(state.badges),
    [state.badges],
  );

  return {
    state,
    screen,
    todayMission,
    completedToday,
    completeMission,
    passToday,
    startMission,
    goHome,
    goStamps,
    goPacks,
    goSettings,
    earnedBadges,
    newBadgeIds,
    dismissNewBadges,
    setPremium,
    addPurchasedPack,
    setNotificationHour,
    togglePreferredCategory,
    addStreakShield,
    setNotificationEnabled,
  };
}
