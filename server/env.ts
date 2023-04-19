export const getBaseURL = (): string => {
  const url = process.env.DOMAIN || process.env.VERCEL_URL;
  if (process.env.VERCEL_ENV === 'development') {
    return 'http://' + url;
  }
  return 'https://' + url;
};
