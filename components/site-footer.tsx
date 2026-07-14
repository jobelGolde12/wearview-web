import Link from 'next/link';

import { primaryRoutes } from '@/data/site';

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[color-mix(in_srgb,var(--background)_88%,transparent)]">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 sm:px-6 lg:grid-cols-[1.35fr_1fr] lg:px-8">
        <div className="space-y-4">
          <p className="text-lg font-semibold text-[var(--foreground)]">WearView</p>
          <p className="max-w-xl text-sm leading-7 text-[var(--muted)]">
            A browser-first fitting room focused on a clear camera stage, a safe torso guide, and
            local-only previews.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {primaryRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="rounded-none border border-[var(--line)] px-4 py-3 text-sm text-[var(--muted)] transition hover:border-[var(--line-strong)] hover:text-[var(--foreground)] focus-ring"
            >
              {route.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
