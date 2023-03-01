// https://vercel.com/docs/concepts/projects/environment-variables#reserved-environment-variables

export const isDevelopment = (isServer = false): boolean => {
  if (isServer) {
    return process.env.VERCEL_ENV === 'development';
  }
  return process.env.NEXT_PUBLIC_VERCEL_ENV === 'development';
};

export const isProduction = (isServer = false): boolean => {
  if (isServer) {
    return process.env.VERCEL_ENV === 'production';
  }
  return process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
};

export const getBaseURL = (): string => {
  if (isDevelopment()) {
    return 'http://' + process.env.VERCEL_URL;
  }
  return 'https://' + process.env.VERCEL_URL;
};
