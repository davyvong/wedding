'use server';

import { cookies } from 'next/headers';
import SupabaseQueries from 'server/queries/supabase';
import ScavengerHuntToken from 'server/tokens/scavenger-hunt';
import Logger from 'utils/logger';
import { string } from 'yup';

export const signScavengerHuntToken = async (username: string): Promise<string[]> => {
  try {
    const errors: Set<string> = new Set();
    if (!string().required().min(3).max(24).isValidSync(username)) {
      errors.add('components.scavenger-hunt-username.errors.length');
    }
    if (
      !string()
        .matches(/^[a-zA-Z0-9_]*$/)
        .isValidSync(username)
    ) {
      errors.add('components.scavenger-hunt-username.errors.characters');
    }
    if (await SupabaseQueries.findScavengerHuntToken(username)) {
      errors.add('components.scavenger-hunt-username.errors.unavailable');
    }
    if (errors.size > 0) {
      return Array.from(errors);
    }
    const token = await SupabaseQueries.insertScavengerHuntToken(username);
    Logger.info({ token });
    if (!token) {
      return ['components.scavenger-hunt-username.errors.failed'];
    }
    const expiresIn1Year = 31536000;
    const signedToken = await ScavengerHuntToken.sign(token.id, token.username, expiresIn1Year);
    const expiryDate = new Date(Date.now() + expiresIn1Year * 1000);
    cookies().set('token_sh', signedToken, { expires: expiryDate });
    return [];
  } catch (error: unknown) {
    Logger.error(error);
    return ['components.scavenger-hunt-username.errors.failed'];
  }
};
