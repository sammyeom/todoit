import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, BackHandler } from 'react-native';
import { loadInterstitialAd } from '@apps-in-toss/framework';
import { useMissionState } from './hooks/useMissionState';
import MissionCard from './screens/MissionCard';
import MissionProgress from './screens/MissionProgress';
import MissionComplete from './screens/MissionComplete';
import StampBoard from './components/StampBoard';
import BadgeModal from './components/BadgeModal';
import MissionPacks from './components/MissionPacks';
import Settings from './components/Settings';
import PreviewModal from './components/PreviewModal';
import Snackbar from './components/Snackbar';
import { AD_GROUP_ID } from './config/env';
import { getTomorrowMission } from './data/missions';
import { safeShowInterstitialAd } from './utils/adUtils';

export default function AppNavigator() {
  const {
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
  } = useMissionState();

  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [pendingBadgeIds, setPendingBadgeIds] = useState<string[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? (navigator.onLine ?? true) : true,
  );
  const adPreloaded = useRef(false);

  // 네트워크 상태 감지
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const showSnackbar = useCallback((msg: string) => {
    setSnackbar(msg);
  }, []);

  const dismissSnackbar = useCallback(() => {
    setSnackbar(null);
  }, []);

  // 광고 사전 로딩 (체크리스트: 실시간 로딩 금지)
  useEffect(() => {
    if (AD_GROUP_ID && !adPreloaded.current && !state.isPremium) {
      adPreloaded.current = true;
      void loadInterstitialAd({ adGroupId: AD_GROUP_ID }).catch(() => {});
    }
  }, [state.isPremium]);

  // 새 뱃지 획득 처리: isPremium false → 전면 광고 → BadgeModal
  useEffect(() => {
    if (newBadgeIds.length === 0) return;

    const showModal = () => {
      setPendingBadgeIds(newBadgeIds);
      setShowBadgeModal(true);
    };

    if (!state.isPremium && AD_GROUP_ID) {
      void (async () => {
        await safeShowInterstitialAd(AD_GROUP_ID);
        showModal();
      })();
    } else {
      showModal();
    }
  }, [newBadgeIds, state.isPremium]);

  const handleDismissBadge = useCallback(() => {
    setShowBadgeModal(false);
    setPendingBadgeIds([]);
    dismissNewBadges();
  }, [dismissNewBadges]);

  const handlePreviewEarned = useCallback(() => {
    setShowPreviewModal(true);
  }, []);

  const handlePurchasePack = useCallback((packId: string) => {
    addPurchasedPack(packId);
    showSnackbar('✅ 구매 완료! 내일부터 팩 미션이 적용됩니다.');
  }, [addPurchasedPack, showSnackbar]);

  const handlePurchasePremium = useCallback(() => {
    setPremium(true);
    showSnackbar('👑 프리미엄 활성화! 광고가 사라졌어요.');
  }, [setPremium, showSnackbar]);

  const handleRestorePremium = useCallback(() => {
    setPremium(true);
    showSnackbar('✅ 구매가 복원되었습니다.');
  }, [setPremium, showSnackbar]);

  const handlePaymentError = useCallback((msg: string) => {
    showSnackbar(msg);
  }, [showSnackbar]);

  // 토스 내비게이션 바 뒤로가기 처리
  useEffect(() => {
    const onBackPress = () => {
      if (screen !== 'home') {
        goHome();
        return true; // 이벤트 소비
      }
      return false; // 기본 동작 (앱 종료)
    };
    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, [screen, goHome]);

  if (!todayMission) return null;

  return (
    <>
      {!isOnline && (
        <View style={offlineStyles.banner}>
          <Text style={offlineStyles.bannerText}>
            오프라인 상태입니다. 일부 기능이 제한될 수 있어요.
          </Text>
        </View>
      )}

      {screen === 'home' && (
        <MissionCard
          mission={todayMission}
          state={state}
          completedToday={completedToday}
          onStart={startMission}
          onPass={passToday}
          onGoStamps={goStamps}
          onGoStore={goPacks}
          onGoSettings={goSettings}
        />
      )}
      {screen === 'progress' && (
        <MissionProgress
          mission={todayMission}
          onComplete={completeMission}
          onGiveUp={goHome}
        />
      )}
      {screen === 'complete' && (
        <MissionComplete
          mission={todayMission}
          state={state}
          isPremium={state.isPremium}
          notificationEnabled={state.notificationEnabled}
          onGoHome={goHome}
          onGoStamps={goStamps}
          onStreakShieldEarned={addStreakShield}
          onPreviewEarned={handlePreviewEarned}
          onNotificationEnabled={() => setNotificationEnabled(true)}
        />
      )}
      {screen === 'stamps' && (
        <StampBoard
          state={state}
          earnedBadges={earnedBadges}
          onGoHome={goHome}
        />
      )}
      {screen === 'packs' && (
        <MissionPacks
          isPremium={state.isPremium}
          purchasedPacks={state.purchasedPacks}
          onPurchasePack={handlePurchasePack}
          onPurchasePremium={handlePurchasePremium}
          onPaymentError={handlePaymentError}
          onGoHome={goHome}
        />
      )}
      {screen === 'settings' && (
        <Settings
          isPremium={state.isPremium}
          purchasedPacks={state.purchasedPacks}
          notificationHour={state.notificationHour}
          notificationEnabled={state.notificationEnabled}
          preferredCategories={state.preferredCategories as Array<'health' | 'money' | 'productivity' | 'mindfulness'>}
          onChangeNotificationHour={setNotificationHour}
          onToggleCategory={togglePreferredCategory}
          onToggleNotification={setNotificationEnabled}
          onRestorePremium={handleRestorePremium}
          onRestorePack={addPurchasedPack}
          onPurchasePremium={handlePurchasePremium}
          onPaymentError={handlePaymentError}
          onGoHome={goHome}
        />
      )}

      {showBadgeModal && pendingBadgeIds.length > 0 && (
        <BadgeModal
          badgeIds={pendingBadgeIds}
          state={state}
          onDismiss={handleDismissBadge}
        />
      )}

      {showPreviewModal && (
        <PreviewModal
          mission={getTomorrowMission()}
          onClose={() => setShowPreviewModal(false)}
        />
      )}

      {snackbar && (
        <Snackbar
          message={snackbar}
          onDismiss={dismissSnackbar}
        />
      )}
    </>
  );
}

const offlineStyles = StyleSheet.create({
  banner: {
    backgroundColor: '#FFF3CD',
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    zIndex: 9999,
  },
  bannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#856404',
    textAlign: 'center',
  },
});
