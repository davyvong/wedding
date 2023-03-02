export const getBaseURL = (): string => {
  const url = process.env.BASE_URL || process.env.VERCEL_URL;
  if (process.env.VERCEL_ENV === 'development') {
    return 'http://' + url;
  }
  return 'https://' + url;
};
