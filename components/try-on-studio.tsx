'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { garmentById } from '@/data/garments';
import { useBodyDetection } from '@/hooks/use-body-detection';
import { getTshirtGeometry } from '@/hooks/use-tshirt-shape';
import { readJson, writeJson } from '@/lib/storage';
import type { FitStatus, SavedLook } from '@/types/wearview-web';
import { AlignmentFeedback } from '@/components/alignment-feedback';
import { GarmentOverlay } from '@/components/garment-overlay';
import { GarmentSelector } from '@/components/garment-selector';
import { SmartCaptureButton } from '@/components/smart-capture-button';
import { TshirtOverlay } from '@/components/tshirt-overlay';

const STORAGE_KEY = 'wearview.savedLooks';

function getGuidanceMessage(fitStatus: FitStatus, confidence: number): string {
  if (fitStatus === 'fit') return 'Perfect fit detected';
  if (confidence < 0.1) return 'Step in front of the camera';
  if (confidence < 0.25) return 'Move closer to the camera';
  return 'Adjust your position to fit the shirt outline';
}

export function TryOnStudio() {
  const router = useRouter();
  const [cameraState, setCameraState] = useState<'idle' | 'starting' | 'granted' | 'denied' | 'unsupported'>('idle');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);
  const [selectedGarmentId, setSelectedGarmentId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [viewportDims, setViewportDims] = useState({ w: 0, h: 0 });

  // Viewport dimensions for T-shirt shape
  useEffect(() => {
    function update() {
      setViewportDims({ w: window.innerWidth, h: window.innerHeight });
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const tshirtGeo = useMemo(
    () => (viewportDims.w > 0 ? getTshirtGeometry(viewportDims.w, viewportDims.h) : null),
    [viewportDims],
  );

  // Body detection
  const bodyDetection = useBodyDetection(videoRef, tshirtGeo?.torsoRegion ?? null, cameraState === 'granted' && !capturedPhoto);

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

  const capturePhoto = useCallback(() => {
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

    // Create T-shirt shaped transparent cutout
    const geo = getTshirtGeometry(vw, vh);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    // Parse and draw the T-shirt path at video dimensions
    const path = new Path2D(geo.path);
    ctx.fill(path);
    ctx.globalCompositeOperation = 'source-over';

    const dataUrl = canvas.toDataURL('image/png');
    setCapturedPhoto(dataUrl);
    setSelectedGarmentId(null);
    stopCamera();
  }, [cameraState, facingMode]);

  function retakePhoto() {
    if (capturedPhoto?.startsWith('blob:')) {
      URL.revokeObjectURL(capturedPhoto);
    }
    setCapturedPhoto(null);
    setSelectedGarmentId(null);
    startCamera();
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    stopCamera();
    const url = URL.createObjectURL(file);
    setCapturedPhoto(url);
    setSelectedGarmentId(null);
    event.target.value = '';
  }

  function savePhoto() {
    if (!capturedPhoto) return;

    const garment = selectedGarmentId ? garmentById[selectedGarmentId] : null;
    const look: SavedLook = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      garmentId: selectedGarmentId ?? '',
      garmentName: garment?.name ?? 'Camera capture',
      garmentImage: capturedPhoto,
      mode: 'camera',
      note: garment ? `Tried on ${garment.name} via camera.` : 'Photo captured from camera.',
      previewImage: capturedPhoto,
      overlay: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
    };

    const next = [look, ...savedLooks].slice(0, 12);
    setSavedLooks(next);
    writeJson(STORAGE_KEY, next);
    setCapturedPhoto(null);
    setSelectedGarmentId(null);
    startCamera();
  }

  const selectedGarment = selectedGarmentId ? garmentById[selectedGarmentId] : null;

  return (
    <section className="fixed inset-0 flex flex-col bg-black">
      {/* Camera / Photo View */}
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

        {/* Video feed */}
        {cameraState === 'granted' && !capturedPhoto && (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
            style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : undefined }}
          />
        )}

        {/* Captured photo */}
        {capturedPhoto && (
          <Image
            src={capturedPhoto}
            alt="Captured photo"
            fill
            className="object-cover"
            sizes="100vw"
          />
        )}

        {/* T-shirt overlay (live camera only) */}
        {cameraState === 'granted' && !capturedPhoto && (
          <TshirtOverlay fitStatus={bodyDetection.fitStatus} />
        )}

        {/* Garment overlay (captured photo with selected garment) */}
        {capturedPhoto && selectedGarment && (
          <GarmentOverlay
            garmentImage={selectedGarment.image}
            garmentName={selectedGarment.name}
          />
        )}

        {/* Starting state */}
        {cameraState === 'starting' && !capturedPhoto && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/60">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            <p className="text-sm">Starting camera...</p>
          </div>
        )}

        {cameraState === 'idle' && !capturedPhoto && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/60">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            <p className="text-sm">Initializing camera...</p>
          </div>
        )}

        {cameraState === 'denied' && !capturedPhoto && (
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

        {/* Alignment feedback (live camera only) */}
        {cameraState === 'granted' && !capturedPhoto && (
          <AlignmentFeedback
            message={getGuidanceMessage(bodyDetection.fitStatus, bodyDetection.confidence)}
            isAligned={bodyDetection.isFit}
          />
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />

      {/* Garment selector (captured photo only) */}
      {capturedPhoto && (
        <GarmentSelector selectedId={selectedGarmentId} onSelect={setSelectedGarmentId} />
      )}

      {/* Bottom Controls */}
      <div className="relative z-10 flex items-center justify-around bg-black/80 px-8 pt-4 backdrop-blur-lg" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
        {capturedPhoto ? (
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
              Use Photo
            </button>
          </>
        ) : (
          <>
            {/* Upload */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:bg-white/10 focus-ring"
              aria-label="Upload photo"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </button>

            {/* Smart Capture Button */}
            <SmartCaptureButton
              isFit={bodyDetection.isFit}
              confidence={bodyDetection.confidence}
              onCapture={capturePhoto}
              disabled={cameraState !== 'granted'}
            />

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
          </>
        )}
      </div>
    </section>
  );
}
