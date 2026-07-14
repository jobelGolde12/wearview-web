import '@/global.css';

import { Platform } from 'react-native';

export const AppTheme = {
  colors: {
    primary: '#6C63FF',
    secondary: '#8B5CF6',
    accent: '#00E5FF',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    background: '#0B1020',
    surface: '#111827',
    surfaceLight: '#1F2937',
    glass: 'rgba(255,255,255,0.08)',
    border: 'rgba(255,255,255,0.12)',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    neutral: '#E5E7EB',
  },
} as const;

export const Colors = {
  light: {
    text: AppTheme.colors.text,
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: AppTheme.colors.text,
    background: AppTheme.colors.background,
    backgroundElement: AppTheme.colors.surface,
    backgroundSelected: AppTheme.colors.surfaceLight,
    textSecondary: AppTheme.colors.textSecondary,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const AppGradients = {
  glowStart: 'rgba(108,99,255,0.55)',
  glowEnd: 'rgba(0,229,255,0.44)',
} as const;

export const Fonts = Platform.select({
  ios: {
    display: 'Avenir Next',
    body: 'Avenir',
    mono: 'Menlo',
    sans: 'Avenir',
    serif: 'Times New Roman',
    rounded: 'Avenir Next',
  },
  android: {
    display: 'sans-serif-medium',
    body: 'sans-serif',
    mono: 'monospace',
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif-medium',
  },
  default: {
    display: 'sans-serif',
    body: 'sans-serif',
    mono: 'monospace',
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif',
  },
  web: {
    display: 'Sora, Inter, sans-serif',
    body: 'Inter, system-ui, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, monospace',
    sans: 'Sora, Inter, sans-serif',
    serif: 'Georgia, serif',
    rounded: 'Inter, system-ui, sans-serif',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const Radius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  full: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
