'use client';

import Image from 'next/image';

import { garments } from '@/data/garments';

type GarmentSelectorProps = {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

export function GarmentSelector({ selectedId, onSelect }: GarmentSelectorProps) {
  return (
    <div className="absolute bottom-36 left-0 right-0 z-20 px-4">
      <div className="mx-auto max-w-lg">
        <p className="mb-2 text-center text-xs font-medium text-white/50">
          Select a garment to preview
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => onSelect(null)}
            className={`flex h-16 w-12 flex-shrink-0 items-center justify-center rounded-xl border transition ${
              selectedId === null
                ? 'border-white/40 bg-white/15'
                : 'border-white/10 bg-white/5 hover:bg-white/10'
            }`}
          >
            <span className="text-xs text-white/50">None</span>
          </button>
          {garments.map((garment) => (
            <button
              key={garment.id}
              type="button"
              onClick={() => onSelect(garment.id)}
              className={`relative flex-shrink-0 overflow-hidden rounded-xl border transition ${
                selectedId === garment.id
                  ? 'border-white/40 ring-2 ring-white/20'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <Image
                src={garment.image}
                alt={garment.name}
                width={48}
                height={64}
                className="h-16 w-12 object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
