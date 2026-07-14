export type PipelineMetrics = {
  estimatedFps: number;
  frameStride: number;
  latencyMs: number;
};

export type FittingPipelineSnapshot = {
  imageUri: string;
  metrics: PipelineMetrics;
  output: {
    overlayConfidence: number;
    sizeRecommendation: string;
    transparencyMask: string;
  };
  poseModel: string;
  segmentationModel: string;
  shirtModel: string;
};

export type SavedFittingSession = {
  capturedAt: string;
  detectedGarment: {
    confidence: number;
    label: string;
  };
  id: string;
  imageUri: string;
  pipeline: FittingPipelineSnapshot;
  recommendation: {
    summary: string;
  };
};
