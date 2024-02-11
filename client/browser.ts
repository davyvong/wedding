export const waitForElement = (
  selector: string,
  callback: (element: Element) => void,
  options?: {
    interval?: number;
    timeout?: number;
  },
): void => {
  const calculatedOptions = Object.assign(
    {
      interval: 200,
      maxIterations: 10000 / 200,
    },
    options,
  );
  let iteration = 0;
  const interval = setInterval((): void => {
    const element = document.querySelector<HTMLElement>(selector);
    if (element) {
      clearInterval(interval);
      callback(element);
      return;
    }
    iteration++;
    if (iteration > calculatedOptions.maxIterations) {
      clearInterval(interval);
      return;
    }
  }, calculatedOptions.interval);
};
