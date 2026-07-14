import Link from 'next/link';

import { SiteChrome } from '@/components/site-chrome';

export default function NotFound() {
  return (
    <SiteChrome>
      <section className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-5 py-20 sm:px-6 lg:px-8">
        <div className="glass-panel noise w-full rounded-[2rem] p-8 text-center sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8fd8ff]">404</p>
          <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">That page is not in the showroom.</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/62">
            The route you requested does not exist. Return to the home page or open the try-on
            stage.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#06111c] focus-ring"
            >
              Back home
            </Link>
            <Link
              href="/try-on"
              className="rounded-full border border-white/14 bg-white/5 px-5 py-3 text-sm font-semibold text-white focus-ring"
            >
              Open try-on
            </Link>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
