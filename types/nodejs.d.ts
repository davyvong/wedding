/* eslint-disable @typescript-eslint/no-unused-vars */

namespace NodeJS {
  interface ProcessEnv {
    CLOUDFLARE_ACCESS_KEY_ID: string;
    CLOUDFLARE_ACCOUNT_ID: string;
    CLOUDFLARE_BUCKET_ID: string;
    CLOUDFLARE_SECRET_ACCESS_KEY: string;
    GOOGLE_SHEETS_WEDDING_WEBHOOK: string;
    JWT_SECRET: string;
    NEXT_PUBLIC_VERCEL_ENV: string;
    NODEMAILER_ADDRESS: string;
    NODEMAILER_HOST: string;
    NODEMAILER_PASSWORD: string;
    NODEMAILER_USERNAME: string;
    REDIS_URL: string;
    SPOTIFY_CLIENT_ID: string;
    SPOTIFY_CLIENT_SECRET: string;
    SPOTIFY_PLAYLIST_ID: string;
    SPOTIFY_REDIRECT_URI: string;
    SPOTIFY_REFRESH_TOKEN: string;
    SUPABASE_KEY: string;
    SUPABASE_URL: string;
    TOKEN_SIGNING_KEY: string;
    UPSTASH_REDIS_REST_TOKEN: string;
    UPSTASH_REDIS_REST_URL: string;
    VERCEL_ENV: string;
    VERCEL_URL_OVERRIDE: string;
    VERCEL_URL: string;
  }
}
