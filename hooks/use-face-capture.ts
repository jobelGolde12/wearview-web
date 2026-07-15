'use client';

import { useCallback, useRef } from 'react';

import type { FaceCaptureData } from '@/types/wearview-web';

export function useFaceCapture() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const capture = useCallback(
    (
      video: HTMLVideoElement,
      faceBounds: { x: number; y: number; w: number; h: number },
      facingMode: 'user' | 'environment',
    ): FaceCaptureData | null => {
      if (!video || video.readyState < 2 || !faceBounds) return null;

      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const vw = video.videoWidth;
      const vh = video.videoHeight;

      // Expand bounds for padding (20% extra on each side)
      const padX = faceBounds.w * 0.3;
      const padY = faceBounds.h * 0.35;
      const cropX = Math.max(0, faceBounds.x * vw - padX);
      const cropY = Math.max(0, faceBounds.y * vh - padY);
      const cropW = Math.min(faceBounds.w * vw + padX * 2, vw - cropX);
      const cropH = Math.min(faceBounds.h * vh + padY * 2, vh - cropY);

      canvas.width = Math.round(cropW);
      canvas.height = Math.round(cropH);

      // Draw the cropped face region
      if (facingMode === 'user') {
        // Mirror: flip horizontally
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(
          video,
          cropX, cropY, cropW, cropH,
          0, 0, canvas.width, canvas.height,
        );
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      } else {
        ctx.drawImage(
          video,
          cropX, cropY, cropW, cropH,
          0, 0, canvas.width, canvas.height,
        );
      }

      // Create an elliptical mask around the face for transparency
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      const maskCtx = maskCanvas.getContext('2d');
      if (!maskCtx) return null;

      // Draw the face image
      maskCtx.drawImage(canvas, 0, 0);

      // Create elliptical alpha mask (landscape to match overlay)
      maskCtx.globalCompositeOperation = 'destination-in';
      maskCtx.beginPath();
      const ellipseCx = canvas.width / 2;
      const ellipseCy = canvas.height * 0.45;
      const ellipseRx = canvas.width * 0.46;
      const ellipseRy = canvas.height * 0.4;
      maskCtx.ellipse(ellipseCx, ellipseCy, ellipseRx, ellipseRy, 0, 0, Math.PI * 2);
      maskCtx.fillStyle = 'white';
      maskCtx.fill();
      maskCtx.globalCompositeOperation = 'source-over';

      const png = maskCanvas.toDataURL('image/png');

      return {
        png,
        bounds: {
          x: faceBounds.x,
          y: faceBounds.y,
          w: faceBounds.w,
          h: faceBounds.h,
        },
      };
    },
    [],
  );

  return { capture };
}
