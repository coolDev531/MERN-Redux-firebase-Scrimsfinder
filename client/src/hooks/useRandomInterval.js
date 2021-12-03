import { useEffect, useRef, useCallback } from 'react';

// Utility helper for random number generation
const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;

export default function useRandomInterval(callback, minDelay, maxDelay) {
  const timeoutId = useRef(null);
  const savedCallback = useRef(callback);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  useEffect(() => {
    let isEnabled =
      typeof minDelay === 'number' && typeof maxDelay === 'number';
    if (isEnabled) {
      const handleTick = () => {
        const nextTickAt = random(minDelay, maxDelay);
        timeoutId.current = setTimeout(() => {
          savedCallback.current();
          handleTick();
        }, nextTickAt);
      };
      handleTick();
    }
    return () => clearTimeout(timeoutId.current);
  }, [minDelay, maxDelay]);
  const cancel = useCallback(() => {
    clearTimeout(timeoutId.current);
  }, []);
  return cancel;
}
