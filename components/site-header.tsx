'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { primaryRoutes } from '@/data/site';

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07111d]/78 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 focus-ring">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-sm font-semibold tracking-[0.25em] text-[#8fd8ff]">
            WV
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/65">
              WearView
            </p>
            <p className="text-xs text-white/45">Browser try-on showroom</p>
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
                    ? 'bg-white/12 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.16)]'
                    : 'text-white/68 hover:bg-white/8 hover:text-white'
                }`}
              >
                {route.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/try-on"
          className="inline-flex items-center justify-center rounded-full border border-[#8fd8ff]/30 bg-[#8fd8ff] px-5 py-2.5 text-sm font-semibold text-[#04111d] shadow-[0_16px_40px_rgba(112,229,255,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(112,229,255,0.3)] focus-ring"
        >
          Open try-on
        </Link>
      </div>
    </header>
  );
}
