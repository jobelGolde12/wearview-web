'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { garmentById } from '@/data/garments';
import { readJson, writeJson } from '@/lib/storage';
import type { SavedLook } from '@/types/wearview-web';

const STORAGE_KEY = 'wearview.savedLooks';

export function SavedGallery() {
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);

  useEffect(() => {
    setSavedLooks(readJson<SavedLook[]>(STORAGE_KEY, []));
  }, []);

  function persist(nextLooks: SavedLook[]) {
    setSavedLooks(nextLooks);
    writeJson(STORAGE_KEY, nextLooks);
  }

  function removeLook(id: string) {
    persist(savedLooks.filter((look) => look.id !== id));
  }

  function clearLooks() {
    persist([]);
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8fd8ff]">Saved looks</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">Local history for comparing shirts.</h1>
          <p className="max-w-3xl text-sm leading-7 text-white/64">
            The gallery stays client-side and can be cleared at any time. It is meant to support preview comparison, not permanent accounts yet.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={clearLooks}
            className="rounded-full border border-white/12 bg-white/6 px-4 py-2.5 text-sm text-white/78 transition hover:bg-white/10 focus-ring"
          >
            Clear all
          </button>
          <Link
            href="/try-on"
            className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#06111c] focus-ring"
          >
            Create another preview
          </Link>
        </div>
      </div>

      {savedLooks.length === 0 ? (
        <div className="glass-panel noise mt-8 rounded-[1.8rem] p-8 text-center sm:p-12">
          <p className="text-lg font-semibold text-white">Nothing saved yet.</p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/62">
            Save a preview from the try-on stage to populate this gallery.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {savedLooks.map((look) => {
            const garment = garmentById[look.garmentId];
            return (
              <article key={look.id} className="glass-panel noise rounded-[1.8rem] p-4">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#07111d]">
                  <Image
                    src={look.previewImage}
                    alt={look.garmentName}
                    fill
                    sizes="(max-width: 768px) 100vw, 30vw"
                    className="object-cover"
                  />
                </div>
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{look.garmentName}</h2>
                    <p className="text-sm text-white/54">
                      {new Date(look.createdAt).toLocaleString()} · {look.mode}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLook(look.id)}
                    className="rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-xs text-white/72 transition hover:bg-white/10 focus-ring"
                  >
                    Remove
                  </button>
                </div>
                <p className="mt-3 text-sm leading-7 text-white/64">{look.note}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/72">
                  <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1">
                    {garment?.category ?? 'Saved look'}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1">
                    {garment?.price ?? 'Local preview'}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
