export const primaryRoutes = [
  { href: '/', label: 'Home' },
  { href: '/try-on', label: 'Try on' },
  { href: '/catalog', label: 'Catalog' },
  { href: '/saved', label: 'Saved' },
  { href: '/about', label: 'About' },
] as const;

export const heroFacts = [
  { value: '1 tap', label: 'camera permission request' },
  { value: 'Client-side', label: 'preview capture and storage' },
  { value: 'Fallback', label: 'upload mode for any browser' },
] as const;

export const homePrinciples = [
  {
    title: 'Clear entry',
    text: 'Open the showroom, read the brief, and move into try-on without extra explanation.',
  },
  {
    title: 'Focused preview',
    text: 'The camera stage stays central; catalog, save, and compare tools stay secondary.',
  },
  {
    title: 'Private by default',
    text: 'Camera and uploaded photos remain local unless the user chooses to save a look.',
  },
] as const;

export const homeSteps = [
  'Open the site and browse the catalog first.',
  'Enter try-on only when you want to use the camera or upload a photo.',
  'Adjust the shirt, save the preview, and compare against earlier looks.',
] as const;
