export type TryOnMode = 'camera' | 'photo';

export type OverlayPreset = {
  opacity: number;
  rotation: number;
  scale: number;
  x: number;
  y: number;
};

export type Garment = {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: string;
  fitNotes: string;
  image: string;
  accent: string;
  colors: string[];
  sizeRange: string;
  tags: string[];
};

export type SavedLook = {
  id: string;
  createdAt: string;
  garmentId: string;
  garmentName: string;
  garmentImage: string;
  mode: TryOnMode;
  note: string;
  previewImage: string;
  overlay: OverlayPreset;
};

export type RetailMetric = {
  label: string;
  value: string;
  detail: string;
};

export type FitStatus = 'searching' | 'fit' | 'nofit';

export type BodyDetectionResult = {
  isFit: boolean;
  confidence: number;
  fitStatus: FitStatus;
};
