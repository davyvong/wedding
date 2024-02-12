export const getStyleProperty = (property: string): string => {
  const computedStyles = window.getComputedStyle(document.documentElement);
  return computedStyles.getPropertyValue(property);
};
