export const getBaseURL = (): string => {
  const url = process.env.VERCEL_URL_OVERRIDE || process.env.VERCEL_URL;
  if (process.env.VERCEL_ENV === 'development') {
    return 'http://' + url;
  }
  return 'https://' + url;
};
