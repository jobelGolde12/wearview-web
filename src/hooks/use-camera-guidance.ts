import { useCallback, useEffect } from 'react';
import { impactAsync, ImpactFeedbackStyle, notificationAsync, NotificationFeedbackType } from 'expo-haptics';

import { useAlignmentValidation } from '@/hooks/use-alignment-validation';
import { usePoseDetection } from '@/hooks/use-pose-detection';
import { useCameraGuideStore } from '@/store/use-camera-guide-store';

export function useCameraGuidance() {
  const { pose, isDetecting, confidence, startDetection, stopDetection } = usePoseDetection();
  const { validate } = useAlignmentValidation();
  const isGuidedMode = useCameraGuideStore((state) => state.isGuidedMode);
  const isFitDetected = useCameraGuideStore((state) => state.isFitDetected);
  const currentFeedback = useCameraGuideStore((state) => state.currentFeedback);
  const fitConfidence = useCameraGuideStore((state) => state.fitConfidence);
  const updateValidation = useCameraGuideStore((state) => state.updateValidation);
  const resetGuideState = useCameraGuideStore((state) => state.resetGuideState);

  useEffect(() => {
    if (isGuidedMode) {
      startDetection();
    } else {
      stopDetection();
    }
    return () => stopDetection();
  }, [isGuidedMode, startDetection, stopDetection]);

  useEffect(() => {
    if (!pose || !isDetecting) return;

    const result = validate(pose, confidence);
    if (result) {
      const wasAligned = isFitDetected;
      updateValidation(result);

      if (!wasAligned && result.isAligned) {
        impactAsync(ImpactFeedbackStyle.Medium);
      }
    }
  }, [pose, confidence, isDetecting, validate, updateValidation, isFitDetected]);

  const triggerCaptureHaptic = useCallback(() => {
    notificationAsync(NotificationFeedbackType.Success);
  }, []);

  const toggleGuidedMode = useCallback(() => {
    if (isGuidedMode) {
      resetGuideState();
    }
  }, [isGuidedMode, resetGuideState]);

  return {
    isGuidedMode,
    isFitDetected,
    fitConfidence,
    currentFeedback,
    pose,
    isDetecting,
    detectionConfidence: confidence,
    canCapture: isFitDetected,
    triggerCaptureHaptic,
    toggleGuidedMode,
    resetGuideState,
  };
}
