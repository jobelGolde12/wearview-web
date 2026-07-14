import { create } from 'zustand';

type PipelineMetrics = {
  estimatedFps: number;
  frameStride: number;
  latencyMs: number;
};

type CameraStoreState = {
  latestCapture: string | null;
  pipelineMetrics: PipelineMetrics;
  setLatestCapture: (uri: string | null) => void;
  setPipelineMetrics: (metrics: PipelineMetrics) => void;
};

export const useCameraStore = create<CameraStoreState>((set) => ({
  latestCapture: null,
  pipelineMetrics: {
    estimatedFps: 32,
    frameStride: 2,
    latencyMs: 44,
  },
  setLatestCapture: (uri) => set({ latestCapture: uri }),
  setPipelineMetrics: (metrics) => set({ pipelineMetrics: metrics }),
}));
