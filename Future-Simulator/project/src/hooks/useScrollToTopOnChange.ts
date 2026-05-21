import { useEffect, useRef } from 'react';
import { scrollToTop } from '../lib/scrollToTop';

/** Scroll the window to top when `key` changes (skips the initial mount). */
export function useScrollToTopOnChange(key: string | number | boolean): void {
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    scrollToTop();
  }, [key]);
}
