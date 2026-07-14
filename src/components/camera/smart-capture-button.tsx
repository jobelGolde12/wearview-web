import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { WearViewText } from '@/components/wearview/wearview-text';
import { AppTheme, Radius, Spacing } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type SmartCaptureButtonProps = {
  isEnabled: boolean;
  fitConfidence: number;
  onPress: () => void;
};

export function SmartCaptureButton({ isEnabled, fitConfidence, onPress }: SmartCaptureButtonProps) {
  const pulseOpacity = useSharedValue(0);
  const scale = useSharedValue(1);
  const pressed = useSharedValue(false);

  useEffect(() => {
    if (isEnabled) {
      pulseOpacity.value = withRepeat(
        withSequence(withTiming(0.7, { duration: 600 }), withTiming(0.2, { duration: 600 })),
        -1,
        true,
      );
      scale.value = withRepeat(
        withSequence(withTiming(1.04, { duration: 800 }), withTiming(1, { duration: 800 })),
        -1,
        true,
      );
    } else {
      pulseOpacity.value = withTiming(0, { duration: 300 });
      scale.value = withTiming(1, { duration: 300 });
    }
  }, [isEnabled, pulseOpacity, scale]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => {
    const baseScale = scale.value;
    const pressScale = pressed.value ? 0.96 : 1;
    const opacityVal = pressed.value ? 0.88 : (isEnabled ? 1 : 0.5);
    return {
      transform: [{ scale: baseScale * pressScale }],
      opacity: opacityVal,
    };
  });

  return (
    <View style={styles.container}>
      {isEnabled && (
        <Animated.View style={[styles.glowRing, pulseStyle]} />
      )}
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => { pressed.value = true; }}
        onPressOut={() => { pressed.value = false; }}
        style={[
          styles.captureButton,
          !isEnabled && styles.captureButtonDisabled,
          buttonStyle,
        ]}
        disabled={!isEnabled}
        accessibilityLabel="Capture look"
        accessibilityState={{ disabled: !isEnabled }}
      >
        <View style={[styles.innerRing, isEnabled && styles.innerRingActive]}>
          <WearViewText
            variant="button"
            color={isEnabled ? AppTheme.colors.text : AppTheme.colors.textSecondary}
            style={styles.label}
          >
            {isEnabled ? 'CAPTURE' : 'ALIGN'}
          </WearViewText>
        </View>
      </AnimatedPressable>
      {isEnabled && (
        <View style={styles.confidenceBar}>
          <View
            style={[
              styles.confidenceFill,
              { width: `${Math.min(fitConfidence * 100, 100)}%` },
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Spacing.xxl + 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: Radius.full,
    backgroundColor: AppTheme.colors.success,
    top: -8,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppTheme.colors.primary,
    shadowColor: AppTheme.colors.primary,
    shadowOpacity: 0.6,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
  },
  captureButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowOpacity: 0,
    elevation: 0,
  },
  innerRing: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  innerRingActive: {
    borderColor: AppTheme.colors.success,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  label: {
    fontSize: 11,
    letterSpacing: 1.2,
  },
  confidenceBar: {
    marginTop: Spacing.md,
    width: 120,
    height: 3,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: Radius.sm,
    backgroundColor: AppTheme.colors.success,
  },
});
