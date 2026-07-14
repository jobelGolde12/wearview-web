'use client';

import { useMemo, useState } from 'react';

import { GarmentCard } from '@/components/garment-card';
import { SiteChrome } from '@/components/site-chrome';
import { garments } from '@/data/garments';
import type { Garment } from '@/types/wearview-web';

const categories = ['All', ...Array.from(new Set(garments.map((garment) => garment.category)))];

export default function CatalogPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Garment>(garments[0]);

  const visibleGarments = useMemo(() => {
    const search = query.trim().toLowerCase();
    return garments.filter((garment) => {
      const matchesCategory = activeCategory === 'All' || garment.category === activeCategory;
      const haystack = [garment.name, garment.brand, garment.description, ...garment.tags]
        .join(' ')
        .toLowerCase();
      const matchesQuery = !search || haystack.includes(search);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  return (
    <SiteChrome>
      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.85fr] lg:items-start">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="eyebrow">Catalog</p>
              <h1 className="max-w-4xl font-display text-5xl leading-[0.95] tracking-tight text-[var(--foreground)] text-balance sm:text-6xl">
                Browse a tight set of shirts made for the try-on stage.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-[var(--muted)]">
                The catalog stays intentionally small so the preview experience stays believable.
                Use search or categories, then push the selected shirt into the fitting room.
              </p>
            </div>

            <div className="panel rounded-none p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search brand, fit, color, or tag"
                  className="focus-ring w-full rounded-none border border-[var(--line)] bg-[var(--background)]/70 px-4 py-3 text-base text-[var(--foreground)] placeholder:text-[var(--muted)]"
                />
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  {categories.map((category) => {
                    const active = category === activeCategory;
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setActiveCategory(category)}
                        className={`rounded-none border px-4 py-2 text-sm transition focus-ring ${
                          active
                            ? 'border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]'
                            : 'border-[var(--line)] bg-transparent text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--foreground)]'
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleGarments.map((garment) => (
                <GarmentCard
                  key={garment.id}
                  garment={garment}
                  active={selected.id === garment.id}
                  onSelect={setSelected}
                />
              ))}
            </div>
          </div>

          <aside className="panel-strong sticky top-24 rounded-none p-5">
            <p className="eyebrow">Selected item</p>
            <div className="mt-4 space-y-4">
              <div>
                <h2 className="text-2xl font-semibold text-[var(--foreground)]">{selected.name}</h2>
                <p className="text-sm text-[var(--muted)]">{selected.brand}</p>
              </div>
              <p className="text-sm leading-7 text-[var(--muted)]">{selected.description}</p>
              <dl className="grid gap-3 text-sm">
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                  <dt className="text-[var(--muted)]">Fit</dt>
                  <dd>{selected.category}</dd>
                </div>
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                  <dt className="text-[var(--muted)]">Sizes</dt>
                  <dd>{selected.sizeRange}</dd>
                </div>
                <div className="border-b border-[var(--line)] pb-3">
                  <dt className="text-[var(--muted)]">Fit notes</dt>
                  <dd className="mt-2 leading-7 text-[var(--foreground)]">{selected.fitNotes}</dd>
                </div>
                <div>
                  <dt className="text-[var(--muted)]">Colors</dt>
                  <dd className="mt-3 flex flex-wrap gap-2">
                    {selected.colors.map((color) => (
                      <span key={color} className="border border-[var(--line)] px-3 py-1 text-xs text-[var(--muted)]">
                        {color}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </section>
    </SiteChrome>
  );
}
