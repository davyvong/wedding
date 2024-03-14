'use server';

import { cookies } from 'next/headers';
import JWT from 'server/tokens/jwt';
import { string } from 'yup';

export const signScavengerHuntToken = async (username: string): Promise<string[]> => {
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
  // TODO: Check username availability
  // if () {
  //   errors.add('components.scavenger-hunt-username.errors.unavailable');
  // }
  if (errors.size > 0) {
    return Array.from(errors);
  }
  const expiresIn1Year = 31536000;
  const token = await JWT.sign({ username }, expiresIn1Year);
  const expiryDate = new Date(Date.now() + expiresIn1Year * 1000);
  cookies().set('token_sh', token, { expires: expiryDate });
  return [];
};
