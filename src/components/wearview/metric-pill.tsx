import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppTheme, Radius, Spacing } from '@/constants/theme';
import { WearViewText } from './wearview-text';

type MetricPillProps = {
  label: string;
  value: string;
};

export function MetricPill({ label, value }: MetricPillProps) {
  return (
    <View style={styles.pill}>
      <WearViewText variant="mono" color={AppTheme.colors.accent}>
        {label}
      </WearViewText>
      <WearViewText variant="mono">{value}</WearViewText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
});
