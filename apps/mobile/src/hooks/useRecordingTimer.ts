/**
 * Recording Timer Hook
 *
 * Manages a timer specific to recording duration.
 * Starts at 00:00 when recording begins and increments every second.
 */

import { useState, useEffect, useRef } from 'react';

interface UseRecordingTimerReturn {
  elapsedSeconds: number;
  formattedTime: string;
  reset: () => void;
}

export function useRecordingTimer(): UseRecordingTimerReturn {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current) / 1000);
      setElapsedSeconds(elapsed);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const reset = () => {
    setElapsedSeconds(0);
    startTimeRef.current = Date.now();
  };

  const formattedTime = formatTime(elapsedSeconds);

  return {
    elapsedSeconds,
    formattedTime,
    reset,
  };
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
