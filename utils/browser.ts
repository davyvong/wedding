export const isBrowser = (): boolean => typeof window === 'object';

export const setVH = (): void => {
  if (isBrowser()) {
    document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
  }
};
