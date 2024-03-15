'use server';

import { ScavengerHuntTaskId } from 'components/scavenger-hunt/constants';
import { cookies } from 'next/headers';
import CloudflareAPI from 'server/apis/cloudflare';
import ScavengerHuntToken from 'server/tokens/scavenger-hunt';
import Logger from 'utils/logger';
import { string } from 'yup';

export const fetchUploadURL = async (
  task: ScavengerHuntTaskId,
  contentType: string,
  contentLength: number,
): Promise<{ data: string | null; error?: string | null }> => {
  try {
    Logger.info({ task });
    const token = await ScavengerHuntToken.verify(cookies());
    Logger.info({ token });
    if (!token) {
      return { data: null, error: 'components.scavenger-hunt-task.errors.failed' };
    }
    if (!string().oneOf(Object.values(ScavengerHuntTaskId)).required().isValidSync(task)) {
      return { data: null, error: 'components.scavenger-hunt-task.errors.failed' };
    }
    if (!contentType.startsWith('image/')) {
      return { data: null, error: 'components.scavenger-hunt-task.errors.file-not-image' };
    }
    if (contentLength > 10000000) {
      return { data: null, error: 'components.scavenger-hunt-task.errors.file-too-large' };
    }
    const url = await CloudflareAPI.getSignedUrl(token.username + '/' + task, contentType, contentLength);
    Logger.info({ url });
    return { data: url.href, error: null };
  } catch (error: unknown) {
    Logger.error(error);
    return { data: null, error: 'components.scavenger-hunt-task.errors.failed' };
  }
};
