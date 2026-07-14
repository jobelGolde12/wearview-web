import { CatalogBrowser } from '@/components/catalog-browser';
import { SiteChrome } from '@/components/site-chrome';

export default function CatalogPage() {
  return (
    <SiteChrome>
      <CatalogBrowser />
    </SiteChrome>
  );
}
