'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

import type { BodyAlignmentResult } from '@/types/wearview-web';

const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task';

// Pose landmark indices
const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;
const LEFT_HIP = 23;
const RIGHT_HIP = 24;
const NOSE = 0;
const LEFT_EAR = 7;
const RIGHT_EAR = 8;

function landmarkDistance(a: any, b: any): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function useBodyAlignment(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  enabled: boolean,
): BodyAlignmentResult {
  const [result, setResult] = useState<BodyAlignmentResult>({
    isAligned: false,
    confidence: 0,
    landmarks: null,
  });

  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const smoothedConfidence = useRef(0);
  const frameCount = useRef(0);
  const animFrameRef = useRef<number>(0);
  const lastTimestamp = useRef(-1);

  const initModel = useCallback(async () => {
    if (landmarkerRef.current) return;
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
      );
      landmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
    } catch {
      landmarkerRef.current = null;
    }
  }, []);

  const detect = useCallback(() => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !landmarker || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    frameCount.current++;
    if (frameCount.current % 4 !== 0) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    const now = performance.now();
    if (now === lastTimestamp.current) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }
    lastTimestamp.current = now;

    let poseLandmarks: any = null;
    try {
      const results = landmarker.detectForVideo(video, now);
      poseLandmarks = results.landmarks?.[0] ?? null;
    } catch {
      poseLandmarks = null;
    }

    if (!poseLandmarks || poseLandmarks.length === 0) {
      smoothedConfidence.current *= 0.8;
      const confidence = Math.round(smoothedConfidence.current * 100) / 100;
      setResult({ isAligned: false, confidence, landmarks: null });
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    const lShoulder = poseLandmarks[LEFT_SHOULDER];
    const rShoulder = poseLandmarks[RIGHT_SHOULDER];
    const lHip = poseLandmarks[LEFT_HIP];
    const rHip = poseLandmarks[RIGHT_HIP];
    const nose = poseLandmarks[NOSE];
    const lEar = poseLandmarks[LEFT_EAR];
    const rEar = poseLandmarks[RIGHT_EAR];

    // Shoulder alignment — shoulders should be roughly level
    const shoulderDy = Math.abs(lShoulder.y - rShoulder.y);
    const shoulderWidth = landmarkDistance(lShoulder, rShoulder);
    const shoulderLevelScore = Math.max(0, 1 - shoulderDy / (shoulderWidth * 0.15));

    // Hip alignment
    const hipDy = Math.abs(lHip.y - rHip.y);
    const hipWidth = landmarkDistance(lHip, rHip);
    const hipLevelScore = Math.max(0, 1 - hipDy / (hipWidth * 0.15));

    // Body centering — nose should be roughly centered horizontally
    const bodyCenterX = (lShoulder.x + rShoulder.x) / 2;
    const noseOffset = Math.abs(nose.x - bodyCenterX);
    const centerScore = Math.max(0, 1 - noseOffset / 0.15);

    // Body visibility — shoulders and hips should be in frame
    const shouldersVisible = lShoulder.y > 0 && rShoulder.y > 0 && lShoulder.y < 1 && rShoulder.y < 1;
    const hipsVisible = lHip.y > 0 && rHip.y > 0 && lHip.y < 1 && rHip.y < 1;
    const visibilityScore = (shouldersVisible ? 0.5 : 0) + (hipsVisible ? 0.5 : 0);

    // Torso proportion — shoulder-to-hip distance should be reasonable
    const torsoHeight = landmarkDistance(lShoulder, lHip);
    const torsoScore = torsoHeight > 0.1 && torsoHeight < 0.6 ? 1 : 0.3;

    // Body rotation — shoulders and hips should be roughly parallel to camera
    const shoulderAngle = Math.abs(Math.atan2(rShoulder.y - lShoulder.y, rShoulder.x - lShoulder.x));
    const rotationScore = shoulderAngle < 0.3 ? 1 - shoulderAngle / 0.3 : 0;

    // Weighted confidence
    const rawConfidence =
      shoulderLevelScore * 0.2 +
      hipLevelScore * 0.15 +
      centerScore * 0.25 +
      visibilityScore * 0.15 +
      torsoScore * 0.1 +
      rotationScore * 0.15;

    const alpha = 0.3;
    smoothedConfidence.current = smoothedConfidence.current * (1 - alpha) + rawConfidence * alpha;
    const confidence = Math.round(smoothedConfidence.current * 100) / 100;

    const isAligned = confidence > 0.55;

    setResult({ isAligned, confidence, landmarks: poseLandmarks });
    animFrameRef.current = requestAnimationFrame(detect);
  }, [videoRef]);

  useEffect(() => {
    initModel();
  }, [initModel]);

  useEffect(() => {
    if (enabled && landmarkerRef.current) {
      animFrameRef.current = requestAnimationFrame(detect);
    }
    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [enabled, detect]);

  return result;
}
