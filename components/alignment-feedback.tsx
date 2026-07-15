'use client';

type AlignmentFeedbackProps = {
  message: string;
  isAligned: boolean;
};

export function AlignmentFeedback({ message, isAligned }: AlignmentFeedbackProps) {
  return (
    <div className="pointer-events-none absolute bottom-24 left-0 right-0 z-20 flex justify-center px-6">
      <div
        className={`rounded-full px-5 py-2.5 text-sm font-medium backdrop-blur-sm transition-all duration-300 ${
          isAligned
            ? 'border border-green-400/30 bg-green-500/15 text-green-300'
            : 'border border-white/10 bg-black/50 text-white/70'
        }`}
      >
        {message}
      </div>
    </div>
  );
}
