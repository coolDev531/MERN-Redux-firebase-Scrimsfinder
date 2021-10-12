import { useRef, useEffect } from 'react';

export default function useEffectExceptOnMount(effect, dependencies) {
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) {
      const unmount = effect();
      return () => unmount && unmount();
    } else {
      mounted.current = true;
    }
    // eslint-disable-next-line
  }, dependencies);

  // Reset on unmount for the next mount.
  useEffect(() => {
    return () => (mounted.current = false);
  }, []);
}
