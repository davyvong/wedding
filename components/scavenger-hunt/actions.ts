'use server';

import { cookies } from 'next/headers';
import JWT from 'server/tokens/jwt';

export const createTokenForScavengerHunt = async (): Promise<void> => {
  const payload = {};
  const expiresIn1Year = 31536000;
  const token = await JWT.sign(payload, expiresIn1Year);
  const expiryDate = new Date(Date.now() + expiresIn1Year * 1000);
  cookies().set('token_sh', token, { expires: expiryDate });
};
