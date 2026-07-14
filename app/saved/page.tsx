'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { garmentById } from '@/data/garments';
import { readJson, writeJson } from '@/lib/storage';
import { SiteChrome } from '@/components/site-chrome';
import type { SavedLook } from '@/types/wearview-web';

const STORAGE_KEY = 'wearview.savedLooks';

export default function SavedPage() {
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
    <SiteChrome>
      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="eyebrow">Saved</p>
            <h1 className="max-w-4xl font-display text-5xl leading-[0.95] tracking-tight text-[var(--foreground)] text-balance sm:text-6xl">
              Local previews for comparison, review, and cleanup.
            </h1>
            <p className="max-w-3xl text-base leading-8 text-[var(--muted)]">
              Everything here stays in the browser. Save a look from try-on, compare it here, and
              delete it when you no longer need it.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={clearLooks}
              className="rounded-none border border-[var(--line)] px-4 py-2.5 text-sm text-[var(--muted)] transition hover:border-[var(--line-strong)] hover:text-[var(--foreground)] focus-ring"
            >
              Clear all
            </button>
            <Link
              href="/try-on"
              className="rounded-none border border-[var(--line-strong)] bg-[var(--foreground)] px-4 py-2.5 text-sm font-semibold text-[var(--background)] focus-ring"
            >
              Create preview
            </Link>
          </div>
        </div>

        {savedLooks.length === 0 ? (
          <div className="panel mt-8 rounded-none p-8 text-center sm:p-12">
            <p className="text-lg font-semibold text-[var(--foreground)]">No saved looks yet.</p>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">
              Save a preview from the try-on page to populate this gallery.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {savedLooks.map((look) => {
              const garment = garmentById[look.garmentId];
              return (
                <article key={look.id} className="panel rounded-none p-4">
                  <div className="relative aspect-[4/5] overflow-hidden border border-[var(--line)] bg-[var(--background)]">
                    <Image src={look.previewImage} alt={look.garmentName} fill sizes="(max-width: 768px) 100vw, 30vw" className="object-cover" />
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-[var(--foreground)]">{look.garmentName}</h2>
                      <p className="text-sm text-[var(--muted)]">
                        {new Date(look.createdAt).toLocaleString()} · {look.mode}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLook(look.id)}
                      className="rounded-none border border-[var(--line)] px-3 py-1.5 text-xs text-[var(--muted)] transition hover:border-[var(--line-strong)] hover:text-[var(--foreground)] focus-ring"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{look.note}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                    <span className="border border-[var(--line)] px-3 py-1">{garment?.category ?? 'Saved look'}</span>
                    <span className="border border-[var(--line)] px-3 py-1">{garment?.price ?? 'Local preview'}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </SiteChrome>
  );
}
