// optimize input onChange event for heavy rerender tables
export const debounce = (callback, wait, timeoutId = null) => {
  const debounceFn = (...args) => {
    window.clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      callback.apply(null, args);
    }, wait);
  };

  debounceFn.cancel = () => window.clearTimeout(timeoutId);

  return debounceFn;
};
