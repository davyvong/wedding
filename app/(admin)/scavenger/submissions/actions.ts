'use server';

import { ScavengerHuntTaskId } from 'components/scavenger-hunt/constants';
import CloudflareAPI from 'server/apis/cloudflare';
import Logger from 'utils/logger';

export const fetchAllSubmissions = async (): Promise<
  { tasks: { id: ScavengerHuntTaskId; uploadedAt: Date }[]; username: string }[]
> => {
  try {
    const objects = await CloudflareAPI.listObjects('');
    const submissionsByUsername = new Map<string, { id: ScavengerHuntTaskId; uploadedAt: Date }[]>();
    for (const object of objects) {
      const keyPaths = object.Key?.split('/');
      const username = keyPaths?.at(0) as string;
      const task = {
        id: keyPaths?.at(1) as ScavengerHuntTaskId,
        uploadedAt: object.LastModified as Date,
      };
      const submissions = submissionsByUsername.get(username);
      submissionsByUsername.set(username, [...(submissions || []), task]);
    }
    return Array.from(submissionsByUsername.entries()).map(
      ([username, tasks]: [string, { id: ScavengerHuntTaskId; uploadedAt: Date }[]]) => ({
        tasks,
        username,
      }),
    );
  } catch (error: unknown) {
    Logger.error(error);
    return [];
  }
};
