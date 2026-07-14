import { create } from 'zustand';

type SettingsStoreState = {
  cycleFrameStride: () => void;
  diagnosticsOverlay: boolean;
  frameStride: number;
  mirrorMode: boolean;
  privacyMaskEnabled: boolean;
  toggleDiagnosticsOverlay: () => void;
  toggleMirrorMode: () => void;
  togglePrivacyMaskEnabled: () => void;
};

export const useSettingsStore = create<SettingsStoreState>((set) => ({
  mirrorMode: true,
  diagnosticsOverlay: true,
  privacyMaskEnabled: true,
  frameStride: 2,
  toggleMirrorMode: () => set((state) => ({ mirrorMode: !state.mirrorMode })),
  toggleDiagnosticsOverlay: () =>
    set((state) => ({ diagnosticsOverlay: !state.diagnosticsOverlay })),
  togglePrivacyMaskEnabled: () =>
    set((state) => ({ privacyMaskEnabled: !state.privacyMaskEnabled })),
  cycleFrameStride: () =>
    set((state) => ({
      frameStride: state.frameStride >= 3 ? 1 : state.frameStride + 1,
    })),
}));
