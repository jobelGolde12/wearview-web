import Image from 'next/image';
import Link from 'next/link';

import { GarmentCard } from '@/components/garment-card';
import { SectionHeading } from '@/components/section-heading';
import { SiteChrome } from '@/components/site-chrome';
import { garments } from '@/data/garments';
import { featureSet, heroMetrics, landingBullets } from '@/data/site';

export default function HomePage() {
  return (
    <SiteChrome>
      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#8fd8ff]/24 bg-[#8fd8ff]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.34em] text-[#b7f0ff]">
              Browser showroom for shirts
            </div>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white text-balance sm:text-6xl">
                Try shirts in the browser with camera, photo fallback, and comparison built in.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-white/64 sm:text-lg">
                WearView is a retail-first virtual fitting room. It requests camera access only when needed, keeps the preview flow client-side, and makes save-and-compare feel like part of the store experience.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/try-on"
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#06111c] transition hover:-translate-y-0.5 focus-ring"
              >
                Start try-on
              </Link>
              <Link
                href="/catalog"
                className="rounded-full border border-white/12 bg-white/6 px-5 py-3 text-sm text-white/82 transition hover:bg-white/10 focus-ring"
              >
                Browse catalog
              </Link>
              <Link
                href="/about"
                className="rounded-full border border-white/12 bg-white/6 px-5 py-3 text-sm text-white/82 transition hover:bg-white/10 focus-ring"
              >
                Privacy and limits
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {heroMetrics.map((metric) => (
                <div key={metric.label} className="glass-panel rounded-[1.4rem] p-4">
                  <p className="text-2xl font-semibold text-white">{metric.value}</p>
                  <p className="mt-2 text-sm text-white/56">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel noise rounded-[2rem] p-4 sm:p-5">
            <div className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#07111d]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(112,229,255,0.16),transparent_26%),linear-gradient(180deg,rgba(9,17,30,0.82),rgba(5,10,18,0.96))]" />
              <div className="relative aspect-[4/5]">
                <div className="absolute inset-x-[22%] top-[14%] h-[46%] rounded-[2.4rem] border border-white/10 bg-white/4" />
                <div className="absolute left-1/2 top-[10%] h-28 w-28 -translate-x-1/2 rounded-full border border-white/10 bg-white/4" />
                <div className="absolute left-1/2 top-[23%] h-[60%] w-[46%] -translate-x-1/2">
                  <Image
                    src={garments[0].image}
                    alt={garments[0].name}
                    fill
                    sizes="(max-width: 1024px) 90vw, 40vw"
                    className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.45)]"
                    priority
                  />
                </div>
                <div className="absolute inset-x-5 bottom-5 rounded-[1.4rem] border border-white/10 bg-[#07111d]/78 p-4 backdrop-blur">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.32em] text-white/46">Featured garment</p>
                      <h2 className="mt-2 text-2xl font-semibold text-white">{garments[0].name}</h2>
                      <p className="mt-1 text-sm text-white/58">{garments[0].fitNotes}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-sm text-white/78">
                      {garments[0].price}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-14">
        <SectionHeading
          eyebrow="Why it works"
          title="A retail showroom shell that stays believable before advanced vision arrives."
          description="The web version is staged around browser capabilities, not native AR assumptions. That keeps the MVP shippable while leaving room for better pose tracking and segmentation later."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {featureSet.map((feature) => (
            <article key={feature.title} className="glass-panel rounded-[1.6rem] p-5">
              <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/62">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-14">
        <SectionHeading
          eyebrow="Flow"
          title="Open the site, approve the camera or upload a photo, then save the look."
          description="The implementation keeps the try-on area focused while the catalog and comparison tools remain a click away."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {landingBullets.map((bullet, index) => (
            <div key={bullet} className="glass-panel rounded-[1.5rem] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#8fd8ff]">0{index + 1}</p>
              <p className="mt-3 text-sm leading-7 text-white/68">{bullet}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-14">
        <SectionHeading
          eyebrow="Catalog"
          title="Selected shirts from the demo catalog."
          description="These garments feed the try-on stage and give the browser flow something tangible to browse before a real catalog integration exists."
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
