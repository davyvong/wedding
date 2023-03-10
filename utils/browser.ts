export const isBrowser = (): boolean => typeof window === 'object';

export const isStyleSupported = (property: string, value: string): boolean => {
  if (!isBrowser()) {
    return false;
  }
  if (!window.CSS) {
    return false;
  }
  return window.CSS.supports(property, value);
};
