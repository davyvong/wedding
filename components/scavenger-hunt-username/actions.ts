'use server';

import { cookies } from 'next/headers';
import SupabaseQueries from 'server/queries/supabase';
import ScavengerHuntToken from 'server/tokens/scavenger-hunt';
import Logger from 'utils/logger';
import { string } from 'yup';

export const claimUsername = async (username: string, recoveryEmail: string): Promise<string[]> => {
  try {
    const payload = {
      recoveryEmail: recoveryEmail ? recoveryEmail.toLowerCase().trim() : null,
      username: username.toLowerCase().trim(),
    };
    Logger.info({ payload });
    const errors: Set<string> = new Set();
    if (!string().required().min(3).max(24).isValidSync(payload.username)) {
      errors.add('components.scavenger-hunt-username.errors.length');
    }
    if (
      !string()
        .matches(/^[a-zA-Z0-9_]*$/)
        .isValidSync(payload.username)
    ) {
      errors.add('components.scavenger-hunt-username.errors.characters');
    }
    if (await SupabaseQueries.findScavengerHuntToken(payload.username)) {
      errors.add('components.scavenger-hunt-username.errors.unavailable');
    }
    if (errors.size > 0) {
      return Array.from(errors);
    }
    const token = await SupabaseQueries.insertScavengerHuntToken(payload.username, payload.recoveryEmail);
    Logger.info({ token });
    if (!token) {
      return ['components.scavenger-hunt-username.errors.failed'];
    }
    const expiresIn1Year = 31536000;
    const signedToken = await ScavengerHuntToken.sign(token.id, payload.username, expiresIn1Year);
    const expiryDate = new Date(Date.now() + expiresIn1Year * 1000);
    cookies().set('token_sh', signedToken, { expires: expiryDate });
    return [];
  } catch (error: unknown) {
    Logger.error(error);
    return ['components.scavenger-hunt-username.errors.failed'];
  }
};
