'use client';

import { useCallback, useEffect, useState } from 'react';

// Deadline-based rather than tick-decrement: browsers throttle timers in background tabs,
// so counting down by 1 each interval would drift badly on a 10-minute OTP expiry.
export function useCountdown(initialSeconds: number): {
  secondsLeft: number;
  isFinished: boolean;
  restart: (seconds: number) => void;
} {
  const [deadline, setDeadline] = useState(() => Date.now() + initialSeconds * 1000);
  // The clock is the only state; the remaining seconds are derived. Storing them instead
  // would mean syncing state inside an effect, which cascades renders.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      const tick = Date.now();
      setNow(tick);
      if (tick >= deadline) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const restart = useCallback((seconds: number) => {
    const tick = Date.now();
    setNow(tick);
    setDeadline(tick + seconds * 1000);
  }, []);

  const secondsLeft = Math.max(0, Math.ceil((deadline - now) / 1000));

  return { secondsLeft, isFinished: secondsLeft === 0, restart };
}

// "10:00" — matches the timer format in resources/ui/OTP Verification.html.
export function formatMmSs(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
