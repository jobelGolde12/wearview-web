import { useCallback, useEffect, useRef, useState } from 'react';

import type { BodyKeypoint, BodyPose, PoseDetectionState } from '@/types/camera-guide';
import { useCameraGuideStore } from '@/store/use-camera-guide-store';

const CONFIDENCE_THRESHOLD = 0.65;
const DETECTION_INTERVAL_MS = 100;

function generateSimulatedPose(frameWidth: number, frameHeight: number, timestamp: number): BodyPose | null {
  const cx = frameWidth / 2;

  const driftX = Math.sin(timestamp * 0.001) * 25;
  const driftY = Math.cos(timestamp * 0.0008) * 18;

  const baseConfidence = 0.78 + Math.sin(timestamp * 0.002) * 0.1;

  const makePoint = (x: number, y: number, conf = baseConfidence): BodyKeypoint => ({
    x: x + driftX * 0.25,
    y: y + driftY * 0.25,
    confidence: conf,
  });

  return {
    nose: makePoint(cx, frameHeight * 0.26),
    leftShoulder: makePoint(cx - frameWidth * 0.18, frameHeight * 0.38),
    rightShoulder: makePoint(cx + frameWidth * 0.18, frameHeight * 0.38),
    leftHip: makePoint(cx - frameWidth * 0.14, frameHeight * 0.60),
    rightHip: makePoint(cx + frameWidth * 0.14, frameHeight * 0.60),
    leftElbow: makePoint(cx - frameWidth * 0.28, frameHeight * 0.38),
    rightElbow: makePoint(cx + frameWidth * 0.28, frameHeight * 0.38),
    leftWrist: makePoint(cx - frameWidth * 0.24, frameHeight * 0.48),
    rightWrist: makePoint(cx + frameWidth * 0.24, frameHeight * 0.48),
  };
}

export function usePoseDetection() {
  const updatePose = useCameraGuideStore((state) => state.updatePose);
  const [state, setState] = useState<PoseDetectionState>({
    pose: null,
    isDetecting: false,
    lastDetectionTime: 0,
    confidence: 0,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isActiveRef = useRef(false);

  const startDetection = useCallback(() => {
    if (isActiveRef.current) return;
    isActiveRef.current = true;

    intervalRef.current = setInterval(() => {
      const pose = generateSimulatedPose(1080, 1920, Date.now());
      const avgConfidence = pose
        ? Object.values(pose).reduce((sum, kp) => sum + kp.confidence, 0) / Object.keys(pose).length
        : 0;

      const newState: PoseDetectionState = {
        pose,
        isDetecting: true,
        lastDetectionTime: Date.now(),
        confidence: avgConfidence,
      };

      setState(newState);
      updatePose(pose, avgConfidence);
    }, DETECTION_INTERVAL_MS);
  }, [updatePose]);

  const stopDetection = useCallback(() => {
    isActiveRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState({
      pose: null,
      isDetecting: false,
      lastDetectionTime: 0,
      confidence: 0,
    });
    updatePose(null, 0);
  }, [updatePose]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    startDetection,
    stopDetection,
    isReady: state.confidence >= CONFIDENCE_THRESHOLD,
  };
}
