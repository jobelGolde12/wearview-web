import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { WearViewText } from '@/components/wearview/wearview-text';
import { AppTheme, Radius, Spacing } from '@/constants/theme';
import type { AlignmentFeedback, GuidanceDirection } from '@/types/camera-guide';

const DIRECTION_ICONS: Record<GuidanceDirection, string> = {
  'move-left': '←',
  'move-right': '→',
  'step-closer': '↑',
  'step-back': '↓',
  'tilt-up': '↗',
  'tilt-down': '↘',
  'center-torso': '⊕',
  'align-shoulders': '⇔',
  'raise-camera': '↑',
  'lower-camera': '↓',
  'none': '',
};

type AlignmentFeedbackPanelProps = {
  feedback: AlignmentFeedback;
  isFitDetected: boolean;
};

export function AlignmentFeedbackPanel({ feedback, isFitDetected }: AlignmentFeedbackPanelProps) {
  const opacity = useSharedValue(1);
  const prevDirection = useRef<GuidanceDirection>('none');

  useEffect(() => {
    if (feedback.direction !== prevDirection.current) {
      prevDirection.current = feedback.direction;
      opacity.value = 0;
      opacity.value = withTiming(1, { duration: 200 });
    }
  }, [feedback.direction, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const icon = DIRECTION_ICONS[feedback.direction];

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View
        style={[
          styles.panel,
          isFitDetected && styles.panelSuccess,
        ]}
      >
        {icon && !isFitDetected && (
          <WearViewText
            variant="metricValue"
            color={isFitDetected ? AppTheme.colors.success : AppTheme.colors.accent}
            style={styles.icon}
          >
            {icon}
          </WearViewText>
        )}
        <WearViewText
          variant="bodySm"
          color={isFitDetected ? AppTheme.colors.success : AppTheme.colors.text}
          style={styles.text}
        >
          {isFitDetected ? 'Perfect Fit Detected' : feedback.message}
        </WearViewText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Spacing.xxxl + 20,
    left: Spacing.lg,
    right: Spacing.lg,
    alignItems: 'center',
  },
  panel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(11, 16, 32, 0.75)',
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: Radius.full,
    backdropFilter: 'blur(12px)',
  },
  panelSuccess: {
    borderColor: AppTheme.colors.success,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  icon: {
    fontSize: 20,
    fontWeight: '700',
  },
  text: {
    fontWeight: '600',
  },
});
