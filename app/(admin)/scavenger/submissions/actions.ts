'use server';

import { _Object } from '@aws-sdk/client-s3';
import { ScavengerHuntTaskId } from 'components/scavenger-hunt/constants';
import CloudflareAPI from 'server/apis/cloudflare';
import Logger from 'utils/logger';
import { sortByKey } from 'utils/sort';

export const fetchAllSubmissions = async (): Promise<
  {
    checksum: string;
    id: ScavengerHuntTaskId;
    uploadedAt: Date;
    uploadedBy: string;
  }[]
> => {
  try {
    const objects = await CloudflareAPI.listObjects('');
    return objects
      .map((object: _Object) => {
        const keyPaths = object.Key?.split('/');
        return {
          checksum: object.ETag?.replace(/"/g, '') || '',
          id: keyPaths?.at(1) as ScavengerHuntTaskId,
          uploadedAt: object.LastModified as Date,
          uploadedBy: keyPaths?.at(0) as string,
        };
      })
      .sort(sortByKey('uploadedAt'))
      .reverse();
  } catch (error: unknown) {
    Logger.error(error);
    return [];
  }
};
