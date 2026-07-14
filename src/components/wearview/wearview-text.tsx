import React, { type PropsWithChildren } from 'react';
import { StyleSheet, Text, type StyleProp, type TextProps, type TextStyle } from 'react-native';

import { AppTheme, Fonts } from '@/constants/theme';

type TextVariant =
  | 'hero'
  | 'sectionTitle'
  | 'cardTitle'
  | 'body'
  | 'bodySm'
  | 'button'
  | 'label'
  | 'eyebrow'
  | 'mono'
  | 'metricValue';

type WearViewTextProps = PropsWithChildren<
  TextProps & {
    color?: string;
    style?: StyleProp<TextStyle>;
    variant?: TextVariant;
  }
>;

export function WearViewText({
  children,
  color = AppTheme.colors.text,
  style,
  variant = 'body',
  ...props
}: WearViewTextProps) {
  return (
    <Text {...props} style={[styles.base, variantStyles[variant], { color }, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: AppTheme.colors.text,
    fontFamily: Fonts.body,
  },
});

const variantStyles = StyleSheet.create({
  hero: {
    fontFamily: Fonts.display,
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '700',
    letterSpacing: -1.2,
  },
  sectionTitle: {
    fontFamily: Fonts.display,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  cardTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    lineHeight: 25,
    fontWeight: '400',
  },
  bodySm: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
  },
  button: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.6,
  },
  mono: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  metricValue: {
    fontFamily: Fonts.display,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '700',
  },
});
