import { router } from 'expo-router';
import { Camera, Clock3, MoveRight, Shield, Sparkles, Zap } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FrostCard } from '@/components/wearview/frost-card';
import { MetricPill } from '@/components/wearview/metric-pill';
import { ScreenBackground } from '@/components/wearview/screen-background';
import { WearViewText } from '@/components/wearview/wearview-text';
import { AppGradients, AppTheme, Radius, Spacing } from '@/constants/theme';
import { useAppBootstrap } from '@/hooks/use-app-bootstrap';
import { useCameraStore } from '@/store/use-camera-store';
import { useFittingStore } from '@/store/use-fitting-store';
import { useSettingsStore } from '@/store/use-settings-store';

const valueProps = [
  {
    icon: Sparkles,
    title: 'Transparent fitting preview',
    description: 'Torso masking and garment overlay are prepared for an offline on-device pipeline.',
  },
  {
    icon: Shield,
    title: 'Private by default',
    description: 'Body imagery stays on device and capture metadata is stored locally in SQLite only.',
  },
  {
    icon: Zap,
    title: 'Performance-first shell',
    description: 'Frame-skipping, model adapters, and rendering layers are scaffolded for 30-60 FPS work.',
  },
] as const;

export default function HomeScreen() {
  useAppBootstrap();
  const sessions = useFittingStore((state) => state.sessions);
  const latestMetrics = useCameraStore((state) => state.pipelineMetrics);
  const mirrorMode = useSettingsStore((state) => state.mirrorMode);

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <MetricPill label="Offline AI" value="Ready" />
            <WearViewText variant="eyebrow" color={AppTheme.colors.accent}>
              See yourself before you wear it
            </WearViewText>
            <WearViewText variant="hero">WearView</WearViewText>
            <WearViewText variant="body" color={AppTheme.colors.textSecondary} style={styles.heroCopy}>
              A React Native camera experience for transparent-shirt virtual fitting, designed for
              offline segmentation, pose tracking, garment extraction, and AR overlay rendering.
            </WearViewText>
          </View>

          <FrostCard style={styles.primaryCard}>
            <View style={styles.primaryRow}>
              <View style={styles.primaryCopy}>
                <WearViewText variant="sectionTitle">Start a live fitting</WearViewText>
                <WearViewText variant="bodySm" color={AppTheme.colors.textSecondary}>
                  Camera permissions, local capture state, and fitting-session persistence are wired
                  now. AI inference modules are scaffolded behind service boundaries for the next
                  iteration.
                </WearViewText>
              </View>

              <Pressable onPress={() => router.push('/camera')} style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}>
                <Camera color={AppTheme.colors.text} size={20} strokeWidth={2.2} />
                <WearViewText variant="button">Open camera</WearViewText>
                <MoveRight color={AppTheme.colors.text} size={18} strokeWidth={2.2} />
              </Pressable>
            </View>
          </FrostCard>

          <View style={styles.metricsGrid}>
            <FrostCard style={styles.metricCard}>
              <WearViewText variant="metricValue">{sessions.length}</WearViewText>
              <WearViewText variant="label">Saved fitting sessions</WearViewText>
            </FrostCard>
            <FrostCard style={styles.metricCard}>
              <WearViewText variant="metricValue">{latestMetrics.estimatedFps}</WearViewText>
              <WearViewText variant="label">Target preview FPS</WearViewText>
            </FrostCard>
            <FrostCard style={styles.metricCard}>
              <WearViewText variant="metricValue">{mirrorMode ? 'Front' : 'Back'}</WearViewText>
              <WearViewText variant="label">Preferred camera</WearViewText>
            </FrostCard>
          </View>

          <View style={styles.sectionHeader}>
            <WearViewText variant="sectionTitle">System value</WearViewText>
            <WearViewText variant="bodySm" color={AppTheme.colors.textSecondary}>
              Product and engineering priorities from the brief translated into the app shell.
            </WearViewText>
          </View>

          {valueProps.map(({ icon: Icon, title, description }) => (
            <FrostCard key={title} style={styles.valueCard}>
              <View style={styles.valueIconWrap}>
                <Icon color={AppTheme.colors.accent} size={18} strokeWidth={2.2} />
              </View>
              <View style={styles.valueCopy}>
                <WearViewText variant="cardTitle">{title}</WearViewText>
                <WearViewText variant="bodySm" color={AppTheme.colors.textSecondary}>
                  {description}
                </WearViewText>
              </View>
            </FrostCard>
          ))}

          <FrostCard style={styles.timeline}>
            <View style={styles.timelineHeader}>
              <Clock3 color={AppTheme.colors.secondary} size={18} strokeWidth={2.1} />
              <WearViewText variant="sectionTitle">Pipeline</WearViewText>
            </View>
            <WearViewText variant="mono">
              camera - segmentation - pose - transparency - shirt detection - overlay
            </WearViewText>
            <View style={styles.timelineGradient}>
              <View style={[styles.gradientBar, { backgroundColor: AppGradients.glowStart }]} />
              <View style={[styles.gradientBar, { backgroundColor: AppTheme.colors.primary }]} />
              <View style={[styles.gradientBar, { backgroundColor: AppTheme.colors.accent }]} />
            </View>
          </FrostCard>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
  },
  hero: {
    gap: Spacing.md,
  },
  heroCopy: {
    maxWidth: 560,
  },
  primaryCard: {
    padding: Spacing.lg,
  },
  primaryRow: {
    gap: Spacing.lg,
  },
  primaryCopy: {
    gap: Spacing.sm,
  },
  cta: {
    minHeight: 58,
    borderRadius: Radius.full,
    backgroundColor: AppTheme.colors.primary,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  ctaPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  metricsGrid: {
    gap: Spacing.md,
  },
  metricCard: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
  },
  sectionHeader: {
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  valueCard: {
    padding: Spacing.lg,
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  valueIconWrap: {
    height: 40,
    width: 40,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  valueCopy: {
    flex: 1,
    gap: Spacing.xs,
  },
  timeline: {
    gap: Spacing.md,
    padding: Spacing.lg,
    marginTop: Spacing.sm,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  timelineGradient: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  gradientBar: {
    flex: 1,
    height: 6,
    borderRadius: Radius.full,
  },
});
