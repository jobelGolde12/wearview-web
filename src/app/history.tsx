import { Image } from 'expo-image';
import { Clock3, Database, Sparkles } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FrostCard } from '@/components/wearview/frost-card';
import { ScreenBackground } from '@/components/wearview/screen-background';
import { WearViewText } from '@/components/wearview/wearview-text';
import { AppTheme, Radius, Spacing } from '@/constants/theme';
import { useFittingStore } from '@/store/use-fitting-store';

export default function HistoryScreen() {
  const sessions = useFittingStore((state) => state.sessions);

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <WearViewText variant="eyebrow" color={AppTheme.colors.secondary}>
              Local wardrobe memory
            </WearViewText>
            <WearViewText variant="sectionTitle">Saved fitting sessions</WearViewText>
            <WearViewText variant="bodySm" color={AppTheme.colors.textSecondary}>
              Each preview is kept on-device and indexed for comparison, future recommendations,
              and offline history access.
            </WearViewText>
          </View>

          {sessions.length === 0 ? (
            <FrostCard style={styles.emptyCard}>
              <Database color={AppTheme.colors.accent} size={24} strokeWidth={2.2} />
              <WearViewText variant="cardTitle">No sessions yet</WearViewText>
              <WearViewText variant="bodySm" color={AppTheme.colors.textSecondary}>
                Capture a look from the camera tab to store the first fitting result locally.
              </WearViewText>
            </FrostCard>
          ) : (
            sessions.map((session) => (
              <FrostCard key={session.id} style={styles.sessionCard}>
                <View style={styles.preview}>
                  <Image source={{ uri: session.imageUri }} style={styles.previewImage} contentFit="cover" />
                </View>
                <View style={styles.sessionBody}>
                  <View style={styles.sessionHeader}>
                    <WearViewText variant="cardTitle">{session.detectedGarment.label}</WearViewText>
                    <WearViewText variant="label">{session.detectedGarment.confidence}% match</WearViewText>
                  </View>
                  <WearViewText variant="bodySm" color={AppTheme.colors.textSecondary}>
                    {session.recommendation.summary}
                  </WearViewText>
                  <View style={styles.metaRow}>
                    <Clock3 color={AppTheme.colors.textSecondary} size={14} strokeWidth={2.1} />
                    <WearViewText variant="mono">{session.capturedAt}</WearViewText>
                  </View>
                  <View style={styles.tagRow}>
                    <View style={styles.tag}>
                      <Sparkles color={AppTheme.colors.accent} size={12} strokeWidth={2.2} />
                      <WearViewText variant="mono">fps {session.pipeline.metrics.estimatedFps}</WearViewText>
                    </View>
                    <View style={styles.tag}>
                      <WearViewText variant="mono">{session.pipeline.segmentationModel}</WearViewText>
                    </View>
                  </View>
                </View>
              </FrostCard>
            ))
          )}
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  header: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  emptyCard: {
    padding: Spacing.xl,
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  sessionCard: {
    overflow: 'hidden',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  preview: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  previewImage: {
    width: '100%',
    aspectRatio: 1.2,
  },
  sessionBody: {
    gap: Spacing.sm,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
});
