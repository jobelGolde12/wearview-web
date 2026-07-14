'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { primaryRoutes } from '@/data/site';

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-4 w-4">
      <span
        className={`absolute left-0 top-[1px] h-[1.5px] w-4 bg-current transition-transform duration-200 ${
          open ? 'translate-y-[6px] rotate-45' : ''
        }`}
      />
      <span
        className={`absolute left-0 top-[6px] h-[1.5px] w-4 bg-current transition-opacity duration-200 ${
          open ? 'opacity-0' : ''
        }`}
      />
      <span
        className={`absolute left-0 top-[11px] h-[1.5px] w-4 bg-current transition-transform duration-200 ${
          open ? '-translate-y-[4px] -rotate-45' : ''
        }`}
      />
    </span>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--background)_86%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 focus-ring" onClick={() => setOpen(false)}>
          <span className="flex h-11 w-11 items-center justify-center border border-[var(--line-strong)] bg-[var(--panel-strong)] text-sm font-semibold tracking-[0.28em] text-[var(--foreground)]">
            WV
          </span>
          <div className="hidden sm:block">
            <p className="mono-label text-[10px] text-[var(--muted)]">WearView</p>
            <p className="text-sm text-[var(--muted)]">Browser fitting room</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {primaryRoutes.map((route) => {
            const active = pathname === route.href;
            return (
              <Link
                key={route.href}
                href={route.href}
                className={`rounded-full px-4 py-2 text-sm transition focus-ring ${
                  active
                    ? 'bg-[var(--foreground)] text-[var(--background)]'
                    : 'text-[var(--muted)] hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]'
                }`}
              >
                {route.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/try-on"
            className="inline-flex items-center justify-center rounded-full border border-[var(--line-strong)] bg-[var(--foreground)] px-5 py-2.5 text-sm font-semibold text-[var(--background)] transition hover:-translate-y-0.5 focus-ring"
            onClick={() => setOpen(false)}
          >
            Open try-on
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center border border-[var(--line)] bg-[var(--panel-strong)] text-[var(--foreground)] transition hover:bg-[var(--panel)] lg:hidden focus-ring"
            aria-expanded={open}
            aria-label="Toggle navigation"
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </div>

      <div className={`lg:hidden ${open ? 'block' : 'hidden'}`}>
        <div className="mx-auto grid w-full max-w-7xl gap-2 px-5 pb-5 sm:px-6 lg:px-8">
          {primaryRoutes.map((route, index) => {
            const active = pathname === route.href;
            return (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between border px-4 py-3 text-sm transition focus-ring ${
                  active
                    ? 'border-[var(--line-strong)] bg-[var(--foreground)] text-[var(--background)]'
                    : 'border-[var(--line)] bg-[var(--panel)] text-[var(--foreground)]'
                }`}
              >
                <span>{route.label}</span>
                <span className="mono-label text-[10px] opacity-60">0{index + 1}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
