import { MoonStar, ShieldCheck, Sparkle, Smartphone, ToggleLeft } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FrostCard } from '@/components/wearview/frost-card';
import { ScreenBackground } from '@/components/wearview/screen-background';
import { WearViewText } from '@/components/wearview/wearview-text';
import { AppTheme, Radius, Spacing } from '@/constants/theme';
import { useSettingsStore } from '@/store/use-settings-store';

export default function SettingsScreen() {
  const {
    mirrorMode,
    diagnosticsOverlay,
    privacyMaskEnabled,
    frameStride,
    toggleMirrorMode,
    toggleDiagnosticsOverlay,
    togglePrivacyMaskEnabled,
    cycleFrameStride,
  } = useSettingsStore();

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <WearViewText variant="eyebrow" color={AppTheme.colors.accent}>
              Device-only configuration
            </WearViewText>
            <WearViewText variant="sectionTitle">WearView settings</WearViewText>
          </View>

          <SettingToggle
            icon={Smartphone}
            title="Mirror mode"
            description="Default the fitting flow to front-camera preview for smart-mirror usage."
            value={mirrorMode}
            onValueChange={toggleMirrorMode}
          />
          <SettingToggle
            icon={Sparkle}
            title="Diagnostics overlay"
            description="Display inference labels and frame metrics over the live preview."
            value={diagnosticsOverlay}
            onValueChange={toggleDiagnosticsOverlay}
          />
          <SettingToggle
            icon={ShieldCheck}
            title="Privacy mannequin mask"
            description="Keep the transparent torso output abstracted and non-anatomical."
            value={privacyMaskEnabled}
            onValueChange={togglePrivacyMaskEnabled}
          />

          <FrostCard style={styles.actionCard}>
            <View style={styles.actionHeader}>
              <ToggleLeft color={AppTheme.colors.secondary} size={18} strokeWidth={2.1} />
              <WearViewText variant="cardTitle">Frame stride</WearViewText>
            </View>
            <WearViewText variant="bodySm" color={AppTheme.colors.textSecondary}>
              Control how aggressively the future AI pipeline skips frames to stay within the FPS
              target on lower-end devices.
            </WearViewText>
            <Pressable onPress={cycleFrameStride} style={({ pressed }) => [styles.actionButton, pressed && styles.buttonPressed]}>
              <WearViewText variant="button">Current: every {frameStride} frame</WearViewText>
            </Pressable>
          </FrostCard>

          <FrostCard style={styles.noteCard}>
            <MoonStar color={AppTheme.colors.warning} size={18} strokeWidth={2.1} />
            <WearViewText variant="bodySm" color={AppTheme.colors.textSecondary}>
              The current build focuses on the offline experience shell. The AI modules are
              scaffolded with mock outputs, so these settings already shape the local state layer
              even before native model integration.
            </WearViewText>
          </FrostCard>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

type SettingToggleProps = {
  description: string;
  icon: typeof Smartphone;
  onValueChange: () => void;
  title: string;
  value: boolean;
};

function SettingToggle({ description, icon: Icon, onValueChange, title, value }: SettingToggleProps) {
  return (
    <FrostCard style={styles.settingCard}>
      <View style={styles.settingHeader}>
        <View style={styles.settingTitle}>
          <Icon color={AppTheme.colors.accent} size={18} strokeWidth={2.1} />
          <WearViewText variant="cardTitle">{title}</WearViewText>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          thumbColor={value ? AppTheme.colors.text : '#CBD5E1'}
          trackColor={{ false: '#475569', true: AppTheme.colors.primary }}
        />
      </View>
      <WearViewText variant="bodySm" color={AppTheme.colors.textSecondary}>
        {description}
      </WearViewText>
    </FrostCard>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  header: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  settingCard: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
    alignItems: 'center',
  },
  settingTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  actionCard: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionButton: {
    minHeight: 52,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppTheme.colors.primary,
  },
  noteCard: {
    padding: Spacing.lg,
    gap: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
});
