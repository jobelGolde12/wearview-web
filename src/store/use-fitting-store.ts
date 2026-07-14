import { create } from 'zustand';

import type { SavedFittingSession } from '@/types/wearview';

type FittingStoreState = {
  addSession: (session: SavedFittingSession) => void;
  sessions: SavedFittingSession[];
  setSessions: (sessions: SavedFittingSession[]) => void;
};

export const useFittingStore = create<FittingStoreState>((set) => ({
  sessions: [],
  setSessions: (sessions) => set({ sessions }),
  addSession: (session) =>
    set((state) => ({
      sessions: [session, ...state.sessions.filter((item) => item.id !== session.id)],
    })),
}));
