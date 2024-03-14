'use server';

import { cookies } from 'next/headers';
import CloudflareAPI from 'server/apis/cloudflare';
import ScavengerHuntToken from 'server/tokens/scavenger-hunt';
import Logger from 'utils/logger';
import { string } from 'yup';

import { ScavengerHuntTaskId } from './constants';

export const fetchSignedURL = async (task: ScavengerHuntTaskId): Promise<string | null> => {
  try {
    const token = await ScavengerHuntToken.verify(cookies());
    if (!token) {
      return null;
    }
    if (!string().oneOf(Object.values(ScavengerHuntTaskId)).required().isValidSync(task)) {
      return null;
    }
    const url = await CloudflareAPI.getSignedUrl(token.username + '-' + task);
    return url.href;
  } catch (error: unknown) {
    Logger.error(error);
    return null;
  }
};
