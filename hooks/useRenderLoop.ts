
import { useEffect, useRef } from 'react';

export function useRenderLoop(onFrame: (delta: number) => void): void {
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);

  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const delta = (time - previousTimeRef.current) / 1000;
      onFrame(Math.min(delta, 0.1)); // Cap delta to prevent huge jumps
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);
}
