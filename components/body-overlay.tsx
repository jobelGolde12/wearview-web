'use client';

import { useEffect, useState } from 'react';

import type { FitStatus } from '@/types/wearview-web';

type BodyOverlayProps = {
  fitStatus: FitStatus;
};

const STATUS_COLORS: Record<FitStatus, { stroke: string; glow: string }> = {
  searching: { stroke: 'rgba(255,255,255,0.5)', glow: 'transparent' },
  fit: { stroke: '#22c55e', glow: '#22c55e' },
  nofit: { stroke: '#ef4444', glow: '#ef4444' },
};

export function BodyOverlay({ fitStatus }: BodyOverlayProps) {
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
  const cx = dims.w / 2;

  // Body proportions relative to viewport
  const headCy = dims.h * 0.16;
  const headR = dims.w * 0.07;
  const shoulderY = dims.h * 0.27;
  const shoulderW = dims.w * 0.35;
  const waistY = dims.h * 0.5;
  const waistW = dims.w * 0.24;
  const hipY = dims.h * 0.62;
  const hipW = dims.w * 0.3;
  const bottomY = dims.h * 0.82;

  // Build body outline path
  const bodyPath = `
    M ${cx - shoulderW / 2} ${shoulderY}
    Q ${cx - shoulderW / 2 - dims.w * 0.04} ${shoulderY - dims.h * 0.03} ${cx - dims.w * 0.09} ${shoulderY - dims.h * 0.01}
    L ${cx - headR} ${shoulderY - dims.h * 0.01}
    Q ${cx} ${shoulderY - dims.h * 0.06} ${cx + headR} ${shoulderY - dims.h * 0.01}
    L ${cx + dims.w * 0.09} ${shoulderY - dims.h * 0.01}
    Q ${cx + shoulderW / 2 + dims.w * 0.04} ${shoulderY - dims.h * 0.03} ${cx + shoulderW / 2} ${shoulderY}
    Q ${cx + waistW / 2 + dims.w * 0.02} ${waistY} ${cx + hipW / 2} ${hipY}
    L ${cx + hipW / 2 - dims.w * 0.01} ${bottomY}
    L ${cx - hipW / 2 + dims.w * 0.01} ${bottomY}
    L ${cx - hipW / 2} ${hipY}
    Q ${cx - waistW / 2 - dims.w * 0.02} ${waistY} ${cx - shoulderW / 2} ${shoulderY}
    Z
  `;

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <svg width={dims.w} height={dims.h} className="absolute inset-0">
        <defs>
          <filter id="body-glow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Glow when aligned */}
        {fitStatus === 'fit' && (
          <path
            d={bodyPath}
            fill={colors.glow}
            opacity={0.12}
            filter="url(#body-glow)"
            className="animate-pulse"
          />
        )}

        {/* Head circle */}
        <circle
          cx={cx}
          cy={headCy}
          r={headR}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={2}
          strokeDasharray="8 6"
          className="transition-all duration-500"
        />

        {/* Body outline */}
        <path
          d={bodyPath}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={2.5}
          strokeDasharray="10 7"
          strokeLinejoin="round"
          className="transition-all duration-500"
        />

        {/* Center alignment line */}
        <line
          x1={cx}
          y1={headCy - headR - dims.h * 0.02}
          x2={cx}
          y2={bottomY + dims.h * 0.02}
          stroke={colors.stroke}
          strokeWidth={1}
          opacity={0.25}
          className="transition-all duration-500"
        />

        {/* Shoulder guides */}
        <line
          x1={cx - shoulderW / 2}
          y1={shoulderY}
          x2={cx + shoulderW / 2}
          y2={shoulderY}
          stroke={colors.stroke}
          strokeWidth={1}
          opacity={0.2}
          strokeDasharray="4 4"
        />

        {/* Waist guide */}
        <line
          x1={cx - waistW / 2}
          y1={waistY}
          x2={cx + waistW / 2}
          y2={waistY}
          stroke={colors.stroke}
          strokeWidth={1}
          opacity={0.2}
          strokeDasharray="4 4"
        />

        {/* Hip guide */}
        <line
          x1={cx - hipW / 2}
          y1={hipY}
          x2={cx + hipW / 2}
          y2={hipY}
          stroke={colors.stroke}
          strokeWidth={1}
          opacity={0.2}
          strokeDasharray="4 4"
        />
      </svg>
    </div>
  );
}
