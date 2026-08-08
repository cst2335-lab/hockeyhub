'use client';

import { useEffect, useState } from 'react';

/**
 * Client clock that is `null` until after mount.
 * Use for past/upcoming labels so SSR HTML does not diverge from hydrate.
 */
export function useClientNow(refreshMs = 60_000): Date | null {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    if (refreshMs <= 0) return;
    const id = window.setInterval(() => setNow(new Date()), refreshMs);
    return () => window.clearInterval(id);
  }, [refreshMs]);

  return now;
}
