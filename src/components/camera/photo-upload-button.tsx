import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ImagePlus, X } from 'lucide-react-native';

import { WearViewText } from '@/components/wearview/wearview-text';
import { AppTheme, Radius, Spacing } from '@/constants/theme';

type PhotoUploadButtonProps = {
  onPickImage: () => void;
  onCancel: () => void;
  isUploading: boolean;
};

export function PhotoUploadButton({ onPickImage, onCancel, isUploading }: PhotoUploadButtonProps) {
  if (isUploading) {
    return (
      <View style={styles.container}>
        <Pressable
          onPress={onCancel}
          style={({ pressed }) => [styles.cancelButton, pressed && styles.buttonPressed]}
          accessibilityLabel="Cancel photo upload"
        >
          <X color={AppTheme.colors.text} size={20} strokeWidth={2.2} />
          <WearViewText variant="button" style={styles.cancelText}>Cancel</WearViewText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onPickImage}
        style={({ pressed }) => [styles.uploadButton, pressed && styles.buttonPressed]}
        accessibilityLabel="Upload photo from device"
      >
        <ImagePlus color={AppTheme.colors.text} size={22} strokeWidth={2.2} />
        <WearViewText variant="button" style={styles.uploadText}>Upload Photo</WearViewText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Spacing.xxl + 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: AppTheme.colors.glass,
    borderWidth: 1.5,
    borderColor: AppTheme.colors.accent,
    shadowColor: AppTheme.colors.accent,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
  },
  uploadText: {
    fontSize: 14,
    letterSpacing: 0.5,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1.5,
    borderColor: AppTheme.colors.danger,
  },
  cancelText: {
    fontSize: 14,
    color: AppTheme.colors.danger,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
});
