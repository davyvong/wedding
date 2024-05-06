import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  _Object,
} from '@aws-sdk/client-s3';
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

  public static async getSignedUrl(key: string, contentType: string, contentLength: number): Promise<URL> {
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_BUCKET_ID,
      ContentLength: contentLength,
      ContentType: contentType,
      Key: key,
    });
    const signedURL = await getSignedUrl(CloudflareAPI.s3Client, command, {
      expiresIn: 3600,
    });
    return new URL(signedURL);
  }

  public static async listObjects(prefix: string): Promise<_Object[]> {
    const command = new ListObjectsV2Command({
      Bucket: process.env.CLOUDFLARE_BUCKET_ID,
      Prefix: prefix,
    });
    const list = await CloudflareAPI.s3Client.send(command);
    if (!list.Contents) {
      return [];
    }
    return list.Contents;
  }

  public static async deleteObject(key: string): Promise<DeleteObjectCommandOutput> {
    const command = new DeleteObjectCommand({
      Bucket: process.env.CLOUDFLARE_BUCKET_ID,
      Key: key,
    });
    return CloudflareAPI.s3Client.send(command);
  }
}

export default CloudflareAPI;
