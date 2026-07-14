import { Camera } from 'lucide-react-native';
import React, { useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FrostCard } from '@/components/wearview/frost-card';
import { ScreenBackground } from '@/components/wearview/screen-background';
import { WearViewText } from '@/components/wearview/wearview-text';
import { AppTheme, Radius, Spacing } from '@/constants/theme';

interface CameraPermissionPromptProps {
  onRequestPermission: () => void;
}

export function CameraPermissionPrompt({ onRequestPermission }: CameraPermissionPromptProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const cameraRotateAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(cameraRotateAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(cameraRotateAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, [fadeAnim, scaleAnim, cameraRotateAnim]);

  const handlePressIn = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 0.97,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const cameraSpin = cameraRotateAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ['0deg', '-5deg', '0deg', '5deg', '0deg'],
  });

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.permissionLayout}>
        <Animated.View
          style={[
            styles.animatedContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <FrostCard style={styles.permissionCard}>
            <Animated.View style={{ transform: [{ rotate: cameraSpin }] }}>
              <Camera color={AppTheme.colors.accent} size={32} strokeWidth={2.2} />
            </Animated.View>

            <Animated.View style={styles.textContainer}>
              <WearViewText variant="sectionTitle">Camera permission required</WearViewText>
              <WearViewText variant="bodySm" color={AppTheme.colors.textSecondary}>
                WearView opens directly into the live fitting flow, so camera access is required to
                render previews and local captures.
              </WearViewText>
            </Animated.View>

            <Pressable
              onPress={onRequestPermission}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Animated.View
                style={[
                  styles.buttonContent,
                  {
                    transform: [{ scale: buttonScaleAnim }],
                  },
                ]}
              >
                <WearViewText variant="button">Grant camera access</WearViewText>
              </Animated.View>
            </Pressable>
          </FrostCard>
        </Animated.View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  permissionLayout: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  animatedContainer: {
    width: '100%',
  },
  permissionCard: {
    gap: Spacing.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  textContainer: {
    gap: Spacing.sm,
    alignItems: 'center',
    textAlign: 'center',
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: Radius.full,
    backgroundColor: AppTheme.colors.primary,
    marginTop: Spacing.sm,
    overflow: 'hidden',
    width: '100%',
  },
  buttonContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.88,
  },
});