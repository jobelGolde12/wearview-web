import Link from 'next/link';

import { primaryRoutes } from '@/data/site';

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/20">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:px-8">
        <div className="space-y-4">
          <p className="text-lg font-semibold text-white">WearView</p>
          <p className="max-w-xl text-sm leading-7 text-white/60">
            A browser-first virtual fitting room for shirts, designed around privacy, a safe torso
            base layer, and a clear path from demo to retail tooling.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {primaryRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/72 transition hover:border-white/20 hover:bg-white/10 focus-ring"
            >
              {route.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
