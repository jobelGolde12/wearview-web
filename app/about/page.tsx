import { SiteChrome } from '@/components/site-chrome';

const privacyPoints = [
  'Camera permission is requested only from the try-on route.',
  'Uploaded photos and saved previews stay in the browser by default.',
  'The torso guide stays simplified and avoids explicit body rendering.',
  'A visible delete flow is built into the saved looks page.',
];

const accessibilityPoints = [
  'Keyboard access for catalog filters, comparison controls, and save actions.',
  'Clear fallback messaging when a browser blocks camera access.',
  'Responsive layout for phones, tablets, and desktops.',
  'Reduced-motion friendly transitions and visible focus states.',
];

const limitations = [
  'The overlay is a believable preview layer, not medical-grade measurement.',
  'Pose guidance is heuristic in this build and can be replaced later.',
  'Analytics and retailer integrations are intentionally left out of the MVP surface.',
];

export default function AboutPage() {
  return (
    <SiteChrome>
      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="space-y-4">
          <p className="eyebrow">About</p>
          <h1 className="max-w-4xl font-display text-5xl leading-[0.95] tracking-tight text-[var(--foreground)] text-balance sm:text-6xl">
            Privacy, access, and product limits are part of the system design.
          </h1>
          <p className="max-w-3xl text-base leading-8 text-[var(--muted)]">
            WearView is intentionally staged around browser-native capabilities so the try-on flow
            can ship without overpromising what web AR can do today.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          <article className="panel rounded-none p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Privacy</h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-[var(--muted)]">
              {privacyPoints.map((point) => (
                <li key={point} className="border border-[var(--line)] px-4 py-3">
                  {point}
                </li>
              ))}
            </ul>
          </article>
          <article className="panel rounded-none p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Accessibility</h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-[var(--muted)]">
              {accessibilityPoints.map((point) => (
                <li key={point} className="border border-[var(--line)] px-4 py-3">
                  {point}
                </li>
              ))}
            </ul>
          </article>
          <article className="panel rounded-none p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Limitations</h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-[var(--muted)]">
              {limitations.map((point) => (
                <li key={point} className="border border-[var(--line)] px-4 py-3">
                  {point}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </SiteChrome>
  );
}
