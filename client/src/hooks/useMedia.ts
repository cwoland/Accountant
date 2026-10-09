import { useEffect, useState } from 'react';

export function useMedia(query: string, fallback = false): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? fallback : window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

export const useIsMobile = () => useMedia('(max-width: 767px)', true);
export const useReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)');
export const useIsOnline = () => {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
};