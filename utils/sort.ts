export const sortByKey =
  (key: string) =>
  (a, b): number => {
    if (!a[key]) {
      return 1;
    }
    if (!b[key]) {
      return -1;
    }
    if (a[key] > b[key]) {
      return 1;
    }
    if (a[key] < b[key]) {
      return -1;
    }
    return 0;
  };
