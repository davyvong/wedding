import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

class CloudflareAPI {
  private static s3Client = new S3Client({
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
      secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
    },
    endpoint: new URL('https://' + process.env.CLOUDFLARE_ACCOUNT_ID + '.r2.cloudflarestorage.com/').href,
    region: 'auto',
  });

  public static async getSignedUrl(key: string): Promise<URL> {
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_BUCKET_ID,
      Key: key,
    });
    const signedURL = await getSignedUrl(CloudflareAPI.s3Client, command, {
      expiresIn: 3600,
    });
    return new URL(signedURL);
  }
}

export default CloudflareAPI;
