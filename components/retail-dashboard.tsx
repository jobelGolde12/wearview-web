import Link from 'next/link';

import { retailMetrics } from '@/data/site';

const phases = [
  {
    label: 'Phase 1',
    title: 'Web MVP',
    text: 'Landing page, try-on stage, catalog browsing, saved looks, and comparison.',
  },
  {
    label: 'Phase 2',
    title: 'Fit quality',
    text: 'Pose assistance, better garment alignment, and size recommendations.',
  },
  {
    label: 'Phase 3',
    title: 'Commerce layer',
    text: 'Catalog sync, share links, retailer analytics, and dashboard workflows.',
  },
];

export function RetailDashboard() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[1.25fr_0.85fr]">
        <div className="space-y-6">
          <div className="glass-panel noise rounded-[1.8rem] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8fd8ff]">Retail</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold text-white sm:text-4xl">
              A B2B demo shell for catalog performance and try-on analytics.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/64">
              This route frames the future dashboard story without blocking the consumer try-on
              experience. It can be backed by real event data later.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/try-on"
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#06111c] focus-ring"
              >
                View try-on
              </Link>
              <Link
                href="/catalog"
                className="rounded-full border border-white/12 bg-white/6 px-5 py-3 text-sm text-white/82 focus-ring"
              >
                Browse catalog
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {retailMetrics.map((metric) => (
              <div key={metric.label} className="glass-panel rounded-[1.6rem] p-5">
                <p className="text-sm text-white/58">{metric.label}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{metric.value}</p>
                <p className="mt-2 text-sm leading-6 text-white/62">{metric.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          {phases.map((phase) => (
            <article key={phase.title} className="glass-panel noise rounded-[1.6rem] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8fd8ff]">
                {phase.label}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">{phase.title}</h2>
              <p className="mt-3 text-sm leading-7 text-white/64">{phase.text}</p>
            </article>
          ))}
        </aside>
      </div>
    </section>
  );
}
