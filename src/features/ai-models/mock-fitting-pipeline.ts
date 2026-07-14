import type { CameraType } from 'expo-camera';

import type { FittingPipelineSnapshot } from '@/types/wearview';

type RunPipelineInput = {
  imageUri: string;
  preferredCamera: CameraType;
};

export function runMockFittingPipeline({
  imageUri,
  preferredCamera,
}: RunPipelineInput): FittingPipelineSnapshot {
  const baseConfidence = preferredCamera === 'front' ? 91 : 87;

  return {
    imageUri,
    segmentationModel: 'MediaPipe Selfie Segmentation',
    poseModel: 'MoveNet Lightning',
    shirtModel: 'YOLOv8 Nano ONNX',
    metrics: {
      estimatedFps: preferredCamera === 'front' ? 34 : 31,
      frameStride: 2,
      latencyMs: preferredCamera === 'front' ? 42 : 48,
    },
    output: {
      transparencyMask: 'mannequin-safe',
      overlayConfidence: baseConfidence,
      sizeRecommendation: preferredCamera === 'front' ? 'M / slim fit' : 'M / regular fit',
    },
  };
}
