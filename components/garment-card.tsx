'use client';

import Image from 'next/image';

import type { Garment } from '@/types/wearview-web';

export function GarmentCard({
  garment,
  active,
  onSelect,
}: {
  garment: Garment;
  active?: boolean;
  onSelect?: (garment: Garment) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(garment)}
      className={`group text-left transition focus-ring ${active ? 'translate-y-[-1px]' : ''}`}
    >
      <article
        className={`panel h-full rounded-none p-4 transition ${
          active ? 'border-[var(--line-strong)]' : 'hover:border-[var(--line-strong)]'
        }`}
      >
        <div className="relative aspect-[4/5] overflow-hidden border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.05))]">
          <div
            className="absolute inset-0 opacity-70"
            style={{ background: `radial-gradient(circle at 50% 18%, ${garment.accent}44, transparent 50%)` }}
          />
          <Image
            src={garment.image}
            alt={garment.name}
            fill
            sizes="(max-width: 768px) 100vw, 28vw"
            className="object-contain px-8 py-7 drop-shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
          />
          <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 border border-[var(--line)] bg-[var(--background)]/88 px-3 py-2 backdrop-blur">
            <span className="mono-label text-[10px] text-[var(--muted)]">{garment.category}</span>
            <span className="text-xs font-semibold text-[var(--foreground)]">{garment.price}</span>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">{garment.name}</h3>
              <p className="text-sm text-[var(--muted)]">{garment.brand}</p>
            </div>
            <span
              className="mt-1 inline-flex h-3 w-3 rounded-full border border-[var(--line)]"
              style={{ background: garment.accent }}
              aria-hidden="true"
            />
          </div>
          <p className="text-sm leading-6 text-[var(--muted)]">{garment.description}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            {garment.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="border border-[var(--line)] px-2.5 py-1 text-[11px] font-medium text-[var(--muted)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </article>
    </button>
  );
}
