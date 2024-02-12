/* eslint-disable @typescript-eslint/no-unused-vars */

namespace NodeJS {
  interface ProcessEnv {
    JWT_SECRET: string;
    NEXT_PUBLIC_VERCEL_ENV: string;
    NODEMAILER_ADDRESS: string;
    NODEMAILER_PASSWORD: string;
    NODEMAILER_SERVICE: string;
    NODEMAILER_USERNAME: string;
    PLANETSCALE_DB_HOST: string;
    PLANETSCALE_DB_PASSWORD: string;
    PLANETSCALE_DB_USERNAME: string;
    PLANETSCALE_DB: string;
    PLANETSCALE_SSL_CERT_PATH: string;
    REDIS_URL: string;
    SPOTIFY_CLIENT_ID: string;
    SPOTIFY_CLIENT_SECRET: string;
    SPOTIFY_PLAYLIST_ID: string;
    SPOTIFY_REDIRECT_URI: string;
    SPOTIFY_REFRESH_TOKEN: string;
    TOKEN_SIGNING_KEY: string;
    UPSTASH_REDIS_REST_TOKEN: string;
    UPSTASH_REDIS_REST_URL: string;
    VERCEL_ENV: string;
    VERCEL_URL_OVERRIDE: string;
    VERCEL_URL: string;
  }
}
