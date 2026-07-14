import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { AppTheme, Radius } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Adjust for bottom navigation bar (typically 80-100pts)
const BOTTOM_NAV_HEIGHT = 90;
const EFFECTIVE_HEIGHT = SCREEN_HEIGHT - BOTTOM_NAV_HEIGHT;

type CameraAlignmentOverlayProps = {
  isFitDetected: boolean;
  fitConfidence: number;
};

// Scale shirt to fit the screen while leaving space for navigation
const GUIDE_SCALE = Math.min(
  SCREEN_WIDTH / 360, 
  EFFECTIVE_HEIGHT / 780
);

// Enhanced proportions for a bigger, more prominent shirt shape with better anatomy
const HEAD_RADIUS = 56 * GUIDE_SCALE;
const HEAD_CENTER_Y = EFFECTIVE_HEIGHT * 0.22;
const NECK_Y = HEAD_CENTER_Y + HEAD_RADIUS;
const SHOULDER_Y = NECK_Y + 20 * GUIDE_SCALE; 
const SHOULDER_WIDTH = 280 * GUIDE_SCALE; 
const SHOULDER_SLOPE = 32 * GUIDE_SCALE;
const SLEEVE_LENGTH = 80 * GUIDE_SCALE; 
const SLEEVE_WIDTH = 84 * GUIDE_SCALE; 
const TORSO_BOTTOM_Y = EFFECTIVE_HEIGHT * 0.82;
const TORSO_WIDTH = 220 * GUIDE_SCALE; 
const CHEST_Y = SHOULDER_Y + 72 * GUIDE_SCALE;
const CHEST_WIDTH = 190 * GUIDE_SCALE; 
const COLLAR_WIDTH = 80 * GUIDE_SCALE;
const COLLAR_DEPTH = 24 * GUIDE_SCALE;

function HeadGuide({ isAligned }: { isAligned: boolean }) {
  const borderColor = isAligned ? AppTheme.colors.success : AppTheme.colors.accent;
  const fillColor = isAligned ? 'rgba(46, 204, 113, 0.12)' : 'rgba(0, 229, 255, 0.08)';
  
  return (
    <>
      <View
        style={[
          styles.headFill,
          {
            width: HEAD_RADIUS * 2,
            height: HEAD_RADIUS * 2,
            borderRadius: HEAD_RADIUS,
            top: HEAD_CENTER_Y - HEAD_RADIUS,
            left: SCREEN_WIDTH / 2 - HEAD_RADIUS,
            backgroundColor: fillColor,
          },
        ]}
      />
      <View
        style={[
          styles.headOutline,
          {
            width: HEAD_RADIUS * 2,
            height: HEAD_RADIUS * 2,
            borderRadius: HEAD_RADIUS,
            top: HEAD_CENTER_Y - HEAD_RADIUS,
            left: SCREEN_WIDTH / 2 - HEAD_RADIUS,
            borderColor,
          },
        ]}
      />
    </>
  );
}

function ShirtShape({ isAligned }: { isAligned: boolean }) {
  const borderColor = isAligned ? AppTheme.colors.success : AppTheme.colors.accent;
  const fillColor = isAligned ? 'rgba(46, 204, 113, 0.08)' : 'rgba(0, 229, 255, 0.06)';
  
  const centerX = SCREEN_WIDTH / 2;
  const halfCollar = COLLAR_WIDTH / 2;
  const halfShoulder = SHOULDER_WIDTH / 2;
  const halfTorso = TORSO_WIDTH / 2;
  
  // Define points for an organic shirt shape based on shirt.png proportions
  const p1 = { x: centerX - halfCollar, y: SHOULDER_Y - SHOULDER_SLOPE + 4 * GUIDE_SCALE }; // Left neck
  const p2 = { x: centerX + halfCollar, y: SHOULDER_Y - SHOULDER_SLOPE + 4 * GUIDE_SCALE }; // Right neck
  const p3 = { x: centerX + halfShoulder, y: SHOULDER_Y }; // Right shoulder point
  const p4 = { x: centerX + halfShoulder + SLEEVE_LENGTH, y: SHOULDER_Y + SHOULDER_SLOPE * 1.2 }; // Right sleeve end top
  const p5 = { x: p4.x - 12 * GUIDE_SCALE, y: p4.y + SLEEVE_WIDTH }; // Right sleeve end bottom
  const p6 = { x: centerX + halfTorso, y: SHOULDER_Y + SLEEVE_WIDTH - 4 * GUIDE_SCALE }; // Right armpit
  const p7 = { x: centerX + halfTorso, y: TORSO_BOTTOM_Y }; // Right bottom
  const p8 = { x: centerX - halfTorso, y: TORSO_BOTTOM_Y }; // Left bottom
  const p9 = { x: centerX - halfTorso, y: p6.y }; // Left armpit
  const p10 = { x: centerX - halfShoulder - SLEEVE_LENGTH + 12 * GUIDE_SCALE, y: p5.y }; // Left sleeve end bottom
  const p11 = { x: p10.x - 12 * GUIDE_SCALE, y: p4.y }; // Left sleeve end top
  const p12 = { x: centerX - halfShoulder, y: SHOULDER_Y }; // Left shoulder point

  // Control points for organic curves
  const neckCP = { x: centerX, y: p1.y + COLLAR_DEPTH };
  const rightArmpitCP = { x: centerX + halfTorso + 15 * GUIDE_SCALE, y: p6.y + 15 * GUIDE_SCALE };
  const leftArmpitCP = { x: centerX - halfTorso - 15 * GUIDE_SCALE, y: p9.y + 15 * GUIDE_SCALE };

  const d = `
    M ${p1.x} ${p1.y}
    Q ${neckCP.x} ${neckCP.y} ${p2.x} ${p2.y}
    L ${p3.x} ${p3.y}
    L ${p4.x} ${p4.y}
    L ${p5.x} ${p5.y}
    Q ${rightArmpitCP.x} ${rightArmpitCP.y} ${p6.x} ${p6.y}
    L ${p7.x} ${p7.y}
    L ${p8.x} ${p8.y}
    L ${p9.x} ${p9.y}
    Q ${leftArmpitCP.x} ${leftArmpitCP.y} ${p10.x} ${p10.y}
    L ${p11.x} ${p11.y}
    L ${p12.x} ${p12.y}
    Z
  `;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg height={SCREEN_HEIGHT} width={SCREEN_WIDTH} style={StyleSheet.absoluteFill}>
        <Path
          d={d}
          fill={fillColor}
        />
        <Path
          d={d}
          fill="none"
          stroke={borderColor}
          strokeWidth={3}
          strokeDasharray="8 6"
        />
      </Svg>
    </View>
  );
}

