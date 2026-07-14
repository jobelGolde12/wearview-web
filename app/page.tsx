import Image from 'next/image';
import Link from 'next/link';

import { GarmentCard } from '@/components/garment-card';
import { SectionHeading } from '@/components/section-heading';
import { SiteChrome } from '@/components/site-chrome';
import { garments } from '@/data/garments';
import { heroFacts, homePrinciples, homeSteps } from '@/data/site';

export default function HomePage() {
  return (
    <SiteChrome>
      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="eyebrow">WearView / browser showroom</p>
              <h1 className="max-w-4xl font-display text-5xl leading-[0.95] tracking-tight text-[var(--foreground)] text-balance sm:text-6xl lg:text-7xl">
                Try shirts in the browser with a camera stage that feels like a retail display.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
                WearView keeps the fitting flow simple: browse first, open try-on only when needed,
                use the camera or upload fallback, then save a preview locally.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/try-on"
                className="inline-flex rounded-none border border-[var(--line-strong)] bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition hover:-translate-y-0.5 focus-ring"
              >
                Start try-on
              </Link>
              <Link
                href="/catalog"
                className="inline-flex rounded-none border border-[var(--line)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--line-strong)] focus-ring"
              >
                Browse catalog
              </Link>
              <Link
                href="/about"
                className="inline-flex rounded-none border border-[var(--line)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--line-strong)] focus-ring"
              >
                Privacy and limits
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {heroFacts.map((fact) => (
                <div key={fact.label} className="panel rounded-none p-4">
                  <p className="text-2xl font-semibold text-[var(--foreground)]">{fact.value}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{fact.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel-strong rounded-none p-4 sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[0.88fr_1.12fr] lg:items-stretch">
              <div className="space-y-4 border-b border-[var(--line)] pb-4 lg:border-b-0 lg:border-r lg:pr-4 lg:pb-0">
                <p className="mono-label text-[10px] text-[var(--muted)]">Featured shirt</p>
                <h2 className="text-2xl font-semibold text-[var(--foreground)]">{garments[0].name}</h2>
                <p className="text-sm leading-7 text-[var(--muted)]">{garments[0].fitNotes}</p>
                <div className="space-y-2 text-sm text-[var(--muted)]">
                  <p>{garments[0].brand}</p>
                  <p>{garments[0].sizeRange}</p>
                  <p>{garments[0].price}</p>
                </div>
              </div>
              <div className="relative overflow-hidden border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04))]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(125,211,252,0.18),transparent_28%)]" />
                <div className="relative aspect-[4/5]">
                  <div className="absolute left-1/2 top-[9%] h-24 w-24 -translate-x-1/2 rounded-full border border-[var(--line)] bg-[var(--background)]/45" />
                  <div className="absolute left-1/2 top-[22%] h-[58%] w-[48%] -translate-x-1/2">
                    <Image
                      src={garments[0].image}
                      alt={garments[0].name}
                      fill
                      sizes="(max-width: 1024px) 90vw, 42vw"
                      className="object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.22)]"
                      priority
                    />
                  </div>
                  <div className="absolute inset-x-4 bottom-4 border border-[var(--line)] bg-[var(--background)]/88 px-4 py-3 backdrop-blur">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="mono-label text-[10px] text-[var(--muted)]">Preview stage</p>
                        <p className="mt-1 text-sm text-[var(--foreground)]">Camera or upload input</p>
                      </div>
                      <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs text-[var(--muted)]">
                        Local capture
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-6 lg:px-8 lg:py-10">
        <SectionHeading
          eyebrow="Principles"
          title="A tighter product story, without the extra demo noise."
          description="The interface stays focused on try-on, comparison, and save. Supporting pages explain privacy and catalog browsing, but the camera stage remains the center of the product."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {homePrinciples.map((item) => (
            <article key={item.title} className="panel rounded-none p-5">
              <h3 className="text-lg font-semibold text-[var(--foreground)]">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-6 lg:px-8 lg:py-10">
        <SectionHeading
          eyebrow="Flow"
          title="Open the site, choose a shirt, then try it on in one pass."
        />
        <ol className="mt-8 grid gap-4 lg:grid-cols-3">
          {homeSteps.map((step, index) => (
            <li key={step} className="panel rounded-none p-5">
              <p className="mono-label text-[10px] text-[var(--muted)]">0{index + 1}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--foreground)]">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-6 lg:px-8 lg:py-10">
        <SectionHeading
          eyebrow="Selected"
          title="A short catalog preview, not a showroom of everything."
          description="These garments feed the try-on experience and establish the visual standard for the rest of the app."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {garments.slice(0, 3).map((garment) => (
            <GarmentCard key={garment.id} garment={garment} />
          ))}
        </div>
      </section>
    </SiteChrome>
  );
}
