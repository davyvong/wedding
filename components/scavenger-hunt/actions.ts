'use server';

import { _Object } from '@aws-sdk/client-s3';
import { cookies } from 'next/headers';
import CloudflareAPI from 'server/apis/cloudflare';
import ScavengerHuntToken from 'server/tokens/scavenger-hunt';
import Logger from 'utils/logger';

import { ScavengerHuntTaskId } from './constants';

export const fetchSubmittedTasks = async (): Promise<{ tasks: ScavengerHuntTaskId[]; username: string } | null> => {
  try {
    const token = await ScavengerHuntToken.verify(cookies());
    if (!token) {
      return null;
    }
    const objects = await CloudflareAPI.listObjects(token.username + '-');
    const tasks = objects.map((object: _Object): ScavengerHuntTaskId => {
      const keyPaths = object.Key?.split('-');
      return keyPaths?.slice(1).join('-') as ScavengerHuntTaskId;
    });
    return {
      tasks,
      username: token.username,
    };
  } catch (error: unknown) {
    Logger.error(error);
    return null;
  }
};
