'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { garmentById } from '@/data/garments';
import { useBodyDetection } from '@/hooks/use-body-detection';
import { useFaceDetection } from '@/hooks/use-face-detection';
import { useFaceCapture } from '@/hooks/use-face-capture';
import { useBodyAlignment } from '@/hooks/use-body-alignment';
import { getTshirtGeometry } from '@/hooks/use-tshirt-shape';
import { readJson, writeJson } from '@/lib/storage';
import type { FitStatus, SavedLook, TryOnStage, FaceCaptureData, Garment } from '@/types/wearview-web';
import { AlignmentFeedback } from '@/components/alignment-feedback';
import { FaceOverlay } from '@/components/face-overlay';
import { BodyOverlay } from '@/components/body-overlay';
import { LiveHeadOverlay } from '@/components/live-head-overlay';
import { GarmentPreview } from '@/components/garment-preview';
import { GarmentSelector } from '@/components/garment-selector';
import { SmartCaptureButton } from '@/components/smart-capture-button';

const STORAGE_KEY = 'wearview.savedLooks';

function getFaceGuidanceMessage(fitStatus: FitStatus, confidence: number): string {
  if (fitStatus === 'fit') return 'Perfect alignment';
  if (confidence < 0.1) return 'Position your face in the oval';
  if (confidence < 0.25) return 'Move closer to the camera';
  if (confidence < 0.4) return 'Center your face in the guide';
  return 'Hold still — aligning...';
}

function getBodyGuidanceMessage(fitStatus: FitStatus, confidence: number): string {
  if (fitStatus === 'fit') return 'Perfect alignment detected';
  if (confidence < 0.1) return 'Step back to show your full body';
  if (confidence < 0.25) return 'Align your shoulders with the guide';
  if (confidence < 0.4) return 'Stand straight and face the camera';
  return 'Adjust your position to fit the outline';
}

