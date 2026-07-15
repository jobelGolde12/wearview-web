'use client';

import { useEffect, useState } from 'react';

import type { FitStatus } from '@/types/wearview-web';
import { getTshirtGeometry } from '@/hooks/use-tshirt-shape';

type TshirtOverlayProps = {
  fitStatus: FitStatus;
};

const STATUS_COLORS: Record<FitStatus, { stroke: string; fill: string; glow: string }> = {
  searching: { stroke: 'rgba(255,255,255,0.5)', fill: 'rgba(255,255,255,0.04)', glow: 'transparent' },
  fit: { stroke: '#22c55e', fill: 'rgba(34,197,94,0.08)', glow: '#22c55e' },
  nofit: { stroke: '#ef4444', fill: 'rgba(239,68,68,0.06)', glow: '#ef4444' },
};

export function TshirtOverlay({ fitStatus }: TshirtOverlayProps) {
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
  const colors = STATUS_COLORS[fitStatus];

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <svg width={dims.w} height={dims.h} className="absolute inset-0">
        <defs>
          <filter id="tshirt-glow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Glow background when fit */}
        {fitStatus === 'fit' && (
          <path
            d={geo.path}
            fill={colors.glow}
            opacity={0.15}
            filter="url(#tshirt-glow)"
            className="animate-pulse"
          />
        )}

        {/* Head circle */}
        <circle
          cx={geo.headCircle.cx}
          cy={geo.headCircle.cy}
          r={geo.headCircle.r}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={2.5}
          strokeDasharray="8 6"
          className="transition-all duration-500"
        />

        {/* T-shirt body */}
        <path
          d={geo.path}
          fill={colors.fill}
          stroke={colors.stroke}
          strokeWidth={3}
          strokeDasharray="10 7"
          strokeLinejoin="round"
          className="transition-all duration-500"
        />

        {/* Center line */}
        <line
          x1={geo.centerLine.x}
          y1={geo.centerLine.y1}
          x2={geo.centerLine.x}
          y2={geo.centerLine.y2}
          stroke={colors.stroke}
          strokeWidth={1.5}
          opacity={0.3}
          className="transition-all duration-500"
        />
      </svg>
    </div>
  );
}
