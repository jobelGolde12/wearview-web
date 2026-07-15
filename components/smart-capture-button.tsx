'use client';

type SmartCaptureButtonProps = {
  isFit: boolean;
  confidence: number;
  onCapture: () => void;
  disabled: boolean;
};

export function SmartCaptureButton({ isFit, confidence, onCapture, disabled }: SmartCaptureButtonProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={onCapture}
        disabled={disabled}
        className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full p-1 transition active:scale-95 disabled:opacity-40 focus-ring"
        aria-label="Capture photo"
      >
        {/* Pulsing outer ring when fit */}
        {isFit && !disabled && (
          <span className="absolute inset-0 animate-ping rounded-full border-2 border-green-400 opacity-40" />
        )}

        {/* Outer ring */}
        <span
          className={`absolute inset-0 rounded-full border-[3px] transition-colors duration-300 ${
            isFit ? 'border-green-400' : 'border-white/40'
          }`}
        />

        {/* Inner circle */}
        <span
          className={`block h-full w-full rounded-full transition-colors duration-300 ${
            isFit ? 'bg-white' : 'bg-white/70'
          }`}
        />
      </button>

      {/* Label */}
      <span
        className={`text-xs font-semibold uppercase tracking-widest transition-colors duration-300 ${
          isFit ? 'text-green-400' : 'text-white/40'
        }`}
      >
        {isFit ? 'Capture' : 'Align'}
      </span>

      {/* Confidence bar */}
      <div className="h-1 w-16 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isFit ? 'bg-green-400' : 'bg-white/30'
          }`}
          style={{ width: `${Math.min(confidence * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}
