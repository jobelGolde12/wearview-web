'use client';

import Image from 'next/image';

import type { Garment } from '@/types/wearview-web';

type GarmentPreviewProps = {
  garment: Garment;
  bodyLandmarks: any;
  visible: boolean;
};

export function GarmentPreview({ garment, bodyLandmarks, visible }: GarmentPreviewProps) {
  if (!visible || !garment) return null;

  // Default position: center of viewport
  let x = 50; // percentage
  let y = 40; // percentage
  let width = 240; // px
  let rotation = 0;

  if (bodyLandmarks) {
    const lShoulder = bodyLandmarks[11];
    const rShoulder = bodyLandmarks[12];
    const lHip = bodyLandmarks[23];
    const rHip = bodyLandmarks[24];
    const nose = bodyLandmarks[0];

    if (lShoulder && rShoulder && nose) {
      // Position: center between shoulders, slightly below neck
      const shoulderMidX = (lShoulder.x + rShoulder.x) / 2;
      const neckY = Math.min(lShoulder.y, rShoulder.y) - 0.03;
      x = shoulderMidX * 100;
      y = neckY * 100;

      // Scale: garment width should match shoulder width
      const shoulderDist = Math.sqrt(
        (rShoulder.x - lShoulder.x) ** 2 + (rShoulder.y - lShoulder.y) ** 2,
      );
      width = Math.max(160, Math.min(400, shoulderDist * 800));

      // Rotation: match shoulder tilt
      rotation = Math.atan2(rShoulder.y - lShoulder.y, rShoulder.x - lShoulder.x) * (180 / Math.PI);
    }
  }

  // Estimate height from shoulder to hip
  let height = width * 1.2;
  if (bodyLandmarks) {
    const lShoulder = bodyLandmarks[11];
    const lHip = bodyLandmarks[23];
    if (lShoulder && lHip) {
      const torsoH = Math.abs(lHip.y - lShoulder.y);
      height = Math.max(height, torsoH * window.innerHeight * 1.1);
    }
  }

  return (
    <div
      className="pointer-events-none absolute z-20 transition-all duration-200"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate(-50%, 0%) rotate(${rotation}deg)`,
      }}
    >
      <Image
        src={garment.image}
        alt={garment.name}
        fill
        className="object-contain opacity-85"
        sizes={`${width}px`}
      />
    </div>
  );
}