function ChestGuide({ isAligned }: { isAligned: boolean }) {
  const borderColor = isAligned ? AppTheme.colors.success : AppTheme.colors.accent;
  const fillColor = isAligned ? 'rgba(46, 204, 113, 0.08)' : 'rgba(0, 229, 255, 0.06)';
  
  return (
    <View
      style={[
        styles.chestZone,
        {
          width: CHEST_WIDTH,
          height: 88 * GUIDE_SCALE,
          top: CHEST_Y - 44 * GUIDE_SCALE,
          left: SCREEN_WIDTH / 2 - CHEST_WIDTH / 2,
          borderColor,
          borderRadius: Radius.lg,
          backgroundColor: fillColor,
        },
      ]}
    />
  );
}

function GlowPulse({ isActive }: { isActive: boolean }) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 800 }), 
          withTiming(0.05, { duration: 800 })
        ),
        -1,
        true,
      );
    } else {
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [isActive, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const glowWidth = SHOULDER_WIDTH + 100 * GUIDE_SCALE;
  const glowHeight = TORSO_BOTTOM_Y - HEAD_CENTER_Y + HEAD_RADIUS + 100 * GUIDE_SCALE;

  return (
    <Animated.View
      style={[
        styles.glowPulse,
        {
          width: glowWidth,
          height: glowHeight,
          top: HEAD_CENTER_Y - HEAD_RADIUS - 50 * GUIDE_SCALE,
          left: SCREEN_WIDTH / 2 - glowWidth / 2,
          borderRadius: Radius.xl,
          backgroundColor: AppTheme.colors.success,
        },
        animatedStyle,
      ]}
    />
  );
}

function CenterLine() {
  return (
    <View
      style={[
        styles.centerLine,
        {
          top: NECK_Y,
          left: SCREEN_WIDTH / 2 - 1.5,
          height: TORSO_BOTTOM_Y - NECK_Y,
        },
      ]}
    />
  );
}

export function CameraAlignmentOverlay({ isFitDetected, fitConfidence }: CameraAlignmentOverlayProps) {
  const torsoAligned = fitConfidence > 0.5;
  const headAligned = fitConfidence > 0.4;
  const chestAligned = fitConfidence > 0.55;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <GlowPulse isActive={isFitDetected} />

      <CenterLine />

      <HeadGuide isAligned={headAligned} />
      <ShirtShape isAligned={torsoAligned} />
      <ChestGuide isAligned={chestAligned} />

      <View style={styles.cornerGuides}>
        <View style={[styles.cornerMark, styles.topLeft]} />
        <View style={[styles.cornerMark, styles.topRight]} />
        <View style={[styles.cornerMark, styles.bottomLeft]} />
        <View style={[styles.cornerMark, styles.bottomRight]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headFill: {
    position: 'absolute',
  },
  headOutline: {
    position: 'absolute',
    borderWidth: 3,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  chestZone: {
    position: 'absolute',
    borderWidth: 2.5,
    borderStyle: 'dashed',
  },
  glowPulse: {
    position: 'absolute',
    shadowColor: AppTheme.colors.success,
    shadowOpacity: 0.6,
    shadowRadius: 35,
    shadowOffset: { width: 0, height: 0 },
  },
  centerLine: {
    position: 'absolute',
    width: 2.5,
    backgroundColor: 'rgba(0, 229, 255, 0.25)',
  },
  cornerGuides: {
    ...StyleSheet.absoluteFillObject,
  },
  cornerMark: {
    position: 'absolute',
    width: 45,
    height: 45,
    borderColor: AppTheme.colors.accent,
    opacity: 0.8,
  },
  topLeft: {
    top: 60,
    left: 16,
    borderLeftWidth: 3,
    borderTopWidth: 3,
    borderTopLeftRadius: Radius.md,
  },
  topRight: {
    top: 60,
    right: 16,
    borderRightWidth: 3,
    borderTopWidth: 3,
    borderTopRightRadius: Radius.md,
  },
  bottomLeft: {
    bottom: BOTTOM_NAV_HEIGHT + 20,
    left: 16,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderBottomLeftRadius: Radius.md,
  },
  bottomRight: {
    bottom: BOTTOM_NAV_HEIGHT + 20,
    right: 16,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderBottomRightRadius: Radius.md,
  },
});