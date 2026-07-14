import { CameraView, type CameraType, useCameraPermissions } from 'expo-camera';
import { SwitchCamera } from 'lucide-react-native';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlignmentFeedbackPanel } from '@/components/camera/alignment-feedback';
import { CameraAlignmentOverlay } from '@/components/camera/camera-alignment-overlay';
import { PhotoAdjustmentOverlay } from '@/components/camera/photo-adjustment-overlay';
import { PhotoUploadButton } from '@/components/camera/photo-upload-button';
import { SmartCaptureButton } from '@/components/camera/smart-capture-button';
import { CameraPermissionPrompt } from '@/components/wearview/camera-permission-prompt';
import { ScreenBackground } from '@/components/wearview/screen-background';
import { AppTheme, Radius, Spacing } from '@/constants/theme';
import { runMockFittingPipeline } from '@/features/ai-models/mock-fitting-pipeline';
import { persistCapturedFrame } from '@/services/offline-storage/capture-storage';
import { useCameraGuidance } from '@/hooks/use-camera-guidance';
import { usePhotoAdjustment } from '@/hooks/use-photo-adjustment';
import { useCameraStore } from '@/store/use-camera-store';
import { useFittingStore } from '@/store/use-fitting-store';

export default function CameraScreen() {
  const cameraRef = useRef<CameraView | null>(null);
  const [facing, setFacing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const [isSaving, setIsSaving] = useState(false);
  const setLatestCapture = useCameraStore((state) => state.setLatestCapture);
  const setPipelineMetrics = useCameraStore((state) => state.setPipelineMetrics);
  const addSession = useFittingStore((state) => state.addSession);

  const {
    isFitDetected,
    fitConfidence,
    currentFeedback,
    canCapture,
    triggerCaptureHaptic,
  } = useCameraGuidance();

  const {
    photoUri,
    translationX,
    translationY,
    scale,
    rotation,
    composedGesture,
    pickImage,
    confirmAndSave,
    cancelAdjustment,
    resetPhoto,
  } = usePhotoAdjustment();

  const capturePreview = useCallback(async () => {
    if (!cameraRef.current || isSaving || !canCapture) {
      return;
    }

    try {
      setIsSaving(true);
      triggerCaptureHaptic();

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
      });

      if (!photo?.uri) {
        throw new Error('No capture URI returned.');
      }

      const pipeline = runMockFittingPipeline({
        imageUri: photo.uri,
        preferredCamera: facing,
      });

      const record = await persistCapturedFrame({
        imageUri: photo.uri,
        pipeline,
      });

      setLatestCapture(record.imageUri);
      setPipelineMetrics(pipeline.metrics);
      addSession(record);
      Alert.alert('Session saved', 'The fitting preview was stored locally on this device.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown capture error';
      Alert.alert('Capture failed', message);
    } finally {
      setIsSaving(false);
    }
  }, [canCapture, isSaving, triggerCaptureHaptic, facing, setLatestCapture, setPipelineMetrics, addSession]);

  const handleConfirmPhoto = useCallback(() => {
    if (!photoUri) return;
    confirmAndSave();
  }, [photoUri, confirmAndSave]);

  if (!permission) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.centered}>
          <ActivityIndicator color={AppTheme.colors.accent} />
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  if (!permission.granted) {
    return <CameraPermissionPrompt onRequestPermission={requestPermission} />;
  }

  if (photoUri) {
    return (
      <PhotoAdjustmentOverlay
        photoUri={photoUri}
        translationX={translationX}
        translationY={translationY}
        scale={scale}
        rotation={rotation}
        gesture={composedGesture}
        fitConfidence={fitConfidence}
        isFitDetected={isFitDetected}
        onConfirm={handleConfirmPhoto}
        onReset={resetPhoto}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />

      <CameraAlignmentOverlay
        isFitDetected={isFitDetected}
        fitConfidence={fitConfidence}
      />

      <AlignmentFeedbackPanel
        feedback={currentFeedback}
        isFitDetected={isFitDetected}
      />

      <View style={styles.controls}>
        <Pressable
          accessibilityLabel="Switch camera"
          onPress={() => setFacing((current) => (current === 'front' ? 'back' : 'front'))}
          style={({ pressed }) => [styles.controlButton, pressed && styles.buttonPressed]}>
          <SwitchCamera color={AppTheme.colors.text} size={22} strokeWidth={2.2} />
        </Pressable>
      </View>

      <SmartCaptureButton
        isEnabled={canCapture}
        fitConfidence={fitConfidence}
        onPress={capturePreview}
      />

      <PhotoUploadButton
        onPickImage={pickImage}
        onCancel={cancelAdjustment}
        isUploading={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    position: 'absolute',
    top: '50%',
    right: Spacing.lg,
    transform: [{ translateY: -29 }],
    flexDirection: 'column',
    alignItems: 'center',
    gap: Spacing.md,
  },
  controlButton: {
    width: 58,
    height: 58,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
});
