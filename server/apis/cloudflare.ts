import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const ACCOUNT_ID = '';
const ACCESS_KEY_ID = '';
const SECRET_ACCESS_KEY = '';
const BUCKET_ID = '';

class CloudflareAPI {
  private static s3Client = new S3Client({
    credentials: {
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
    },
    endpoint: new URL('https://' + ACCOUNT_ID + '.r2.cloudflarestorage.com/').href,
    region: 'auto',
  });

  public static async getSignedUrl(key: string): Promise<URL> {
    const command = new PutObjectCommand({
      Bucket: BUCKET_ID,
      Key: key,
    });
    const signedURL = await getSignedUrl(CloudflareAPI.s3Client, command, {
      expiresIn: 3600,
    });
    return new URL(signedURL);
  }
}

export default CloudflareAPI;
