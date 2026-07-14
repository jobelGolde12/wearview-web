import * as FileSystem from 'expo-file-system/legacy';

import { saveSession } from '@/database/wearview-db';
import type { FittingPipelineSnapshot, SavedFittingSession } from '@/types/wearview';

type PersistCaptureInput = {
  imageUri: string;
  pipeline: FittingPipelineSnapshot;
};

export async function persistCapturedFrame({
  imageUri,
  pipeline,
}: PersistCaptureInput): Promise<SavedFittingSession> {
  const capturedAt = new Date().toISOString();
  const session: SavedFittingSession = {
    id: `${capturedAt}-${Math.random().toString(36).slice(2, 8)}`,
    capturedAt,
    imageUri,
    pipeline,
    detectedGarment: {
      label: 'Store shirt candidate',
      confidence: pipeline.output.overlayConfidence,
    },
    recommendation: {
      summary: `Recommended fit ${pipeline.output.sizeRecommendation}`,
    },
  };

  const directory = `${FileSystem.cacheDirectory}wearview`;
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  await saveSession(session);
  return session;
}
