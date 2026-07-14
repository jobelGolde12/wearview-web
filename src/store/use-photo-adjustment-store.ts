import { create } from 'zustand';

import type { PhotoAdjustmentState, PhotoTransform } from '@/types/camera-guide';

const DEFAULT_TRANSFORM: PhotoTransform = {
  translateX: 0,
  translateY: 0,
  scale: 1,
  rotation: 0,
};

export const usePhotoAdjustmentStore = create<PhotoAdjustmentState>((set) => ({
  photoUri: null,
  isAdjusting: false,
  transform: DEFAULT_TRANSFORM,
  setPhotoUri: (uri) => set({ photoUri: uri, isAdjusting: uri !== null, transform: DEFAULT_TRANSFORM }),
  setAdjusting: (adjusting) => set({ isAdjusting: adjusting }),
  updateTransform: (partial) =>
    set((state) => ({
      transform: { ...state.transform, ...partial },
    })),
  resetTransform: () => set({ transform: DEFAULT_TRANSFORM }),
}));
