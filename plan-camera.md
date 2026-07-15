# AI Virtual Try-On Camera Feature

## Goal

Transform the current try-on camera into a **two-stage virtual fitting experience**. The user first captures their face using a facial alignment guide, then automatically enters a live body fitting mode where the captured face is attached to a transparent body template. The camera remains active so the user can stand in front of clothing in a mall or store and visualize how shirts, dresses, or other garments align with their body in real time.

---

## Files to Create

### 1. `components/face-overlay.tsx`

A responsive SVG face alignment guide displayed over the live camera.

Features:

* Large oval/circular face outline
* Transparent center
* Dashed border
* Smooth color transitions
* Pulse animation when aligned

Props:

```ts
fitStatus: 'searching' | 'fit' | 'nofit'
```

Border colors:

* White = searching
* Green = aligned
* Red = not aligned

---

### 2. `hooks/use-face-detection.ts`

Uses **MediaPipe Face Detection / Face Landmarker** to determine whether the user's face correctly fits inside the overlay.

Checks:

* Single face detected
* Face centered
* Face size
* Looking forward
* Head rotation (yaw, pitch, roll)

Returns:

```ts
{
    isFit: boolean;
    confidence: number;
    landmarks;
    faceBounds;
}
```

---

### 3. `components/body-overlay.tsx`

Displayed after the face has been captured.

Features:

* Transparent human body outline
* Head placeholder
* Shoulder guide
* Torso guide
* Waist guide
* Hip guide
* Center alignment line

Displays the captured face automatically.

Props:

```ts
capturedFace
fitStatus
cameraFacing
```

Border colors:

* White
* Green
* Red

---

### 4. `hooks/use-body-alignment.ts`

Uses **MediaPipe Pose Landmarker**.

Tracks:

* Shoulders
* Neck
* Torso
* Waist
* Hips
* Body center
* Body rotation

Returns:

```ts
{
    isAligned: boolean;
    confidence: number;
    landmarks;
}
```

---

### 5. `components/live-head-overlay.tsx`

Displays the previously captured face.

Features:

* Cropped transparent PNG
* Automatically scales
* Positions above the body template
* Rotates slightly based on body alignment

---

### 6. `components/garment-preview.tsx`

Displays the selected garment over the live camera.

Features:

* Transparent PNG garments
* Auto-scale using shoulder width
* Auto-position using body landmarks
* Rotation correction
* Opacity adjustment
* Manual drag/resize fine tuning

Props:

```ts
garment
bodyLandmarks
visible
```

---

### 7. `components/smart-capture-button.tsx`

Large capture button.

Features:

* Green pulse when alignment is valid
* Disabled until alignment succeeds
* Shows:

  * ALIGN
  * CAPTURE

Props:

```ts
isReady
confidence
onCapture
```

---

### 8. `components/alignment-feedback.tsx`

Displays live alignment instructions.

Examples:

* Move left
* Move right
* Step back
* Move closer
* Straighten your shoulders
* Perfect alignment

Animated fade transitions.

---

## Files to Modify

### `components/try-on-studio.tsx`

Replace the existing single camera flow with a two-stage workflow.

---

### Stage 1 — Face Capture

Display:

* Live camera
* Face overlay
* Face detection
* Smart capture button

Workflow:

```
Camera

↓

Face Overlay

↓

Face Detection

↓

Border turns GREEN

↓

Capture button enabled

↓

User taps Capture

↓

Crop only the head

↓

Save transparent PNG

↓

Automatically proceed to Body Stage
```

Store:

```ts
capturedFace
capturedFacePNG
```

---

### Stage 2 — Live Body Fitting

Keep the camera running.

Display:

* Transparent body outline
* Captured face attached to body
* Pose detection
* Alignment feedback
* Garment preview

Workflow:

```
Live Camera

↓

Captured Head

↓

Transparent Body Guide

↓

Pose Detection

↓

Body Alignment

↓

Border turns GREEN

↓

User selects garment

↓

Garment overlays body

↓

Live virtual try-on
```

The user should be able to stand in front of clothing (such as in a mall) and compare garments against their live body while maintaining camera mode.

---

### Final Capture

Allow the user to capture the completed virtual try-on.

Render:

```
Live Camera Frame

+

Captured Face

+

Selected Garment

+

Hide UI

↓

Render Canvas

↓

Save PNG

↓

Preview

↓

Share / Download
```

---

## Types

### `types/wearview-web.ts`

Add:

```ts
type FitStatus =
    | 'searching'
    | 'fit'
    | 'nofit';

type FaceDetectionResult = {
    isFit: boolean;
    confidence: number;
};

type BodyAlignmentResult = {
    isAligned: boolean;
    confidence: number;
};
```

---

## State

```ts
stage:
'FACE'
'BODY'
'RESULT'

capturedFace

capturedFacePNG

faceConfidence

bodyConfidence

selectedGarment

bodyLandmarks

isFaceAligned

isBodyAligned
```

---

## Implementation Order

1. Create the responsive **Face Overlay** and integrate it into the live camera.
2. Implement **MediaPipe Face Detection** and enable capture only when the face correctly fits inside the guide.
3. Capture and crop the user's head as a transparent PNG, then transition automatically to the Body stage.
4. Create the transparent **Body Overlay** and integrate **MediaPipe Pose Landmarker** for full-body alignment.
5. Attach the captured head to the body template and keep the camera running continuously.
6. Build the **Garment Preview** component to automatically position and scale clothing using detected body landmarks.
7. Add live alignment feedback and the smart capture button for the body fitting stage.
8. Implement final rendering by compositing the live camera frame, captured face, and selected garment into a downloadable PNG.

---

## Verification

1. Open `/try-on` and verify the camera starts on the **Face Alignment** stage.
2. Ensure the face outline turns **green** only when the user's face is centered, correctly sized, and facing forward.
3. Capture the face and verify the app automatically transitions to the **Body Alignment** stage.
4. Confirm the camera remains live and the captured face is attached to the transparent body guide.
5. Verify the body outline turns **green** only when the user's shoulders, torso, and hips are aligned with the template.
6. Select a garment and ensure it automatically scales and positions using body landmarks while remaining over the live camera feed.
7. Capture the final virtual try-on image and verify it contains the live camera frame, captured face, and garment overlay without UI elements.
8. Test on desktop and mobile, with front and rear cameras, and ensure `npm run build` completes without errors.
