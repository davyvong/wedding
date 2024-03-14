'use server';

import { ScavengerHuntTaskId } from 'components/scavenger-hunt/constants';
import { cookies } from 'next/headers';
import CloudflareAPI from 'server/apis/cloudflare';
import ScavengerHuntToken from 'server/tokens/scavenger-hunt';
import Logger from 'utils/logger';
import { string } from 'yup';

export const fetchUploadURL = async (task: ScavengerHuntTaskId): Promise<string | null> => {
  try {
    Logger.info({ task });
    const token = await ScavengerHuntToken.verify(cookies());
    Logger.info({ token });
    if (!token) {
      return null;
    }
    if (!string().oneOf(Object.values(ScavengerHuntTaskId)).required().isValidSync(task)) {
      return null;
    }
    const url = await CloudflareAPI.getSignedUrl(token.username + '-' + task);
    Logger.info({ url });
    return url.href;
  } catch (error: unknown) {
    Logger.error(error);
    return null;
  }
};
