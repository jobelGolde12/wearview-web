'use client';

import type { TryOnStage } from '@/types/wearview-web';

type SmartCaptureButtonProps = {
  stage: TryOnStage;
  isReady: boolean;
  confidence: number;
  onCapture: () => void;
  disabled: boolean;
};

export function SmartCaptureButton({ stage, isReady, confidence, onCapture, disabled }: SmartCaptureButtonProps) {
  const label = isReady ? 'Capture' : 'Align';

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={onCapture}
        disabled={disabled || !isReady}
        className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full p-1 transition active:scale-95 disabled:opacity-40 focus-ring"
        aria-label={`${label} photo`}
      >
        {/* Pulsing outer ring when ready */}
        {isReady && !disabled && (
          <span className="absolute inset-0 animate-ping rounded-full border-2 border-green-400 opacity-40" />
        )}

        {/* Outer ring */}
        <span
          className={`absolute inset-0 rounded-full border-[3px] transition-colors duration-300 ${
            isReady ? 'border-green-400' : 'border-white/40'
          }`}
        />

        {/* Inner circle */}
        <span
          className={`block h-full w-full rounded-full transition-colors duration-300 ${
            isReady ? 'bg-white' : 'bg-white/70'
          }`}
        />
      </button>

      {/* Label */}
      <span
        className={`text-xs font-semibold uppercase tracking-widest transition-colors duration-300 ${
          isReady ? 'text-green-400' : 'text-white/40'
        }`}
      >
        {stage === 'FACE' ? label : label}
      </span>

      {/* Confidence bar */}
      <div className="h-1 w-16 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isReady ? 'bg-green-400' : 'bg-white/30'
          }`}
          style={{ width: `${Math.min(confidence * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}
