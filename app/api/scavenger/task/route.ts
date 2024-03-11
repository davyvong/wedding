import { ScavengerHuntTaskId } from 'components/scavenger-hunt/constants';
import { NextRequest, NextResponse } from 'next/server';
import CloudflareAPI from 'server/apis/cloudflare';
import ServerError from 'server/error';
import Logger from 'utils/logger';
import { object, string } from 'yup';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export const POST = async (request: NextRequest): Promise<Response> => {
  try {
    const body = await request.json();
    Logger.info({ body });
    const bodySchema = object({
      task: string().oneOf(Object.values(ScavengerHuntTaskId)).required(),
    });
    if (!bodySchema.isValidSync(body)) {
      return ServerError.BadRequest();
    }
    const uploadURL = await CloudflareAPI.getSignedUrl(body.task);
    return NextResponse.json({ uploadURL }, { status: 200 });
  } catch (error: unknown) {
    return ServerError.handleError(error);
  }
};
