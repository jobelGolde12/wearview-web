# T-Shirt Body Fitting Camera Feature

## Goal
Add a T-shirt shaped overlay to the camera view that detects body fit (green/red outline), and on capture creates a transparent T-shirt cutout so users can visualize store garments on their body.

## Files to Create

### 1. `components/tshirt-overlay.tsx` — SVG T-shirt shape overlay
- Responsive SVG using percentage-based coordinates (viewport-relative, not pixel-based)
- Port the T-shirt path geometry from `src/components/camera/camera-alignment-overlay.tsx` (lines 87-125)
- Three elements: head circle (dashed), T-shirt body path (dashed stroke + translucent fill), center guide line
- Props: `fitStatus: 'searching' | 'fit' | 'nofit'` — controls outline color (white=searching, green=fit, red=nofit)
- CSS animations: pulse glow when fit detected, smooth color transitions

### 2. `components/smart-capture-button.tsx` — Intelligent shutter button
- Large circle button with outer ring that pulses green when fit is detected
- Shows "ALIGN" label (faded) when no fit, "CAPTURE" (bright) when fit detected
- Props: `isFit: boolean`, `confidence: number`, `onCapture: () => void`, `disabled: boolean`
- Confidence bar as thin progress line at bottom of button

### 3. `components/alignment-feedback.tsx` — Directional guidance text
- Shows position guidance below the T-shirt overlay
- Messages: "Step back", "Move left/right", "Align your shoulders", "Perfect fit detected"
- Animated text transitions (fade in/out)
- Props: `message: string`, `isAligned: boolean`

### 4. `hooks/use-body-detection.ts` — Canvas pixel analysis for body presence
- No ML — uses 3-signal approach:
  1. **Skin-tone HSV detection**: Sample ~200 points in T-shirt torso region, count pixels with H:0-50, S:40-180, V:60-255 (skin range)
  2. **Edge gradient variance**: Compute Sobel-like gradient magnitude at sample points; high variance = body edges present
  3. **Color variance**: High RGB variance in torso region = body (vs uniform background)
- Runs every 5th frame (~100ms at 30fps) to avoid jank
- Exponential moving average smoothing (α=0.3) to prevent flicker
- Returns: `{ isFit: boolean; confidence: number }` where confidence is 0-1
- Accepts `videoRef` and `tshirtRegion` (bounding box of the T-shirt torso area)

### 5. `hooks/use-tshirt-shape.ts` — T-shirt geometry computation
- Computes T-shirt SVG path points relative to viewport dimensions
- Exports: `getTshirtPath(width, height)`, `getHeadCircle(width, height)`, `getTorsoRegion(width, height)`
- `getTorsoRegion` returns `{ x, y, w, h }` bounding box for body detection sampling
- All coordinates are percentage-based for responsiveness

### 6. `components/garment-overlay.tsx` — Store garment visualization
- Overlays a store garment image within the T-shirt area on the captured photo
- Props: `garmentImage: string`, `tshirtPath: string`, `visible: boolean`
- Uses SVG `<clipPath>` with the T-shirt shape to clip the garment image
- Allows user to select different garments from the catalog

## Files to Modify

### `components/try-on-studio.tsx`
- Import and render `TshirtOverlay` on top of the video feed (replaces the static `div` silhouette)
- Import `useBodyDetection` hook — pass videoRef and torso region
- Import `SmartCaptureButton` — replaces the simple shutter button
- Import `AlignmentFeedback` — shows guidance text
- Add `fitStatus` and `fitConfidence` state from body detection
- Modify `capturePhoto()`:
  - After drawing video frame to canvas, use `globalCompositeOperation: 'destination-out'` to erase the T-shirt interior
  - Export as PNG (not JPEG) to preserve alpha transparency
  - The transparent cutout allows garment overlay visualization
- Add garment overlay state: `selectedGarmentId` for store garment selection
- Show `GarmentOverlay` component on captured photo when a garment is selected
- Add garment selector UI (horizontal scroll of garment thumbnails) in captured state

### `types/wearview-web.ts`
- Add `FitStatus = 'searching' | 'fit' | 'nofit'`
- Add `BodyDetectionResult = { isFit: boolean; confidence: number; fitStatus: FitStatus }`

## Implementation Order

1. **T-shirt shape** — Create `use-tshirt-shape.ts` and `tshirt-overlay.tsx`, integrate into try-on-studio (replaces static div)
2. **Body detection** — Create `use-body-detection.ts`, wire up to camera feed, add fit state
3. **Smart capture** — Create `smart-capture-button.tsx` and `alignment-feedback.tsx`, replace simple shutter
4. **Capture with cutout** — Modify `capturePhoto()` to create transparent T-shirt cutout using canvas compositing
5. **Garment overlay** — Create `garment-overlay.tsx`, add garment selector, show on captured photo

## Capture Flow Detail

```
User taps capture
  → canvas draws video frame (with mirror if front camera)
  → Save the full frame as a temporary image
  → Set globalCompositeOperation to 'destination-out'
  → Draw the T-shirt SVG path as a filled shape (erases that region)
  → Reset composite operation to 'source-over'
  → The canvas now has: full body photo with T-shirt-shaped transparent hole
  → Export as PNG with alpha channel
  → User sees: their body (head, arms, background) with transparent T-shirt area
  → User can select a store garment → rendered inside the transparent T-shirt area via clipPath
```

## Verification

1. Open `/try-on` in browser — camera should auto-start with T-shirt outline visible
2. Stand in front of camera — outline should turn green when body is positioned correctly, red when not
3. Tap capture — captured photo should show body with transparent T-shirt cutout
4. Select a store garment — it should appear within the T-shirt area on the captured photo
5. Test front/back camera flip — overlay should mirror correctly on front camera
6. Test on mobile viewport — T-shirt shape should scale responsively
7. Run `npm run build` — no compilation errors
