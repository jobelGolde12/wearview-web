import React, { type PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppTheme, Radius } from '@/constants/theme';

export function ScreenBackground({ children }: PropsWithChildren) {
  return (
    <View style={styles.root}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  glowTop: {
    position: 'absolute',
    top: -120,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(108,99,255,0.22)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: 80,
    left: -80,
    width: 220,
    height: 220,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0,229,255,0.14)',
  },
});
