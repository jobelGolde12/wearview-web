import type { ReactNode } from 'react';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div className="page-shell relative flex min-h-screen flex-col overflow-x-hidden">
      <SiteHeader />
      <main className="relative flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
