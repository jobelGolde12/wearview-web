# WearView Web Plan

## 1. Product Goal

Build a web-first version of WearView in **Next.js** that lets users preview shirts on themselves through the browser.

This web version should preserve the core idea of the mobile concept:

- live camera-based fitting
- a safe, modest torso base layer
- shirt detection and overlay
- save/compare looks
- a retail-friendly browsing experience

Because this is web, the implementation should be designed around browser capabilities instead of native mobile AR. The first release should prioritize a polished, believable virtual try-on experience over perfect computer-vision realism.

## 2. Web Product Positioning

The web app should be positioned as:

- a desktop and mobile browser virtual fitting room
- a lightweight retail showroom for trying shirts before purchase
- a camera-enabled preview experience that can also work with uploaded photos when camera access is not available

Important product shift from the mobile app:

- mobile AR becomes browser-based camera preview and overlay rendering
- real-time fitting is progressively enhanced
- product discovery, comparison, and shareable previews become more prominent

## 3. Recommended Tech Direction

Use the existing `wearview-web` stack as the base and organize the app around Next.js App Router.

### Frontend

- Next.js App Router
- React
- TypeScript
- Tailwind CSS or the existing global CSS approach already present in the repo
- `next/image` for optimized garment and preview assets

### Camera and Vision

- `getUserMedia` for camera access
- Canvas or WebGL overlay layer for preview compositing
- Optional future integration with browser-friendly vision libraries for pose and segmentation

### State and Data

- local client state for live camera session and fitting controls
- mock or static catalog data for the first iteration
- optional API layer later for garment catalog, saved looks, and analytics

### Hosting

- Vercel or any Next.js-compatible platform

## 4. Core Web Experience

The web app should support these primary user flows:

1. Open the site
2. Allow camera access or upload a photo
3. Detect or estimate body position
4. Display a neutral fitting base layer
5. Overlay a selected shirt asset
6. Let the user switch garments, compare looks, and save a preview

## 5. Feature Scope

### MVP Features

- landing page with strong product storytelling
- camera permission flow
- fallback photo upload flow
- shirt catalog grid
- virtual try-on canvas
- simple pose-guided shirt positioning
- save preview action
- before/after comparison UI
- responsive mobile and desktop layout

### Phase 2 Features

- better body landmark tracking
- garment alignment improvements
- size recommendation panel
- item details drawer
- saved looks gallery
- share link or export image

### Phase 3 Features

- store catalog integration
- retailer dashboard
- analytics on item views and tries
- personalized recommendations
- multi-item outfit comparison

## 6. Next.js Page Structure

Plan the app around a small number of routes:

- `/` - marketing landing page and entry point to try-on
- `/try-on` - main camera-based fitting experience
- `/catalog` - browse available shirts
- `/saved` - stored previews and comparison history
- `/about` - product explanation, privacy, and limitations
- `/retail` - optional B2B demo or dashboard entry point

If the first release needs to stay compact, merge `/catalog`, `/saved`, and `/about` into sections of the home page and keep only `/try-on` as a separate route.

## 7. Component Plan

Break the UI into focused components instead of large pages.

### Layout Components

- `SiteHeader`
- `SiteFooter`
- `HeroSection`
- `FeatureGrid`
- `SectionHeading`
- `ResponsiveShell`

### Try-On Components

- `CameraStage`
- `CameraPermissionPrompt`
- `PhotoUploadFallback`
- `BodyGuideOverlay`
- `ShirtOverlayLayer`
- `FitControls`
- `GarmentSwitcher`
- `ComparisonTray`
- `SavePreviewButton`

### Catalog Components

- `ShirtCard`
- `ShirtFilterBar`
- `ShirtDetailsDrawer`
- `SizeBadge`
- `ColorSwatchGroup`

### Shared UI

- `Button`
- `Card`
- `Badge`
- `Modal`
- `Drawer`
- `Toast`

## 8. Browser AR Approach

The web version should not assume native AR features.

Instead, use a staged approach:

### Stage A: Visual Prototype

- use a camera feed or uploaded photo
- place a semi-transparent shirt layer over the torso
- use draggable or auto-aligned anchors for shoulders and chest

### Stage B: Landmark Assisted Fitting

- estimate shoulder and torso bounds
- keep the shirt aligned while the user moves
- adapt scale and rotation based on detected pose landmarks

### Stage C: Higher Fidelity Overlay

