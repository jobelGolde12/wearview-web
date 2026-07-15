'use client';

import Image from 'next/image';

import type { FitStatus } from '@/types/wearview-web';

type LiveHeadOverlayProps = {
  capturedFacePNG: string;
  fitStatus: FitStatus;
  bodyLandmarks: any;
};

export function LiveHeadOverlay({ capturedFacePNG, fitStatus, bodyLandmarks }: LiveHeadOverlayProps) {
  if (!capturedFacePNG) return null;

  // Default position: top-center of viewport
  let x = 50; // percentage
  let y = 8; // percentage
  let scale = 1;
  let rotation = 0;

  if (bodyLandmarks) {
    // Position based on nose landmark (index 0)
    const nose = bodyLandmarks[0];
    if (nose) {
      x = nose.x * 100;
      y = (nose.y - 0.12) * 100; // offset above nose
    }

    // Scale based on shoulder width
    const lShoulder = bodyLandmarks[11];
    const rShoulder = bodyLandmarks[12];
    if (lShoulder && rShoulder) {
      const shoulderDist = Math.sqrt(
        (rShoulder.x - lShoulder.x) ** 2 + (rShoulder.y - lShoulder.y) ** 2,
      );
      scale = Math.max(0.5, Math.min(1.5, shoulderDist * 2.5));
    }

    // Slight rotation from shoulder tilt
    if (lShoulder && rShoulder) {
      rotation = Math.atan2(rShoulder.y - lShoulder.y, rShoulder.x - lShoulder.x) * (180 / Math.PI);
    }
  }

  const borderColor =
    fitStatus === 'fit' ? '#22c55e' : fitStatus === 'nofit' ? '#ef4444' : 'rgba(255,255,255,0.4)';

  return (
    <div
      className="pointer-events-none absolute z-15 transition-all duration-300"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
      }}
    >
      <div
        className="relative overflow-hidden rounded-full border-2 transition-colors duration-300"
        style={{
          width: '120px',
          height: '140px',
          borderColor,
        }}
      >
        <Image
          src={capturedFacePNG}
          alt="Captured face"
          fill
          className="object-cover"
          sizes="140px"
        />
      </div>
    </div>
  );
}
