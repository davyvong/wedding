export const isBrowser = (): boolean => typeof window === 'object';

export const setViewportUnits = (): void => {
  if (isBrowser()) {
    const vh = window.innerHeight * 0.01;
    const vw = window.innerWidth * 0.01;
    document.documentElement.style.setProperty('--vh', vh + 'px');
    document.documentElement.style.setProperty('--vw', vw + 'px');
    document.documentElement.style.setProperty('--vmax', Math.max(vh, vw) + 'px');
    document.documentElement.style.setProperty('--vmin', Math.min(vh, vw) + 'px');
  }
};
