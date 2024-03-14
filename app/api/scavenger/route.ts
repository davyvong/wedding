import { _Object } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';
import CloudflareAPI from 'server/apis/cloudflare';
import ServerError from 'server/error';
import ScavengerHuntToken from 'server/tokens/scavenger-hunt';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export const GET = async (request: NextRequest): Promise<Response> => {
  try {
    const token = await ScavengerHuntToken.verify(request.cookies);
    if (!token) {
      return ServerError.Unauthorized();
    }
    const objects = await CloudflareAPI.listObjects(token.username + '-');
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
