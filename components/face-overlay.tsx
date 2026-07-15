'use client';

import { useEffect, useState } from 'react';

import type { FitStatus } from '@/types/wearview-web';

type FaceOverlayProps = {
  fitStatus: FitStatus;
};

const STATUS_COLORS: Record<FitStatus, { stroke: string; glow: string }> = {
  searching: { stroke: 'rgba(255,255,255,0.6)', glow: 'transparent' },
  fit: { stroke: '#22c55e', glow: '#22c55e' },
  nofit: { stroke: '#ef4444', glow: '#ef4444' },
};

export function FaceOverlay({ fitStatus }: FaceOverlayProps) {
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

  const colors = STATUS_COLORS[fitStatus];

  // Face oval — large, rotated 90° (landscape/wide orientation)
  const ovalW = dims.w * 0.7;
  const ovalH = dims.h * 0.32;
  const cx = dims.w / 2;
  const cy = dims.h * 0.38;

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <svg width={dims.w} height={dims.h} className="absolute inset-0">
        <defs>
          <filter id="face-glow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="face-veil" cx="50%" cy="38%" r="40%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
          </radialGradient>
        </defs>

        {/* Dark veil with transparent center */}
        <rect width={dims.w} height={dims.h} fill="url(#face-veil)" />

        {/* Glow when fit */}
        {fitStatus === 'fit' && (
          <ellipse
            cx={cx}
            cy={cy}
            rx={ovalW / 2}
            ry={ovalH / 2}
            fill="none"
            stroke={colors.glow}
            strokeWidth={4}
            opacity={0.25}
            filter="url(#face-glow)"
            className="animate-pulse"
          />
        )}

        {/* Face oval */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={ovalW / 2}
          ry={ovalH / 2}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={2.5}
          strokeDasharray="10 7"
          className="transition-all duration-500"
        />

        {/* Inner guide ring */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={ovalW / 2 - 14}
          ry={ovalH / 2 - 14}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={1}
          opacity={0.3}
          className="transition-all duration-500"
        />

        {/* Center crosshair */}
        <line
          x1={cx - 12}
          y1={cy}
          x2={cx + 12}
          y2={cy}
          stroke={colors.stroke}
          strokeWidth={1}
          opacity={0.4}
        />
        <line
          x1={cx}
          y1={cy - 12}
          x2={cx}
          y2={cy + 12}
          stroke={colors.stroke}
          strokeWidth={1}
          opacity={0.4}
        />
      </svg>
    </div>
  );
}
