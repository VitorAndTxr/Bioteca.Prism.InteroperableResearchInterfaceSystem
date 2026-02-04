/**
 * Session Timer Hook
 *
 * Formats elapsed seconds into MM:SS display format.
 * Used for displaying session duration in real-time.
 */

import { useState, useEffect } from 'react';

/**
 * Format elapsed seconds into MM:SS string.
 *
 * @param elapsedSeconds - Total elapsed seconds
 * @returns Formatted time string (MM:SS)
 *
 * @example
 * useSessionTimer(75) // Returns "01:15"
 * useSessionTimer(3661) // Returns "61:01"
 */
export function useSessionTimer(elapsedSeconds: number): string {
  const [formattedTime, setFormattedTime] = useState('00:00');

  useEffect(() => {
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;

    const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    setFormattedTime(formatted);
  }, [elapsedSeconds]);

  return formattedTime;
}
