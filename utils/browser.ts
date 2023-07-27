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

export const waitForElement = (selector: string): Promise<Element> =>
  new Promise((resolve: (element: Element) => void) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }
    const mutationCallback: MutationCallback = (mutations: MutationRecord[], observer: MutationObserver) => {
      for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        for (const addedNode of addedNodes) {
          const addedElement = addedNode as Element;
          if (addedElement.matches(selector)) {
            resolve(addedElement);
            observer.disconnect();
            return;
          }
        }
      }
    };
    new MutationObserver(mutationCallback).observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
