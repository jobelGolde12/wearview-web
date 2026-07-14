'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';

import { garmentById, garments } from '@/data/garments';
import { readJson, writeJson } from '@/lib/storage';
import type { OverlayPreset, SavedLook, TryOnMode } from '@/types/wearview-web';

const STORAGE_KEY = 'wearview.savedLooks';
const DEFAULT_OVERLAY: OverlayPreset = { x: 0, y: 0, scale: 1, rotation: 0, opacity: 0.95 };

function transformStyle(overlay: OverlayPreset) {
  return {
    transform: `translate(calc(-50% + ${overlay.x}px), calc(-50% + ${overlay.y}px)) scale(${overlay.scale}) rotate(${overlay.rotation}deg)`,
    opacity: overlay.opacity,
  };
}

function miniPreviewStyle(overlay: OverlayPreset) {
  return {
    transform: `translate(calc(-50% + ${overlay.x * 0.5}px), calc(-50% + ${overlay.y * 0.5}px)) scale(${overlay.scale * 0.95}) rotate(${overlay.rotation}deg)`,
    opacity: overlay.opacity,
  };
}

async function loadImage(src: string) {
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export function TryOnStudio() {
  const [mode, setMode] = useState<TryOnMode>('camera');
  const [selectedGarmentId, setSelectedGarmentId] = useState(garments[0].id);
  const [overlay, setOverlay] = useState(DEFAULT_OVERLAY);
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);
  const [comparisonId, setComparisonId] = useState<string | null>(null);
  const [message, setMessage] = useState('Ready to start a fitting session.');
  const [cameraState, setCameraState] = useState<'idle' | 'starting' | 'granted' | 'denied' | 'unsupported'>('idle');
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const selectedGarment = garmentById[selectedGarmentId] ?? garments[0];
  const comparisonLook = savedLooks.find((look) => look.id === comparisonId) ?? savedLooks[0] ?? null;
  const fitScore = Math.max(
    72,
    Math.min(
      96,
      Math.round(84 - Math.abs(overlay.x) / 12 - Math.abs(overlay.y) / 16 + overlay.scale * 5 - Math.abs(overlay.rotation) / 6),
    ),
  );
  const sourceLabel = mode === 'camera' ? 'Camera session' : 'Photo session';
  const currentSource = mode === 'camera' && cameraState === 'granted' ? 'camera' : photoSrc ? 'photo' : null;

  useEffect(() => {
    setSavedLooks(readJson<SavedLook[]>(STORAGE_KEY, []));
  }, []);

  useEffect(() => {
    if (mode === 'camera' && cameraState === 'granted' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      void videoRef.current.play();
    }
  }, [cameraState, mode]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (photoSrc?.startsWith('blob:')) {
        URL.revokeObjectURL(photoSrc);
      }
    };
  }, [photoSrc]);

  function persistLooks(nextLooks: SavedLook[]) {
    setSavedLooks(nextLooks);
    writeJson(STORAGE_KEY, nextLooks);
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  async function startCamera() {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraState('unsupported');
      setMode('photo');
      setMessage('This browser does not expose a camera stream. Use upload mode instead.');
      return;
    }

    try {
      setCameraState('starting');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraState('granted');
      setMode('camera');
      setMessage('Camera stream connected. The overlay is aligned to the center guide.');
    } catch {
      stopCamera();
      setCameraState('denied');
      setMode('photo');
      setMessage('Camera permission was denied. Upload a photo to continue the try-on flow.');
    }
  }

  function setUploadMode() {
    stopCamera();
    setMode('photo');
    setMessage('Upload a photo to use the same shirt overlay and save a preview.');
    fileInputRef.current?.click();
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (photoSrc?.startsWith('blob:')) {
      URL.revokeObjectURL(photoSrc);
    }

    const nextUrl = URL.createObjectURL(file);
    setPhotoSrc(nextUrl);
    setMode('photo');
    stopCamera();
    setMessage('Photo loaded. The garment overlay can now be positioned and saved locally.');
    event.target.value = '';
  }

  function resetOverlay() {
    setOverlay(DEFAULT_OVERLAY);
    setMessage('Overlay reset to the stage center.');
  }

  function autoAlign() {
    setOverlay((current) => ({
      ...current,
      x: current.x > 4 ? 2 : -2,
      y: current.y > 6 ? 4 : -6,
      scale: mode === 'camera' ? 1.04 : 1.0,
      rotation: mode === 'camera' ? -1 : 0,
    }));
    setMessage('Auto-alignment nudged the shirt to the center guide.');
  }

  async function capturePreview() {
    const canvas = canvasRef.current;
    if (!canvas) {
      return null;
    }

    const width = 960;
    const height = 1200;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }

    const background = ctx.createLinearGradient(0, 0, 0, height);
    background.addColorStop(0, '#0b1828');
    background.addColorStop(1, '#050b13');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    const sourceImage =
      mode === 'camera' && videoRef.current && cameraState === 'granted'
        ? videoRef.current
        : photoSrc
          ? await loadImage(photoSrc)
          : null;

    if (sourceImage) {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.drawImage(sourceImage, 0, 0, width, height);
      ctx.restore();
    } else {
      const soft = ctx.createRadialGradient(width * 0.5, height * 0.28, 60, width * 0.5, height * 0.28, 420);
      soft.addColorStop(0, 'rgba(112,229,255,0.14)');
      soft.addColorStop(1, 'transparent');
      ctx.fillStyle = soft;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(255,255,255,0.09)';
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.18, 82, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(width * 0.36, height * 0.24, width * 0.28, height * 0.4);
    }

    const garmentImage = await loadImage(selectedGarment.image);
    const shirtWidth = width * 0.42 * overlay.scale;
    const shirtHeight = height * 0.52 * overlay.scale;
    const shirtX = width * 0.5 + overlay.x * 1.5;
    const shirtY = height * 0.43 + overlay.y * 1.2;

    ctx.save();
    ctx.translate(shirtX, shirtY);
    ctx.rotate((overlay.rotation * Math.PI) / 180);
    ctx.globalAlpha = overlay.opacity;
    ctx.drawImage(garmentImage, -shirtWidth / 2, -shirtHeight / 2, shirtWidth, shirtHeight);
    ctx.restore();

    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = '600 30px sans-serif';
    ctx.fillText('WearView preview', 44, 74);
    ctx.fillStyle = 'rgba(255,255,255,0.66)';
    ctx.font = '20px sans-serif';
    ctx.fillText(`${selectedGarment.name} · ${sourceLabel}`, 44, 112);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '18px sans-serif';
    ctx.fillText(new Date().toLocaleString(), 44, height - 40);

    return canvas.toDataURL('image/png');
  }

  async function savePreview() {
    const previewImage = await capturePreview();
    if (!previewImage) {
      setMessage('Unable to capture the preview yet.');
      return;
    }

    const nextLook: SavedLook = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      garmentId: selectedGarment.id,
      garmentName: selectedGarment.name,
      garmentImage: selectedGarment.image,
      mode,
      note: mode === 'camera' ? 'Camera-based preview stored locally.' : 'Photo-based preview stored locally.',
      previewImage,
      overlay,
    };

    const nextLooks = [nextLook, ...savedLooks].slice(0, 12);
    persistLooks(nextLooks);
    setComparisonId(nextLook.id);
    setMessage('Preview saved locally. Open Saved to compare or remove it later.');
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <div className="space-y-6">
          <div className="glass-panel noise rounded-[2rem] p-5 sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8fd8ff]">Try-on</p>
                <h1 className="max-w-3xl text-3xl font-semibold text-white sm:text-4xl">
                  Camera or photo preview with a safe torso guide and save flow.
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-white/64">{message}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 md:min-w-[260px]">
                <div className="rounded-2xl border border-white/10 bg-white/6 p-3 text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/42">Mode</p>
                  <p className="mt-2 text-sm font-semibold text-white">{sourceLabel}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/6 p-3 text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/42">Fit</p>
                  <p className="mt-2 text-sm font-semibold text-white">{fitScore}%</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/6 p-3 text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/42">Saved</p>
                  <p className="mt-2 text-sm font-semibold text-white">{savedLooks.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="glass-panel noise rounded-[2rem] p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8fd8ff]">Preview stage</p>
                  <p className="mt-1 text-sm text-white/54">
                    {cameraState === 'granted' ? 'Live camera stream active' : currentSource ? 'Photo loaded' : 'No input source yet'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#06111c] focus-ring"
                  >
                    Open camera
                  </button>
                  <button
                    type="button"
                    onClick={setUploadMode}
                    className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-white/80 focus-ring"
                  >
                    Upload photo
                  </button>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#06111b]">
                <div className="relative aspect-[4/5]">
                  {mode === 'camera' && cameraState === 'granted' ? (
                    <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 h-full w-full object-cover" />
                  ) : photoSrc ? (
                    <Image src={photoSrc} alt="Uploaded preview" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(112,229,255,0.16),transparent_28%),linear-gradient(180deg,rgba(8,16,27,0.7),rgba(4,9,16,0.95))]" />
                  )}

                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,29,0.04),rgba(7,17,29,0.28))]" />
                  <div className="absolute left-1/2 top-[20%] h-[42%] w-[44%] -translate-x-1/2 rounded-[2rem] border border-white/8 bg-white/4" />
                  <div className="absolute left-1/2 top-[15%] h-24 w-24 -translate-x-1/2 rounded-full border border-white/8 bg-white/4" />
                  <div className="absolute left-1/2 top-[19%] h-[48%] w-[38%] -translate-x-1/2 rounded-[2.3rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))]" />
                  <div className="absolute left-1/2 top-[22%] h-[58%] w-[46%] -translate-x-1/2" style={transformStyle(overlay)}>
                    <Image
                      src={selectedGarment.image}
                      alt={selectedGarment.name}
                      fill
                      sizes="(max-width: 1024px) 80vw, 40vw"
                      className="object-contain drop-shadow-[0_28px_60px_rgba(0,0,0,0.45)]"
                      priority
                    />
                  </div>
                  <div className="absolute inset-x-6 bottom-6 rounded-[1.4rem] border border-white/12 bg-[#07111d]/72 p-4 backdrop-blur">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/45">Selected garment</p>
                        <h2 className="mt-2 text-xl font-semibold text-white">{selectedGarment.name}</h2>
                        <p className="mt-1 text-sm text-white/56">{selectedGarment.fitNotes}</p>
                      </div>
                      <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-sm text-white/78">
                        {selectedGarment.price}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </div>

            <div className="space-y-5">
              <div className="glass-panel noise rounded-[2rem] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8fd8ff]">Controls</p>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="flex items-center justify-between text-sm text-white/68">
                      <span>Horizontal</span>
                      <span>{overlay.x}px</span>
                    </label>
                    <input
                      type="range"
                      min="-52"
                      max="52"
                      value={overlay.x}
                      onChange={(event) => setOverlay((current) => ({ ...current, x: Number(event.target.value) }))}
                      className="mt-2 w-full accent-cyan-300"
                    />
                  </div>
                  <div>
                    <label className="flex items-center justify-between text-sm text-white/68">
                      <span>Vertical</span>
                      <span>{overlay.y}px</span>
                    </label>
                    <input
                      type="range"
                      min="-48"
                      max="60"
                      value={overlay.y}
                      onChange={(event) => setOverlay((current) => ({ ...current, y: Number(event.target.value) }))}
                      className="mt-2 w-full accent-cyan-300"
                    />
                  </div>
                  <div>
                    <label className="flex items-center justify-between text-sm text-white/68">
                      <span>Scale</span>
                      <span>{overlay.scale.toFixed(2)}x</span>
                    </label>
                    <input
                      type="range"
                      min="0.85"
                      max="1.22"
                      step="0.01"
                      value={overlay.scale}
                      onChange={(event) => setOverlay((current) => ({ ...current, scale: Number(event.target.value) }))}
                      className="mt-2 w-full accent-cyan-300"
                    />
                  </div>
                  <div>
                    <label className="flex items-center justify-between text-sm text-white/68">
                      <span>Rotation</span>
                      <span>{overlay.rotation.toFixed(0)}deg</span>
                    </label>
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="1"
                      value={overlay.rotation}
                      onChange={(event) => setOverlay((current) => ({ ...current, rotation: Number(event.target.value) }))}
                      className="mt-2 w-full accent-cyan-300"
                    />
                  </div>
                  <div>
                    <label className="flex items-center justify-between text-sm text-white/68">
                      <span>Opacity</span>
                      <span>{Math.round(overlay.opacity * 100)}%</span>
                    </label>
                    <input
                      type="range"
                      min="0.72"
                      max="1"
                      step="0.01"
                      value={overlay.opacity}
                      onChange={(event) => setOverlay((current) => ({ ...current, opacity: Number(event.target.value) }))}
                      className="mt-2 w-full accent-cyan-300"
                    />
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={autoAlign}
                    className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-white/82 focus-ring"
                  >
                    Auto align
                  </button>
                  <button
                    type="button"
                    onClick={resetOverlay}
                    className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-white/82 focus-ring"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={savePreview}
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#06111c] focus-ring"
                  >
                    Save preview
                  </button>
                </div>
              </div>

              <div className="glass-panel noise rounded-[2rem] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8fd8ff]">Selected shirt</p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-white">{selectedGarment.name}</h2>
                      <p className="text-sm text-white/56">{selectedGarment.brand}</p>
                    </div>
                    <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-sm text-white/78">
                      {selectedGarment.price}
                    </span>
                  </div>
                  <p className="text-sm leading-7 text-white/64">{selectedGarment.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {garments.map((garment) => (
                      <button
                        key={garment.id}
                        type="button"
                        onClick={() => setSelectedGarmentId(garment.id)}
                        className={`rounded-full px-3 py-1.5 text-xs transition focus-ring ${
                          selectedGarment.id === garment.id
                            ? 'bg-white text-[#06111c]'
                            : 'border border-white/12 bg-white/6 text-white/72 hover:bg-white/10'
                        }`}
                      >
                        {garment.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <div className="glass-panel noise rounded-[2rem] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8fd8ff]">Comparison tray</p>
            {comparisonLook ? (
              <div className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/42">Latest saved</p>
                    <div className="relative mt-3 aspect-[4/5] overflow-hidden rounded-[1.1rem]">
                      <Image src={comparisonLook.previewImage} alt={comparisonLook.garmentName} fill className="object-cover" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-white">{comparisonLook.garmentName}</p>
                    <p className="text-xs text-white/54">Saved {new Date(comparisonLook.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/42">Current stage</p>
                    <div className="relative mt-3 aspect-[4/5] overflow-hidden rounded-[1.1rem] border border-white/10 bg-[#06111b]">
                      {currentSource === 'photo' && photoSrc ? (
                        <Image src={photoSrc} alt="Current photo" fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(112,229,255,0.15),rgba(8,16,27,0.94))]" />
                      )}
                      <div className="absolute left-1/2 top-[22%] h-[58%] w-[46%] -translate-x-1/2" style={miniPreviewStyle(overlay)}>
                        <Image src={selectedGarment.image} alt={selectedGarment.name} fill className="object-contain" />
                      </div>
                      <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-[#07111d]/70 px-3 py-2 text-xs text-white/70">
                        {currentSource === 'camera' ? 'Live camera active' : currentSource === 'photo' ? 'Uploaded photo' : 'No source loaded'}
                      </div>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-white">{selectedGarment.name}</p>
                    <button type="button" onClick={() => setComparisonId(null)} className="mt-2 text-xs text-[#8fd8ff] focus-ring">
                      Clear comparison
                    </button>
                  </div>
                </div>
                <p className="text-sm leading-7 text-white/62">{comparisonLook.note}</p>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-7 text-white/62">
                Save a preview to pin it here for before-and-after comparison.
              </p>
            )}
          </div>

          <div className="glass-panel noise rounded-[2rem] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8fd8ff]">Mode guidance</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-white/62">
              <p>Camera mode requests permission only when you open it.</p>
              <p>Photo mode is the fallback for unsupported devices or declined permissions.</p>
              <p>All preview capture and storage stay client-side in this implementation.</p>
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/70">
              {cameraState === 'unsupported'
                ? 'Camera access is not available in this browser.'
                : cameraState === 'denied'
                  ? 'Camera permission was denied. Upload a photo to keep going.'
                  : cameraState === 'granted'
                    ? 'Camera stream connected successfully.'
                    : 'Open the camera or upload a photo to start.'}
            </div>
          </div>

          <div className="glass-panel noise rounded-[2rem] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8fd8ff]">Saved looks</p>
            <div className="mt-4 space-y-3">
              {savedLooks.slice(0, 3).map((look) => (
                <button
                  key={look.id}
                  type="button"
                  onClick={() => setComparisonId(look.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition focus-ring ${
                    comparisonId === look.id
                      ? 'border-white/24 bg-white/12'
                      : 'border-white/10 bg-white/6 hover:bg-white/10'
                  }`}
                >
                  <div className="relative h-16 w-12 overflow-hidden rounded-xl border border-white/10 bg-[#06111b]">
                    <Image src={look.previewImage} alt={look.garmentName} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{look.garmentName}</p>
                    <p className="text-xs text-white/52">{new Date(look.createdAt).toLocaleString()}</p>
                  </div>
                </button>
              ))}
              {savedLooks.length === 0 ? (
                <p className="text-sm leading-7 text-white/62">No saved previews yet. Use the save button above.</p>
              ) : null}
            </div>
            <Link href="/saved" className="mt-4 inline-flex text-sm font-semibold text-[#8fd8ff] focus-ring">
              Open full gallery
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
