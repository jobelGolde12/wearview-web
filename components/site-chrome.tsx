import type { ReactNode } from 'react';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_20%_20%,rgba(112,229,255,0.14),transparent_34%),radial-gradient(circle_at_80%_12%,rgba(132,165,255,0.2),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-full soft-grid opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <SiteHeader />
      <main className="relative flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
