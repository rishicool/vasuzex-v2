import { useState, useEffect } from 'react';

/**
 * useMobileDetect
 *
 * Detects whether the viewport is below the given breakpoint using
 * window.matchMedia — no polling, no resize listeners, reacts instantly.
 *
 * @param {number} breakpoint - Max-width in px (default 640 = Tailwind `sm`)
 * @returns {boolean} true when viewport < breakpoint
 */
export function useMobileDetect(breakpoint = 640) {
  const getIsMobile = () =>
    typeof window !== 'undefined'
      ? window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches
      : false;

  const [isMobile, setIsMobile] = useState(getIsMobile);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e) => setIsMobile(e.matches);
    // Set immediately in case of SSR mismatch
    setIsMobile(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);

  return isMobile;
}
