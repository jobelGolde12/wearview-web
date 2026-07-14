import { SiteChrome } from '@/components/site-chrome';
import { SectionHeading } from '@/components/section-heading';

const privacyPoints = [
  'Camera permission is requested only from the try-on route.',
  'Uploaded photos and saved previews stay in the browser by default.',
  'The torso guide avoids explicit body rendering and keeps the visual language modest.',
  'A visible delete flow is present for saved previews.',
];

const accessibilityPoints = [
  'Keyboard access for catalog filters, comparison controls, and save actions.',
  'Clear fallback messaging when a browser blocks camera access.',
  'Reduced-motion friendly transitions and visible focus states.',
  'Responsive layouts for phones, tablets, and desktops.',
];

const limitations = [
  'The overlay is staged for believable retail previews, not medical-grade body measurement.',
  'Pose guidance is heuristic in this build and can be replaced with a real landmark model later.',
  'Analytics and retailer integrations are framed as the next product step, not a blocker for MVP.',
];

export default function AboutPage() {
  return (
    <SiteChrome>
      <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8fd8ff]">About</p>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Privacy, accessibility, and product limits are part of the design.
          </h1>
          <p className="max-w-3xl text-base leading-8 text-white/64">
            WearView is intentionally staged around safe, browser-native capabilities so the try-on flow can ship without overpromising what web AR can do today.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          <article className="glass-panel rounded-[1.8rem] p-6">
            <SectionHeading eyebrow="Privacy" title="Camera and photo data stay client-side." />
            <ul className="mt-5 space-y-3 text-sm leading-7 text-white/64">
              {privacyPoints.map((point) => (
                <li key={point} className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
                  {point}
                </li>
              ))}
            </ul>
          </article>
          <article className="glass-panel rounded-[1.8rem] p-6">
            <SectionHeading eyebrow="Accessibility" title="The browser flow needs to work without perfect conditions." />
            <ul className="mt-5 space-y-3 text-sm leading-7 text-white/64">
              {accessibilityPoints.map((point) => (
                <li key={point} className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
                  {point}
                </li>
              ))}
            </ul>
          </article>
          <article className="glass-panel rounded-[1.8rem] p-6">
            <SectionHeading eyebrow="Limitations" title="The MVP is a believable overlay, not full AR realism." />
            <ul className="mt-5 space-y-3 text-sm leading-7 text-white/64">
              {limitations.map((point) => (
                <li key={point} className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
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
