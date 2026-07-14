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
      className={`group text-left transition focus-ring ${
        active ? 'scale-[1.01]' : 'hover:-translate-y-1'
      }`}
    >
      <article
        className={`glass-panel noise h-full rounded-[1.75rem] p-4 transition ${
          active ? 'border-white/28 bg-white/10' : 'border-white/10 hover:border-white/20'
        }`}
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.05))]">
          <div
            className="absolute inset-0 opacity-70"
            style={{ background: `radial-gradient(circle at 50% 20%, ${garment.accent}50, transparent 52%)` }}
          />
          <Image
            src={garment.image}
            alt={garment.name}
            fill
            sizes="(max-width: 768px) 100vw, 28vw"
            className="object-contain px-8 py-7 drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
          />
          <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-full border border-white/12 bg-[#08111c]/78 px-3 py-2 backdrop-blur">
            <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white/55">
              {garment.category}
            </span>
            <span className="rounded-full border border-white/12 bg-white/8 px-2.5 py-1 text-[11px] font-semibold text-white/82">
              {garment.price}
            </span>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">{garment.name}</h3>
              <p className="text-sm text-white/52">{garment.brand}</p>
            </div>
            <span
              className="mt-1 inline-flex h-3 w-3 rounded-full"
              style={{ background: garment.accent }}
              aria-hidden="true"
            />
          </div>
          <p className="text-sm leading-6 text-white/62">{garment.description}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            {garment.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[11px] font-medium text-white/72"
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