export function TryOnStudio() {
  const router = useRouter();
  const [cameraState, setCameraState] = useState<'idle' | 'starting' | 'granted' | 'denied' | 'unsupported'>('idle');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);
  const [selectedGarmentId, setSelectedGarmentId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Two-stage state
  const [stage, setStage] = useState<TryOnStage>('FACE');
  const [capturedFace, setCapturedFace] = useState<FaceCaptureData | null>(null);
  const [viewportDims, setViewportDims] = useState({ w: 0, h: 0 });

  // Viewport dimensions for T-shirt shape (legacy body detection)
  useEffect(() => {
    function update() {
      setViewportDims({ w: window.innerWidth, h: window.innerHeight });
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const tshirtGeo = viewportDims.w > 0 ? getTshirtGeometry(viewportDims.w, viewportDims.h) : null;

  // Detection hooks
  const faceDetection = useFaceDetection(videoRef, cameraState === 'granted' && stage === 'FACE');
  const bodyDetection = useBodyDetection(videoRef, tshirtGeo?.torsoRegion ?? null, cameraState === 'granted' && stage === 'FACE');
  const bodyAlignment = useBodyAlignment(videoRef, cameraState === 'granted' && stage === 'BODY');
  const { capture: captureFace } = useFaceCapture();

  // Face fit status derived from face detection
  const faceFitStatus: FitStatus = faceDetection.isFit
    ? 'fit'
    : faceDetection.confidence > 0.25
      ? 'nofit'
      : 'searching';

  // Body fit status derived from body alignment
  const bodyFitStatus: FitStatus = bodyAlignment.isAligned
    ? 'fit'
    : bodyAlignment.confidence > 0.25
      ? 'nofit'
      : 'searching';

  const selectedGarment = selectedGarmentId ? garmentById[selectedGarmentId] : null;

  useEffect(() => {
    setSavedLooks(readJson<SavedLook[]>(STORAGE_KEY, []));
    startCamera();
  }, []);

  useEffect(() => {
    if (cameraState === 'granted' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      void videoRef.current.play();
    }
  }, [cameraState]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  async function startCamera(mode?: 'user' | 'environment') {
    const facing = mode ?? facingMode;
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraState('unsupported');
      return;
    }

    stopCamera();

    try {
      setCameraState('starting');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraState('granted');
    } catch {
      stopCamera();
      setCameraState('denied');
    }
  }

  async function flipCamera() {
    const next = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);
    if (cameraState === 'granted') {
      await startCamera(next);
    }
  }

  // Capture face and transition to BODY stage
  const handleCaptureFace = useCallback(() => {
    const video = videoRef.current;
    if (!video || cameraState !== 'granted' || !faceDetection.faceBounds) return;

    const result = captureFace(video, faceDetection.faceBounds, facingMode);
    if (result) {
      setCapturedFace(result);
      setStage('BODY');
    }
  }, [cameraState, faceDetection.faceBounds, facingMode, captureFace]);

  // Capture final composite image
  const handleCaptureFinal = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || cameraState !== 'granted') return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    canvas.width = vw;
    canvas.height = vh;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame (mirror if front camera)
    if (facingMode === 'user') {
      ctx.translate(vw, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, vw, vh);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Draw captured face
    if (capturedFace) {
      const img = new window.Image();
      img.onload = () => {
        // Position face based on face bounds
        const fx = capturedFace.bounds.x * vw;
        const fy = capturedFace.bounds.y * vh;
        const fw = capturedFace.bounds.w * vw;
        const fh = capturedFace.bounds.h * vh;
        const padX = fw * 0.3;
        const padY = fh * 0.35;
        ctx.drawImage(img, fx * vw - padX, fy * vh - padY, fw + padX * 2, fh + padY * 2);

        // Draw garment if selected
        if (selectedGarment) {
          const garmentImg = new window.Image();
          garmentImg.onload = () => {
            // Position garment centered on body
            const garmentW = vw * 0.4;
            const garmentH = garmentW * 1.2;
            const gx = vw / 2 - garmentW / 2;
            const gy = vh * 0.22;
            ctx.globalAlpha = 0.85;
            ctx.drawImage(garmentImg, gx, gy, garmentW, garmentH);
            ctx.globalAlpha = 1;

            // Save
            const dataUrl = canvas.toDataURL('image/png');
            showResult(dataUrl);
          };
          garmentImg.src = selectedGarment.image;
        } else {
          const dataUrl = canvas.toDataURL('image/png');
          showResult(dataUrl);
        }
      };
      img.src = capturedFace.png;
    }
  }, [cameraState, facingMode, capturedFace, selectedGarment]);

  function showResult(dataUrl: string) {
    setCapturedPhotoResult(dataUrl);
    setStage('RESULT');
  }

  const [capturedPhotoResult, setCapturedPhotoResult] = useState<string | null>(null);

  function retakePhoto() {
    setCapturedPhotoResult(null);
    setCapturedFace(null);
    setSelectedGarmentId(null);
    setStage('FACE');
    startCamera();
  }

  function savePhoto() {
    if (!capturedPhotoResult) return;

    const garment = selectedGarmentId ? garmentById[selectedGarmentId] : null;
    const look: SavedLook = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      garmentId: selectedGarmentId ?? '',
      garmentName: garment?.name ?? 'Virtual try-on',
      garmentImage: capturedPhotoResult,
      mode: 'camera',
      note: garment ? `Tried on ${garment.name} via virtual try-on.` : 'Virtual try-on captured.',
      previewImage: capturedPhotoResult,
      overlay: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
    };

    const next = [look, ...savedLooks].slice(0, 12);
    setSavedLooks(next);
    writeJson(STORAGE_KEY, next);
    retakePhoto();
  }

  return (
    <section className="fixed inset-0 flex flex-col bg-black">
      {/* Camera View */}
      <div className="relative flex-1 overflow-hidden">
        {/* Back button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60 focus-ring"
          style={{ top: 'max(1rem, env(safe-area-inset-top))' }}
          aria-label="Go back"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        {/* Stage indicator */}
        {stage !== 'RESULT' && (
          <div className="absolute right-4 top-4 z-30 flex items-center gap-2" style={{ top: 'max(1rem, env(safe-area-inset-top))' }}>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm transition-all duration-300 ${
                stage === 'FACE'
                  ? 'border border-blue-400/30 bg-blue-500/15 text-blue-300'
                  : 'border border-purple-400/30 bg-purple-500/15 text-purple-300'
              }`}
            >
              {stage === 'FACE' ? 'Face' : 'Body'}
            </span>
          </div>
        )}

        {/* Video feed */}
        {cameraState === 'granted' && (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
            style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : undefined }}
          />
        )}

        {/* RESULT stage: show captured image */}
        {stage === 'RESULT' && capturedPhotoResult && (
          <Image
            src={capturedPhotoResult}
            alt="Virtual try-on result"
            fill
            className="object-cover"
            sizes="100vw"
          />
        )}

        {/* FACE stage overlays */}
        {cameraState === 'granted' && stage === 'FACE' && (
          <>
            <FaceOverlay fitStatus={faceFitStatus} />
            <AlignmentFeedback
              message={getFaceGuidanceMessage(faceFitStatus, faceDetection.confidence)}
              isAligned={faceDetection.isFit}
            />
          </>
        )}

        {/* BODY stage overlays */}
        {cameraState === 'granted' && stage === 'BODY' && (
          <>
            <BodyOverlay fitStatus={bodyFitStatus} />
            {capturedFace && (
              <LiveHeadOverlay
                capturedFacePNG={capturedFace.png}
                fitStatus={bodyFitStatus}
                bodyLandmarks={bodyAlignment.landmarks}
              />
            )}
            {selectedGarment && (
              <GarmentPreview
                garment={selectedGarment}
                bodyLandmarks={bodyAlignment.landmarks}
                visible={true}
              />
            )}
            <AlignmentFeedback
              message={getBodyGuidanceMessage(bodyFitStatus, bodyAlignment.confidence)}
              isAligned={bodyAlignment.isAligned}
            />
          </>
        )}

        {/* Starting state */}
        {cameraState === 'starting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/60">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            <p className="text-sm">Starting camera...</p>
          </div>
        )}

        {cameraState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/60">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            <p className="text-sm">Initializing camera...</p>
          </div>
        )}

        {cameraState === 'denied' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/60">
            <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            <p className="text-sm">Camera access denied. Please allow camera permissions and try again.</p>
            <button
              type="button"
              onClick={() => startCamera()}
              className="mt-2 rounded-full border border-white/20 px-5 py-2 text-sm text-white/80 focus-ring"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />

      {/* Garment selector (BODY stage only) */}
      {stage === 'BODY' && (
        <GarmentSelector selectedId={selectedGarmentId} onSelect={setSelectedGarmentId} />
      )}

      {/* Bottom Controls */}
      <div className="relative z-10 flex items-center justify-around bg-black/80 px-8 pt-4 backdrop-blur-lg" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
        {stage === 'RESULT' ? (
          <>
            <button
              type="button"
              onClick={retakePhoto}
              className="flex h-14 items-center gap-2 rounded-full border border-white/20 px-6 text-sm text-white/80 focus-ring"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 0 1 0 12h-3" />
              </svg>
              Retake
            </button>

            <button
              type="button"
              onClick={savePhoto}
              className="flex h-14 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-[#111] focus-ring"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Save Look
            </button>
          </>
        ) : (
          <>
            {/* Flip Camera */}
            <button
              type="button"
              onClick={flipCamera}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:bg-white/10 focus-ring"
              aria-label="Flip camera"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
            </button>

            {/* Smart Capture Button */}
            <SmartCaptureButton
              stage={stage}
              isReady={stage === 'FACE' ? faceDetection.isFit : bodyAlignment.isAligned}
              confidence={stage === 'FACE' ? faceDetection.confidence : bodyAlignment.confidence}
              onCapture={stage === 'FACE' ? handleCaptureFace : handleCaptureFinal}
              disabled={cameraState !== 'granted'}
            />

            {/* Switch to BODY stage manually (skip face) — only in FACE stage */}
            {stage === 'FACE' && (
              <button
                type="button"
                onClick={() => setStage('BODY')}
                className="flex h-12 items-center gap-2 rounded-full border border-white/20 px-4 text-xs text-white/60 transition hover:bg-white/10 focus-ring"
              >
                Skip
              </button>
            )}

            {/* Back to FACE stage — only in BODY stage */}
            {stage === 'BODY' && (
              <button
                type="button"
                onClick={() => {
                  setCapturedFace(null);
                  setSelectedGarmentId(null);
                  setStage('FACE');
                }}
                className="flex h-12 items-center gap-2 rounded-full border border-white/20 px-4 text-xs text-white/60 transition hover:bg-white/10 focus-ring"
              >
                Face
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
