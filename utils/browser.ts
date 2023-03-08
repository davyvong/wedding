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

export const isCSSSupported = (property: string, value: string): boolean => {
  if (!isBrowser()) {
    return false;
  }
  if (!window.CSS) {
    return false;
  }
  return window.CSS.supports(property, value);
};
