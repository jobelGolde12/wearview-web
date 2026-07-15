'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { getTshirtGeometry } from '@/hooks/use-tshirt-shape';

type GarmentOverlayProps = {
  garmentImage: string;
  garmentName: string;
};

export function GarmentOverlay({ garmentImage, garmentName }: GarmentOverlayProps) {
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    function update() {
      setDims({ w: window.innerWidth, h: window.innerHeight });
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  if (dims.w === 0 || dims.h === 0) return null;

  const geo = getTshirtGeometry(dims.w, dims.h);

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <svg width={dims.w} height={dims.h} className="absolute inset-0">
        <defs>
          <clipPath id="tshirt-clip">
            <path d={geo.path} />
          </clipPath>
        </defs>

        {/* Garment image clipped to T-shirt shape */}
        <image
          href={garmentImage}
          x={0}
          y={0}
          width={dims.w}
          height={dims.h}
          clipPath="url(#tshirt-clip)"
          preserveAspectRatio="xMidYMid slice"
        />
      </svg>

      {/* Garment label */}
      <div className="absolute bottom-28 left-0 right-0 flex justify-center">
        <div className="rounded-full border border-white/15 bg-black/60 px-4 py-2 text-xs text-white/80 backdrop-blur-sm">
          Viewing: {garmentName}
        </div>
      </div>
    </div>
  );
}