- refine torso masking
- improve sleeve placement
- support multiple shirt asset types and sizes

This keeps the product shippable early while allowing realism to improve over time.

## 9. Data Model

Define the minimum data objects up front so the app can scale later.

### Garment

- id
- name
- brand
- category
- image or asset URL
- colors
- size range
- fit notes
- price
- tags

### Preview Session

- id
- createdAt
- garmentId
- cameraMode or photoMode
- fit settings
- exported image URL or local blob reference

### User Saved Look

- id
- preview session reference
- notes
- comparison group
- createdAt

## 10. State Management

Keep client state simple at first.

Suggested state areas:

- camera permission status
- active input mode
- selected shirt
- overlay transform values
- saved previews
- comparison set
- UI panel visibility

If the app grows, move shared state into a lightweight store only where needed. Avoid introducing complex global state too early.

## 11. Design Direction

The web app should feel like a premium retail technology product, not a generic demo.

Design goals:

- bold hero messaging
- clean retail-focused layout
- high contrast preview stage
- subtle glass or reflective visual cues
- mobile-first responsiveness
- accessible controls beside the camera stage

The interface should make the try-on area the main focus while still giving users strong catalog and comparison tools.

## 12. Privacy and Safety

Since this product processes camera or photo input, the web plan must include privacy safeguards from the start.

Planned protections:

- request camera permission only when the user enters try-on mode
- clearly explain when camera data is used
- keep processing client-side when possible
- avoid storing raw camera frames by default
- provide a visible upload and delete flow for saved previews
- avoid any explicit body rendering and keep the torso base layer simplified

## 13. Accessibility Requirements

The web implementation should be usable without perfect camera conditions.

Accessibility baseline:

- keyboard navigation for catalog and controls
- clear permission messaging
- fallback upload mode for unsupported devices
- visible focus states
- descriptive labels for buttons and preview states
- reduced-motion friendly transitions

## 14. Performance Plan

The main performance risk is rendering camera preview and overlay updates smoothly.

Plan for:

- minimizing rerenders in the live fitting stage
- using image optimization for garment assets
- lazy-loading non-critical sections
- keeping the try-on canvas isolated from marketing page content
- using low-cost visual effects first, higher-cost effects later

## 15. Analytics and Business Hooks

If the product moves beyond demo mode, track useful product signals:

- camera permission conversion
- upload fallback usage
- shirt selection frequency
- saved preview count
- comparison usage
- share/export usage

For retail users, this can become the foundation for a future dashboard.

## 16. Delivery Phases

### Phase 1 - Web MVP

- create the Next.js app structure
- build landing page and product narrative
- implement try-on route with camera or upload fallback
- show selected shirt overlay on top of a simple body guide
- add basic catalog browsing
- add save and compare actions

### Phase 2 - Better Fit Quality

- improve pose estimation
- refine scale and anchor logic
- support more shirt formats
- add size hints and garment details

### Phase 3 - Commerce and Retention

- catalog sync
- saved looks gallery
- shareable preview links
- retailer analytics
- user history and account flow

## 17. Risks and Trade-Offs

### Risk: Web AR Is Less Accurate Than Native AR

Mitigation:

- design the MVP around believable visual previews instead of perfect physical accuracy
- use upload fallback and static alignment controls

### Risk: Camera Permissions Reduce Conversion

Mitigation:

- let users browse first
- request camera access only when needed
- provide a no-camera photo mode

### Risk: Complex Vision Work Can Stall Delivery

Mitigation:

- separate visual prototype work from advanced ML work
- ship a good overlay experience before chasing full segmentation fidelity

## 18. Success Criteria

The web plan is successful if:

- a user can open the site and reach try-on quickly
- a shirt overlay appears convincingly on camera or photo input
- users can compare and save multiple looks
- the app feels polished on mobile and desktop browsers
- the architecture leaves room for future AI and retail features

## 19. Implementation Order

Recommended build sequence:

1. finalize page structure and product story
2. build the landing page and navigation
3. implement the try-on stage with a simple overlay
4. add garment catalog data and selection state
5. add save/compare flows
6. improve pose alignment and fit quality
7. add analytics, sharing, and retail features later

## 20. Definition of Done for the Plan

This plan is complete when the Next.js web version can be built around:

- a browser camera or photo-based try-on flow
- a safe body base layer
- shirt catalog browsing
- save and comparison tools
- a scalable path toward advanced AR and retail integrations
