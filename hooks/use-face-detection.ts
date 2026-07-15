'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

import type { FaceDetectionResult } from '@/types/wearview-web';

const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task';

const FACE_CENTER_X = 0.5;
const FACE_CENTER_Y = 0.38;
const MIN_FACE_SIZE = 0.08;
const MAX_FACE_SIZE = 0.5;
const MAX_YAW = 0.35;
const MAX_PITCH = 0.35;
const MAX_ROLL = 0.3;

export function useFaceDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  enabled: boolean,
): FaceDetectionResult {
  const [result, setResult] = useState<FaceDetectionResult>({
    isFit: false,
    confidence: 0,
    landmarks: null,
    faceBounds: null,
  });

  const landmarkerRef = useRef<FaceLandmarker | null>(null);
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
      landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numFaces: 1,
        minFaceDetectionConfidence: 0.5,
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
    if (frameCount.current % 3 !== 0) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    const now = performance.now();
    if (now === lastTimestamp.current) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }
    lastTimestamp.current = now;

    let faceLandmarks: any = null;
    try {
      const results = landmarker.detectForVideo(video, now);
      faceLandmarks = results.faceLandmarks?.[0] ?? null;
    } catch {
      faceLandmarks = null;
    }

    if (!faceLandmarks || faceLandmarks.length === 0) {
      smoothedConfidence.current *= 0.8;
      const confidence = Math.round(smoothedConfidence.current * 100) / 100;
      setResult({ isFit: false, confidence, landmarks: null, faceBounds: null });
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    // Compute face bounds from key landmarks
    const xs = faceLandmarks.map((l: any) => l.x);
    const ys = faceLandmarks.map((l: any) => l.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const faceW = maxX - minX;
    const faceH = maxY - minY;
    const faceCenterX = (minX + maxX) / 2;
    const faceCenterY = (minY + maxY) / 2;

    // Compute head rotation from landmarks
    const nose = faceLandmarks[1]; // nose tip
    const leftEye = faceLandmarks[33];
    const rightEye = faceLandmarks[263];
    const chin = faceLandmarks[152];
    const forehead = faceLandmarks[10];

    // Yaw: horizontal rotation (nose vs eye midpoint)
    const eyeMidX = (leftEye.x + rightEye.x) / 2;
    const yaw = Math.abs(nose.x - eyeMidX);

    // Pitch: vertical rotation (nose vs chin/forehead)
    const noseY = nose.y;
    const eyeMidY = (leftEye.y + rightEye.y) / 2;
    const pitch = Math.abs(noseY - eyeMidY) - 0.02; // baseline offset

    // Roll: head tilt (eye line angle)
    const roll = Math.abs(Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x));

    // Centering score
    const dx = Math.abs(faceCenterX - FACE_CENTER_X);
    const dy = Math.abs(faceCenterY - FACE_CENTER_Y);
    const centerScore = Math.max(0, 1 - (dx * 2 + dy * 2));

    // Size score
    const sizeScore =
      faceW >= MIN_FACE_SIZE && faceW <= MAX_FACE_SIZE
        ? 1 - Math.abs(faceW - 0.25) / 0.2
        : 0;

    // Rotation score
    const yawScore = yaw <= MAX_YAW ? 1 - yaw / MAX_YAW : 0;
    const pitchScore = pitch <= MAX_PITCH ? 1 - pitch / MAX_PITCH : 0;
    const rollScore = roll <= MAX_ROLL ? 1 - roll / MAX_ROLL : 0;
    const rotationScore = (yawScore + pitchScore + rollScore) / 3;

    // Weighted confidence
    const rawConfidence = centerScore * 0.35 + sizeScore * 0.35 + rotationScore * 0.3;

    const alpha = 0.3;
    smoothedConfidence.current = smoothedConfidence.current * (1 - alpha) + rawConfidence * alpha;
    const confidence = Math.round(smoothedConfidence.current * 100) / 100;

    const isFit = confidence > 0.6;

    setResult({
      isFit,
      confidence,
      landmarks: faceLandmarks,
      faceBounds: { x: minX, y: minY, w: faceW, h: faceH },
    });

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
