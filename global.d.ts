/* eslint-disable @typescript-eslint/no-unused-vars */

namespace NodeJS {
  interface ProcessEnv {
    JWT_SECRET: string;
    MONGODB_URI: string;
    NODEMAILER_ADDRESS: string;
    NODEMAILER_PASSWORD: string;
    NODEMAILER_SERVICE: string;
    NODEMAILER_USERNAME: string;
    REDIS_URL: string;
    SPOTIFY_CLIENT_ID: string;
    SPOTIFY_CLIENT_SECRET: string;
    SPOTIFY_PLAYLIST_ID: string;
    SPOTIFY_REFRESH_TOKEN: string;
    SUPER_ADMINS: string;
    NEXT_PUBLIC_VERCEL_ENV: string;
    VERCEL_ENV: string;
    VERCEL_URL: string;
    VERCEL_URL_OVERRIDE: string;
  }
}

declare module '*.eml' {
  const content: string;
  export default content;
}
