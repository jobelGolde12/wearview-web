import { useEffect } from 'react';

import { initializeDatabase, readSessions } from '@/database/wearview-db';
import { useFittingStore } from '@/store/use-fitting-store';

let bootstrapStarted = false;

export function useAppBootstrap() {
  const setSessions = useFittingStore((state) => state.setSessions);

  useEffect(() => {
    if (bootstrapStarted) {
      return;
    }

    bootstrapStarted = true;

    void (async () => {
      await initializeDatabase();
      const sessions = await readSessions();
      setSessions(sessions);
    })();
  }, [setSessions]);
}
