import { _Object } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import CloudflareAPI from 'server/apis/cloudflare';
import ServerError from 'server/error';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export const GET = async (): Promise<Response> => {
  try {
    const prefix = 'username-';
    const objects = await CloudflareAPI.listObjects(prefix);
    const tasks = objects.map((object: _Object) => {
      const keyPaths = object.Key?.split('-');
      return {
        id: keyPaths?.slice(1).join('-'),
        uploadedAt: object.LastModified,
        uploadedBy: keyPaths?.at(0),
      };
    });
    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error: unknown) {
    return ServerError.handleError(error);
  }
};
