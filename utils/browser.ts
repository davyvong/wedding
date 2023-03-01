export const isBrowser = (): boolean => typeof window === 'object';

export const isTouchDevice = (): boolean => {
  if (!isBrowser()) {
    return false;
  }
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator.msMaxTouchPoints !== undefined && navigator.msMaxTouchPoints > 0)
  );
};
