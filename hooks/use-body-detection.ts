'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { BodyDetectionResult } from '@/types/wearview-web';

type TshirtRegion = { x: number; y: number; w: number; h: number };

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, s * 100, v * 100];
}

function isSkinTone(r: number, g: number, b: number): boolean {
  const [h, s, v] = rgbToHsv(r, g, b);
  return h >= 0 && h <= 50 && s >= 15 && s <= 180 && v >= 50 && v <= 255;
}

function samplePixels(
  imageData: ImageData,
  region: TshirtRegion,
  videoW: number,
  videoH: number,
  canvasW: number,
  canvasH: number,
): { skinCount: number; edgeVariance: number; colorVariance: number; totalSamples: number } {
  const { data } = imageData;
  const scaleX = canvasW / videoW;
  const scaleY = canvasH / videoH;

  const sx = Math.max(0, Math.floor(region.x * scaleX));
  const sy = Math.max(0, Math.floor(region.y * scaleY));
  const sw = Math.min(Math.floor(region.w * scaleX), canvasW - sx);
  const sh = Math.min(Math.floor(region.h * scaleY), canvasH - sy);

  if (sw <= 0 || sh <= 0) return { skinCount: 0, edgeVariance: 0, colorVariance: 0, totalSamples: 0 };

  const numSamples = 200;
  let skinCount = 0;
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let totalR2 = 0;
  let totalG2 = 0;
  let totalB2 = 0;
  let edgeCount = 0;
  let totalEdgeMagnitude = 0;

  for (let i = 0; i < numSamples; i++) {
    const px = sx + Math.floor(Math.random() * sw);
    const py = sy + Math.floor(Math.random() * sh);
    const idx = (py * canvasW + px) * 4;

    if (idx + 2 >= data.length) continue;

    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    if (isSkinTone(r, g, b)) skinCount++;

    totalR += r;
    totalG += g;
    totalB += b;
    totalR2 += r * r;
    totalG2 += g * g;
    totalB2 += b * b;

    // Simple edge detection: compare with neighbor
    if (px + 3 < canvasW) {
      const nIdx = (py * canvasW + px + 3) * 4;
      if (nIdx + 2 < data.length) {
        const dr = Math.abs(r - data[nIdx]);
        const dg = Math.abs(g - data[nIdx + 1]);
        const db = Math.abs(b - data[nIdx + 2]);
        const magnitude = (dr + dg + db) / 3;
        totalEdgeMagnitude += magnitude;
        edgeCount++;
      }
    }
  }

  const n = numSamples || 1;
  const meanR = totalR / n;
  const meanG = totalG / n;
  const meanB = totalB / n;
  const colorVariance =
    Math.sqrt(totalR2 / n - meanR * meanR) +
    Math.sqrt(totalG2 / n - meanG * meanG) +
    Math.sqrt(totalB2 / n - meanB * meanB);

  const avgEdgeMagnitude = edgeCount > 0 ? totalEdgeMagnitude / edgeCount : 0;

  return {
    skinCount,
    edgeVariance: Math.min(avgEdgeMagnitude / 30, 1),
    colorVariance: Math.min(colorVariance / 150, 1),
    totalSamples: numSamples,
  };
}

export function useBodyDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  torsoRegion: TshirtRegion | null,
  enabled: boolean,
): BodyDetectionResult {
  const [result, setResult] = useState<BodyDetectionResult>({
    isFit: false,
    confidence: 0,
    fitStatus: 'searching',
  });
  const smoothedConfidence = useRef(0);
  const frameCount = useRef(0);
  const offscreenCanvas = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);

  const detect = useCallback(() => {
    const video = videoRef.current;
    const region = torsoRegion;
    if (!video || !region || video.readyState < 2) return;

    frameCount.current++;
    if (frameCount.current % 5 !== 0) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    if (!offscreenCanvas.current) {
      offscreenCanvas.current = document.createElement('canvas');
    }
    const canvas = offscreenCanvas.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const sampleW = 320;
    const sampleH = Math.round((vh / vw) * sampleW);
    canvas.width = sampleW;
    canvas.height = sampleH;

    ctx.drawImage(video, 0, 0, sampleW, sampleH);
    const imageData = ctx.getImageData(0, 0, sampleW, sampleH);

    const { skinCount, edgeVariance, colorVariance, totalSamples } = samplePixels(
      imageData,
      region,
      vw,
      vh,
      sampleW,
      sampleH,
    );

    const skinRatio = totalSamples > 0 ? skinCount / totalSamples : 0;

    // Weighted confidence: skin presence (40%), edge variance (30%), color variance (30%)
    const rawConfidence = skinRatio * 0.4 + edgeVariance * 0.3 + colorVariance * 0.3;

    // Exponential moving average
    const alpha = 0.3;
    smoothedConfidence.current = smoothedConfidence.current * (1 - alpha) + rawConfidence * alpha;

    const confidence = Math.round(smoothedConfidence.current * 100) / 100;
    const isFit = confidence > 0.45;
    const fitStatus = confidence > 0.5 ? 'fit' : confidence > 0.25 ? 'nofit' : 'searching';

    setResult({ isFit, confidence, fitStatus });
    animFrameRef.current = requestAnimationFrame(detect);
  }, [videoRef, torsoRegion]);

  useEffect(() => {
    if (enabled) {
      animFrameRef.current = requestAnimationFrame(detect);
    }
    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [enabled, detect]);

  return result;
}
