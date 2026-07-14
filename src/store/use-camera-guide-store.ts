import { create } from 'zustand';

import type {
  AlignmentFeedback,
  CameraGuideState,
  FitValidationResult,
  BodyPose,
} from '@/types/camera-guide';

const defaultFeedback: AlignmentFeedback = {
  direction: 'none',
  message: 'Position yourself in the guide',
  zone: null,
};

export const useCameraGuideStore = create<CameraGuideState>((set) => ({
  isGuidedMode: true,
  isFitDetected: false,
  fitConfidence: 0,
  currentFeedback: defaultFeedback,
  validationResult: null,
  poseState: {
    pose: null,
    isDetecting: false,
    lastDetectionTime: 0,
    confidence: 0,
  },
  setGuidedMode: (enabled) => set({ isGuidedMode: enabled }),
  updatePose: (pose: BodyPose | null, confidence: number) =>
    set((state) => ({
      poseState: {
        pose,
        isDetecting: pose !== null,
        lastDetectionTime: Date.now(),
        confidence,
      },
      isFitDetected: state.validationResult?.isAligned ?? false,
    })),
  updateValidation: (result: FitValidationResult) =>
    set({
      validationResult: result,
      isFitDetected: result.isAligned,
      fitConfidence: result.confidence,
      currentFeedback: result.feedback,
    }),
  resetGuideState: () =>
    set({
      isFitDetected: false,
      fitConfidence: 0,
      currentFeedback: defaultFeedback,
      validationResult: null,
      poseState: {
        pose: null,
        isDetecting: false,
        lastDetectionTime: 0,
        confidence: 0,
      },
    }),
}));
