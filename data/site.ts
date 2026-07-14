import type { RetailMetric } from '@/types/wearview-web';

export const primaryRoutes = [
  { href: '/', label: 'Home' },
  { href: '/try-on', label: 'Try on' },
  { href: '/catalog', label: 'Catalog' },
  { href: '/saved', label: 'Saved' },
  { href: '/about', label: 'About' },
  { href: '/retail', label: 'Retail' },
] as const;

export const heroMetrics = [
  { value: 'Camera', label: 'permission on demand' },
  { value: 'Upload', label: 'fallback available' },
  { value: 'Local', label: 'saved look storage' },
] as const;

export const landingBullets = [
  'Browser-first try-on that opens fast on mobile and desktop',
  'Safe torso guide and privacy messaging built in from the start',
  'Comparison and save flows for retail browsing and shopping decisions',
] as const;

export const featureSet = [
  {
    title: 'Live camera stage',
    text: 'Camera access is requested only when the user enters try-on mode.',
  },
  {
    title: 'Upload fallback',
    text: 'If camera access is unavailable, the same overlay flow works on a photo.',
  },
  {
    title: 'Saved looks',
    text: 'Every preview can be stored locally, compared, and deleted.',
  },
  {
    title: 'Retail-ready catalog',
    text: 'Static garment browsing can later be swapped for a real product feed.',
  },
] as const;

export const retailMetrics: RetailMetric[] = [
  {
    label: 'Permission conversion',
    value: '68%',
    detail: 'Visitor interest after landing on the try-on CTA',
  },
  {
    label: 'Fallback usage',
    value: '24%',
    detail: 'Photo-based sessions when camera permissions are declined',
  },
  {
    label: 'Saved previews',
    value: '12k',
    detail: 'Mock signal for future analytics and dashboard work',
  },
  {
    label: 'Share intent',
    value: '41%',
    detail: 'Users who compare or export at least one look',
  },
];
