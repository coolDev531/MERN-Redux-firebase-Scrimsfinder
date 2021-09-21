import { useState, useCallback } from 'react';

export default function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => {
    setValue((prevState) => !prevState);
  }, []);
  return [value, toggle];
}
