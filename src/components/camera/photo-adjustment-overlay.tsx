import React from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { Image } from 'expo-image';

import { CameraAlignmentOverlay } from '@/components/camera/camera-alignment-overlay';
import { WearViewText } from '@/components/wearview/wearview-text';
import { AppTheme, Radius, Spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type PhotoAdjustmentOverlayProps = {
  photoUri: string;
  translationX: SharedValue<number>;
  translationY: SharedValue<number>;
  scale: SharedValue<number>;
  rotation: SharedValue<number>;
  gesture: ReturnType<typeof import('react-native-gesture-handler').Gesture.Simultaneous>;
  fitConfidence: number;
  isFitDetected: boolean;
  onConfirm: () => void;
  onReset: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PhotoAdjustmentOverlay({
  photoUri,
  translationX,
  translationY,
  scale,
  rotation,
  gesture,
  fitConfidence,
  isFitDetected,
  onConfirm,
  onReset,
}: PhotoAdjustmentOverlayProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}rad` },
    ],
  }));

  return (
    <GestureHandlerRootView style={StyleSheet.absoluteFill}>
      <View style={styles.container}>
        <Animated.View
          style={[styles.photoContainer, animatedStyle]}
        >
          <Image
            source={{ uri: photoUri }}
            style={styles.photo}
            contentFit="contain"
          />
        </Animated.View>

        <CameraAlignmentOverlay
          isFitDetected={isFitDetected}
          fitConfidence={fitConfidence}
        />

        <View style={styles.instructionsPanel}>
          <WearViewText variant="bodySm" color={AppTheme.colors.accent} style={styles.instructionText}>
            Pinch to zoom, drag to move, twist to rotate
          </WearViewText>
        </View>

        <View style={styles.actionBar}>
          <AnimatedPressable
            onPress={onReset}
            style={styles.actionButton}
          >
            <WearViewText variant="button" color={AppTheme.colors.text}>Reset</WearViewText>
          </AnimatedPressable>
          <AnimatedPressable
            onPress={onConfirm}
            style={[styles.actionButton, isFitDetected && styles.actionButtonSuccess]}
          >
            <WearViewText
              variant="button"
              color={isFitDetected ? AppTheme.colors.success : AppTheme.colors.text}
            >
              {isFitDetected ? 'Confirm Fit' : 'Confirm'}
            </WearViewText>
          </AnimatedPressable>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  photoContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  instructionsPanel: {
    position: 'absolute',
    top: Spacing.xxxl + 20,
    left: Spacing.lg,
    right: Spacing.lg,
    alignItems: 'center',
  },
  instructionText: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(11, 16, 32, 0.75)',
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: Radius.full,
    fontWeight: '500',
  },
  actionBar: {
    position: 'absolute',
    bottom: Spacing.xxl + 20,
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: AppTheme.colors.glass,
    borderWidth: 1.5,
    borderColor: AppTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonSuccess: {
    borderColor: AppTheme.colors.success,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
});
