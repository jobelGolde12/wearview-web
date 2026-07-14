'use client';

import { useMemo, useState } from 'react';

import { GarmentCard } from '@/components/garment-card';
import { garments } from '@/data/garments';
import type { Garment } from '@/types/wearview-web';

const categories = ['All', ...Array.from(new Set(garments.map((garment) => garment.category)))];

export function CatalogBrowser() {
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
    <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[1.55fr_0.85fr] lg:items-start">
        <div className="space-y-6">
          <div className="glass-panel rounded-[1.8rem] p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8fd8ff]">
                  Catalog
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Browse shirts before the fitting stage.</h1>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/68">
                {visibleGarments.length} items shown
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3 lg:flex-row">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search brand, fit, color, or tag"
                className="focus-ring w-full rounded-2xl border border-white/10 bg-[#07111d]/80 px-4 py-3 text-sm text-white placeholder:text-white/38"
              />
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const active = category === activeCategory;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`rounded-full px-4 py-2 text-sm transition focus-ring ${
                        active
                          ? 'bg-white text-[#07111d]'
                          : 'border border-white/12 bg-white/6 text-white/72 hover:bg-white/10'
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

        <aside className="glass-panel noise rounded-[1.8rem] p-5 lg:sticky lg:top-24">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8fd8ff]">Item details</p>
          <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-white/6 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">{selected.name}</h2>
                <p className="text-sm text-white/56">{selected.brand}</p>
              </div>
              <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-sm text-white/78">
                {selected.price}
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-white/68">{selected.description}</p>
            <dl className="mt-6 grid gap-4 text-sm text-white/68">
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#06111b]/70 px-4 py-3">
                <dt>Fit</dt>
                <dd className="text-white">{selected.category}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#06111b]/70 px-4 py-3">
                <dt>Sizes</dt>
                <dd className="text-white">{selected.sizeRange}</dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#06111b]/70 px-4 py-3">
                <dt className="text-white">Fit notes</dt>
                <dd className="mt-2 leading-7">{selected.fitNotes}</dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#06111b]/70 px-4 py-3">
                <dt className="text-white">Colors</dt>
                <dd className="mt-3 flex flex-wrap gap-2">
                  {selected.colors.map((color) => (
                    <span key={color} className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs">
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
  );
}
