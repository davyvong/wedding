class ClientEnvironment {
  public static readonly isDevelopment = process.env.NEXT_PUBLIC_VERCEL_ENV === 'development';
  public static readonly isPreview = process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';
  public static readonly isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
}

export default ClientEnvironment;
