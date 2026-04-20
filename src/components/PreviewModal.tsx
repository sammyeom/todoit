import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { theme } from '../theme';
import { getDifficultyLabel, getDifficultyColor, type Mission } from '../data/missions';

interface PreviewModalProps {
  mission: Mission;
  onClose: () => void;
}

export default function PreviewModal({ mission, onClose }: PreviewModalProps) {
  const diffColor = getDifficultyColor(mission.difficulty);
  const diffLabel = getDifficultyLabel(mission.difficulty);

  return (
    <Modal transparent animationType="fade" visible>
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <Text style={styles.label}>내일의 미션</Text>
        <Text style={styles.emoji}>{mission.emoji}</Text>
        <Text style={styles.title}>{mission.title}</Text>
        <Text style={styles.description}>{mission.description}</Text>

        <View style={[styles.badge, { backgroundColor: diffColor + '20' }]}>
          <Text style={[styles.badgeText, { color: diffColor }]}>
            {diffLabel}
          </Text>
        </View>

        {mission.type === 'timer' && mission.duration != null && (
          <Text style={styles.durationHint}>
            ⏱️ {Math.floor(mission.duration / 60)}분 소요
          </Text>
        )}

        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          activeOpacity={0.85}
        >
          <Text style={styles.closeBtnText}>확인</Text>
        </TouchableOpacity>
      </View>
    </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    width: '85%',
    backgroundColor: theme.card,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.primary,
    marginBottom: 4,
  },
  emoji: {
    fontSize: 56,
    lineHeight: 64,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.text,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSub,
    textAlign: 'center',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 9999,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  durationHint: {
    fontSize: 12,
    color: theme.textSub,
    fontWeight: '600',
  },
  closeBtn: {
    width: '100%',
    height: 48,
    borderRadius: 9999,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
